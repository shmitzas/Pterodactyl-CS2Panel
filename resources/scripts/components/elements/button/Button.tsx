import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { ButtonProps, Options } from '@/components/elements/button/types';
import styles from './style.module.css';

type Kind = 'primary' | 'text' | 'danger' | 'success' | 'warning';

const kinds: Record<Kind, string | undefined> = {
    primary: styles.primary,
    text: undefined,
    danger: classNames(styles.soft, styles.danger),
    success: classNames(styles.soft, styles.success),
    warning: classNames(styles.soft, styles.warning),
};

const make = (kind: Kind) => {
    const component = forwardRef<HTMLButtonElement, ButtonProps>(
        ({ children, shape, size, variant, className, ...rest }, ref) => (
            <button
                ref={ref}
                className={classNames(
                    styles.button,
                    kinds[kind],
                    {
                        [styles.secondary]: variant === Options.Variant.Secondary,
                        [styles.square]: shape === Options.Shape.IconSquare,
                        [styles.small]: size === Options.Size.Small,
                        [styles.large]: size === Options.Size.Large,
                    },
                    className
                )}
                {...rest}
            >
                {children}
            </button>
        )
    );
    component.displayName = kind === 'primary' ? 'Button' : `Button(${kind})`;

    return component;
};

const Button = make('primary');

const _Button = Object.assign(Button, {
    Sizes: Options.Size,
    Shapes: Options.Shape,
    Variants: Options.Variant,
    Text: make('text'),
    Danger: make('danger'),
    Success: make('success'),
    Warning: make('warning'),
});

export default _Button;
