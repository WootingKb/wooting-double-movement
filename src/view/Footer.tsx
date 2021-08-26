import React, { useState } from "react";
import {
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { ipcRenderer } from "electron/renderer";
import {
  IoHelp,
  IoHome,
  IoLogoDiscord,
  IoLogoGithub,
  IoLogoTwitter,
} from "react-icons/io5";
import { useEffect } from "react";

export function Footer() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    ipcRenderer.invoke("getVersion").then(setVersion).catch(console.error);
  }, []);

  return (
    <Flex p="6" pt="0" justifyContent="space-between" alignItems="center">
      <HStack>
        <Tooltip
          label="Wooting Double Movement homepage"
          hasArrow
          variant="accent"
        >
          <Link
            href="https://wooting.io/double-movement"
            isExternal
            variant="link"
          >
            <Icon as={IoHome} />
          </Link>
        </Tooltip>
        <Tooltip label="Wooting's Community Discord" hasArrow variant="accent">
          <Link href="https://wooting.io/discord" isExternal variant="link">
            <Icon as={IoLogoDiscord} />
          </Link>
        </Tooltip>
        <Tooltip label="Wooting's Twitter" hasArrow variant="accent">
          <Link href="https://twitter.com/wootingkb" isExternal variant="link">
            <Icon as={IoLogoTwitter} />
          </Link>
        </Tooltip>
        <Tooltip label="GitHub" hasArrow variant="accent">
          <Link
            href="https://github.com/WootingKb/wooting-double-movement"
            isExternal
            variant="link"
          >
            <Icon as={IoLogoGithub} />
          </Link>
        </Tooltip>
        <Tooltip label="Troubleshooting" hasArrow variant="accent">
          <Link
            href="https://github.com/WootingKb/wooting-double-movement/wiki/Troubleshooting"
            isExternal
            variant="link"
          >
            <Icon as={IoHelp} />
          </Link>
        </Tooltip>
      </HStack>
      <Link
        href="https://github.com/ViGEm"
        isExternal
        variant="link"
        fontSize="sm"
      >
        Powered by ViGEm
        <ExternalLinkIcon mx="2px" />
      </Link>
      <Link
        href={`https://github.com/WootingKb/wooting-double-movement/releases/tag/v${version}`}
        isExternal
        variant="link"
        fontSize="sm"
      >
        Version: {version}
      </Link>
    </Flex>
  );
}
