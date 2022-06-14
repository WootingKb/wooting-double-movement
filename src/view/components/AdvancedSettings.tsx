import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  ExpandedIndex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React from "react";
import { Card } from "./general/Card";
import { AppSettingsTab } from "./AdvancedTabs/AppSettings";
import { StrafeAngleControl } from "./AdvancedTabs/StrafeSettings";
import { KeyMappingTab } from "./AdvancedTabs/KeyMapping";
import { AnalogSettingsTab } from "./AdvancedTabs/Analog";

const minTabHeight = "240px";

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
                <Tab>360 Movement</Tab>
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
                <TabPanel height="100%" px="4" pt="4" pb="0">
                  <AnalogSettingsTab />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
