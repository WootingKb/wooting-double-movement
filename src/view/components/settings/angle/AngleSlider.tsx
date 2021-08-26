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
import React, { useCallback, useEffect, useState } from "react";

export function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const { value, valueChanged, min, max, ...rest } = props;
  useEffect(() => {
    const inRangeValue = Math.max(Math.min(value, max), min);
    if (inRangeValue !== props.value) {
      valueChanged(inRangeValue);
    }
  }, [value, min, max, valueChanged]);

  const [localValue, setLocalValue] = useState<number | null>();
  const useValue = localValue ?? value;

  const percentageValue = (((useValue - min) / (max - min)) * 100).toFixed(0);

  const onChangeStart = useCallback((value: number) => {
    // we need to update the localValue when the change starts
    setLocalValue(value);
  }, []);

  const onChange = useCallback(
    (value: number) => {
      // If a change is occuring we need to update the local value
      setLocalValue(value);
    },
    [valueChanged]
  );

  const onChangeEnd = useCallback(
    (value: number) => {
      // Change has ended so we can stop using the local value and can propagate the change up to the callback if it's different
      setLocalValue(null);
      if (value !== props.value) {
        valueChanged(value);
      }
    },
    [valueChanged, props.value]
  );

  return (
    <HStack align="stretch" width="100%">
      <Slider
        mr="20px"
        aria-label="slider-ex-1"
        min={min}
        max={max}
        step={0.01}
        value={useValue}
        onChangeStart={onChangeStart}
        onChangeEnd={onChangeEnd}
        onChange={onChange}
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
