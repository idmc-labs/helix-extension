import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { IoSettingsOutline } from 'react-icons/io5';

import SmartLink from '#base/components/SmartLink';
import route from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <h2 className={styles.appBrand}>
                Helix
            </h2>
            <div className={styles.main}>
                <SmartLink
                    route={route.serverSettings}
                    className={styles.link}
                >
                    <IoSettingsOutline />
                </SmartLink>
            </div>
        </nav>
    );
}

export default Navbar;
