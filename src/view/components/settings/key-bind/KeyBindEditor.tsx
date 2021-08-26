import { Input, InputProps } from "@chakra-ui/react";
import React from "react";
import { Key } from "ts-keycode-enum";
import { JoystickKeyMapping } from "../../../../native/types";

interface KeyBindEditorProps {
  keybind: keyof JoystickKeyMapping;
  value?: number;
  requestEdit: (keybind: keyof JoystickKeyMapping) => void;
  isEditing: boolean;
}

export function KeyBindEditor(props: KeyBindEditorProps & InputProps) {
  const { keybind, value, requestEdit, isEditing, ...rest } = props;

  return (
    <Input
      value={!isEditing ? (props.value ? Key[props.value] : "") : ""}
      onClick={() => {
        requestEdit(keybind);
      }}
      isReadOnly={true}
      placeholder={isEditing ? "Press any key" : "Click to set"}
      size="sm"
      cursor="pointer"
      {...rest}
    />
  );
}
