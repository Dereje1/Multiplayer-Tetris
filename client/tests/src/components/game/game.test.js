/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Game } from '../../../../src/components/game/game';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
const gameStub = {
    "timerInterval": 700,
    "paused": true,
    "nextShape": "",
    "canvas": {
        "canvasMajor": {
            "width": 300,
            "height": 600
        },
        "canvasMinor": {
            "width": 210,
            "height": 150
        }
    },
    "points": {
        "totalLinesCleared": 0,
        "level": 0,
        "levelUp": 5
    },
    "rubble": {
        "occupiedCells": [],
        "winRows": null,
        "boundaryCells": [
            "0-20",
            "1-20",
            "2-20",
            "3-20",
            "4-20",
            "5-20",
            "6-20",
            "7-20",
            "8-20",
            "9-20"
        ]
    },
    "activeShape": {
        "name": "shapeZ",
        "unitBlockSize": 30,
        "xPosition": 0,
        "yPosition": 0,
        "unitVertices": [],
        "absoluteVertices": [],
        "boundingBox": [],
        "rotationStage": 0,
        "cells": []
    }
}

describe('The Game', () => {
    let props;
    let useRefSpy;
    const focus = jest.fn();
    let counter = 698;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = jest.spyOn(React, "createRef").mockImplementation(() => ({
            current: {
                style: {},
                getContext: () => ({
                    canvas: {
                        width: gameStub.canvas.canvasMajor.width,
                        height: gameStub.canvas.canvasMajor.height
                    },
                    clearRect: jest.fn(),
                    fillRect: jest.fn(),
                    beginPath: jest.fn(),
                    rect: jest.fn(),
                    stroke: jest.fn(),
                    moveTo: jest.fn(),
                    lineTo: jest.fn(),
                    fill: jest.fn()
                }),
                focus
            }
        }))
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
            counter++
            if (counter < 702) {
                cb(counter)
            } else {
                return null;
            }
        });
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
    })
    test('will display message for small screen sizes', () => {
        global.innerWidth = 100;
        global.innerHeight = 100;
        const wrapper = shallow(<Game {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
    test('will display the game for allowed screen sizes', () => {
        const wrapper = shallow(<Game {...props} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    });
    test('will start the game', async () => {
        const wrapper = shallow(<Game {...props} />);
        expect(wrapper.state().lastRefresh).toBe(0)
        await wrapper.instance().handlePause()
        jest.advanceTimersByTime(50);
        expect(wrapper.state().lastRefresh).toBe(700)
    });
});