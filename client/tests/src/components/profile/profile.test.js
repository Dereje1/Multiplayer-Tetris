import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Profile } from '../../../../src/components/profile/profile';
import RESTcall from '../../../../src/crud'
import { stubProfile } from '../../../stub'

jest.mock('../../../../src/crud')

// Fix date to match snapshot both locally and github 
const utcFixedDate = new Date(Date.UTC(2022, 6, 30, 12, 35, 0))
Date.now = jest.fn(() => utcFixedDate);


describe('The profile component', () => {
    let props;
    beforeEach(() => {
        props = {
            user: { ...stubProfile.user }
        }
    })
    afterEach(() => {
        props = null
        RESTcall.mockClear()
    })
    test('will render for logged in user', async () => {
        RESTcall.mockImplementation(() => Promise.resolve(stubProfile.userProfileResponse ))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        expect(toJson(wrapper)).toMatchSnapshot();
    })
    test('will empty render if no data fetched', async () => {
        RESTcall.mockImplementation(() => Promise.resolve({ data: null }))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        expect(wrapper.isEmptyRender()).toBe(true)
    })
    test('will render detailed view for a single game', async () => {
        RESTcall.mockImplementation(() => Promise.resolve(stubProfile.userProfileResponse ))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        const singleGameIcon = wrapper.find('FontAwesomeIcon').at(3)
        const singleGameDetail = singleGameIcon.props().onClick()
        expect(toJson(singleGameDetail)).toMatchSnapshot();
    })

    test('will render detailed view for a match', async () => {
        RESTcall.mockImplementation(() => Promise.resolve(stubProfile.userProfileResponse ))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        const matchIcon = wrapper.find('FontAwesomeIcon').at(1)
        const matchDetail = matchIcon.props().onClick()
        expect(toJson(matchDetail)).toMatchSnapshot();
    })
})