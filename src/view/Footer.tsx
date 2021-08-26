import React, { useState } from "react";
import { Flex, HStack, Icon, IconButton, Link, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ipcRenderer } from "electron/renderer";
import { IoHome, IoLogoDiscord, IoLogoTwitter } from "react-icons/io5";
import { useEffect } from "react";

export function Footer() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    ipcRenderer.invoke("getVersion").then(setVersion).catch(console.error);
  }, []);

  return (
    <Flex p="6" pt="0" justifyContent="space-between">
      <HStack>
        <Link
          href="https://wooting.io/double-movement"
          isExternal
          variant="link"
        >
          <Icon as={IoHome} />
        </Link>
        <Link href="https://wooting.io/discord" isExternal variant="link">
          <Icon as={IoLogoDiscord} />
        </Link>
        <Link href="https://twitter.com/wootingkb" isExternal variant="link">
          <Icon as={IoLogoTwitter} />
        </Link>
      </HStack>
      <Link
        as={Text}
        href="https://github.com/ViGEm"
        isExternal
        variant="link"
        fontSize="sm"
      >
        Powered by ViGEm
        <ExternalLinkIcon mx="2px" />
      </Link>
      <Text variant="body" fontSize="sm">
        Version: {version}
      </Text>
    </Flex>
  );
}
