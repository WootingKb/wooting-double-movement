import {
  VStack,
  Flex,
  Heading,
  Spacer,
  CloseButton,
  Text,
  Box,
  Tooltip,
  Skeleton,
  useTooltip,
  useToast,
} from "@chakra-ui/react";
import { remote } from "electron";
import React, { useState, useEffect } from "react";
import { useCallback } from "react";
import { Card } from "./components/general/Card";
import { Markdown } from "./components/markdown";

export interface Announcement {
  id: string;
  markdown: string;
}

const apiUrl =
  process.env.NODE_ENV === "production"
    ? "https://api.wooting.io"
    : "http://localhost:8080";

function AnnouncementKey(data: Announcement) {
  return "announcement-" + data.id;
}

function _Announcement(props: {
  isOpen: boolean;
  onClose: () => void;
  requestOpen: () => void;
}) {
  //@ts-ignore
  if (DISABLE_ANNOUNCEMENTS) {
    console.debug("Announcements disabled");
    return <></>;
  }

  // You may not like the fact we got some wee announcements in here but ye know, we gotta put food on the keyboard

  const [announcement, setAnnouncement] = useState<
    Announcement | undefined | null
  >(null);

  useEffect(() => {
    if (!announcement)
      fetch(`${apiUrl}/public/announcement/latest`)
        .then(async (res) => {
          const data = await res.json();
          console.debug("Announcement data: ", data);
          const announcement = data.announcement;
          // If it's undefined then there is no announcement so return
          if (!announcement) {
            setAnnouncement(undefined);
            return;
          }

          // Check if it has already been seen
          const announcementKey = AnnouncementKey(announcement);
          const hasSeen = localStorage.getItem(announcementKey) === "true";

          setAnnouncement(announcement);

          // If it hasn't been seen then we can show
          if (!hasSeen) {
            props.requestOpen();
          }
        })
        .catch((e) => {
          console.error(e);
        });
  }, []);

  const close = useCallback(() => {
    props.onClose();

    if (announcement) {
      // It shouldn't be possible for the announcement to not be defined here so we can safely assume it's defined
      localStorage.setItem(AnnouncementKey(announcement!), "true");
    }
  }, [props.onClose, announcement]);

  return props.isOpen ? (
    <Card h="fill-available" p="6" overflow="hidden">
      <VStack h="100%" overflow="hidden">
        <Flex w="100%">
          <Heading>Announcement</Heading>
          <Spacer />
          <Tooltip label="Click to dismiss" hasArrow>
            <CloseButton onClick={close} h="100%" />
          </Tooltip>
        </Flex>
        {announcement !== undefined ? (
          <Skeleton isLoaded={!!announcement} h="100%" w="100%">
            <Box overflowY="auto" h="100%" w="100%" minH="0px">
              {announcement && <Markdown>{announcement.markdown}</Markdown>}
            </Box>
          </Skeleton>
        ) : (
          <Text>No active announcements</Text>
        )}
      </VStack>
    </Card>
  ) : (
    <></>
  );
}

export const Announcement = React.memo(_Announcement);
