import React from 'react';
import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';

interface Props {
    isLoading?: boolean;
    size?: 'xsmall' | 'small' | 'large' | 'xlarge';
    color?: 'green' | 'red' | 'primary' | 'grey';
    isSecondary?: boolean;
}

// Legacy button, restyled to match the tinted outline buttons in elements/button.
const tones: Record<NonNullable<Props['color']>, string> = {
    primary: '13, 202, 240',
    green: '25, 238, 25',
    red: '255, 19, 19',
    grey: '255, 255, 255',
};

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    --tone: ${(props) => tones[props.color || 'primary']};
    ${tw`relative inline-flex items-center justify-center rounded-lg p-2 font-semibold tracking-wide text-sm transition-all duration-150 border`};
    border-color: rgba(var(--tone), 0.5);
    background-color: rgba(var(--tone), 0.1);
    color: rgb(var(--tone));

    &:hover:not(:disabled) {
        border-color: rgb(var(--tone));
        background-color: rgba(var(--tone), 0.2);
        color: #fff;
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(var(--tone), 0.25);
    }

    ${(props) => props.size === 'xsmall' && tw`px-2 py-1 text-xs`};
    ${(props) => (!props.size || props.size === 'small') && tw`px-4 py-2`};
    ${(props) => props.size === 'large' && tw`p-4 text-sm`};
    ${(props) => props.size === 'xlarge' && tw`p-4 w-full`};

    ${(props) =>
        props.isSecondary &&
        css`
            border-color: rgba(255, 255, 255, 0.15);
            background-color: transparent;
            color: rgba(255, 255, 255, 0.8);

            &:hover:not(:disabled) {
                border-color: rgba(var(--tone), 0.6);
                background-color: rgba(var(--tone), 0.12);
                color: rgb(var(--tone));
            }
        `};

    &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

type ComponentProps = Omit<JSX.IntrinsicElements['button'], 'ref' | keyof Props> & Props;

const Button: React.FC<ComponentProps> = ({ children, isLoading, ...props }) => (
    <ButtonStyle {...props}>
        {isLoading && (
            <div css={tw`flex absolute justify-center items-center w-full h-full left-0 top-0`}>
                <Spinner size={'small'} />
            </div>
        )}
        <span css={isLoading ? tw`text-transparent` : undefined}>{children}</span>
    </ButtonStyle>
);

type LinkProps = Omit<JSX.IntrinsicElements['a'], 'ref' | keyof Props> & Props;

const LinkButton: React.FC<LinkProps> = (props) => <ButtonStyle as={'a'} {...props} />;

export { LinkButton, ButtonStyle };
export default Button;
