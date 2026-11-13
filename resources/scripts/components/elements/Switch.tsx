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
            border-color: rgba(13, 202, 240, 0.6);
            background: rgba(13, 202, 240, 0.25);
        }

        &:checked + label:before {
            transform: translateX(1.25rem);
            background: #0dcaf0;
            box-shadow: 0 0 10px rgba(13, 202, 240, 0.6);
        }

        &:focus-visible + label {
            box-shadow: 0 0 0 3px rgba(13, 202, 240, 0.25);
        }

        &:disabled + label {
            ${tw`opacity-50 cursor-not-allowed`};
        }
    }

    & > label {
        ${tw`mb-0 block cursor-pointer rounded-full h-6`};
        border: 1px solid rgba(255, 255, 255, 0.15);
        background: rgba(255, 255, 255, 0.08);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &::before {
            ${tw`absolute block h-4 w-4 rounded-full`};
            top: 0.25rem;
            left: 0.25rem;
            content: '';
            background: rgba(255, 255, 255, 0.7);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
                    {description && <p css={tw`text-neutral-400 text-sm mt-2`}>{description}</p>}
                </div>
            )}
        </div>
    );
};

export default Switch;
