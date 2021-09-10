import { Kbd } from "@chakra-ui/react";
import React from "react";
import { Key } from "ts-keycode-enum";

export function keybindDisplay(keyOne: number | undefined, fallback: string) {
  return <Kbd>{keyOne === undefined ? fallback : Key[keyOne]}</Kbd>;
}
