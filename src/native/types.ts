import { Key } from "ts-keycode-enum";

export interface JoystickAngleConfiguration {
  upDiagonalAngle: number;
  useLeftRightAngle: boolean;
  leftRightAngle: number;
}

export const defaultLeftJoystickStrafingAngles: JoystickAngleConfiguration = {
  upDiagonalAngle: 0.67,
  useLeftRightAngle: false,
  leftRightAngle: 0.78,
};

export interface JoystickKeyMapping {
  up?: number;
  up_two?: number;
  down?: number;
  down_two?: number;
  left?: number;
  left_two?: number;
  right?: number;
  right_two?: number;
}

export interface KeyMapping {
  leftJoystick: JoystickKeyMapping;
}

export const defaultKeyMapping: KeyMapping = {
  leftJoystick: {
    up: Key.W,
    down: Key.S,
    left: Key.A,
    right: Key.D,
  },
};

export interface ServiceConfiguration {
  leftJoystickStrafingAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
