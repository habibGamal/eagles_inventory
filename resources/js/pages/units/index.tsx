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
    ColumnWidthOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';

const { Title, Text } = Typography;

interface UnitRecord {
    id: number;
    name: string;
    symbol: string;
    items_count?: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: UnitRecord[];
    per_page: number;
    total: number;
}

interface UnitsIndexProps {
    units: PaginationMeta;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        linked_items: number;
    };
}

export default function UnitsIndex({ units, filters, stats }: UnitsIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<UnitRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/units',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/units', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (unit: UnitRecord) => {
        setEditingUnit(unit);
        editForm.setFieldsValue({
            name: unit.name,
            symbol: unit.symbol,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: { name: string; symbol: string }) => {
        setSubmitting(true);
        router.post('/units', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: { name: string; symbol: string }) => {
        if (!editingUnit) return;
        setSubmitting(true);
        router.put(`/units/${editingUnit.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingUnit(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/units/${id}`);
    };

    const columns = [
        {
            title: 'اسم وحدة القياس',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
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
                        <ColumnWidthOutlined />
                    </div>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {text}
                    </span>
                </div>
            ),
        },
        {
            title: 'الرمز / الاختصار',
            dataIndex: 'symbol',
            key: 'symbol',
            width: 150,
            render: (symbol: string) => (
                <Tag
                    color="geekblue"
                    style={{
                        borderRadius: 8,
                        padding: '2px 10px',
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    {symbol}
                </Tag>
            ),
        },
        {
            title: 'الأصناف المرتبطة بها',
            key: 'items',
            width: 180,
            render: (_: unknown, record: UnitRecord) => (
                <Tag
                    color={
                        record.items_count && record.items_count > 0
                            ? 'blue'
                            : 'default'
                    }
                    style={{ borderRadius: 10 }}
                >
                    {record.items_count || 0} صنف مسجل
                </Tag>
            ),
        },
        {
            title: 'تاريخ الإضافة',
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
            render: (_: unknown, record: UnitRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات الوحدة">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف وحدة القياس"
                        description="هل أنت متأكد من حذف وحدة القياس هذه؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف وحدة القياس">
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
            <Head title="وحدات القياس" />

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
                            إدارة وحدات القياس والمعايرة
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            تعريف الوحدات المعيارية للأصناف والمواد (حبة، متر،
                            لتر، كرتون، كيلوغرام)
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            createForm.resetFields();
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
                        إضافة وحدة قياس
                    </Button>
                </div>

                {/* Metrics */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
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
                                        إجمالي وحدات القياس
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
                                    <ColumnWidthOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12}>
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
                                        الوحدات المستخدمة في الأصناف
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#059669',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.linked_items}
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
                                    <LinkOutlined />
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
                                placeholder="البحث باسم الوحدة أو الرمز..."
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
                            عرض <Text strong>{units.data.length}</Text> من
                            إجمالي <Text strong>{units.total}</Text> وحدة قياس
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={units.data}
                        pagination={{
                            current: units.current_page,
                            pageSize: units.per_page,
                            total: units.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/units',
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
                            <ColumnWidthOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة وحدة قياس جديدة
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
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                اسم وحدة القياس
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم الوحدة',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: كيلوغرام، متر طولي، قطعة" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الرمز / الاختصار
                            </span>
                        }
                        name="symbol"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال رمز الوحدة',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: كجم، م، حبة" />
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
                            حفظ وحدة القياس
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
                            تعديل بيانات وحدة القياس
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingUnit(null);
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
                            <span style={{ fontWeight: 500 }}>
                                اسم وحدة القياس
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم الوحدة',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الرمز / الاختصار
                            </span>
                        }
                        name="symbol"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال رمز الوحدة',
                            },
                        ]}
                    >
                        <Input />
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
                                setEditingUnit(null);
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
