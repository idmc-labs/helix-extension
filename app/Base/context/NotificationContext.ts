import { createContext } from 'react';

export type NotificationVariant = 'default' | 'success' | 'error';
export interface Notification {
    icons?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    duration?: number;
    horizontalPosition?: 'start' | 'middle' | 'end';
    verticalPosition?: 'start' | 'middle' | 'end';
    variant?: NotificationVariant;
}

export interface NotificationContextProps {
    notify: (notification: Notification, id?: string) => string;
    // NOTE: use this to show error message from server on onCompleted block
    notifyGQLError: (errors: unknown[], id?: string) => string;
    dismiss: (id: string) => unknown;
}

const NotificationContext = createContext<NotificationContextProps>({
    notify: () => {
        console.warn('Trying to notify');
        return '';
    },
    notifyGQLError: () => {
        console.warn('Trying to notify gql error');
        return '';
    },
    dismiss: () => {
        console.warn('Tyring to dismiss notification');
    },
});

export default NotificationContext;
