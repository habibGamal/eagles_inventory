import React from 'react';
import { Card, Typography, Radio } from 'antd';
import { Head } from '@inertiajs/react';

const { Title, Text } = Typography;

export default function Appearance() {
    return (
        <>
            <Head title="المظهر" />

            <div style={{ maxWidth: 700, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <Title
                        level={3}
                        style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}
                    >
                        إعدادات المظهر
                    </Title>
                    <Text type="secondary">
                        تخصيص مظهر واجهة نظام إيجلز للمخزون
                    </Text>
                </div>

                <Card variant="outlined" style={{ borderRadius: 12 }}>
                    <Radio.Group defaultValue="light" size="large">
                        <Radio.Button value="light">
                            الوضع الفاتح (الافتراضي)
                        </Radio.Button>
                        <Radio.Button value="dark" disabled>
                            الوضع الداكن (قريباً)
                        </Radio.Button>
                        <Radio.Button value="system" disabled>
                            حسب النظام
                        </Radio.Button>
                    </Radio.Group>
                </Card>
            </div>
        </>
    );
}
