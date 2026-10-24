const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

const gray = {
    50: colors.neutral[50],
    100: colors.neutral[100],
    200: colors.neutral[200],
    300: colors.neutral[300],
    400: colors.neutral[400],
    500: colors.neutral[500],
    600: colors.neutral[600],
    700: colors.neutral[700],
    800: colors.neutral[800],
    900: colors.neutral[900],
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Roboto', ...defaultTheme.fontFamily.sans],
                header: ['Roboto', 'system-ui', 'sans-serif'],
            },
            colors: {
                // Semantic palette; mirrored as rgb triplets in resources/scripts/assets/css/cs2.css.
                cs2: {
                    accent: '#f0821e',
                    info: '#0dcaf0',
                    success: '#19ee19',
                    green: '#22c55e',
                    danger: '#ff1313',
                    warning: '#ffcb31',
                    surface: '#0f1621',
                },
                black: '#131a20',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                orange: colors.orange,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                neutral: {
                    50: colors.neutral[50],
                    100: colors.neutral[100],
                    200: colors.neutral[200],
                    300: colors.neutral[300],
                    400: colors.neutral[400],
                    500: colors.neutral[500],
                    600: colors.neutral[600],
                    700: '#17171B',
                    800: '#212121',
                    900: '#121212',
                }
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
