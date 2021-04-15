import React, { useEffect, useState } from "react";
import { RemoteStore, useRemoteValue } from "./ipc";

import {
  Box,
  Switch,
  Text,
  Flex,
  Spacer,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  SliderProps,
  useColorModeValue,
  Button,
  Input,
  InputProps,
  HStack,
} from "@chakra-ui/react";
import {
  defaultJoystickAngles,
  defaultKeyMapping,
  JoystickAngleConfiguration,
  JoystickKeyMapping,
} from "../native/types";
import { Key } from "ts-keycode-enum";

function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
  } & SliderProps
) {
  const { value, valueChanged, ...rest } = props;
  return (
    <Slider
      aria-label="slider-ex-1"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={valueChanged}
      {...rest}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb boxSize={8}>
        <Text size="xs">{(value * 90).toFixed(0)}°</Text>
      </SliderThumb>
    </Slider>
  );
}

function AngleControl() {
  const [joystickAngles, setJoystickAngles] = useRemoteValue(
    "leftJoystickAngles",
    defaultJoystickAngles
  );

  return (
    <>
      <Text>Right Up Diagonal</Text>
      <AngleSlider
        value={joystickAngles.rightUpAngle}
        valueChanged={(value) =>
          setJoystickAngles({ ...joystickAngles, rightUpAngle: value })
        }
      />
    </>
  );
}

export function EditKeyBind(
  props: {
    value: number;
    valueChanged: (value: number) => void;
  } & InputProps
) {
  const { value, valueChanged, ...rest } = props;
  const [isEditing, setIsEditing] = useState(false);

  function assignNewBind() {
    setIsEditing(true);
    window.addEventListener(
      "keydown",
      (event) => {
        console.log(event);
        props.valueChanged(event.keyCode);
        setIsEditing(false);
      },
      { once: true }
    );
  }
  // return <Button onClick={assignNewBind}>{Key[props.value]}</Button>;
  return (
    <Input
      value={!isEditing ? Key[props.value] : ""}
      onClick={assignNewBind}
      isReadOnly={true}
      placeholder="Press any key"
      size="sm"
      cursor="grab"
      {...rest}
    />
  );
}

export function KeyBinding() {
  const [keyMapping, setKeyMapping] = useRemoteValue(
    "keyMapping",
    defaultKeyMapping
  );

  // useEffect(() => {
  //   function cancelKeyEvent(e: KeyboardEvent) {
  //     console.log(e);
  //     // e.preventDefault();
  //   }

  //   window.addEventListener("keydown", cancelKeyEvent);

  //   return () => {
  //     window.removeEventListener("keydown", cancelKeyEvent);
  //   };
  // }, []);

  function assignNewJoystickBind(key: keyof JoystickKeyMapping, value: number) {
    setKeyMapping({
      ...keyMapping,
      leftJoystick: { ...keyMapping.leftJoystick, [key]: value },
    });
  }

  return (
    <>
      <HStack>
        <EditKeyBind
          value={keyMapping.leftJoystick.up}
          valueChanged={(value) => assignNewJoystickBind("up", value)}
        />
        <EditKeyBind
          value={keyMapping.leftJoystick.down}
          valueChanged={(value) => assignNewJoystickBind("down", value)}
        />
        <EditKeyBind
          value={keyMapping.leftJoystick.left}
          valueChanged={(value) => assignNewJoystickBind("left", value)}
        />
        <EditKeyBind
          value={keyMapping.leftJoystick.right}
          valueChanged={(value) => assignNewJoystickBind("right", value)}
        />
      </HStack>
    </>
  );
}

export function Content() {
  const [dmEnabled, _setDmEnabled] = useState(false);

  useEffect(() => {
    RemoteStore.doubleMovementEnabled().then((value) => {
      _setDmEnabled(value);
    });

    const unsubscribe = RemoteStore.onChange(
      "doubleMovementEnabled",
      (value) => {
        _setDmEnabled(value);
      }
    );

    return unsubscribe;
  }, []);

  function toggleDmEnabled() {
    const value = !dmEnabled;
    _setDmEnabled(value);
    RemoteStore.setDoubleMovementEnabled(value);
  }

  const shadowColour = useColorModeValue("#D8DAE6", "grey");

  return (
    <>
      <Flex
        m="6"
        my="8"
        p="6"
        borderRadius="14"
        boxShadow={`0px 6px 14px ${shadowColour};`}
        direction="column"
        onClick={toggleDmEnabled}
        cursor="pointer"
      >
        <Flex>
          <Text variant="heading">Enable Double Movement</Text>
          <Spacer />
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="yellow" isChecked={dmEnabled} as="div"></Switch>
        </Flex>
        <Text pt="6" fontSize="md" variant="body">
          Or use the hotkey Ctrl+Shift+X to toggle double movement.
          <br />
          <br />
          You need to configure two things in Fortnite:
          <br />
          1. Disable WASD keyboard movement bindings
          <br />
          2. Lock input method as mouse
        </Text>
      </Flex>
      {/* <AngleControl /> */}
      <KeyBinding />
    </>
  );
}
