import React, { useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    SelectInput,
    Button,
    TextArea,
    Message,
} from '@togglecorp/toggle-ui';
import {
    removeNull,
    ObjectSchema,
    useForm,
    createSubmitHandler,
    requiredCondition,
    requiredStringCondition,
    getErrorObject,
    urlCondition,
    PartialForm,
    PurgeNull,
    internal,
} from '@togglecorp/toggle-form';

import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';
import { useHistory } from 'react-router-dom';
import { IoCloseCircle } from 'react-icons/io5';

import Container from '#base/components/Container';
import {
    ServerContext,
} from '#base/context/ServerContext';
import { UserContext } from '#base/context/UserContext';
import NonFieldError from '#components/NonFieldError';
import CountrySelectInput, { CountryOption } from '#base/components/selections/CountrySelectInput';
import NotificationContext from '#base/context/NotificationContext';
import UserSelectInput, { UserOption } from '#base/components/selections/UserSelectInput';
import Loading from '#base/components/Loading';
import routes from '#base/configs/routes';
import Logo from '#base/components/Logo';
import { transformToFormError, ObjectError } from '#base/utils/errorTransform';

import {
    enumKeySelector,
    enumLabelSelector,
    EnumFix,
    WithId,
} from '#base/utils/common';

import {
    ParkedItemOptionsQuery,
    ParkedItemQuery,
    ParkedItemQueryVariables,
    CreateParkedItemMutation,
    CreateParkedItemMutationVariables,
    Parking_Lot_Status as ParkingLotStatus,
} from '#generated/types';

import styles from './styles.css';

const PARKING_LOT_OPTIONS = gql`
    query ParkedItemOptions {
        status: __type(name: "PARKING_LOT_STATUS") {
            enumValues {
                name
                description
            }
        }
    }
`;

const PARKING_LOT = gql`
    query ParkedItem($id: ID!) {
        parkedItem(id: $id) {
            comments
            country {
                id
                idmcShortName
            }
            id
            assignedTo {
                id
                fullName
            }
            status
            createdBy {
                id
                fullName
            }
            title
            url
        }
    }
`;

const CREATE_PARKING_LOT = gql`
    mutation CreateParkedItem($parkedItem: ParkedItemCreateInputType!) {
        createParkedItem(data: $parkedItem) {
            result {
                comments
                country {
                    id
                    idmcShortName
                }
                id
                assignedTo {
                    id
                    fullName
                }
                status
                createdBy {
                    id
                    fullName
                }
                title
                url
            }
            errors
        }
    }
`;

type ParkedItemFormFields = CreateParkedItemMutationVariables['parkedItem'];
type FormType = PurgeNull<PartialForm<WithId<EnumFix<ParkedItemFormFields, 'status'>>>>;

type FormSchema = ObjectSchema<FormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (): FormSchemaFields => ({
        country: [requiredCondition],
        title: [requiredStringCondition],
        url: [requiredCondition, urlCondition],
        assignedTo: [requiredCondition],
        status: [requiredCondition],
        comments: [],
    }),
};

interface WebInfo {
    title?: string;
    url?: string;
}

interface ParkedItemFormProps {
    className?: string;
    id?: string;
}

function ParkedItemForm(props: ParkedItemFormProps) {
    const {
        id,
        className,
    } = props;

    const { user } = useContext(UserContext);
    const history = useHistory();
    const { selectedConfig } = useContext(ServerContext);

    const [
        countryOptions,
        setCountryOptions,
    ] = useState<CountryOption[] | null | undefined>();

    const [
        assignedToOptions,
        setAssignedToOptions,
    ] = useState<UserOption[] | null | undefined>();

    const toBeReviewed: ParkingLotStatus = 'TO_BE_REVIEWED';
    const reviewed: ParkingLotStatus = 'REVIEWED';

    const defaultFormValues: PartialForm<FormType> = {
        status: toBeReviewed,
        country: undefined,
        title: undefined,
        url: undefined,
        assignedTo: undefined,
        comments: undefined,
    };

    const {
        pristine,
        value,
        error: riskyError,
        validate,
        setError,
        setFieldValue,
        setPristine,
        setValue,
    } = useForm(schema, defaultFormValues);

    const error = getErrorObject(riskyError);

    const {
        notify,
        notifyGQLError,
    } = useContext(NotificationContext);

    const parkedVariables = useMemo(
        (): ParkedItemQueryVariables | undefined => (
            id ? { id } : undefined
        ),
        [id],
    );

    const {
        loading: parkedItemDataLoading,
        error: parkedItemDataError,
    } = useQuery<ParkedItemQuery, ParkedItemQueryVariables>(
        PARKING_LOT,
        {
            skip: !parkedVariables,
            variables: parkedVariables,
            onCompleted: (response) => {
                const { parkedItem } = response;
                if (!parkedItem) {
                    return;
                }

                if (parkedItem.country) {
                    setCountryOptions([parkedItem.country]);
                }

                if (parkedItem.assignedTo) {
                    setAssignedToOptions([parkedItem.assignedTo]);
                }

                setValue(removeNull({
                    ...parkedItem,
                    country: parkedItem.country?.id,
                    assignedTo: parkedItem.assignedTo?.id,
                }));
            },
        },
    );

    const {
        data: parkedItemOptions,
        loading: parkedItemOptionsLoading,
        error: parkedItemOptionsError,
    } = useQuery<ParkedItemOptionsQuery>(PARKING_LOT_OPTIONS);

    const statusOptions = parkedItemOptions?.status?.enumValues?.filter(
        (p) => p.name !== reviewed,
    );

    const [
        createParkedItem,
        { loading: createLoading },
    ] = useMutation<CreateParkedItemMutation, CreateParkedItemMutationVariables>(
        CREATE_PARKING_LOT,
        {
            onCompleted: (response) => {
                const {
                    createParkedItem: createParkedItemRes,
                } = response;
                if (!createParkedItemRes) {
                    return;
                }
                const { errors, result } = createParkedItemRes;
                if (errors) {
                    const formError = transformToFormError((errors as ObjectError[]));
                    notifyGQLError(errors);
                    setError(formError);
                }
                if (result) {
                    setPristine(true);
                    history.push(routes.successForm.path);
                }
            },
            onError: (errors) => {
                history.push(routes.failureForm.path);
                notify({
                    children: errors.message,
                    variant: 'error',
                });
                setError({
                    [internal]: errors.message,
                });
            },
        },
    );

    const handleInfoAutoFill = useCallback((webInfo: WebInfo) => {
        if (webInfo.url) {
            setFieldValue(webInfo.url, 'url');
        }
        if (webInfo.title) {
            setFieldValue(webInfo.title, 'title');
        }
    }, [setFieldValue]);

    const handleSubmit = useCallback((finalValues: FormType) => {
        createParkedItem({
            variables: {
                parkedItem: finalValues as ParkedItemFormFields,
            },
        });
    }, [createParkedItem]);

    const handleCloseExtension = useCallback(() => {
        window.close();
    }, []);

    useEffect(() => {
        chrome.tabs.query({
            active: true,
            currentWindow: true,
        }, (tabs) => {
            const activeTab = tabs && tabs[0];
            if (activeTab?.url) {
                handleInfoAutoFill({
                    url: activeTab?.url,
                    title: activeTab?.title,
                });
            }
        });
    }, [
        handleInfoAutoFill,
        selectedConfig,
    ]);

    const loading = createLoading || parkedItemDataLoading || parkedItemOptionsLoading;
    const errored = !!parkedItemDataError || !!parkedItemOptionsError;
    const disabled = loading || errored;

    return (
        <>
            {user ? (
                <form
                    className={_cs(className, styles.form)}
                    onSubmit={createSubmitHandler(validate, setError, handleSubmit)}
                >
                    <Container
                        className={_cs(className, styles.parkingLotBox)}
                        contentClassName={styles.content}
                        footerActions={(
                            <>
                                <Button
                                    name={undefined}
                                    onClick={handleCloseExtension}
                                    variant="primary"
                                    icons={<IoCloseCircle />}
                                >
                                    Close
                                </Button>
                                <Button
                                    type="submit"
                                    name={undefined}
                                    disabled={disabled || pristine}
                                    variant="primary"
                                >
                                    Submit
                                </Button>
                            </>
                        )}
                    >
                        {loading && <Loading absolute />}
                        <NonFieldError error={error} />
                        <TextInput
                            label="Title *"
                            name="title"
                            value={value.title}
                            onChange={setFieldValue}
                            error={error?.title}
                            disabled={disabled}
                        />
                        <TextInput
                            label="URL *"
                            name="url"
                            value={value.url}
                            onChange={setFieldValue}
                            error={error?.url}
                            disabled={disabled}
                        />
                        <CountrySelectInput
                            label="Country *"
                            options={countryOptions}
                            name="country"
                            onOptionsChange={setCountryOptions}
                            onChange={setFieldValue}
                            value={value.country}
                            error={error?.country}
                            disabled={disabled}
                        />
                        <UserSelectInput
                            label="Assignee *"
                            options={assignedToOptions}
                            name="assignedTo"
                            onOptionsChange={setAssignedToOptions}
                            onChange={setFieldValue}
                            value={value.assignedTo}
                            error={error?.assignedTo}
                            disabled={disabled}
                        />
                        <SelectInput
                            label="Status *"
                            name="status"
                            options={statusOptions}
                            value={value.status}
                            keySelector={enumKeySelector}
                            labelSelector={enumLabelSelector}
                            onChange={setFieldValue}
                            error={error?.status}
                            disabled={disabled}
                        />
                        <TextArea
                            label="Comments"
                            name="comments"
                            value={value.comments}
                            onChange={setFieldValue}
                            disabled={disabled}
                            error={error?.comments}
                        />
                    </Container>
                </form>
            ) : (
                <Message
                    className={_cs(className, styles.messageBox)}
                    message={(
                        <>
                            <p>
                                Problem loading the parked item form.
                            </p>
                            <p>
                                Please check your login credentials or internet connection.
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
                            onClick={handleCloseExtension}
                            variant="primary"
                            icons={<IoCloseCircle />}
                        >
                            Close
                        </Button>
                    )}
                />
            )}
        </>
    );
}

export default ParkedItemForm;
