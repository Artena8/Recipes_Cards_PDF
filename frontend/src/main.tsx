import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#FF8B2D" },
    secondary: { main: "#1b1b1b" },
    background: {
      default: "#fbf4ea",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial',
    h1: { fontFamily: "Chewy, ui-sans-serif", fontWeight: 400 },
    h2: { fontFamily: "Chewy, ui-sans-serif", fontWeight: 400 },
    h3: { fontFamily: "Chewy, ui-sans-serif", fontWeight: 400 },
    h4: { fontFamily: "Chewy, ui-sans-serif", fontWeight: 400 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "0 12px 30px rgba(0,0,0,.08)" },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
