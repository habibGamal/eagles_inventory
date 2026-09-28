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
    ApartmentOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    ClusterOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;

interface SectorRecord {
    id: number;
    name: string;
    parent_id: number | null;
    parent?: { id: number; name: string } | null;
    children_count?: number;
    dispatch_vouchers_count?: number;
    is_active: boolean;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: SectorRecord[];
    per_page: number;
    total: number;
}

interface SectorsIndexProps {
    sectors: PaginationMeta;
    parentOptions: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        main_sectors: number;
    };
}

export default function SectorsIndex({
    sectors,
    parentOptions = [],
    filters,
    stats,
}: SectorsIndexProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<SectorRecord | null>(
        null,
    );

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/sectors',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/sectors', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (sector: SectorRecord) => {
        setEditingSector(sector);
        editForm.setFieldsValue({
            name: sector.name,
            parent_id: sector.parent_id,
            is_active: sector.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        parent_id?: number | null;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/sectors', values, {
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
        if (!editingSector) return;
        setSubmitting(true);
        router.put(`/sectors/${editingSector.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingSector(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/sectors/${id}`);
    };

    const columns = [
        {
            title: 'اسم القسم / القطاع',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: SectorRecord) => (
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
                        <ApartmentOutlined />
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
                                تابع لـ:{' '}
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
                                قسم رئيسي
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'حالة القسم',
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
                    {active ? 'نشط ومفعّل' : 'معطل'}
                </Tag>
            ),
        },
        {
            title: 'الأقسام الفرعية',
            key: 'children',
            width: 140,
            render: (_: unknown, record: SectorRecord) => (
                <Tag color="cyan" style={{ borderRadius: 10 }}>
                    {record.children_count || 0} فرعي
                </Tag>
            ),
        },
        {
            title: 'أذون الصرف المسجلة',
            key: 'vouchers',
            width: 160,
            render: (_: unknown, record: SectorRecord) => (
                <Tag color="purple" style={{ borderRadius: 10 }}>
                    {record.dispatch_vouchers_count || 0} إذن صرف
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
            render: (_: unknown, record: SectorRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات القسم">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف القسم"
                        description="هل أنت متأكد من حذف هذا القسم؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف القسم">
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
            <Head title="الأقسام والقطاعات" />

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
                            إدارة الأقسام والقطاعات المستفيدة
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            تنظيم الهيكل الإداري والجهات المستفيدة من أذونات صرف
                            المخزون
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
                            width: isMobile ? '100%' : 'auto',
                        }}
                    >
                        إضافة قسم جديد
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
                                        إجمالي الأقسام
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
                                    <ApartmentOutlined />
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
                                        الأقسام النشطة
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
                                        الأقسام الرئيسية
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.main_sectors}
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
                                    <ClusterOutlined />
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
                    styles={{ body: { padding: isMobile ? '16px 14px' : '20px 24px' } }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: isMobile ? 'stretch' : 'center',
                            justifyContent: 'space-between',
                            marginBottom: 20,
                            flexDirection: isMobile ? 'column' : 'row',
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
                                placeholder="البحث باسم القسم..."
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
                            عرض <Text strong>{sectors.data.length}</Text> من
                            إجمالي <Text strong>{sectors.total}</Text> قسم
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={sectors.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: sectors.current_page,
                            pageSize: sectors.per_page,
                            total: sectors.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/sectors',
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
                            <ApartmentOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة قسم / قطاع جديد
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
                                اسم القسم / الإدارة
                            </span>
                        }
                        name="name"
                        rules={[
                            { required: true, message: 'يرجى إدخال اسم القسم' },
                        ]}
                    >
                        <Input placeholder="مثال: إدارة الصيانة والتشغيل" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                القسم الرئيسي التابع له (اختياري)
                            </span>
                        }
                        name="parent_id"
                    >
                        <Select
                            placeholder="حدد القسم الرئيسي (أو اتركه فارغاً إذا كان رئيسياً)"
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
                                حالة القسم (نشط)
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
                            حفظ القسم
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
                            تعديل بيانات القسم
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingSector(null);
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
                            <span style={{ fontWeight: 500 }}>اسم القسم</span>
                        }
                        name="name"
                        rules={[
                            { required: true, message: 'يرجى إدخال اسم القسم' },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                القسم الرئيسي التابع له
                            </span>
                        }
                        name="parent_id"
                    >
                        <Select
                            placeholder="حدد القسم الرئيسي"
                            allowClear
                            options={parentOptions
                                .filter((p) => p.id !== editingSector?.id)
                                .map((p) => ({ label: p.name, value: p.id }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة القسم (نشط)
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
                                setEditingSector(null);
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
