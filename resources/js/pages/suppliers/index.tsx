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
    ContactsOutlined,
    PhoneOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    ShoppingOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SupplierRecord {
    id: number;
    name: string;
    phone: string | null;
    notes: string | null;
    is_active: boolean;
    purchase_invoices_count?: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: SupplierRecord[];
    per_page: number;
    total: number;
}

interface SuppliersIndexProps {
    suppliers: PaginationMeta;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        with_invoices: number;
    };
}

export default function SuppliersIndex({
    suppliers,
    filters,
    stats,
}: SuppliersIndexProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] =
        useState<SupplierRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/suppliers',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/suppliers', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (supplier: SupplierRecord) => {
        setEditingSupplier(supplier);
        editForm.setFieldsValue({
            name: supplier.name,
            phone: supplier.phone,
            notes: supplier.notes,
            is_active: supplier.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        phone?: string;
        notes?: string;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/suppliers', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: {
        name: string;
        phone?: string;
        notes?: string;
        is_active?: boolean;
    }) => {
        if (!editingSupplier) return;
        setSubmitting(true);
        router.put(`/suppliers/${editingSupplier.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingSupplier(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/suppliers/${id}`);
    };

    const columns = [
        {
            title: 'اسم المورد / الشركة',
            key: 'name',
            render: (_: unknown, record: SupplierRecord) => (
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
                        }}
                    >
                        <ContactsOutlined />
                    </div>
                    <div>
                        <div
                            style={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontSize: 14,
                            }}
                        >
                            {record.name}
                        </div>
                        {record.notes && (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    marginTop: 2,
                                    maxWidth: 260,
                                }}
                            >
                                {record.notes}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'رقم الهاتف / التواصل',
            dataIndex: 'phone',
            key: 'phone',
            width: 170,
            render: (phone: string | null) =>
                phone ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            direction: 'ltr',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Text strong style={{ fontSize: 13, color: '#334155' }}>
                            {phone}
                        </Text>
                        <PhoneOutlined style={{ color: '#1d4ed8' }} />
                    </div>
                ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        غير مسجل
                    </Text>
                ),
        },
        {
            title: 'حالة التعامل',
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
                    {active ? 'معتمد ونشط' : 'معلق'}
                </Tag>
            ),
        },
        {
            title: 'فواتير التوريد المسجلة',
            key: 'invoices',
            width: 170,
            render: (_: unknown, record: SupplierRecord) => (
                <Tag color="orange" style={{ borderRadius: 10 }}>
                    {record.purchase_invoices_count || 0} فاتورة توريد
                </Tag>
            ),
        },
        {
            title: 'تاريخ الإضافة',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 160,
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
            render: (_: unknown, record: SupplierRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات المورد">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف المورد"
                        description="هل أنت متأكد من حذف هذا المورد؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف المورد">
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
            <Head title="إدارة الموردين" />

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
                            دليل الموردين المعتمدين
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            إدارة بيانات الموردين وشركات التوريد وتوثيق فواتير
                            الشراء والتوريد
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
                        إضافة مورد جديد
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
                                        إجمالي الموردين
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
                                    <ContactsOutlined />
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
                                        الموردين المعتمدين
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
                                        موردين لهم فواتير
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#d97706',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.with_invoices}
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
                                    <ShoppingOutlined />
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
                                placeholder="البحث باسم المورد أو رقم الهاتف..."
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
                            عرض <Text strong>{suppliers.data.length}</Text> من
                            إجمالي <Text strong>{suppliers.total}</Text> مورد
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={suppliers.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: suppliers.current_page,
                            pageSize: suppliers.per_page,
                            total: suppliers.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/suppliers',
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
                            <ContactsOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة مورد جديد
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
                                اسم المورد / الشركة
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المورد',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: شركة النسر العربي للصناعات الهيدروليكية" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                رقم الهاتف / وسيلة الاتصال
                            </span>
                        }
                        name="phone"
                    >
                        <Input
                            placeholder="05xxxxxxxx"
                            dir="ltr"
                            style={{ textAlign: 'right' }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                ملاحظات وتفاصيل التعامل
                            </span>
                        }
                        name="notes"
                    >
                        <TextArea
                            rows={3}
                            placeholder="أدخل أية ملاحظات، شروط دفع، أو تفاصيل خاصة بالمورد..."
                        />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة المورد (معتمد للتعامل)
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
                            حفظ المورد
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
                            تعديل بيانات المورد
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingSupplier(null);
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
                                اسم المورد / الشركة
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم المورد',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                رقم الهاتف / وسيلة الاتصال
                            </span>
                        }
                        name="phone"
                    >
                        <Input dir="ltr" style={{ textAlign: 'right' }} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                ملاحظات وتفاصيل التعامل
                            </span>
                        }
                        name="notes"
                    >
                        <TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة المورد (معتمد للتعامل)
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
                                setEditingSupplier(null);
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
