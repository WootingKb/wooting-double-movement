import React, { useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  useToast,
} from "@chakra-ui/react";
import { ipcRenderer } from "electron/renderer";

export function UpdateToast() {
  const toast = useToast();

  useEffect(() => {
    ipcRenderer.on("update_available", () => {
      toast({
        title: "New update available",
        description:
          "We're downloading a new update in the background, we'll let you know once it's finished.",
        isClosable: true,
        status: "info",
      });
    });

    ipcRenderer.on("update_complete", () => {
      toast({
        render: () => (
          <Alert
            status={"success"}
            alignItems="start"
            borderRadius="md"
            boxShadow="lg"
            paddingEnd={8}
            textAlign="start"
            width="auto"
          >
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Update complete</AlertTitle>
              <AlertDescription display="block">
                The update is ready, restart this app to install.
              </AlertDescription>
              <Button
                onClick={() => ipcRenderer.invoke("update_restart_and_install")}
                size="sm"
              >
                Restart
              </Button>
            </Box>
          </Alert>
        ),
      });
    });
  }, []);

  return <></>;
}
