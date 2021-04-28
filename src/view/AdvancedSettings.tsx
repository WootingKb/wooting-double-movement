import { ArrowBackIcon, ArrowDownIcon, ArrowForwardIcon, ArrowUpIcon, } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { bigWindowSize, smallWindowSize } from "../common";
import { defaultJoystickAngles, defaultKeyMapping, JoystickKeyMapping, } from "../native/types";
import { Key } from "ts-keycode-enum";
import { Card } from "./Components";
import { RemoteStore, setWindowSize, useRemoteValue } from "./ipc";

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
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowUpIcon color={iconColor}/>
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeyBind
            mr={1} flex={1}
            value={keyMapping.leftJoystick.up}
            valueChanged={(value) => assignNewJoystickBind("up", value)}
          />
          <EditKeyBind
            flex={1}
            value={keyMapping.leftJoystick.up_two}
            valueChanged={(value) => assignNewJoystickBind("up_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowDownIcon color={iconColor}/>
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeyBind
            mr={1} flex={1}
            value={keyMapping.leftJoystick.down}
            valueChanged={(value)=> assignNewJoystickBind("down", value)}
          />
          <EditKeyBind
            flex={1}
            value={keyMapping.leftJoystick.down_two}
            valueChanged={(value) => assignNewJoystickBind("down_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowBackIcon color={iconColor}/>
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeyBind
            mr={1} flex={1}
            value={keyMapping.leftJoystick.left}
            valueChanged={(value) => assignNewJoystickBind("left", value)}
          />
          <EditKeyBind
            flex={1}
            value={keyMapping.leftJoystick.left_two}
            valueChanged={(value) => assignNewJoystickBind("left_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowForwardIcon color={iconColor}/>
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeyBind
            mr={1} flex={1}
            value={keyMapping.leftJoystick.right}
            valueChanged={(value) => assignNewJoystickBind("right", value)}
          />
          <EditKeyBind
            flex={1}
            value={keyMapping.leftJoystick.right_two}
            valueChanged={(value) => assignNewJoystickBind("right_two", value)}
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
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
