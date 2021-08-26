import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  PopoverProps,
  IconProps,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

export function InfoTooltip(
  props: { children: React.ReactNode; popoverProps?: PopoverProps } & IconProps
) {
  const bg = useColorModeValue("white", "#1C2226");

  const { children, popoverProps, ...rest } = props;
  return (
    <Popover trigger="hover" placement="top" {...(popoverProps ?? {})}>
      <PopoverTrigger>
        <InfoOutlineIcon cursor="pointer" color={"accent.500"} {...rest} />
      </PopoverTrigger>
      <PopoverContent backgroundColor={bg}>
        <PopoverArrow backgroundColor={bg} />
        <PopoverBody>{children}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
