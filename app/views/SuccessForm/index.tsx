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
        <div className={_cs(className, styles.successForm)}>
            <h1 className={styles.successHeading}>
                Lead created successfully!
                <IoCheckmarkCircle />
            </h1>
            <h1 className={styles.successHeading}>
                <Link
                    to={route.index.path}
                >
                    <IoArrowBackCircleSharp />
                </Link>
            </h1>
        </div>
    );
}

export default SuccessForm;
