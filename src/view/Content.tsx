import React, { useEffect, useState } from "react";
import {
  Switch,
  Text,
  Flex,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { RemoteStore } from "./ipc";

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
  );
}
