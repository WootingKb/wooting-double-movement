import { Flex, HStack, Text, VStack } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { JoystickKeyMapping, KeyMapping } from "../../../../native/types";
import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { KeyBindEditor } from "./KeyBindEditor";

interface KeyBindControlProps {
  KeyMappingRemoteValue: [
    keyMapping: KeyMapping,
    setKeyMapping: (value: KeyMapping) => void
  ];
}

export function KeyBindControl(props: KeyBindControlProps) {
  const { KeyMappingRemoteValue } = props;
  const [keyMapping, setKeyMapping] = KeyMappingRemoteValue;

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
        keyMapping.leftJoystick[
          existingKey as keyof JoystickKeyMapping
        ] = undefined;
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
          <KeyBindEditor
            keybind={"up"}
            isEditing={editingState === "up"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.up}
          />
          <KeyBindEditor
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
          <KeyBindEditor
            keybind={"left"}
            isEditing={editingState === "left"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.left}
          />
          <KeyBindEditor
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
          <KeyBindEditor
            keybind={"down"}
            isEditing={editingState === "down"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.down}
          />
          <KeyBindEditor
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
          <KeyBindEditor
            keybind={"right"}
            isEditing={editingState === "right"}
            requestEdit={requestEdit}
            mr={1}
            flex={1}
            value={keyMapping.leftJoystick.right}
          />
          <KeyBindEditor
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
