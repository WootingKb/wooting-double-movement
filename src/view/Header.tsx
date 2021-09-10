import React from "react";
import {
  Center,
  Flex,
  Icon,
  IconButton,
  Link,
  Spacer,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { BellIcon, CloseIcon, MinusIcon, MoonIcon } from "@chakra-ui/icons";
import { ipcRenderer } from "electron";
import { WootSunIcon } from "./WootSunIcon";
import { IoHelp } from "react-icons/io5";

declare module "react" {
  interface CSSProperties {
    WebkitAppRegion?: "drag" | "no-drag";
  }
}

export function Header(props: { openAnnouncements: () => void }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const logoColour = useColorModeValue("#191919", "white");

  return (
    <Flex
      justify="space-between"
      w="full"
      p="6"
      pb="0"
      style={{ WebkitAppRegion: "drag" }}
    >
      <Center>
        <Icon viewBox="0 0 250 155" color={logoColour} w={12} h={8}>
          <path
            fill="currentColor"
            d="M0,0.1v154.8h250V0.1H0z M228.7,134.7H21.3V20.3h207.4V134.7z"
          />
          <polygon
            fill="currentColor"
            points="195.3,112.5 206,44.7 176.6,44.7 171.3,83.1 141.2,83.1 141.2,44.7 110.9,44.7 110.9,83.1 78.7,83.1 
          73.4,44.7 44.1,44.7 54.7,112.5 	"
          />
        </Icon>
      </Center>
      <Spacer />
      <Flex style={{ WebkitAppRegion: "no-drag" }}>
        <Tooltip label="Problem? Solution here" hasArrow variant="accent">
          <Link
            href="https://github.com/WootingKb/wooting-double-movement/wiki/Troubleshooting"
            isExternal
          >
            <IconButton
              variant="ghost"
              aria-label="help"
              icon={<Icon as={IoHelp} />}
            />
          </Link>
        </Tooltip>

        {
          //@ts-ignore
          !DISABLE_ANNOUNCEMENTS && (
            <Tooltip
              label="View latest announcement!"
              hasArrow
              variant="accent"
            >
              <IconButton
                variant="ghost"
                aria-label="announcements"
                icon={<BellIcon />}
                onClick={props.openAnnouncements}
              />
            </Tooltip>
          )
        }
        <IconButton
          variant="ghost"
          aria-label="Color Mode"
          onClick={toggleColorMode}
          icon={
            colorMode === "light" ? (
              <MoonIcon />
            ) : (
              <WootSunIcon
                viewBox="0 0 250 250"
                color={logoColour}
                w={4}
                h={4}
              />
            )
          }
        />
        <IconButton
          aria-label="Minimise"
          onClick={() => ipcRenderer.send("windowMinimize")}
          icon={<MinusIcon />}
          variant="ghost"
        />
        <IconButton
          aria-label="Close"
          ml="1"
          onClick={() => ipcRenderer.send("windowClose")}
          icon={<CloseIcon />}
          variant="ghost"
        />
      </Flex>
    </Flex>
  );
}
