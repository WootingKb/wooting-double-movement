import { Input, InputProps } from "@chakra-ui/react";
import React, { Dispatch, SetStateAction } from "react";
import { Key } from "ts-keycode-enum";
import { JoystickKeyMapping } from "../../../../native/types";

interface KeyBindEditorProps {
  keybind: keyof JoystickKeyMapping;
  value?: number;
  editingState: [
    keyof JoystickKeyMapping | undefined,
    Dispatch<SetStateAction<keyof JoystickKeyMapping | undefined>>
  ];
}

export function KeyBindEditor(props: KeyBindEditorProps & InputProps) {
  const { keybind, value, editingState, ...rest } = props;
  const [editState, setEditState] = editingState;

  return (
    <Input
      value={editState !== keybind ? (props.value ? Key[props.value] : "") : ""}
      onClick={() => {
        setEditState(keybind);
      }}
      isReadOnly={true}
      placeholder={editState === keybind ? "Press any key" : "Click to set"}
      size="sm"
      cursor="pointer"
      {...rest}
    />
  );
}
