import { createInertiaApp } from '@inertiajs/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import arEG from 'antd/locale/ar_EG';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';

const appName = import.meta.env.VITE_APP_NAME || 'إيجلز للمخزون';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (name.startsWith('auth/')) {
            return AuthLayout;
        }
        return AppLayout;
    },
    strictMode: true,
    withApp(app) {
        return (
            <ConfigProvider
                direction="rtl"
                locale={arEG}
                theme={{
                    token: {
                        fontFamily:
                            "'IBM Plex Sans Arabic', 'Cairo', system-ui, -apple-system, sans-serif",
                        colorPrimary: '#1d4ed8',
                        colorInfo: '#2563eb',
                        colorSuccess: '#059669',
                        colorWarning: '#d97706',
                        colorError: '#dc2626',
                        borderRadius: 8,
                        wireframe: false,
                    },
                    components: {
                        Button: {
                            controlHeight: 38,
                            borderRadius: 8,
                        },
                        Input: {
                            controlHeight: 38,
                            borderRadius: 8,
                        },
                        Table: {
                            borderRadius: 8,
                        },
                        Card: {
                            borderRadius: 12,
                        },
                    },
                }}
            >
                <AntdApp>{app}</AntdApp>
            </ConfigProvider>
        );
    },
    progress: {
        color: '#1d4ed8',
    },
});
