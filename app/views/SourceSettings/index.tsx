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
import { productionValues, alphaValues } from '#base/utils/apollo';
import Card from '#base/components/Card';
import ContainerCard from '#base/components/ContainerCard';
import SmartButtonLikeLink from '#base/components/SmartButtonLikeLink';
import NonFieldError from '#components/NonFieldError';

import styles from './styles.css';

type ConfigKeys = 'production' | 'alpha' | 'custom';

type ServerConfigFields = {
    webServer: string;
    apiServer: string;
    identifier: string;
}
type FormType = PartialForm<ServerConfigFields>;
type FormSchema = ObjectSchema<FormType>
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const schema: FormSchema = {
    fields: (value): FormSchemaFields => {
        if (value?.identifier !== 'alpha' && value?.identifier !== 'production') {
            return ({
                identifier: [requiredStringCondition],
                webServer: [requiredStringCondition, urlCondition],
                apiServer: [requiredStringCondition, urlCondition],
            });
        }
        return {
            identifier: [],
            webServer: [],
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

    const tabs = (
        <TabList>
            <Tab
                name="production"
                className={styles.tab}
            >
                Staging
            </Tab>
            <Tab
                name="alpha"
                className={styles.tab}
            >
                Alpha
            </Tab>
            <Tab
                name="custom"
                className={styles.tab}
            >
                Custom
            </Tab>
        </TabList>
    );

    const defaultForm: FormType = useMemo(() => ({
        webServer: otherConfig.webServerUrl,
        apiServer: otherConfig.apiServerUrl,
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
                        webServerUrl: data.webServer,
                        apiServerUrl: data.apiServer,
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
            webServerUrl: otherConfig.webServerUrl,
            apiServerUrl: otherConfig.apiServerUrl,
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
                    webServer: productionValues.webServer,
                    apiServer: productionValues.apiServer,
                };
            }
            if (activeView === 'alpha') {
                return {
                    identifier: alphaValues.identifier,
                    webServer: alphaValues.webServer,
                    apiServer: alphaValues.apiServer,
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
        <ContainerCard
            className={_cs(className, styles.settingsBox)}
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
            <div>
                <Tabs
                    value={activeView}
                    onChange={handleServerEnvironmentChange}
                >
                    <TabPanel name="production">
                        <Card
                            className={_cs(styles.alphaForm, className)}
                            heading={tabs}
                        >
                            <TextInput
                                className={styles.input}
                                label="Identifier"
                                name="identifier"
                                value={valueToShow.identifier}
                                onChange={undefined}
                                readOnly
                            />
                            <TextInput
                                className={styles.input}
                                label="Web Server Address"
                                name="webServer"
                                value={valueToShow.webServer}
                                onChange={undefined}
                                readOnly
                            />
                            <TextInput
                                className={styles.input}
                                label="Api Server Address"
                                name="apiServer"
                                value={valueToShow.apiServer}
                                onChange={undefined}
                                readOnly
                            />
                        </Card>
                    </TabPanel>
                    <TabPanel name="alpha">
                        <Card
                            className={_cs(styles.alphaForm, className)}
                            heading={tabs}
                        >
                            <TextInput
                                className={styles.input}
                                label="Identifier"
                                name="identifier"
                                value={valueToShow.identifier}
                                onChange={undefined}
                                readOnly
                            />
                            <TextInput
                                className={styles.input}
                                label="Web Server Address"
                                name="webServer"
                                value={valueToShow.webServer}
                                onChange={undefined}
                                readOnly
                            />
                            <TextInput
                                className={styles.input}
                                label="Api Server Address"
                                name="apiServer"
                                value={valueToShow.apiServer}
                                onChange={undefined}
                                readOnly
                            />
                        </Card>
                    </TabPanel>
                    <TabPanel name="custom">
                        <NonFieldError error={error} />
                        <Card
                            className={_cs(styles.alphaForm, className)}
                            heading={tabs}
                        >

                            <TextInput
                                className={styles.input}
                                label="Identifier"
                                name="identifier"
                                value={valueToShow.identifier}
                                onChange={setFieldValue}
                                readOnly={disableInput}
                                error={error?.identifier}
                            />
                            <TextInput
                                className={styles.input}
                                label="Web Server Address"
                                name="webServer"
                                value={valueToShow.webServer}
                                error={error?.webServer}
                                onChange={setFieldValue}
                                readOnly={disableInput}
                            />
                            <TextInput
                                className={styles.input}
                                label="Api Server Address"
                                name="apiServer"
                                value={valueToShow.apiServer}
                                onChange={setFieldValue}
                                readOnly={disableInput}
                                error={error?.apiServer}
                            />
                        </Card>
                    </TabPanel>
                </Tabs>
            </div>
        </ContainerCard>
    );
}

export default SourceSettings;
