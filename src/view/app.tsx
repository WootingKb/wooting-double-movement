import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { MainWindow } from "./MainWindow";
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  shadows: { outline: "0 !important" },
  colors: {
    yellow: {
      "50": "#FFF8E5",
      "100": "#FFECB8",
      "200": "#FFE08A",
      "300": "#FFD45C",
      "400": "#FFC82E",
      "500": "#FFBC00",
      "600": "#CC9600",
      "700": "#997100",
      "800": "#664B00",
      "900": "#332600",
    },
  },
  styles: {
    global: {
      body: { bg: "unset" },
    },
  },
});

function AppRoot() {
  return (
    <ChakraProvider theme={theme}>
      <MainWindow />
    </ChakraProvider>
  );
}

ReactDOM.render(<AppRoot />, document.getElementById("root"));
