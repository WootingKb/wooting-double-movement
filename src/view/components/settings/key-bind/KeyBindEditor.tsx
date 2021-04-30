import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";
import { Key } from "ts-keycode-enum";

interface EditKeyBindProps {
  value?: number;
  valueChanged: (value?: number) => void;
}

export function KeyBindEditor(props: EditKeyBindProps & InputProps) {
  const { value, valueChanged, ...rest } = props;
  const [isEditing, setIsEditing] = useState(false);

  function removeCurrentBind() {
    props.valueChanged(undefined);
    setIsEditing(false);
  }

  function assignNewBind() {
    setIsEditing(true);
    window.addEventListener(
      "keydown",
      (event) => {
        props.valueChanged(event.keyCode);
        setIsEditing(false);
      },
      { once: true }
    );
  }

  return (
    <Input
      value={!isEditing ? (props.value ? Key[props.value] : "") : ""}
      onClick={assignNewBind}
      onContextMenu={removeCurrentBind}
      isReadOnly={true}
      placeholder={isEditing ? "Press any key" : "Click to set"}
      size="sm"
      cursor="pointer"
      {...rest}
    />
  );
}
