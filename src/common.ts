import { JoystickAngleConfiguration, KeyMapping } from "./native/types";

export interface AppSettings {
  doubleMovementEnabled: boolean;
  isAdvancedStrafeOn: boolean;
  leftJoystickStrafingAngles: JoystickAngleConfiguration;
  leftJoystickSingleKeyStrafingAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}

type Size = [width: number, height: number];

export const smallWindowSize: Size = [500, 510];
export const bigWindowSize: Size = [500, 810];
