import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export interface Props {
    isLight?: boolean;
    hasError?: boolean;
}

const light = css<Props>`
    ${tw`bg-white border-neutral-200 text-neutral-800`};
    &:focus {
        ${tw`border-primary-400`}
    }

    &:disabled {
        ${tw`bg-neutral-100 border-neutral-200`};
    }
`;

const checkboxStyle = css<Props>`
    ${tw`cursor-pointer appearance-none inline-block align-middle select-none flex-shrink-0 w-4 h-4`};
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 0.25rem;
    background-color: rgba(0, 0, 0, 0.4);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%230f1621' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3.5 8.5l3 3 6-7'/%3E%3C/svg%3E");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 0% 0%;
    color-adjust: exact;
    transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-size 0.2s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:checked {
        border-color: #0dcaf0;
        background-color: #0dcaf0;
        background-size: 100% 100%;
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(13, 202, 240, 0.25);
    }
`;

const inputStyle = css<Props>`
    // Reset to normal styling.
    resize: none;
    ${tw`appearance-none outline-none w-full min-w-0`};
    ${tw`p-3 rounded-lg text-sm transition-all duration-150`};
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: rgba(15, 22, 33, 0.7);
    color: #fff;
    box-shadow: none;

    &::placeholder {
        color: rgba(255, 255, 255, 0.35);
    }

    &:hover {
        border-color: rgba(13, 202, 240, 0.35);
    }

    & + .input-help {
        ${tw`mt-1 text-xs`};
        ${(props) => (props.hasError ? tw`text-bad` : tw`text-neutral-200`)};
    }

    &:required,
    &:invalid {
        box-shadow: none;
    }

    &:not(:disabled):not(:read-only):focus {
        border-color: rgba(13, 202, 240, 0.6);
        background-color: rgba(15, 22, 33, 0.85);
        box-shadow: 0 0 0 3px rgba(13, 202, 240, 0.12), 0 0 12px rgba(13, 202, 240, 0.08);

        ${(props) =>
            props.hasError &&
            css`
                border-color: rgba(255, 19, 19, 0.6);
                box-shadow: 0 0 0 3px rgba(255, 19, 19, 0.15);
            `};
    }

    &:disabled {
        border-color: rgba(255, 255, 255, 0.06);
        background-color: rgba(15, 22, 33, 0.4);
        color: rgba(255, 255, 255, 0.45);
    }

    ${(props) => props.isLight && light};
    ${(props) =>
        props.hasError &&
        css`
            border-color: rgba(255, 19, 19, 0.6);
            color: #fecaca;
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
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='3.5' fill='%230f1621'/%3E%3C/svg%3E");
        }
    }
`;
const Textarea = styled.textarea<Props>`
    ${inputStyle}
`;

export { Textarea };
export default Input;
