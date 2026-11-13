import styled from 'styled-components/macro';
import tw from 'twin.macro';

// A floating list row (the .cs2-row look); hover is opt-out for rows that are not interactive.
export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex items-center p-4 no-underline overflow-hidden`};
    border: 1px solid var(--color-rule);
    border-radius: var(--radius-inner);
    background: var(--color-paper-2);
    color: var(--color-ink-2);
    box-shadow: var(--shadow-card);
    transition: border-color var(--dur-short) var(--ease-out);

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            border-color: color-mix(in oklab, var(--color-accent-text) 55%, var(--color-rule));
        }
    `};
`;
