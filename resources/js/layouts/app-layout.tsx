import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Button,
    Dropdown,
    Avatar,
    Typography,
    Drawer,
    App as AntdApp,
} from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    ShopOutlined,
    ApartmentOutlined,
    IdcardOutlined,
    FolderOpenOutlined,
    ColumnWidthOutlined,
    BarcodeOutlined,
    ContactsOutlined,
    ShoppingOutlined,
    InboxOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    UserOutlined,
    SafetyCertificateOutlined,
    CheckCircleFilled,
    CloseOutlined,
} from '@ant-design/icons';
import { Link, router, usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

interface SharedPageProps {
    auth: {
        user?: {
            id: number;
            name: string;
            email: string;
        } | null;
    };
    flash?: {
        success?: string | null;
        error?: string | null;
    };
    [key: string]: unknown;
}

export default function AppLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const isMobile = useIsMobile();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const { url } = usePage();
    const { props } = usePage<SharedPageProps>();
    const user = props.auth?.user;
    const flash = props.flash;
    const { message } = AntdApp.useApp();

    useEffect(() => {
        const removeListener = router.on('navigate', () => {
            setMobileDrawerOpen(false);
        });
        return () => removeListener();
    }, []);

    useEffect(() => {
        if (flash?.success) {
            message.success(flash.success);
        }
        if (flash?.error) {
            message.error(flash.error);
        }
    }, [flash, message]);

    const getActiveKey = () => {
        if (url.startsWith('/purchase-invoices')) return '/purchase-invoices';
        if (url.startsWith('/dispatch-vouchers')) return '/dispatch-vouchers';
        if (url.startsWith('/users')) return '/users';
        if (url.startsWith('/warehouses')) return '/warehouses';
        if (url.startsWith('/sectors')) return '/sectors';
        if (url.startsWith('/employees')) return '/employees';
        if (url.startsWith('/item-categories')) return '/item-categories';
        if (url.startsWith('/units')) return '/units';
        if (url.startsWith('/items')) return '/items';
        if (url.startsWith('/suppliers')) return '/suppliers';
        return '/dashboard';
    };

    const activeKey = getActiveKey();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: <Link href="/dashboard">لوحة القيادة</Link>,
        },
        {
            key: '/users',
            icon: <TeamOutlined />,
            label: <Link href="/users">المستخدمين والصلاحيات</Link>,
        },
        {
            type: 'divider' as const,
        },
        {
            key: '/warehouses',
            icon: <ShopOutlined />,
            label: <Link href="/warehouses">المستودعات</Link>,
        },
        {
            key: '/sectors',
            icon: <ApartmentOutlined />,
            label: <Link href="/sectors">الأقسام والقطاعات</Link>,
        },
        {
            key: '/employees',
            icon: <IdcardOutlined />,
            label: <Link href="/employees">الموظفين والمستلمين</Link>,
        },
        {
            type: 'divider' as const,
        },
        {
            key: '/item-categories',
            icon: <FolderOpenOutlined />,
            label: <Link href="/item-categories">تصنيفات الأصناف</Link>,
        },
        {
            key: '/units',
            icon: <ColumnWidthOutlined />,
            label: <Link href="/units">وحدات القياس</Link>,
        },
        {
            key: '/items',
            icon: <BarcodeOutlined />,
            label: <Link href="/items">الأصناف والمخزون</Link>,
        },
        {
            key: '/suppliers',
            icon: <ContactsOutlined />,
            label: <Link href="/suppliers">الموردين المعتمدين</Link>,
        },
        {
            type: 'divider' as const,
        },
        {
            key: '/purchase-invoices',
            icon: <ShoppingOutlined />,
            label: <Link href="/purchase-invoices">فواتير التوريد</Link>,
        },
        {
            key: '/dispatch-vouchers',
            icon: <InboxOutlined />,
            label: <Link href="/dispatch-vouchers">أذونات الصرف</Link>,
        },
    ];

    const userDropdownItems = [
        {
            key: 'user-info',
            label: (
                <div style={{ padding: '4px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {user?.name || 'مستخدم النظام'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                        {user?.email}
                    </div>
                </div>
            ),
            disabled: true,
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            danger: true,
            icon: <LogoutOutlined />,
            label: 'تسجيل الخروج',
            onClick: () => {
                router.post('/logout');
            },
        },
    ];

    return (
        <Layout
            dir="rtl"
            style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
        >
            {/* Desktop RTL Sidebar */}
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={250}
                    collapsedWidth={80}
                    style={{
                        backgroundColor: '#0f172a',
                        boxShadow: '-1px 0 0 0 rgba(255, 255, 255, 0.08) inset',
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto',
                        zIndex: 20,
                    }}
                >
                    {/* Logo Section */}
                    <div
                        style={{
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            padding: collapsed ? '0' : '0 20px',
                            gap: 12,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                backgroundColor: '#1d4ed8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: 18,
                                flexShrink: 0,
                            }}
                        >
                            <SafetyCertificateOutlined />
                        </div>
                        {!collapsed && (
                            <div
                                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                            >
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 15,
                                        color: '#f8fafc',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    إيجلز للمخزون
                                </div>
                                <div
                                    style={{
                                        fontSize: 10,
                                        color: '#94a3b8',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    EAGLES INVENTORY
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sider Menu */}
                    <div style={{ padding: '12px 8px' }}>
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={[activeKey]}
                            items={menuItems}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                    </div>
                </Sider>
            )}

            {/* Mobile Navigation Drawer */}
            {isMobile && (
                <Drawer
                    placement="right"
                    open={mobileDrawerOpen}
                    onClose={() => setMobileDrawerOpen(false)}
                    width={280}
                    closable={false}
                    styles={{
                        body: {
                            padding: 0,
                            backgroundColor: '#0f172a',
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                        },
                    }}
                >
                    {/* Drawer Logo Section */}
                    <div
                        style={{
                            height: 64,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    backgroundColor: '#1d4ed8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ffffff',
                                    fontSize: 17,
                                    flexShrink: 0,
                                }}
                            >
                                <SafetyCertificateOutlined />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 14,
                                        color: '#f8fafc',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    إيجلز للمخزون
                                </div>
                                <div
                                    style={{
                                        fontSize: 9,
                                        color: '#94a3b8',
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    EAGLES INVENTORY
                                </div>
                            </div>
                        </div>
                        <Button
                            type="text"
                            icon={<CloseOutlined style={{ color: '#94a3b8', fontSize: 16 }} />}
                            onClick={() => setMobileDrawerOpen(false)}
                        />
                    </div>

                    {/* Drawer Navigation Menu */}
                    <div style={{ padding: '12px 8px', flex: 1, overflowY: 'auto' }}>
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={[activeKey]}
                            items={menuItems}
                            onClick={() => setMobileDrawerOpen(false)}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                            }}
                        />
                    </div>
                </Drawer>
            )}

            <Layout style={{ backgroundColor: '#f8fafc', minWidth: 0 }}>
                {/* Header */}
                <Header
                    style={{
                        padding: isMobile ? '0 14px' : '0 24px',
                        background: '#ffffff',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        height: 64,
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 8 : 16,
                            overflow: 'hidden',
                        }}
                    >
                        <Button
                            type="text"
                            icon={
                                isMobile ? (
                                    <MenuUnfoldOutlined />
                                ) : collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() => {
                                if (isMobile) {
                                    setMobileDrawerOpen(true);
                                } else {
                                    setCollapsed(!collapsed);
                                }
                            }}
                            style={{
                                fontSize: 18,
                                width: 38,
                                height: 38,
                                color: '#334155',
                                flexShrink: 0,
                            }}
                        />

                        {/* Breadcrumbs or Title */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: isMobile ? 13 : 14,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {!isMobile && (
                                <Link
                                    href="/dashboard"
                                    style={{
                                        color: '#64748b',
                                        textDecoration: 'none',
                                    }}
                                >
                                    الرئيسية
                                </Link>
                            )}
                            {breadcrumbs.length > 0 ? (
                                isMobile ? (
                                    <span
                                        style={{
                                            color: '#0f172a',
                                            fontWeight: 600,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {breadcrumbs[breadcrumbs.length - 1].title}
                                    </span>
                                ) : (
                                    breadcrumbs.map((crumb, idx) => (
                                        <React.Fragment key={idx}>
                                            <span style={{ color: '#cbd5e1' }}>
                                                /
                                            </span>
                                            {crumb.href ? (
                                                <Link
                                                    href={crumb.href}
                                                    style={{
                                                        color: '#64748b',
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    {crumb.title}
                                                </Link>
                                            ) : (
                                                <span
                                                    style={{
                                                        color: '#0f172a',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {crumb.title}
                                                </span>
                                            )}
                                        </React.Fragment>
                                    ))
                                )
                            ) : isMobile ? (
                                <span
                                    style={{
                                        color: '#0f172a',
                                        fontWeight: 600,
                                    }}
                                >
                                    الرئيسية
                                </span>
                            ) : null}
                        </div>
                    </div>

                    {/* Right / Header Controls */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? 10 : 18,
                            flexShrink: 0,
                        }}
                    >
                        {/* Live Warehouse Badge (Desktop only) */}
                        {!isMobile && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    backgroundColor: '#f1f5f9',
                                    padding: '4px 12px',
                                    borderRadius: 20,
                                    fontSize: 13,
                                    color: '#334155',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <CheckCircleFilled
                                    style={{ color: '#059669', fontSize: 12 }}
                                />
                                <span>نظام إدارة المستودعات المركزي</span>
                            </div>
                        )}

                        {/* User Profile Dropdown */}
                        <Dropdown
                            menu={{ items: userDropdownItems }}
                            placement="bottomLeft"
                            trigger={['click']}
                        >
                            <Button
                                type="text"
                                style={{
                                    height: 44,
                                    padding: isMobile ? '0 4px' : '0 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: isMobile ? 0 : 10,
                                    borderRadius: 8,
                                }}
                            >
                                <Avatar
                                    style={{
                                        backgroundColor: '#1d4ed8',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                    }}
                                >
                                    {user?.name ? (
                                        user.name.charAt(0).toUpperCase()
                                    ) : (
                                        <UserOutlined />
                                    )}
                                </Avatar>
                                {!isMobile && (
                                    <div
                                        style={{
                                            textAlign: 'right',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <Text
                                            strong
                                            style={{
                                                fontSize: 13,
                                                color: '#0f172a',
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            {user?.name || 'المستخدم'}
                                        </Text>
                                        <Text
                                            type="secondary"
                                            style={{
                                                fontSize: 11,
                                                lineHeight: 1.2,
                                            }}
                                        >
                                            مدير النظام
                                        </Text>
                                    </div>
                                )}
                            </Button>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        padding: isMobile ? '16px 12px' : '24px 28px',
                        minHeight: 'calc(100vh - 64px)',
                        backgroundColor: '#f8fafc',
                        width: '100%',
                        maxWidth: '100%',
                        overflowX: 'hidden',
                    }}
                >
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
}
