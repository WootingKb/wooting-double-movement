import React from "react";
import ReactDOM from "react-dom";
import { background, ChakraProvider } from "@chakra-ui/react";
import { MainWindow } from "./MainWindow";
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const lightTextColour = "rgba(43, 43, 76, 0.33)";
const darkTextColour = "#4D5561";

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
      body: {
        bg: "unset",
      },
    },
  },
  components: {
    Text: {
      variants: {
        heading: (props) => ({
          color: mode("#2B2B4C", "#828A93")(props),
          fontSize: "md",
          fontWeight: "bold",
        }),
        body: (props) => ({
          color: mode(lightTextColour, darkTextColour)(props),
        }),
      },
    },

    Link: {
      variants: {
        body: (props) => ({
          color: mode(lightTextColour, darkTextColour)(props),
        }),
      },
    },

    Switch: {
      parts: ["track"],
      baseStyle: (props) => ({
        track: {
          _checked: {
            bg: `${props.colorScheme}.500`,
          },
        },
      }),
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
