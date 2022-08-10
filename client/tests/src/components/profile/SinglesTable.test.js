import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SinglesTable from '../../../../src/components/profile/SinglesTable'
import { stubProfile } from '../../../stub'

describe('The Single games table', () => {
    let deleteResult;
    beforeEach(() => {
        deleteResult = jest.fn()
    })
    afterEach(() => {
        deleteResult.mockClear()
    })
    test('will render', () => {
        const wrapper = shallow(<SinglesTable rows={stubProfile.userProfileResponse.singleStats} onDelete={deleteResult} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
    test('will delete result', () => {
        const wrapper = shallow(<SinglesTable rows={stubProfile.userProfileResponse.singleStats} onDelete={deleteResult} />)
        const deleteButton = wrapper.find({ id: "delete-result" }).at(0)
        deleteButton.props().onClick()
        expect(deleteResult).toHaveBeenCalledWith('62e3f935616501f9bd180a71')
    })
})