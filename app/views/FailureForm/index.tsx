import React from 'react';
import { _cs } from '@togglecorp/fujs';
import { Message, Button } from '@togglecorp/toggle-ui';
import { IoIosCloseCircle } from 'react-icons/io';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

import { useHistory } from 'react-router-dom';
import Logo from '#base/components/Logo';
import route from '#base/configs/routes';

import styles from './styles.css';

interface FailureFormInterface {
    className?: string;
}

function FailureForm(props: FailureFormInterface) {
    const {
        className,
    } = props;

    const history = useHistory();

    const handleBackButton = () => {
        history.push(route.home.path);
    };

    return (
        <Message
            className={_cs(className, styles.messageBox)}
            message={(
                <>
                    <p>
                        <IoIosCloseCircle />
                        &nbsp;
                        Sorry parked item could not be created at the moment!
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
                <Button
                    name={undefined}
                    onClick={handleBackButton}
                    variant="primary"
                    icons={<IoArrowBackCircleSharp />}
                >
                    Go Back
                </Button>
            )}
        />
    );
}

export default FailureForm;
