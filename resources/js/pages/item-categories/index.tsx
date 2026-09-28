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
    FolderOpenOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    TagsOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';

const { Title, Text } = Typography;

interface ItemCategoryRecord {
    id: number;
    name: string;
    parent_id: number | null;
    parent?: { id: number; name: string } | null;
    children_count?: number;
    items_count?: number;
    is_active: boolean;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: ItemCategoryRecord[];
    per_page: number;
    total: number;
}

interface ItemCategoriesIndexProps {
    categories: PaginationMeta;
    parentOptions: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        main_categories: number;
    };
}

export default function ItemCategoriesIndex({
    categories,
    parentOptions = [],
    filters,
    stats,
}: ItemCategoriesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ItemCategoryRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/item-categories',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get(
            '/item-categories',
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleOpenEdit = (category: ItemCategoryRecord) => {
        setEditingCategory(category);
        editForm.setFieldsValue({
            name: category.name,
            parent_id: category.parent_id,
            is_active: category.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        parent_id?: number | null;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/item-categories', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: {
        name: string;
        parent_id?: number | null;
        is_active?: boolean;
    }) => {
        if (!editingCategory) return;
        setSubmitting(true);
        router.put(`/item-categories/${editingCategory.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/item-categories/${id}`);
    };

    const columns = [
        {
            title: 'اسم التصنيف',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: ItemCategoryRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                        }}
                    >
                        <FolderOpenOutlined />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {text}
                        </div>
                        {record.parent ? (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    marginTop: 2,
                                }}
                            >
                                فرعي من:{' '}
                                <span style={{ color: '#1d4ed8' }}>
                                    {record.parent.name}
                                </span>
                            </div>
                        ) : (
                            <div
                                style={{
                                    fontSize: 11,
                                    color: '#059669',
                                    marginTop: 2,
                                }}
                            >
                                تصنيف رئيسي
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'الحالة',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 130,
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
                    {active ? 'نشط' : 'معطل'}
                </Tag>
            ),
        },
        {
            title: 'الأصناف التابعة',
            key: 'items',
            width: 150,
            render: (_: unknown, record: ItemCategoryRecord) => (
                <Tag color="blue" style={{ borderRadius: 10 }}>
                    {record.items_count || 0} صنف مسجل
                </Tag>
            ),
        },
        {
            title: 'التصنيفات الفرعية',
            key: 'children',
            width: 150,
            render: (_: unknown, record: ItemCategoryRecord) => (
                <Tag color="cyan" style={{ borderRadius: 10 }}>
                    {record.children_count || 0} تصنيف فرعي
                </Tag>
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
            width: 120,
            align: 'center' as const,
            render: (_: unknown, record: ItemCategoryRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات التصنيف">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف التصنيف"
                        description="هل أنت متأكد من حذف هذا التصنيف؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف التصنيف">
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
            <Head title="تصنيفات الأصناف" />

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
                            إدارة تصنيفات الأصناف المخزنية
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            تنظيم وهيكلة المواد والمهمات ضمن شجرة تصنيفية دقيقة
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
                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                        }}
                    >
                        إضافة تصنيف جديد
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
                                        إجمالي التصنيفات
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
                                    <FolderOpenOutlined />
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
                                        التصنيفات النشطة
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
                                        التصنيفات الرئيسية
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.main_categories}
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
                                    <TagsOutlined />
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
                    styles={{ body: { padding: '20px 24px' } }}
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
                                maxWidth: 420,
                            }}
                        >
                            <Input
                                placeholder="البحث باسم التصنيف..."
                                prefix={
                                    <SearchOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                                style={{ borderRadius: 8, height: 40 }}
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
                            عرض <Text strong>{categories.data.length}</Text> من
                            إجمالي <Text strong>{categories.total}</Text> تصنيف
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={categories.data}
                        pagination={{
                            current: categories.current_page,
                            pageSize: categories.per_page,
                            total: categories.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/item-categories',
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
                            <FolderOpenOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة تصنيف جديد
                        </span>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                destroyOnHidden
                centered
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
                            <span style={{ fontWeight: 500 }}>اسم التصنيف</span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم التصنيف',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: قطع غيار المحركات" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                التصنيف الرئيسي التابع له (اختياري)
                            </span>
                        }
                        name="parent_id"
                    >
                        <Select
                            placeholder="حدد التصنيف الرئيسي (أو اتركه فارغاً إذا كان رئيسياً)"
                            allowClear
                            options={parentOptions.map((p) => ({
                                label: p.name,
                                value: p.id,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة التصنيف (نشط)
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
                            حفظ التصنيف
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
                            تعديل بيانات التصنيف
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingCategory(null);
                }}
                footer={null}
                destroyOnHidden
                centered
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
                            <span style={{ fontWeight: 500 }}>اسم التصنيف</span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم التصنيف',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                التصنيف الرئيسي
                            </span>
                        }
                        name="parent_id"
                    >
                        <Select
                            placeholder="حدد التصنيف الرئيسي"
                            allowClear
                            options={parentOptions
                                .filter((p) => p.id !== editingCategory?.id)
                                .map((p) => ({ label: p.name, value: p.id }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة التصنيف (نشط)
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
                                setEditingCategory(null);
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
