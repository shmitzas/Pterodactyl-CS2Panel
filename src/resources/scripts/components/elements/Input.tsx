import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    // Kept for callers written for the old light login card; v2 fields are always dark.
    isLight?: boolean;
    hasError?: boolean;
}

const checkboxStyle = css<Props>`
    ${tw`cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4`};
    border: 1px solid var(--color-rule-2);
    border-radius: 0.3rem;
    background-color: var(--color-paper-3);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23f7f8fc' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5l3 3 6-7'/%3E%3C/svg%3E");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 0% 0%;
    color-adjust: exact;
    transition: background-color var(--dur-short) var(--ease-out), background-size var(--dur-short) var(--ease-out),
        border-color var(--dur-short) var(--ease-out);

    &:hover:not(:disabled) {
        border-color: var(--color-muted);
    }

    &:checked {
        border-color: var(--color-accent);
        background-color: var(--color-accent);
        background-size: 100% 100%;
    }

    &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    &:disabled {
        ${tw`cursor-not-allowed opacity-50`};
    }
`;

const inputStyle = css<Props>`
    // Reset to normal styling.
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    min-height: var(--control);
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-rule-2);
    border-radius: var(--radius-control);
    background-color: var(--color-paper-3);
    color: var(--color-ink);
    font-size: var(--text-sm);
    box-shadow: none;
    transition: border-color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out);

    &::placeholder {
        color: var(--color-muted);
    }

    &:hover:not(:disabled):not(:read-only) {
        border-color: var(--color-muted);
    }

    & + .input-help {
        ${tw`mt-1 text-xs`};
        ${(props) => (props.hasError ? tw`text-bad` : tw`text-muted`)};
    }

    &:required,
    &:invalid {
        box-shadow: none;
    }

    &:not(:disabled):not(:read-only):focus {
        border-color: var(--color-accent-text);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 35%, transparent);

        ${(props) =>
            props.hasError &&
            css`
                border-color: var(--color-bad);
                box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-bad) 30%, transparent);
            `};
    }

    &:disabled {
        border-color: var(--color-rule);
        background-color: var(--color-paper-2);
        color: var(--color-muted);
        cursor: not-allowed;
    }

    ${(props) =>
        props.hasError &&
        css`
            border-color: var(--color-bad);
        `};
`;

const Input = styled.input<Props>`
    &:not([type='checkbox']):not([type='radio']) {
        ${inputStyle};
    }

    &[type='checkbox'],
    &[type='radio'] {
        ${checkboxStyle};

        &[type='radio'] {
            ${tw`rounded-full`};
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='3.5' fill='%23f7f8fc'/%3E%3C/svg%3E");
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
