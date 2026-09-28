import React from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Alert,
    Typography,
    Popconfirm,
    Divider,
} from 'antd';
import { UserOutlined, MailOutlined, DeleteOutlined } from '@ant-design/icons';
import { Head, useForm, usePage } from '@inertiajs/react';

const { Title, Text } = Typography;

interface ProfileProps {
    mustVerifyEmail?: boolean;
    status?: string;
}

export default function Profile({ mustVerifyEmail, status }: ProfileProps) {
    const page = usePage<{ auth: { user: { name: string; email: string } } }>();
    const user = page.props.auth.user;

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const {
        data: deleteData,
        setData: setDeleteData,
        delete: destroy,
        processing: deleteProcessing,
        errors: deleteErrors,
        reset: resetDelete,
    } = useForm({
        password: '',
    });

    const handleUpdate = () => {
        patch('/settings/profile');
    };

    const handleDelete = () => {
        destroy('/settings/profile', {
            onFinish: () => resetDelete('password'),
        });
    };

    return (
        <>
            <Head title="الملف الشخصي" />

            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title
                        level={3}
                        style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    >
                        إعدادات الملف الشخصي
                    </Title>
                    <Text type="secondary">
                        تحديث معلومات الحساب والبريد الإلكتروني
                    </Text>
                </div>

                {status === 'profile-updated' && (
                    <Alert
                        title="تم تحديث بيانات الملف الشخصي بنجاح"
                        type="success"
                        showIcon
                        style={{ marginBottom: 20, borderRadius: 8 }}
                    />
                )}

                <Card
                    variant="outlined"
                    style={{ borderRadius: 12, marginBottom: 24 }}
                >
                    <Form
                        layout="vertical"
                        onFinish={handleUpdate}
                        size="large"
                    >
                        <Form.Item
                            label={
                                <span style={{ fontWeight: 500 }}>
                                    الاسم الكامل
                                </span>
                            }
                            validateStatus={errors.name ? 'error' : ''}
                            help={errors.name}
                        >
                            <Input
                                prefix={
                                    <UserOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span style={{ fontWeight: 500 }}>
                                    البريد الإلكتروني
                                </span>
                            }
                            validateStatus={errors.email ? 'error' : ''}
                            help={errors.email}
                        >
                            <Input
                                prefix={
                                    <MailOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                dir="ltr"
                                style={{ textAlign: 'right' }}
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={processing}
                            style={{ backgroundColor: '#1d4ed8' }}
                        >
                            حفظ التغييرات
                        </Button>
                    </Form>
                </Card>

                {/* Account Deletion */}
                <Card
                    variant="outlined"
                    style={{ borderRadius: 12, borderColor: '#fecaca' }}
                >
                    <Title level={4} style={{ color: '#dc2626', margin: 0 }}>
                        حذف الحساب
                    </Title>
                    <Text
                        type="secondary"
                        style={{
                            display: 'block',
                            marginTop: 4,
                            marginBottom: 16,
                        }}
                    >
                        بمجرد حذف حسابك، سيتم مسح جميع بياناتك بشكل نهائي.
                    </Text>

                    {deleteErrors.password && (
                        <Alert
                            title={deleteErrors.password}
                            type="error"
                            showIcon
                            style={{ marginBottom: 16, borderRadius: 8 }}
                        />
                    )}

                    <Form layout="vertical" onFinish={handleDelete}>
                        <Form.Item label="أدخل كلمة المرور لتأكيد الحذف">
                            <Input.Password
                                placeholder="كلمة المرور الحالية"
                                value={deleteData.password}
                                onChange={(e) =>
                                    setDeleteData('password', e.target.value)
                                }
                                style={{ maxWidth: 300 }}
                            />
                        </Form.Item>

                        <Button
                            danger
                            type="primary"
                            htmlType="submit"
                            loading={deleteProcessing}
                            icon={<DeleteOutlined />}
                        >
                            تأكيد حذف الحساب
                        </Button>
                    </Form>
                </Card>
            </div>
        </>
    );
}
