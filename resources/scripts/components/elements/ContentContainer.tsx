import styled from 'styled-components/macro';

// Spacing comes from the page frame (.cs2-page / .cs2-main), so the block itself adds none.
const ContentContainer = styled.div`
    min-width: 0;
`;
ContentContainer.displayName = 'ContentContainer';
ContentContainer.defaultProps = {
    className: 'content-container',
};

export default ContentContainer;
