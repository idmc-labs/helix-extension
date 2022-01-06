import { lazy } from 'react';

import { wrap } from '#base/utils/routes';

const login = wrap({
    path: '/login/',
    title: 'Login',
    navbarVisibility: false,
    component: lazy(() => import('#views/Template')),
    componentProps: {
        name: 'Login Page',
    },
    visibility: 'is-not-authenticated',
});

const home = wrap({
    // NOTE: the first url is /index.html for addons
    path: '/index.html',
    title: 'Home',
    navbarVisibility: true,
    component: lazy(() => import('#views/ParkedItemForm')),
    componentProps: {},
    visibility: 'is-authenticated',
});

const myProfile = wrap({
    path: '/my-profile/',
    title: 'My Profile',
    navbarVisibility: true,
    component: lazy(() => import('#views/Template')),
    componentProps: {
        name: 'My Profile Page',
    },
    visibility: 'is-authenticated',
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
    path: '*',
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
    myProfile,
    fourHundredFour,
    successForm,
    failureForm,
};
export default routes;
