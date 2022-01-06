import React from 'react';
import { _cs } from '@togglecorp/fujs';
// import { IoSettingsOutline } from 'react-icons/io5';

import Svg from '#base/components/Svg';
import Logo from '#base/resources/img/logo.svg';
// import SmartLink from '#base/components/SmartLink';
// import route from '#base/configs/routes';

import styles from './styles.css';

interface Props {
    className?: string;
}

function Navbar(props: Props) {
    const { className } = props;

    return (
        <nav className={_cs(className, styles.navbar)}>
            <div className={styles.appBrand}>
                <Svg
                    src={Logo}
                    className={styles.logo}
                />
            </div>
        </nav>
    );
}

export default Navbar;
