import React, { useState, useContext, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    TextInput,
    SelectInput,
    Button,
    TextArea,
} from '@togglecorp/toggle-ui';
import {
    removeNull,
    ObjectSchema,
    useForm,
    createSubmitHandler,
    requiredCondition,
    requiredStringCondition,
    idCondition,
    urlCondition,
    PartialForm,
    PurgeNull,
} from '@togglecorp/toggle-form';

import {
    gql,
    useQuery,
    useMutation,
} from '@apollo/client';

import Row from '#base/components/Row';
import Container from '#base/components/Container';
import NonFieldError from '#base/components/NonFieldError';
import CountrySelectInput, { CountryOption } from '#base/components/selections/CountrySelectInput';
import NotificationContext from '#base/context/NotificationContext';
import UserSelectInput, { UserOption } from '#base/components/selections/UserSelectInput';
import Loading from '#base/components/Loading';

import { transformToFormError } from '#base/utils/errorTransform';

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
        id: [idCondition],
        country: [requiredCondition],
        title: [requiredStringCondition],
        url: [requiredCondition, urlCondition],
        assignedTo: [requiredCondition],
        status: [requiredCondition],
        comments: [],
    }),
};

interface ParkedItemFormProps {
    className?: string;
    id?: string;
}

function ParkedItemForm(props: ParkedItemFormProps) {
    const {
        id,
        className,
    } = props;

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
    };

    const {
        pristine,
        value,
        error,
        onValueChange,
        validate,
        onErrorSet,
        onValueSet,
        onPristineSet,
    } = useForm(defaultFormValues, schema);

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

                onValueSet(removeNull({
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
                console.log('REsponse of parked request::>>', createParkedItemRes);
                if (!createParkedItemRes) {
                    return;
                }
                const { errors, result } = createParkedItemRes;
                if (errors) {
                    const formError = transformToFormError(removeNull(errors));
                    notifyGQLError(errors);
                    onErrorSet(formError);
                }
                if (result) {
                    notify({
                        children: 'Parked item created successfully!',
                        variant: 'success',
                    });
                    onPristineSet(true);
                }
            },
            onError: (errors) => {
                notify({
                    children: errors.message,
                    variant: 'error',
                });
                onErrorSet({
                    $internal: errors.message,
                });
            },
        },
    );

    const handleSubmit = React.useCallback((finalValues: FormType) => {
        createParkedItem({
            variables: {
                parkedItem: finalValues as ParkedItemFormFields,
            },
        });
    }, [createParkedItem]);

    // eslint-disable-next-line max-len
    const loading = createLoading || parkedItemDataLoading || parkedItemOptionsLoading;
    const errored = !!parkedItemDataError || !!parkedItemOptionsError;
    const disabled = loading || errored;

    return (
        <Container
            className={_cs(className, styles.parkingLotBox)}
            heading="Add Parked Item"
            headerClassName={styles.headerStyle}
        >
            <form
                className={_cs(className, styles.parkedItemForm)}
                onSubmit={createSubmitHandler(validate, onErrorSet, handleSubmit)}
            >
                {loading && <Loading absolute />}
                <NonFieldError>
                    {error?.$internal}
                </NonFieldError>
                <Row>
                    <TextInput
                        className={styles.input}
                        label="Title *"
                        name="title"
                        value={value.title}
                        onChange={onValueChange}
                        error={error?.fields?.title}
                        disabled={disabled}
                    />
                </Row>
                <Row>
                    <TextInput
                        className={styles.input}
                        label="URL *"
                        name="url"
                        value={value.url}
                        onChange={onValueChange}
                        error={error?.fields?.url}
                        disabled={disabled}
                    />
                </Row>
                <Row>
                    <CountrySelectInput
                        className={styles.input}
                        label="Country *"
                        options={countryOptions}
                        name="country"
                        onOptionsChange={setCountryOptions}
                        onChange={onValueChange}
                        value={value.country}
                        error={error?.fields?.country}
                        disabled={disabled}
                    />
                </Row>
                <Row>
                    <UserSelectInput
                        className={styles.input}
                        label="Assignee *"
                        options={assignedToOptions}
                        name="assignedTo"
                        onOptionsChange={setAssignedToOptions}
                        onChange={onValueChange}
                        value={value.assignedTo}
                        error={error?.fields?.assignedTo}
                        disabled={disabled}
                    />
                </Row>
                <Row>
                    <SelectInput
                        className={styles.input}
                        label="Status *"
                        name="status"
                        options={statusOptions}
                        value={value.status}
                        keySelector={enumKeySelector}
                        labelSelector={enumLabelSelector}
                        onChange={onValueChange}
                        error={error?.fields?.status}
                        disabled={disabled}
                    />
                </Row>
                <Row>
                    <TextArea
                        className={styles.input}
                        label="Comments"
                        name="comments"
                        value={value.comments}
                        onChange={onValueChange}
                        disabled={disabled}
                        error={error?.fields?.comments}
                    />
                </Row>

                <div className={styles.submitButton}>
                    <Button
                        type="submit"
                        name={undefined}
                        disabled={disabled || pristine}
                        variant="primary"
                    >
                        Submit
                    </Button>
                </div>
            </form>
        </Container>
    );
}

export default ParkedItemForm;
