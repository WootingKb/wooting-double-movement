import React from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";
import { UpdateToast } from "./UpdateToast";

export function MainWindow() {
  const bgBorder = useColorModeValue("#eeeeee", "#2b323b");
  const bg = useColorModeValue("#ffffff", "#1C2226");
  return (
    <Flex
      userSelect="none"
      h="100vh"
      direction="column"
      borderRadius="18px"
      borderWidth="2px"
      borderStyle="solid"
      borderColor={bgBorder}
      backgroundColor={bg}
      overflow="hidden"
    >
      <Header />
      <Box flex="auto">
        <Content />
      </Box>
      <Footer />
      <UpdateToast />
    </Flex>
  );
}
