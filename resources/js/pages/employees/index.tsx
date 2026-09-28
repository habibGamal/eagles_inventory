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
    IdcardOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    BankOutlined,
} from '@ant-design/icons';
import { Head, router, usePage } from '@inertiajs/react';

const { Title, Text } = Typography;

interface EmployeeRecord {
    id: number;
    name: string;
    department: string | null;
    is_active: boolean;
    dispatch_vouchers_count?: number;
    created_at: string;
}

interface PaginationMeta {
    current_page: number;
    data: EmployeeRecord[];
    per_page: number;
    total: number;
}

interface EmployeesIndexProps {
    employees: PaginationMeta;
    filters: {
        search?: string;
    };
    stats: {
        total: number;
        active: number;
        departments: number;
    };
}

export default function EmployeesIndex({
    employees,
    filters,
    stats,
}: EmployeesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] =
        useState<EmployeeRecord | null>(null);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const page = usePage<{ errors: Record<string, string> }>();
    const errors = page.props.errors || {};

    const handleSearch = () => {
        router.get(
            '/employees',
            { search: searchQuery || undefined },
            { preserveState: true, replace: true },
        );
    };

    const handleResetSearch = () => {
        setSearchQuery('');
        router.get('/employees', {}, { preserveState: true, replace: true });
    };

    const handleOpenEdit = (employee: EmployeeRecord) => {
        setEditingEmployee(employee);
        editForm.setFieldsValue({
            name: employee.name,
            department: employee.department,
            is_active: employee.is_active,
        });
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = (values: {
        name: string;
        department?: string;
        is_active?: boolean;
    }) => {
        setSubmitting(true);
        router.post('/employees', values, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleEditSubmit = (values: {
        name: string;
        department?: string;
        is_active?: boolean;
    }) => {
        if (!editingEmployee) return;
        setSubmitting(true);
        router.put(`/employees/${editingEmployee.id}`, values, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingEmployee(null);
                editForm.resetFields();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/employees/${id}`);
    };

    const columns = [
        {
            title: 'الموظف / المستلم',
            key: 'name',
            render: (_: unknown, record: EmployeeRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        style={{
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
                            fontWeight: 600,
                        }}
                    >
                        {record.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                            {record.name}
                        </div>
                        {record.department ? (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#64748b',
                                    marginTop: 2,
                                }}
                            >
                                الإدارة: {record.department}
                            </div>
                        ) : (
                            <div
                                style={{
                                    fontSize: 12,
                                    color: '#94a3b8',
                                    marginTop: 2,
                                }}
                            >
                                لم تحدد إدارة
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'حالة الموظف',
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
                    {active ? 'على رأس العمل' : 'غير نشط'}
                </Tag>
            ),
        },
        {
            title: 'أذون الصرف المستلمة',
            key: 'vouchers',
            width: 180,
            render: (_: unknown, record: EmployeeRecord) => (
                <Tag color="purple" style={{ borderRadius: 10 }}>
                    {record.dispatch_vouchers_count || 0} إذن استلام
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
            render: (_: unknown, record: EmployeeRecord) => (
                <Space size="small">
                    <Tooltip title="تعديل بيانات الموظف">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#2563eb' }} />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="حذف الموظف"
                        description="هل أنت متأكد من حذف هذا الموظف؟"
                        okText="نعم، حذف"
                        cancelText="إلغاء"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="حذف الموظف">
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
            <Head title="إدارة الموظفين" />

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
                            إدارة الموظفين ومستلمي العهد
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            سجل الموظفين المعتمدين لاستلام المواد والأدوات وأذونات
                            صرف المخزون
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
                        إضافة موظف جديد
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
                                        إجمالي الموظفين
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
                                    <IdcardOutlined />
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
                                        الموظفين النشطين
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
                                        عدد الإدارات الممثلة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.departments}
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
                                    <BankOutlined />
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
                                placeholder="البحث باسم الموظف أو الإدارة..."
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
                            عرض <Text strong>{employees.data.length}</Text> من
                            إجمالي <Text strong>{employees.total}</Text> موظف
                        </div>
                    </div>

                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={employees.data}
                        pagination={{
                            current: employees.current_page,
                            pageSize: employees.per_page,
                            total: employees.total,
                            showSizeChanger: false,
                            onChange: (p) => {
                                router.get(
                                    '/employees',
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
                            <IdcardOutlined />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 16 }}>
                            إضافة موظف جديد
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
                            <span style={{ fontWeight: 500 }}>
                                اسم الموظف الكامل
                            </span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم الموظف',
                            },
                        ]}
                    >
                        <Input placeholder="مثال: خالد المنصور" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الإدارة / القسم التابع له
                            </span>
                        }
                        name="department"
                    >
                        <Input placeholder="مثال: إدارة الخدمات اللوجستية" />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة الموظف (على رأس العمل)
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
                            حفظ الموظف
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
                            تعديل بيانات الموظف
                        </span>
                    </div>
                }
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
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
                            <span style={{ fontWeight: 500 }}>اسم الموظف</span>
                        }
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'يرجى إدخال اسم الموظف',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                الإدارة / القسم
                            </span>
                        }
                        name="department"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={
                            <span style={{ fontWeight: 500 }}>
                                حالة الموظف (على رأس العمل)
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
                                setEditingEmployee(null);
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
