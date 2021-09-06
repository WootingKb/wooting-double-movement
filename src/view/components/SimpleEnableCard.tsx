import React from "react";
import { useRemoteValue } from "../../ipc";

import { Flex, Heading, Kbd, Spacer, Switch, Text } from "@chakra-ui/react";
import { Card } from "./general/Card";
import { defaultToggleAccelerator } from "../../native/types";
import { PrettyAcceleratorName } from "../../accelerator";

export function SimpleEnableCard() {
  const [toggleAccelerator, _] = useRemoteValue(
    "enabledToggleAccelerator",
    defaultToggleAccelerator
  );
  const toggleAcceleratorPretty = PrettyAcceleratorName(
    "display",
    toggleAccelerator
  ).split("+");

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
          <Heading>Enable Double Movement</Heading>
          <Spacer />
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="accent" isChecked={dmEnabled} as="div"></Switch>
        </Flex>
        <Text pt="6" fontSize="md">
          Or use the hotkey{" "}
          {toggleAcceleratorPretty
            .map((t) => <Kbd>{t}</Kbd>)
            .reduce((prev, current) => (
              <>
                {prev}+{current}
              </>
            ))}{" "}
          to toggle double movement. (Configurable under Advanced mode)
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
