import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Message } from '@togglecorp/toggle-ui';
import { IoAlertCircle, IoSettingsOutline } from 'react-icons/io5';

import Logo from '#base/components/Logo';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import route from '#base/configs/routes';

import styles from './styles.css';

interface LoginInterface {
    className?: string;
}

function Login(props: LoginInterface) {
    const {
        className,
    } = props;

    return (
        <Message
            className={_cs(className, styles.messageBox)}
            message={(
                <>
                    <p>
                        <IoAlertCircle />
                        &nbsp;
                        Please check if you are logged in!
                    </p>
                </>
            )}
            icon={(
                <Logo
                    size="large"
                    variant="default"
                />
            )}
            actions={(
                <SmartButtonLikeLink
                    className={styles.footerStyle}
                    route={route.serverSettings}
                    icons={(
                        <IoSettingsOutline />
                    )}
                >
                    Settings
                </SmartButtonLikeLink>
            )}
        />
    );
}

export default Login;
