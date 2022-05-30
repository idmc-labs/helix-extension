import React, { useContext, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import {
    removeNull,
} from '@togglecorp/toggle-form';

import { UserContext } from '#base/context/UserContext';
import PreloadMessage from '#base/components/PreloadMessage';

import { MeQuery, MeQueryVariables } from '#generated/types';

const ME = gql`
    query Me {
        me {
            id
            lastName
            firstName
            fullName
            username
            email
        }
    }
`;

interface Props {
    className?: string;
    children: React.ReactNode;
}
function Init(props: Props) {
    const {
        className,
        children,
    } = props;

    const [ready, setReady] = useState(false);
    const {
        setUser,
    } = useContext(UserContext);

    useQuery<MeQuery, MeQueryVariables>(ME, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            const safeMe = removeNull(data.me);
            if (safeMe) {
                setUser(safeMe);
            } else {
                setUser(undefined);
            }
            setReady(true);
        },
        onError: () => {
            /*
            const { graphQLErrors } = error;
            const authError = checkErrorCode(
                graphQLErrors,
                ['me'],
                '401',
            );
            setErrored(!authError);
            */
            setReady(true);
        },
    });

    /* if (errored) {
        return (
            <PreloadMessage
                className={className}
                heading="Oh no!"
                content="Some error occurred"
            />
        );
    } */

    if (!ready) {
        return (
            <PreloadMessage
                className={className}
                content="Checking user session..."
            />
        );
    }

    return (
        <>
            {children}
        </>
    );
}
export default Init;
