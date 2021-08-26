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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spacer,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { bigWindowSize, smallWindowSize } from "../../common";
import { RemoteStore, setWindowSize, useRemoteValue } from "../../ipc";
import { KeyBindControl } from "./settings/key-bind/KeyBindControl";
import { AngleControl } from "./settings/angle/AngleControl";
import { Card } from "./card/Card";
import {
  defaultKeyMapping,
  defaultLeftJoystickSingleKeyStrafingAngles,
} from "../../native/types";
import { Key } from "ts-keycode-enum";
import { InfoOutlineIcon } from "@chakra-ui/icons";

function calcDisplay(keyOne: any, def: any) {
  return <Kbd>{keyOne === undefined ? def : Key[keyOne]}</Kbd>;
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

  function setDefaultBindSettings() {
    RemoteStore.resetBindSettings();
  }

  function setDefaultStrafingSettings() {
    RemoteStore.resetStrafingSettings();
  }

  const bg = useColorModeValue("white", "#1C2226");
  const iconColor = "yellow.500";

  const keyMappingRemoteValue = useRemoteValue("keyMapping", defaultKeyMapping);

  const [isAdvancedStrafeOn, setIsAdvancedStrafeOn] = useRemoteValue(
    "isAdvancedStrafeOn",
    false
  );
  const [keyMapping, setKeymapping] = keyMappingRemoteValue;

  function toggleEnabled() {
    const value = !isAdvancedStrafeOn;
    setIsAdvancedStrafeOn(value);
  }

  const leftJoystickValues = useRemoteValue(
    "leftJoystickStrafingAngles",
    defaultLeftJoystickSingleKeyStrafingAngles
  );
  const leftJoystickSingleKeyStrafingValues = useRemoteValue(
    "leftJoystickSingleKeyStrafingAngles",
    defaultLeftJoystickSingleKeyStrafingAngles
  );

  const minTabHeight = "210px";

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
            <Tabs variant="enclosed" colorScheme="yellow">
              <TabList>
                <Tab mr={3}>Keybinds</Tab>
                <Tab>Strafing</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack
                    align="baseline"
                    spacing="2"
                    minHeight={minTabHeight}
                    position="relative"
                  >
                    <KeyBindControl
                      KeyMappingRemoteValue={keyMappingRemoteValue}
                    />

                    <Link
                      position="absolute"
                      bottom="-10px"
                      as={Text}
                      variant="body"
                      fontSize="sm"
                      onClick={setDefaultBindSettings}
                    >
                      Reset keybinds to Wooting recommended
                    </Link>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack
                    align="baseline"
                    spacing="2"
                    minHeight={minTabHeight}
                    position="relative"
                  >
                    <AngleControl
                      remoteValue={leftJoystickValues}
                      min={15}
                      max={72}
                    >
                      <Flex>
                        <Text variant="heading">Strafe Angle</Text>
                        <Popover trigger="hover" placement="top">
                          <PopoverTrigger>
                            <InfoOutlineIcon
                              ml="7px"
                              mt="5px"
                              cursor="pointer"
                              color={iconColor}
                            />
                          </PopoverTrigger>
                          <PopoverContent backgroundColor={bg}>
                            <PopoverArrow backgroundColor={bg} />
                            <PopoverBody>
                              <Text pt="1" fontSize="sm" variant="body">
                                This option allows you to adjust the angle you
                                will strafe by pressing <Kbd>Left</Kbd>/
                                <Kbd>Right</Kbd> at the same time as{" "}
                                <Kbd>Forward</Kbd> (e.g.{" "}
                                {calcDisplay(keyMapping.leftJoystick.up, "W")}+
                                {calcDisplay(
                                  keyMapping.leftJoystick.right,
                                  "D"
                                )}
                                )
                              </Text>
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      </Flex>
                    </AngleControl>
                    <Flex
                      width="100%"
                      direction="column"
                      onClick={toggleEnabled}
                      cursor="pointer"
                      pt="6"
                    >
                      <Flex>
                        <Flex>
                          <Text variant="heading">
                            Enable Single Key Strafing
                          </Text>
                          <Popover trigger="hover" placement="top">
                            <PopoverTrigger>
                              <InfoOutlineIcon
                                ml="7px"
                                mt="5px"
                                cursor="pointer"
                                color={iconColor}
                              />
                            </PopoverTrigger>
                            <PopoverContent backgroundColor={bg}>
                              <PopoverArrow backgroundColor={bg} />
                              <PopoverBody>
                                <Text pt="1" fontSize="sm" variant="body">
                                  This option allows you to adjust the angle you
                                  will strafe by pressing just one of the{" "}
                                  <Kbd>Left</Kbd>/<Kbd>Right</Kbd> keys (e.g.{" "}
                                  {calcDisplay(
                                    keyMapping.leftJoystick.right,
                                    "D"
                                  )}
                                  )
                                </Text>
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Flex>
                        <Spacer />
                        {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
                        <Switch
                          colorScheme="yellow"
                          isChecked={isAdvancedStrafeOn}
                          as="div"
                        ></Switch>
                      </Flex>
                    </Flex>
                    {isAdvancedStrafeOn && (
                      <AngleControl
                        remoteValue={leftJoystickSingleKeyStrafingValues}
                        min={15}
                        max={90}
                        children={null}
                      />
                    )}
                    <Link
                      position="absolute"
                      bottom="-10px"
                      as={Text}
                      variant="body"
                      fontSize="sm"
                      onClick={setDefaultStrafingSettings}
                    >
                      Reset settings to Wooting recommended
                    </Link>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
