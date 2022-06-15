import {
  Box,
  Center,
  Flex,
  Heading,
  Text,
  Icon,
  IconProps,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { ipcRenderer } from "electron";
import { useRemoteValue } from "ipc";
import { SDKState } from "native/types";
import React, { useState, useEffect, useCallback } from "react";
import { InfoTooltip } from "view/components/general/InfoTooltip";

interface JoystickProps {
  x: number;
  y: number;
  icon: (props: IconProps) => JSX.Element;
  size?: string;
  displaySquare?: boolean;
}

export const Joystick = React.memo(_Joystick);
function _Joystick(props: JoystickProps) {
  const size = props.size ? props.size : "100px";
  const showSquare = props.displaySquare ?? false;
  const borderColor = useColorModeValue("gray", "white");
  const axisColor = useColorModeValue("gray", "white");
  const JoystickIcon = props.icon;
  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        position: "relative",
      }}
    >
      <Box
        border="1px solid"
        borderColor={borderColor}
        borderRadius={showSquare ? undefined : "50%"}
        transition="border-radius 0.2s ease-out"
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="-webkit-fill-available"
        height="-webkit-fill-available"
      >
        <JoystickIcon
          color={borderColor}
          w="25%"
          h="25%"
          position="absolute"
          transform="translateX(-50%) translateY(-50%)"
          zIndex="1"
          left={`${((props.x + 1) / 2) * 100}%`}
          top={`${((props.y + 1) / 2) * 100}%`}
        />
      </Box>
      <svg
        height="100%"
        width="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        viewBox="0 0 100 100"
      >
        {/* These lines below make up the main axis */}
        <line
          x1="1%"
          y1="50%"
          x2="99%"
          y2="50%"
          style={{ stroke: axisColor, strokeWidth: 1 }}
        />
        <line
          x1="50%"
          y1="1%"
          x2="50%"
          y2="99%"
          style={{ stroke: axisColor, strokeWidth: 1 }}
        />

        {/* This circle is the dot in the middle that connects the line from the center to the moving circle */}
        <circle cx="50" cy="50" r="3" fill={borderColor} />
        {/* This line connects the central circle above to the moving circle */}
        <line
          x1="50%"
          y1="50%"
          x2={`${50 + 50 * props.x}%`}
          y2={`${50 + 50 * props.y}%`}
          style={{ stroke: borderColor, strokeWidth: 2 }}
        />
      </svg>
    </div>
  );
}

interface JoystickState {
  timestamp: number;
  x: number;
  y: number;
}
export function asyncSleep(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

const CircleIcon = (props: IconProps) => (
  <Icon viewBox="0 0 200 200" boxSize={4} color="white" {...props}>
    <path
      fill="currentColor"
      d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
    />
  </Icon>
);

export function JoystickTester({ sdkState }: { sdkState: SDKState }) {
  // index of the interface in the JoystickAPI
  const [joystickIndex, setJoystickIndex] = useState<number | null>(null);
  const hasJoystick = joystickIndex !== null;

  const [gamepadState, setGamepadState] = useState<JoystickState | null>(null);
  const [isEnabled, _] = useRemoteValue("doubleMovementEnabled");

  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    if (joystickIndex !== null) {
      timeout = setInterval(() => {
        const gamepads = Array.from(navigator.getGamepads());
        const gamepad = gamepads[joystickIndex];
        if (gamepad) {
          // We compare the timestamp as if no inputs have changed then the it won't update the object and the timestamp will be the same
          setGamepadState((current) => {
            if (!current || current.timestamp !== gamepad.timestamp) {
              return {
                timestamp: gamepad.timestamp,
                x: gamepad.axes[0],
                y: gamepad.axes[1],
              };
            } else return current;
          });
        } else {
          setGamepadState(null);
          setJoystickIndex(null);
        }
      }, 10);
    }
    return () => {
      if (timeout) clearInterval(timeout);
      setGamepadState(null);
    };
  }, [joystickIndex]);

  const startGamepadDetection = useCallback(async () => {
    if (!isEnabled) return;

    console.debug("BEGIN startGamepadDetection");
    setIsDetecting(true);
    ipcRenderer.send("start-gamepad-detection");
    setJoystickIndex(null);

    for (let i = 0; i < 10; i++) {
      const foundSlot = Array.from(navigator.getGamepads()).findIndex(
        (gamepad) => {
          if (gamepad) {
            const x = gamepad.axes[0];
            const y = gamepad.axes[1];
            if (
              gamepad.id.includes("Vendor: 054c Product: 05c4") &&
              Math.round(Math.abs(y) * 10) === 6
            ) {
              return true;
            }
          }
          return false;
        }
      );

      if (foundSlot >= 0) {
        setJoystickIndex(foundSlot);
        break;
      }

      await asyncSleep(50);
    }

    ipcRenderer.send("end-gamepad-detection");
    setIsDetecting(false);
    console.debug("END startGamepadDetection");
  }, [isEnabled]);

  useEffect(() => {
    if (joystickIndex === null && isEnabled) {
      startGamepadDetection();
    } else if (!isEnabled) {
      setJoystickIndex(null);
      setGamepadState(null);
    }
  }, [joystickIndex, isEnabled, startGamepadDetection]);

  useEffect(() => {
    async function gamepadConnectEvent(_: any) {
      if (joystickIndex === null && isEnabled && !isDetecting) {
        await startGamepadDetection();
      }
    }

    window.addEventListener("gamepadconnected", gamepadConnectEvent);

    return () => {
      window.removeEventListener("gamepadconnected", gamepadConnectEvent);
    };
  }, [joystickIndex, isEnabled, isDetecting, startGamepadDetection]);

  return (
    <>
      <Flex w="100%" pt="1em">
        <Heading>360 Movement tester</Heading>
        <InfoTooltip ml="7px" mt="2px">
          <Text pt="1" fontSize="sm">
            See a live preview of your 360 movement angle and
            sensitivity/detection range.
          </Text>
        </InfoTooltip>

        <Box margin="auto" boxSize="75px">
          {gamepadState ? (
            <Joystick
              x={gamepadState.x}
              y={gamepadState.y}
              icon={CircleIcon}
              size="100%"
            />
          ) : (
            <Center w="100%" h="100%">
              {/* Only show that it's loading if DM is enabled and there are devices connected. If not then you're not gonna get input here anyway */}
              {isEnabled && sdkState.type === "DevicesConnected" && <Spinner />}
            </Center>
          )}
        </Box>
      </Flex>
    </>
  );
}
