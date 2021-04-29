import { Key } from "ts-keycode-enum";

export interface JoystickAngleConfiguration {
  leftUpAngle: number;
  rightUpAngle: number;
}

export const defaultJoystickAngles: JoystickAngleConfiguration = {
  leftUpAngle: 0.67,
  rightUpAngle: 0.67,
};

export interface JoystickKeyMapping {
  up: number;
  up_two?: number;
  down: number;
  down_two?: number;
  left: number;
  left_two?: number;
  right: number;
  right_two?: number;
}

export interface KeyMapping {
  leftJoystick: JoystickKeyMapping;
}

export const defaultKeyMapping: KeyMapping = {
  leftJoystick: {
    up: Key.W,
    up_two: undefined,
    down: Key.S,
    down_two: undefined,
    left: Key.A,
    left_two: undefined,
    right: Key.D,
    right_two: undefined,
  },
};

export interface ServiceConfiguration {
  leftJoystickAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
