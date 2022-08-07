/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Menu } from '../../../../src/components/menu/menu'

jest.useFakeTimers();
describe('The Menu', () => {
    let props, closeMenuSpy;
    beforeEach(() => {
        props = {
            onLogOut: jest.fn(),
            location: { pathname: '/' }
        }
        jest.spyOn(window, 'addEventListener').mockImplementationOnce(() => { });
        jest.spyOn(window, 'removeEventListener').mockImplementationOnce(() => { });
    })
    afterEach(() => {
        props = null
        window.addEventListener.mockClear()
        window.removeEventListener.mockClear()
        closeMenuSpy.mockClear()
    })
    test('will render the collapsed menu', () => {
        const wrapper = shallow(<Menu {...props} />)
        closeMenuSpy = jest.spyOn(wrapper.instance(), 'closeMenu');
        const [listener, callback] = window.addEventListener.mock.calls[0]
        callback()
        expect(listener).toBe('click')
        expect(closeMenuSpy).toHaveBeenCalled()
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render the expanded menu', () => {
        const wrapper = shallow(<Menu {...props} />)
        expect(wrapper.state().showMenu).toBe(false)
        wrapper.props().onClick({ stopPropagation: jest.fn() })
        expect(toJson(wrapper)).toMatchSnapshot();
        expect(wrapper.state().showMenu).toBe(true)
    })

    test('will close the expanded menu', () => {
        const wrapper = shallow(<Menu {...props} />)
        wrapper.props().onClick({ stopPropagation: jest.fn() })
        expect(wrapper.state().showMenu).toBe(true)
        const closeIcon = wrapper.find({ className: "close"})
        closeIcon.props().onClick()
        jest.advanceTimersByTime(475);
        expect(wrapper.state().showMenu).toBe(false)
    })

    test('will close the menu on a path change',()=>{
        const wrapper = shallow(<Menu {...props} />)
        closeMenuSpy = jest.spyOn(wrapper.instance(), 'closeMenu');
        wrapper.instance().componentDidUpdate({ location: { pathname: '/otherpath' } })
        expect(closeMenuSpy).toHaveBeenCalled()
    })

    test('will logout the user', () => {
        const wrapper = shallow(<Menu {...props} />)
        wrapper.props().onClick({ stopPropagation: jest.fn() })
        
        const logoutIcon = wrapper.find({ className: "menuitems"}).at(0)
        logoutIcon.props().onClick();
        expect(props.onLogOut).toHaveBeenCalled()
    })

    test('will remove the listener whem menu unmounts',()=>{
        const wrapper = shallow(<Menu {...props} />)
        wrapper.instance().componentWillUnmount()
        expect(window.removeEventListener).toHaveBeenCalledWith('click')
    })
})