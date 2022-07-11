import { ApolloError } from '@apollo/client';

export function isArrayEqual<T>(foo: readonly T[], bar: T[]) {
    return foo.length === bar.length && foo.every((fooItem, index) => fooItem === bar[index]);
}

export function checkErrorCode(errors: ApolloError['graphQLErrors'], path: (string | number)[], code: string) {
    return errors.some((error) => (
        error.path && error.extensions?.code
        && isArrayEqual(error.path, path) && code === error.extensions.code
    ));
}

export const productionValues = {
    apiServer: 'https://helix-tools-api.idmcdb.org',
    identifier: 'production',
};

export const stagingValues = {
    apiServer: 'https://helix-tools-api-staging.idmcdb.org',
    identifier: 'staging',
};
