import { ArrowBackIcon, ArrowDownIcon, ArrowForwardIcon, ArrowUpIcon, InfoOutlineIcon, } from "@chakra-ui/icons";
import {
  ExpandedIndex,
  Flex,
  HStack,
  Input,
  InputProps,
  Kbd,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Slider,
  SliderFilledTrack,
  SliderProps,
  SliderThumb,
  SliderTrack,
  Spacer,
  StackProps,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { bigWindowSize, smallWindowSize } from "../common";
import {
  defaultJoystickAngles,
  defaultKeyMapping,
  defaultStrafeJoystickAngles,
  JoystickKeyMapping,
  KeyMapping,
} from "../native/types";
import { Key } from "ts-keycode-enum";
import { Card } from "./Components";
import { RemoteStore, setWindowSize, useRemoteValue } from "./ipc";

const upLeftRightStrafeAngleRange: [number, number] = [15 / 90, 72 / 90];
const leftRightStrafeAngleRange: [number, number] = [15 / 90, 90 / 90];
const iconColorYellow = "yellow.500";

function AngleSlider(
  props: {
    value: number;
    valueChanged: (value: number) => void;
    min: number;
    max: number;
  } & SliderProps
) {
  const {value, valueChanged, min, max, ...rest} = props;
  const degreeValue = (value * 90).toFixed(0);

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
          <SliderFilledTrack backgroundColor="yellow.500"/>
        </SliderTrack>
        <SliderThumb _focus={{boxShadow: "base"}}/>
      </Slider>
      <NumberInput
        onChange={(_, value) => {
          if (!Number.isNaN(value)) {
            console.log(value);
            valueChanged(value / 90);
          }
        }}
        value={degreeValue + "°"}
        max={max * 90}
        min={min * 90}
        maxW="100px"
        size="sm"
        // allowMouseWheel
        focusInputOnChange={false}
      >
        <NumberInputField/>
        <NumberInputStepper>
          <NumberIncrementStepper/>
          <NumberDecrementStepper/>
        </NumberInputStepper>
      </NumberInput>
    </HStack>
  );
}


function calcDisplay(keyOne: number, keyTwo: number | null = null) {
  if (keyOne === keyTwo || keyTwo == null) {
    return (<Kbd>{Key[keyOne]}</Kbd>);
  } else {
    return (<><Kbd>{Key[keyOne]}</Kbd>, <Kbd>{Key[keyTwo]}</Kbd></>);
  }
}

function UpLeftRightAngleControl() {
  const [joystickAngles, setJoystickAngles] = useRemoteValue(
    "leftJoystickAngles",
    defaultJoystickAngles
  );

  const [keyMapping, setKeyMapping] = useState({leftJoystick: {}} as KeyMapping)

  RemoteStore.getKeyMapping().then(value => {
    setKeyMapping(value)
  })
  return (
    <>
      <Text variant="heading">
        Strafe Angle <Popover trigger="hover" placement="top">
        <PopoverTrigger>
          <InfoOutlineIcon cursor="pointer" color={iconColorYellow}/>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow/>
          <PopoverBody>
            <Text pt="1" fontSize="sm" variant="body">
              This option allows you to adjust the angle you will strafe by pressing <Kbd>Left</Kbd>/<Kbd>Right</Kbd> at
              the same time
              as <Kbd>Forward</Kbd>/<Kbd>Back</Kbd> (e.g. {calcDisplay(keyMapping.leftJoystick.up)}+{calcDisplay(keyMapping.leftJoystick.right)})
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
      </Text>


      <AngleSlider
        value={joystickAngles.rightAngle}
        valueChanged={(value) =>
          setJoystickAngles({...joystickAngles, rightAngle: value})
        }
        min={upLeftRightStrafeAngleRange[0]}
        max={upLeftRightStrafeAngleRange[1]}
      />
    </>
  );
}


function LeftRightStrafeAngleControl() {
  const [strafeJoystickAngles, setStrafeJoystickAngles] = useRemoteValue(
    "leftStrafeJoystickAngles",
    defaultStrafeJoystickAngles
  );

  const [isAdvancedStrafeOn, setIsAdvancedStrafeOn] = useRemoteValue(
    "isAdvancedStrafeOn",
    false
  );

  const [keyMapping, setKeyMapping] = useState({leftJoystick: {}} as KeyMapping)

  RemoteStore.getKeyMapping().then(value => {
    setKeyMapping(value)
  })

  function toggleEnabled() {
    const value = !isAdvancedStrafeOn;
    setIsAdvancedStrafeOn(value)
  }

  return (
    <>
      <Flex direction="column" onClick={toggleEnabled} cursor="pointer" pt="6" width="100%">
        <Flex>
          <Text variant="heading">
            Enable Single Key Strafing <Popover trigger="hover" placement="top">
            <PopoverTrigger>
              <InfoOutlineIcon cursor="pointer" color={iconColorYellow}/>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow/>
              <PopoverBody>
                <Text pt="1" fontSize="sm" variant="body">
                  This option allows you to adjust the angle you will strafe by pressing just one of
                  the <Kbd>Left</Kbd>/<Kbd>Right</Kbd> keys
                  (e.g. {calcDisplay(keyMapping.leftJoystick.right)})
                </Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          </Text>
          <Spacer/>
          {/* Render switch as Div so onClick doesn't get triggered twice: https://github.com/chakra-ui/chakra-ui/issues/2854 */}
          <Switch colorScheme="yellow" isChecked={isAdvancedStrafeOn} as="div"></Switch>
        </Flex>
      </Flex>
      {isAdvancedStrafeOn &&
      <>
        {/*<Text variant="heading">Left or Right Strafe Angle</Text>*/}
        <AngleSlider
          value={strafeJoystickAngles.rightAngle}
          valueChanged={(value) =>
            setStrafeJoystickAngles({...strafeJoystickAngles, rightAngle: value})
          }
          min={leftRightStrafeAngleRange[0]}
          max={leftRightStrafeAngleRange[1]}
        />
      </>
      }
    </>
  );
}

interface EditKeybindProps {
  value: number;
  valueChanged: (value: number) => void;
}

export function EditKeyBind(props: EditKeybindProps & InputProps) {
  const {value, valueChanged, ...rest} = props;
  const [isEditing, setIsEditing] = useState(false);

  function assignNewBind() {
    setIsEditing(true);
    window.addEventListener(
      "keydown",
      (event) => {
        console.log(event);
        props.valueChanged(event.keyCode);
        setIsEditing(false);
      },
      {once: true}
    );
  }

  return (
    <Input
      value={!isEditing ? Key[props.value] : ""}
      onClick={assignNewBind}
      isReadOnly={true}
      placeholder="Press any key"
      size="sm"
      cursor="pointer"
      {...rest}
    />
  );
}

export function EditKeybindRow(
  props: EditKeybindProps & StackProps
) {
  const {value, valueChanged, ...rest} = props;

  return (
    <HStack {...rest} justifyContent="space-between">
      <EditKeyBind value={value} valueChanged={valueChanged}/>
    </HStack>
  );
}

interface KeyBindingProps {
  valueChanged: (value: number) => void;
}

export function KeyBinding(props: KeyBindingProps) {
  const {valueChanged, ...rest} = props;
  const [keyMapping, setKeyMapping] = useRemoteValue(
    "keyMapping",
    defaultKeyMapping
  );

  function assignNewJoystickBind(key: keyof JoystickKeyMapping, value: number) {
    setKeyMapping({
      ...keyMapping,
      leftJoystick: {...keyMapping.leftJoystick, [key]: value},
    });
  }


  return (
    <>
      <VStack align="left">
        {/*<Text variant="heading">Direction</Text>*/}
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowUpIcon color={iconColorYellow}/>
            <Text width="100px" variant="body">
              Forward
            </Text>
          </HStack>
          <EditKeybindRow
            mr={1} flex={1}
            value={keyMapping.leftJoystick.up}
            valueChanged={(value: number) => assignNewJoystickBind("up", value)}
          />
          <EditKeybindRow
            flex={1}
            value={keyMapping.leftJoystick.up_two}
            valueChanged={(value: number) => {
              assignNewJoystickBind("up_two", value);
              valueChanged(value)
            }}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowDownIcon color={iconColorYellow}/>
            <Text width="100px" variant="body">
              Back
            </Text>
          </HStack>
          <EditKeybindRow
            mr={1} flex={1}
            value={keyMapping.leftJoystick.down}
            valueChanged={(value: number) => assignNewJoystickBind("down", value)}
          />
          <EditKeybindRow
            flex={1}
            value={keyMapping.leftJoystick.down_two}
            valueChanged={(value: number) => assignNewJoystickBind("down_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowBackIcon color={iconColorYellow}/>
            <Text width="100px" variant="body">
              Left
            </Text>
          </HStack>
          <EditKeybindRow
            mr={1} flex={1}
            value={keyMapping.leftJoystick.left}
            valueChanged={(value: number) => assignNewJoystickBind("left", value)}
          />
          <EditKeybindRow
            flex={1}
            value={keyMapping.leftJoystick.left_two}
            valueChanged={(value: number) => assignNewJoystickBind("left_two", value)}
          />
        </Flex>
        <Flex>
          <HStack justifyContent="space-between">
            <ArrowForwardIcon color={iconColorYellow}/>
            <Text width="100px" variant="body">
              Right
            </Text>
          </HStack>
          <EditKeybindRow
            mr={1} flex={1}
            value={keyMapping.leftJoystick.right}
            valueChanged={(value: number) => assignNewJoystickBind("right", value)}
          />
          <EditKeybindRow
            flex={1}
            value={keyMapping.leftJoystick.right_two}
            valueChanged={(value: number) => assignNewJoystickBind("right_two", value)}
          />
        </Flex>
      </VStack>
    </>
  );
}

export function AdvancedSettingsCard() {
  function updateWindowSize(index: ExpandedIndex) {
    console.log("Accordian index: ", index);
    // If it's 0 the boi is expanded
    if (index == 0) {
      setWindowSize(...bigWindowSize);
    } else {
      setWindowSize(...smallWindowSize);
    }
  }

  function setDefaultSettings() {
    RemoteStore.resetSettings();
  }

  return (
    <>
      <Card p="6" minHeight="280px">
        <Tabs variant="soft-rounded" colorScheme="yellow">
          <TabList>
            <Tab mr={3}>Keybinds</Tab>
            <Tab>Strafing</Tab>
          </TabList>

          <TabPanels>

            <TabPanel>
              <VStack align="baseline" spacing="2">
                <KeyBinding valueChanged={(value => null)}/>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="baseline" spacing="2">
                <UpLeftRightAngleControl/>
                <LeftRightStrafeAngleControl/>
              </VStack>
            </TabPanel>

          </TabPanels>
        </Tabs>
      </Card>
      <Card p="6">
        <Link
          as={Text}
          variant="body"
          fontSize="sm"
          onClick={setDefaultSettings}
        >
          Reset settings to Wooting recommended
        </Link>
      </Card>
    </>
  );
}
