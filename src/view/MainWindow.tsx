import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { Header } from "./Header";
import { Content } from "./Content";
import { Footer } from "./Footer";

export function MainWindow() {
  return (
    <Flex userSelect="none" h="100vh" direction="column">
      <Header />
      <Box flex="auto" background="white">
        <Content />
      </Box>
      <Footer />
    </Flex>
  );
}
