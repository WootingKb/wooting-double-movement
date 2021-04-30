import { Key } from "ts-keycode-enum";

export interface JoystickAngleConfiguration {
  leftUpAngle: number;
  rightUpAngle: number;
}

export const defaultLeftJoystickSingleKeyStrafingAngles: JoystickAngleConfiguration = {
  leftUpAngle: 0.78,
  rightUpAngle: 0.78,
};
export const defaultLeftJoystickStrafingAngles: JoystickAngleConfiguration = {
  leftUpAngle: 0.67,
  rightUpAngle: 0.67,
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
  isAdvancedStrafeOn: boolean;
  leftJoystickStrafingAngles: JoystickAngleConfiguration;
  leftJoystickSingleKeyStrafingAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
