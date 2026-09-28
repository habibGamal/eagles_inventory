import React from 'react';
import { Form, Input, Button, Checkbox, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({
    status,
    canResetPassword = false,
}: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = () => {
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="تسجيل الدخول" />

            {status && (
                <Alert
                    title={status}
                    type="success"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 8 }}
                />
            )}

            {Object.keys(errors).length > 0 && (
                <Alert
                    title="خطأ في تسجيل الدخول"
                    description={
                        <ul style={{ margin: 0, paddingRight: 16 }}>
                            {Object.entries(errors).map(([key, msg]) => (
                                <li key={key}>{msg}</li>
                            ))}
                        </ul>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 8 }}
                />
            )}

            <Form
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                size="large"
            >
                <Form.Item
                    label={
                        <span style={{ fontWeight: 500, color: '#334155' }}>
                            البريد الإلكتروني
                        </span>
                    }
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="admin@eagles.com"
                        type="email"
                        autoComplete="username"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        disabled={processing}
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span style={{ fontWeight: 500, color: '#334155' }}>
                            كلمة المرور
                        </span>
                    }
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                    />
                </Form.Item>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 20,
                    }}
                >
                    <Checkbox
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        disabled={processing}
                    >
                        <span style={{ fontSize: 13, color: '#475569' }}>
                            تذكرني على هذا الجهاز
                        </span>
                    </Checkbox>

                    {canResetPassword && (
                        <Link
                            href="/forgot-password"
                            style={{
                                fontSize: 13,
                                color: '#1d4ed8',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}
                        >
                            نسيت كلمة المرور؟
                        </Link>
                    )}
                </div>

                <Form.Item style={{ marginBottom: 12 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        block
                        style={{
                            height: 44,
                            fontWeight: 600,
                            fontSize: 15,
                            backgroundColor: '#1d4ed8',
                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                        }}
                    >
                        تسجيل الدخول للنظام
                    </Button>
                </Form.Item>

                {/* Demo access hint */}
                <div
                    style={{
                        marginTop: 18,
                        padding: '10px 14px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 8,
                        border: '1px dashed #cbd5e1',
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#64748b',
                    }}
                >
                    <div>بيانات الدخول التجريبية:</div>
                    <div
                        style={{
                            direction: 'ltr',
                            fontWeight: 600,
                            color: '#334155',
                            marginTop: 2,
                        }}
                    >
                        test@example.com / password
                    </div>
                </div>
            </Form>
        </>
    );
}
