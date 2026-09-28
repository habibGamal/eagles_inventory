import React, { useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Button,
    Input,
    Tag,
    Modal,
    Form,
    Switch,
    Popconfirm,
    Avatar,
    Typography,
    Space,
    Tooltip,
    Alert,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    MailOutlined,
    LockOutlined,
    ReloadOutlined,
    CheckCircleFilled,
    ClockCircleFilled,
    UsergroupAddOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;

interface UserRecord {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: UserRecord[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    per_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    to: number;
    total: number;
}

interface UsersIndexProps {
    users: PaginationMeta;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        unverified: number;
        new_this_month: number;
    };
}

export default function UsersIndex({ users, filters, stats }: UsersIndexProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{
        auth: { user: { id: number } };
        errors: Record<string, string>;
    }>();
    const currentUserId = page.props.auth?.user?.id;
    const errors = page.props.errors || {};

    // Search trigger
    const handleSearch = () => {
        router.get(
            '/users',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    // Password Generator Helper
    const generateRandomPassword = (formInstance: typeof createForm) => {
        const chars =
            'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
        let pass = '';
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        formInstance.setFieldValue('password', pass);
    };

    // Open Edit Modal
    const handleOpenEdit = (user: UserRecord) => {
        setEditingUser(user);
        editForm.setFieldsValue({
            name: user.name,
            email: user.email,
            is_active: !!user.email_verified_at,
            password: '',
        });
        setIsEditModalOpen(true);
    };

    // Submit Create
    const handleCreateSubmit = (values: {
        name: string;
        email: string;
        password: string;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/users', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Submit Edit
    const handleEditSubmit = (values: {
        name: string;
        email: string;
        password?: string;
        is_active?: boolean;
    }) => {
        if (!editingUser) return;
        setSubmitting(true);
        router.put(`/users/${editingUser.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingUser(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    // Submit Delete
    const handleDeleteUser = (userId: number) => {
        router.delete(`/users/${userId}`);
    };

    // Columns Definition
    const columns = [
        {
            title: 'المستخدم',
            key: 'name',
            render: (_: unknown, record: UserRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar
                        size={40}
                        style={{
                            backgroundColor:
                                record.id === currentUserId
                                    ? '#1d4ed8'
                                    : '#334155',
                            color: '#ffffff',
                            fontWeight: 600,
                        }}
                    >
                        {record.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    fontSize: 14,
                                }}
                            >
                                {record.name}
                            </span>
                            {record.id === currentUserId && (
                                <Tag
                                    color="blue"
                                    style={{
                                        borderRadius: 6,
                                        margin: 0,
                                        fontSize: 11,
                                    }}
                                >
                                    حسابك
                                </Tag>
                            )}
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                direction: 'ltr',
                                textAlign: 'right',
                                marginTop: 2,
                            }}
                        >
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'حالة الحساب',
            key: 'status',
            width: 150,
            render: (_: unknown, record: UserRecord) => (
                <Tag
                    color={record.email_verified_at ? 'success' : 'warning'}
                    icon={
                        record.email_verified_at ? (
                            <CheckCircleFilled />
                        ) : (
                            <ClockCircleFilled />
                        )
                    }
                    style={{
                        borderRadius: 12,
                        padding: '3px 12px',
                        fontSize: 12,
                        fontWeight: 500,
                    }}
                >
                    {record.email_verified_at ? 'مفعّل ونشط' : 'قيد التحقق'}
                </Tag>
            ),
        },
        {
            title: 'تاريخ الإضافة',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (date: string) => (
                <Text
                    type="secondary"
                    style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}
                >
                    {new Date(date).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </Text>
            ),
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 140,
            align: 'center' as const,
            render: (_: unknown, record: UserRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات المستخدم">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    {record.id !== currentUserId && (
                        <Popconfirm
                            title="حذف المستخدم"
                            description="هل أنت متأكد من حذف هذا المستخدم نهائياً من النظام؟"
                            okText="نعم، حذف"
                            cancelText="إلغاء"
                            okButtonProps={{ danger: true }}
                            onConfirm={() => handleDeleteUser(record.id)}
                        >
                            <Tooltip title="حذف المستخدم">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Head title="إدارة المستخدمين" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Title & Breadcrumb */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}
                >
                    <div>
                        <Title
                            level={2}
                            style={{
                                margin: 0,
                                fontWeight: 700,
                                color: '#0f172a',
                            }}
                        >
                            إدارة المستخدمين والصلاحيات
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            عرض وتعديل وإضافة مستخدمي نظام إيجلز لإدارة
                            المستودعات
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            createForm.resetFields();
                            createForm.setFieldValue('is_active', true);
                            setIsCreateModalOpen(true);
                        }}
                        style={{
                            backgroundColor: '#1d4ed8',
                            borderRadius: 10,
                            fontWeight: 600,
                            height: 42,
                            width: isMobile ? '100%' : 'auto',
                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                        }}
                    >
                        إضافة مستخدم جديد
                    </Button>
                </div>

                {/* Metric Summary Strip */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: isMobile ? '14px 16px' : '16px 20px' } }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        إجمالي المستخدمين
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.total}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#eff6ff',
                                        color: '#1d4ed8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <UserOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: isMobile ? '14px 16px' : '16px 20px' } }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        الحسابات المفعلة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#059669',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.active}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <CheckCircleFilled />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: isMobile ? '14px 16px' : '16px 20px' } }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        في انتظار التفعيل
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#d97706',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.unverified}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#fffbeb',
                                        color: '#d97706',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <ClockCircleFilled />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: isMobile ? '14px 16px' : '16px 20px' } }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        المنضمين هذا الشهر
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.new_this_month}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#faf5ff',
                                        color: '#7c3aed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <UsergroupAddOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Filter and Table Container */}
                <Card
                    variant="outlined"
                    style={{
                        borderRadius: 16,
                        borderColor: '#e2e8f0',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    }}
                    styles={{ body: { padding: isMobile ? '16px 14px' : '20px 24px' } }}
                >
                    {/* Search & Action Bar */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 20,
                            flexWrap: 'wrap',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                flex: 1,
                                maxWidth: isMobile ? '100%' : 440,
                                width: '100%',
                                flexWrap: isMobile ? 'wrap' : 'nowrap',
                            }}
                        >
                            <Input
                                placeholder="البحث بالاسم أو البريد الإلكتروني..."
                                prefix={
                                    <SearchOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                                style={{ borderRadius: 8, height: 40, flex: 1, minWidth: isMobile ? '100%' : 200 }}
                            />
                            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
                                <Button
                                    type="primary"
                                    onClick={handleSearch}
                                    style={{
                                        backgroundColor: '#1d4ed8',
                                        height: 40,
                                        flex: isMobile ? 1 : 'none',
                                    }}
                                >
                                    بحث
                                </Button>
                                {filters.search && (
                                    <Button
                                        onClick={handleResetSearch}
                                        style={{ height: 40, flex: isMobile ? 1 : 'none' }}
                                    >
                                        إعادة ضبط
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#64748b' }}>
                            عرض <Text strong>{users.data.length}</Text> من
                            إجمالي <Text strong>{users.total}</Text> مستخدم
                        </div>
                    </div>

                    {/* Users Data Table */}
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={users.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: users.current_page,
                            pageSize: users.per_page,
                            total: users.total,
                            showSizeChanger: false,
                            onChange: (page) => {
                                router.get(
                                    '/users',
                                    { page, search: searchQuery || undefined },
                                    { preserveState: true },
                                );
                            },
                        }}
                    />
                </Card>
            </div>

            {/* Create User Modal */}
            <Modal
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            paddingBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <PlusOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة مستخدم جديد للنظام
                        </span>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                destroyOnHidden
                centered
                width={isMobile ? '95%' : 520}
            >
                {Object.keys(errors).length > 0 && (
                    <Alert
                        title="يرجى تصحيح الأخطاء التالية"
                        description={
                            <ul style={{ margin: 0, paddingRight: 16 }}>
                                {Object.entries(errors).map(([key, msg]) => (
                                    <li key={key}>{msg}</li>
                                ))}
                            </ul>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}

                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateSubmit}
                    initialValues={{ is_active: true }}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>الاسم الكامل</span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المستخدم',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <UserOutlined style={{ color: '#94a3b8' }} />
                            }
                            placeholder="مثال: أحمد عبد الله"
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                البريد الإلكتروني
                            </span>
                        }
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال البريد الإلكتروني',
                            },
                            {
                                type: 'email',
                                message: 'صيغة البريد الإلكتروني غير صحيحة',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <MailOutlined style={{ color: '#94a3b8' }} />
                            }
                            placeholder="ahmed@eagles.com"
                            dir="ltr"
                            style={{ textAlign: 'right' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>
                                    كلمة المرور
                                </span>
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={() =>
                                        generateRandomPassword(createForm)
                                    }
                                    style={{
                                        padding: 0,
                                        fontSize: 12,
                                        color: '#1d4ed8',
                                    }}
                                >
                                    توليد كلمة مرور
                                </Button>
                            </div>
                        }
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال كلمة المرور',
                            },
                            {
                                min: 8,
                                message: 'يجب ألا تقل كلمة المرور عن 8 خانات',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={
                                <LockOutlined style={{ color: '#94a3b8' }} />
                            }
                            placeholder="••••••••"
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                تفعيل الحساب فوراً
                            </span>
                        }
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                            marginTop: 24,
                        }}
                    >
                        <Button onClick={() => setIsCreateModalOpen(false)}>
                            إلغاء
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            style={{ backgroundColor: '#1d4ed8' }}
                        >
                            حفظ المستخدم
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            paddingBottom: 8,
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <EditOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            تعديل بيانات المستخدم
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                }}
                footer={null}
                destroyOnHidden
                centered
                width={isMobile ? '95%' : 520}
            >
                {Object.keys(errors).length > 0 && (
                    <Alert
                        title="يرجى تصحيح الأخطاء التالية"
                        description={
                            <ul style={{ margin: 0, paddingRight: 16 }}>
                                {Object.entries(errors).map(([key, msg]) => (
                                    <li key={key}>{msg}</li>
                                ))}
                            </ul>
                        }
                        type="error"
                        showIcon
                        style={{ marginBottom: 16, borderRadius: 8 }}
                    />
                )}

                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditSubmit}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>الاسم الكامل</span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المستخدم',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <UserOutlined style={{ color: '#94a3b8' }} />
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                البريد الإلكتروني
                            </span>
                        }
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال البريد الإلكتروني',
                            },
                            {
                                type: 'email',
                                message: 'صيغة البريد الإلكتروني غير صحيحة',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <MailOutlined style={{ color: '#94a3b8' }} />
                            }
                            dir="ltr"
                            style={{ textAlign: 'right' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>
                                    كلمة مرور جديدة (اختياري)
                                </span>
                                <Button
                                    type="link"
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={() =>
                                        generateRandomPassword(editForm)
                                    }
                                    style={{
                                        padding: 0,
                                        fontSize: 12,
                                        color: '#1d4ed8',
                                    }}
                                >
                                    توليد كلمة مرور
                                </Button>
                            </div>
                        }
                        name="password"
                        rules={[
                            {
                                min: 8,
                                message: 'يجب ألا تقل كلمة المرور عن 8 خانات',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={
                                <LockOutlined style={{ color: '#94a3b8' }} />
                            }
                            placeholder="اتركه فارغاً للإبقاء على كلمة المرور الحالية"
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة تفعيل الحساب
                            </span>
                        }
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                            marginTop: 24,
                        }}
                    >
                        <Button
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setEditingUser(null);
                            }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            style={{ backgroundColor: '#1d4ed8' }}
                        >
                            حفظ التعديلات
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
}
