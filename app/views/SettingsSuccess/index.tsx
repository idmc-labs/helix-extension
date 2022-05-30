import React, { useCallback } from 'react';
import { Message, Button } from '@togglecorp/toggle-ui';
import { _cs } from '@togglecorp/fujs';
import { IoCheckmarkCircle } from 'react-icons/io5';

import Logo from '#base/components/Logo';

interface SettingsFormInterface {
    className?: string;
}

function SettingsSuccess(props: SettingsFormInterface) {
    const {
        className,
    } = props;

    const handleCloseExtension = useCallback(() => {
        window.close();
    }, []);

    return (
        <Message
            className={_cs(className)}
            message={(
                <>
                    <p> Please re-open the extension</p>
                    <p>
                        to apply url settings!
                        &nbsp;
                        <IoCheckmarkCircle />
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
                    name="closeExtension"
                    onClick={handleCloseExtension}
                    variant="primary"
                >
                    Go back
                </Button>
            )}
        />
    );
}

export default SettingsSuccess;
