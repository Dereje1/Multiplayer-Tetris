/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Game } from '../../../../src/components/game/game';
import { gameStub } from '../../../stub';

jest.useFakeTimers();
const fillText = jest.fn()
const focus = jest.fn()

const getRefSpy = () => jest.spyOn(React, "createRef").mockImplementation(() => ({
    current: {
        style: {},
        getContext: () => ({
            canvas: {
                width: gameStub.canvas.canvasMajor.width,
                height: gameStub.canvas.canvasMajor.height
            },
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            beginPath: jest.fn(),
            rect: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            fill: jest.fn(),
            fillText
        }),
        focus
    }
}))

const getRequestAnimationFrameSpy = (start, end) => jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    start++
    if (start < end) {
        cb(start)
    } else {
        return null;
    }
});

describe('The Game component', () => {
    let props;
    let useRefSpy;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = getRefSpy();
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
        jest.clearAllMocks();
    })
    test('will display message for small screen sizes', () => {
        global.innerWidth = 100;
        global.innerHeight = 100;
        const wrapper = shallow(<Game {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
    test('will display the game for allowed screen sizes', () => {
        const wrapper = shallow(<Game {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
    test('will start the game', async () => {
        getRequestAnimationFrameSpy(698, 702);
        const wrapper = shallow(<Game {...props} />);
        expect(wrapper.state().lastRefresh).toBe(0)
        await wrapper.instance().handlePause()
        jest.advanceTimersByTime(50);
        expect(wrapper.state().lastRefresh).toBe(700)
    });
    test('will set state to multiplayer mode if an inviation is sent', () => {
        const propsToUpdate = {
            ...props,
            socket: {
                temp: { invitationFrom: 'stub invite' },
            }

        };
        const wrapper = shallow(<Game {...propsToUpdate} />);
        expect(wrapper.state().multiPlayer).toBe(true);
    });
    test('will end tick', () => {
        const wrapper = shallow(<Game {...props} />);
        expect(wrapper.state().requestAnimation).toBe(true)
        wrapper.instance().endTick()
        expect(wrapper.state().requestAnimation).toBe(false)
    });
    test('will raise floor', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.instance().floorRaise(1)
        expect(props.GameActions).toHaveBeenNthCalledWith(2,
            "RAISE_FLOOR",
            {
                "boundaryCells": ["0-20", "1-20", "2-20", "3-20", "4-20", "5-20", "6-20", "7-20", "8-20", "9-20"],
                "occupiedCells": [],
                "winRows": null
            },
            { "raiseBy": 1 }
        )
    });
    test('will handle key strokes', async () => {
        const updatedProps = {
            ...props,
            game: {
                ...props.game,
                paused: false
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        const spy1 = jest.spyOn(wrapper.instance(), 'moveShape');
        wrapper.instance().gamePlay({ keyCode: 37 })
        expect(spy1).toHaveBeenCalledWith({
            "absoluteVertices": [],
            "boundingBox": [],
            "cells": [],
            "name": "shapeZ",
            "rotationStage": 0,
            "unitBlockSize": 30,
            "unitVertices": [],
            "xPosition": -30,
            "yPosition": 0
        })
    });
    test('will handle game over', async () => {
        const updatedProps = {
            ...props,
            user: {
                profile: {}
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        await wrapper.instance().gameOver()
        expect(fillText).toHaveBeenNthCalledWith(1, "Game Over", 14, 100)
        expect(fillText).toHaveBeenNthCalledWith(2, "0 Lines Cleared", 55, 300)
        expect(fillText).toHaveBeenNthCalledWith(3, "     Reached Level 0", 5, 450)
    });
    test('will handle multiplayer', () => {
        const updatedProps = {
            ...props,
            user: {
                profile: { authenticated: true }
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        const spy1 = jest.spyOn(wrapper.instance(), 'resetBoard');
        expect(wrapper.state().multiPlayer).toBe(false)
        wrapper.instance().handleMultiplayer()
        expect(wrapper.state().multiPlayer).toBe(true)
        expect(spy1).toHaveBeenCalledWith({ reStart: false })
    });
});

describe('Component updates (CDU, CWU)', () => {
    let props;
    let useRefSpy;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = getRefSpy();
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
        jest.clearAllMocks();
    })
    test('will return undefined if game object missing', () => {
        const prevProps = {
            ...props,
            game: {}
        }
        const wrapper = shallow(<Game {...props} />);
        const ans = wrapper.instance().componentDidUpdate(prevProps);
        expect(ans).toBe(undefined)
    })

    test('will update canvas loaded state', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ canvasLoaded: false })
        expect(wrapper.state().canvasLoaded).toBe(true)
        expect(props.GameActions).toHaveBeenNthCalledWith(1, "INITIALIZE_GAME", 1, true)
    })

    test('will speed game up on level increase in single player mode', () => {
        const updatedProps = {
            ...props,
            game: {
                ...props.game,
                points: {
                    ...props.game.points,
                    level: 1
                }
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        wrapper.instance().componentDidUpdate(props);
        expect(props.GameActions).toHaveBeenNthCalledWith(2, "LEVEL_UP", 50)
    })

    test('will set state to multiplayer mode if an inviation has been accepted', () => {
        const propsToUpdate = {
            ...props,
            socket: {
                temp: { acceptedInvitation: true },
            }

        };
        const wrapper = shallow(<Game {...propsToUpdate} />);
        expect(wrapper.state().multiPlayer).toBe(false);
        const prevProps = {
            ...props,
            socket: {
                temp: { acceptedInvitation: false },
            }

        };
        wrapper.instance().componentDidUpdate(prevProps);
        expect(wrapper.state().multiPlayer).toBe(true);
    });

    test('will set multiplayer mode state off if opponent has unmounted', () => {
        const oldProps = {
            ...props,
            socket: {
                temp: { invitationFrom: 'stub invite' },
            }

        };
        const wrapper = shallow(<Game {...oldProps} />);
        expect(wrapper.state().multiPlayer).toBe(true);
        const newProps = {
            ...props,
            socket: {
                temp: null,
            }

        };
        wrapper.setProps({ ...newProps });
        expect(wrapper.state().multiPlayer).toBe(false);
    });

    test('will end tick on unmount', () => {
        const wrapper = shallow(<Game {...props} />);
        expect(wrapper.state().requestAnimation).toBe(true)
        wrapper.instance().componentWillUnmount()
        expect(wrapper.state().requestAnimation).toBe(false)
    });
})

describe('Sub-Component callbacks', () => {
    let props;
    let useRefSpy;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = getRefSpy();
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
        jest.clearAllMocks();
    })

    test('Controls - will reset board', () => {
        const wrapper = shallow(<Game {...props} />);
        const controls = wrapper.find('Controls')
        const spy1 = jest.spyOn(wrapper.instance(), 'resetBoard');
        controls.props().onReset(false)
        expect(spy1).toHaveBeenCalledWith({ reStart: false })
    });
    test('Controls - will handle pause', () => {
        const wrapper = shallow(<Game {...props} />);
        const controls = wrapper.find('Controls')
        const spy1 = jest.spyOn(wrapper.instance(), 'handlePause');
        controls.props().onhandlePause()
        expect(spy1).toHaveBeenCalled()
    });
    test('Controls - will raise the floor', () => {
        const wrapper = shallow(<Game {...props} />);
        const controls = wrapper.find('Controls')
        const spy1 = jest.spyOn(wrapper.instance(), 'floorRaise');
        controls.props().onFloorRaise()
        expect(spy1).toHaveBeenCalledWith(1)
    });
    test('Controls - will handle multiplayer', () => {
        const updatedProps = {
            ...props,
            user: {
                profile: {}
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        const controls = wrapper.find('Controls')
        const spy1 = jest.spyOn(wrapper.instance(), 'handleMultiplayer');
        controls.props().onMultiPlayer()
        expect(spy1).toHaveBeenCalled()
        expect(controls.props().allowMultiPlayer).toBe(false)
    });
    test('Controls - will allow multiplayer', () => {
        const updatedProps = {
            ...props,
            socket: {
                usersLoggedIn: 2
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        const controls = wrapper.find('Controls')
        expect(controls.props().allowMultiPlayer).toBe(true)
    });
    test('Canvas - on Key Down', () => {
        const wrapper = shallow(<Game {...props} />);
        const canvas = wrapper.find('canvas')
        const spy1 = jest.spyOn(wrapper.instance(), 'gamePlay');
        canvas.props().onKeyDown('event')
        expect(spy1).toHaveBeenCalledWith('event')
    });
    test('Canvas - on Key Up', () => {
        const wrapper = shallow(<Game {...props} />);
        const canvas = wrapper.find('canvas')
        const spy1 = jest.spyOn(wrapper.instance(), 'arrowKeyLag');
        canvas.props().onKeyUp('event')
        expect(spy1).toHaveBeenCalledWith('event')
    });
    test('Opponent - will reset board', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        const spy1 = jest.spyOn(wrapper.instance(), 'resetBoard');
        oponnent.props().onReset(false)
        expect(spy1).toHaveBeenCalledWith(false)
    });
    test('Opponent - will raise the floor', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        const spy1 = jest.spyOn(wrapper.instance(), 'floorRaise');
        oponnent.props().onFloorRaise(1)
        expect(spy1).toHaveBeenCalledWith(1)
    });
    test('Opponent - will signal game over', () => {
        const updatedProps = {
            ...props,
            socket: {
                temp: { gameOver: { winnerGoogleID: 'stub Id' } }
            },
            user: {
                profile: {}
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        const spy1 = jest.spyOn(wrapper.instance(), 'gameOver');
        oponnent.props().onGameOver('game over')
        expect(spy1).toHaveBeenCalledWith('game over')
    });
    test('Opponent - will focus canvas', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        focus.mockClear()
        oponnent.props().onCanvasFocus()
        expect(focus).toHaveBeenCalled()
    });
    test('Opponent - will set difficulty', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        expect(wrapper.state().difficulty).toBe(2)
        oponnent.props().onSetDifficulty(4)
        expect(wrapper.state().difficulty).toBe(4)
    });
    test('Opponent - will toggle multi player', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        expect(wrapper.state().inGameToggle).toBe(false)
        oponnent.props().toggleMultiplayer()
        expect(wrapper.state().inGameToggle).toBe(true)
    });
    test('Opponent - raise floor on oponnet', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ multiPlayer: true })
        const oponnent = wrapper.find('Connect(Opponent)')
        expect(wrapper.state().floorsRaised).toBe(0)
        oponnent.props().floorsRaisedOnOpp(2)
        expect(wrapper.state().floorsRaised).toBe(2)
    });
})