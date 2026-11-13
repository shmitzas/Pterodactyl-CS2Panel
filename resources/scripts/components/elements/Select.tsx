import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

interface Props {
    hideDropdownArrow?: boolean;
}

const Select = styled.select<Props>`
    ${tw`shadow-none block w-full`};
    min-height: var(--control);
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    border: 1px solid var(--color-rule-2);
    border-radius: var(--radius-control);
    background-color: var(--color-paper-3);
    color: var(--color-ink);
    font-size: var(--text-sm);
    transition: border-color var(--dur-short) var(--ease-out), box-shadow var(--dur-short) var(--ease-out);

    &,
    &:hover:not(:disabled),
    &:focus {
        ${tw`outline-none`};
    }

    -webkit-appearance: none;
    -moz-appearance: none;
    background-size: 1rem;
    background-repeat: no-repeat;
    background-position-x: calc(100% - 0.75rem);
    background-position-y: center;

    &::-ms-expand {
        display: none;
    }

    /* The native option list ignores the select's own background. */
    & option {
        background-color: var(--color-paper-2);
        color: var(--color-ink);
    }

    &:hover:not(:disabled) {
        border-color: var(--color-muted);
    }

    &:focus {
        border-color: var(--color-accent-text);
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-accent) 35%, transparent);
    }

    &:disabled {
        border-color: var(--color-rule);
        background-color: var(--color-paper-2);
        color: var(--color-muted);
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%238ea5fd' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e ");
        `};
`;

export default Select;