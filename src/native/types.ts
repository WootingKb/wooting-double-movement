import { Key } from "ts-keycode-enum";

export interface JoystickAngleConfiguration {
  upDiagonalAngle: number;
  useLeftRightAngle: boolean;
  leftRightAngle: number;
}

export const defaultLeftJoystickStrafingAngles: JoystickAngleConfiguration = {
  upDiagonalAngle: 0.6473,
  useLeftRightAngle: true,
  leftRightAngle: 0.7888,
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

export const defaultToggleAccelerator = [Key.Ctrl, Key.P];

export interface ServiceConfiguration {
  leftJoystickStrafingAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
