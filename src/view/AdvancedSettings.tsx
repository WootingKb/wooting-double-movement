import { ArrowBackIcon, ArrowDownIcon, ArrowForwardIcon, ArrowUpIcon, } from "@chakra-ui/icons";
import {
  Box,
  ExpandedIndex,
  Flex,
  HStack,
  Input,
  InputProps,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Spacer,
  StackProps,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { bigWindowSize, smallWindowSize } from "../common";
import { defaultJoystickAngles, defaultKeyMapping, JoystickKeyMapping, } from "../native/types";
import { Key } from "ts-keycode-enum";
import { Card } from "./Components";
import { RemoteStore, setWindowSize, useRemoteValue } from "./ipc";

const upLeftRightStrafeAngleRange: [number, number] = [15 / 90, 72 / 90];
const leftRightStrafeAngleRange: [number, number] = [15 / 90, 90 / 90];

function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const {value, valueChanged, min, max, ...rest} = props;
  const degreeValue = (value * 90).toFixed(0);

  return (
    <HStack align="stretch" width="100%">
      <Slider
        mr="20px"
        aria-label="slider-ex-1"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={valueChanged}
        {...rest}
      >
        <SliderTrack>
          <SliderFilledTrack backgroundColor="yellow.500"/>
        </SliderTrack>
        <SliderThumb _focus={{boxShadow: "base"}}/>
      </Slider>
      <NumberInput
        onChange={(_, value) => {
          if (!Number.isNaN(value)) {
            console.log(value);
            valueChanged(value / 90);
          }
        }}
        value={degreeValue + "°"}
        max={max * 90}
        min={min * 90}
        maxW="100px"
        size="sm"
        // allowMouseWheel
        focusInputOnChange={false}
      >
        <NumberInputField/>
        <NumberInputStepper>
          <NumberIncrementStepper/>
          <NumberDecrementStepper/>
        </NumberInputStepper>
      </NumberInput>
    </HStack>
  );
}

function UpLeftRightAngleControl() {
  const [joystickAngles, setJoystickAngles] = useRemoteValue(
    "leftJoystickAngles",
    defaultJoystickAngles
  );

  return (
    <>
      <Text variant="heading">Forward & Back + Left or Right Strafe Angle</Text>
      <AngleSlider
        value={joystickAngles.rightUpAngle}
        valueChanged={(value) =>
          setJoystickAngles({...joystickAngles, rightUpAngle: value})
        }
        min={upLeftRightStrafeAngleRange[0]}
        max={upLeftRightStrafeAngleRange[1]}
      />
    </>
  );
}


function LeftRightStrafeAngleControl() {
  const [joystickAngles, setJoystickAngles] = useRemoteValue(
    "leftJoystickAngles",
    defaultJoystickAngles
  );

  function toggleEnabled() {
    const value = !joystickAngles.isAdvancedStrafeOn;
    setJoystickAngles({...joystickAngles, isAdvancedStrafeOn: value})
  }

  return (
    <>
      <Flex direction="column" onClick={toggleEnabled} cursor="pointer" pt="6" width="100%">
        <Flex>
          <Text variant="heading">Separate Left & Right Strafe Angle</Text>
          <Spacer/>
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="yellow" isChecked={joystickAngles.isAdvancedStrafeOn} as="div"></Switch>
        </Flex>
      </Flex>
      {joystickAngles.isAdvancedStrafeOn &&
      <>
        {/*<Text variant="heading">Left or Right Strafe Angle</Text>*/}
        <AngleSlider
          value={joystickAngles.rightAngle}
          valueChanged={(value) =>
            setJoystickAngles({...joystickAngles, rightAngle: value})
          }
          min={leftRightStrafeAngleRange[0]}
          max={leftRightStrafeAngleRange[1]}
        />
        <Text pt="1" fontSize="sm" variant="body">
          Set a different angle to strafe with only Left & Right
        </Text>
      </>
      }
    </>
  );
}

interface EditKeybindProps {
  value: number;
  valueChanged: (value: number) => void;
}

export function EditKeyBind(props: EditKeybindProps & InputProps) {
  const {value, valueChanged, ...rest} = props;
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
      {once: true}
    );
  }

  return (
    <Input
      value={!isEditing ? Key[props.value] : ""}
      onClick={assignNewBind}
      isReadOnly={true}
      placeholder="Press any key"
      size="sm"
      cursor="pointer"
      {...rest}
    />
  );
}

interface EditKeybindRowProps {
  label: string | null;
  leftIcon: React.ReactFragment;
}

export function EditKeybindRow(
  props: EditKeybindRowProps & EditKeybindProps & StackProps
) {
  const {leftIcon, label, value, valueChanged, ...rest} = props;

  if (label !== null)
    return (
      <HStack {...rest} justifyContent="space-between">
        {leftIcon}
        <Text width="200px" variant="body">
          {label}
        </Text>
        <EditKeyBind value={value} valueChanged={valueChanged}/>
      </HStack>
    );
  else {
    return (
      <HStack {...rest} justifyContent="space-between">
        <EditKeyBind value={value} valueChanged={valueChanged}/>
      </HStack>
    );
  }
}

export function KeyBinding() {
  const [keyMapping, setKeyMapping] = useRemoteValue(
    "keyMapping",
    defaultKeyMapping
  );

  function assignNewJoystickBind(key: keyof JoystickKeyMapping, value: number) {
    setKeyMapping({
      ...keyMapping,
      leftJoystick: {...keyMapping.leftJoystick, [key]: value},
    });
  }

  const iconColor = "yellow.500";

  return (
    <>
      <VStack align="left">
        <Text variant="heading">Key bindings</Text>
        <Flex>
          <EditKeybindRow
            mr={1} flex={1}
            leftIcon={<ArrowUpIcon color={iconColor}/>}
            label="Forward"
            value={keyMapping.leftJoystick.up}
            valueChanged={(value: number) => assignNewJoystickBind("up", value)}
          />
          <EditKeybindRow
            flex={1}
            leftIcon={<ArrowUpIcon color={iconColor}/>}
            label={null}
            value={keyMapping.leftJoystick.up_two}
            valueChanged={(value: number) => assignNewJoystickBind("up_two", value)}
          />
        </Flex>
        <Flex>
          <EditKeybindRow
            mr={1} flex={1}
            leftIcon={<ArrowDownIcon color={iconColor}/>}
            label="Back"
            value={keyMapping.leftJoystick.down}
            valueChanged={(value: number) => assignNewJoystickBind("down", value)}
          />
          <EditKeybindRow
            flex={1}
            leftIcon={<ArrowDownIcon color={iconColor}/>}
            label={null}
            value={keyMapping.leftJoystick.down_two}
            valueChanged={(value: number) => assignNewJoystickBind("down_two", value)}
          />
        </Flex>
        <Flex>
          <EditKeybindRow
            mr={1} flex={1}
            leftIcon={<ArrowBackIcon color={iconColor}/>}
            label="Left"
            value={keyMapping.leftJoystick.left}
            valueChanged={(value: number) => assignNewJoystickBind("left", value)}
          />
          <EditKeybindRow
            flex={1}
            leftIcon={<ArrowBackIcon color={iconColor}/>}
            label={null}
            value={keyMapping.leftJoystick.left_two}
            valueChanged={(value: number) => assignNewJoystickBind("left_two", value)}
          />
        </Flex>
        <Flex>
          <EditKeybindRow
            mr={1} flex={1}
            leftIcon={<ArrowForwardIcon color={iconColor}/>}
            label="Right"
            value={keyMapping.leftJoystick.right}
            valueChanged={(value: number) => assignNewJoystickBind("right", value)}
          />
          <EditKeybindRow
            flex={1}
            leftIcon={<ArrowForwardIcon color={iconColor}/>}
            label={null}
            value={keyMapping.leftJoystick.right_two}
            valueChanged={(value: number) => assignNewJoystickBind("right_two", value)}
          />
        </Flex>
      </VStack>
    </>
  );
}

export function AdvancedSettingsCard() {
  function updateWindowSize(index: ExpandedIndex) {
    console.log("Accordian index: ", index);
    // If it's 0 the boi is expanded
    if (index == 0) {
      setWindowSize(...bigWindowSize);
    } else {
      setWindowSize(...smallWindowSize);
    }
  }

  function setDefaultSettings() {
    RemoteStore.resetSettings();
  }

  return (
    <>

      <Flex>
        <Box flex="1">
          <Card p="6">
            <VStack align="baseline" spacing="2">
              <KeyBinding/>
            </VStack>
          </Card>
        </Box>
        <Box flex="1">
          <Card p="6">
            <VStack align="baseline" spacing="2">
              <UpLeftRightAngleControl/>
              <LeftRightStrafeAngleControl/>
            </VStack>
          </Card>
          <Card p="6">
            <Link
              as={Text}
              variant="body"
              fontSize="sm"
              onClick={setDefaultSettings}
            >
              Reset settings to Wooting recommended
            </Link>
          </Card>
        </Box>
      </Flex>
    </>
  );
}
