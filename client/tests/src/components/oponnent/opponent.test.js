import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Opponent } from '../../../../src/components/oponnent/opponent';
import { gameStub } from '../../../stub'
import * as socketActions from '../../../../src/sockethandler'
import * as canvas from '../../../../src/components/game/scripts/canvas';

const getRefSpy = () => jest.spyOn(React, "createRef").mockImplementation(() => ({
    current: {
        style: {},
        getContext: () => ({
            canvas: {
                hidden: false
            },
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            stroke: jest.fn(),
        })
    }
}))
describe('The Opponent component', () => {
    let props
    let useRefSpy;
    let socketSpy;
    beforeEach(() => {
        props = {
            game: gameStub,
            difficulty: 2,
            temp: {},
            onSetDifficulty: jest.fn(),
            onReset: jest.fn()
        }
        useRefSpy = getRefSpy();
        socketSpy = jest.spyOn(socketActions, 'clientEmitter');
    })
    afterEach(() => {
        props = null
        useRefSpy = null
        socketSpy.mockClear()
    })
    test('will render the oponent window', () => {
        const wrapper = shallow(<Opponent {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will look for oponents on CDM', () => {
        delete props.temp
        shallow(<Opponent {...props} />);
        expect(socketSpy).toHaveBeenCalledWith("LOOK_FOR_OPPONENTS", null)
    })

    test('will set the difficulty level', () => {
        const wrapper = shallow(<Opponent {...props} />);
        const OpponentDescription = wrapper.find('OpponentDescription')
        OpponentDescription.props().setDifficulty(3)
        expect(props.onSetDifficulty).toHaveBeenCalledWith(3)
    })

    test('will request an invite', () => {
        const wrapper = shallow(<Opponent {...props} />);

        const OpponentDescription = wrapper.find('OpponentDescription')
        OpponentDescription.props().requestInvite('stubSocketId')
        expect(socketSpy).toHaveBeenCalledWith("INVITATION_SENT", { "difficulty": 2, "sentTo": "stubSocketId" })
    })

    test('will reset the connection', () => {
        const wrapper = shallow(<Opponent {...props} />);
        wrapper.instance().loadOpponentCanvas()
        const OpponentDescription = wrapper.find('OpponentDescription')
        OpponentDescription.props().getPool()
        expect(props.onReset).toHaveBeenCalledWith({ reStart: false })
        expect(socketSpy).toHaveBeenCalledWith("LOOK_FOR_OPPONENTS", null)
    })
})

describe('Component updates (CDU, CWU)', () => {
    let props
    let useRefSpy;
    let socketSpy;
    beforeEach(() => {
        props = {
            game: gameStub,
            difficulty: 2,
            temp: {},
            onSetDifficulty: jest.fn(),
            onReset: jest.fn(),
            onCanvasFocus: jest.fn(),
            toggleMultiplayer: jest.fn(),
            onGameOver: jest.fn()
        }
        useRefSpy = getRefSpy();
        socketSpy = jest.spyOn(socketActions, 'clientEmitter');
    })
    afterEach(() => {
        props = null
        useRefSpy = null
        socketSpy.mockClear()
    })

    test('will reset on a new invite accepted', () => {
        const prevProps = { game: {}, temp: {} };
        const updatedProps = {
            ...props,
            temp: {
                acceptedInvitation: {}
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().componentDidUpdate(prevProps)
        expect(props.onReset).toHaveBeenCalledWith({ reStart: false })
    })

    test('will start game when countdown reaches 0', () => {
        const prevProps = { game: {}, temp: { acceptedInvitation: { countdown: 1 } } };
        const updatedProps = {
            ...props,
            temp: {
                acceptedInvitation: { countdown: 0, difficulty: 4 }
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().audio = { play: jest.fn() }
        wrapper.instance().componentDidUpdate(prevProps)
        expect(socketSpy).toHaveBeenCalledWith("START_GAME", {
            clientScreen: JSON.stringify(gameStub),
            opponentInfo: { countdown: 0, difficulty: 4 }
        })
        expect(props.onSetDifficulty).toHaveBeenCalledWith(4)
    })

    test('will handle game in progress when game has not started yet', () => {
        const prevProps = { game: {}, temp: {} };
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress: {}
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().componentDidUpdate(prevProps)
        expect(props.onCanvasFocus).toHaveBeenCalled()
        expect(props.onReset).toHaveBeenCalledWith({})
        expect(props.toggleMultiplayer).toHaveBeenCalled()
    })

    test('will do nothing if game is in progress but both client and opponent values have not changed', () => {
        const prevProps = {
            game: { ...gameStub },
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({}) }
            }
        };
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({}) }
            },
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        const ans = wrapper.instance().componentDidUpdate(prevProps)
        expect(ans).toBe(undefined)
    })

    test('will update game on opponent screen if values have changed', () => {
        const prevProps = {
            game: { ...gameStub },
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({ a: 1 }) }
            }
        };
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({}) }
            },
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().setGame = jest.fn()
        const ans = wrapper.instance().componentDidUpdate(prevProps)
        expect(wrapper.instance().setGame).toHaveBeenCalledWith("{}", "{\"a\":1}")
        expect(ans).toBe(undefined)
    })

    test('will emit updated client screen if game has changed', () => {
        const prevProps = {
            game: { ...gameStub },
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({}) }
            }
        };
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress: { opponentScreen: JSON.stringify({}), info: { opponentSID: 'stubSID' } }
            },
            game: {
                ...gameStub,
                activeShape: {
                    ...gameStub.activeShape,
                    yPosition: 30
                }
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().componentDidUpdate(prevProps)
        expect(socketSpy).toHaveBeenCalledWith("UPDATED_CLIENT_SCREEN", {
            clientScreen: JSON.stringify(updatedProps.game),
            opponentSID: 'stubSID'
        })
    })

    test('will handle game over', () => {
        const prevProps = { game: {}, temp: {} };
        const updatedProps = {
            ...props,
            temp: {
                gameOver: {}
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.setState({ opponentLinesCleared: 5 })
        wrapper.instance().componentDidUpdate(prevProps)
        expect(props.onGameOver).toHaveBeenCalledWith([5])
        expect(props.toggleMultiplayer).toHaveBeenCalled()
    })

    test('will emit on component unmounting', () => {
        const wrapper = shallow(<Opponent {...props} />);
        wrapper.instance().componentWillUnmount()
        expect(socketSpy).toHaveBeenCalledWith("OPPONENT_UNMOUNTED", {})
    })

    test('will emit on component unmounting in middle of an invitation', () => {
        const updatedProps = {
            ...props,
            temp: {
                invitationFrom: {}
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().componentWillUnmount()
        expect(socketSpy).toHaveBeenNthCalledWith(1, "INVITATION_DECLINED", { invitationFrom: {} })
        expect(socketSpy).toHaveBeenNthCalledWith(2, "OPPONENT_UNMOUNTED", { invitationFrom: {} })
    })

})

describe('Updating the opponent screen/canvas', () => {
    let props
    let useRefSpy, socketSpy, refreshCanvasSpy;
    beforeEach(() => {
        props = {
            game: gameStub,
            difficulty: 2,
            temp: {},
            onSetDifficulty: jest.fn(),
            onReset: jest.fn()
        }
        useRefSpy = getRefSpy();
        socketSpy = jest.spyOn(socketActions, 'clientEmitter');
        refreshCanvasSpy = jest.spyOn(canvas, 'refreshCanvas');
    })
    afterEach(() => {
        props = null
        useRefSpy = null
        socketSpy.mockClear()
        refreshCanvasSpy.mockClear()
    })
    test('will do nothing when no opponent screen info', () => {
        const wrapper = shallow(<Opponent {...props} />);
        const ans = wrapper.instance().setGame(null, {})
        expect(ans).toBe(undefined)
    })

    test('will do nothing on game over', () => {
        const updatedProps = {
            ...props,
            temp: {
                gameOver: {}
            }
        }
        const wrapper = shallow(<Opponent {...updatedProps} />);
        const ans = wrapper.instance().setGame(JSON.stringify({}), null)
        expect(ans).toBe(undefined)
    })
    test('will process line cleared by opponent', () => {
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress:
                {
                    info: { difficulty: 2 },
                },
            }
        }
        
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().loadOpponentCanvas();
        expect(wrapper.state().opponentLinesCleared).toBe(0);
        expect(wrapper.state().levelsRaised).toBe(0);
        wrapper.instance().setGame(JSON.stringify({
            ...gameStub,
            points: {
                ...gameStub.points,
                totalLinesCleared: 1
            }
        }), JSON.stringify({ ...gameStub }))
        expect(wrapper.state().opponentLinesCleared).toBe(1);
        expect(wrapper.state().levelsRaised).toBe(1);
        expect(refreshCanvasSpy).toHaveBeenCalledTimes(1)
    })

    test('will draw floor raise on opponent if diff in boundary', () => {
        const updatedProps = {
            ...props,
            temp: {
                gameInProgress:
                {
                    info: { difficulty: 2 },
                },
            },
            floorsRaisedOnOpp: jest.fn()
        }
        
        const wrapper = shallow(<Opponent {...updatedProps} />);
        wrapper.instance().loadOpponentCanvas();
        expect(wrapper.state().opponentLinesCleared).toBe(0);
        expect(wrapper.state().levelsRaised).toBe(0);
        wrapper.instance().setGame(JSON.stringify({
            ...gameStub,
            points: {
                ...gameStub.points,
                totalLinesCleared: 1
            },
            rubble:{
                ...gameStub.rubble,
            },
            floor:{
                floorHeight: 1,
                floorIndices: []
            }
        }), JSON.stringify({ ...gameStub }))
        expect(wrapper.state().opponentLinesCleared).toBe(1);
        expect(wrapper.state().levelsRaised).toBe(1);
        expect(refreshCanvasSpy).toHaveBeenCalledTimes(1)
        expect(updatedProps.floorsRaisedOnOpp).toHaveBeenCalledWith(1)
    })
})