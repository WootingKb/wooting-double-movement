import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ExpandedIndex,
  Flex,
  Heading,
  HStack,
  Input,
  Kbd,
  Link,
  Spacer,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { RemoteStore, useRemoteValue } from "../../ipc";
import { KeyBindControl } from "./settings/key-bind/KeyBindControl";
import { AngleControl } from "./settings/angle/AngleControl";
import { Card } from "./general/Card";
import {
  defaultKeyMapping,
  defaultLeftJoystickStrafingAngles,
  defaultToggleAccelerator,
} from "../../native/types";
import { Key } from "ts-keycode-enum";
import { InfoTooltip } from "./general/InfoTooltip";
import {
  AcceleratorModifiers,
  isKeycodeValidForAccelerator,
  PrettyAcceleratorName,
} from "../../accelerator";
import { AcceleratorEditor } from "./settings/accelerator";

const minTabHeight = "240px";
const strafeAngleRange: [number, number] = [45, 71];

function keybindDisplay(keyOne: number | undefined, fallback: string) {
  return <Kbd>{keyOne === undefined ? fallback : Key[keyOne]}</Kbd>;
}

function AppSettingsTab() {
  const [toggleAccelerator, setToggleAccelerator] = useRemoteValue(
    "enabledToggleAccelerator",
    defaultToggleAccelerator
  );

  function resetToDefault() {
    setToggleAccelerator(defaultToggleAccelerator);
  }

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <HStack w="100%">
        <Text w="fit-content" whiteSpace="nowrap">
          Toggle Hotkey
        </Text>
        <InfoTooltip>
          <Text pt="1" fontSize="sm">
            This allows you to configure the hotkey that toggles if Double
            Movement is active. Just click on the box and press the key combo
            you'd like to use
          </Text>
        </InfoTooltip>
        <AcceleratorEditor
          acceleratorValue={toggleAccelerator}
          onAcceleratorChange={setToggleAccelerator}
        />
      </HStack>

      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={resetToDefault}
      >
        Reset to Wooting recommended
      </Link>
    </VStack>
  );
}

function KeyMappingTab() {
  const [keyMapping, setKeyMapping] = useRemoteValue(
    "keyMapping",
    defaultKeyMapping
  );

  function setDefaultBindSettings() {
    RemoteStore.resetBindSettings();
  }

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <KeyBindControl keyMapping={keyMapping} setKeyMapping={setKeyMapping} />

      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={setDefaultBindSettings}
      >
        Reset keybinds to Wooting recommended
      </Link>
    </VStack>
  );
}

function StrafeAngleControl() {
  const [keyMapping, _] = useRemoteValue("keyMapping", defaultKeyMapping);

  function setDefaultStrafingSettings() {
    RemoteStore.resetStrafingSettings();
  }

  const [angleConfig, setAngleConfig] = useRemoteValue(
    "leftJoystickStrafingAngles",
    defaultLeftJoystickStrafingAngles
  );

  const isAdvancedStrafeOn = angleConfig.useLeftRightAngle;

  const toggleEnabled = useCallback(() => {
    const value = !angleConfig.useLeftRightAngle;
    setAngleConfig({ ...angleConfig, useLeftRightAngle: value });
  }, [angleConfig]);

  const setDiagonalAngle = useCallback(
    (angle) => setAngleConfig({ ...angleConfig, upDiagonalAngle: angle }),
    [angleConfig]
  );

  const setLeftRightAngle = useCallback(
    (angle) => setAngleConfig({ ...angleConfig, leftRightAngle: angle }),
    [angleConfig]
  );

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <Flex>
        <Heading>Strafe Angle</Heading>
        <InfoTooltip ml="7px" mt="2px">
          <Text pt="1" fontSize="sm">
            This option allows you to adjust the angle you will strafe by
            pressing <Kbd>Left</Kbd>/<Kbd>Right</Kbd> at the same time as{" "}
            <Kbd>Forward</Kbd> (e.g.{" "}
            {keybindDisplay(keyMapping.leftJoystick.up, "W")}+
            {keybindDisplay(keyMapping.leftJoystick.right, "D")})
          </Text>
        </InfoTooltip>
      </Flex>
      <AngleControl
        angle={angleConfig.upDiagonalAngle}
        setAngle={setDiagonalAngle}
        min={strafeAngleRange[0]}
        max={strafeAngleRange[1]}
      />

      <Flex
        width="100%"
        direction="column"
        onClick={toggleEnabled}
        cursor="pointer"
        pt="6"
      >
        <Flex>
          <Flex>
            <Heading>Enable Single Key Strafing</Heading>
            <InfoTooltip ml="7px" mt="2px">
              <Text pt="1" fontSize="sm">
                This option allows you to adjust the angle you will strafe by
                pressing just one of the <Kbd>Left</Kbd>/<Kbd>Right</Kbd> keys
                (e.g. {keybindDisplay(keyMapping.leftJoystick.right, "D")})
              </Text>
            </InfoTooltip>
          </Flex>
          <Spacer />
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch
            colorScheme="accent"
            isChecked={isAdvancedStrafeOn}
            as="div"
          ></Switch>
        </Flex>
      </Flex>
      {isAdvancedStrafeOn && (
        <AngleControl
          angle={angleConfig.leftRightAngle}
          setAngle={setLeftRightAngle}
          min={15}
          max={90}
        />
      )}
      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={setDefaultStrafingSettings}
      >
        Reset settings to Wooting recommended
      </Link>
    </VStack>
  );
}

export function AdvancedSettingsCard(props: {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}) {
  function updateWindowSize(index: ExpandedIndex) {
    props.setIsExpanded(index == 0);
  }

  return (
    <Card p="2">
      <Accordion allowToggle={true} onChange={updateWindowSize}>
        <AccordionItem border="none">
          <AccordionButton _hover={{ bg: "none" }}>
            <Heading flex="1" textAlign="left">
              Advanced mode
            </Heading>
            <AccordionIcon />
          </AccordionButton>

          <AccordionPanel pb={4}>
            <Tabs variant="enclosed" colorScheme="accent" isLazy>
              <TabList>
                <Tab mr={3}>Keybinds</Tab>
                <Tab>Strafing</Tab>
                <Tab>App</Tab>
              </TabList>

              <TabPanels height={minTabHeight}>
                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <KeyMappingTab />
                </TabPanel>

                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <StrafeAngleControl />
                </TabPanel>

                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <AppSettingsTab />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
