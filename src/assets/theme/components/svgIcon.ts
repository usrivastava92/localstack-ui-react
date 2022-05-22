import pxToRem from "assets/theme/functions/pxToRem";

// types
type Types = any;

const svgIcon: Types = {
  defaultProps: {
    fontSize: "inherit"
  },

  styleOverrides: {
    fontSizeInherit: {
      fontSize: "inherit !important"
    },

    fontSizeSmall: {
      fontSize: `${pxToRem(20)} !important`
    },

    fontSizeLarge: {
      fontSize: `${pxToRem(36)} !important`
    }
  }
};

export default svgIcon;
