import React, { forwardRef } from 'react';
import { Form } from 'formik';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrosshairs } from '@fortawesome/free-solid-svg-icons';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from '@/state/hooks';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state) => state.settings.data!.name);

    return (
        <div css={tw`mx-auto w-full max-w-md`}>
            <div css={tw`mb-6 flex items-center justify-center gap-3`}>
                <span className={'cs2-brand-mark'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faCrosshairs} />
                </span>
                <span css={tw`font-header text-xl font-semibold text-ink`}>{name}</span>
            </div>
            <div className={'cs2-card'} css={tw`p-6 sm:p-8`}>
                {title && <h1 css={tw`mb-6 text-center text-2xl text-ink`}>{title}</h1>}
                <FlashMessageRender css={tw`mb-4`} />
                <Form {...props} ref={ref}>
                    <div css={tw`w-full`}>{props.children}</div>
                </Form>
            </div>
            <p css={tw`text-center text-muted text-xs mt-4`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <a
                    rel={'noopener nofollow noreferrer'}
                    href={'https://pterodactyl.io'}
                    target={'_blank'}
                    css={tw`no-underline text-muted hover:text-ink`}
                >
                    Pterodactyl Software
                </a>
            </p>
        </div>
    );
});
