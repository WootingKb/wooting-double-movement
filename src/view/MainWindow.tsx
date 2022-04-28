import React, { useEffect, useState } from "react";
import { Box, Flex, useColorModeValue, VStack } from "@chakra-ui/react";
import { Header } from "./Header";
import { SimpleEnableCard } from "./components/SimpleEnableCard";
import { Footer } from "./Footer";
import { UpdateToast } from "./UpdateToast";
import { AdvancedSettingsCard } from "./components/AdvancedSettings";
import { ipcRenderer } from "electron";
import { UpdateNotes } from "./UpdateNotes";
import { bigWindowSize, smallWindowSize } from "../common";
import { setWindowSize } from "../ipc";
import { Announcement } from "./Announcement";
import { useCallback } from "react";

export function MainWindow() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    ipcRenderer.invoke("getVersion").then(setVersion).catch(console.error);
  }, []);

  const bg = useColorModeValue("white", "#1C2226");

  const [updateNotesOpen, setUpdateNotesOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);

  const [windowIsExpanded, setWindowIsExpanded] = useState(false);

  useEffect(() => {
    // If it's 0 the boi is expanded
    if (windowIsExpanded) {
      setWindowSize(...bigWindowSize);
    } else {
      setWindowSize(...smallWindowSize);
    }
  }, [windowIsExpanded]);

  const openUpdateNotes = useCallback(() => {
    if (!announcementsOpen) {
      setUpdateNotesOpen(true);
      setWindowIsExpanded(true);
    }
  }, [announcementsOpen, setUpdateNotesOpen, setWindowIsExpanded]);

  const closeUpdateNotes = useCallback(() => {
    setUpdateNotesOpen(false);
    setWindowIsExpanded(false);
  }, [setUpdateNotesOpen, setWindowIsExpanded]);

  const requestOpenAnnouncements = useCallback(() => {
    setAnnouncementsOpen(true);
    setWindowIsExpanded(true);
    setUpdateNotesOpen(false);
  }, [setAnnouncementsOpen, setWindowIsExpanded, setUpdateNotesOpen]);

  const closeAnnouncements = useCallback(() => {
    setAnnouncementsOpen(false);
    setWindowIsExpanded(false);
  }, [setAnnouncementsOpen, setWindowIsExpanded]);

  return (
    <Flex
      userSelect="none"
      h="100vh"
      direction="column"
      borderRadius="18px"
      backgroundColor={bg}
      border="1px solid"
      borderColor={useColorModeValue("gray.200", 'transparent')}
      overflow="hidden"
    >
      <Header openAnnouncements={requestOpenAnnouncements} />
      <VStack h="100%" alignItems="stretch" p="6" overflow="hidden" spacing="8">
        {!announcementsOpen &&
          (updateNotesOpen ? (
            <UpdateNotes version={version} onClose={closeUpdateNotes} />
          ) : (
            <>
              <SimpleEnableCard />
              <AdvancedSettingsCard
                isExpanded={windowIsExpanded}
                setIsExpanded={setWindowIsExpanded}
              />
            </>
          ))}
        <Announcement
          isOpen={announcementsOpen}
          onClose={closeAnnouncements}
          requestOpen={requestOpenAnnouncements}
        />
      </VStack>

      <Footer appVersion={version} onVersionClicked={openUpdateNotes} />
      <UpdateToast />
    </Flex>
  );
}
