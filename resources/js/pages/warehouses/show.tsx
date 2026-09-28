import React, { useState, useTransition } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Button,
    Input,
    Select,
    Tag,
    Typography,
    Space,
    Tooltip,
    Tabs,
    Progress,
    Badge,
    Empty,
} from 'antd';
import {
    ArrowRightOutlined,
    ShopOutlined,
    BarcodeOutlined,
    SearchOutlined,
    ReloadOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    WarningFilled,
    InboxOutlined,
    HistoryOutlined,
    PlusOutlined,
    FileTextOutlined,
    RiseOutlined,
    FallOutlined,
    SwapOutlined,
import { Head, Link, router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;

interface ItemCategoryData {
    id: number;
    name: string;
}

interface UnitData {
    id: number;
    name: string;
    symbol: string;
}

interface ItemData {
    id: number;
    name: string;
    category_id: number;
    unit_id: number;
    description: string | null;
    minimum_stock: string | number;
    is_active: boolean;
    category?: ItemCategoryData | null;
    unit?: UnitData | null;
}

interface StockBalanceRecord {
    id: number;
    warehouse_id: number;
    item_id: number;
    quantity: string | number;
    updated_at: string | null;
    item: ItemData;
}

interface PaginationMeta {
    current_page: number;
    data: StockBalanceRecord[];
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

interface StockMovementRecord {
    id: number;
    warehouse_id: number;
    item_id: number;
    movement_type: string;
    quantity: string | number;
    balance_after: string | number;
    reference_type: string;
    reference_id: number;
    movement_date: string;
    created_at: string | null;
    item?: {
        id: number;
        name: string;
        unit_id: number;
        unit?: {
            id: number;
            symbol: string;
        } | null;
    } | null;
    creator?: {
        id: number;
        name: string;
    } | null;
}

interface WarehouseData {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface WarehouseShowProps {
    warehouse: WarehouseData;
    stockBalances: PaginationMeta;
    categoryOptions: ItemCategoryData[];
    recentMovements: StockMovementRecord[];
    filters: {
        search?: string;
        category_id?: number | null;
        stock_status?: string | null;
    };
    stats: {
        total_items: number;
        total_quantity: number;
        in_stock: number;
        low_stock: number;
        out_of_stock: number;
        movements_count: number;
    };
}

export default function WarehouseShow({
    warehouse,
    stockBalances,
    categoryOptions = [],
    recentMovements = [],
    filters,
    stats,
}: WarehouseShowProps) {
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
        filters.category_id ? Number(filters.category_id) : undefined,
    );
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
        filters.stock_status || undefined,
    );
    const [isPending, startTransition] = useTransition();

    const handleApplyFilters = (newFilters: {
        search?: string;
        category_id?: number;
        stock_status?: string;
    }) => {
        startTransition(() => {
            router.get(
                `/warehouses/${warehouse.id}`,
                {
                    search: newFilters.search !== undefined ? (newFilters.search || undefined) : (searchQuery || undefined),
                    category_id: newFilters.category_id !== undefined ? (newFilters.category_id || undefined) : (selectedCategory || undefined),
                    stock_status: newFilters.stock_status !== undefined ? (newFilters.stock_status || undefined) : (selectedStatus || undefined),
                },
                { preserveState: true, replace: true },
            );
        });
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory(undefined);
        setSelectedStatus(undefined);
        startTransition(() => {
            router.get(`/warehouses/${warehouse.id}`, {}, { preserveState: true, replace: true });
        });
    };

    const handlePageChange = (page: number, pageSize?: number) => {
        router.get(
            `/warehouses/${warehouse.id}`,
            {
                page,
                per_page: pageSize,
                search: searchQuery || undefined,
                category_id: selectedCategory || undefined,
                stock_status: selectedStatus || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const getMovementTypeMeta = (type: string) => {
        switch (type) {
            case 'PURCHASE_IN':
                return {
                    label: 'توريد مخزني',
                    color: 'success',
                    icon: <RiseOutlined />,
                    sign: '+',
                    isIngress: true,
                };
            case 'DISPATCH_OUT':
                return {
                    label: 'صرف مخزني',
                    color: 'processing',
                    icon: <FallOutlined />,
                    sign: '-',
                    isIngress: false,
                };
            case 'WASTE_OUT':
                return {
                    label: 'إتلاف / هالك',
                    color: 'error',
                    icon: <FallOutlined />,
                    sign: '-',
                    isIngress: false,
                };
            case 'ADJUSTMENT_IN':
                return {
                    label: 'تسوية (زيادة)',
                    color: 'cyan',
                    icon: <RiseOutlined />,
                    sign: '+',
                    isIngress: true,
                };
            case 'ADJUSTMENT_OUT':
                return {
                    label: 'تسوية (عجز)',
                    color: 'warning',
                    icon: <FallOutlined />,
                    sign: '-',
                    isIngress: false,
                };
            default:
                return {
                    label: type,
                    color: 'default',
                    icon: <SwapOutlined />,
                    sign: '',
                    isIngress: true,
                };
        }
    };

    // Columns for stock balances table
    const balanceColumns = [
        {
            title: 'الصنف والمواصفات',
            key: 'item',
            render: (_: unknown, record: StockBalanceRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 8,
                            backgroundColor: '#f1f5f9',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            flexShrink: 0,
                        }}
                    >
                        <BarcodeOutlined />
                    </div>
                    <div>
                        <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>
                            {record.item?.name || `صنف #${record.item_id}`}
                        </span>
                        {record.item?.description && (
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 12,
                                    maxWidth: 240,
                                    display: 'inline-block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {record.item.description}
                            </Text>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'التصنيف',
            key: 'category',
            width: 140,
            render: (_: unknown, record: StockBalanceRecord) => (
                <Tag
                    color="blue"
                    style={{
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: 12,
                    }}
                >
                    {record.item?.category?.name || 'عام'}
                </Tag>
            ),
        },
        {
            title: 'الكمية المتوفرة حالياً',
            key: 'quantity',
            width: 170,
            render: (_: unknown, record: StockBalanceRecord) => {
                const qty = Number(record.quantity) || 0;
                const min = Number(record.item?.minimum_stock) || 0;
                const isOutOfStock = qty <= 0;
                const isLowStock = !isOutOfStock && qty <= min;

                let color = '#0f172a';
                if (isOutOfStock) color = '#dc2626';
                else if (isLowStock) color = '#d97706';

                return (
                    <div>
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                fontVariantNumeric: 'tabular-nums',
                                color,
                            }}
                        >
                            {qty.toLocaleString('ar-EG', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 3,
                            })}
                        </span>
                        <Text
                            type="secondary"
                            style={{
                                marginRight: 6,
                                fontSize: 13,
                                fontWeight: 500,
                            }}
                        >
                            {record.item?.unit?.symbol || record.item?.unit?.name || 'وحدة'}
                        </Text>
                    </div>
                );
            },
        },
        {
            title: 'الحد الأدنى للطلب',
            key: 'minimum_stock',
            width: 140,
            render: (_: unknown, record: StockBalanceRecord) => {
                const min = Number(record.item?.minimum_stock) || 0;
                return (
                    <Text
                        type="secondary"
                        style={{
                            fontSize: 13,
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 500,
                        }}
                    >
                        {min > 0
                            ? `${min.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} ${record.item?.unit?.symbol || ''}`
                            : 'غير محدد'}
                    </Text>
                );
            },
        },
        {
            title: 'حالة المخزون',
            key: 'status',
            width: 150,
            render: (_: unknown, record: StockBalanceRecord) => {
                const qty = Number(record.quantity) || 0;
                const min = Number(record.item?.minimum_stock) || 0;

                if (qty <= 0) {
                    return (
                        <Tag
                            color="error"
                            icon={<CloseCircleFilled />}
                            style={{
                                borderRadius: 12,
                                padding: '2px 10px',
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            نفد المخزون
                        </Tag>
                    );
                }

                if (qty <= min) {
                    return (
                        <Tag
                            color="warning"
                            icon={<WarningFilled />}
                            style={{
                                borderRadius: 12,
                                padding: '2px 10px',
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            مخزون منخفض
                        </Tag>
                    );
                }

                return (
                    <Tag
                        color="success"
                        icon={<CheckCircleFilled />}
                        style={{
                            borderRadius: 12,
                            padding: '2px 10px',
                            fontSize: 12,
                            fontWeight: 500,
                        }}
                    >
                        رصيد آمن
                    </Tag>
                );
            },
        },
        {
            title: 'مستوى التغطية',
            key: 'coverage',
            width: 160,
            render: (_: unknown, record: StockBalanceRecord) => {
                const qty = Number(record.quantity) || 0;
                const min = Number(record.item?.minimum_stock) || 0;

                if (min <= 0) {
                    return <Text type="secondary" style={{ fontSize: 12 }}>—</Text>;
                }

                const ratio = Math.min(Math.round((qty / min) * 100), 100);
                let strokeColor = '#059669';
                if (qty <= 0) strokeColor = '#dc2626';
                else if (qty <= min) strokeColor = '#d97706';

                return (
                    <div style={{ width: 130 }}>
                        <Progress
                            percent={ratio}
                            size="small"
                            strokeColor={strokeColor}
                            format={(percent) => (
                                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11 }}>
                                    {percent}%
                                </span>
                            )}
                        />
                    </div>
                );
            },
        },
        {
            title: 'آخر تحديث',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 150,
            render: (date: string | null) => (
                <Text
                    type="secondary"
                    style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
                >
                    {date
                        ? new Date(date).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                          })
                        : '—'}
                </Text>
            ),
        },
    ];

    // Columns for recent movements table
    const movementColumns = [
        {
            title: 'نوع الحركة',
            dataIndex: 'movement_type',
            key: 'movement_type',
            width: 150,
            render: (type: string) => {
                const meta = getMovementTypeMeta(type);
                return (
                    <Tag
                        color={meta.color}
                        icon={meta.icon}
                        style={{
                            borderRadius: 12,
                            padding: '2px 8px',
                            fontWeight: 500,
                            fontSize: 12,
                        }}
                    >
                        {meta.label}
                    </Tag>
                );
            },
        },
        {
            title: 'الصنف',
            key: 'item_name',
            render: (_: unknown, record: StockMovementRecord) => (
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                    {record.item?.name || `صنف #${record.item_id}`}
                </span>
            ),
        },
        {
            title: 'الكمية المحركة',
            key: 'movement_quantity',
            width: 150,
            render: (_: unknown, record: StockMovementRecord) => {
                const meta = getMovementTypeMeta(record.movement_type);
                const qty = Number(record.quantity) || 0;
                return (
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: 14,
                            fontVariantNumeric: 'tabular-nums',
                            color: meta.isIngress ? '#059669' : '#dc2626',
                        }}
                    >
                        {meta.sign}
                        {qty.toLocaleString('ar-EG', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3,
                        })}{' '}
                        <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>
                            {record.item?.unit?.symbol || ''}
                        </span>
                    </span>
                );
            },
        },
        {
            title: 'الرصيد بعد الحركة',
            dataIndex: 'balance_after',
            key: 'balance_after',
            width: 150,
            render: (val: string | number, record: StockMovementRecord) => (
                <span
                    style={{
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                    }}
                >
                    {Number(val).toLocaleString('ar-EG', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 3,
                    })}{' '}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#64748b' }}>
                        {record.item?.unit?.symbol || ''}
                    </span>
                </span>
            ),
        },
        {
            title: 'تاريخ الحركة',
            dataIndex: 'movement_date',
            key: 'movement_date',
            width: 170,
            render: (date: string) => (
                <Text
                    type="secondary"
                    style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
                >
                    {new Date(date).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            ),
        },
        {
            title: 'المسؤول',
            key: 'creator',
            width: 140,
            render: (_: unknown, record: StockMovementRecord) => (
                <Text type="secondary" style={{ fontSize: 13 }}>
                    {record.creator?.name || 'النظام'}
                </Text>
            ),
        },
    ];

    const safeItemsCount = Math.max(0, stats.in_stock - stats.low_stock);
    const alertItemsCount = stats.low_stock + stats.out_of_stock;

    const tabItems = [
        {
            key: 'balances',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <InboxOutlined />
                    <span>أرصدة الأصناف المتوفرة</span>
                    <Badge
                        count={stockBalances.total}
                        overflowCount={999}
                        style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            boxShadow: 'none',
                        }}
                    />
                </span>
            ),
            children: (
                <div>
                    {/* Filters Toolbar */}
                    <Card
                        variant="outlined"
                        style={{
                            marginBottom: 16,
                            borderRadius: 10,
                            borderColor: '#e2e8f0',
                            backgroundColor: '#f8fafc',
                        }}
                        styles={{ body: { padding: isMobile ? '12px 12px' : '14px 18px' } }}
                    >
                        <Row gutter={[12, 12]} align="middle">
                            <Col xs={24} md={8}>
                                <Input
                                    placeholder="بحث باسم الصنف أو الوصف..."
                                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onPressEnter={() =>
                                        handleApplyFilters({ search: searchQuery })
                                    }
                                    allowClear
                                    onClear={() => {
                                        setSearchQuery('');
                                        handleApplyFilters({ search: '' });
                                    }}
                                />
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    placeholder="جميع التصنيفات"
                                    value={selectedCategory}
                                    onChange={(val) => {
                                        setSelectedCategory(val);
                                        handleApplyFilters({ category_id: val });
                                    }}
                                    allowClear
                                    onClear={() => {
                                        setSelectedCategory(undefined);
                                        handleApplyFilters({ category_id: undefined });
                                    }}
                                    style={{ width: '100%' }}
                                    options={categoryOptions.map((c) => ({
                                        value: c.id,
                                        label: c.name,
                                    }))}
                                />
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <Select
                                    placeholder="حالة توفر الرصيد"
                                    value={selectedStatus}
                                    onChange={(val) => {
                                        setSelectedStatus(val);
                                        handleApplyFilters({ stock_status: val });
                                    }}
                                    allowClear
                                    onClear={() => {
                                        setSelectedStatus(undefined);
                                        handleApplyFilters({ stock_status: undefined });
                                    }}
                                    style={{ width: '100%' }}
                                    options={[
                                        { value: 'in_stock', label: 'متوفر حالياً (كمية > 0)' },
                                        { value: 'low_stock', label: 'مخزون منخفض (تحت حد الأمان)' },
                                        { value: 'out_of_stock', label: 'نفد المخزون (كمية = 0)' },
                                    ]}
                                />
                            </Col>

                            <Col xs={24} md={4} style={{ display: 'flex', gap: 8, justifyContent: isMobile ? 'stretch' : 'flex-end', flexWrap: 'wrap' }}>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={() => handleApplyFilters({ search: searchQuery })}
                                    style={{ backgroundColor: '#1d4ed8', borderRadius: 8, flex: isMobile ? 1 : undefined }}
                                >
                                    بحث
                                </Button>
                                {(searchQuery || selectedCategory !== undefined || selectedStatus !== undefined) && (
                                    <Button
                                        icon={<ReloadOutlined />}
                                        onClick={handleResetFilters}
                                        style={{ borderRadius: 8, flex: isMobile ? 1 : undefined }}
                                    >
                                        إعادة ضبط
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    </Card>

                    {/* Stock Balances Table */}
                    <Card
                        variant="outlined"
                        style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                        styles={{ body: { padding: 0 } }}
                    >
                        <Table
                            columns={balanceColumns}
                            dataSource={stockBalances.data}
                            rowKey="id"
                            loading={isPending}
                            size={isMobile ? 'small' : 'middle'}
                            scroll={{ x: 'max-content' }}
                            pagination={{
                                current: stockBalances.current_page,
                                pageSize: stockBalances.per_page,
                                total: stockBalances.total,
                                showTotal: (total, range) =>
                                    `عرض ${range[0]} إلى ${range[1]} من أصل ${total} صنف بالمستودع`,
                                onChange: handlePageChange,
                                position: ['bottomCenter'],
                            }}
                            locale={{
                                emptyText: (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description="لا توجد أصناف أو أرصدة مسجلة تطابق معايير البحث في هذا المستودع"
                                    />
                                ),
                            }}
                        />
                    </Card>
                </div>
            ),
        },
        {
            key: 'movements',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <HistoryOutlined />
                    <span>سجل الحركات الأخيرة بالمستودع</span>
                    <Badge
                        count={recentMovements.length}
                        style={{
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            boxShadow: 'none',
                        }}
                    />
                </span>
            ),
            children: (
                <Card
                    variant="outlined"
                    style={{ borderRadius: 12, borderColor: '#e2e8f0' }}
                    styles={{ body: { padding: 0 } }}
                >
                    <Table
                        columns={movementColumns}
                        dataSource={recentMovements}
                        rowKey="id"
                        pagination={false}
                        size={isMobile ? 'small' : 'middle'}
                        scroll={{ x: 'max-content' }}
                        locale={{
                            emptyText: (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="لا توجد حركات مخزنية مسجلة على هذا المستودع حتى الآن"
                                />
                            ),
                        }}
                    />
                </Card>
            ),
        },
    ];

    return (
        <>
            <Head title={`مخزون مستودع: ${warehouse.name}`} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header with Navigation and Actions */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 14 }}>
                        <Link href="/warehouses">
                            <Button
                                icon={<ArrowRightOutlined />}
                                style={{
                                    borderRadius: 8,
                                    height: 40,
                                    paddingInline: 12,
                                    borderColor: '#cbd5e1',
                                }}
                            >
                                العودة للمستودعات
                            </Button>
                        </Link>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                                    fontSize: 22,
                                    flexShrink: 0,
                                }}
                            >
                                <ShopOutlined />
                            </div>

                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                    <Title
                                        level={2}
                                        style={{
                                            margin: 0,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            fontSize: isMobile ? 20 : 24,
                                        }}
                                    >
                                        {warehouse.name}
                                    </Title>
                                    <Tag
                                        color={warehouse.is_active ? 'success' : 'default'}
                                        icon={
                                            warehouse.is_active ? (
                                                <CheckCircleFilled />
                                            ) : (
                                                <CloseCircleFilled />
                                            )
                                        }
                                        style={{
                                            borderRadius: 12,
                                            padding: '2px 10px',
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {warehouse.is_active ? 'نشط ومتاح' : 'متوقف'}
                                    </Tag>
                                </div>
                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 13,
                                        marginTop: 4,
                                        display: 'block',
                                    }}
                                >
                                    عرض رصيد المخزون، الكميات المتوفرة، والحدود الدنيا للأصناف داخل هذا المستودع
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Space size="middle" wrap style={{ width: isMobile ? '100%' : 'auto' }}>
                        <Link href="/purchase-invoices/create" style={{ flex: isMobile ? 1 : undefined }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                style={{
                                    backgroundColor: '#1d4ed8',
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 40,
                                    width: isMobile ? '100%' : 'auto',
                                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
                                }}
                            >
                                توريد بضاعة جديدة
                            </Button>
                        </Link>
                        <Link href="/dispatch-vouchers/create" style={{ flex: isMobile ? 1 : undefined }}>
                            <Button
                                icon={<FileTextOutlined />}
                                style={{
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 40,
                                    width: isMobile ? '100%' : 'auto',
                                }}
                            >
                                إذن صرف مخزني
                            </Button>
                        </Link>
                    </Space>
                </div>

                {/* KPI Metrics Row */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
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
                                        style={{ fontSize: 13, fontWeight: 500 }}
                                    >
                                        إجمالي الأصناف المسجلة
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
                                        {stats.total_items.toLocaleString('ar-EG')}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        أصناف لها أرصدة بالمستودع
                                    </Text>
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
                                    <InboxOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
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
                                        style={{ fontSize: 13, fontWeight: 500 }}
                                    >
                                        إجمالي الكميات بالمستودع
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: '#1d4ed8',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.total_quantity.toLocaleString('ar-EG', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 3,
                                        })}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        مجموع وحدات المخزون الفعلي
                                    </Text>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: '#e0f2fe',
                                        color: '#0284c7',
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

                    <Col xs={24} sm={12} lg={6}>
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
                                        style={{ fontSize: 13, fontWeight: 500 }}
                                    >
                                        أصناف برصيد آمن
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
                                        {safeItemsCount.toLocaleString('ar-EG')}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        أعلى من الحد الأدنى للطلب
                                    </Text>
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
                                        style={{ fontSize: 13, fontWeight: 500 }}
                                    >
                                        تنبيهات انخفاض ونفاد المخزون
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 26,
                                            fontWeight: 700,
                                            color: alertItemsCount > 0 ? '#dc2626' : '#64748b',
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {alertItemsCount.toLocaleString('ar-EG')}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                        {stats.low_stock} منخفض · {stats.out_of_stock} نافد
                                    </Text>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 10,
                                        backgroundColor: alertItemsCount > 0 ? '#fef2f2' : '#f8fafc',
                                        color: alertItemsCount > 0 ? '#dc2626' : '#94a3b8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 20,
                                    }}
                                >
                                    <WarningFilled />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Tabs Section for Balances and Recent Movements */}
                <Tabs
                    defaultActiveKey="balances"
                    items={tabItems}
                    style={{ backgroundColor: 'transparent' }}
                />
            </div>
        </>
    );
}
