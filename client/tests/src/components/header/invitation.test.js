import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Invitation from '../../../../src/components/header/invitation';

test('will render the invitation modal', () => {
    const wrapper = shallow(
        <Invitation
            onAcceptInvite={jest.fn()}
            onDeclineInvite={jest.fn()}
            invite={['stub_Invite_name', 3]}
        />)
    expect(toJson(wrapper)).toMatchSnapshot();
})

test('will empty render on no invite', () => {
    const wrapper = shallow(
        <Invitation
            onAcceptInvite={jest.fn()}
            onDeclineInvite={jest.fn()}
            invite={null}
        />)
    expect(wrapper.isEmptyRender()).toBe(true);
})

