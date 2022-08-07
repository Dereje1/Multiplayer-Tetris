import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import Controls from '../../../../src/components/controls/controls'
import {gameStub} from '../../../stub'

describe('The Controls', () => {
    let props;
    beforeEach(() => {
        props = {
            onhandlePause: jest.fn(),
            onMultiPlayer: jest.fn(),
            onFloorRaise: jest.fn(),
            onReset: jest.fn(),
            minorCanvas:{},
            game:gameStub,
            multiPlayer:[],
            difficulty: 3,
            socketId: 'stub_socket_Id',
            pauseButtonState: false,
            allowMultiPlayer: false,
        }
    })
    afterEach(() => {
        props = null
    })
    test('Will render the controls for single player mode', () => {
        const wrapper = shallow(<Controls  {...props} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('Will render the controls for single player mode with an option to switch to multiplayer mode', () => {
        const updatedProps = {...props, allowMultiPlayer: true}
        const wrapper = shallow(<Controls  {...updatedProps} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('Will render the controls for multiplayer player mode', () => {
        const updatedProps = {...props, multiPlayer:[true, false]}
        const wrapper = shallow(<Controls  {...updatedProps} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})