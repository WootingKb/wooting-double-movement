import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  StackProps,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { ipcRenderer } from "electron/renderer";
import React, { useState, useEffect } from "react";
import { Key } from "ts-keycode-enum";
import {
  PrettyAcceleratorName,
  isKeycodeValidForAccelerator,
  AcceleratorModifiers,
} from "../../../accelerator";
import _ from "lodash";
import { InfoTooltip } from "../general/InfoTooltip";
import { CloseIcon } from "@chakra-ui/icons";
import { useCallback } from "react";

interface AcceleratorEditorProps {
  acceleratorValue: Key[];
  onAcceleratorChange: (value: Key[]) => void;
}

export function AcceleratorEditorRow(
  props: AcceleratorEditorProps & {
    titleChildren: React.ReactFragment;
    infoTooltip?: React.ReactFragment;
    rowProps?: StackProps;
  }
) {
  const { titleChildren, infoTooltip, rowProps, ...rest } = props;
  return (
    <HStack w="100%" {...(rowProps ?? {})}>
      <Text w="fit-content" whiteSpace="nowrap">
        {titleChildren}
      </Text>
      {infoTooltip && <InfoTooltip>{infoTooltip}</InfoTooltip>}
      <AcceleratorEditor {...rest} />
    </HStack>
  );
}

export function AcceleratorEditor(props: AcceleratorEditorProps & InputProps) {
  const { acceleratorValue, onAcceleratorChange, ...rest } = props;

  const [isEditing, setIsEditing] = useState(false);

  const [acceleratorEdit, setAcceleratorEdit] =
    useState<Key[]>(acceleratorValue);

  useEffect(() => {
    setAcceleratorEdit(acceleratorValue);
  }, [acceleratorValue]);

  let acceleratorEditPrettyValue = PrettyAcceleratorName(
    "display",
    acceleratorEdit
  );

  if (acceleratorEditPrettyValue.length > 0 && isEditing)
    acceleratorEditPrettyValue += "+...";

  function completeAcceleratorEdit() {
    setIsEditing(false);

    // Use the current value callback of the set function to get the latest value
    setAcceleratorEdit((finalValue) => {
      console.log(finalValue);
      // The onAcceleratorChange is from the parent so we use the setTimeout to prevent it from erroring from both components rendering simultaneously
      setTimeout(() => {
        onAcceleratorChange(finalValue);
      }, 0);
      return finalValue;
    });
  }

  function requestEdit() {
    let isDone = false;
    ipcRenderer.send("hotkey-edit-start");
    setIsEditing(true);
    setAcceleratorEdit([]);

    function keyupListener(event: KeyboardEvent) {
      setAcceleratorEdit((current) =>
        current.filter((k) => k !== event.keyCode)
      );
    }

    function keydownListener(event: KeyboardEvent) {
      if (isKeycodeValidForAccelerator(event.keyCode)) {
        let canComplete = false;
        setAcceleratorEdit((current) => {
          const isModifier = AcceleratorModifiers.includes(event.keyCode);
          let res;

          // If the key isn't a modifier and nothing is present then we ignore until we get a modifier
          if (!isModifier && current.length === 0) {
            res = current;
            // If the key is already present ignore
          } else if (current.includes(event.keyCode)) res = current;
          else res = [...current, event.keyCode];

          canComplete = res.length > 1;

          return res;
        });
        // If the keycode isn't present in the accelerator modifiers then this is the final part of the accelerator
        if (!AcceleratorModifiers.includes(event.keyCode) && canComplete) {
          clearListeners();
          completeAcceleratorEdit();
        }
      } else {
        console.debug(
          `Keycode ${event.code}:${event.keyCode} is not valid for an accelerator`
        );
      }
    }

    function clearListeners() {
      isDone = true;
      window.removeEventListener("keydown", keydownListener);
      window.removeEventListener("keyup", keyupListener);
      window.removeEventListener("blur", cancelBinding);
    }

    function cancelBinding() {
      if (!isDone) {
        // unsubscribe to keydown event since bind process is already canceled by the blur event
        clearListeners();
        setAcceleratorEdit(acceleratorValue);
        setIsEditing(false);
        ipcRenderer.send("hotkey-edit-cancel");
      }
    }

    // register blur event so we cancel the bind process when the tool gets out of focus
    window.addEventListener("blur", cancelBinding, {
      once: true,
    });

    window.addEventListener("keydown", keydownListener);
    window.addEventListener("keyup", keyupListener);

    return cancelBinding;
  }

  useEffect(() => {
    if (isEditing) {
      return requestEdit();
    }
  }, [isEditing]);

  const deleteBinding = useCallback(() => {
    setIsEditing(false);
    onAcceleratorChange([]);
  }, []);

  return (
    <>
      <InputGroup size="sm">
        <Input
          placeholder={
            isEditing ? "Start by pressing a modifier" : "Click to set"
          }
          cursor="pointer"
          value={acceleratorEditPrettyValue}
          onClick={
            !isEditing
              ? () => {
                  setIsEditing(true);
                }
              : undefined
          }
          isReadOnly={true}
          {...rest}
        />
        <InputRightElement
          children={
            <Tooltip label="Remove binding">
              <IconButton
                variant="ghost"
                size="xs"
                aria-label="unbind"
                icon={<CloseIcon />}
                onClick={deleteBinding}
              />
            </Tooltip>
          }
        />
      </InputGroup>
    </>
  );
}
