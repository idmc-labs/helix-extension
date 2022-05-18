import React, { useState, useMemo, useCallback } from 'react';
import { Router } from 'react-router-dom';
import { init, ErrorBoundary, setUser as setUserOnSentry } from '@sentry/react';
import { _cs, unique, isTruthyString } from '@togglecorp/fujs';
import { AlertContainer, AlertContext, AlertOptions } from '@the-deep/deep-ui';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import ReactGA from 'react-ga';

import '@togglecorp/toggle-ui/build/index.css';
import { v4 as uuidv4 } from 'uuid';
import { IoAlertCircle, IoCloseCircle, IoCheckmarkCircle } from 'react-icons/io5';

import Init from '#base/components/Init';
import Navbar from '#base/components/Navbar';
import PreloadMessage from '#base/components/PreloadMessage';
import browserHistory from '#base/configs/history';
import sentryConfig from '#base/configs/sentry';
import {
    ServerContext,
    ServerContextInterface,
    defaultServerConfig,
    SelectedConfigType,
} from '#base/context/ServerContext';
import { UserContext, UserContextInterface } from '#base/context/UserContext';
import { NavbarContext, NavbarContextInterface } from '#base/context/NavbarContext';
import AuthPopup from '#base/components/AuthPopup';
import NotificationContext, {
    NotificationContextProps,
    Notification,
    NotificationVariant,
} from '#base/context/NotificationContext';
import { sync } from '#base/hooks/useAuthSync';
import useLocalStorage from '#base/hooks/useLocalStorage';
import Routes from '#base/components/Routes';
import { User } from '#base/types/user';
import apolloConfig from '#base/configs/apollo';
import { trackingId, gaConfig } from '#base/configs/googleAnalytics';
import { ObjectError } from '#base/utils/errorTransform';

import styles from './styles.css';

if (sentryConfig) {
    init(sentryConfig);
}

if (trackingId) {
    ReactGA.initialize(trackingId, gaConfig);
    browserHistory.listen((location) => {
        const page = location.pathname ?? window.location.pathname;
        ReactGA.set({ page });
        ReactGA.pageview(page);
    });
}

const apolloClient = new ApolloClient(apolloConfig);

const defaultNotification: Notification = {
    icons: null,
    actions: null,
    children: null,
    duration: 5_000,

    horizontalPosition: 'middle',
    verticalPosition: 'end',
    variant: 'default',
};

const notificationVariantToClassNameMap: { [key in NotificationVariant]: string } = {
    default: styles.default,
    success: styles.success,
    error: styles.error,
};

function Base() {
    const [user, setUser] = useState<User | undefined>();

    const [navbarVisibility, setNavbarVisibility] = useState(false);
    const [notifications, setNotifications] = React.useState<{
        [key: string]: Notification;
    }>({});

    const [
        selectedConfig,
        setSelectedConfig,
    ] = useLocalStorage<SelectedConfigType>('stored-config', defaultServerConfig);

    const authenticated = !!user;

    const setUserWithSentry: typeof setUser = useCallback(
        (u) => {
            if (typeof u === 'function') {
                setUser((oldUser) => {
                    const newUser = u(oldUser);

                    const sanitizedUser = newUser;
                    sync(!!sanitizedUser, sanitizedUser?.id);
                    setUserOnSentry(sanitizedUser ?? null);

                    return newUser;
                });
            } else {
                const sanitizedUser = u;
                sync(!!sanitizedUser, sanitizedUser?.id);
                setUserOnSentry(sanitizedUser ?? null);
                setUser(u);
            }
        },
        [setUser],
    );

    const userContext: UserContextInterface = useMemo(
        () => ({
            authenticated,
            user,
            setUser: setUserWithSentry,
            navbarVisibility,
            setNavbarVisibility,
        }),
        [
            authenticated,
            user,
            setUserWithSentry,
            navbarVisibility,
            setNavbarVisibility,
        ],
    );

    const navbarContext: NavbarContextInterface = useMemo(
        () => ({
            navbarVisibility,
            setNavbarVisibility,
        }),
        [navbarVisibility, setNavbarVisibility],
    );

    const serverContext: ServerContextInterface = useMemo(
        () => ({
            selectedConfig,
            setSelectedConfig,
        }),
        [selectedConfig, setSelectedConfig],
    );

    const [alerts, setAlerts] = React.useState<AlertOptions[]>([]);

    const addAlert = React.useCallback(
        (alert: AlertOptions) => {
            setAlerts((prevAlerts) => unique(
                [...prevAlerts, alert],
                (a) => a.name,
            ) ?? prevAlerts);
        },
        [setAlerts],
    );

    const removeAlert = React.useCallback(
        (name: string) => {
            setAlerts((prevAlerts) => {
                const i = prevAlerts.findIndex((a) => a.name === name);
                if (i === -1) {
                    return prevAlerts;
                }

                const newAlerts = [...prevAlerts];
                newAlerts.splice(i, 1);

                return newAlerts;
            });
        },
        [setAlerts],
    );

    const updateAlertContent = React.useCallback(
        (name: string, children: React.ReactNode) => {
            setAlerts((prevAlerts) => {
                const i = prevAlerts.findIndex((a) => a.name === name);
                if (i === -1) {
                    return prevAlerts;
                }

                const updatedAlert = {
                    ...prevAlerts[i],
                    children,
                };

                const newAlerts = [...prevAlerts];
                newAlerts.splice(i, 1, updatedAlert);

                return newAlerts;
            });
        },
        [setAlerts],
    );

    const alertContext = React.useMemo(
        () => ({
            alerts,
            addAlert,
            updateAlertContent,
            removeAlert,
        }),
        [alerts, addAlert, updateAlertContent, removeAlert],
    );

    const dismiss = React.useCallback((id: string) => {
        setNotifications((oldNotifications) => {
            const newNotifications = { ...oldNotifications };
            delete newNotifications[id];

            return newNotifications;
        });
    }, [setNotifications]);

    const notify = React.useCallback((notification: Notification, id?: string) => {
        const notificationId = id ?? uuidv4();
        const data = {
            ...defaultNotification,
            ...notification,
        };
        setNotifications((oldNotifications) => ({
            ...oldNotifications,
            [notificationId]: data,
        }));

        if (data.duration !== Infinity) {
            window.setTimeout(() => {
                dismiss(notificationId);
            }, data.duration);
        }

        return notificationId;
    }, [setNotifications, dismiss]);

    const notifyGQLError = React.useCallback(
        (errors: unknown[], id?: string) => {
            const safeErrors = errors as ObjectError[];
            let errorString = safeErrors
                .filter((item) => item.field === 'nonFieldErrors')
                .map((item) => item.messages)
                .filter(isTruthyString)
                .join('\n');
            if (errorString === '') {
                errorString = 'Some error occurred!';
            }
            return notify({
                children: errorString,
                variant: 'error',
            }, id);
        },
        [notify],
    );

    const notificationContextValue: NotificationContextProps = React.useMemo(() => ({
        notify,
        notifyGQLError,
        dismiss,
    }), [notify, notifyGQLError, dismiss]);

    const notificationKeyList = Object.keys(notifications);
    return (
        <>
            <div className={styles.base}>
                <ErrorBoundary
                    showDialog
                    fallback={(
                        <PreloadMessage
                            heading="Oh no!"
                            content="Some error occurred!"
                        />
                    )}
                >
                    <ApolloProvider client={apolloClient}>
                        <UserContext.Provider value={userContext}>
                            <NotificationContext.Provider value={notificationContextValue}>
                                <NavbarContext.Provider value={navbarContext}>
                                    <ServerContext.Provider value={serverContext}>
                                        <AlertContext.Provider value={alertContext}>
                                            <AuthPopup />
                                            <AlertContainer className={styles.alertContainer} />
                                            <Router history={browserHistory}>
                                                <Init
                                                    className={styles.init}
                                                >
                                                    <Navbar className={_cs(styles.navbar)} />
                                                    <Routes
                                                        className={styles.view}
                                                    />
                                                </Init>
                                            </Router>
                                        </AlertContext.Provider>
                                    </ServerContext.Provider>
                                </NavbarContext.Provider>
                            </NotificationContext.Provider>
                        </UserContext.Provider>
                    </ApolloProvider>
                </ErrorBoundary>
            </div>

            <div className={styles.notificationContainer}>
                {notificationKeyList.map((notificationKey) => {
                    const notification = notifications[notificationKey];

                    let defaultIcon;
                    if (notification.variant === 'error') {
                        defaultIcon = <IoCloseCircle />;
                    } else if (notification.variant === 'success') {
                        defaultIcon = <IoCheckmarkCircle />;
                    } else {
                        defaultIcon = <IoAlertCircle />;
                    }

                    const icon = notification.icons ?? defaultIcon;

                    return (
                        <div
                            className={_cs(
                                styles.notification,
                                notification.variant
                                && notificationVariantToClassNameMap[notification.variant],
                            )}
                            key={notificationKey}
                        >
                            {icon && (
                                <div className={styles.icons}>
                                    {icon}
                                </div>
                            )}
                            {notification.children && (
                                <div className={styles.children}>
                                    {notification.children}
                                </div>
                            )}
                            {notification.actions && (
                                <div className={styles.actions}>
                                    {notification.actions}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default Base;
