import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { ScrollDownHelperAddon } from '@/plugins/XtermScrollDownHelperAddon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { theme as th } from 'twin.macro';
import useEventListener from '@/plugins/useEventListener';
import { debounce } from 'debounce';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faSearch, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/elements/button/index';
import PanelConfig from '@/config';

import 'xterm/css/xterm.css';
import styles from './style.module.css';

// The v2 palette on the console's paper-3 well; xterm draws on a canvas, so it needs literal colours.
const theme = {
    background: th`colors.paper.3`.toString(),
    foreground: th`colors.ink.2`.toString(),
    cursor: 'transparent',
    black: th`colors.rule.DEFAULT`.toString(),
    red: th`colors.bad`.toString(),
    green: th`colors.ok`.toString(),
    yellow: th`colors.warn`.toString(),
    blue: th`colors.accent.text`.toString(),
    magenta: th`colors.mem`.toString(),
    cyan: th`colors.cpu`.toString(),
    white: th`colors.ink.2`.toString(),
    brightBlack: th`colors.muted`.toString(),
    brightRed: '#ff9a9a',
    brightGreen: '#8ef0a8',
    brightYellow: '#ffd772',
    brightBlue: '#b4c4ff',
    brightMagenta: '#e3b8ff',
    brightCyan: '#7eeaf8',
    brightWhite: th`colors.ink.DEFAULT`.toString(),
    selection: 'rgba(77, 95, 228, 0.45)',
};

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: 13,
    fontFamily: th('fontFamily.mono'),
    rows: 30,
    theme: theme,
};

export default () => {
    const TERMINAL_PRELUDE = `\u001b[1m\u001b[33m${PanelConfig.TERMINAL_PRELUDE} \u001b[0m`;
    const ref = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const searchBarRef = useRef<SearchBarAddon>();
    // The addons below are rebuilt on every render; these keep the instances the terminal actually loaded.
    const fitAddonRef = useRef<FitAddon>();
    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    const searchBar = new SearchBarAddon({ searchAddon });
    const webLinksAddon = new WebLinksAddon();
    const unicode11Addon = new Unicode11Addon();
    const scrollDownHelperAddon = new ScrollDownHelperAddon();
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);
    // SearchBarAddon has hardcoded z-index: 999 :(
    const zIndex = `
    .xterm-search-bar__addon {
        z-index: 10;
    }`;

    const handleConsoleOutput = (line: string, prelude = false) =>
        terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');

    const handleTransferStatus = (status: string) => {
        switch (status) {
            // Sent by either the source or target node if a failure occurs.
            case 'failure':
                terminal.writeln(TERMINAL_PRELUDE + 'Transfer has failed.\u001b[0m');
                return;
        }
    };

    const handleDaemonErrorOutput = (line: string) =>
        terminal.writeln(
            TERMINAL_PRELUDE + '\u001b[1m\u001b[41m' + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m'
        );

    const handlePowerChangeEvent = (state: string) =>
        terminal.writeln(TERMINAL_PRELUDE + 'Server marked as ' + state + '...\u001b[0m');

    const sendCommand = (field: HTMLInputElement) => {
        const command = field.value;
        if (!command.length) return;

        setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
        setHistoryIndex(-1);

        instance && instance.send('send command', command);
        field.value = '';
    };

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);

            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';

            // By default up arrow will also bring the cursor to the start of the line,
            // so we'll preventDefault to keep it at the end.
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);

            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }
    };

    useEffect(() => {
        if (!connected || !ref.current || terminal.element) return;

        let cancelled = false;
        // xterm measures its cells when it opens, so load the web font first or the glyphs misalign.
        const fontLoaded = document.fonts
            ? document.fonts.load(`${terminalProps.fontSize}px "JetBrains Mono"`).catch(() => undefined)
            : Promise.resolve();

        fontLoaded.then(() => {
            if (cancelled || !ref.current || terminal.element) return;

            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBar);
            terminal.loadAddon(webLinksAddon);
            terminal.loadAddon(unicode11Addon);
            terminal.loadAddon(scrollDownHelperAddon);
            searchBarRef.current = searchBar;
            fitAddonRef.current = fitAddon;

            terminal.open(ref.current);

            // Activate Unicode 11 for proper emoji and special character width handling
            terminal.unicode.activeVersion = '11';

            fitAddon.fit();
            searchBar.addNewStyle(zIndex);

            // Add support for capturing keys
            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchBar.show();
                    return false;
                } else if (e.key === 'Escape') {
                    searchBar.hidden();
                }
                return true;
            });
        });

        return () => {
            cancelled = true;
        };
    }, [terminal, connected]);

    useEventListener(
        'resize',
        debounce(() => {
            if (terminal.element) {
                fitAddonRef.current?.fit();
            }
        }, 100)
    );

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            // Do not clear the console if the server is being transferred.
            if (!isTransferring) {
                terminal.clear();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance]);

    return (
        <section className={classNames('cs2-card cs2-tone-accent', styles.console)} aria-labelledby={'console-title'}>
            <div className={classNames('cs2-card-head', styles.console_head)}>
                <span className={'cs2-tile'} aria-hidden={'true'}>
                    <FontAwesomeIcon icon={faTerminal} />
                </span>
                <div className={'cs2-card-titles'}>
                    <h2 className={'cs2-card-title'} id={'console-title'}>
                        Console
                    </h2>
                </div>
                <span className={classNames('cs2-pill', connected ? 'cs2-tone-ok' : 'cs2-tone-warn')} role={'status'}>
                    <span className={'cs2-pill-dot'} />
                    {connected ? 'Connected' : 'Connecting…'}
                </span>
                <Button.Text
                    size={Button.Sizes.Small}
                    variant={Button.Variants.Secondary}
                    disabled={!connected}
                    onClick={() => searchBarRef.current?.show()}
                >
                    <FontAwesomeIcon icon={faSearch} />
                    Search
                </Button.Text>
            </div>
            <div className={styles.terminal}>
                <SpinnerOverlay visible={!connected} size={'large'} />
                <div id={styles.terminal} ref={ref} />
            </div>
            {canSendCommands ? (
                <form
                    className={styles.command}
                    onSubmit={(e) => {
                        e.preventDefault();
                        input.current && sendCommand(input.current);
                    }}
                >
                    <label className={classNames(styles.prompt, (!instance || !connected) && styles.prompt_disabled)}>
                        <FontAwesomeIcon icon={faChevronRight} />
                        <span className={'sr-only'}>Command</span>
                        <input
                            ref={input}
                            type={'text'}
                            placeholder={'Type a command…'}
                            disabled={!instance || !connected}
                            onKeyDown={handleCommandKeyDown}
                            autoComplete={'off'}
                            autoCorrect={'off'}
                            autoCapitalize={'none'}
                            spellCheck={false}
                        />
                    </label>
                    <Button type={'submit'} disabled={!instance || !connected}>
                        Send
                    </Button>
                </form>
            ) : (
                <div className={'h-4'} />
            )}
        </section>
    );
};