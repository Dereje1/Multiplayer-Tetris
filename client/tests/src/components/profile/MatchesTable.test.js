import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import MatchesTable, { Row } from '../../../../src/components/profile/MatchesTable'
import { stubProfile } from '../../../stub'

//had to mock usestate as jest could not support due to conflicting react
//TODO: fix
const mockSetOpen = jest.fn()
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(() => [false, mockSetOpen])
}))
// eslint-disable-next-line import/first
import { useState } from 'react';

describe('The Matches table', () => {
    test('will render', () => {
        const wrapper = shallow(<MatchesTable
            rows={stubProfile.userProfileResponse.matchStats}
            opponents={stubProfile.userProfileResponse.opponentNames}
            userId={stubProfile.user.profile.username}
        />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})

describe('The Matches table row', () => {
    test('will render a collapsed row for a winning user', () => {
        const props = {
            row: stubProfile.userProfileResponse.matchStats[0],
            opponents: stubProfile.userProfileResponse.opponentNames,
            userId: stubProfile.user.profile.username
        }
        const wrapper = shallow(<Row {...props} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render a collapsed row for a loosing user', () => {
        const props = {
            row: stubProfile.userProfileResponse.matchStats[1],
            opponents: stubProfile.userProfileResponse.opponentNames,
            userId: stubProfile.user.profile.username
        }
        const wrapper = shallow(<Row {...props} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will render an expanded row', () => {
        useState.mockImplementation(()=>[true, mockSetOpen])
        const props = {
            row: stubProfile.userProfileResponse.matchStats[0],
            opponents: stubProfile.userProfileResponse.opponentNames,
            userId: stubProfile.user.profile.username
        }
        const wrapper = shallow(<Row {...props} />)
        const expandButton = wrapper.find({ 'aria-label': "expand row" })
        expandButton.props().onClick()
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('will change state of an expanded row', () => {
        useState.mockImplementation(()=>[false, mockSetOpen])
        const props = {
            row: stubProfile.userProfileResponse.matchStats[0],
            opponents: stubProfile.userProfileResponse.opponentNames,
            userId: stubProfile.user.profile.username
        }
        const wrapper = shallow(<Row {...props} />)
        const expandButton = wrapper.find({ 'aria-label': "expand row" })
        expandButton.props().onClick()
        expect(mockSetOpen).toHaveBeenCalledWith(true)
    })
})