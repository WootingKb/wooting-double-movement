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
  down: number;
  left: number;
  right: number;
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
  leftJoystickAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
