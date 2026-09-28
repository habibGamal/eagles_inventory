import React, { useState } from 'react';
import {
    Table,
    Card,
    Row,
    Col,
    Button,
    Tag,
    Select,
    Typography,
    Space,
    Tooltip,
    Progress,
    Tabs,
    Alert,
    Empty,
} from 'antd';
import {
    ArrowRightOutlined,
    BarcodeOutlined,
    ShopOutlined,
    BankOutlined,
    HistoryOutlined,
    SwapOutlined,
    ArrowDownOutlined,
    ArrowUpOutlined,
    PlusOutlined,
    MinusOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    WarningFilled,
    FileTextOutlined,
    FilterOutlined,
    ReloadOutlined,
    FolderOutlined,
    CalendarOutlined,
    UserOutlined,
    SafetyCertificateFilled,
import { Head, Link, router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ItemData {
    id: number;
    name: string;
    category?: { id: number; name: string } | null;
    unit?: { id: number; name: string; symbol: string } | null;
    description: string | null;
    minimum_stock: number;
    is_active: boolean;
    created_at?: string | null;
}

interface WarehouseStock {
    warehouse_id: number;
    warehouse_name: string;
    is_active: boolean;
    quantity: number;
    percentage: number;
    movements_count: number;
    last_movement_at: string | null;
    updated_at: string | null;
}

interface SummaryData {
    total_stock: number;
    minimum_stock: number;
    stock_health: 'out_of_stock' | 'critical' | 'warning' | 'good';
    warehouses_with_stock_count: number;
    total_warehouses_count: number;
    total_inward: number;
    total_outward: number;
    total_movements_count: number;
    last_movement_date: string | null;
}

interface MovementRecord {
    id: number;
    movement_date: string;
    movement_type: string;
    movement_type_label: string;
    is_ingress: boolean;
    quantity: number;
    balance_after: number;
    warehouse: {
        id?: number;
        name: string;
    };
    created_by: {
        id?: number;
        name: string;
    };
    reference: {
        type: string;
        id: number;
        label: string;
        party: string;
        status: string | null;
        status_label: string | null;
    };
}

interface PaginationMeta {
    current_page: number;
    data: MovementRecord[];
    per_page: number;
    total: number;
}

interface FilterOption {
    id?: number;
    value?: string;
    name?: string;
    label?: string;
}

interface ItemShowProps {
    item: ItemData;
    warehousesStock: WarehouseStock[];
    summary: SummaryData;
    movements: PaginationMeta;
    filterOptions: {
        warehouses: FilterOption[];
        movement_types: FilterOption[];
    };
    filters: {
        warehouse_id?: number | null;
        movement_type?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
}

export default function ItemShow({
    item,
    warehousesStock = [],
    summary,
    movements,
    filterOptions,
    filters,
}: ItemShowProps) {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState('warehouses');
    const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(
        filters.warehouse_id ? Number(filters.warehouse_id) : undefined,
    );
    const [selectedMovementType, setSelectedMovementType] = useState<string | undefined>(
        filters.movement_type || undefined,
    );

    const unitSymbol = item.unit?.symbol || item.unit?.name || 'وحدة';

    const handleApplyFilters = (newWarehouseId?: number, newMovementType?: string) => {
        const whId = newWarehouseId !== undefined ? newWarehouseId : selectedWarehouse;
        const mType = newMovementType !== undefined ? newMovementType : selectedMovementType;

        router.get(
            `/items/${item.id}`,
            {
                warehouse_id: whId || undefined,
                movement_type: mType || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleResetFilters = () => {
        setSelectedWarehouse(undefined);
        setSelectedMovementType(undefined);
        router.get(`/items/${item.id}`, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleFilterWarehouseMovements = (warehouseId: number) => {
        setSelectedWarehouse(warehouseId);
        setActiveTab('movements');
        handleApplyFilters(warehouseId, selectedMovementType);
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        router.get(
            `/items/${item.id}`,
            {
                page,
                per_page: pageSize,
                warehouse_id: selectedWarehouse || undefined,
                movement_type: selectedMovementType || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    // Columns for Warehouses Stock Breakdown Table
    const warehouseColumns: ColumnsType<WarehouseStock> = [
        {
            title: 'المستودع',
            key: 'warehouse',
            render: (_: unknown, record: WarehouseStock) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                        <ShopOutlined />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>
                            {record.warehouse_name}
                        </div>
                        <div style={{ marginTop: 2 }}>
                            <Tag
                                color={record.is_active ? 'success' : 'default'}
                                style={{ borderRadius: 6, fontSize: 11, padding: '0 6px' }}
                            >
                                {record.is_active ? 'مستودع نشط' : 'مستودع معطل'}
                            </Tag>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'الرصيد الحالي المتوفر',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 200,
            render: (qty: number) => {
                const isZero = qty === 0;
                return (
                    <div>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                fontVariantNumeric: 'tabular-nums',
                                color: isZero ? '#94a3b8' : '#0f172a',
                            }}
                        >
                            {qty.toLocaleString('ar-EG', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 3,
                            })}{' '}
                            <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>
                                {unitSymbol}
                            </span>
                        </div>
                        <div style={{ marginTop: 2 }}>
                            {isZero ? (
                                <Tag color="default" style={{ borderRadius: 6, fontSize: 11 }}>
                                    رصيد صفري
                                </Tag>
                            ) : (
                                <Tag color="success" style={{ borderRadius: 6, fontSize: 11 }}>
                                    متوفر بالمخزن
                                </Tag>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'النسبة من إجمالي المخزون',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 220,
            render: (percentage: number) => (
                <div style={{ width: '100%', maxWidth: 180 }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 4,
                            fontSize: 12,
                        }}
                    >
                        <span style={{ color: '#64748b' }}>الحصة المخزنية:</span>
                        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {percentage}%
                        </span>
                    </div>
                    <Progress
                        percent={percentage}
                        showInfo={false}
                        strokeColor={{
                            '0%': '#3b82f6',
                            '100%': '#1d4ed8',
                        }}
                        railColor="#f1f5f9"
                        size={['100%', 8]}
                    />
                </div>
            ),
        },
        {
            title: 'عدد الحركات',
            dataIndex: 'movements_count',
            key: 'movements_count',
            width: 130,
            render: (count: number) => (
                <div style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#334155' }}>
                    <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>
                        {count.toLocaleString('ar-EG')} حركة
                    </Tag>
                </div>
            ),
        },
        {
            title: 'آخر حركة مخزنية',
            dataIndex: 'last_movement_at',
            key: 'last_movement_at',
            width: 170,
            render: (date: string | null) =>
                date ? (
                    <Text type="secondary" style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                        <CalendarOutlined style={{ marginLeft: 4 }} />
                        {new Date(date).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>
                ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        لا توجد حركات
                    </Text>
                ),
        },
        {
            title: 'الإجراءات',
            key: 'actions',
            width: 150,
            align: 'center' as const,
            render: (_: unknown, record: WarehouseStock) => (
                <Button
                    type="link"
                    size="small"
                    icon={<HistoryOutlined />}
                    onClick={() => handleFilterWarehouseMovements(record.warehouse_id)}
                    style={{ fontWeight: 500 }}
                >
                    عرض حركات المستودع
                </Button>
            ),
        },
    ];

    // Columns for Stock Movements Ledger Table
    const movementColumns: ColumnsType<MovementRecord> = [
        {
            title: 'التاريخ والوقت',
            dataIndex: 'movement_date',
            key: 'movement_date',
            width: 170,
            render: (dateStr: string) => {
                const date = new Date(dateStr);
                return (
                    <div>
                        <div
                            style={{
                                fontWeight: 600,
                                color: '#0f172a',
                                fontVariantNumeric: 'tabular-nums',
                                fontSize: 13,
                            }}
                        >
                            {date.toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: '#64748b',
                                fontVariantNumeric: 'tabular-nums',
                                marginTop: 2,
                            }}
                        >
                            {date.toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'المستودع',
            key: 'warehouse',
            width: 150,
            render: (_: unknown, record: MovementRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BankOutlined style={{ color: '#1d4ed8' }} />
                    <span style={{ fontWeight: 500, color: '#1e293b' }}>
                        {record.warehouse.name}
                    </span>
                </div>
            ),
        },
        {
            title: 'نوع الحركة',
            dataIndex: 'movement_type',
            key: 'movement_type',
            width: 190,
            render: (_: unknown, record: MovementRecord) => {
                let color = 'default';
                let icon = <SwapOutlined />;

                if (record.movement_type === 'PURCHASE_IN') {
                    color = 'success';
                    icon = <ArrowDownOutlined />;
                } else if (record.movement_type === 'DISPATCH_OUT') {
                    color = 'processing';
                    icon = <ArrowUpOutlined />;
                } else if (record.movement_type === 'WASTE_OUT') {
                    color = 'volcano';
                    icon = <WarningFilled />;
                } else if (record.movement_type === 'ADJUSTMENT_IN') {
                    color = 'cyan';
                    icon = <PlusOutlined />;
                } else if (record.movement_type === 'ADJUSTMENT_OUT') {
                    color = 'magenta';
                    icon = <MinusOutlined />;
                }

                return (
                    <Tag
                        color={color}
                        icon={icon}
                        style={{
                            borderRadius: 8,
                            padding: '3px 10px',
                            fontWeight: 600,
                            fontSize: 12,
                        }}
                    >
                        {record.movement_type_label}
                    </Tag>
                );
            },
        },
        {
            title: 'كمية الحركة',
            key: 'quantity',
            width: 150,
            render: (_: unknown, record: MovementRecord) => {
                const isIngress = record.is_ingress;
                const sign = isIngress ? '+' : '-';
                const color = isIngress ? '#059669' : '#dc2626';

                return (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span
                            style={{
                                color,
                                fontWeight: 700,
                                fontSize: 15,
                                fontVariantNumeric: 'tabular-nums',
                                direction: 'ltr',
                            }}
                        >
                            {sign}
                            {record.quantity.toLocaleString('ar-EG', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 3,
                            })}
                        </span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{unitSymbol}</span>
                    </div>
                );
            },
        },
        {
            title: 'الرصيد بعد الحركة',
            dataIndex: 'balance_after',
            key: 'balance_after',
            width: 150,
            render: (balance: number) => (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span
                        style={{
                            fontWeight: 700,
                            color: '#0f172a',
                            fontSize: 14,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {balance.toLocaleString('ar-EG', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3,
                        })}
                    </span>
                    <span style={{ fontSize: 11, color: '#64748b' }}>{unitSymbol}</span>
                </div>
            ),
        },
        {
            title: 'المستند المرجعي والجهة',
            key: 'reference',
            render: (_: unknown, record: MovementRecord) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileTextOutlined style={{ color: '#2563eb' }} />
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
                            {record.reference.label}
                        </span>
                        {record.reference.status_label && (
                            <Tag
                                color={record.reference.status === 'POSTED' ? 'success' : 'default'}
                                style={{ borderRadius: 6, fontSize: 10, padding: '0 6px' }}
                            >
                                {record.reference.status_label}
                            </Tag>
                        )}
                    </div>
                    {record.reference.party && (
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            {record.reference.party}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'القائم بالحركة',
            key: 'created_by',
            width: 130,
            render: (_: unknown, record: MovementRecord) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <UserOutlined style={{ fontSize: 12 }} />
                    <span style={{ fontSize: 12 }}>{record.created_by.name}</span>
                </div>
            ),
        },
    ];

    const getHealthAlert = () => {
        if (summary.stock_health === 'out_of_stock') {
            return (
                <Alert
                    type="error"
                    showIcon
                    icon={<WarningFilled />}
                    title="تنبيه نفاد المخزون"
                    description="الرصيد الإجمالي لهذا الصنف صفر عبر جميع المستودعات. يُرجى اتخاذ إجراء فوري لإصدار طلب شراء أو إعادة تزويد."
                    style={{ borderRadius: 10, marginBottom: 16 }}
                />
            );
        }
        if (summary.stock_health === 'critical') {
            return (
                <Alert
                    type="warning"
                    showIcon
                    icon={<WarningFilled />}
                    title="مستوى المخزون دون الحد الأدنى المطلوب للأمان"
                    description={`الرصيد الكلي الحالي (${summary.total_stock} ${unitSymbol}) أقل من الحد الأدنى المعين للصنف (${summary.minimum_stock} ${unitSymbol}).`}
                    style={{ borderRadius: 10, marginBottom: 16 }}
                />
            );
        }
        return null;
    };

    return (
        <>
            <Head title={`تفاصيل وحركات الصنف - ${item.name}`} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Top Breadcrumb & Header Action */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 14 }}>
                        <Link href="/items">
                            <Button icon={<ArrowRightOutlined />} size={isMobile ? 'middle' : 'large'} style={{ width: isMobile ? '100%' : 'auto' }}>
                                العودة لدليل الأصناف
                            </Button>
                        </Link>

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
                                    {item.name}
                                </Title>
                                <Tag
                                    color="blue"
                                    style={{
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                    }}
                                >
                                    #{item.id}
                                </Tag>
                                <Tag
                                    color={item.is_active ? 'success' : 'default'}
                                    icon={
                                        item.is_active ? (
                                            <CheckCircleFilled />
                                        ) : (
                                            <CloseCircleFilled />
                                        )
                                    }
                                    style={{ borderRadius: 12, padding: '2px 10px', fontSize: 12 }}
                                >
                                    {item.is_active ? 'صنف نشط' : 'معطل'}
                                </Tag>
                            </div>

                            <Space
                                size="large"
                                style={{ marginTop: 6, color: '#64748b', fontSize: 13, flexWrap: 'wrap' }}
                            >
                                <span>
                                    <FolderOutlined style={{ marginLeft: 4 }} />
                                    التصنيف: <strong>{item.category?.name || 'غير محدد'}</strong>
                                </span>
                                <span>
                                    <BarcodeOutlined style={{ marginLeft: 4 }} />
                                    وحدة القياس: <strong>{unitSymbol}</strong>
                                </span>
                                {item.created_at && (
                                    <span>
                                        <CalendarOutlined style={{ marginLeft: 4 }} />
                                        تاريخ التعريف:{' '}
                                        <strong>
                                            {new Date(item.created_at).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </strong>
                                    </span>
                                )}
                            </Space>
                        </div>
                    </div>

                    <Button
                        icon={<ReloadOutlined />}
                        style={{ width: isMobile ? '100%' : 'auto' }}
                        onClick={() => router.reload({ only: ['warehousesStock', 'summary', 'movements'] })}
                    >
                        تحديث البيانات
                    </Button>
                </div>

                {item.description && (
                    <Card
                        size="small"
                        style={{
                            borderRadius: 10,
                            backgroundColor: '#f8fafc',
                            borderColor: '#e2e8f0',
                        }}
                    >
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            <strong>الوصف والملاحظات الفنية:</strong> {item.description}
                        </Text>
                    </Card>
                )}

                {/* Stock Health Alerts */}
                {getHealthAlert()}

                {/* 4 Summary Stat Cards */}
                <Row gutter={[16, 16]}>
                    {/* Card 1: Total Stock */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="borderless"
                            style={{
                                borderRadius: 12,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                height: '100%',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                                    إجمالي الرصيد الحالي
                                </Text>
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
                                        fontSize: 16,
                                    }}
                                >
                                    <ShopOutlined />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {summary.total_stock.toLocaleString('ar-EG', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 3,
                                    })}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                                    {unitSymbol}
                                </span>
                            </div>

                            <div style={{ marginTop: 10 }}>
                                {summary.stock_health === 'out_of_stock' && (
                                    <Tag color="error" style={{ borderRadius: 6 }}>
                                        رصيد نفد كلياً
                                    </Tag>
                                )}
                                {summary.stock_health === 'critical' && (
                                    <Tag color="warning" style={{ borderRadius: 6 }}>
                                        مخزون منخفض (أقل من الحد)
                                    </Tag>
                                )}
                                {summary.stock_health === 'good' && (
                                    <Tag color="success" style={{ borderRadius: 6 }}>
                                        مخزون آمن ومناسب
                                    </Tag>
                                )}
                                {summary.stock_health === 'warning' && (
                                    <Tag color="gold" style={{ borderRadius: 6 }}>
                                        على حافة الحد الأدنى
                                    </Tag>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Card 2: Minimum Stock */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="borderless"
                            style={{
                                borderRadius: 12,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                height: '100%',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                                    حد الأمان (إعادة الطلب)
                                </Text>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#fef3c7',
                                        color: '#d97706',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 16,
                                    }}
                                >
                                    <SafetyCertificateFilled />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {summary.minimum_stock.toLocaleString('ar-EG', {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 3,
                                    })}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: '#64748b' }}>
                                    {unitSymbol}
                                </span>
                            </div>

                            <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
                                {summary.total_stock >= summary.minimum_stock ? (
                                    <span style={{ color: '#059669', fontWeight: 600 }}>
                                        +{(summary.total_stock - summary.minimum_stock).toLocaleString('ar-EG')}{' '}
                                        {unitSymbol} فائض عن حد الأمان
                                    </span>
                                ) : (
                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                        {(summary.total_stock - summary.minimum_stock).toLocaleString('ar-EG')}{' '}
                                        {unitSymbol} عجز عن حد الأمان
                                    </span>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Card 3: Warehouses Distribution */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="borderless"
                            style={{
                                borderRadius: 12,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                height: '100%',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                                    انتشار المستودعات المتوفر بها
                                </Text>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 16,
                                    }}
                                >
                                    <BankOutlined />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {summary.warehouses_with_stock_count}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>
                                    من إجمالي {summary.total_warehouses_count} مستودعات
                                </span>
                            </div>

                            <div style={{ marginTop: 10 }}>
                                <Progress
                                    percent={
                                        summary.total_warehouses_count > 0
                                            ? Math.round(
                                                  (summary.warehouses_with_stock_count /
                                                      summary.total_warehouses_count) *
                                                      100,
                                              )
                                            : 0
                                    }
                                    strokeColor="#059669"
                                    railColor="#f1f5f9"
                                    size={['100%', 6]}
                                    format={(percent) => `${percent}% تغطية`}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* Card 4: Ledger Movements */}
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="borderless"
                            style={{
                                borderRadius: 12,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                height: '100%',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
                                    إجمالي حركات المخزون
                                </Text>
                                <div
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 8,
                                        backgroundColor: '#f3e8ff',
                                        color: '#7e22ce',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 16,
                                    }}
                                >
                                    <SwapOutlined />
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                <span
                                    style={{
                                        fontSize: 26,
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {summary.total_movements_count.toLocaleString('ar-EG')}
                                </span>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>
                                    عملية مسجلة
                                </span>
                            </div>

                            <div
                                style={{
                                    marginTop: 10,
                                    display: 'flex',
                                    gap: 12,
                                    fontSize: 12,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                <span style={{ color: '#059669', fontWeight: 600 }}>
                                    وارد: +{summary.total_inward.toLocaleString('ar-EG')} {unitSymbol}
                                </span>
                                <span style={{ color: '#dc2626', fontWeight: 600 }}>
                                    صادر: -{summary.total_outward.toLocaleString('ar-EG')} {unitSymbol}
                                </span>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Main Tabs: Warehouses Stock & Movements Ledger */}
                <Card
                    variant="borderless"
                    style={{
                        borderRadius: 12,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    }}
                >
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        items={[
                            {
                                key: 'warehouses',
                                label: (
                                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                                        <ShopOutlined style={{ marginLeft: 6 }} />
                                        أرصدة الصنف في المستودعات ({warehousesStock.length})
                                    </span>
                                ),
                                children: (
                                    <div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 16,
                                            }}
                                        >
                                            <div>
                                                <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                                                    توزيع الكميات الحالية لكل مستودع
                                                </Title>
                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                    بيان مفصل بالكميات الفعلية المتوفرة للصنف ونسبة التخزين في كل فرع
                                                </Text>
                                            </div>
                                        </div>

                                        <Table<WarehouseStock>
                                            columns={warehouseColumns}
                                            dataSource={warehousesStock}
                                            rowKey="warehouse_id"
                                            pagination={false}
                                            bordered
                                            size={isMobile ? 'small' : 'middle'}
                                            scroll={{ x: 'max-content' }}
                                            locale={{
                                                emptyText: (
                                                    <Empty
                                                        description="لا توجد بيانات مستودعات مسجلة"
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    />
                                                ),
                                            }}
                                            summary={() => (
                                                <Table.Summary fixed>
                                                    <Table.Summary.Row style={{ backgroundColor: '#f8fafc' }}>
                                                        <Table.Summary.Cell index={0}>
                                                            <Text strong style={{ fontSize: 14 }}>
                                                                الإجمالي الكلي لجميع المستودعات:
                                                            </Text>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={1}>
                                                            <Text
                                                                strong
                                                                style={{
                                                                    fontSize: 16,
                                                                    color: '#1d4ed8',
                                                                    fontVariantNumeric: 'tabular-nums',
                                                                }}
                                                            >
                                                                {summary.total_stock.toLocaleString('ar-EG', {
                                                                    minimumFractionDigits: 0,
                                                                    maximumFractionDigits: 3,
                                                                })}{' '}
                                                                {unitSymbol}
                                                            </Text>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={2}>
                                                            <Text strong>100%</Text>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={3}>
                                                            <Text strong style={{ fontVariantNumeric: 'tabular-nums' }}>
                                                                {summary.total_movements_count.toLocaleString('ar-EG')}{' '}
                                                                حركة
                                                            </Text>
                                                        </Table.Summary.Cell>
                                                        <Table.Summary.Cell index={4} colSpan={2}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                عدد المستودعات النشطة: {warehousesStock.length}
                                                            </Text>
                                                        </Table.Summary.Cell>
                                                    </Table.Summary.Row>
                                                </Table.Summary>
                                            )}
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: 'movements',
                                label: (
                                    <span style={{ fontSize: 15, fontWeight: 600 }}>
                                        <HistoryOutlined style={{ marginLeft: 6 }} />
                                        سجل وتفاصيل حركات المخزون ({movements.total})
                                    </span>
                                ),
                                children: (
                                    <div>
                                        {/* Filter Toolbar */}
                                        <div
                                            style={{
                                                backgroundColor: '#f8fafc',
                                                padding: isMobile ? '12px' : '16px 20px',
                                                borderRadius: 10,
                                                marginBottom: 16,
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                flexWrap: 'wrap',
                                                gap: 12,
                                            }}
                                        >
                                            <Space size="middle" wrap style={{ width: isMobile ? '100%' : 'auto' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <FilterOutlined style={{ color: '#1d4ed8' }} />
                                                    <Text strong style={{ fontSize: 13 }}>
                                                        تصفية الحركات:
                                                    </Text>
                                                </div>

                                                <Select
                                                    placeholder="جميع المستودعات"
                                                    allowClear
                                                    value={selectedWarehouse}
                                                    onChange={(val) => {
                                                        setSelectedWarehouse(val);
                                                        handleApplyFilters(val, selectedMovementType);
                                                    }}
                                                    style={{ width: isMobile ? '100%' : 200 }}
                                                    options={[
                                                        { value: undefined, label: 'جميع المستودعات' },
                                                        ...filterOptions.warehouses.map((wh) => ({
                                                            value: wh.id,
                                                            label: wh.name,
                                                        })),
                                                    ]}
                                                />

                                                <Select
                                                    placeholder="جميع أنواع الحركات"
                                                    allowClear
                                                    value={selectedMovementType}
                                                    onChange={(val) => {
                                                        setSelectedMovementType(val);
                                                        handleApplyFilters(selectedWarehouse, val);
                                                    }}
                                                    style={{ width: isMobile ? '100%' : 220 }}
                                                    options={[
                                                        { value: undefined, label: 'جميع أنواع الحركات' },
                                                        ...filterOptions.movement_types.map((mt) => ({
                                                            value: mt.value,
                                                            label: mt.label,
                                                        })),
                                                    ]}
                                                />
                                            </Space>

                                            {(selectedWarehouse || selectedMovementType) && (
                                                <Button size="small" onClick={handleResetFilters} style={{ width: isMobile ? '100%' : 'auto' }}>
                                                    إلغاء التصفية
                                                </Button>
                                            )}
                                        </div>

                                        {/* Movements Table */}
                                        <Table<MovementRecord>
                                            columns={movementColumns}
                                            dataSource={movements.data}
                                            rowKey="id"
                                            size={isMobile ? 'small' : 'middle'}
                                            scroll={{ x: 'max-content' }}
                                            pagination={{
                                                current: movements.current_page,
                                                pageSize: movements.per_page,
                                                total: movements.total,
                                                showSizeChanger: true,
                                                pageSizeOptions: ['10', '15', '25', '50'],
                                                onChange: handlePaginationChange,
                                                showTotal: (total, range) =>
                                                    `عرض ${range[0]} - ${range[1]} من إجمالي ${total} حركة مخزنية مسجلة`,
                                            }}
                                            bordered
                                            locale={{
                                                emptyText: (
                                                    <Empty
                                                        description="لا توجد حركات مخزنية مسجلة لهذا الصنف وفقاً لخيارات التصفية المحددة"
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    />
                                                ),
                                            }}
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </Card>
            </div>
        </>
    );
}
