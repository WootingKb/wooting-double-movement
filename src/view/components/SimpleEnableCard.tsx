import React from "react";
import { useRemoteValue, useSDKState } from "../../ipc";
import {
  Flex,
  Heading,
  HStack,
  Icon,
  Kbd,
  Spacer,
  Switch,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { Card } from "./general/Card";
import { PrettyAcceleratorName } from "../../accelerator";
import { WarningTwoIcon } from "@chakra-ui/icons";

export function SimpleEnableCard() {
  const [toggleAccelerator, _] = useRemoteValue("enabledToggleAccelerator");
  const toggleAcceleratorPretty = PrettyAcceleratorName(
    "display",
    toggleAccelerator
  ).split("+");
  const hasToggleHotkey = toggleAccelerator.length > 0;

  const [dmEnabled, setDmEnable] = useRemoteValue("doubleMovementEnabled");

  const [useAnalogInput, __] = useRemoteValue("useAnalogInput");
  const sdkState = useSDKState();
  const shouldWarnAnalog =
    dmEnabled && useAnalogInput && sdkState.type !== "DevicesConnected";

  function toggleDmEnabled() {
    const value = !dmEnabled;
    setDmEnable(value);
  }

  return (
    <Card p="6">
      <Flex direction="column" onClick={toggleDmEnabled} cursor="pointer">
        <HStack>
          <Heading>Enable Double Movement</Heading>
          <Spacer />
          {shouldWarnAnalog && (
            <Tooltip
              label="Something's wrong, analog input is enabled but there's no device connected. Check the 'Analog' tab"
              placement="left"
            >
              <Icon as={WarningTwoIcon} color="orange" />
            </Tooltip>
          )}
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="accent" isChecked={dmEnabled} as="div"></Switch>
        </HStack>
        <Text pt="6" fontSize="md">
          {hasToggleHotkey ? (
            <>
              Or use the hotkey{" "}
              {toggleAcceleratorPretty
                .map((t) => <Kbd>{t}</Kbd>)
                .reduce((prev, current) => (
                  <>
                    {prev}+{current}
                  </>
                ))}{" "}
              to toggle double movement. (Configurable under Advanced mode)
            </>
          ) : (
            <>
              Or bind the Toggle hotkey under Advanced mode to be able to toggle
              double movement on the fly.
            </>
          )}
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
