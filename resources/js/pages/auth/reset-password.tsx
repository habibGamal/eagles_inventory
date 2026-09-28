import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Head, useForm } from '@inertiajs/react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = () => {
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="تعيين كلمة المرور الجديدة" />

            {Object.keys(errors).length > 0 && (
                <Alert
                    title="خطأ في البيانات المدخلة"
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
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        type="email"
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
                            كلمة المرور الجديدة
                        </span>
                    }
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        disabled={processing}
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                    />
                </Form.Item>

                <Form.Item
                    label={
                        <span style={{ fontWeight: 500, color: '#334155' }}>
                            تأكيد كلمة المرور
                        </span>
                    }
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        disabled={processing}
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 12 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={processing}
                        block
                        style={{
                            height: 44,
                            fontWeight: 600,
                            backgroundColor: '#1d4ed8',
                        }}
                    >
                        تحديث كلمة المرور
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
}
