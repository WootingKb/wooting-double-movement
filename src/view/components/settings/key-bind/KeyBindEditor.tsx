import { Input, InputProps } from "@chakra-ui/react";
import React, { useState } from "react";
import { Key } from "ts-keycode-enum";

interface EditKeyBindProps {
  value: number;
  valueChanged: (value: number) => void;
}

export function KeyBindEditor(props: EditKeyBindProps & InputProps) {
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