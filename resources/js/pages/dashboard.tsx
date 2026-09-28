import React from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Table,
    Tag,
    Button,
    Avatar,
    Space,
    Badge,
    Progress,
} from 'antd';
import {
    TeamOutlined,
    AppstoreOutlined,
    ShoppingOutlined,
    InboxOutlined,
    UserAddOutlined,
    CheckCircleFilled,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    SafetyCertificateFilled,
} from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Title, Text } = Typography;

interface DashboardProps {
    stats: {
        users_count: number;
        warehouses_count: number;
        items_count: number;
        suppliers_count: number;
        purchase_invoices_count: number;
        dispatch_vouchers_count: number;
    };
    recentUsers: Array<{
        id: number;
        name: string;
        email: string;
        email_verified_at: string | null;
        created_at: string;
    }>;
    recentAuditLogs: Array<{
        id: number;
        action: string;
        entity_type: string;
        created_at: string;
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    }>;
}

export default function Dashboard({
    stats,
    recentUsers = [],
    recentAuditLogs = [],
}: DashboardProps) {
    const isMobile = useIsMobile();

    // User Table Columns for Dashboard preview
    const userColumns = [
        {
            title: 'المستخدم',
            key: 'user',
            render: (_: unknown, record: DashboardProps['recentUsers'][0]) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar
                        style={{
                            backgroundColor: '#1d4ed8',
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
                        <div
                            style={{
                                fontSize: 12,
                                color: '#64748b',
                                direction: 'ltr',
                                textAlign: 'right',
                            }}
                        >
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'حالة الحساب',
            key: 'status',
            render: (_: unknown, record: DashboardProps['recentUsers'][0]) => (
                <Tag
                    color={record.email_verified_at ? 'success' : 'warning'}
                    style={{
                        borderRadius: 12,
                        padding: '2px 10px',
                        fontSize: 12,
                        fontWeight: 500,
                    }}
                >
                    {record.email_verified_at ? 'مفعّل ونشط' : 'قيد التحقق'}
                </Tag>
            ),
        },
        {
            title: 'تاريخ التسجيل',
            dataIndex: 'created_at',
            key: 'created_at',
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
    ];

    return (
        <>
            <Head title="لوحة القيادة والمخزون" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Hero Welcome Banner */}
                <div
                    style={{
                        background:
                            'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        borderRadius: 16,
                        padding: isMobile ? '20px 16px' : '28px 32px',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 8,
                            }}
                        >
                            <SafetyCertificateFilled
                                style={{ color: '#60a5fa', fontSize: 18 }}
                            />
                            <span
                                style={{
                                    fontSize: 13,
                                    color: '#94a3b8',
                                    letterSpacing: 0.5,
                                }}
                            >
                                نظام إيجلز المركزي لإدارة المستودعات
                            </span>
                        </div>
                        <Title
                            level={isMobile ? 3 : 2}
                            style={{
                                color: '#ffffff',
                                margin: 0,
                                fontWeight: 700,
                            }}
                        >
                            مرحباً بك في لوحة القيادة والتحكم
                        </Title>
                        <Text
                            style={{
                                color: '#cbd5e1',
                                fontSize: 14,
                                marginTop: 6,
                                display: 'block',
                            }}
                        >
                            نظرة شاملة ومباشرة على مؤشرات المخزون والمستودعات
                            والمستخدمين المسجلين في النظام.
                        </Text>
                    </div>

                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <Link href="/users" style={{ width: isMobile ? '100%' : 'auto' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<UserAddOutlined />}
                                style={{
                                    backgroundColor: '#1d4ed8',
                                    fontWeight: 600,
                                    borderRadius: 10,
                                    height: 44,
                                    width: isMobile ? '100%' : 'auto',
                                    boxShadow:
                                        '0 4px 14px rgba(29, 78, 216, 0.4)',
                                }}
                            >
                                إدارة المستخدمين
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Primary Metric KPI Cards */}
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 14,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 18px' : '20px 24px' } }}
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
                                        إجمالي المستخدمين
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.2,
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.users_count}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: '#059669',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <CheckCircleFilled />
                                        <span>حسابات النظام المسجلة</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 12,
                                        backgroundColor: '#eff6ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#1d4ed8',
                                        fontSize: 24,
                                    }}
                                >
                                    <TeamOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 14,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 18px' : '20px 24px' } }}
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
                                        المستودعات النشطة
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.2,
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.warehouses_count}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: '#2563eb',
                                        }}
                                    >
                                        <span>مواقع تخزين مركزية وفرعية</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 12,
                                        backgroundColor: '#f0fdf4',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#059669',
                                        fontSize: 24,
                                    }}
                                >
                                    <AppstoreOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 14,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 18px' : '20px 24px' } }}
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
                                        فواتير التوريد
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.2,
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.purchase_invoices_count}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: '#d97706',
                                        }}
                                    >
                                        <span>إجمالي فواتير الشراء</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 12,
                                        backgroundColor: '#fffbeb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#d97706',
                                        fontSize: 24,
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
                                borderRadius: 14,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 18px' : '20px 24px' } }}
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
                                        أذونات الصرف
                                    </Text>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                            lineHeight: 1.2,
                                            marginTop: 4,
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {stats.dispatch_vouchers_count}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            color: '#7c3aed',
                                        }}
                                    >
                                        <span>حركات الصرف المعتمدة</span>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 12,
                                        backgroundColor: '#faf5ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#7c3aed',
                                        fontSize: 24,
                                    }}
                                >
                                    <InboxOutlined />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Main Content Split: Recent Users Table & Warehouse Operational Pulse */}
                <Row gutter={[20, 20]}>
                    {/* Left: Recent Users Directory Table (65%) */}
                    <Col xs={24} xl={16}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 14px' : '24px' } }}
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
                                <div>
                                    <Title
                                        level={4}
                                        style={{
                                            margin: 0,
                                            fontWeight: 700,
                                            color: '#0f172a',
                                        }}
                                    >
                                        أحدث المستخدمين المسجلين
                                    </Title>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 13 }}
                                    >
                                        قائمة بآخر الحسابات المضافة للنظام وحالة
                                        التفعيل
                                    </Text>
                                </div>

                                <Link href="/users">
                                    <Button
                                        type="link"
                                        icon={<ArrowLeftOutlined />}
                                        style={{
                                            fontWeight: 600,
                                            color: '#1d4ed8',
                                            padding: 0,
                                        }}
                                    >
                                        عرض كافة المستخدمين
                                    </Button>
                                </Link>
                            </div>

                            <Table
                                rowKey="id"
                                columns={userColumns}
                                dataSource={recentUsers}
                                pagination={false}
                                size={isMobile ? 'small' : 'middle'}
                                scroll={{ x: 'max-content' }}
                            />
                        </Card>
                    </Col>

                    {/* Right: Operational Status & Warehouse Readiness (35%) */}
                    <Col xs={24} xl={8}>
                        <Card
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                borderColor: '#e2e8f0',
                                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                            }}
                            styles={{ body: { padding: isMobile ? '16px 14px' : '24px' } }}
                        >
                            <Title
                                level={4}
                                style={{
                                    margin: 0,
                                    fontWeight: 700,
                                    color: '#0f172a',
                                }}
                            >
                                جاهزية المستودع والرقابة
                            </Title>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: 13,
                                    display: 'block',
                                    marginBottom: 20,
                                }}
                            >
                                الحالة التشغيلية لمستودعات إيجلز
                            </Text>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 18,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                color: '#334155',
                                            }}
                                        >
                                            سعة التخزين المستغلة
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: '#1d4ed8',
                                                fontWeight: 600,
                                            }}
                                        >
                                            68%
                                        </Text>
                                    </div>
                                    <Progress
                                        percent={68}
                                        strokeColor="#1d4ed8"
                                        showInfo={false}
                                    />
                                </div>

                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                color: '#334155',
                                            }}
                                        >
                                            دقة الجرد والتسويات
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: '#059669',
                                                fontWeight: 600,
                                            }}
                                        >
                                            98.4%
                                        </Text>
                                    </div>
                                    <Progress
                                        percent={98.4}
                                        strokeColor="#059669"
                                        showInfo={false}
                                    />
                                </div>

                                <div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                color: '#334155',
                                            }}
                                        >
                                            معدل توثيق أذون الصرف
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: '#7c3aed',
                                                fontWeight: 600,
                                            }}
                                        >
                                            92%
                                        </Text>
                                    </div>
                                    <Progress
                                        percent={92}
                                        strokeColor="#7c3aed"
                                        showInfo={false}
                                    />
                                </div>

                                <div
                                    style={{
                                        marginTop: 10,
                                        padding: '16px',
                                        backgroundColor: '#f8fafc',
                                        borderRadius: 12,
                                        border: '1px solid #e2e8f0',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            marginBottom: 6,
                                        }}
                                    >
                                        <CheckCircleFilled
                                            style={{
                                                color: '#059669',
                                                fontSize: 16,
                                            }}
                                        />
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                color: '#0f172a',
                                            }}
                                        >
                                            حالة خوادم وقواعد البيانات
                                        </Text>
                                    </div>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 12,
                                            lineHeight: 1.5,
                                            display: 'block',
                                        }}
                                    >
                                        جميع الخدمات اللوجستية وقواعد بيانات
                                        الجرد تعمل بكفاءة تامة بدون أي انقطاع.
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}
