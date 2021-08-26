import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ExpandedIndex,
  Flex,
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
import React, { useCallback } from "react";
import { bigWindowSize, smallWindowSize } from "../../common";
import { RemoteStore, setWindowSize, useRemoteValue } from "../../ipc";
import { KeyBindControl } from "./settings/key-bind/KeyBindControl";
import { AngleControl } from "./settings/angle/AngleControl";
import { Card } from "./general/Card";
import {
  defaultKeyMapping,
  defaultLeftJoystickStrafingAngles,
} from "../../native/types";
import { Key } from "ts-keycode-enum";
import { InfoTooltip } from "./general/InfoTooltip";

const minTabHeight = "240px";
const strafeAngleRange: [number, number] = [45, 71];

function keybindDisplay(keyOne: number | undefined, fallback: string) {
  return <Kbd>{keyOne === undefined ? fallback : Key[keyOne]}</Kbd>;
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
        <Text variant="heading">Strafe Angle</Text>
        <InfoTooltip ml="7px" mt="5px">
          <Text pt="1" fontSize="sm" variant="body">
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
            <Text variant="heading">Enable Single Key Strafing</Text>
            <InfoTooltip ml="7px" mt="5px">
              <Text pt="1" fontSize="sm" variant="body">
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

export function AdvancedSettingsCard() {
  function updateWindowSize(index: ExpandedIndex) {
    // If it's 0 the boi is expanded
    if (index == 0) {
      setWindowSize(...bigWindowSize);
    } else {
      setWindowSize(...smallWindowSize);
    }
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
            <Tabs variant="enclosed" colorScheme="accent">
              <TabList>
                <Tab mr={3}>Keybinds</Tab>
                <Tab>Strafing</Tab>
              </TabList>

              <TabPanels height={minTabHeight}>
                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <KeyMappingTab />
                </TabPanel>

                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <StrafeAngleControl />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
