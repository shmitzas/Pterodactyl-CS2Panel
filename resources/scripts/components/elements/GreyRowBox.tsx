import styled from 'styled-components/macro';
import tw from 'twin.macro';

// Same look as the global .glass-row; hover is opt-out for rows that are not interactive.
export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex items-center rounded-xl p-4 no-underline text-neutral-200 overflow-hidden`};
    background: rgba(var(--cs2-surface), 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

    ${(props) =>
        props.$hoverable !== false &&
        `
        &:hover {
            background: rgba(var(--cs2-surface), 0.8);
            border-color: rgba(var(--cs2-accent), 0.3);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 12px rgba(var(--cs2-accent), 0.08);
        }
    `};
`;
