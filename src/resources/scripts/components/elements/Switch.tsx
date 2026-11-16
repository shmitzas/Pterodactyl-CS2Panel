import React, { useMemo } from 'react';
import styled from 'styled-components/macro';
import { v4 } from 'uuid';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';

const ToggleContainer = styled.div`
    ${tw`relative select-none w-11 leading-normal`};

    /* Visually hidden rather than display:none so the switch stays keyboard focusable. */
    & > input[type='checkbox'] {
        ${tw`absolute w-px h-px m-0 p-0 opacity-0 overflow-hidden`};

        &:checked + label {
            border-color: var(--color-accent);
            background: var(--color-accent);
        }

        &:checked + label:before {
            transform: translateX(1.25rem);
            background: var(--color-accent-ink);
        }

        &:focus-visible + label {
            outline: 2px solid var(--color-focus);
            outline-offset: 2px;
        }

        &:disabled + label {
            ${tw`opacity-50 cursor-not-allowed`};
        }
    }

    & > label {
        ${tw`mb-0 block cursor-pointer rounded-full h-6`};
        border: 1px solid var(--color-rule-2);
        background: var(--color-paper-3);
        transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out);

        &::before {
            ${tw`absolute block h-4 w-4 rounded-full`};
            top: 0.25rem;
            left: 0.25rem;
            content: '';
            background: var(--color-muted);
            transition: transform var(--dur-short) var(--ease-out), background-color var(--dur-short) var(--ease-out);
        }
    }
`;
export interface SwitchProps {
    name: string;
    label?: string;
    description?: string;
    defaultChecked?: boolean;
    readOnly?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Switch = ({ name, label, description, defaultChecked, readOnly, onChange, children }: SwitchProps) => {
    const uuid = useMemo(() => v4(), []);

    return (
        <div css={tw`flex items-center`}>
            <ToggleContainer css={tw`flex-none`}>
                {children || (
                    <Input
                        id={uuid}
                        name={name}
                        type={'checkbox'}
                        onChange={(e) => onChange && onChange(e)}
                        defaultChecked={defaultChecked}
                        disabled={readOnly}
                    />
                )}
                <Label htmlFor={uuid} />
            </ToggleContainer>
            {(label || description) && (
                <div css={tw`ml-4 w-full`}>
                    {label && (
                        <Label css={[tw`cursor-pointer`, !!description && tw`mb-0`]} htmlFor={uuid}>
                            {label}
                        </Label>
                    )}
                    {description && <p css={tw`text-muted text-sm mt-2`}>{description}</p>}
                </div>
            )}
        </div>
    );
};

export default Switch;
