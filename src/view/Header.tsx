import React from "react";
import {
  Flex,
  Spacer,
  Icon,
  IconButton,
  Center,
  Button,
  useColorMode,
  color,
  useColorModeValue,
} from "@chakra-ui/react";
import { MinusIcon, CloseIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { ipcRenderer } from "electron";

declare module "react" {
  interface CSSProperties {
    WebkitAppRegion?: "drag" | "no-drag";
  }
}

export function Header() {
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
        <IconButton
          variant="ghost"
          aria-label="Color Mode"
          onClick={toggleColorMode}
          icon={
            colorMode === "light" ? (
              <MoonIcon />
            ) : (
              <Icon viewBox="0 0 250 250" color={logoColour} w={4} h={4}>
                <path
                  fill="currentColor"
                  d="M125,64.8c-33.2,0-60.2,27-60.2,60.2s27,60.2,60.2,60.2c33.2,0,60.2-27,60.2-60.2S158.2,64.8,125,64.8z"
                />
                <g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M125,47.1c-6.5,0-11.7-5.3-11.7-11.7V16.6c0-6.5,5.3-11.7,11.7-11.7s11.7,5.3,11.7,11.7v18.8
                    C136.7,41.9,131.5,47.1,125,47.1z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M125,202.9c-6.5,0-11.7,5.3-11.7,11.7v18.8c0,6.5,5.3,11.7,11.7,11.7s11.7-5.3,11.7-11.7v-18.8
                    C136.7,208.1,131.5,202.9,125,202.9z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M180.1,69.9c-4.6-4.6-4.6-12,0-16.6l13.3-13.3c4.6-4.6,12-4.6,16.6,0c4.6,4.6,4.6,12,0,16.6l-13.3,13.3
                    C192.1,74.5,184.6,74.5,180.1,69.9z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M69.9,180.1c-4.6-4.6-12-4.6-16.6,0l-13.3,13.3c-4.6,4.6-4.6,12,0,16.6c4.6,4.6,12,4.6,16.6,0l13.3-13.3
                    C74.5,192.1,74.5,184.6,69.9,180.1z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M202.9,125c0-6.5,5.3-11.7,11.7-11.7h18.8c6.5,0,11.7,5.3,11.7,11.7s-5.3,11.7-11.7,11.7h-18.8
                    C208.1,136.7,202.9,131.5,202.9,125z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M47.1,125c0-6.5-5.3-11.7-11.7-11.7H16.6c-6.5,0-11.7,5.3-11.7,11.7s5.3,11.7,11.7,11.7h18.8
                    C41.9,136.7,47.1,131.5,47.1,125z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M180.1,180.1c4.6-4.6,12-4.6,16.6,0l13.3,13.3c4.6,4.6,4.6,12,0,16.6c-4.6,4.6-12,4.6-16.6,0l-13.3-13.3
                    C175.5,192.1,175.5,184.6,180.1,180.1z"
                    />
                  </g>
                  <g>
                    <path
                      fill="currentColor"
                      d="M69.9,69.9c4.6-4.6,4.6-12,0-16.6L56.7,40.1c-4.6-4.6-12-4.6-16.6,0c-4.6,4.6-4.6,12,0,16.6l13.3,13.3
                    C57.9,74.5,65.4,74.5,69.9,69.9z"
                    />
                  </g>
                </g>
              </Icon>
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
