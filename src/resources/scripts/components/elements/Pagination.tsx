import React from 'react';
import classNames from 'classnames';
import { PaginatedResult } from '@/api/http';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleLeft, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import styles from './Pagination.module.css';

interface RenderFuncProps<T> {
    items: T[];
    isLastPage: boolean;
    isFirstPage: boolean;
}

interface Props<T> {
    data: PaginatedResult<T>;
    showGoToLast?: boolean;
    showGoToFirst?: boolean;
    onPageSelect: (page: number) => void;
    children: (props: RenderFuncProps<T>) => React.ReactNode;
}

function Pagination<T>({ data: { items, pagination }, onPageSelect, children }: Props<T>) {
    const isFirstPage = pagination.currentPage === 1;
    const isLastPage = pagination.currentPage >= pagination.totalPages;

    const pages = [];

    // Start two spaces before the current page. If that puts us before the starting page default
    // to the first page as the starting point.
    const start = Math.max(pagination.currentPage - 2, 1);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 5);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <>
            {children({ items, isFirstPage, isLastPage })}
            {pages.length > 1 && (
                <nav className={styles.pagination}>
                    {pages[0] > 1 && !isFirstPage && (
                        <button type={'button'} className={styles.page} onClick={() => onPageSelect(1)}>
                            <FontAwesomeIcon icon={faAngleDoubleLeft} />
                        </button>
                    )}
                    {pages.map((i) => (
                        <button
                            type={'button'}
                            key={`block_page_${i}`}
                            className={classNames(styles.page, pagination.currentPage === i && styles.active)}
                            aria-current={pagination.currentPage === i ? 'page' : undefined}
                            onClick={() => onPageSelect(i)}
                        >
                            {i}
                        </button>
                    ))}
                    {pages[4] < pagination.totalPages && !isLastPage && (
                        <button
                            type={'button'}
                            className={styles.page}
                            onClick={() => onPageSelect(pagination.totalPages)}
                        >
                            <FontAwesomeIcon icon={faAngleDoubleRight} />
                        </button>
                    )}
                </nav>
            )}
        </>
    );
}

export default Pagination;
