import React from 'react';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { Head, useForm } from '@inertiajs/react';

const { Title, Text } = Typography;

export default function Security() {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdatePassword = () => {
        put('/settings/password', {
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="أمان الحساب وكلمة المرور" />

            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title
                        level={3}
                        style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    >
                        أمان الحساب
                    </Title>
                    <Text type="secondary">
                        تحديث كلمة المرور لحماية حسابك في النظام
                    </Text>
                </div>

                {recentlySuccessful && (
                    <Alert
                        title="تم تحديث كلمة المرور بنجاح"
                        type="success"
                        showIcon
                        style={{ marginBottom: 20, borderRadius: 8 }}
                    />
                )}

                <Card variant="outlined" style={{ borderRadius: 12 }}>
                    <Form
                        layout="vertical"
                        onFinish={handleUpdatePassword}
                        size="large"
                    >
                        <Form.Item
                            label={
                                <span style={{ fontWeight: 500 }}>
                                    كلمة المرور الحالية
                                </span>
                            }
                            validateStatus={
                                errors.current_password ? 'error' : ''
                            }
                            help={errors.current_password}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span style={{ fontWeight: 500 }}>
                                    كلمة المرور الجديدة
                                </span>
                            }
                            validateStatus={errors.password ? 'error' : ''}
                            help={errors.password}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span style={{ fontWeight: 500 }}>
                                    تأكيد كلمة المرور الجديدة
                                </span>
                            }
                            validateStatus={
                                errors.password_confirmation ? 'error' : ''
                            }
                            help={errors.password_confirmation}
                        >
                            <Input.Password
                                prefix={
                                    <LockOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                            style={{ backgroundColor: '#1d4ed8' }}
                        >
                            تحديث كلمة المرور
                        </Button>
                    </Form>
                </Card>
            </div>
        </>
    );
}
