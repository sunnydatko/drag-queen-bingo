import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: { dark: true },
  palette: {
    primary: {
      main: "#db2777",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { height: "100%" },
        body: {
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      },
    },
  },
});

export default theme;
