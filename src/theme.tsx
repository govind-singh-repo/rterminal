import { createTheme } from "@mui/material";

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#61dafb',
        },
        secondary: {
            main: '#61fbd7',
        },
        background: {
            default: '#1e1e1e',
            paper: '#252526',
        },
        text: {
            primary: '#e6e6e6',
            secondary: '#a6a6a6',
        },
    },
    typography: {
        fontFamily: '"Consolas", "Courier New", monospace',
        fontSize: 14,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#6b6b6b #2b2b2b',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#2b2b2b',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#6b6b6b',
                        borderRadius: '4px',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    padding: '8px',
                    borderRadius: 4,
                },
            },
        },
    }
})