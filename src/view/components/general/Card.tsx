import { Box, BoxProps, useColorModeValue } from "@chakra-ui/react";
import React from "react";

export function Card(props: BoxProps) {
  const shadowColour = useColorModeValue("#D8DAE6", "#161616");
  const bg = useColorModeValue("white", "#1C2226");

  return (
    <Box
      backgroundColor={bg}
      // m="6"
      // my="8"
      borderRadius="14"
      boxShadow={`0px 6px 14px ${shadowColour};`}
      {...props}
    />
  );
}
