import React, { useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Button,
    Input,
    Select,
    DatePicker,
    Tag,
    Drawer,
    Popconfirm,
    Typography,
    Space,
    Tooltip,
    Alert,
    Divider,
    Descriptions,
} from 'antd';
import {
    ShoppingOutlined,
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CheckCircleFilled,
    ClockCircleFilled,
    CloseCircleFilled,
    ShopOutlined,
    PhoneOutlined,
    UserOutlined,
    FileTextOutlined,
    ReloadOutlined,
    PrinterOutlined,
    DollarCircleOutlined,
    SafetyCertificateOutlined,
import { Head, router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

export interface SupplierOption {
    id: number;
    name: string;
    phone?: string | null;
}

export interface WarehouseOption {
    id: number;
    name: string;
}

export interface PurchaseInvoiceItemRecord {
    id: number;
    purchase_invoice_id: number;
    item_id: number;
    quantity: string | number;
    unit_price: string | number;
    total: string | number;
    item?: {
        id: number;
        name: string;
        unit?: {
            id: number;
            name: string;
            symbol: string;
        };
    };
}

export interface PurchaseInvoiceRecord {
    id: number;
    supplier_id: number;
    warehouse_id: number;
    invoice_date: string;
    received_at: string | null;
    subtotal: string | number;
    discount: string | number;
    total: string | number;
    status: 'DRAFT' | 'POSTED' | 'CLOSED' | 'CANCELLED';
    notes?: string | null;
    created_by: number;
    approved_by?: number | null;
    approved_at?: string | null;
    created_at: string;
    updated_at: string;
    supplier: SupplierOption;
    warehouse: WarehouseOption;
    created_by_user?: { id: number; name: string };
    createdBy?: { id: number; name: string };
    approved_by_user?: { id: number; name: string } | null;
    approvedBy?: { id: number; name: string } | null;
    items: PurchaseInvoiceItemRecord[];
}

export interface PaginationMeta {
    current_page: number;
    data: PurchaseInvoiceRecord[];
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

export interface PurchaseInvoicesIndexProps {
    invoices: PaginationMeta;
    filters: {
        search?: string;
        status?: string;
        supplier_id?: number | null;
        warehouse_id?: number | null;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total_count: number;
        draft_count: number;
        posted_count: number;
        total_amount: number;
    };
    supplierOptions: SupplierOption[];
    warehouseOptions: WarehouseOption[];
}

export default function PurchaseInvoicesIndex({
    invoices,
    filters,
    stats,
    supplierOptions,
    warehouseOptions,
}: PurchaseInvoicesIndexProps) {
    const isMobile = useIsMobile();
    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || undefined,
    );
    const [supplierFilter, setSupplierFilter] = useState<number | undefined>(
        filters.supplier_id || undefined,
    );
    const [warehouseFilter, setWarehouseFilter] = useState<number | undefined>(
        filters.warehouse_id || undefined,
    );
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(
        filters.date_from ? dayjs(filters.date_from) : null,
    );
    const [dateTo, setDateTo] = useState<Dayjs | null>(
        filters.date_to ? dayjs(filters.date_to) : null,
    );

    // Drawer state
    const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
    const [inspectingInvoice, setInspectingInvoice] =
        useState<PurchaseInvoiceRecord | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // Filter handling
    const handleApplyFilters = () => {
        router.get(
            '/purchase-invoices',
            {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                supplier_id: supplierFilter || undefined,
                warehouse_id: warehouseFilter || undefined,
                date_from: dateFrom ? dateFrom.format('YYYY-MM-DD') : undefined,
                date_to: dateTo ? dateTo.format('YYYY-MM-DD') : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter(undefined);
        setSupplierFilter(undefined);
        setWarehouseFilter(undefined);
        setDateFrom(null);
        setDateTo(null);
        router.get(
            '/purchase-invoices',
            {},
            { preserveState: true, replace: true },
        );
    };

    // Open Inspect Drawer
    const handleOpenInspect = (record: PurchaseInvoiceRecord) => {
        setInspectingInvoice(record);
        setInspectDrawerOpen(true);
    };

    // Post / Approve Invoice
    const handlePostInvoice = (invoiceId: number) => {
        setActionLoadingId(invoiceId);
        router.post(
            `/purchase-invoices/${invoiceId}/post`,
            {},
            {
                onSuccess: () => {
                    if (
                        inspectingInvoice &&
                        inspectingInvoice.id === invoiceId
                    ) {
                        setInspectDrawerOpen(false);
                    }
                },
                onFinish: () => setActionLoadingId(null),
            },
        );
    };

    // Delete Draft Invoice
    const handleDeleteInvoice = (invoiceId: number) => {
        setActionLoadingId(invoiceId);
        router.delete(`/purchase-invoices/${invoiceId}`, {
            onFinish: () => setActionLoadingId(null),
        });
    };

    // Status Tag Renderer
    const renderStatusTag = (status: string) => {
        switch (status) {
            case 'POSTED':
                return (
                    <Tag
                        icon={<CheckCircleFilled />}
                        color="success"
                        style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        معتمدة ومرحّلة للمخزون
                    </Tag>
                );
            case 'CLOSED':
                return (
                    <Tag
                        icon={<CheckCircleFilled />}
                        color="blue"
                        style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        مغلقة
                    </Tag>
                );
            case 'CANCELLED':
                return (
                    <Tag
                        icon={<CloseCircleFilled />}
                        color="error"
                        style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        ملغاة
                    </Tag>
                );
            case 'DRAFT':
            default:
                return (
                    <Tag
                        icon={<ClockCircleFilled />}
                        color="warning"
                        style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        مسودة (قيد المراجعة)
                    </Tag>
                );
        }
    };

    // Table Columns Definition
    const columns = [
        {
            title: 'رقم الفاتورة',
            key: 'id',
            width: 130,
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor:
                                record.status === 'POSTED'
                                    ? '#ecfdf5'
                                    : '#eff6ff',
                            color:
                                record.status === 'POSTED'
                                    ? '#059669'
                                    : '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        <FileTextOutlined />
                    </div>
                    <div>
                        <Text
                            strong
                            style={{
                                fontSize: 13,
                                color: '#0f172a',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            #{record.id}
                        </Text>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                            توريد وارد
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'المورد',
            key: 'supplier',
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <div>
                    <Text
                        strong
                        style={{
                            fontSize: 14,
                            color: '#0f172a',
                            display: 'block',
                        }}
                    >
                        {record.supplier?.name || 'مورد غير محدد'}
                    </Text>
                    {record.supplier?.phone && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                marginTop: 2,
                            }}
                        >
                            <PhoneOutlined
                                style={{ fontSize: 11, color: '#94a3b8' }}
                            />
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 12,
                                    fontVariantNumeric: 'tabular-nums',
                                    direction: 'ltr',
                                }}
                            >
                                {record.supplier.phone}
                            </Text>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'المستودع المستلم',
            key: 'warehouse',
            width: 170,
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShopOutlined style={{ color: '#2563eb', fontSize: 14 }} />
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#1e293b',
                            fontWeight: 500,
                        }}
                    >
                        {record.warehouse?.name || 'مستودع غير محدد'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'تاريخ الفاتورة والاستلام',
            key: 'dates',
            width: 190,
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <div>
                    <div
                        style={{
                            fontSize: 13,
                            color: '#0f172a',
                            fontWeight: 500,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {dayjs(record.invoice_date).format('YYYY/MM/DD')}
                    </div>
                    <div
                        style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}
                    >
                        {record.received_at ? (
                            <span>
                                استلام:{' '}
                                {dayjs(record.received_at).format(
                                    'YYYY/MM/DD HH:mm',
                                )}
                            </span>
                        ) : (
                            <span style={{ color: '#d97706' }}>
                                في انتظار الاستلام
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'البنود',
            key: 'items_count',
            width: 110,
            align: 'center' as const,
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <Tag
                    color="cyan"
                    style={{
                        borderRadius: 10,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {record.items?.length || 0} أصناف
                </Tag>
            ),
        },
        {
            title: 'إجمالي القيمة',
            key: 'total',
            width: 160,
            render: (_: unknown, record: PurchaseInvoiceRecord) => (
                <div>
                    <Text
                        strong
                        style={{
                            fontSize: 15,
                            color: '#1d4ed8',
                            fontVariantNumeric: 'tabular-nums',
                            display: 'block',
                        }}
                    >
                        {Number(record.total).toLocaleString('ar-EG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}{' '}
                        <span style={{ fontSize: 11, fontWeight: 500 }}>
                            ج.م
                        </span>
                    </Text>
                    {Number(record.discount) > 0 && (
                        <div
                            style={{
                                fontSize: 11,
                                color: '#059669',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            خصم: {Number(record.discount).toFixed(2)} ج.م
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 170,
            render: (_: unknown, record: PurchaseInvoiceRecord) =>
                renderStatusTag(record.status),
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (_: unknown, record: PurchaseInvoiceRecord) => {
                const isDraft = record.status === 'DRAFT';
                return (
                    <Space size="small">
                        {/* Inspect / View */}
                        <Tooltip title="معاينة تفاصيل الفاتورة">
                            <Button
                                type="text"
                                icon={
                                    <EyeOutlined style={{ color: '#0284c7' }} />
                                }
                                onClick={() => handleOpenInspect(record)}
                            />
                        </Tooltip>

                        {/* Post/Approve Action (Only for Drafts) */}
                        {isDraft && (
                            <Popconfirm
                                title="اعتماد وترحيل الفاتورة"
                                description="هل تريد ترحيل هذه الفاتورة إلى سجل المخزون وتحديث أرصدة المستودع فوراً؟"
                                okText="نعم، اعتمد ورحّل"
                                cancelText="تراجع"
                                okButtonProps={{
                                    style: {
                                        backgroundColor: '#059669',
                                        borderColor: '#059669',
                                    },
                                }}
                                onConfirm={() => handlePostInvoice(record.id)}
                            >
                                <Tooltip title="اعتماد وترحيل للمخزون">
                                    <Button
                                        type="text"
                                        loading={actionLoadingId === record.id}
                                        icon={
                                            <CheckCircleOutlined
                                                style={{ color: '#059669' }}
                                            />
                                        }
                                    />
                                </Tooltip>
                            </Popconfirm>
                        )}

                        {/* Edit Action - Page Navigation (Only for Drafts) */}
                        {isDraft ? (
                            <Tooltip title="تعديل بيانات الفاتورة (صفحة كاملة)">
                                <Button
                                    type="text"
                                    icon={
                                        <EditOutlined
                                            style={{ color: '#2563eb' }}
                                        />
                                    }
                                    onClick={() =>
                                        router.visit(
                                            `/purchase-invoices/${record.id}/edit`,
                                        )
                                    }
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title="الفاتورة معتمدة ومقفلة ضد التعديل">
                                <Button
                                    type="text"
                                    disabled
                                    icon={<EditOutlined />}
                                />
                            </Tooltip>
                        )}

                        {/* Delete Action (Only for Drafts) */}
                        {isDraft ? (
                            <Popconfirm
                                title="حذف مسودة الفاتورة"
                                description="هل أنت متأكد من حذف هذه المسودة نهائياً؟"
                                okText="نعم، حذف"
                                cancelText="إلغاء"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => handleDeleteInvoice(record.id)}
                            >
                                <Tooltip title="حذف المسودة">
                                    <Button
                                        type="text"
                                        danger
                                        loading={actionLoadingId === record.id}
                                        icon={<DeleteOutlined />}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        ) : (
                            <Tooltip title="لا يمكن حذف فاتورة معتمدة ومرحلة للمخزون">
                                <Button
                                    type="text"
                                    disabled
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <>
            <Head title="فواتير التوريد" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Title & Main Action Button */}
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
                            فواتير التوريد وأوامر الاستلام
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            إدارة فواتير الشراء الواردة من الموردين، مراجعة
                            البنود والكميات، وترحيل الاستلام إلى أرصدة المستودعات
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() =>
                            router.visit('/purchase-invoices/create')
                        }
                        style={{
                            backgroundColor: '#1d4ed8',
                            borderRadius: 10,
                            fontWeight: 600,
                            height: 42,
                            width: isMobile ? '100%' : 'auto',
                            boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                        }}
                    >
                        إنشاء فاتورة توريد جديدة
                    </Button>
                </div>

                {/* Metric Summary Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 12,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
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
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        إجمالي فواتير التوريد
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.total_count}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
                                        backgroundColor: '#eff6ff',
                                        color: '#1d4ed8',
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

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 12,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
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
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        مسودات قيد المراجعة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: '#d97706',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.draft_count}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
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
                            style={{
                                borderRadius: 12,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
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
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        فواتير معتمدة ومرحّلة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: '#059669',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.posted_count}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
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
                            style={{
                                borderRadius: 12,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
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
                                            fontSize: 13,
                                            fontWeight: 500,
                                        }}
                                    >
                                        إجمالي قيمة التوريدات
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.total_amount.toLocaleString(
                                            'ar-EG',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            },
                                        )}{' '}
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 500,
                                            }}
                                        >
                                            ج.م
                                        </span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 12,
                                        backgroundColor: '#faf5ff',
                                        color: '#7c3aed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <DollarCircleOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Filter & Search Bar Card */}
                <Card
                    variant="outlined"
                    style={{
                        borderRadius: 12,
                        borderColor: '#e2e8f0',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    }}
                >
                    <Row gutter={[12, 12]} align="middle">
                        <Col xs={24} md={6}>
                            <Input
                                placeholder="بحث برقم الفاتورة أو المورد أو الملاحظات..."
                                prefix={
                                    <SearchOutlined
                                        style={{ color: '#94a3b8' }}
                                    />
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onPressEnter={handleApplyFilters}
                                allowClear
                            />
                        </Col>

                        <Col xs={12} md={4}>
                            <Select
                                placeholder="الحالة"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                allowClear
                                style={{ width: '100%' }}
                                options={[
                                    { label: 'جميع الحالات', value: '' },
                                    { label: 'مسودة (DRAFT)', value: 'DRAFT' },
                                    {
                                        label: 'معتمدة ومرحّلة (POSTED)',
                                        value: 'POSTED',
                                    },
                                    {
                                        label: 'مغلقة (CLOSED)',
                                        value: 'CLOSED',
                                    },
                                    {
                                        label: 'ملغاة (CANCELLED)',
                                        value: 'CANCELLED',
                                    },
                                ]}
                            />
                        </Col>

                        <Col xs={12} md={4}>
                            <Select
                                placeholder="المورد"
                                value={supplierFilter}
                                onChange={setSupplierFilter}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                style={{ width: '100%' }}
                                options={supplierOptions.map((s) => ({
                                    label: s.name,
                                    value: s.id,
                                }))}
                            />
                        </Col>

                        <Col xs={12} md={4}>
                            <Select
                                placeholder="المستودع المستلم"
                                value={warehouseFilter}
                                onChange={setWarehouseFilter}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                style={{ width: '100%' }}
                                options={warehouseOptions.map((w) => ({
                                    label: w.name,
                                    value: w.id,
                                }))}
                            />
                        </Col>

                        <Col xs={12} md={3}>
                            <DatePicker
                                placeholder="من تاريخ"
                                value={dateFrom}
                                onChange={setDateFrom}
                                style={{ width: '100%' }}
                                format="YYYY-MM-DD"
                            />
                        </Col>

                        <Col xs={12} md={3}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleApplyFilters}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#1d4ed8',
                                    }}
                                >
                                    تصفية
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                    title="إعادة ضبط"
                                />
                            </div>
                        </Col>
                    </Row>
                </Card>

                {/* Data Table */}
                <Card
                    variant="outlined"
                    style={{
                        borderRadius: 12,
                        borderColor: '#e2e8f0',
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                    }}
                    styles={{ body: { padding: 0 } }}
                >
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={invoices.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: invoices.current_page,
                            pageSize: invoices.per_page,
                            total: invoices.total,
                            showTotal: (total, range) =>
                                `عرض ${range[0]} إلى ${range[1]} من أصل ${total} فاتورة توريد`,
                            onChange: (page) => {
                                router.get(
                                    '/purchase-invoices',
                                    {
                                        page,
                                        search: searchQuery || undefined,
                                        status: statusFilter || undefined,
                                        supplier_id:
                                            supplierFilter || undefined,
                                        warehouse_id:
                                            warehouseFilter || undefined,
                                        date_from: dateFrom
                                            ? dateFrom.format('YYYY-MM-DD')
                                            : undefined,
                                        date_to: dateTo
                                            ? dateTo.format('YYYY-MM-DD')
                                            : undefined,
                                    },
                                    { preserveState: true },
                                );
                            },
                        }}
                        locale={{
                            emptyText: (
                                <div
                                    style={{
                                        padding: '36px 0',
                                        textAlign: 'center',
                                    }}
                                >
                                    <ShoppingOutlined
                                        style={{
                                            fontSize: 44,
                                            color: '#cbd5e1',
                                            marginBottom: 12,
                                        }}
                                    />
                                    <div
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: '#334155',
                                        }}
                                    >
                                        لا توجد فواتير توريد مسجلة
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: '#94a3b8',
                                            marginTop: 4,
                                        }}
                                    >
                                        يمكنك البدء بإنشاء أول فاتورة توريد
                                        واردة من الموردين
                                    </div>
                                </div>
                            ),
                        }}
                    />
                </Card>
            </div>

            {/* INVOICE INSPECT / DETAIL DRAWER */}
            <Drawer
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <FileTextOutlined
                                style={{ color: '#1d4ed8', fontSize: 18 }}
                            />
                            <span style={{ fontWeight: 700, fontSize: 16 }}>
                                مستند فاتورة التوريد #{inspectingInvoice?.id}
                            </span>
                        </div>
                        {inspectingInvoice &&
                            renderStatusTag(inspectingInvoice.status)}
                    </div>
                }
                open={inspectDrawerOpen}
                onClose={() => {
                    setInspectDrawerOpen(false);
                    setInspectingInvoice(null);
                }}
                width={isMobile ? '100%' : 700}
                destroyOnHidden
            >
                {inspectingInvoice && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        {/* Status notification */}
                        {inspectingInvoice.status === 'DRAFT' && (
                            <Alert
                                message="فاتورة مسودة غير مرحّلة"
                                description="هذه الفاتورة ما زالت في حالة مسودة، ولم تؤثر بعد على أرصدة المستودع. يمكنك اعتمادها وترحيلها لتسجيل استلام البضائع فعلياً."
                                type="warning"
                                showIcon
                                action={
                                    <Popconfirm
                                        title="تأكيد اعتماد وترحيل الفاتورة للمخزون"
                                        description="سيتم إضافة كميات جميع الأصناف إلى رصيد المستودع المحدد فوراً."
                                        okText="نعم، اعتمد الفاتورة"
                                        cancelText="إلغاء"
                                        okButtonProps={{
                                            style: {
                                                backgroundColor: '#059669',
                                                borderColor: '#059669',
                                            },
                                        }}
                                        onConfirm={() =>
                                            handlePostInvoice(
                                                inspectingInvoice.id,
                                            )
                                        }
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            loading={
                                                actionLoadingId ===
                                                inspectingInvoice.id
                                            }
                                            style={{
                                                backgroundColor: '#059669',
                                                borderColor: '#059669',
                                            }}
                                        >
                                            اعتماد وترحيل الآن
                                        </Button>
                                    </Popconfirm>
                                }
                            />
                        )}

                        {inspectingInvoice.status === 'POSTED' && (
                            <Alert
                                message="فاتورة معتمدة ومرحّلة للمخزون"
                                description="تم استلام هذه الشحنة وإضافتها إلى أرصدة المستودع بنجاح وتوثيق حركة الدخول في سجل الرقابة."
                                type="success"
                                showIcon
                            />
                        )}

                        {/* Invoice Overview Card */}
                        <Card
                            size="small"
                            variant="outlined"
                            style={{ borderRadius: 10, borderColor: '#e2e8f0' }}
                        >
                            <Descriptions
                                title={
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                        }}
                                    >
                                        بيانات الفاتورة والاستلام
                                    </span>
                                }
                                bordered
                                size="small"
                                column={{ xs: 1, sm: 2 }}
                            >
                                <Descriptions.Item label="المورد">
                                    <Text strong>
                                        {inspectingInvoice.supplier?.name}
                                    </Text>
                                    {inspectingInvoice.supplier?.phone && (
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: '#64748b',
                                                direction: 'ltr',
                                            }}
                                        >
                                            {inspectingInvoice.supplier.phone}
                                        </div>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="المستودع المستلم">
                                    <Tag color="blue">
                                        {inspectingInvoice.warehouse?.name}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="تاريخ الفاتورة">
                                    <span
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {dayjs(
                                            inspectingInvoice.invoice_date,
                                        ).format('YYYY/MM/DD')}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="تاريخ الاستلام الفعلي">
                                    <span
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {inspectingInvoice.received_at
                                            ? dayjs(
                                                  inspectingInvoice.received_at,
                                              ).format('YYYY/MM/DD HH:mm')
                                            : 'لم يُسجل'}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="مُنشئ الفاتورة">
                                    <Space size="small">
                                        <UserOutlined
                                            style={{ color: '#64748b' }}
                                        />
                                        <span>
                                            {inspectingInvoice.createdBy
                                                ?.name || 'مستخدم النظام'}
                                        </span>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="المعتمد / المدقق">
                                    {inspectingInvoice.approvedBy ? (
                                        <Space size="small">
                                            <SafetyCertificateOutlined
                                                style={{ color: '#059669' }}
                                            />
                                            <span
                                                style={{
                                                    color: '#059669',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {
                                                    inspectingInvoice.approvedBy
                                                        .name
                                                }
                                            </span>
                                        </Space>
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>
                                            في انتظار الاعتماد
                                        </span>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Items Table */}
                        <Card
                            size="small"
                            variant="outlined"
                            style={{ borderRadius: 10, borderColor: '#e2e8f0' }}
                            title={
                                <span style={{ fontSize: 14, fontWeight: 700 }}>
                                    أصناف وبنود التوريد
                                </span>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                dataSource={inspectingInvoice.items || []}
                                columns={[
                                    {
                                        title: '#',
                                        key: 'idx',
                                        width: 45,
                                        render: (
                                            _: unknown,
                                            __: unknown,
                                            idx: number,
                                        ) => (
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {idx + 1}
                                            </Text>
                                        ),
                                    },
                                    {
                                        title: 'الصنف',
                                        key: 'item_name',
                                        render: (
                                            _: unknown,
                                            it: PurchaseInvoiceItemRecord,
                                        ) => (
                                            <div>
                                                <Text
                                                    strong
                                                    style={{ color: '#0f172a' }}
                                                >
                                                    {it.item?.name ||
                                                        `صنف #${it.item_id}`}
                                                </Text>
                                                {it.item?.unit?.name && (
                                                    <span
                                                        style={{
                                                            fontSize: 11,
                                                            color: '#64748b',
                                                            marginRight: 6,
                                                        }}
                                                    >
                                                        ({it.item.unit.name})
                                                    </span>
                                                )}
                                            </div>
                                        ),
                                    },
                                    {
                                        title: 'الكمية المستلمة',
                                        key: 'quantity',
                                        width: 130,
                                        align: 'center' as const,
                                        render: (
                                            _: unknown,
                                            it: PurchaseInvoiceItemRecord,
                                        ) => (
                                            <Tag
                                                color="geekblue"
                                                style={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                    fontWeight: 600,
                                                    fontSize: 12,
                                                }}
                                            >
                                                {Number(it.quantity).toFixed(3)}{' '}
                                                {it.item?.unit?.symbol || ''}
                                            </Tag>
                                        ),
                                    },
                                    {
                                        title: 'سعر الوحدة',
                                        key: 'unit_price',
                                        width: 110,
                                        render: (
                                            _: unknown,
                                            it: PurchaseInvoiceItemRecord,
                                        ) => (
                                            <span
                                                style={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {Number(it.unit_price).toFixed(
                                                    2,
                                                )}{' '}
                                                ج.م
                                            </span>
                                        ),
                                    },
                                    {
                                        title: 'الإجمالي',
                                        key: 'total',
                                        width: 120,
                                        render: (
                                            _: unknown,
                                            it: PurchaseInvoiceItemRecord,
                                        ) => (
                                            <Text
                                                strong
                                                style={{
                                                    color: '#1d4ed8',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {Number(it.total).toFixed(2)}{' '}
                                                ج.م
                                            </Text>
                                        ),
                                    },
                                ]}
                            />

                            {/* Financial totals card */}
                            <div
                                style={{
                                    marginTop: 16,
                                    padding: '12px 16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 6,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 13,
                                    }}
                                >
                                    <Text type="secondary">
                                        المجموع الفرعي للبنود:
                                    </Text>
                                    <Text
                                        strong
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {Number(
                                            inspectingInvoice.subtotal,
                                        ).toFixed(2)}{' '}
                                        ج.م
                                    </Text>
                                </div>
                                {Number(inspectingInvoice.discount) > 0 && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 13,
                                        }}
                                    >
                                        <Text type="secondary">
                                            الخصم الممنوح:
                                        </Text>
                                        <Text
                                            type="danger"
                                            style={{
                                                fontVariantNumeric:
                                                    'tabular-nums',
                                            }}
                                        >
                                            -{' '}
                                            {Number(
                                                inspectingInvoice.discount,
                                            ).toFixed(2)}{' '}
                                            ج.م
                                        </Text>
                                    </div>
                                )}
                                <Divider style={{ margin: '6px 0' }} />
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: '#0f172a',
                                        }}
                                    >
                                        المبلغ الإجمالي النهائي:
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 800,
                                            color: '#1d4ed8',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {Number(
                                            inspectingInvoice.total,
                                        ).toLocaleString('ar-EG', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}{' '}
                                        <span style={{ fontSize: 13 }}>
                                            ج.م
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Notes if available */}
                        {inspectingInvoice.notes && (
                            <Card
                                size="small"
                                variant="outlined"
                                style={{
                                    borderRadius: 10,
                                    borderColor: '#e2e8f0',
                                }}
                                title={
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                    >
                                        ملاحظات التوريد
                                    </span>
                                }
                            >
                                <Text
                                    style={{ color: '#334155', fontSize: 13 }}
                                >
                                    {inspectingInvoice.notes}
                                </Text>
                            </Card>
                        )}

                        {/* Actions bar in drawer */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 10,
                            }}
                        >
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={() => window.print()}
                            >
                                طباعة الفاتورة
                            </Button>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Button
                                    onClick={() => setInspectDrawerOpen(false)}
                                >
                                    إغلاق
                                </Button>
                                {inspectingInvoice.status === 'DRAFT' && (
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setInspectDrawerOpen(false);
                                            router.visit(
                                                `/purchase-invoices/${inspectingInvoice.id}/edit`,
                                            );
                                        }}
                                        style={{ backgroundColor: '#1d4ed8' }}
                                    >
                                        تعديل في صفحة مستقلة
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Drawer>
        </>
    );
}
