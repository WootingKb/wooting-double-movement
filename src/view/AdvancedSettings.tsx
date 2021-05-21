import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
  CloseIcon,
} from "@chakra-ui/icons";
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
import React, { useEffect, useState } from "react";
import { bigWindowSize, smallWindowSize } from "../common";
import {
  defaultJoystickAngles,
  defaultKeyMapping,
  JoystickKeyMapping,
} from "../native/types";
import { Key } from "ts-keycode-enum";
import { Card } from "./Components";
import { RemoteStore, setWindowSize, useRemoteValue } from "./ipc";

const strafeAngleRange: [number, number] = [15 / 90, 70 / 90];

function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const { value, valueChanged, min, max, ...rest } = props;
  const percentageValue = (((value - min) / (max - min)) * 100).toFixed(0);
  useEffect(() => {
    const inRangeValue = Math.max(Math.min(value, max), min);
    if (inRangeValue !== props.value) {
      valueChanged(inRangeValue);
    }
  }, [value, min, max, valueChanged]);

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
            valueChanged((value / 100) * (max - min) + min);
          }
        }}
        value={percentageValue + "%"}
        min={0}
        max={100}
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
  keybind: keyof JoystickKeyMapping;
  value?: number;
  requestEdit: (keybind: keyof JoystickKeyMapping) => void;
  isEditing: boolean;
}

export function EditKeyBind(props: EditKeybindProps & InputProps) {
  const { keybind, value, requestEdit, isEditing, ...rest } = props;

  return (
    <Input
      value={!isEditing ? (props.value ? Key[props.value] : "") : ""}
      onClick={() => {
        requestEdit(keybind);
      }}
      isReadOnly={true}
      placeholder={isEditing ? "Press any key" : "Click to set"}
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

  const editingStateState = useState<keyof JoystickKeyMapping>();
  const [editingState, setEditingState] = editingStateState;

  const requestEdit = (key: keyof JoystickKeyMapping) => {
    setEditingState(key);
  };

  const listener = (event: any) => {
    if (event.keyCode === 27) {
      setEditingState(undefined);
      return;
    }

    if (editingState !== undefined) {
      assignNewJoystickBind(
        editingState as keyof JoystickKeyMapping,
        event.keyCode
      );
      setEditingState(undefined);
    }
  };

  useEffect(() => {
    if (editingState) {
      window.addEventListener("keydown", listener, { once: true });

      // register blur event so we cancel the bind process when the tool gets out of focus
      window.addEventListener(
        "blur",
        () => {
          // unsubscribe to keydown event since bind process is already canceled by the blur event
          window.removeEventListener("keydown", listener);
          setEditingState(undefined);
        },
        {
          once: true,
        }
      );
    }

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [editingState]);

  function assignNewJoystickBind(
    newKey: keyof JoystickKeyMapping,
    value?: number
  ) {
    setEditingState(undefined);

    const isNewMainBind = !newKey.endsWith("two");

    // prevent duplicated bind per column
    Object.keys(keyMapping.leftJoystick).forEach((existingKey) => {
      const isMainBind = !existingKey.endsWith("two");

      // remove bindings which would conflict with the new one
      if (
        isMainBind === isNewMainBind &&
        keyMapping.leftJoystick[existingKey as keyof JoystickKeyMapping] ===
          value
      ) {
        keyMapping.leftJoystick[existingKey as keyof JoystickKeyMapping] =
          undefined;
      }
    });

    // set the new bind
    setKeyMapping({
      ...keyMapping,
      leftJoystick: { ...keyMapping.leftJoystick, [newKey]: value },
    });
  }

  function unbindRow(
    bind: keyof JoystickKeyMapping,
    bind_two: keyof JoystickKeyMapping
  ) {
    setEditingState(undefined);
    setKeyMapping({
      ...keyMapping,
      leftJoystick: {
        ...keyMapping.leftJoystick,
        [bind]: undefined,
        [bind_two]: undefined,
      },
    });
  }

  const iconColor = "yellow.500";

  return (
    <>
      <VStack align="left">
        <Text variant="heading">Key bindings</Text>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowUpIcon color={iconColor} />
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeyBind
            keybind={"up"}
            isEditing={editingState === "up"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.up}
          />
          <EditKeyBind
            keybind={"up_two"}
            isEditing={editingState === "up_two"}
            requestEdit={requestEdit}
            flex={1}
            value={keyMapping.leftJoystick.up_two}
          />
          <CloseIcon
            margin="8px 0 8px 16px"
            cursor="pointer"
            color={iconColor}
            onClick={() => unbindRow("up", "up_two")}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowBackIcon color={iconColor} />
            <Text width="100px" variant="body">
              Left
            </Text>
          </HStack>
          <EditKeyBind
            keybind={"left"}
            isEditing={editingState === "left"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.left}
          />
          <EditKeyBind
            keybind={"left_two"}
            isEditing={editingState === "left_two"}
            requestEdit={requestEdit}
            flex={1}
            value={keyMapping.leftJoystick.left_two}
          />
          <CloseIcon
            margin="8px 0 8px 16px"
            cursor="pointer"
            color={iconColor}
            onClick={() => unbindRow("left", "left_two")}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowDownIcon color={iconColor} />
            <Text width="100px" variant="body">
              Back
            </Text>
          </HStack>
          <EditKeyBind
            keybind={"down"}
            isEditing={editingState === "down"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.down}
          />
          <EditKeyBind
            keybind={"down_two"}
            isEditing={editingState === "down_two"}
            requestEdit={requestEdit}
            flex={1}
            value={keyMapping.leftJoystick.down_two}
          />
          <CloseIcon
            margin="8px 0 8px 16px"
            cursor="pointer"
            color={iconColor}
            onClick={() => unbindRow("down", "down_two")}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowForwardIcon color={iconColor} />
            <Text width="100px" variant="body">
              Right
            </Text>
          </HStack>
          <EditKeyBind
            keybind={"right"}
            isEditing={editingState === "right"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.right}
          />
          <EditKeyBind
            keybind={"right_two"}
            isEditing={editingState === "right_two"}
            requestEdit={requestEdit}
            flex={1}
            value={keyMapping.leftJoystick.right_two}
          />
          <CloseIcon
            margin="8px 0 8px 16px"
            cursor="pointer"
            color={iconColor}
            onClick={() => unbindRow("right", "right_two")}
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
