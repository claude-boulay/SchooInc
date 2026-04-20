/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f2fb',
                    100: '#ebe4f7',
                    200: '#d7c9ef',
                    300: '#c3aee7',
                    400: '#ab81cd',
                    500: '#654597',
                    600: '#5a3e87',
                    700: '#4f3777',
                    800: '#443067',
                    900: '#392957',
                },
                dark: {
                    bg: '#000000',
                    50: '#f5f5f5',
                    100: '#e8e8e8',
                    900: '#1a1a1a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
