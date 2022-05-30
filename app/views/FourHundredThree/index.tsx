import React from 'react';
import { _cs } from '@togglecorp/fujs';
import styles from './styles.css';

interface FourHundredThreeProps {
    className?: string;
}

function FourHundredThree(props: FourHundredThreeProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(className, styles.fourHundredThree)}>
            <h1 className={styles.heading}>
                403
            </h1>
            <p className={styles.message}>
                You do not have access to this page!
            </p>
        </div>
    );
}

export default FourHundredThree;
