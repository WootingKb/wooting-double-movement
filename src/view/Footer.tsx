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
        <Tooltip label="Learn more about Wooting" hasArrow variant="accent">
          <Link href="https://wooting.io" isExternal variant="link">
            <Icon as={IoHome} />
          </Link>
        </Tooltip>
        <Tooltip label="Join the community" hasArrow variant="accent">
          <Link href="https://wooting.io/discord" isExternal variant="link">
            <Icon as={IoLogoDiscord} />
          </Link>
        </Tooltip>
        <Tooltip label="Talk with us" hasArrow variant="accent">
          <Link href="https://twitter.com/wootingkb" isExternal variant="link">
            <Icon as={IoLogoTwitter} />
          </Link>
        </Tooltip>
        <Tooltip
          label="It’s open source, check the code"
          hasArrow
          variant="accent"
        >
          <Link
            href="https://github.com/WootingKb/wooting-double-movement"
            isExternal
            variant="link"
          >
            <Icon as={IoLogoGithub} />
          </Link>
        </Tooltip>
        <Tooltip label="Problem? Solution here" hasArrow variant="accent">
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
