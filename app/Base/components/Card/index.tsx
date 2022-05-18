import React from 'react';
import { _cs } from '@togglecorp/fujs';

import { genericMemo } from '#base/utils/common';
import Container from '#base/components/Container';

import styles from './styles.css';

export interface Props {
    className?: string;
    children?: React.ReactNode;
    heading?: React.ReactNode;
}

function Card(props: Props) {
    const {
        className,
        children,
        heading,
    } = props;

    return (
        <Container
            className={_cs(styles.card, className)}
            heading={heading}
        >
            {children}
        </Container>
    );
}

export default genericMemo(Card);
