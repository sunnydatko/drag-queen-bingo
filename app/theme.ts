import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  palette: {
    primary: {
      main: "#db2777",
    },
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;
