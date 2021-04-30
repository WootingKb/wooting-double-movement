import { JoystickAngleConfiguration } from "../../../../native/types";
import React from "react";
import { AngleSlider } from "./AngleSlider";

interface AngleControlProps {
  min: number;
  max: number;
  remoteValue: [
    angle: JoystickAngleConfiguration,
    setAngle: (value: JoystickAngleConfiguration) => void
  ];
  children: any;
}

export function AngleControl(props: AngleControlProps) {
  const { min, max, remoteValue } = props;
  const [leftJoystickAngles, setLeftJoystickAngles] = remoteValue;

  return (
    <>
      {props.children}
      <AngleSlider
        value={leftJoystickAngles.rightUpAngle}
        valueChanged={(value) =>
          setLeftJoystickAngles({ ...leftJoystickAngles, rightUpAngle: value })
        }
        min={min / 90}
        max={max / 90}
      />
    </>
  );
}
