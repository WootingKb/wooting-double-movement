import React, { useEffect, useState } from "react";
import { Switch, Text, Flex, Spacer } from "@chakra-ui/react";
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

  return (
    <Flex
      m="6"
      my="8"
      p="6"
      borderRadius="14"
      boxShadow="0px 6px 14px #D8DAE6;"
      direction="column"
      onClick={toggleDmEnabled}
      cursor="pointer"
    >
      <Flex>
        <Text fontWeight="bold" fontSize="md" color="#2B2B4C">
          Enable Double Movement
        </Text>
        <Spacer />
        {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
        <Switch colorScheme="yellow" isChecked={dmEnabled} as="div"></Switch>
      </Flex>
      <Text pt="6" fontSize="md" color="rgba(43, 43, 76, 0.33)">
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
