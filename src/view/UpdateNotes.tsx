import React from "react";
import { useEffect } from "react";
import { Card } from "./components/general/Card";
import { request } from "@octokit/request";
import {
  CloseButton,
  Text,
  VStack,
  Heading,
  Kbd,
  Link,
  Box,
  Skeleton,
  Spacer,
  Flex,
  Button,
  IconButton,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { IoRefresh } from "react-icons/io5";

interface Props {
  // Will fallback to the app version if not specified. So this can be used to display update notes of next version
  version: string;
  onClose: () => void;
}

const MarkdownOverrides = {
  p: (props: any) => {
    console.log(props);
    return <Text children={props.children} />;
  },
  li: (props: any) => {
    return <Text as="li" children={props.children} />;
  },
  code: (props: any) => {
    return <Kbd children={props.children} />;
  },
  h2: (props: any) => {
    return <Heading children={props.children} size="sm" my="1em" />;
  },
  a: (props: any) => {
    return <Link href={props.href} isExternal children={props.children} />;
  },
};

export function UpdateNotes(props: Props) {
  const [changelogBody, setChangelogBody] = React.useState<
    string | Error | null
  >(null);

  function getReleaseBody(version: string, force: boolean = false) {
    setChangelogBody(null);

    const localStorageKey = `changelog-${version}`;

    if (!force) {
      // Use localStorage to cache the changelog to prevent hitting rate limit
      const changelog = localStorage.getItem(localStorageKey);

      if (changelog) {
        setChangelogBody(changelog);
        return;
      }
    }

    request("GET /repos/{owner}/{repo}/releases/tags/{tag}", {
      owner: "WootingKb",
      repo: "wooting-double-movement",
      tag: `v${props.version}`,
    })
      .then((release) => {
        const body = release.data.body ?? "";
        setChangelogBody(body);
        localStorage.setItem(localStorageKey, body);
      })
      .catch((e) => {
        console.error(e);
        if (!force) {
          if (e instanceof Error) {
            setChangelogBody(e);
          } else {
            setChangelogBody(new Error(`${e}`));
          }
        } else {
          // If it was forced  to fetch the changelog and it failed call it again without force so it can try fallback to cache
          getReleaseBody(version);
        }
      });
  }

  useEffect(() => {
    getReleaseBody(props.version);
  }, [props.version]);

  return (
    <Card h="100%" p="6" overflow="hidden">
      <VStack h="100%" overflow="hidden">
        <Flex w="100%">
          <Heading>Update Notes</Heading>
          <Spacer />
          <IconButton
            variant="ghost"
            aria-label="refresh"
            icon={<IoRefresh />}
            onClick={() => getReleaseBody(props.version, true)}
            h="100%"
          />
          <CloseButton onClick={props.onClose} h="100%" />
        </Flex>
        <Skeleton isLoaded={!!changelogBody} w="100%" h="100%" minH="0px">
          <Box overflowY="auto" h="100%" w="100%">
            {changelogBody &&
              (typeof changelogBody == "string" ? (
                //@ts-ignore
                <ReactMarkdown components={ChakraUIRenderer(MarkdownOverrides)}>
                  {changelogBody}
                </ReactMarkdown>
              ) : (
                <VStack>
                  <Text variant="body" color="red">
                    {changelogBody.message}
                  </Text>
                  <Button onClick={() => getReleaseBody(props.version)}>
                    Try Again?
                  </Button>
                </VStack>
              ))}
          </Box>
        </Skeleton>
      </VStack>
    </Card>
  );
}
