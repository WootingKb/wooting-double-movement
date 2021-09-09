import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { MainWindow } from "./MainWindow";
import { functions } from "electron-log";

Object.assign(console, functions);

function AppRoot() {
  return (
    <ChakraProvider theme={theme}>
      <MainWindow />
    </ChakraProvider>
  );
}

ReactDOM.render(<AppRoot />, document.getElementById("root"));
