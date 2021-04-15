import React, { useState } from "react";
import { Text, Flex, Spacer, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ipcRenderer } from "electron/renderer";

export function Footer() {
  const [version, setVersion] = useState("");

  ipcRenderer.invoke("getVersion").then(setVersion).catch(console.error);

  return (
    <Flex
      p="6"
      pt="0"
    >
      <Link
        color="rgba(43, 43, 76, 0.33)"
        fontSize="sm"
        href="https://wooting.io/double-movement"
        isExternal
      >
        More information
        <ExternalLinkIcon mx="2px" />
      </Link>
      <Spacer />
      <Text color="rgba(43, 43, 76, 0.33)" fontSize="sm">
        Version: {version}
      </Text>
    </Flex>
  );
}
