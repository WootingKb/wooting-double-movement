import { useRemoteValue } from "../../../../ipc";
import { defaultJoystickAngles, JoystickAngleConfiguration } from "../../../../native/types";
import { ComponentDefaultProps, Text } from "@chakra-ui/react";
import React from "react";
import { AngleSlider } from "./AngleSlider";
import { AppSettings } from "../../../../common";

interface AngleControlProps {
  min: number;
  max: number;
  remoteValue: [angle: JoystickAngleConfiguration, setAngle: (value: JoystickAngleConfiguration) => void];
  label: string;
}

export function AngleControl(props: AngleControlProps) {
  const {min, max, remoteValue} = props;
  const [leftJoystickAngles, setLeftJoystickAngles] = remoteValue;

  return (
    <>
      <Text variant="heading">{props.label}</Text>
      <AngleSlider
        value={leftJoystickAngles.rightUpAngle}
        valueChanged={(value) =>
          setLeftJoystickAngles({...leftJoystickAngles, rightUpAngle: value})
        }
        min={min / 90}
        max={max / 90}
      />
    </>
  );
}
