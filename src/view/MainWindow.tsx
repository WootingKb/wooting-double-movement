import React from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { Header } from "./Header";
import { SimpleEnableCard } from "./components/SimpleEnableCard";
import { Footer } from "./Footer";
import { UpdateToast } from "./UpdateToast";
import { AdvancedSettingsCard } from "./components/AdvancedSettings";

export function MainWindow() {
  const bg = useColorModeValue("white", "#1C2226");
  return (
    <Flex
      userSelect="none"
      h="100vh"
      direction="column"
      borderRadius="18px"
      backgroundColor={bg}
      overflow="hidden"
    >
      <Header/>
      <Box flex="auto">
        <SimpleEnableCard/>
        <AdvancedSettingsCard/>
      </Box>
      <Footer/>
      <UpdateToast/>
    </Flex>
  );
}
