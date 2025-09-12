import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const SettingsPage = () => {
  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>
      <Card>
        <Title level={3}>ตั้งค่าระบบ</Title>
        <p>หน้านี้สำหรับตั้งค่าการทำงานของระบบ ในขณะนี้ยังอยู่ในระหว่างการพัฒนา</p>
      </Card>
    </div>
  );
};

export default SettingsPage;
