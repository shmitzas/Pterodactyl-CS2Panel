import styled from 'styled-components/macro';
import tw from 'twin.macro';

// isLight is kept for callers written for the old light login card; v2 labels are always on dark.
const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-sm font-semibold text-ink-2 mb-1.5 sm:mb-2`};
`;

export default Label;