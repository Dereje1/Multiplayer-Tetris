/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import OpponentInfo from '../../../../src/components/oponnent/opponentInfo';
import { gameStub } from '../../../stub'

describe('The opponent info', () => {
    let props, windowSpy;
    let assign = jest.fn();
    beforeEach(() => {
        props = {
            socketState: {},
            difficulty: 2,
            setDifficulty: jest.fn(),
            requestInvite: jest.fn(),
            getPool: jest.fn(),
            authenticated: true
        }
        windowSpy = jest.spyOn(global, "window", "get");
        windowSpy.mockImplementation(() => ({ location: { assign } }));
    })
    afterEach(() => {
        props = null
        windowSpy.mockClear()
    })

    test('will render login for unauthenticated users', async () => {
        const updatedProps = {
            ...props,
            authenticated: false
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />)
        expect(toJson(wrapper)).toMatchSnapshot();
        const loginButton = wrapper.find({id: 'googleloginbutton'})
        loginButton.props().onClick()
        expect(assign).toHaveBeenCalledWith('/auth/google')
    })

    test('will render stage 1', () => {
        // stage 1 - no logged in opponents in multiplayer mode found
        const updatedProps = {
            ...props,
            socketState: {
                opponents: []
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        const reload = wrapper.find({ className: 'opponentContainer__opponentDescription__invitation_reload' })
        reload.props().onClick()
        expect(props.getPool).toHaveBeenCalledTimes(1)
    })

    test('will render stage 2', () => {
        // stage 2 - logged in opponents in multiplayer mode found, display invitation buttons
        const updatedProps = {
            ...props,
            socketState: {
                opponents: [{
                    displayname: "stub opponent 1",
                    socketId: "stub-opponent-1-socketID"
                }, {
                    displayname: "stub opponent 2",
                    socketId: "stub-opponent-2-socketID"
                }]
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        const difficultyButton = wrapper.find({ role: 'button' }).at(2)
        const inviteButton = wrapper.find({ type: 'submit' }).at(0)
        difficultyButton.props().onClick()
        inviteButton.props().onClick()
        expect(props.setDifficulty).toHaveBeenCalledWith(3)
        expect(props.requestInvite).toHaveBeenCalledWith('stub-opponent-1-socketID')
    })

    test('will render stage 3A', () => {
        // stage 3A - display pending invitation sent
        const updatedProps = {
            ...props,
            socketState: {
                invitationTo: {
                    displaynameReciever: "stub opponent 1",
                    socketIdReciever: "stub-opponent-1-socketID"
                }
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render stage 3B', () => {
        // stage 3B - display declined invitation
        const updatedProps = {
            ...props,
            socketState: {
                declinedInvitation: {}
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        const reload = wrapper.find({ className: 'opponentContainer__opponentDescription__invitation_reload' })
        expect(toJson(wrapper)).toMatchSnapshot();
        reload.props().onClick()
        expect(props.getPool).toHaveBeenCalledTimes(1)
    })

    test('will render stage 4', () => {
        // stage 4 - invitation has been accepted, display pre game warm up
        const updatedProps = {
            ...props,
            socketState: {
                acceptedInvitation: {
                    opponnetDisplayname: 'stub opponent 1',
                    countdown: 7
                }
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render stage 5', () => {
        // stage 5 - Game has started
        const updatedProps = {
            ...props,
            socketState: {
                gameInProgress: {
                    opponentScreen: JSON.stringify(gameStub),
                    info: {
                        opponnetDisplayname: 'stub opponent 1'
                    }
                }
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render stage 6', () => {
        // stage 6 - Game over
        const updatedProps = {
            ...props,
            socketState: {
                gameOver: {}
            }
        }
        const wrapper = shallow(<OpponentInfo {...updatedProps} />);
        expect(toJson(wrapper)).toMatchSnapshot();
        const reload = wrapper.find({ className: 'opponentContainer__opponentDescription__invitation_reload' })
        reload.props().onClick()
        expect(props.getPool).toHaveBeenCalledTimes(1)
    })

    test('will render loading wheel for all other states', () => {
        const wrapper = shallow(<OpponentInfo {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})

