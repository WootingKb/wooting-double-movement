import React, { useEffect, useState } from "react";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { Header } from "./Header";
import { SimpleEnableCard } from "./components/SimpleEnableCard";
import { Footer } from "./Footer";
import { UpdateToast } from "./UpdateToast";
import { AdvancedSettingsCard } from "./components/AdvancedSettings";
import { ipcRenderer } from "electron";
import { UpdateNotes } from "./UpdateNotes";
import { bigWindowSize, smallWindowSize } from "../common";
import { setWindowSize } from "../ipc";

export function MainWindow() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    ipcRenderer.invoke("getVersion").then(setVersion).catch(console.error);
  }, []);

  const bg = useColorModeValue("white", "#1C2226");

  const [updateNotesOpen, setUpdateNotesOpen] = useState(false);

  const [windowIsExpanded, setWindowIsExpanded] = useState(false);

  useEffect(() => {
    // If it's 0 the boi is expanded
    if (windowIsExpanded) {
      setWindowSize(...bigWindowSize);
    } else {
      setWindowSize(...smallWindowSize);
    }
  }, [windowIsExpanded]);

  function openUpdateNotes() {
    setUpdateNotesOpen(true);
    setWindowIsExpanded(true);
  }

  function closeUpdateNotes() {
    setUpdateNotesOpen(false);
    setWindowIsExpanded(false);
  }

  return (
    <Flex
      userSelect="none"
      h="100vh"
      direction="column"
      borderRadius="18px"
      backgroundColor={bg}
      overflow="hidden"
    >
      <Header />
      {updateNotesOpen ? (
        <UpdateNotes version={version} onClose={closeUpdateNotes} />
      ) : (
        <Box flex="auto">
          <SimpleEnableCard />
          <AdvancedSettingsCard
            isExpanded={windowIsExpanded}
            setIsExpanded={setWindowIsExpanded}
          />
        </Box>
      )}

      <Footer appVersion={version} onVersionClicked={openUpdateNotes} />
      <UpdateToast />
    </Flex>
  );
}
