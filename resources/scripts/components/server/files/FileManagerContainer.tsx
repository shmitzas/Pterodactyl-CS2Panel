import React, { useEffect } from 'react';
import classNames from 'classnames';
import { httpErrorToHuman } from '@/api/http';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import FileObjectRow from '@/components/server/files/FileObjectRow';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { FileObject } from '@/api/server/files/loadDirectory';
import NewDirectoryButton from '@/components/server/files/NewDirectoryButton';
import { NavLink, useLocation } from 'react-router-dom';
import Can from '@/components/elements/Can';
import { ServerError } from '@/components/elements/ScreenBlock';
import { Button } from '@/components/elements/button/index';
import { ServerContext } from '@/state/server';
import useFileManagerSwr from '@/plugins/useFileManagerSwr';
import FileManagerStatus from '@/components/server/files/FileManagerStatus';
import MassActionsBar from '@/components/server/files/MassActionsBar';
import UploadButton from '@/components/server/files/UploadButton';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { useStoreActions } from '@/state/hooks';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { FileActionCheckbox } from '@/components/server/files/SelectFileCheckbox';
import { hashToPath } from '@/helpers';
import PageHeader from '@/components/elements/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import styles from './style.module.css';

const sortFiles = (files: FileObject[]): FileObject[] => {
    const sortedFiles: FileObject[] = files
        .sort((a, b) => a.name.localeCompare(b.name))
        .sort((a, b) => (a.isFile === b.isFile ? 0 : a.isFile ? 1 : -1));
    return sortedFiles.filter((file, index) => index === 0 || file.name !== sortedFiles[index - 1].name);
};

export default () => {
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const { hash } = useLocation();
    const { data: files, error, mutate } = useFileManagerSwr();
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const clearFlashes = useStoreActions((actions) => actions.flashes.clearFlashes);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);

    const setSelectedFiles = ServerContext.useStoreActions((actions) => actions.files.setSelectedFiles);
    const selectedFilesLength = ServerContext.useStoreState((state) => state.files.selectedFiles.length);

    useEffect(() => {
        clearFlashes('files');
        setSelectedFiles([]);
        setDirectory(hashToPath(hash));
    }, [hash]);

    useEffect(() => {
        mutate();
    }, [directory]);

    const onSelectAllClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(e.currentTarget.checked ? files?.map((file) => file.name) || [] : []);
    };

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => mutate()} />;
    }

    return (
        <ServerContentBlock title={'File Manager'} showFlashKey={'files'}>
            <ErrorBoundary>
                <PageHeader
                    icon={faFolder}
                    title={'Files'}
                    description={'Open a file to edit it, or right-click a row for more actions.'}
                >
                    <Can action={'file.create'}>
                        <FileManagerStatus />
                        <NewDirectoryButton />
                        <UploadButton />
                        <NavLink to={`/server/${id}/files/new${window.location.hash}`}>
                            <Button>New File</Button>
                        </NavLink>
                    </Can>
                </PageHeader>
                <div className={classNames('cs2-card cs2-tone-accent', styles.toolbar)}>
                    <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                        <FontAwesomeIcon icon={faFolderOpen} />
                    </span>
                    <FileManagerBreadcrumbs />
                    {files && (
                        <span className={styles.toolbar_meta}>
                            {files.length} {files.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>
            </ErrorBoundary>
            {!files ? (
                <Spinner size={'large'} centered />
            ) : (
                <div className={classNames('cs2-card', styles.list)}>
                    <div className={styles.list_head}>
                        <label className={styles.check}>
                            <FileActionCheckbox
                                type={'checkbox'}
                                aria-label={'Select all'}
                                disabled={!files.length}
                                checked={selectedFilesLength === (files.length === 0 ? -1 : files.length)}
                                onChange={onSelectAllClick}
                            />
                        </label>
                        <div className={styles.details}>
                            <span className={styles.icon} />
                            <span className={styles.name}>Name</span>
                            <span className={styles.size}>Size</span>
                            <span className={styles.modified}>Modified</span>
                        </div>
                        <span className={styles.menu_spacer} />
                    </div>
                    {!files.length ? (
                        <div className={'cs2-empty'}>This directory seems to be empty.</div>
                    ) : (
                        <CSSTransition classNames={'fade'} timeout={150} appear in>
                            <div>
                                {sortFiles(files).map((file) => (
                                    <FileObjectRow key={file.key} file={file} />
                                ))}
                                <MassActionsBar />
                            </div>
                        </CSSTransition>
                    )}
                </div>
            )}
        </ServerContentBlock>
    );
};
