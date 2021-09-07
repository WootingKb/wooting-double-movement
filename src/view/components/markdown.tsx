import { Kbd, Heading, Link, Text } from "@chakra-ui/react";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import React from "react";
import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";

const MarkdownOverrides = {
  p: (props: any) => {
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

export function Markdown(props: ReactMarkdownOptions) {
  return (
    <ReactMarkdown
      components={ChakraUIRenderer(MarkdownOverrides)}
      {...props}
    />
  );
}
