import { memo } from 'react';
import ReactDOMServer from 'react-dom/server';
import {
    isValidUrl as isValidRemoteUrl,
} from '@togglecorp/fujs';
import {
    BasicEntity,
    EnumEntity,
} from '#base/types/index';

export const basicEntityKeySelector = (d: BasicEntity): string => d.id;
export const basicEntityLabelSelector = (d: BasicEntity) => d.name;

export const enumKeySelector = <T extends string | number>(d: EnumEntity<T>) => (
    d.name
);
export const enumLabelSelector = <T extends string | number>(d: EnumEntity<T>) => (
    d.description ?? d.name
);

const rege = /(?<=\/\/)localhost(?=[:/]|$)/;

export function isLocalUrl(url: string) {
    return rege.test(url);
}

export const genericMemo: (<T>(c: T) => T) = memo;

export function isValidUrl(url: string | undefined): url is string {
    if (!url) {
        return false;
    }
    const sanitizedUrl = url.replace(rege, 'localhost.com');
    return isValidRemoteUrl(sanitizedUrl);
}

export function listToMap<T, K extends string | number, V>(
    items: T[],
    keySelector: (val: T, index: number) => K,
    valueSelector: (val: T, index: number) => V,
) {
    const val: Partial<Record<K, V>> = items.reduce(
        (acc, item, index) => {
            const key = keySelector(item, index);
            const value = valueSelector(item, index);
            return {
                ...acc,
                [key]: value,
            };
        },
        {},
    );
    return val;
}

// FIXME: use NonNullableRec
// FIXME: move this to types/index.tsx
// NOTE: converts enum to string
type Check<T> = T extends string[] ? string[] : T extends string ? string : undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
export type EnumFix<T, F> = T extends object[] ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends any[] ? EnumFix<T[number], F>[] : T
) : ({
    [K in keyof T]: K extends F ? Check<T[K]> : T[K];
})

// eslint-disable-next-line @typescript-eslint/ban-types
export type WithId<T extends object> = T & { id: string };

// NOTE: this may be slower on the long run
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isChildNull(children: any) {
    return !ReactDOMServer.renderToStaticMarkup(children);
}
