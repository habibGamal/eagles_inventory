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
    InboxOutlined,
    UserOutlined,
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

export interface WarehouseOption {
    id: number;
    name: string;
}

export interface SectorOption {
    id: number;
    name: string;
    parent_id?: number | null;
}

export interface EmployeeOption {
    id: number;
    name: string;
    department?: string | null;
}

export interface UserOption {
    id: number;
    name: string;
}

export interface FormLineItem {
    item_id?: number;
    quantity: number;
}

export interface VoucherFormInitialData {
    id?: number;
    warehouse_id?: number;
    sector_id?: number;
    recipient_employee_id?: number | null;
    recipient_name_snapshot?: string;
    issued_by?: number;
    issue_date?: string;
    notes?: string | null;
    items?: Array<{
        item_id: number;
        quantity: number | string;
    }>;
}

interface VoucherFormProps {
    mode: 'create' | 'edit';
    initialData?: VoucherFormInitialData;
    warehouseOptions: WarehouseOption[];
    sectorOptions: SectorOption[];
    employeeOptions: EmployeeOption[];
    userOptions: UserOption[];
    itemOptions: ItemOption[];
}

export default function VoucherForm({
    mode,
    initialData,
    warehouseOptions,
    sectorOptions,
    employeeOptions,
    userOptions,
    itemOptions,
}: VoucherFormProps) {
    const isMobile = useIsMobile();
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    // Watch items for live counter
    const watchedItems = Form.useWatch('items', form) as
        | FormLineItem[]
        | undefined;
    const watchedPostImmediately = Form.useWatch('post_immediately', form) as
        | boolean
        | undefined;

    // Item quick lookup map
    const itemMap = useMemo(() => {
        const map = new Map<number, ItemOption>();
        itemOptions.forEach((item) => map.set(item.id, item));
        return map;
    }, [itemOptions]);

    // Employee quick lookup map
    const employeeMap = useMemo(() => {
        const map = new Map<number, EmployeeOption>();
        employeeOptions.forEach((emp) => map.set(emp.id, emp));
        return map;
    }, [employeeOptions]);

    // Calculate total quantity of items
    const totals = useMemo(() => {
        let totalQuantity = 0;
        let validItemCount = 0;
        if (Array.isArray(watchedItems)) {
            for (const item of watchedItems) {
                if (item?.item_id) validItemCount++;
                const qty = Number(item?.quantity) || 0;
                totalQuantity += qty;
            }
        }
        return {
            itemsCount: validItemCount,
            totalQuantity: Number(totalQuantity.toFixed(3)),
        };
    }, [watchedItems]);

    // Initial values setup
    const formInitialValues = useMemo(() => {
        if (mode === 'edit' && initialData) {
            return {
                warehouse_id: initialData.warehouse_id,
                sector_id: initialData.sector_id,
                recipient_employee_id:
                    initialData.recipient_employee_id || undefined,
                recipient_name_snapshot:
                    initialData.recipient_name_snapshot || '',
                issued_by:
                    initialData.issued_by || (userOptions[0]?.id ?? undefined),
                issue_date: initialData.issue_date
                    ? dayjs(initialData.issue_date)
                    : dayjs(),
                notes: initialData.notes || '',
                items: initialData.items?.length
                    ? initialData.items.map((it) => ({
                          item_id: it.item_id,
                          quantity: Number(it.quantity),
                      }))
                    : [{ item_id: undefined, quantity: 1 }],
            };
        }

        return {
            warehouse_id: warehouseOptions[0]?.id ?? undefined,
            sector_id: sectorOptions[0]?.id ?? undefined,
            recipient_employee_id: undefined,
            recipient_name_snapshot: '',
            issued_by: userOptions[0]?.id ?? undefined,
            issue_date: dayjs(),
            notes: '',
            post_immediately: false,
            items: [{ item_id: undefined, quantity: 1 }],
        };
    }, [mode, initialData, warehouseOptions, sectorOptions, userOptions]);

    // Handle Employee selection to auto-populate recipient_name_snapshot
    const handleEmployeeChange = (employeeId?: number) => {
        if (employeeId) {
            const emp = employeeMap.get(employeeId);
            if (emp) {
                form.setFieldValue('recipient_name_snapshot', emp.name);
            }
        }
    };

    const handleSubmit = (values: {
        warehouse_id: number;
        sector_id: number;
        recipient_employee_id?: number | null;
        recipient_name_snapshot: string;
        issued_by: number;
        issue_date: Dayjs;
        notes?: string;
        post_immediately?: boolean;
        items: FormLineItem[];
    }) => {
        setSubmitting(true);
        const payload = {
            warehouse_id: values.warehouse_id,
            sector_id: values.sector_id,
            recipient_employee_id: values.recipient_employee_id || null,
            recipient_name_snapshot: values.recipient_name_snapshot,
            issued_by: values.issued_by,
            issue_date: values.issue_date.format('YYYY-MM-DD'),
            notes: values.notes || null,
            post_immediately: !!values.post_immediately,
            items: values.items.map((it) => ({
                item_id: it.item_id,
                quantity: Number(it.quantity),
            })),
        };

        if (mode === 'create') {
            router.post('/dispatch-vouchers', payload, {
                onFinish: () => setSubmitting(false),
            });
        } else if (initialData?.id) {
            router.put(`/dispatch-vouchers/${initialData.id}`, payload, {
                onFinish: () => setSubmitting(false),
            });
        }
    };

    const isEdit = mode === 'edit';
    const pageTitle = isEdit
        ? `تعديل إذن الصرف المخزني #${initialData?.id}`
        : 'إنشاء إذن صرف مخزني جديد';

    return (
        <>
            <Head title={pageTitle} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Header Section */}
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
                            onClick={() => router.visit('/dispatch-vouchers')}
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
                                    ? 'تعديل بيانات وأصناف مسودة إذن الصرف قبل اعتماده وخصم الكميات من المخزون'
                                    : 'إصدار أمر صرف مواد وأصناف من المستودع لصالح قسم أو جهة طالبة مع تحديد المستلم'}
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
                            onClick={() => router.visit('/dispatch-vouchers')}
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
                                ? 'حفظ واعتماد الصرف'
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
                        {/* MAIN LEFT COLUMN: General Info & Items */}
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
                                                بيانات إذن الصرف والجهة الطالبة
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
                                                        المستودع المصروف منه
                                                    </span>
                                                }
                                                name="warehouse_id"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى اختيار المستودع',
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
                                                        القسم / القطاع الطالب
                                                    </span>
                                                }
                                                name="sector_id"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى اختيار القسم المستفيد',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="اختر القسم أو القطاع..."
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
                                                    options={sectorOptions.map(
                                                        (s) => ({
                                                            label: s.name,
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
                                                        الموظف المستلم (اختياري)
                                                    </span>
                                                }
                                                name="recipient_employee_id"
                                            >
                                                <Select
                                                    placeholder="اختر الموظف المسجل (اختياري)..."
                                                    allowClear
                                                    showSearch
                                                    onChange={
                                                        handleEmployeeChange
                                                    }
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
                                                    options={employeeOptions.map(
                                                        (e) => ({
                                                            label: `${e.name} ${e.department ? `[${e.department}]` : ''}`,
                                                            value: e.id,
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
                                                        اسم المستلم الفعلي
                                                    </span>
                                                }
                                                name="recipient_name_snapshot"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى إدخال اسم المستلم',
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    placeholder="اسم الشخص المستلم للبضاعة..."
                                                    prefix={
                                                        <UserOutlined
                                                            style={{
                                                                color: '#94a3b8',
                                                            }}
                                                        />
                                                    }
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
                                                        تاريخ الصرف
                                                    </span>
                                                }
                                                name="issue_date"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى تحديد تاريخ الصرف',
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
                                                        أمين الصرف / مسؤول
                                                        المستودع
                                                    </span>
                                                }
                                                name="issued_by"
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            'يرجى تحديد المسؤول القائم بالصرف',
                                                    },
                                                ]}
                                            >
                                                <Select
                                                    placeholder="اختر المسؤول..."
                                                    options={userOptions.map(
                                                        (u) => ({
                                                            label: u.name,
                                                            value: u.id,
                                                        }),
                                                    )}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* 2. DYNAMIC ITEMS CARD */}
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
                                                    الأصناف والكميات المطلوب
                                                    صرفها
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
                                                {/* Header grid */}
                                                <div
                                                    style={{
                                                        display: isMobile ? 'none' : 'grid',
                                                        gridTemplateColumns:
                                                            'minmax(280px, 6fr) minmax(180px, 4fr) 44px',
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
                                                    <div>
                                                        الصنف / المادة المخزنية
                                                    </div>
                                                    <div>الكمية المصروفة</div>
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

                                                        return (
                                                            <div
                                                                key={key}
                                                                style={{
                                                                    display: isMobile ? 'flex' : 'grid',
                                                                    flexDirection: isMobile ? 'column' : undefined,
                                                                    gridTemplateColumns: isMobile
                                                                        ? undefined
                                                                        : 'minmax(280px, 6fr) minmax(180px, 4fr) 44px',
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
                                                                            <Tooltip title="حذف هذا الصنف">
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

                                                                {/* Quantity */}
                                                                <div>
                                                                    {isMobile && <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>الكمية المصروفة:</Text>}
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

                                                                {/* Remove action on desktop */}
                                                                {!isMobile && (
                                                                    <div style={{ textAlign: 'center' }}>
                                                                        {fields.length > 1 && (
                                                                            <Tooltip title="حذف هذا الصنف">
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
                                                    إضافة صنف آخر لإذن الصرف
                                                </Button>
                                            </div>
                                        )}
                                    </Form.List>
                                </Card>
                            </div>
                        </Col>

                        {/* SIDEBAR RIGHT COLUMN: Summary & Submission */}
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
                                            <InboxOutlined
                                                style={{ color: '#1d4ed8' }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: 15,
                                                    color: '#0f172a',
                                                }}
                                            >
                                                ملخص أمر الصرف
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
                                        {/* Total items */}
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
                                                عدد أصناف الصرف:
                                            </Text>
                                            <span
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: 700,
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {totals.itemsCount} صنف
                                            </span>
                                        </div>

                                        {/* Total quantities */}
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
                                                إجمالي كميات المواد:
                                            </Text>
                                            <span
                                                style={{
                                                    fontSize: 20,
                                                    fontWeight: 800,
                                                    color: '#1d4ed8',
                                                    fontVariantNumeric:
                                                        'tabular-nums',
                                                }}
                                            >
                                                {totals.totalQuantity.toLocaleString(
                                                    'ar-EG',
                                                    {
                                                        minimumFractionDigits: 3,
                                                        maximumFractionDigits: 3,
                                                    },
                                                )}
                                            </span>
                                        </div>

                                        <Divider style={{ margin: '8px 0' }} />

                                        {/* Notes */}
                                        <Form.Item
                                            label={
                                                <span
                                                    style={{ fontWeight: 600 }}
                                                >
                                                    ملاحظات الصرف أو سبب الطلب
                                                </span>
                                            }
                                            name="notes"
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Input.TextArea
                                                rows={3}
                                                placeholder="أدخل أي ملاحظات خاصة بطلب الصرف، رقم أمر العمل، أو الاستخدام المخصص..."
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
                                                            اعتماد وصرف من
                                                            المخزون فور الحفظ
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
                                                    سيتم التحقق من توفر الأرصدة
                                                    وخصم الكميات من المستودع
                                                    فوراً.
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
                                                    ? 'حفظ واعتماد الصرف'
                                                    : isEdit
                                                      ? 'حفظ التعديلات'
                                                      : 'حفظ كمسودة'}
                                            </Button>
                                            <Button
                                                size="large"
                                                onClick={() =>
                                                    router.visit(
                                                        '/dispatch-vouchers',
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
                                    message="سياسة الخروج المخزني"
                                    description="يتم خصم الكميات من رصيد المستودع وتسجيل حركات الخروج في سجل الرقابة فقط عند اعتماد الإذن وترحيله."
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
