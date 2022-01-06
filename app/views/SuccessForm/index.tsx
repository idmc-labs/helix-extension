import React from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle, IoArrowBackCircleSharp } from 'react-icons/io5';
import route from '../../Base/configs/routes';

import styles from './styles.css';

interface SuccessFormInterface {
    className?: string;
}

function SuccessForm(props: SuccessFormInterface) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.successPage)}>
            <div className={styles.successHeading}>
                Parked Item created successfully!
                &nbsp;
                <IoCheckmarkCircle />
            </div>
            <div className={styles.backButton}>
                <Link
                    to={route.home.path}
                >
                    <IoArrowBackCircleSharp />
                </Link>
            </div>
        </div>
    );
}

export default SuccessForm;
