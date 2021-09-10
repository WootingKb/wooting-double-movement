import {
  VStack,
  Flex,
  Heading,
  Kbd,
  Spacer,
  Switch,
  Link,
  Text,
} from "@chakra-ui/react";
import { useRemoteValue, RemoteStore } from "ipc";
import {
  defaultKeyMapping,
  defaultLeftJoystickStrafingAngles,
} from "native/types";
import React, { useCallback } from "react";
import { InfoTooltip } from "../general/InfoTooltip";
import { AngleControl } from "../settings/angle/AngleControl";
import { keybindDisplay } from "./Utils";

const strafeAngleRange: [number, number] = [45, 71];
const singleKeyStrafeAngleRange: [number, number] = [45, 71];

export function StrafeAngleControl() {
  const [keyMapping, _] = useRemoteValue("keyMapping");

  function setDefaultStrafingSettings() {
    RemoteStore.resetStrafingSettings();
  }

  const [angleConfig, setAngleConfig] = useRemoteValue(
    "leftJoystickStrafingAngles"
  );

  const isAdvancedStrafeOn = angleConfig.useLeftRightAngle;

  const toggleEnabled = useCallback(() => {
    const value = !angleConfig.useLeftRightAngle;
    setAngleConfig({ ...angleConfig, useLeftRightAngle: value });
  }, [angleConfig]);

  const setDiagonalAngle = useCallback(
    (angle) => setAngleConfig({ ...angleConfig, upDiagonalAngle: angle }),
    [angleConfig]
  );

  const setLeftRightAngle = useCallback(
    (angle) => setAngleConfig({ ...angleConfig, leftRightAngle: angle }),
    [angleConfig]
  );

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <Flex>
        <Heading>Strafe Angle</Heading>
        <InfoTooltip ml="7px" mt="2px">
          <Text pt="1" fontSize="sm">
            This option allows you to adjust the angle you will strafe by
            pressing <Kbd>Left</Kbd>/<Kbd>Right</Kbd> at the same time as{" "}
            <Kbd>Forward</Kbd> (e.g.{" "}
            {keybindDisplay(keyMapping.leftJoystick.up, "W")}+
            {keybindDisplay(keyMapping.leftJoystick.right, "D")})
          </Text>
        </InfoTooltip>
      </Flex>
      <AngleControl
        angle={angleConfig.upDiagonalAngle}
        setAngle={setDiagonalAngle}
        min={strafeAngleRange[0]}
        max={strafeAngleRange[1]}
      />

      <Flex
        width="100%"
        direction="column"
        onClick={toggleEnabled}
        cursor="pointer"
        pt="6"
      >
        <Flex>
          <Flex>
            <Heading>Enable Single Key Strafing</Heading>
            <InfoTooltip ml="7px" mt="2px">
              <Text pt="1" fontSize="sm">
                This option allows you to adjust the angle you will strafe by
                pressing just one of the <Kbd>Left</Kbd>/<Kbd>Right</Kbd> keys
                (e.g. {keybindDisplay(keyMapping.leftJoystick.right, "D")})
              </Text>
            </InfoTooltip>
          </Flex>
          <Spacer />
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch
            colorScheme="accent"
            isChecked={isAdvancedStrafeOn}
            as="div"
          ></Switch>
        </Flex>
      </Flex>
      {isAdvancedStrafeOn && (
        <AngleControl
          angle={angleConfig.leftRightAngle}
          setAngle={setLeftRightAngle}
          min={singleKeyStrafeAngleRange[0]}
          max={singleKeyStrafeAngleRange[1]}
        />
      )}
      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={setDefaultStrafingSettings}
      >
        Reset settings to Wooting recommended
      </Link>
    </VStack>
  );
}
