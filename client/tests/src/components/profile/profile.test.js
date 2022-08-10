import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Profile } from '../../../../src/components/profile/profile';
import RESTcall from '../../../../src/crud'
import { stubProfile } from '../../../stub'

jest.mock('../../../../src/crud')

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
    test('will render for logged in user in single mode', async () => {
        RESTcall.mockImplementation(() => Promise.resolve(stubProfile.userProfileResponse ))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        expect(toJson(wrapper)).toMatchSnapshot();
    })
    test('will render for logged in user in match mode', async () => {
        RESTcall.mockImplementation(() => Promise.resolve(stubProfile.userProfileResponse ))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        const tableSwitch = wrapper.find('ForwardRef(FormControlLabel)').props().control;
        tableSwitch.props.onChange()
        expect(toJson(wrapper)).toMatchSnapshot();
    })
    test('will render progress bar if no data fetched yet or rejected', async () => {
        RESTcall.mockImplementation(() => Promise.reject(null))
        const wrapper = shallow(<Profile {...props} />)
        await Promise.resolve()
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})