import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import {
  defaultKeyMapping,
  JoystickKeyMapping,
  KeyMapping,
} from "../../../../native/types";
import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
} from "@chakra-ui/icons";
import { KeyBindEditor } from "./KeyBindEditor";
import { useRemoteValue } from "../../../../ipc";

interface KeyBindControlProps {
  KeyMappingRemoteValue: [
    keyMapping: KeyMapping,
    setKeyMapping: (value: KeyMapping) => void
  ];
}

export function KeyBindControl(props: KeyBindControlProps) {
  const { KeyMappingRemoteValue } = props;
  const [keyMapping, setKeyMapping] = KeyMappingRemoteValue;

  function assignNewJoystickBind(
    key: keyof JoystickKeyMapping,
    value?: number
  ) {
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
            <ArrowUpIcon color={iconColor} />
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <KeyBindEditor
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.up}
            valueChanged={(value) => assignNewJoystickBind("up", value)}
          />
          <KeyBindEditor
            flex={1}
            value={keyMapping.leftJoystick.up_two}
            valueChanged={(value) => assignNewJoystickBind("up_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowDownIcon color={iconColor} />
            <Text width="100px" variant="body">
              Back
            </Text>
          </HStack>
          <KeyBindEditor
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.down}
            valueChanged={(value) => assignNewJoystickBind("down", value)}
          />
          <KeyBindEditor
            flex={1}
            value={keyMapping.leftJoystick.down_two}
            valueChanged={(value) => assignNewJoystickBind("down_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowBackIcon color={iconColor} />
            <Text width="100px" variant="body">
              Left
            </Text>
          </HStack>
          <KeyBindEditor
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.left}
            valueChanged={(value) => assignNewJoystickBind("left", value)}
          />
          <KeyBindEditor
            flex={1}
            value={keyMapping.leftJoystick.left_two}
            valueChanged={(value) => assignNewJoystickBind("left_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowForwardIcon color={iconColor} />
            <Text width="100px" variant="body">
              Right
            </Text>
          </HStack>
          <KeyBindEditor
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.right}
            valueChanged={(value) => assignNewJoystickBind("right", value)}
          />
          <KeyBindEditor
            flex={1}
            value={keyMapping.leftJoystick.right_two}
            valueChanged={(value) => assignNewJoystickBind("right_two", value)}
          />
        </Flex>
      </VStack>
    </>
  );
}
