const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

// Upstream's grey scales, re-tinted to the v2 navy so leftover stock classes match the theme.
const gray = {
    50: '#f2f5fc',
    100: '#e3e8f3',
    200: '#c5cee1',
    300: '#b0bbd1',
    400: '#99a5be',
    500: '#808ca8',
    600: '#3d4969',
    700: '#28324d',
    800: '#141c31',
    900: '#030614',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', ...defaultTheme.fontFamily.sans],
                header: ['"Clash Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                // Hex mirrors of the OKLCH tokens in public/themes/pterodactyl/css/cs2-tokens.css; hex keeps the
                // opacity modifiers (bg-accent/20) working in twin.macro.
                paper: { DEFAULT: '#030614', 2: '#141c31', 3: '#02040d' },
                raise: '#1e273f',
                ink: { DEFAULT: '#f2f5fc', 2: '#c5cee1' },
                muted: '#99a5be',
                rule: { DEFAULT: '#28324d', 2: '#3d4969' },
                accent: { DEFAULT: '#4d5fe4', hover: '#414fd2', ink: '#f7f8fc', text: '#8ea5fd' },
                focus: '#7d96fe',
                cpu: '#24d8f1',
                mem: '#ca8cf5',
                disk: '#49d9b9',
                net: '#66bef9',
                ok: '#5ad87e',
                warn: '#f4bf3f',
                bad: '#fc6d6e',
                black: '#02040d',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.indigo,
                orange: colors.orange,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};