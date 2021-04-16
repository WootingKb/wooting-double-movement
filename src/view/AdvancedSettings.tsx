import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
} from "@chakra-ui/icons";
import {
  SliderProps,
  InputProps,
  StackProps,
  ExpandedIndex,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Input,
  InputGroup,
  InputRightAddon,
  Link,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
  Switch,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { bigWindowSize, smallWindowSize } from "../common";
import {
  defaultJoystickAngles,
  defaultKeyMapping,
  JoystickKeyMapping,
} from "../native/types";
import { Key } from "ts-keycode-enum";
import { Card } from "./Components";
import { useRemoteValue, setWindowSize, RemoteStore } from "./ipc";
import { parse } from "path";

const strafeAngleRange: [number, number] = [15 / 90, 72 / 90];

function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const { value, valueChanged, min, max, ...rest } = props;
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
          <SliderFilledTrack backgroundColor="yellow.500" />
        </SliderTrack>
        <SliderThumb _focus={{ boxShadow: "base" }} />
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
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </HStack>
  );
}

function AngleControl() {
  const [joystickAngles, setJoystickAngles] = useRemoteValue(
    "leftJoystickAngles",
    defaultJoystickAngles
  );

  return (
    <>
      <Text variant="heading">Strafe angle</Text>
      <AngleSlider
        value={joystickAngles.rightUpAngle}
        valueChanged={(value) =>
          setJoystickAngles({ ...joystickAngles, rightUpAngle: value })
        }
        min={strafeAngleRange[0]}
        max={strafeAngleRange[1]}
      />
    </>
  );
}

interface EditKeybindProps {
  value: number;
  valueChanged: (value: number) => void;
}

export function EditKeyBind(props: EditKeybindProps & InputProps) {
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
  label: string;
  leftIcon: React.ReactFragment;
}

export function EditKeybindRow(
  props: EditKeybindRowProps & EditKeybindProps & StackProps
) {
  const { leftIcon, label, value, valueChanged, ...rest } = props;

  return (
    <HStack {...rest} justifyContent="space-between">
      {leftIcon}
      <Text width="200px" variant="body">
        {label}
      </Text>
      <EditKeyBind value={value} valueChanged={valueChanged} />
    </HStack>
  );
}

export function KeyBinding() {
  const [keyMapping, setKeyMapping] = useRemoteValue(
    "keyMapping",
    defaultKeyMapping
  );

  function assignNewJoystickBind(key: keyof JoystickKeyMapping, value: number) {
    setKeyMapping({
      ...keyMapping,
      leftJoystick: { ...keyMapping.leftJoystick, [key]: value },
    });
  }

  const iconColor = "yellow.500";

  return (
    <>
      <VStack align="left">
        <Text variant="heading">Key bindings</Text>
        <EditKeybindRow
          leftIcon={<ArrowUpIcon color={iconColor} />}
          label="Forward"
          value={keyMapping.leftJoystick.up}
          valueChanged={(value) => assignNewJoystickBind("up", value)}
        />
        <EditKeybindRow
          leftIcon={<ArrowDownIcon color={iconColor} />}
          label="Back"
          value={keyMapping.leftJoystick.down}
          valueChanged={(value) => assignNewJoystickBind("down", value)}
        />
        <EditKeybindRow
          leftIcon={<ArrowBackIcon color={iconColor} />}
          label="Left"
          value={keyMapping.leftJoystick.left}
          valueChanged={(value) => assignNewJoystickBind("left", value)}
        />
        <EditKeybindRow
          leftIcon={<ArrowForwardIcon color={iconColor} />}
          label="Right"
          value={keyMapping.leftJoystick.right}
          valueChanged={(value) => assignNewJoystickBind("right", value)}
        />
      </VStack>
    </>
  );
}

function StartOnBootSetting() {
  const [startOnBoot, setStartOnBoot] = useRemoteValue("startOnBoot", false);

  return (
    <HStack width="100%" justifyContent="space-between">
      <Text variant="heading" flex="1" textAlign="left">
        Start app on boot
      </Text>
      <Switch
        colorScheme="yellow"
        checked={startOnBoot}
        onChange={(_) => setStartOnBoot(!startOnBoot)}
      />
    </HStack>
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
    <Card p="2">
      <Accordion allowToggle={true} onChange={updateWindowSize}>
        <AccordionItem border="none">
          <AccordionButton _hover={{ bg: "none" }}>
            <Text variant="heading" flex="1" textAlign="left">
              Advanced mode
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack align="baseline" spacing="2">
              <KeyBinding />
              <AngleControl />
              <Link
                as={Text}
                variant="body"
                fontSize="sm"
                onClick={setDefaultSettings}
              >
                Reset settings to Wooting recommended
              </Link>
              <StartOnBootSetting />
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
