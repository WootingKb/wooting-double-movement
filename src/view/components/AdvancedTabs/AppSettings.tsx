import { VStack, HStack, Link, Text, Kbd } from "@chakra-ui/react";
import React from "react";
import { useRemoteValue } from "../../../ipc";
import { defaultToggleAccelerator } from "../../../native/types";
import { InfoTooltip } from "../general/InfoTooltip";
import {
  AcceleratorEditor,
  AcceleratorEditorRow,
} from "../settings/accelerator";

export function AppSettingsTab() {
  const [toggleAccelerator, setToggleAccelerator] = useRemoteValue(
    "enabledToggleAccelerator"
  );

  function resetToDefault() {
    setToggleAccelerator(defaultToggleAccelerator);
  }

  return (
    <VStack align="baseline" spacing="2" height="100%" position="relative">
      <AcceleratorEditorRow
        titleChildren={"Toggle Hotkey"}
        infoTooltip={
          <Text pt="1" fontSize="sm">
            Change the hotkey to toggle on/off Double Movement. The hotkey
            requires at least 1 modifier key e.g. <Kbd>Ctrl</Kbd> with another
            non-modifier key e.g. <Kbd>P</Kbd>
          </Text>
        }
        acceleratorValue={toggleAccelerator}
        onAcceleratorChange={setToggleAccelerator}
      />

      <Link
        position="absolute"
        bottom="0px"
        as={Text}
        variant="plink"
        fontSize="sm"
        onClick={resetToDefault}
      >
        Reset to Wooting recommended
      </Link>
    </VStack>
  );
}
