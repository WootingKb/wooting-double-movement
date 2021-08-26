import { JoystickAngleConfiguration } from "../../../../native/types";
import React from "react";
import { AngleSlider } from "./AngleSlider";
import { Text } from "@chakra-ui/react";

interface AngleControlProps {
  min: number;
  max: number;
  angle: number;
  setAngle: (value: number) => void;
}

export function AngleControl(props: AngleControlProps) {
  const { min, max, angle, setAngle } = props;

  return (
    <AngleSlider
      value={angle}
      valueChanged={setAngle}
      min={min / 90}
      max={max / 90}
    />
  );
}
