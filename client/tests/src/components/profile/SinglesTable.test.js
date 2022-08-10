import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SinglesTable from '../../../../src/components/profile/SinglesTable'
import { stubProfile } from '../../../stub'

describe('The Single games table', () => {
    test('will render', () => {
        const wrapper = shallow(<SinglesTable rows={stubProfile.userProfileResponse.singleStats} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})