import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ExpandedIndex,
  Flex,
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
import React from "react";
import { bigWindowSize, smallWindowSize } from "../../common";
import { RemoteStore, setWindowSize, useRemoteValue } from "../../ipc";
import { KeyBindControl } from "./settings/key-bind/KeyBindControl";
import { AngleControl } from "./settings/angle/AngleControl";
import { Card } from "./card/Card";
import { defaultLeftJoystickSingleKeyStrafingAngles } from "../../native/types";


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

  const [isAdvancedStrafeOn, setIsAdvancedStrafeOn] = useRemoteValue("isAdvancedStrafeOn", false);

  function toggleEnabled() {
    const value = !isAdvancedStrafeOn;
    setIsAdvancedStrafeOn(value)
  }

  const leftJoystickValues = useRemoteValue("leftJoystickStrafingAngles", defaultLeftJoystickSingleKeyStrafingAngles);
  const leftJoystickSingleKeyStrafingValues = useRemoteValue("leftJoystickSingleKeyStrafingAngles", defaultLeftJoystickSingleKeyStrafingAngles);

  const minTabHeight = "180px";

  return (
    <Card p="2">
      <Accordion allowToggle={true} onChange={updateWindowSize}>
        <AccordionItem border="none">

          <AccordionButton _hover={{ bg: "none" }}>
            <Text variant="heading" flex="1" textAlign="left">
              Advanced mode
            </Text>
            <AccordionIcon/>
          </AccordionButton>

          <AccordionPanel pb={4}>
            <Tabs variant="soft-rounded" colorScheme="yellow">
              <TabList>
                <Tab mr={3}>Keybinds</Tab>
                <Tab>Strafing</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack align="baseline" spacing="2" minHeight={minTabHeight}>
                    <KeyBindControl/>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack align="baseline" spacing="2" minHeight={minTabHeight}>
                    <AngleControl
                      remoteValue={leftJoystickValues}
                      min={15}
                      max={72}
                    >
                      <Text variant="heading">Strafe angle</Text>
                    </AngleControl>
                    <Flex direction="column" onClick={toggleEnabled} cursor="pointer" pt="6" width="100%">
                      <Flex>
                        <Text variant="heading"> Enable Single Key Strafing </Text>
                        <Spacer/>
                        {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
                        <Switch colorScheme="yellow" isChecked={isAdvancedStrafeOn} as="div"></Switch>
                      </Flex>
                    </Flex>
                    {
                      isAdvancedStrafeOn &&
                      <AngleControl
                        remoteValue={leftJoystickSingleKeyStrafingValues}
                        min={15}
                        max={90}
                      >
                      </AngleControl>
                    }
                  </VStack>
                </TabPanel>

              </TabPanels>
            </Tabs>

            <VStack align="baseline" spacing="2">
              <Link as={Text}
                    variant="body"
                    fontSize="sm"
                    onClick={setDefaultSettings}>
                Reset settings to Wooting recommended
              </Link>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
