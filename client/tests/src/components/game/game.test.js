/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import { Game } from '../../../../src/components/game/game';

jest.useFakeTimers();
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
const getRefSpy = () => jest.spyOn(React, "createRef").mockImplementation(() => ({
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
        focus: jest.fn()
    }
}))

const getRequestAnimationFrameSpy = (start, end) => jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
    start++
    if (start < end) {
        cb(start)
    } else {
        return null;
    }
});

describe('The Game component', () => {
    let props;
    let useRefSpy;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = getRefSpy();
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
        jest.clearAllMocks();
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
        getRequestAnimationFrameSpy(698, 702);
        const wrapper = shallow(<Game {...props} />);
        expect(wrapper.state().lastRefresh).toBe(0)
        await wrapper.instance().handlePause()
        jest.advanceTimersByTime(50);
        expect(wrapper.state().lastRefresh).toBe(700)
    });
    test('will set state to multiplayer mode if an inviation is sent', () => {
        const propsToUpdate = {
            ...props,
            socket: {
                temp: { invitationFrom: 'stub invite' },
            }

        };
        const wrapper = shallow(<Game {...propsToUpdate} />);
        expect(wrapper.state().multiPlayer).toBe(true);
    });
});

describe('Component updates (CDU)', () => {
    let props;
    let useRefSpy;
    beforeEach(() => {
        props = {
            GameActions: jest.fn(),
            game: gameStub
        }
        useRefSpy = getRefSpy();
        global.innerWidth = 1000;
        global.innerHeight = 1000;
    })
    afterEach(() => {
        props = null
        useRefSpy = null;
        jest.clearAllMocks();
    })
    test('will return undefined if game object missing', () => {
        const prevProps = {
            ...props,
            game: {}
        }
        const wrapper = shallow(<Game {...props} />);
        const ans = wrapper.instance().componentDidUpdate(prevProps);
        expect(ans).toBe(undefined)
    })

    test('will update canvas loaded state', () => {
        const wrapper = shallow(<Game {...props} />);
        wrapper.setState({ canvasLoaded: false })
        expect(wrapper.state().canvasLoaded).toBe(true)
        expect(props.GameActions).toHaveBeenNthCalledWith(1, "INITIALIZE_GAME", 1, true)
    })

    test('will speed game up on level increase in single player mode', () => {
        const updatedProps = {
            ...props,
            game: {
                ...props.game,
                points: {
                    ...props.game.points,
                    level: 1
                }
            }
        }
        const wrapper = shallow(<Game {...updatedProps} />);
        wrapper.instance().componentDidUpdate(props);
        expect(props.GameActions).toHaveBeenNthCalledWith(2, "LEVEL_UP", 50)
    })

    test('will set state to multiplayer mode if an inviation has been accepted', () => {
        const propsToUpdate = {
            ...props,
            socket: {
                temp: { acceptedInvitation: true },
            }

        };
        const wrapper = shallow(<Game {...propsToUpdate} />);
        expect(wrapper.state().multiPlayer).toBe(false);
        const prevProps = {
            ...props,
            socket: {
                temp: { acceptedInvitation: false },
            }

        };
        wrapper.instance().componentDidUpdate(prevProps);
        expect(wrapper.state().multiPlayer).toBe(true);
    });

    test('will set multiplayer mode state off if opponent has unmounted', () => {
        const oldProps = {
            ...props,
            socket: {
                temp: { invitationFrom: 'stub invite' },
            }

        };
        const wrapper = shallow(<Game {...oldProps} />);
        expect(wrapper.state().multiPlayer).toBe(true);
        const newProps = {
            ...props,
            socket: {
                temp: null,
            }

        };
        wrapper.setProps({...newProps});
        expect(wrapper.state().multiPlayer).toBe(false);
    });
})