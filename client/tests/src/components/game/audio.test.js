import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Audio } from '../../../../src/components/game/audio';

describe('The audio', () => {
  test('will set the Audio component', () => {
    const wrapper = shallow(<Audio />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
