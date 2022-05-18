import {
    ApolloClientOptions,
    NormalizedCacheObject,
    InMemoryCache,
    ApolloLink as ApolloLinkFromClient,
    HttpLink,
} from '@apollo/client';
import { productionValues, alphaValues } from '#base/utils/apollo';

const storageData = localStorage.getItem('serverConfig');
const UrlData = storageData ? JSON.parse(storageData) : undefined;
const currentConfigMode = UrlData?.activeConfig;

function getUrlData() {
    if (currentConfigMode === 'alpha') {
        return alphaValues.apiServer;
    }
    if (currentConfigMode === 'beta') {
        return productionValues.apiServer;
    }
    if (currentConfigMode === 'custom') {
        return UrlData?.apiServerUrl;
    }
    return null;
}

const webAddress = getUrlData();
const REACT_APP_GRAPHQL_ENDPOINT = `${webAddress}/graphql`;

const GRAPHQL_ENDPOINT = REACT_APP_GRAPHQL_ENDPOINT as string;

const link = new HttpLink({
    uri: GRAPHQL_ENDPOINT,
    credentials: 'include',
}) as unknown as ApolloLinkFromClient;

const apolloOptions: ApolloClientOptions<NormalizedCacheObject> = {
    link,
    cache: new InMemoryCache(),
    assumeImmutableResults: true,
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
    },
};

export default apolloOptions;
