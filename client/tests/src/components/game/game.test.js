/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Game } from '../../../../src/components/game/game';

describe('The Game', () => {
    let props;
    let useRefSpy;
    const clearRect = jest.fn();
    const fillRect = jest.fn();
    const focus = jest.fn();
    beforeEach(() => {
        props = {
            GameActions: jest.fn()
        }
        useRefSpy = jest.spyOn(React, "createRef").mockImplementation(() => ({
            current: {
                style: {},
                getContext: () => ({
                    clearRect,
                    fillRect,
                    beginPath: jest.fn(),
                    moveTo: jest.fn(),
                    lineTo: jest.fn(),
                    stroke: jest.fn()
                }),
                getBoundingClientRect: () => ({ left: 1, top: 1 }),
                focus
            }
        }))
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
    })
    test('will display message for small screen sizes', () => {
        global.innerWidth = 100;
        global.innerHeight = 100;
        const wrapper = shallow(<Game {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
    test('will display', () => {
        const wrapper = shallow(<Game {...props} />);
    });
});