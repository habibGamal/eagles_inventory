import React, { useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Button,
    Input,
    InputNumber,
    Tag,
    Modal,
    Form,
    Select,
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
    BarcodeOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    WarningFilled,
    FolderOutlined,
    AppstoreOutlined,
    EyeOutlined,
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ItemRecord {
    id: number;
    name: string;
    category_id: number;
    unit_id: number;
    category?: { id: number; name: string } | null;
    unit?: { id: number; name: string; symbol: string } | null;
    description: string | null;
    minimum_stock: string | number;
    is_active: boolean;
    stock_balances_count?: number;
    stock_movements_count?: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: ItemRecord[];
    per_page: number;
    total: number;
}

interface ItemsIndexProps {
    items: PaginationMeta;
    categoryOptions: Array<{ id: number; name: string }>;
    unitOptions: Array<{ id: number; name: string; symbol: string }>;
    filters: {
        search?: string;
        category_id?: number | null;
    };
    stats: {
        total: number;
        active: number;
        categories: number;
    };
}

export default function ItemsIndex({
    items,
    categoryOptions = [],
    unitOptions = [],
    filters,
    stats,
}: ItemsIndexProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState<
        number | undefined
    >(filters.category_id ? Number(filters.category_id) : undefined);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ItemRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/items',
            {
                search: searchQuery || undefined,
                category_id: selectedCategory || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        setSelectedCategory(undefined);
        router.get('/items', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (item: ItemRecord) => {
        setEditingItem(item);
        editForm.setFieldsValue({
            name: item.name,
            category_id: item.category_id,
            unit_id: item.unit_id,
            minimum_stock: Number(item.minimum_stock) || 0,
            description: item.description,
            is_active: item.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        category_id: number;
        unit_id: number;
        minimum_stock?: number;
        description?: string;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/items', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: {
        name: string;
        category_id: number;
        unit_id: number;
        minimum_stock?: number;
        description?: string;
        is_active?: boolean;
    }) => {
        if (!editingItem) return;
        setSubmitting(true);
        router.put(`/items/${editingItem.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingItem(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/items/${id}`);
    };

    const columns = [
        {
            title: 'اسم الصنف والمواصفات',
            key: 'name',
            render: (_: unknown, record: ItemRecord) => (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            flexShrink: 0,
                            marginTop: 2,
                        }}
                    >
                        <BarcodeOutlined />
                    </div>
                    <div>
                        <Link
                            href={`/items/${record.id}`}
                            style={{
                                fontWeight: 600,
                                color: '#1d4ed8',
                                fontSize: 14,
                                textDecoration: 'none',
                                display: 'inline-block',
                            }}
                        >
                            {record.name}
                        </Link>
                        {record.description && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    marginTop: 2,
                                    maxWidth: 280,
                                }}
                            >
                                {record.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'التصنيف',
            key: 'category',
            width: 160,
            render: (_: unknown, record: ItemRecord) => (
                <Tag color="cyan" style={{ borderRadius: 8 }}>
                    <FolderOutlined style={{ marginLeft: 4 }} />
                    {record.category?.name || 'غير محدد'}
                </Tag>
            ),
        },
        {
            title: 'وحدة القياس',
            key: 'unit',
            width: 130,
            render: (_: unknown, record: ItemRecord) => (
                <Tag
                    color="geekblue"
                    style={{ borderRadius: 8, fontWeight: 500 }}
                >
                    {record.unit?.name} ({record.unit?.symbol})
                </Tag>
            ),
        },
        {
            title: 'الحد الأدنى للطلب',
            dataIndex: 'minimum_stock',
            key: 'minimum_stock',
            width: 140,
            render: (min: string | number) => (
                <Text
                    style={{
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 600,
                        color: '#334155',
                    }}
                >
                    {Number(min).toLocaleString('ar-EG')}
                </Text>
            ),
        },
        {
            title: 'حالة الصنف',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
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
                    {active ? 'متاح للطلب' : 'معطل'}
                </Tag>
            ),
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 140,
            align: 'center' as const,
            render: (_: unknown, record: ItemRecord) => (
                <Space size="small">
                    <Tooltip title="عرض حركات ورصيد الصنف بالمستودعات">
                        <Link href={`/items/${record.id}`}>
                            <Button
                                type="text"
                                icon={<EyeOutlined style={{ color: '#059669' }} />}
                            />
                        </Link>
                    </Tooltip>

                    <Tooltip title="تعديل بيانات الصنف">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف الصنف"
                        description="هل أنت متأكد من حذف هذا الصنف المخزني؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف الصنف">
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
            <Head title="الأصناف والمخزون" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header */}
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
                            دليل الأصناف والمواد المخزنية
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            تعريف وإدارة كافة المواد، قطع الغيار، والمهمات وحدود
                            الأمان للطلب
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            createForm.resetFields();
                            createForm.setFieldsValue({
                                minimum_stock: 0,
                                is_active: true,
                            });
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
                        إضافة صنف جديد
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
                                        إجمالي الأصناف المعرفة
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
                                    <BarcodeOutlined />
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
                                        الأصناف النشطة
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
                                        التصنيفات الممثلة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.categories}
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
                                    <AppstoreOutlined />
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
                                maxWidth: isMobile ? '100%' : 600,
                                width: isMobile ? '100%' : 'auto',
                                flexWrap: isMobile ? 'wrap' : 'nowrap',
                            }}
                        >
                            <Input
                                placeholder="البحث باسم الصنف أو المواصفات..."
                                prefix={
                                    <SearchOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                                style={{ borderRadius: 8, height: 40, flex: isMobile ? '1 1 100%' : 1 }}
                            />

                            <Select
                                placeholder="تصفية حسب التصنيف"
                                allowClear
                                value={selectedCategory}
                                onChange={(v) => setSelectedCategory(v)}
                                style={{ width: isMobile ? '100%' : 200, height: 40 }}
                                options={categoryOptions.map((c) => ({
                                    label: c.name,
                                    value: c.id,
                                }))}
                            />

                            <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
                                <Button
                                    type="primary"
                                    onClick={handleSearch}
                                    style={{
                                        backgroundColor: '#1d4ed8',
                                        height: 40,
                                        flex: isMobile ? 1 : undefined,
                                    }}
                                >
                                    تصفية
                                </Button>

                                {(filters.search || filters.category_id) && (
                                    <Button
                                        onClick={handleResetSearch}
                                        style={{ height: 40, flex: isMobile ? 1 : undefined }}
                                    >
                                        إعادة ضبط
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: 13, color: '#64748b' }}>
                            عرض <Text strong>{items.data.length}</Text> من
                            إجمالي <Text strong>{items.total}</Text> صنف
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={items.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: items.current_page,
                            pageSize: items.per_page,
                            total: items.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/items',
                                    {
                                        page: p,
                                        search: searchQuery || undefined,
                                        category_id:
                                            selectedCategory || undefined,
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
                            <BarcodeOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة صنف مخزني جديد
                        </span>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                destroyOnHidden
                centered
                width={isMobile ? '95%' : 580}
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
                    initialValues={{ minimum_stock: 0, is_active: true }}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                اسم الصنف المخزني
                            </span>
                        }
                        name="name"
                        rules={[
                            { required: true, message: 'يرجى إدخال اسم الصنف' },
                        ]}
                    >
                        <Input placeholder="مثال: مضخة هيدروليكية طراز X-400" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 500 }}>
                                        التصنيف الرئيسي
                                    </span>
                                }
                                name="category_id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'يرجى تحديد التصنيف',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="اختر التصنيف"
                                    options={categoryOptions.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 500 }}>
                                        وحدة القياس
                                    </span>
                                }
                                name="unit_id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'يرجى تحديد وحدة القياس',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="اختر وحدة القياس"
                                    options={unitOptions.map((u) => ({
                                        label: `${u.name} (${u.symbol})`,
                                        value: u.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حد الأمان الأدنى للمخزون (الطلب التلقائي)
                            </span>
                        }
                        name="minimum_stock"
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="0"
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الوصف والمواصفات الفنية
                            </span>
                        }
                        name="description"
                    >
                        <TextArea
                            rows={3}
                            placeholder="أدخل أية مواصفات فنية أو تفاصيل هامة للصنف..."
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة الصنف (متاح للطلب)
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
                            حفظ الصنف
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
                            تعديل بيانات الصنف المخزني
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingItem(null);
                }}
                footer={null}
                destroyOnHidden
                centered
                width={isMobile ? '95%' : 580}
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
                                اسم الصنف المخزني
                            </span>
                        }
                        name="name"
                        rules={[
                            { required: true, message: 'يرجى إدخال اسم الصنف' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 500 }}>
                                        التصنيف الرئيسي
                                    </span>
                                }
                                name="category_id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'يرجى تحديد التصنيف',
                                    },
                                ]}
                            >
                                <Select
                                    options={categoryOptions.map((c) => ({
                                        label: c.name,
                                        value: c.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label={
                                    <span style={{ fontWeight: 500 }}>
                                        وحدة القياس
                                    </span>
                                }
                                name="unit_id"
                                rules={[
                                    {
                                        required: true,
                                        message: 'يرجى تحديد وحدة القياس',
                                    },
                                ]}
                            >
                                <Select
                                    options={unitOptions.map((u) => ({
                                        label: `${u.name} (${u.symbol})`,
                                        value: u.id,
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حد الأمان الأدنى للمخزون
                            </span>
                        }
                        name="minimum_stock"
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الوصف والمواصفات الفنية
                            </span>
                        }
                        name="description"
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة الصنف (متاح للطلب)
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
                                setEditingItem(null);
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
