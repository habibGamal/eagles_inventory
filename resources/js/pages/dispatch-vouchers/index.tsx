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
    Descriptions,
} from 'antd';
import {
    InboxOutlined,
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
    UserOutlined,
    FileTextOutlined,
    ReloadOutlined,
    PrinterOutlined,
    ApartmentOutlined,
    SafetyCertificateOutlined,
import { Head, router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

export interface WarehouseOption {
    id: number;
    name: string;
}

export interface SectorOption {
    id: number;
    name: string;
}

export interface DispatchVoucherItemRecord {
    id: number;
    dispatch_voucher_id: number;
    item_id: number;
    quantity: string | number;
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

export interface DispatchVoucherRecord {
    id: number;
    warehouse_id: number;
    sector_id: number;
    recipient_employee_id?: number | null;
    recipient_name_snapshot: string;
    issued_by: number;
    issue_date: string;
    notes?: string | null;
    status: 'DRAFT' | 'POSTED' | 'CLOSED' | 'CANCELLED';
    created_by: number;
    approved_by?: number | null;
    approved_at?: string | null;
    created_at: string;
    updated_at: string;
    warehouse: WarehouseOption;
    sector: SectorOption;
    recipientEmployee?: {
        id: number;
        name: string;
        department?: string | null;
    } | null;
    recipient_employee?: {
        id: number;
        name: string;
        department?: string | null;
    } | null;
    issuedBy?: { id: number; name: string };
    issued_by_user?: { id: number; name: string };
    createdBy?: { id: number; name: string };
    approvedBy?: { id: number; name: string } | null;
    items: DispatchVoucherItemRecord[];
}

export interface PaginationMeta {
    current_page: number;
    data: DispatchVoucherRecord[];
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

export interface DispatchVouchersIndexProps {
    vouchers: PaginationMeta;
    filters: {
        search?: string;
        status?: string;
        warehouse_id?: number | null;
        sector_id?: number | null;
        date_from?: string;
        date_to?: string;
    };
    stats: {
        total_count: number;
        draft_count: number;
        posted_count: number;
        total_items_dispatched: number;
    };
    warehouseOptions: WarehouseOption[];
    sectorOptions: SectorOption[];
}

export default function DispatchVouchersIndex({
    vouchers,
    filters,
    stats,
    warehouseOptions,
    sectorOptions,
}: DispatchVouchersIndexProps) {
    const isMobile = useIsMobile();
    // Filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status || undefined,
    );
    const [warehouseFilter, setWarehouseFilter] = useState<number | undefined>(
        filters.warehouse_id || undefined,
    );
    const [sectorFilter, setSectorFilter] = useState<number | undefined>(
        filters.sector_id || undefined,
    );
    const [dateFrom, setDateFrom] = useState<Dayjs | null>(
        filters.date_from ? dayjs(filters.date_from) : null,
    );
    const [dateTo, setDateTo] = useState<Dayjs | null>(
        filters.date_to ? dayjs(filters.date_to) : null,
    );

    // Drawer & loading states
    const [inspectDrawerOpen, setInspectDrawerOpen] = useState(false);
    const [inspectingVoucher, setInspectingVoucher] =
        useState<DispatchVoucherRecord | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    // Apply filters
    const handleApplyFilters = () => {
        router.get(
            '/dispatch-vouchers',
            {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                warehouse_id: warehouseFilter || undefined,
                sector_id: sectorFilter || undefined,
                date_from: dateFrom ? dateFrom.format('YYYY-MM-DD') : undefined,
                date_to: dateTo ? dateTo.format('YYYY-MM-DD') : undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter(undefined);
        setWarehouseFilter(undefined);
        setSectorFilter(undefined);
        setDateFrom(null);
        setDateTo(null);
        router.get(
            '/dispatch-vouchers',
            {},
            { preserveState: true, replace: true },
        );
    };

    // Open Drawer
    const handleOpenInspect = (record: DispatchVoucherRecord) => {
        setInspectingVoucher(record);
        setInspectDrawerOpen(true);
    };

    // Post / Approve Voucher
    const handlePostVoucher = (voucherId: number) => {
        setActionLoadingId(voucherId);
        router.post(
            `/dispatch-vouchers/${voucherId}/post`,
            {},
            {
                onSuccess: () => {
                    if (
                        inspectingVoucher &&
                        inspectingVoucher.id === voucherId
                    ) {
                        setInspectDrawerOpen(false);
                    }
                },
                onFinish: () => setActionLoadingId(null),
            },
        );
    };

    // Delete Draft Voucher
    const handleDeleteVoucher = (voucherId: number) => {
        setActionLoadingId(voucherId);
        router.delete(`/dispatch-vouchers/${voucherId}`, {
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
                        معتمد ومصروف من المخزون
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
                        مغلق
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
                        ملغي
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
                        مسودة (قيد التدقيق)
                    </Tag>
                );
        }
    };

    // Columns Definition
    const columns = [
        {
            title: 'رقم الإذن',
            key: 'id',
            width: 130,
            render: (_: unknown, record: DispatchVoucherRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor:
                                record.status === 'POSTED'
                                    ? '#ecfdf5'
                                    : '#faf5ff',
                            color:
                                record.status === 'POSTED'
                                    ? '#059669'
                                    : '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        <InboxOutlined />
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
                            إذن صرف
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'المستودع المصروف منه',
            key: 'warehouse',
            width: 170,
            render: (_: unknown, record: DispatchVoucherRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShopOutlined style={{ color: '#2563eb', fontSize: 14 }} />
                    <Text strong style={{ fontSize: 13, color: '#1e293b' }}>
                        {record.warehouse?.name || 'مستودع غير محدد'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'القسم / القطاع الطالب',
            key: 'sector',
            width: 170,
            render: (_: unknown, record: DispatchVoucherRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ApartmentOutlined
                        style={{ color: '#7c3aed', fontSize: 14 }}
                    />
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#0f172a',
                            fontWeight: 600,
                        }}
                    >
                        {record.sector?.name || 'قسم غير محدد'}
                    </Text>
                </div>
            ),
        },
        {
            title: 'المستلم الفعلي',
            key: 'recipient',
            render: (_: unknown, record: DispatchVoucherRecord) => (
                <div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <UserOutlined
                            style={{ color: '#64748b', fontSize: 12 }}
                        />
                        <Text strong style={{ fontSize: 13, color: '#0f172a' }}>
                            {record.recipient_name_snapshot}
                        </Text>
                    </div>
                    {record.recipientEmployee?.department && (
                        <div
                            style={{
                                fontSize: 11,
                                color: '#64748b',
                                marginTop: 2,
                            }}
                        >
                            قسم: {record.recipientEmployee.department}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'تاريخ الصرف',
            key: 'issue_date',
            width: 140,
            render: (_: unknown, record: DispatchVoucherRecord) => (
                <Text
                    style={{
                        fontSize: 13,
                        color: '#0f172a',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 500,
                    }}
                >
                    {dayjs(record.issue_date).format('YYYY/MM/DD')}
                </Text>
            ),
        },
        {
            title: 'الأصناف المصروفة',
            key: 'items',
            width: 140,
            align: 'center' as const,
            render: (_: unknown, record: DispatchVoucherRecord) => {
                const totalQty =
                    record.items?.reduce(
                        (sum, it) => sum + Number(it.quantity || 0),
                        0,
                    ) || 0;
                return (
                    <div>
                        <Tag
                            color="purple"
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
                        <div
                            style={{
                                fontSize: 11,
                                color: '#64748b',
                                marginTop: 2,
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            إجمالي: {totalQty.toFixed(2)}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 170,
            render: (_: unknown, record: DispatchVoucherRecord) =>
                renderStatusTag(record.status),
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (_: unknown, record: DispatchVoucherRecord) => {
                const isDraft = record.status === 'DRAFT';
                return (
                    <Space size="small">
                        {/* Inspect / View */}
                        <Tooltip title="معاينة تفاصيل إذن الصرف">
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
                                title="اعتماد وصرف المواد"
                                description="هل تريد اعتماد هذا الإذن وخصم الكميات من رصيد المستودع فوراً؟"
                                okText="نعم، اعتمد واصرف"
                                cancelText="تراجع"
                                okButtonProps={{
                                    style: {
                                        backgroundColor: '#059669',
                                        borderColor: '#059669',
                                    },
                                }}
                                onConfirm={() => handlePostVoucher(record.id)}
                            >
                                <Tooltip title="اعتماد وخصم من المخزون">
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
                            <Tooltip title="تعديل بيانات إذن الصرف (صفحة مستقلة)">
                                <Button
                                    type="text"
                                    icon={
                                        <EditOutlined
                                            style={{ color: '#2563eb' }}
                                        />
                                    }
                                    onClick={() =>
                                        router.visit(
                                            `/dispatch-vouchers/${record.id}/edit`,
                                        )
                                    }
                                />
                            </Tooltip>
                        ) : (
                            <Tooltip title="الإذن معتمد ومقفل ضد التعديل">
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
                                title="حذف مسودة إذن الصرف"
                                description="هل أنت متأكد من حذف هذه المسودة نهائياً؟"
                                okText="نعم، حذف"
                                cancelText="إلغاء"
                                okButtonProps={{ danger: true }}
                                onConfirm={() => handleDeleteVoucher(record.id)}
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
                            <Tooltip title="لا يمكن حذف إذن صرف معتمد ومرحّل للمخزون">
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
            <Head title="أذونات الصرف المخزني" />

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
                            أذونات الصرف المخزني
                        </Title>
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 14,
                                marginTop: 4,
                                display: 'block',
                            }}
                        >
                            إدارة طلبات وأوامر صرف المواد، تحديد الأقسام
                            والمستلمين، واعتماد خروج الكميات من المخزون
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() =>
                            router.visit('/dispatch-vouchers/create')
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
                        إنشاء إذن صرف جديد
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
                                        إجمالي أذونات الصرف
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
                                    <InboxOutlined />
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
                                        مسودات قيد المعالجة
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
                                        أذونات معتمدة ومصروفة
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
                                        إجمالي الكميات المنصرفة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: '#7c3aed',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.total_items_dispatched.toLocaleString(
                                            'ar-EG',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            },
                                        )}
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
                                    <ShopOutlined />
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
                                placeholder="بحث برقم الإذن أو القسم أو اسم المستلم..."
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
                                        label: 'معتمد ومصروف (POSTED)',
                                        value: 'POSTED',
                                    },
                                    { label: 'مغلق (CLOSED)', value: 'CLOSED' },
                                    {
                                        label: 'ملغي (CANCELLED)',
                                        value: 'CANCELLED',
                                    },
                                ]}
                            />
                        </Col>

                        <Col xs={12} md={4}>
                            <Select
                                placeholder="المستودع المصروف منه"
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

                        <Col xs={12} md={4}>
                            <Select
                                placeholder="القسم / القطاع الطالب"
                                value={sectorFilter}
                                onChange={setSectorFilter}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                }
                                style={{ width: '100%' }}
                                options={sectorOptions.map((s) => ({
                                    label: s.name,
                                    value: s.id,
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
                        dataSource={vouchers.data}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            current: vouchers.current_page,
                            pageSize: vouchers.per_page,
                            total: vouchers.total,
                            showTotal: (total, range) =>
                                `عرض ${range[0]} إلى ${range[1]} من أصل ${total} إذن صرف`,
                            onChange: (page) => {
                                router.get(
                                    '/dispatch-vouchers',
                                    {
                                        page,
                                        search: searchQuery || undefined,
                                        status: statusFilter || undefined,
                                        warehouse_id:
                                            warehouseFilter || undefined,
                                        sector_id: sectorFilter || undefined,
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
                                    <InboxOutlined
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
                                        لا توجد أذونات صرف مسجلة
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: '#94a3b8',
                                            marginTop: 4,
                                        }}
                                    >
                                        يمكنك البدء بإنشاء إذن صرف جديد لتسليم
                                        المواد للأقسام والجهات الطالبة
                                    </div>
                                </div>
                            ),
                        }}
                    />
                </Card>
            </div>

            {/* VOUCHER INSPECT / DETAIL DRAWER */}
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
                                مستند إذن الصرف المخزني #{inspectingVoucher?.id}
                            </span>
                        </div>
                        {inspectingVoucher &&
                            renderStatusTag(inspectingVoucher.status)}
                    </div>
                }
                open={inspectDrawerOpen}
                onClose={() => {
                    setInspectDrawerOpen(false);
                    setInspectingVoucher(null);
                }}
                width={isMobile ? '100%' : 700}
                destroyOnHidden
            >
                {inspectingVoucher && (
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                        }}
                    >
                        {inspectingVoucher.status === 'DRAFT' && (
                            <Alert
                                message="إذن صرف مسودة (غير مخصوم من المخزون)"
                                description="هذا الإذن ما زال في حالة مسودة، ولم يتم خصم الكميات من رصيد المستودع بعد. يمكنك اعتماده وصرف المواد لتحديث المخزون وتسجيل حركة الخروج."
                                type="warning"
                                showIcon
                                action={
                                    <Popconfirm
                                        title="تأكيد اعتماد وصرف المواد من المخزون"
                                        description="سيتم التحقق من توفر الأرصدة وخصم الكميات من المستودع فوراً."
                                        okText="نعم، اعتمد واصرف"
                                        cancelText="إلغاء"
                                        okButtonProps={{
                                            style: {
                                                backgroundColor: '#059669',
                                                borderColor: '#059669',
                                            },
                                        }}
                                        onConfirm={() =>
                                            handlePostVoucher(
                                                inspectingVoucher.id,
                                            )
                                        }
                                    >
                                        <Button
                                            type="primary"
                                            size="small"
                                            loading={
                                                actionLoadingId ===
                                                inspectingVoucher.id
                                            }
                                            style={{
                                                backgroundColor: '#059669',
                                                borderColor: '#059669',
                                            }}
                                        >
                                            اعتماد وصرف الآن
                                        </Button>
                                    </Popconfirm>
                                }
                            />
                        )}

                        {inspectingVoucher.status === 'POSTED' && (
                            <Alert
                                message="إذن صرف معتمد وموثق مخزنياً"
                                description="تم صرف هذه المواد وخصمها من رصيد المستودع بنجاح وتوثيق حركة الخروج في سجل الرقابة والتدقيق."
                                type="success"
                                showIcon
                            />
                        )}

                        {/* Voucher Info Descriptions */}
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
                                        بيانات الصرف والمستلم
                                    </span>
                                }
                                bordered
                                size="small"
                                column={{ xs: 1, sm: 2 }}
                            >
                                <Descriptions.Item label="المستودع المصروف منه">
                                    <Tag color="blue">
                                        {inspectingVoucher.warehouse?.name}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="القسم / القطاع الطالب">
                                    <Tag color="purple">
                                        {inspectingVoucher.sector?.name}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="المستلم الفعلي">
                                    <Text strong>
                                        {
                                            inspectingVoucher.recipient_name_snapshot
                                        }
                                    </Text>
                                    {inspectingVoucher.recipientEmployee
                                        ?.department && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: '#64748b',
                                                marginRight: 6,
                                            }}
                                        >
                                            (
                                            {
                                                inspectingVoucher
                                                    .recipientEmployee
                                                    .department
                                            }
                                            )
                                        </span>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="تاريخ الصرف">
                                    <span
                                        style={{
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {dayjs(
                                            inspectingVoucher.issue_date,
                                        ).format('YYYY/MM/DD')}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="أمين الصرف / القائم بالصرف">
                                    <Space size="small">
                                        <UserOutlined
                                            style={{ color: '#64748b' }}
                                        />
                                        <span>
                                            {inspectingVoucher.issuedBy?.name ||
                                                'مسؤول المستودع'}
                                        </span>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="المعتمد">
                                    {inspectingVoucher.approvedBy ? (
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
                                                    inspectingVoucher.approvedBy
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
                                    الأصناف والمواد المنصرفة
                                </span>
                            }
                        >
                            <Table
                                rowKey="id"
                                size="small"
                                pagination={false}
                                scroll={{ x: 'max-content' }}
                                dataSource={inspectingVoucher.items || []}
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
                                        title: 'الصنف / المادة',
                                        key: 'item_name',
                                        render: (
                                            _: unknown,
                                            it: DispatchVoucherItemRecord,
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
                                        title: 'الكمية المنصرفة',
                                        key: 'quantity',
                                        width: 150,
                                        align: 'center' as const,
                                        render: (
                                            _: unknown,
                                            it: DispatchVoucherItemRecord,
                                        ) => (
                                            <Tag
                                                color="purple"
                                                style={{
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                    fontWeight: 600,
                                                    fontSize: 13,
                                                }}
                                            >
                                                {Number(it.quantity).toFixed(3)}{' '}
                                                {it.item?.unit?.symbol || ''}
                                            </Tag>
                                        ),
                                    },
                                ]}
                            />

                            <div
                                style={{
                                    marginTop: 16,
                                    padding: '12px 16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 8,
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: '#475569',
                                    }}
                                >
                                    إجمالي عدد الأصناف المصروفة:
                                </span>
                                <span
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 15,
                                        color: '#1d4ed8',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {inspectingVoucher.items?.length || 0} صنف
                                </span>
                            </div>
                        </Card>

                        {/* Notes */}
                        {inspectingVoucher.notes && (
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
                                        ملاحظات الصرف وأمر العمل
                                    </span>
                                }
                            >
                                <Text
                                    style={{ color: '#334155', fontSize: 13 }}
                                >
                                    {inspectingVoucher.notes}
                                </Text>
                            </Card>
                        )}

                        {/* Drawer Actions */}
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
                                طباعة إذن الصرف
                            </Button>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Button
                                    onClick={() => setInspectDrawerOpen(false)}
                                >
                                    إغلاق
                                </Button>
                                {inspectingVoucher.status === 'DRAFT' && (
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setInspectDrawerOpen(false);
                                            router.visit(
                                                `/dispatch-vouchers/${inspectingVoucher.id}/edit`,
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
