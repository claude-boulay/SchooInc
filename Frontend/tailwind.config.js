/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dominant: warm off-white / cream.
                // primary-300 is the page background, primary-100 is the lighter
                // surface used for navbar / dropdowns (near pure white).
                primary: {
                    50:  '#ffffff',
                    100: '#fffdfa',
                    200: '#fcf7ef',
                    300: '#f6efe4',
                    400: '#ecdfca',
                    500: '#d3bf9d',
                    600: '#a89072',
                    700: '#81694f',
                    800: '#594836',
                    900: '#3a2f23',
                },
                // Warm accent scale bridging peach (#FFC1A3) -> coral (#F78887).
                // accent-400 = peach (hover, soft fills)
                // accent-500 = coral (primary CTAs, focus)
                accent: {
                    50:  '#fff8f4',
                    100: '#ffede3',
                    200: '#ffd8c3',
                    300: '#ffcbaf',
                    400: '#ffc1a3',
                    500: '#f78887',
                    600: '#e56a6a',
                    700: '#c45353',
                    800: '#993f3f',
                    900: '#6d2c2c',
                },
                // Warm charcoal for readable text / borders on the cream page.
                ink: {
                    50:  '#f6f3f0',
                    100: '#ebe5df',
                    200: '#cec3b9',
                    300: '#a69b91',
                    400: '#736860',
                    500: '#4a3f3a',
                    600: '#3d342f',
                    700: '#302824',
                    800: '#241e1a',
                    900: '#181410',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
