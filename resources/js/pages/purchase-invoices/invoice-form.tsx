import React, { useMemo, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Button,
    Input,
    InputNumber,
    Select,
    DatePicker,
    Form,
    Typography,
    Divider,
    Checkbox,
    Alert,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ArrowRightOutlined,
    SaveOutlined,
    CheckCircleOutlined,
    ShopOutlined,
    FileTextOutlined,
    PercentageOutlined,
import { Head, router } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

export interface ItemOption {
    id: number;
    name: string;
    unit_id: number;
    unit?: {
        id: number;
        name: string;
        symbol: string;
    };
}

export interface SupplierOption {
    id: number;
    name: string;
    phone?: string | null;
}

export interface WarehouseOption {
    id: number;
    name: string;
}

export interface FormLineItem {
    item_id?: number;
    quantity: number;
    unit_price: number;
}

export interface InvoiceFormInitialData {
    id?: number;
    supplier_id?: number;
    warehouse_id?: number;
    invoice_date?: string;
    received_at?: string | null;
    discount?: number | string;
    notes?: string | null;
    items?: Array<{
        item_id: number;
        quantity: number | string;
        unit_price: number | string;
    }>;
}

interface InvoiceFormProps {
    mode: 'create' | 'edit';
    initialData?: InvoiceFormInitialData;
    supplierOptions: SupplierOption[];
    warehouseOptions: WarehouseOption[];
    itemOptions: ItemOption[];
}

export default function InvoiceForm({
    mode,
    initialData,
    supplierOptions,
    warehouseOptions,
    itemOptions,
}: InvoiceFormProps) {
    const isMobile = useIsMobile();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Watch items and discount for live recalculation
    const watchedItems = Form.useWatch('items', form) as
        | FormLineItem[]
        | undefined;
    const watchedDiscount =
        (Form.useWatch('discount', form) as number | undefined) || 0;
    const watchedPostImmediately = Form.useWatch('post_immediately', form) as
        | boolean
        | undefined;

    // Item quick lookup map
    const itemMap = useMemo(() => {
        const map = new Map<number, ItemOption>();
        itemOptions.forEach((item) => map.set(item.id, item));
        return map;
    }, [itemOptions]);

    // Financial totals calculation
    const totals = useMemo(() => {
        let subtotal = 0;
        if (Array.isArray(watchedItems)) {
            for (const item of watchedItems) {
                const qty = Number(item?.quantity) || 0;
                const price = Number(item?.unit_price) || 0;
                subtotal += qty * price;
            }
        }
        const discountVal = Number(watchedDiscount) || 0;
        const netTotal = Math.max(0, subtotal - discountVal);
        return {
            subtotal: Number(subtotal.toFixed(2)),
            discount: Number(discountVal.toFixed(2)),
            total: Number(netTotal.toFixed(2)),
        };
    }, [watchedItems, watchedDiscount]);

    // Initial values setup
    const formInitialValues = useMemo(() => {
        if (mode === 'edit' && initialData) {
            return {
                supplier_id: initialData.supplier_id,
                warehouse_id: initialData.warehouse_id,
                invoice_date: initialData.invoice_date
                    ? dayjs(initialData.invoice_date)
                    : dayjs(),
                received_at: initialData.received_at
                    ? dayjs(initialData.received_at)
                    : null,
                discount: Number(initialData.discount) || 0,
                notes: initialData.notes || '',
                items: initialData.items?.length
                    ? initialData.items.map((it) => ({
                          item_id: it.item_id,
                          quantity: Number(it.quantity),
                          unit_price: Number(it.unit_price),
                      }))
                    : [{ item_id: undefined, quantity: 1, unit_price: 0 }],
            };
        }

        return {
            invoice_date: dayjs(),
            received_at: null,
            discount: 0,
            notes: '',
            post_immediately: false,
            items: [{ item_id: undefined, quantity: 1, unit_price: 0 }],
        };
    }, [mode, initialData]);

    const handleSubmit = (values: {
        supplier_id: number;
        warehouse_id: number;
        invoice_date: Dayjs;
        received_at?: Dayjs | null;
        discount?: number;
        notes?: string;
        post_immediately?: boolean;
        items: FormLineItem[];
    }) => {
        setSubmitting(true);
        const payload = {
            supplier_id: values.supplier_id,
            warehouse_id: values.warehouse_id,
            invoice_date: values.invoice_date.format('YYYY-MM-DD'),
            received_at: values.received_at
                ? values.received_at.format('YYYY-MM-DD HH:mm:ss')
                : null,
            discount: values.discount || 0,
            notes: values.notes || null,
            post_immediately: !!values.post_immediately,
            items: values.items.map((it) => ({
                item_id: it.item_id,
                quantity: Number(it.quantity),
                unit_price: Number(it.unit_price),
            })),
        };

        if (mode === 'create') {
            router.post('/purchase-invoices', payload, {
                onFinish: () => setSubmitting(false),
            });
        } else if (initialData?.id) {
            router.put(`/purchase-invoices/${initialData.id}`, payload, {
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const isEdit = mode === 'edit';
    const pageTitle = isEdit
        ? `تعديل فاتورة التوريد #${initialData?.id}`
        : 'إنشاء فاتورة توريد واردة جديدة';

    return (
        <>
            <Head title={pageTitle} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Top Navigation & Action Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                        }}
                    >
                        <Button
                            icon={<ArrowRightOutlined />}
                            onClick={() => router.visit('/purchase-invoices')}
                            style={{ borderRadius: 8 }}
                        >
                            العودة للقائمة
                        </Button>
                        <div>
                            <Title
                                level={2}
                                style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                }}
                            >
                                {pageTitle}
                            </Title>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 13,
                                    marginTop: 2,
                                    display: 'block',
                                }}
                            >
                                {isEdit
                                    ? 'تعديل بيانات وأصناف مسودة فاتورة التوريد قبل اعتمادها وترحيلها'
                                    : 'إدخال بيانات استلام بضائع وتوريدات من الموردين وتوثيق البنود والأسعار'}
                            </Text>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: isMobile ? '100%' : 'auto',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            onClick={() => router.visit('/purchase-invoices')}
                            style={{ borderRadius: 8, flex: isMobile ? 1 : undefined }}
                        >
                            إلغاء وتراجع
                        </Button>
                        <Button
                            type="primary"
                            icon={
                                watchedPostImmediately ? (
                                    <CheckCircleOutlined />
                                ) : (
                                    <SaveOutlined />
                                )
                            }
                            loading={submitting}
                            onClick={() => form.submit()}
                            style={{
                                backgroundColor: watchedPostImmediately
                                    ? '#059669'
                                    : '#1d4ed8',
                                borderRadius: 8,
                                fontWeight: 600,
                                height: 38,
                                flex: isMobile ? 2 : undefined,
                                minWidth: isMobile ? undefined : 140,
                            }}
                        >
                            {watchedPostImmediately
                                ? 'حفظ واعتماد التوريد'
                                : isEdit
                                  ? 'حفظ التعديلات'
                                  : 'حفظ كمسودة'}
                        </Button>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    initialValues={formInitialValues}
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Row gutter={[20, 20]}>
                        {/* MAIN LEFT COLUMN: General Info & Dynamic Line Items */}
                        <Col xs={24} lg={16}>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20,
                                }}
                            >
                                {/* 1. GENERAL INFORMATION CARD */}
                                <Card
                                    variant="outlined"
                                    style={{
                                        borderRadius: 12,
                                        borderColor: '#e2e8f0',
                                        boxShadow:
                                            '0 1px 3px rgba(15, 23, 42, 0.03)',
                                    }}
                                    title={
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <FileTextOutlined
                                                style={{ color: '#1d4ed8' }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                    color: '#0f172a',
                                                }}
                                            >
                                                البيانات الأساسية للفاتورة
                                            </span>
                                        </div>
                                    }
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        المورد المعتمد
                                                    </span>
                                                }
                                                name="supplier_id"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى اختيار المورد',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="اختر المورد..."
                                                    showSearch
                                                    filterOption={(
                                                        input,
                                                        option,
                                                    ) =>
                                                        (option?.label ?? '')
                                                            .toLowerCase()
                                                            .includes(
                                                                input.toLowerCase(),
                                                            )
                                                    }
                                                    options={supplierOptions.map(
                                                        (s) => ({
                                                            label: `${s.name} ${s.phone ? `(${s.phone})` : ''}`,
                                                            value: s.id,
                                                        }),
                                                    )}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        المستودع المستلم
                                                    </span>
                                                }
                                                name="warehouse_id"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى تحديد المستودع المستلم',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="اختر المستودع..."
                                                    options={warehouseOptions.map(
                                                        (w) => ({
                                                            label: w.name,
                                                            value: w.id,
                                                        }),
                                                    )}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        تاريخ الفاتورة
                                                    </span>
                                                }
                                                name="invoice_date"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى تحديد تاريخ الفاتورة',
                                                    },
                                                ]}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    format="YYYY-MM-DD"
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                label={
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        تاريخ ووقت الاستلام الفعلي
                                                    </span>
                                                }
                                                name="received_at"
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    showTime
                                                    format="YYYY-MM-DD HH:mm"
                                                    placeholder="اتركه فارغاً إذا لم تستلم الشحنة بعد"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* 2. DYNAMIC LINE ITEMS CARD */}
                                <Card
                                    variant="outlined"
                                    style={{
                                        borderRadius: 12,
                                        borderColor: '#e2e8f0',
                                        boxShadow:
                                            '0 1px 3px rgba(15, 23, 42, 0.03)',
                                    }}
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
                                                    gap: 8,
                                                }}
                                            >
                                                <ShopOutlined
                                                    style={{ color: '#1d4ed8' }}
                                                />
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 15,
                                                        color: '#0f172a',
                                                    }}
                                                >
                                                    أصناف وبنود التوريد
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: '#64748b',
                                                }}
                                            >
                                                إجمالي البنود:{' '}
                                                <strong
                                                    style={{ color: '#1d4ed8' }}
                                                >
                                                    {watchedItems?.length || 0}
                                                </strong>
                                            </span>
                                        </div>
                                    }
                                >
                                    <Form.List name="items">
                                        {(fields, { add, remove }) => (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 12,
                                                }}
                                            >
                                                {/* Table-like header on desktop */}
                                                <div
                                                    style={{
                                                        display: isMobile ? 'none' : 'grid',
                                                        gridTemplateColumns:
                                                            'minmax(220px, 4fr) minmax(130px, 2fr) minmax(130px, 2fr) minmax(140px, 2fr) 44px',
                                                        gap: 12,
                                                        padding: '8px 12px',
                                                        backgroundColor:
                                                            '#f1f5f9',
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                        color: '#475569',
                                                    }}
                                                >
                                                    <div>الصنف / المادة</div>
                                                    <div>الكمية المستلمة</div>
                                                    <div>سعر الوحدة</div>
                                                    <div
                                                        style={{
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        الإجمالي للبند
                                                    </div>
                                                    <div></div>
                                                </div>

                                                {fields.map(
                                                    (
                                                        {
                                                            key,
                                                            name,
                                                            ...restField
                                                        },
                                                        index,
                                                    ) => {
                                                        const currentLine =
                                                            watchedItems?.[
                                                                index
                                                            ];
                                                        const selectedItem =
                                                            currentLine?.item_id
                                                                ? itemMap.get(
                                                                      currentLine.item_id,
                                                                  )
                                                                : undefined;
                                                        const lineQty =
                                                            Number(
                                                                currentLine?.quantity,
                                                            ) || 0;
                                                        const linePrice =
                                                            Number(
                                                                currentLine?.unit_price,
                                                            ) || 0;
                                                        const lineTotal = (
                                                            lineQty * linePrice
                                                        ).toFixed(2);

                                                        return (
                                                            <div
                                                                key={key}
                                                                style={{
                                                                    display: isMobile ? 'flex' : 'grid',
                                                                    flexDirection: isMobile ? 'column' : undefined,
                                                                    gridTemplateColumns: isMobile
                                                                        ? undefined
                                                                        : 'minmax(220px, 4fr) minmax(130px, 2fr) minmax(130px, 2fr) minmax(140px, 2fr) 44px',
                                                                    gap: 12,
                                                                    alignItems: isMobile ? 'stretch' : 'center',
                                                                    padding: isMobile ? '14px' : '10px 12px',
                                                                    backgroundColor: isMobile ? '#f8fafc' : '#ffffff',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: 8,
                                                                }}
                                                            >
                                                                {/* Item Select */}
                                                                {isMobile ? (
                                                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <Form.Item
                                                                                {...restField}
                                                                                name={[name, 'item_id']}
                                                                                rules={[{ required: true, message: 'اختر الصنف' }]}
                                                                                style={{ marginBottom: 0 }}
                                                                            >
                                                                                <Select
                                                                                    placeholder="اختر الصنف من قائمة المخزون..."
                                                                                    showSearch
                                                                                    filterOption={(input, option) =>
                                                                                        (option?.label ?? '')
                                                                                            .toLowerCase()
                                                                                            .includes(input.toLowerCase())
                                                                                    }
                                                                                    options={itemOptions.map((it) => ({
                                                                                        label: `${it.name} ${it.unit?.symbol ? `[${it.unit.symbol}]` : ''}`,
                                                                                        value: it.id,
                                                                                    }))}
                                                                                    style={{ width: '100%' }}
                                                                                />
                                                                            </Form.Item>
                                                                        </div>
                                                                        {fields.length > 1 && (
                                                                            <Tooltip title="حذف هذا البند">
                                                                                <Button
                                                                                    type="text"
                                                                                    danger
                                                                                    icon={<DeleteOutlined />}
                                                                                    onClick={() => remove(name)}
                                                                                />
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'item_id']}
                                                                            rules={[{ required: true, message: 'اختر الصنف' }]}
                                                                            style={{ marginBottom: 0 }}
                                                                        >
                                                                            <Select
                                                                                placeholder="اختر الصنف من قائمة المخزون..."
                                                                                showSearch
                                                                                filterOption={(input, option) =>
                                                                                    (option?.label ?? '')
                                                                                        .toLowerCase()
                                                                                        .includes(input.toLowerCase())
                                                                                }
                                                                                options={itemOptions.map((it) => ({
                                                                                    label: `${it.name} ${it.unit?.symbol ? `[${it.unit.symbol}]` : ''}`,
                                                                                    value: it.id,
                                                                                }))}
                                                                                style={{ width: '100%' }}
                                                                            />
                                                                        </Form.Item>
                                                                    </div>
                                                                )}

                                                                {/* Quantity & Unit Price */}
                                                                <div
                                                                    style={{
                                                                        display: isMobile ? 'grid' : 'contents',
                                                                        gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
                                                                        gap: 10,
                                                                    }}
                                                                >
                                                                    <div>
                                                                        {isMobile && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>الكمية المستلمة:</Text>}
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'quantity']}
                                                                            rules={[
                                                                                { required: true, message: 'مطلوب' },
                                                                                { type: 'number', min: 0.001, message: '> 0' },
                                                                            ]}
                                                                            style={{ marginBottom: 0 }}
                                                                        >
                                                                            <InputNumber
                                                                                placeholder="الكمية"
                                                                                min={0.001}
                                                                                step={1}
                                                                                precision={3}
                                                                                addonAfter={selectedItem?.unit?.symbol || undefined}
                                                                                style={{ width: '100%' }}
                                                                            />
                                                                        </Form.Item>
                                                                    </div>

                                                                    <div>
                                                                        {isMobile && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>سعر الوحدة:</Text>}
                                                                        <Form.Item
                                                                            {...restField}
                                                                            name={[name, 'unit_price']}
                                                                            rules={[
                                                                                { required: true, message: 'مطلوب' },
                                                                                { type: 'number', min: 0, message: '>= 0' },
                                                                            ]}
                                                                            style={{ marginBottom: 0 }}
                                                                        >
                                                                            <InputNumber
                                                                                placeholder="السعر"
                                                                                min={0}
                                                                                step={0.5}
                                                                                precision={2}
                                                                                addonAfter="ج.م"
                                                                                style={{ width: '100%' }}
                                                                            />
                                                                        </Form.Item>
                                                                    </div>
                                                                </div>

                                                                {/* Line Total */}
                                                                <div
                                                                    style={{
                                                                        display: isMobile ? 'flex' : 'block',
                                                                        justifyContent: isMobile ? 'space-between' : undefined,
                                                                        alignItems: isMobile ? 'center' : undefined,
                                                                        textAlign: isMobile ? 'right' : 'center',
                                                                    }}
                                                                >
                                                                    {isMobile && <Text type="secondary" style={{ fontSize: 12 }}>الإجمالي للبند:</Text>}
                                                                    <div
                                                                        style={{
                                                                            fontSize: 14,
                                                                            fontWeight: 700,
                                                                            color: '#0f172a',
                                                                            fontVariantNumeric: 'tabular-nums',
                                                                            padding: '6px 8px',
                                                                            backgroundColor: '#f8fafc',
                                                                            border: '1px solid #e2e8f0',
                                                                            borderRadius: 6,
                                                                        }}
                                                                    >
                                                                        {lineTotal} ج.م
                                                                    </div>
                                                                </div>

                                                                {/* Remove row on desktop */}
                                                                {!isMobile && (
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        {fields.length > 1 && (
                                                                            <Tooltip title="حذف هذا البند">
                                                                                <Button
                                                                                    type="text"
                                                                                    danger
                                                                                    icon={<DeleteOutlined />}
                                                                                    onClick={() => remove(name)}
                                                                                />
                                                                            </Tooltip>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}

                                                <Button
                                                    type="dashed"
                                                    onClick={() =>
                                                        add({
                                                            item_id: undefined,
                                                            quantity: 1,
                                                            unit_price: 0,
                                                        })
                                                    }
                                                    icon={<PlusOutlined />}
                                                    style={{
                                                        height: 42,
                                                        borderRadius: 8,
                                                        marginTop: 4,
                                                    }}
                                                    block
                                                >
                                                    إضافة صنف آخر للفاتورة
                                                </Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </Card>
                            </div>
                        </Col>

                        {/* SIDEBAR RIGHT COLUMN: Financial Summary, Notes, and Submission */}
                        <Col xs={24} lg={8}>
                            <div
                                style={{
                                    position: 'sticky',
                                    top: 84,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 20,
                                }}
                            >
                                {/* Financial Totals Card */}
                                <Card
                                    variant="outlined"
                                    style={{
                                        borderRadius: 12,
                                        borderColor: '#e2e8f0',
                                        boxShadow:
                                            '0 1px 3px rgba(15, 23, 42, 0.03)',
                                    }}
                                    title={
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <PercentageOutlined
                                                style={{ color: '#1d4ed8' }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                    color: '#0f172a',
                                                }}
                                            >
                                                المطابقة المالية والإجمالي
                                            </span>
                                        </div>
                                    }
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 14,
                                        }}
                                    >
                                        {/* Subtotal */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 14 }}
                                            >
                                                المجموع الفرعي للبنود:
                                            </Text>
                                            <span
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {totals.subtotal.toLocaleString(
                                                    'ar-EG',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    },
                                                )}{' '}
                                                ج.م
                                            </span>
                                        </div>

                                        {/* Discount */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: 14 }}
                                            >
                                                الخصم التجاري الممنوح:
                                            </Text>
                                            <Form.Item
                                                name="discount"
                                                style={{
                                                    marginBottom: 0,
                                                    width: 140,
                                                }}
                                            >
                                                <InputNumber
                                                    min={0}
                                                    precision={2}
                                                    addonAfter="ج.م"
                                                    placeholder="0.00"
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </div>

                                        <Divider style={{ margin: '8px 0' }} />

                                        {/* Net Final Total */}
                                        <div
                                            style={{
                                                padding: '14px 16px',
                                                backgroundColor: '#eff6ff',
                                                borderRadius: 10,
                                                border: '1px solid #bfdbfe',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 4,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    color: '#1e40af',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                الصافي النهائي المطلوب سداده:
                                            </span>
                                            <div
                                                style={{
                                                    fontSize: 26,
                                                    fontWeight: 800,
                                                    color: '#1d4ed8',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {totals.total.toLocaleString(
                                                    'ar-EG',
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    },
                                                )}{' '}
                                                <span
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    ج.م
                                                </span>
                                            </div>
                                        </div>

                                        {/* Shipment / Invoice Notes */}
                                        <Form.Item
                                            label={
                                                <span
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    ملاحظات أو رقم بوليصة الشحن
                                                </span>
                                            }
                                            name="notes"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Input.TextArea
                                                rows={3}
                                                placeholder="أدخل أي ملاحظات خاصة بعملية الاستلام أو رقم إذن توريد المورد..."
                                            />
                                        </Form.Item>

                                        {/* Immediate Post Checkbox (Only on Create) */}
                                        {!isEdit && (
                                            <div
                                                style={{
                                                    backgroundColor: '#ecfdf5',
                                                    padding: '12px 14px',
                                                    borderRadius: 8,
                                                    border: '1px solid #a7f3d0',
                                                }}
                                            >
                                                <Form.Item
                                                    name="post_immediately"
                                                    valuePropName="checked"
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Checkbox>
                                                        <span
                                                            style={{
                                                                fontWeight: 700,
                                                                color: '#065f46',
                                                            }}
                                                        >
                                                            اعتماد وترحيل
                                                            للمخزون فور الحفظ
                                                        </span>
                                                    </Checkbox>
                                                </Form.Item>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: '#047857',
                                                        marginTop: 4,
                                                        paddingRight: 24,
                                                    }}
                                                >
                                                    سيتم تحديث رصيد المستودع
                                                    وتسجيل حركات الإدخال فوراً.
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 10,
                                                marginTop: 8,
                                            }}
                                        >
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                size="large"
                                                loading={submitting}
                                                icon={
                                                    watchedPostImmediately ? (
                                                        <CheckCircleOutlined />
                                                    ) : (
                                                        <SaveOutlined />
                                                    )
                                                }
                                                style={{
                                                    backgroundColor:
                                                        watchedPostImmediately
                                                            ? '#059669'
                                                            : '#1d4ed8',
                                                    borderRadius: 8,
                                                    fontWeight: 700,
                                                    height: 44,
                                                    boxShadow:
                                                        watchedPostImmediately
                                                            ? '0 4px 12px rgba(5, 150, 105, 0.25)'
                                                            : '0 4px 12px rgba(29, 78, 216, 0.25)',
                                                }}
                                            >
                                                {watchedPostImmediately
                                                    ? 'حفظ واعتماد التوريد'
                                                    : isEdit
                                                      ? 'حفظ التعديلات'
                                                      : 'حفظ كمسودة'}
                                            </Button>
                                            <Button
                                                size="large"
                                                onClick={() =>
                                                    router.visit(
                                                        '/purchase-invoices',
                                                    )
                                                }
                                                style={{
                                                    borderRadius: 8,
                                                    height: 40,
                                                }}
                                            >
                                                إلغاء والعودة
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <Alert
                                    message="تنبيه الرقابة المخزنية"
                                    description="الفواتير المحفوظة كمسودة لا تؤثر على الأرصدة المخزنية إلا بعد اعتمادها وترحيلها رسمياً."
                                    type="info"
                                    showIcon
                                    style={{ borderRadius: 8 }}
                                />
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>
        </>
    );
}
