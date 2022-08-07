/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Header } from '../../../../src/components/header/header';
import { stubProfile } from '../../../stub';
import * as socketActions from '../../../../src/sockethandler'

const getRefSpy = () => jest.spyOn(React, "createRef").mockImplementation(() => ({
    current: { play: jest.fn(() => Promise.resolve()) }
}))

describe('The header', () => {
    let props;
    let socketSpy;
    let windowSpy;
    let assign = jest.fn();
    beforeEach(() => {
        props = {
            user: {
                profile: {
                    authenticated: false,
                    userip: "::ffff:127.0.0.1",
                    username: null,
                    displayname: null
                }
            },
            socket: { mySocketId: 'stub_my_socket_id', usersLoggedIn: 0 },
            location: { pathname: '/' },
            getUser: jest.fn()
        }
        socketSpy = jest.spyOn(socketActions, 'clientEmitter');
        windowSpy = jest.spyOn(global, "window", "get");
        windowSpy.mockImplementation(() => ({ location: { assign } }));
    })
    afterEach(() => {
        props = null
        socketSpy.mockClear()
        windowSpy.mockClear()
        assign.mockClear()
    })

    test('will render for unauthenticated users', async () => {
        const wrapper = shallow(<Header {...props} />)
        await Promise.resolve()
        expect(socketSpy).toHaveBeenCalledWith("SEND_LOGGED_IN_USER", null)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render for authenticated users', async () => {
        const updatedProps = {
            ...props,
            user: { ...stubProfile.user }
        }
        const wrapper = shallow(<Header {...updatedProps} />)
        await Promise.resolve()
        expect(socketSpy).toHaveBeenCalledWith("SEND_LOGGED_IN_USER", {
            authenticated: true,
            userip: "::ffff:127.0.0.1",
            username: '0001',
            displayname: 'Stub Display Name'
        })
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will logout authenticated users', async () => {
        const updatedProps = {
            ...props,
            user: { ...stubProfile.user }
        }
        const wrapper = shallow(<Header {...updatedProps} />)
        //remove login emit
        await Promise.resolve()
        socketSpy.mockClear()
        const logOutButton = wrapper.find('withRouter(Menu)')
        logOutButton.props().onLogOut()
        await Promise.resolve()
        expect(socketSpy).toHaveBeenCalledWith("USER_LOGGED_OUT", {
            authenticated: true,
            userip: "::ffff:127.0.0.1",
            username: '0001',
            displayname: 'Stub Display Name',
            remove: true
        })
        expect(assign).toHaveBeenCalledWith('/auth/logout')
    })

    test('will accept invites', () => {
        const updatedProps = {
            ...props,
            user: { ...stubProfile.user },
            socket: {
                ...props.socket,
                temp: { 'stub_temp_object': {} }
            }
        }
        const wrapper = shallow(<Header {...updatedProps} />, { disableLifecycleMethods: true })
        expect(wrapper.state().inviteAccepted).toBe(null)
        const invitation = wrapper.find('Invitation')
        invitation.props().onAcceptInvite()
        expect(socketSpy).toHaveBeenCalledWith("INVITATION_ACCEPTED", { 'stub_temp_object': {} })
        expect(wrapper.state().inviteAccepted).toBe(true)
    })

    test('will decline invites', () => {
        const updatedProps = {
            ...props,
            user: { ...stubProfile.user },
            socket: {
                ...props.socket,
                temp: { 'stub_temp_object': {} }
            }
        }
        const wrapper = shallow(<Header {...updatedProps} />)
        const invitation = wrapper.find('Invitation')
        invitation.props().onDeclineInvite()
        expect(socketSpy).toHaveBeenNthCalledWith(1, "INVITATION_DECLINED", { 'stub_temp_object': {} })
        expect(socketSpy).toHaveBeenNthCalledWith(2, "LOOK_FOR_OPPONENTS", null)
    })
})

describe('Component updates (CDU)', () => {
    let props;
    let socketSpy;
    let useRefSpy;
    beforeEach(() => {
        props = {
            user: { ...stubProfile.user },
            socket: { mySocketId: 'stub_my_socket_id', usersLoggedIn: 0, temp: { 'stub_temp_object': {} } },
            location: { pathname: '/' },
            getUser: jest.fn()
        }
        socketSpy = jest.spyOn(socketActions, 'clientEmitter');
        useRefSpy = getRefSpy();
    })
    afterEach(() => {
        props = null
        socketSpy.mockClear()
    })

    test('will set the invite recieved state', () => {
        const updatedProps = {
            ...props,
            socket: {
                ...props.socket,
                temp: {
                    invitationFrom: {
                        displayname: 'stub_Invite_from',
                        difficulty: 3
                    }
                }
            }
        }
        const wrapper = shallow(<Header {...updatedProps} />, { disableLifecycleMethods: true })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.state().inviteReceived).toEqual(["stub_Invite_from", 3])
    })

    test('will reset the invite recieved state', () => {
        const wrapper = shallow(<Header {...props} />, { disableLifecycleMethods: true })
        wrapper.setState({ inviteReceived: ['invite_info'] })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.state().inviteReceived).toBe(null)
    })

    test('will reset the invite accepted state', () => {
        const wrapper = shallow(<Header {...props} />, { disableLifecycleMethods: true })
        wrapper.setState({ inviteAccepted: true })
        wrapper.instance().componentDidUpdate()
        expect(wrapper.state().inviteAccepted).toBe(null)
    })
})