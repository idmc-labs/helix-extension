import { createContext } from 'react';
import { productionValues, alphaValues } from '#base/utils/apollo';

export type ActiveConfig = 'production' | 'alpha' | 'custom';

export interface SelectedConfigType {
    activeConfig: ActiveConfig;
    webServerUrl?: string;
    apiServerUrl?: string;
    identifier?: string;
}

export interface ServerContextInterface {
    selectedConfig: SelectedConfigType;
    setSelectedConfig: React.Dispatch<React.SetStateAction<SelectedConfigType>>;
}

export const defaultServerConfig: SelectedConfigType = {
    activeConfig: 'production',
    ...productionValues,
};

export function getConfig(): Omit<SelectedConfigType, 'activeConfig'> {
    const storageDataText = localStorage.getItem('stored-config');
    const storageData: SelectedConfigType | undefined = storageDataText
        ? JSON.parse(storageDataText)
        : undefined;

    if (!storageData) {
        return defaultServerConfig;
    }
    const currentConfigMode = storageData.activeConfig;

    if (currentConfigMode === 'custom') {
        return storageData;
    }
    if (currentConfigMode === 'production') {
        return productionValues;
    }
    if (currentConfigMode === 'alpha') {
        return alphaValues;
    }
    return defaultServerConfig;
}

export const ServerContext = createContext<ServerContextInterface>({
    selectedConfig: defaultServerConfig,
    setSelectedConfig: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setSelectedConfig called on ServerContext without a provider', value);
    },
});

export default ServerContext;
