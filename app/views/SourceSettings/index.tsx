import React, { useMemo, useState, useCallback, useContext } from 'react';
import { _cs } from '@togglecorp/fujs';
import {
    ObjectSchema,
    useForm,
    createSubmitHandler,
    urlCondition,
    requiredStringCondition,
    PartialForm,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    Button,
    TextInput,
    Tabs,
    Tab,
    TabPanel,
    TabList,
} from '@togglecorp/toggle-ui';
import { useHistory } from 'react-router-dom';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

import route from '#base/configs/routes';
import {
    ServerContext,
} from '#base/context/ServerContext';
import { productionValues, stagingValues } from '#base/utils/apollo';
import Container from '#base/components/Container';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import NonFieldError from '#components/NonFieldError';

import styles from './styles.css';

type ConfigKeys = 'production' | 'staging' | 'custom';

type ServerConfigFields = {
    apiServer: string;
    identifier: string;
}
type FormType = PartialForm<ServerConfigFields>;
type FormSchema = ObjectSchema<FormType>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (value?.identifier !== 'staging' && value?.identifier !== 'production') {
            return ({
                identifier: [requiredStringCondition],
                apiServer: [requiredStringCondition, urlCondition],
            });
        }
        return {
            identifier: [],
            apiServer: [],
        };
    },
};

interface Props {
    className?: string;
}

function SourceSettings(props: Props) {
    const {
        className,
    } = props;

    const history = useHistory();

    const { selectedConfig, setSelectedConfig } = useContext(ServerContext);

    const {
        activeConfig,
        ...otherConfig
    } = selectedConfig;

    const defaultForm: FormType = useMemo(() => ({
        apiServer: otherConfig.apiServer,
        identifier: otherConfig.identifier,
    }), [otherConfig]);

    const {
        pristine,
        value,
        error: settingsError,
        setFieldValue,
        validate,
        setError,
        setPristine,
    } = useForm(schema, defaultForm);

    const error = getErrorObject(settingsError);

    const [
        activeView,
        setActiveView,
    ] = useState<ConfigKeys>(activeConfig);

    const disableInput = activeView !== 'custom';

    const handleCustomSubmit = useCallback(
        () => {
            const submit = createSubmitHandler(
                validate,
                setError,
                (val) => {
                    const data = { ...val } as FormType;
                    setSelectedConfig({
                        activeConfig: activeView,
                        apiServer: data.apiServer,
                        identifier: data.identifier,
                    });
                },
            );
            submit();
            history.push(route.settingsSuccessForm.path);
        },
        [
            activeView,
            setSelectedConfig,
            history,
            setError,
            validate,
        ],
    );

    const handleFixedSubmit = useCallback(() => {
        setSelectedConfig({
            activeConfig: activeView,
            apiServer: otherConfig.apiServer,
            identifier: otherConfig.identifier,
        });
        history.push(route.settingsSuccessForm.path);
    }, [
        activeView,
        otherConfig,
        setSelectedConfig,
        history,
    ]);

    const valueToShow = useMemo(
        () => {
            if (activeView === 'production') {
                return {
                    identifier: productionValues.identifier,
                    apiServer: productionValues.apiServer,
                };
            }
            if (activeView === 'staging') {
                return {
                    identifier: stagingValues.identifier,
                    apiServer: stagingValues.apiServer,
                };
            }
            return value;
        },
        [
            value,
            activeView,
        ],
    );

    const handleServerEnvironmentChange = useCallback(
        (val: ConfigKeys) => {
            setActiveView(val);
            setPristine(false);
        },
        [setPristine],
    );

    return (
        <Tabs
            value={activeView}
            onChange={handleServerEnvironmentChange}
        >
            <Container
                className={_cs(className, styles.settingsBox)}
                headerClassName={styles.header}
                headingContainerClassName={styles.heading}
                heading={(
                    <TabList>
                        <Tab name="production">
                            Production
                        </Tab>
                        <Tab name="staging">
                            Staging
                        </Tab>
                        <Tab name="custom">
                            Custom
                        </Tab>
                    </TabList>
                )}
                footerActions={(
                    <>
                        <SmartButtonLikeLink
                            className={styles.footerStyle}
                            route={route.home}
                            icons={(
                                <IoArrowBackCircleSharp />
                            )}
                        >
                            Back
                        </SmartButtonLikeLink>
                        <Button
                            name={undefined}
                            onClick={activeView === 'custom' ? handleCustomSubmit : handleFixedSubmit}
                            disabled={pristine}
                        >
                            Save
                        </Button>
                    </>
                )}
            >
                <TabPanel name="production">
                    <TextInput
                        label="Identifier"
                        name="identifier"
                        value={valueToShow.identifier}
                        onChange={undefined}
                        readOnly
                    />
                    <TextInput
                        label="Api Server Address"
                        name="apiServer"
                        value={valueToShow.apiServer}
                        onChange={undefined}
                        readOnly
                    />
                </TabPanel>
                <TabPanel name="staging">
                    <TextInput
                        label="Identifier"
                        name="identifier"
                        value={valueToShow.identifier}
                        onChange={undefined}
                        readOnly
                    />
                    <TextInput
                        label="Api Server Address"
                        name="apiServer"
                        value={valueToShow.apiServer}
                        onChange={undefined}
                        readOnly
                    />
                </TabPanel>
                <TabPanel name="custom">
                    <NonFieldError error={error} />
                    <TextInput
                        label="Identifier"
                        name="identifier"
                        value={valueToShow.identifier}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                        error={error?.identifier}
                    />
                    <TextInput
                        label="Api Server Address"
                        name="apiServer"
                        value={valueToShow.apiServer}
                        onChange={setFieldValue}
                        readOnly={disableInput}
                        error={error?.apiServer}
                    />
                </TabPanel>
            </Container>
        </Tabs>
    );
}

export default SourceSettings;
