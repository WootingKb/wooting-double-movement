import { JoystickAngleConfiguration, KeyMapping } from "./native/types";
export interface AppSettings {
  doubleMovementEnabled: boolean;
  isAdvancedStrafeOn: boolean;
  leftJoystickAngles: JoystickAngleConfiguration;
  leftStrafeJoystickAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}

type Size = [width: number, height: number];

export const smallWindowSize: Size = [500, 820];
export const bigWindowSize: Size = [500, 820];
