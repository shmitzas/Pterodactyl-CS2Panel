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

// Legacy button, drawn like elements/button: primary is solid accent, green and red are soft tones.
const tones: Record<NonNullable<Props['color']>, string | undefined> = {
    primary: 'var(--color-accent-text)',
    green: 'var(--color-ok)',
    red: 'var(--color-bad)',
    grey: undefined,
};

const ButtonStyle = styled.button<Omit<Props, 'isLoading'>>`
    ${(props) => tones[props.color || 'primary'] && `--tone: ${tones[props.color || 'primary']};`}
    ${tw`relative inline-flex items-center justify-center gap-2 font-bold text-sm whitespace-nowrap`};
    min-height: var(--control);
    padding: 0 var(--space-md);
    border: 1px solid var(--color-rule-2);
    border-radius: var(--radius-control);
    background: transparent;
    color: var(--color-ink);
    line-height: 1;
    transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out),
        color var(--dur-short) var(--ease-out), transform var(--dur-micro) var(--ease-out);

    &:hover:not(:disabled) {
        border-color: var(--color-muted);
        background: var(--color-raise);
    }

    &:active:not(:disabled) {
        transform: translateY(1px);
    }

    &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    ${(props) =>
        !props.isSecondary &&
        (props.color || 'primary') === 'primary' &&
        css`
            border-color: var(--color-accent);
            background: var(--color-accent);
            color: var(--color-accent-ink);

            &:hover:not(:disabled) {
                border-color: var(--color-accent-hover);
                background: var(--color-accent-hover);
            }
        `};

    ${(props) =>
        !props.isSecondary &&
        (props.color === 'green' || props.color === 'red') &&
        css`
            border-color: color-mix(in oklab, var(--tone) 32%, var(--color-paper-2));
            background: color-mix(in oklab, var(--tone) 14%, var(--color-paper-2));
            color: var(--tone);

            &:hover:not(:disabled) {
                border-color: color-mix(in oklab, var(--tone) 55%, var(--color-paper-2));
                background: color-mix(in oklab, var(--tone) 22%, var(--color-paper-2));
            }
        `};

    ${(props) =>
        props.isSecondary &&
        css`
            border-color: transparent;
            color: var(--tone, var(--color-ink-2));

            &:hover:not(:disabled) {
                border-color: color-mix(in oklab, var(--tone, var(--color-rule-2)) 32%, var(--color-paper-2));
                background: color-mix(in oklab, var(--tone, var(--color-ink)) 10%, var(--color-paper-2));
                color: var(--tone, var(--color-ink));
            }
        `};

    ${(props) =>
        props.size === 'xsmall' &&
        css`
            min-height: 28px;
            padding: 0 var(--space-xs);
            font-size: var(--text-xs);
        `};
    ${(props) =>
        (props.size === 'large' || props.size === 'xlarge') &&
        css`
            min-height: 44px;
            padding: 0 var(--space-lg);
        `};
    ${(props) => props.size === 'xlarge' && tw`w-full`};

    &:disabled {
        opacity: 0.5;
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
