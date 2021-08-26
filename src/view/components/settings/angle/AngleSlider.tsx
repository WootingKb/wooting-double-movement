import {
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";

export function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const { value, valueChanged, min, max, ...rest } = props;
  const percentageValue = (((value - min) / (max - min)) * 100).toFixed(0);
  useEffect(() => {
    const inRangeValue = Math.max(Math.min(value, max), min);
    if (inRangeValue !== props.value) {
      valueChanged(inRangeValue);
    }
  }, [value, min, max, valueChanged]);

  return (
    <HStack align="stretch" width="100%">
      <Slider
        mr="20px"
        aria-label="slider-ex-1"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={valueChanged}
        {...rest}
      >
        <SliderTrack>
          <SliderFilledTrack backgroundColor="yellow.500" />
        </SliderTrack>
        <SliderThumb _focus={{ boxShadow: "base" }} />
      </Slider>
      <NumberInput
        onChange={(_, value) => {
          if (!Number.isNaN(value)) {
            valueChanged((value / 100) * (max - min) + min);
          }
        }}
        value={percentageValue + "%"}
        min={0}
        max={100}
        maxW="100px"
        size="sm"
        // allowMouseWheel
        focusInputOnChange={false}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </HStack>
  );
}
