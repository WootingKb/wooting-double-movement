import { JoystickAngleConfiguration, KeyMapping } from "./native/types";
export interface AppSettings {
  doubleMovementEnabled: boolean;
  leftJoystickAngles: JoystickAngleConfiguration;
  keyMapping: KeyMapping;
}
