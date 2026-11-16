import React from 'react';
import Spinner, { SpinnerSize } from '@/components/elements/Spinner';
import Fade from '@/components/elements/Fade';
import tw from 'twin.macro';

interface Props {
    visible: boolean;
    fixed?: boolean;
    size?: SpinnerSize;
    backgroundOpacity?: number;
}

const SpinnerOverlay: React.FC<Props> = ({ size, fixed, visible, backgroundOpacity, children }) => (
    <Fade timeout={150} in={visible} unmountOnExit>
        <div
            css={[
                tw`top-0 left-0 flex items-center justify-center w-full h-full rounded flex-col`,
                // In-page overlays stay under the sidebar drawer (z-35); fixed ones cover the whole UI.
                !fixed ? tw`absolute z-30` : tw`fixed z-40`,
            ]}
            style={{
                background: `color-mix(in oklab, var(--color-paper-3) ${Math.round(
                    (backgroundOpacity || 0.55) * 100
                )}%, transparent)`,
            }}
        >
            <Spinner size={size} />
            {children && (typeof children === 'string' ? <p css={tw`mt-4 text-muted`}>{children}</p> : children)}
        </div>
    </Fade>
);

export default SpinnerOverlay;
