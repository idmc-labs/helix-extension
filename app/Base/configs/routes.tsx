import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Login')),
    componentProps: {},
    visibility: 'is-not-authenticated',
});

const index = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/index.html',
    title: 'Index',
    navbarVisibility: true,
    component: lazy(() => import('#views/ParkedItemForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const home = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/',
    title: 'ParkedItem Form',
    navbarVisibility: true,
    component: lazy(() => import('#views/ParkedItemForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const serverSettings = wrap({
    path: '/settings.html',
    title: 'Settings',
    navbarVisibility: true,
    component: lazy(() => import('#views/SourceSettings')),
    componentProps: {},
    visibility: 'is-anything',
});

const settingsSuccessForm = wrap({
    path: '/settingsSuccess/',
    title: 'Url Settings Success',
    navbarVisibility: true,
    component: lazy(() => import('#views/SettingsSuccess')),
    componentProps: {},
    visibility: 'is-anything',
});

const successForm = wrap({
    path: '/success/',
    title: 'Success Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/SuccessForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const failureForm = wrap({
    path: '/failure/',
    title: 'Failure Submission',
    navbarVisibility: true,
    component: lazy(() => import('#views/FailureForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const fourHundredFour = wrap({
    path: '',
    title: '404',
    component: lazy(() => import('#base/components/PreloadMessage')),
    componentProps: {
        heading: '404',
        content: 'What you are looking for does not exist.',
    },
    visibility: 'is-anything',
    navbarVisibility: false,
});

const routes = {
    login,
    home,
    index,
    fourHundredFour,
    successForm,
    failureForm,
    serverSettings,
    settingsSuccessForm,
};
export default routes;
