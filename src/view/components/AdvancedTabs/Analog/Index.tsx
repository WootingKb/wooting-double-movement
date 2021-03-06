import {
  Box,
  Center,
  Icon,
  IconProps,
  RangeSliderMark,
  Spacer,
  Spinner,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  VStack,
  HStack,
  Link,
  Text,
  Kbd,
  Flex,
  Heading,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
} from "@chakra-ui/react";
import { useRemoteValue, useSDKState } from "ipc";
import { SDKState } from "native/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InfoTooltip } from "view/components/general/InfoTooltip";
import { JoystickTester } from "./JoystickTester";

interface AnalogRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export const AnalogRange: number = 4.0;

function AnalogRangeSlider(props: AnalogRangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number] | null>(null);
  const useValue = localValue ?? props.value;

  const onChangeStart = useCallback(
    (value: [number, number]) => {
      setLocalValue(value);
    },
    [setLocalValue]
  );

  const onChange = useCallback(
    (value: [number, number]) => {
      setLocalValue(value);
    },
    [setLocalValue]
  );

  const onChangeEnd = useCallback(
    (value: [number, number]) => {
      setLocalValue(null);
      if (value[0] !== props.value[0] || value[1] !== props.value[1]) {
        props.onChange(value);
      }
    },
    [setLocalValue, props.onChange, props.value]
  );

  const startMM = useValue[0] * AnalogRange;
  const endMM = useValue[1] * AnalogRange;

  return (
    <>
      <RangeSlider
        aria-label={["min", "max"]}
        min={0.025}
        max={1}
        step={0.025}
        value={useValue}
        onChangeStart={onChangeStart}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        colorScheme="accent"
      >
        <RangeSliderTrack>
          <RangeSliderFilledTrack backgroundColor="yellow.500" />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
        <RangeSliderMark value={useValue[0]}>
          <Text transform="translateX(-50%)" mt="5px" whiteSpace="nowrap">
            {startMM} mm
          </Text>
        </RangeSliderMark>
        <RangeSliderMark value={useValue[1]}>
          <Text transform="translateX(-50%)" mt="5px" whiteSpace="nowrap">
            {endMM} mm
          </Text>
        </RangeSliderMark>
      </RangeSlider>
    </>
  );
}

function SDKStateDisplay(props: { state: SDKState }) {
  const [color, text, useBold] = useMemo(() => {
    switch (props.state.type) {
      case "Uninitialized":
        return ["gray", "Uninitialized", false];
      case "Error":
        //   TODO: Improve error text
        return ["red.400", "Error: " + props.state.value, false];
      case "DevicesConnected":
        return ["green.500", props.state.value[0] + " Connected", false];
      case "NoDevices":
        return ["orange.500", "No Wooting keyboard connected", true];
    }
  }, [props.state]);

  const boldText = useColorModeValue("black", "white");
  if (props.state.type === "Uninitialized") {
    return <></>;
  }

  return (
    <HStack>
      <Box boxSize={2} bg={color} borderRadius="full" />
      <Text
        fontWeight={useBold ? "semibold" : undefined}
        color={useBold ? boldText : undefined}
      >
        {text}
      </Text>
    </HStack>
  );
}

export function AnalogSettingsTab() {
  const [useAnalogInput, setUseAnalogInput] = useRemoteValue("useAnalogInput");
  const sdkState = useSDKState();
  useEffect(() => {
    console.log(sdkState);
  }, [sdkState]);

  const [angleConfig, setAngleConfig] = useRemoteValue(
    "leftJoystickStrafingAngles"
  );

  const analogRange = angleConfig.analogRange;

  const onAnalogRangeChanged = useCallback(
    (newAnalogRange: [number, number]) => {
      setAngleConfig({ ...angleConfig, analogRange: newAnalogRange });
    },
    [angleConfig, setAngleConfig]
  );

  return (
    <VStack align="baseline" spacing="4" height="100%" position="relative">
      <Flex w="100%">
        <Flex>
          <Heading>Enable 360 movement from Wooting kb</Heading>
          <InfoTooltip ml="7px" mt="2px">
            <Text pt="1" fontSize="sm">
              360 movement enables granular control over your strafing angle.
              This option requires a Wooting keyboard.
            </Text>
          </InfoTooltip>
        </Flex>
        <Spacer />
        <Switch
          colorScheme="accent"
          isChecked={useAnalogInput}
          onChange={(e) => {
            setUseAnalogInput(e.target.checked);
          }}
        />
      </Flex>

      {useAnalogInput && (
        <>
          <Flex>
            <Heading>Analog Range</Heading>
            <InfoTooltip ml="7px" mt="2px">
              <Text pt="1" fontSize="sm">
                Adjust the total analog detection range to increase/decrease the
                amount of granular control. You can modify the actuation point
                (sensitivity) by adjusting the left side slider. Default is 0.2
                to 3.6mm.
              </Text>
            </InfoTooltip>
          </Flex>
          <AnalogRangeSlider
            value={analogRange}
            onChange={onAnalogRangeChanged}
          />
          <JoystickTester sdkState={sdkState} />

          <SDKStateDisplay state={sdkState} />
        </>
      )}
    </VStack>
  );
}
