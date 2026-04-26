import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export default function AppTheme({ children, themeComponents = {} }) {
  const theme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#f7f8fa',
        paper: '#ffffff',
      },
      text: {
        primary: '#1f2937',
        secondary: '#4b5563',
      },
    },
    typography: {
      fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
      h4: {
        fontWeight: 700,
      },
    },
    components: themeComponents,
  });

  // small helper for customizations that expect theme.applyStyles
  theme.applyStyles = (mode, styles) => (mode === 'dark' ? styles : {});

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
