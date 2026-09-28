import React from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Head, Link, useForm } from '@inertiajs/react';

interface ForgotPasswordProps {
    status?: string;
}

export default function ForgotPassword({ status }: ForgotPasswordProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = () => {
        post('/forgot-password');
    };

    return (
        <>
            <Head title="استعادة كلمة المرور" />

            {status && (
                <Alert
                    title={status}
                    type="success"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 8 }}
                />
            )}

            {errors.email && (
                <Alert
                    title={errors.email}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20, borderRadius: 8 }}
                />
            )}

            <div style={{ marginBottom: 20, fontSize: 13, color: '#64748b' }}>
                نسيت كلمة المرور؟ لا توجد مشكلة. أدخل بريدك الإلكتروني وسنرسل لك
                رابطاً لإعادة تعيين كلمة المرور.
            </div>

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
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
                        placeholder="your-email@example.com"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
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
                        إرسال رابط إعادة التعيين
                    </Button>
                </Form.Item>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link
                        href="/login"
                        style={{
                            color: '#1d4ed8',
                            fontSize: 13,
                            textDecoration: 'none',
                        }}
                    >
                        العودة لصفحة تسجيل الدخول
                    </Link>
                </div>
            </Form>
        </>
    );
}
