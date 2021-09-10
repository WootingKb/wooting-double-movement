import { VStack, Link, Text } from "@chakra-ui/react";
import { useRemoteValue, RemoteStore } from "ipc";
import { defaultKeyMapping } from "native/types";
import React from "react";
import { KeyBindControl } from "../settings/key-bind/KeyBindControl";

export function KeyMappingTab() {
  const [keyMapping, setKeyMapping] = useRemoteValue("keyMapping");

  function setDefaultBindSettings() {
    RemoteStore.resetBindSettings();
  }

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <KeyBindControl keyMapping={keyMapping} setKeyMapping={setKeyMapping} />

      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={setDefaultBindSettings}
      >
        Reset keybinds to Wooting recommended
      </Link>
    </VStack>
  );
}
