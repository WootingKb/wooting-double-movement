import { Box, RangeSliderMark, Spacer, Switch } from "@chakra-ui/react";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRemoteValue, useSDKState } from "../../../ipc";
import { SDKState } from "../../../native/types";
import { InfoTooltip } from "../general/InfoTooltip";

interface AnalogRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

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

  return (
    <>
      <RangeSlider
        aria-label={["min", "max"]}
        min={0}
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
        <RangeSliderMark value={0}>
          <Text transform="translateX(-50%)" mt="5px" whiteSpace="nowrap">
            Start
          </Text>
        </RangeSliderMark>
        <RangeSliderMark value={1}>
          <Text transform="translateX(-50%)" mt="5px" whiteSpace="nowrap">
            End
          </Text>
        </RangeSliderMark>
      </RangeSlider>
    </>
  );
}

function SDKStateDisplay(props: { state: SDKState }) {
  const [color, text] = useMemo(() => {
    switch (props.state.type) {
      case "Uninitialized":
        return ["gray", "Uninitialized"];
      case "Error":
        //   TODO: Improve error text
        return ["red.400", "Error: " + props.state.value];
      case "DevicesConnected":
        return ["green.500", props.state.value[0] + " Connected"];
      case "NoDevices":
        return ["orange.500", "No Wooting keyboard connected"];
    }
  }, [props.state]);

  if (props.state.type === "Uninitialized") {
    return <></>;
  }

  return (
    <HStack>
      <Box boxSize={2} bg={color} borderRadius="full" />
      <Text>{text}</Text>
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
          <Heading>Enable analog keyboard as input</Heading>
          <InfoTooltip ml="7px" mt="2px">
            <Text pt="1" fontSize="sm">
              Enable analog input to get that sweet sweet 360 movement gang
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
                Lets you choose your analog actuation and range
              </Text>
            </InfoTooltip>
          </Flex>
          <AnalogRangeSlider
            value={analogRange}
            onChange={onAnalogRangeChanged}
          />
          <Spacer />
          <SDKStateDisplay state={sdkState} />
        </>
      )}
    </VStack>
  );
}
