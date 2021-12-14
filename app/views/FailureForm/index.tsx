import React from 'react';
import { Link } from 'react-router-dom';
import { _cs } from '@togglecorp/fujs';
import { IoIosCloseCircle } from 'react-icons/io';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import route from '../../Base/configs/routes';

import styles from './styles.css';

interface FailureFormInterface {
    className?: string;
}

function FailureForm(props: FailureFormInterface) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.failureForm)}>
            <h1 className={styles.failureHeading}>
                <IoIosCloseCircle />
                Failure
            </h1>
            <p className={styles.message}>
                Sorry, parked item could not be created at the moment !
            </p>
            <h1 className={styles.reverseButton}>
                <Link
                    to={route.index.path}
                >
                    <IoArrowBackCircleSharp />
                </Link>
            </h1>
        </div>
    );
}

export default FailureForm;
