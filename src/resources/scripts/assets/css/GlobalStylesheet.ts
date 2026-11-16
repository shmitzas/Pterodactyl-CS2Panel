import { createGlobalStyle } from 'styled-components/macro';

export default createGlobalStyle`
    html {
        min-height: 100%;
        background: var(--color-paper);
    }

    body {
        min-height: 100vh;
        color: var(--color-ink);
        font-family: var(--font-body);
        line-height: 1.55;
        -webkit-font-smoothing: antialiased;
        caret-color: var(--color-accent);
    }

    /* Served from public/; kept out of the CSS files so css-loader doesn't try to bundle it. */
    body::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: -1;
        background: url('/cs2/background.webp') center / cover no-repeat;
        filter: var(--bg-image-filter);
        opacity: var(--bg-image-opacity);
        pointer-events: none;
    }

    h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-display);
        font-weight: 600;
        letter-spacing: -0.01em;
        font-synthesis: none;
    }

    p {
        color: var(--color-ink-2);
        line-height: 1.375;
    }

    form {
        margin: 0;
    }

    code, kbd, samp, pre {
        font-family: var(--font-mono);
    }

    ::selection {
        background: color-mix(in oklab, var(--color-accent) 35%, transparent);
        color: var(--color-ink);
    }

    :focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    /* Fields draw their own focus ring. */
    textarea:focus-visible, select:focus-visible, input:focus-visible {
        outline: none;
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    * {
        scrollbar-color: var(--color-rule-2) transparent;
    }

    ::-webkit-scrollbar {
        background: none;
        width: 14px;
        height: 14px;
    }

    ::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        border-radius: 999px;
        background: var(--color-rule-2) padding-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: var(--color-muted) padding-box;
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }
`;
