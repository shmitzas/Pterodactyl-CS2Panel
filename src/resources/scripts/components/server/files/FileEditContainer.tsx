import React, { useCallback, useEffect, useState } from 'react';
import getFileContents from '@/api/server/files/getFileContents';
import { httpErrorToHuman } from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import saveFileContents from '@/api/server/files/saveFileContents';
import FileManagerBreadcrumbs from '@/components/server/files/FileManagerBreadcrumbs';
import { useHistory, useLocation, useParams } from 'react-router';
import FileNameModal from '@/components/server/files/FileNameModal';
import Can from '@/components/elements/Can';
import FlashMessageRender from '@/components/FlashMessageRender';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { ServerError } from '@/components/elements/ScreenBlock';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import Code from '@/components/elements/Code';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFileMedical, faSave } from '@fortawesome/free-solid-svg-icons';
import styles from './style.module.css';
import Select from '@/components/elements/Select';
import modes from '@/modes';
import useFlash from '@/plugins/useFlash';
import { ServerContext } from '@/state/server';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { encodePathSegments, hashToPath } from '@/helpers';
import { dirname } from 'pathe';
import CodemirrorEditor from '@/components/elements/CodemirrorEditor';

const isMac = /mac/i.test(navigator.platform);

const getNewFileDraftKey = (uuid: string, directory: string) => `pterodactyl:new-file:${uuid}:${directory}`;

export default () => {
    const [error, setError] = useState('');
    const { action } = useParams<{ action: 'new' | string }>();
    const [loading, setLoading] = useState(action === 'edit');
    const [content, setContent] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [mode, setMode] = useState('text/plain');

    const history = useHistory();
    const { hash } = useLocation();

    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const setDirectory = ServerContext.useStoreActions((actions) => actions.files.setDirectory);
    const { addError, clearFlashes } = useFlash();

    const filePath = hashToPath(hash);
    const directory = action === 'new' ? filePath : dirname(filePath);
    const draftKey = action === 'new' ? getNewFileDraftKey(uuid, directory) : undefined;
    const saveDraft = useCallback(
        (value: string) => {
            if (!draftKey) return;

            if (value.length > 0) {
                sessionStorage.setItem(draftKey, value);
            } else {
                sessionStorage.removeItem(draftKey);
            }
        },
        [draftKey]
    );

    let fetchFileContent: null | (() => Promise<string>) = null;

    useEffect(() => {
        setDirectory(directory);
    }, [directory, setDirectory]);

    useEffect(() => {
        if (!draftKey) return;

        setContent(sessionStorage.getItem(draftKey) || '');
    }, [draftKey]);

    useEffect(() => {
        if (action === 'new') return;

        setError('');
        setLoading(true);
        getFileContents(uuid, filePath)
            .then(setContent)
            .catch((error) => {
                console.error(error);
                setError(httpErrorToHuman(error));
            })
            .then(() => setLoading(false));
    }, [action, uuid, filePath]);

    const save = async (name?: string) => {
        if (!fetchFileContent) {
            return;
        }

        setLoading(true);
        clearFlashes('files:view');

        let redirecting = false;

        try {
            const content = await fetchFileContent();

            await saveFileContents(uuid, name || filePath, content);

            if (name) {
                if (draftKey) {
                    sessionStorage.removeItem(draftKey);
                }

                history.push(`/server/${id}/files/edit#/${encodePathSegments(name)}`);
                redirecting = true;
                return;
            }
        } catch (error) {
            console.error(error);
            addError({ message: httpErrorToHuman(error), key: 'files:view' });
        } finally {
            if (!redirecting) {
                setLoading(false);
            }
        }
    };

    if (error) {
        return <ServerError message={error} onBack={() => history.goBack()} />;
    }

    return (
        <PageContentBlock>
            <FlashMessageRender byKey={'files:view'} css={tw`mb-4`} />
            <ErrorBoundary>
                <div className={classNames('cs2-card cs2-tone-accent', styles.toolbar)}>
                    <span className={'cs2-tile cs2-tile--sm'} aria-hidden={'true'}>
                        <FontAwesomeIcon icon={action === 'edit' ? faFileAlt : faFileMedical} />
                    </span>
                    <FileManagerBreadcrumbs withinFileEditor isNewFile={action !== 'edit'} />
                </div>
            </ErrorBoundary>
            {hash.replace(/^#/, '').endsWith('.pteroignore') && (
                <div className={'cs2-notice cs2-tone-net mb-4'}>
                    <p className={'text-sm text-ink-2'}>
                        You&apos;re editing a <Code dark>.pteroignore</Code> file. Any files or directories listed in
                        here will be excluded from backups. Wildcards are supported by using an asterisk (
                        <Code dark>*</Code>). You can negate a prior rule by prepending an exclamation point (
                        <Code dark>!</Code>).
                    </p>
                </div>
            )}
            <FileNameModal
                visible={modalVisible}
                onDismissed={() => setModalVisible(false)}
                onFileNamed={(name) => {
                    setModalVisible(false);
                    save(name);
                }}
            />
            <div className={classNames('cs2-card', styles.editor)}>
                <div className={styles.editor_body}>
                    <SpinnerOverlay visible={loading} />
                    <CodemirrorEditor
                        mode={mode}
                        filename={hash.replace(/^#/, '')}
                        onModeChanged={setMode}
                        initialContent={content}
                        fetchContent={(value) => {
                            fetchFileContent = value;
                        }}
                        onContentSaved={() => {
                            if (action !== 'edit') {
                                setModalVisible(true);
                            } else {
                                save();
                            }
                        }}
                        onContentChanged={action === 'new' ? saveDraft : undefined}
                    />
                </div>
                <div className={styles.editor_bar}>
                    <div className={styles.editor_mode}>
                        <Select
                            value={mode}
                            aria-label={'Syntax highlighting'}
                            onChange={(e) => setMode(e.currentTarget.value)}
                        >
                            {modes.map((mode) => (
                                <option key={`${mode.name}_${mode.mime}`} value={mode.mime}>
                                    {mode.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <p className={styles.editor_hint}>
                        <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd> <kbd>S</kbd> {action === 'edit' ? 'saves' : 'creates'} the
                        file
                    </p>
                    {action === 'edit' ? (
                        <Can action={'file.update'}>
                            <Button onClick={() => save()}>
                                <FontAwesomeIcon icon={faSave} />
                                Save Content
                            </Button>
                        </Can>
                    ) : (
                        <Can action={'file.create'}>
                            <Button onClick={() => setModalVisible(true)}>
                                <FontAwesomeIcon icon={faSave} />
                                Create File
                            </Button>
                        </Can>
                    )}
                </div>
            </div>
        </PageContentBlock>
    );
};
