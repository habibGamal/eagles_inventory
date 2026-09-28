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
    ShopOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    AppstoreOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;

interface WarehouseRecord {
    id: number;
    name: string;
    is_active: boolean;
    stock_balances_count?: number;
    purchase_invoices_count?: number;
    dispatch_vouchers_count?: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: WarehouseRecord[];
    per_page: number;
    total: number;
}

interface WarehousesIndexProps {
    warehouses: PaginationMeta;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function WarehousesIndex({
    warehouses,
    filters,
    stats,
}: WarehousesIndexProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] =
        useState<WarehouseRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/warehouses',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/warehouses', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (warehouse: WarehouseRecord) => {
        setEditingWarehouse(warehouse);
        editForm.setFieldsValue({
            name: warehouse.name,
            is_active: warehouse.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/warehouses', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: {
        name: string;
        is_active?: boolean;
    }) => {
        if (!editingWarehouse) return;
        setSubmitting(true);
        router.put(`/warehouses/${editingWarehouse.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingWarehouse(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/warehouses/${id}`);
    };

    const columns = [
        {
            title: 'اسم المستودع',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: WarehouseRecord) => (
                <Link
                    href={`/warehouses/${record.id}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            flexShrink: 0,
                        }}
                    >
                        <ShopOutlined />
                    </div>
                    <div>
                        <span
                            style={{
                                fontWeight: 600,
                                color: '#1d4ed8',
                                display: 'block',
                            }}
                        >
                            {text}
                        </span>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            انقر لعرض تفاصيل المخزون
                        </Text>
                    </div>
                </Link>
            ),
        },
        {
            title: 'حالة المستودع',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 140,
            render: (active: boolean) => (
                <Tag
                    color={active ? 'success' : 'default'}
                    icon={
                        active ? <CheckCircleFilled /> : <CloseCircleFilled />
                    }
                    style={{
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontWeight: 500,
                    }}
                >
                    {active ? 'نشط ومتاح' : 'متوقف'}
                </Tag>
            ),
        },
        {
            title: 'العمليات المرتبطة',
            key: 'operations',
            width: 230,
            render: (_: unknown, record: WarehouseRecord) => (
                <Space orientation="horizontal" size="small">
                    <Tooltip title="عرض أرصدة ومخزون هذا المستودع">
                        <Link href={`/warehouses/${record.id}`}>
                            <Tag color="blue" style={{ cursor: 'pointer' }}>
                                {record.stock_balances_count || 0} أرصدة
                            </Tag>
                        </Link>
                    </Tooltip>
                    <Tooltip title="فواتير توريد">
                        <Tag color="orange">
                            {record.purchase_invoices_count || 0} توريد
                        </Tag>
                    </Tooltip>
                    <Tooltip title="أذون صرف">
                        <Tag color="purple">
                            {record.dispatch_vouchers_count || 0} صرف
                        </Tag>
                    </Tooltip>
                </Space>
            ),
        },
        {
            title: 'تاريخ الإنشاء',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 170,
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
            width: 150,
            align: 'center' as const,
            render: (_: unknown, record: WarehouseRecord) => (
                <Space size="small">
                    <Tooltip title="عرض أرصدة ومخزون المستودع">
                        <Link href={`/warehouses/${record.id}`}>
                            <Button
                                type="text"
                                icon={
                                    <EyeOutlined
                                        style={{ color: '#059669' }}
                                    />
                                }
                            />
                        </Link>
                    </Tooltip>

                    <Tooltip title="تعديل بيانات المستودع">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف المستودع"
                        description="هل أنت متأكد من حذف هذا المستودع نهائياً؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف المستودع">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Head title="إدارة المستودعات" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Title */}
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
                            إدارة المستودعات ومواقع التخزين
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            تهيئة وتحديد المستودعات المركزية والفرعية ومراقبة
                            حالتها التشغيلية
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
                        إضافة مستودع جديد
                    </Button>
                </div>

                {/* Metrics */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: '16px 20px' } }}
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
                                        إجمالي المستودعات
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
                                    <ShopOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={8}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: '16px 20px' } }}
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
                                        المستودعات النشطة
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

                    <Col xs={24} sm={8}>
                        <Card
                            variant="outlined"
                            style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                            styles={{ body: { padding: '16px 20px' } }}
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
                                        المستودعات المعطلة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#64748b',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.inactive}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#f1f5f9',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <CloseCircleFilled />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Table Container */}
                <Card
                    variant="outlined"
                    style={{
                        borderRadius: 16,
                        borderColor: '#e2e8f0',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    }}
                    styles={{ body: { padding: isMobile ? '16px 12px' : '20px 24px' } }}
                >
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
                                maxWidth: isMobile ? '100%' : 420,
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            <Input
                                placeholder="البحث باسم المستودع..."
                                prefix={
                                    <SearchOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                                style={{ borderRadius: 8, height: 40, flex: 1 }}
                            />
                            <Button
                                type="primary"
                                onClick={handleSearch}
                                style={{
                                    backgroundColor: '#1d4ed8',
                                    height: 40,
                                }}
                            >
                                بحث
                            </Button>
                            {filters.search && (
                                <Button
                                    onClick={handleResetSearch}
                                    style={{ height: 40 }}
                                >
                                    إعادة ضبط
                                </Button>
                            )}
                        </div>

                        <div style={{ fontSize: 13, color: '#64748b' }}>
                            عرض <Text strong>{warehouses.data.length}</Text> من
                            إجمالي <Text strong>{warehouses.total}</Text> مستودع
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={warehouses.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: warehouses.current_page,
                            pageSize: warehouses.per_page,
                            total: warehouses.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/warehouses',
                                    {
                                        page: p,
                                        search: searchQuery || undefined,
                                    },
                                    { preserveState: true },
                                );
                            },
                        }}
                    />
                </Card>
            </div>

            {/* Create Modal */}
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
                            <ShopOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة مستودع جديد
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
                                {Object.entries(errors).map(([k, msg]) => (
                                    <li key={k}>{msg}</li>
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
                            <span style={{ fontWeight: 500 }}>
                                اسم المستودع
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المستودع',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: المستودع المركزي الرئيسي" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة المستودع (نشط)
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
                            حفظ المستودع
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Edit Modal */}
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
                            تعديل بيانات المستودع
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingWarehouse(null);
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
                                {Object.entries(errors).map(([k, msg]) => (
                                    <li key={k}>{msg}</li>
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
                            <span style={{ fontWeight: 500 }}>
                                اسم المستودع
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المستودع',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة المستودع (نشط)
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
                                setEditingWarehouse(null);
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
