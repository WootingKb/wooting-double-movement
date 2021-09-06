import { Input, InputProps } from "@chakra-ui/react";
import { ipcRenderer } from "electron/renderer";
import React, { useState } from "react";
import { useEffect } from "react";
import { Key } from "ts-keycode-enum";
import {
  PrettyAcceleratorName,
  isKeycodeValidForAccelerator,
  AcceleratorModifiers,
} from "../../../accelerator";
import _ from "lodash";

interface AcceleratorEditorProps {
  acceleratorValue: Key[];
  onAcceleratorChange: (value: Key[]) => void;
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
        setAcceleratorEdit((current) => [...current, event.keyCode]);
        // If the keycode isn't present in the accelerator modifiers then this is the final part of the accelerator
        if (!AcceleratorModifiers.includes(event.keyCode)) {
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

  return (
    <>
      <Input
        placeholder={isEditing ? "Start pressing a key" : "Click to set"}
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
        size="sm"
        {...rest}
      />
    </>
  );
}
