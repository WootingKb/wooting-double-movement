import React from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";

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
      <Header />
      <Box flex="auto">
        <Content />
      </Box>
      <Footer />
    </Flex>
  );
}
