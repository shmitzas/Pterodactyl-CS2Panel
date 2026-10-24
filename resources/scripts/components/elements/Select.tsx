import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

interface Props {
    hideDropdownArrow?: boolean;
}

const Select = styled.select<Props>`
    ${tw`shadow-none block p-3 pr-8 rounded-lg w-full text-sm transition-all duration-150 ease-linear`};
    border: 1px solid rgba(255, 255, 255, 0.12);
    background-color: rgba(15, 22, 33, 0.7);
    color: #fff;

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

    /* The native option list ignores the translucent select background. */
    & option {
        background-color: #0f1621;
        color: #fff;
    }

    &:hover:not(:disabled) {
        border-color: rgba(13, 202, 240, 0.35);
    }

    &:focus {
        border-color: rgba(13, 202, 240, 0.6);
        box-shadow: 0 0 0 3px rgba(13, 202, 240, 0.12);
    }

    &:disabled {
        border-color: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.45);
    }

    ${(props) =>
        !props.hideDropdownArrow &&
        css`
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3e%3cpath fill='%230dcaf0' d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z'/%3e%3c/svg%3e ");
        `};
`;

export default Select;
