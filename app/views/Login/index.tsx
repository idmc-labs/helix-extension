import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Message } from '@togglecorp/toggle-ui';
import { IoAlertCircle } from 'react-icons/io5';

import Logo from '#base/components/Logo';

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
        />
    );
}

export default Login;
