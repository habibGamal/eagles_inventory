import React from 'react';
import { Card, Typography, Space } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthLayout({
    children,
    title = 'تسجيل الدخول',
    description = 'مرحباً بك مجدداً في نظام إيجلز لإدارة المخزون',
}: AuthLayoutProps) {
    return (
        <div
            dir="rtl"
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f1f5f9',
                backgroundImage:
                    'radial-gradient(at 100% 0%, rgba(29, 78, 216, 0.08) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 23, 42, 0.06) 0px, transparent 50%)',
                padding: '24px 16px',
            }}
        >
            <div style={{ width: '100%', maxWidth: 440 }}>
                {/* Brand Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            margin: '0 auto 16px',
                            borderRadius: 14,
                            backgroundColor: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontSize: 26,
                            boxShadow:
                                '0 8px 16px -4px rgba(29, 78, 216, 0.35)',
                        }}
                    >
                        <SafetyCertificateOutlined />
                    </div>
                    <Title
                        level={3}
                        style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    >
                        إيجلز للمخزون
                    </Title>
                    <Text
                        type="secondary"
                        style={{ fontSize: 13, display: 'block', marginTop: 4 }}
                    >
                        EAGLES INVENTORY MANAGEMENT
                    </Text>
                </div>

                {/* Main Auth Card */}
                <Card
                    variant="outlined"
                    style={{
                        borderRadius: 16,
                        boxShadow:
                            '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                        borderColor: '#e2e8f0',
                    }}
                    styles={{ body: { padding: '32px 28px' } }}
                >
                    <div style={{ marginBottom: 24, textAlign: 'right' }}>
                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                fontWeight: 600,
                                color: '#0f172a',
                            }}
                        >
                            {title}
                        </Title>
                        {description && (
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 14,
                                    marginTop: 4,
                                    display: 'block',
                                }}
                            >
                                {description}
                            </Text>
                        )}
                    </div>

                    {children}
                </Card>

                {/* Footer copyright */}
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        جميع الحقوق محفوظة © {new Date().getFullYear()} إيجلز
                        لإدارة المستودعات
                    </Text>
                </div>
            </div>
        </div>
    );
}
