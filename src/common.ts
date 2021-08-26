import { ServiceConfiguration } from "./native/types";

export type AppSettings = {
  doubleMovementEnabled: boolean;
} & ServiceConfiguration;

type Size = [width: number, height: number];

export const smallWindowSize: Size = [500, 510];
export const bigWindowSize: Size = [500, 810];
