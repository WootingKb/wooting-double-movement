import { Key } from "ts-keycode-enum";

export interface JoystickAngleConfiguration {
  leftUpAngle: number;
  rightUpAngle: number;
  leftAngle: number;
  rightAngle: number;
  isAdvancedStrafeOn: boolean;
}

export const defaultJoystickAngles: JoystickAngleConfiguration = {
  leftUpAngle: 0.67,
  rightUpAngle: 0.67,
  leftAngle: 0.67,
  rightAngle: 0.67,
  isAdvancedStrafeOn: false,
};

export interface JoystickKeyMapping {
  up: number;
  up_two: number;
  down: number;
  down_two: number;
  left: number;
  left_two: number;
  right: number;
  right_two: number;
}

export interface KeyMapping {
  leftJoystick: JoystickKeyMapping;
}

export const defaultKeyMapping: KeyMapping = {
  leftJoystick: {
    up: Key.W,
    up_two: Key.W,
    down: Key.S,
    down_two: Key.S,
    left: Key.A,
    left_two: Key.A,
    right: Key.D,
    right_two: Key.D
  },
};

export interface ServiceConfiguration {
  leftJoystickAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
