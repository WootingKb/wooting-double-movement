import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const lightTextColour = "rgba(43, 43, 76, 0.33)";
const darkTextColour = "#828e9e";

const yellow = {
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
};

export default extendTheme({
  shadows: { outline: "0 !important" },
  colors: {
    yellow,
    accent: yellow,
  },
  styles: {
    global: {
      body: {
        bg: "unset",
      },
    },
  },
  components: {
    Heading: {
      baseStyle: (props: any) => ({
        color: mode("#2B2B4C", "#828A93")(props),
      }),
      defaultProps: {
        size: "sm",
      },
    },
    Text: {
      variants: {
        body: (props: any) => ({
          color: mode(lightTextColour, darkTextColour)(props),
        }),
      },
      defaultProps: {
        variant: "body",
      },
    },

    Link: {
      variants: {
        link: (props: any) => ({
          color: mode("gray.400", "gray.500")(props),
          _hover: {
            color: mode("gray.600", "gray.300")(props),
          },
        }),
        plink: (props: any) => ({
          color: mode("gray.400", "gray.500")(props),
          _hover: {
            color: mode("gray.600", "gray.300")(props),
          },
          textDecoration: "underline",
        }),
      },
      defaultProps: {
        variant: "link",
      },
    },

    Switch: {
      parts: ["track"],
      baseStyle: (props: any) => ({
        track: {
          _checked: {
            bg: `${props.colorScheme}.500`,
          },
        },
      }),
    },
    Tabs: {
      parts: ["tab"],
      variants: {
        enclosed: (props: any) => ({
          tab: {
            _selected: {
              color: `${props.colorScheme}.500`,
            },
          },
        }),
      },
    },
    Tooltip: {
      variants: {
        accent: {
          bg: "accent.500",
          "--tooltip-bg": `colors.accent.500`,
        },
      },
      baseStyle: {
        borderRadius: "md",
      },
      defaultProps: {
        variant: "accent",
      },
    },
  },
});
