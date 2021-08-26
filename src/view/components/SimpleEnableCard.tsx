import React from "react";
import { useRemoteValue } from "../../ipc";

import { Flex, Kbd, Spacer, Switch, Text } from "@chakra-ui/react";
import { Card } from "./general/Card";

export function SimpleEnableCard() {
  const [dmEnabled, setDmEnable] = useRemoteValue(
    "doubleMovementEnabled",
    false
  );

  function toggleDmEnabled() {
    const value = !dmEnabled;
    setDmEnable(value);
  }

  return (
    <Card p="6">
      <Flex direction="column" onClick={toggleDmEnabled} cursor="pointer">
        <Flex>
          <Text variant="heading">Enable Double Movement</Text>
          <Spacer />
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="yellow" isChecked={dmEnabled} as="div"></Switch>
        </Flex>
        <Text pt="6" fontSize="md" variant="body">
          Or use the hotkey <Kbd>Ctrl</Kbd>+<Kbd>P</Kbd> to toggle double
          movement.
          <br />
          <br />
          You need to configure two things in Fortnite:
          <br />
          1. Disable WASD keyboard movement bindings
          <br />
          2. Lock input method as mouse
        </Text>
      </Flex>
    </Card>
  );
}
