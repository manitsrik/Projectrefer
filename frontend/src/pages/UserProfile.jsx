import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Avatar, Typography, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Card>ไม่พบข้อมูลผู้ใช้</Card>;
  }

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>
      <Card style={{ maxWidth: 600, margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={96} icon={<UserOutlined />} />
          <Title level={3} style={{ marginTop: 16 }}>{user.email}</Title>
          <Text type="secondary" style={{ textTransform: 'capitalize' }}>
            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เอเจนต์'}
          </Text>
        </div>
        <Descriptions title="ข้อมูลผู้ใช้" bordered column={1}>
          <Descriptions.Item label="อีเมล">{user.email}</Descriptions.Item>
          <Descriptions.Item label="บทบาท">{user.role}</Descriptions.Item>
          <Descriptions.Item label="สถานะ">ใช้งาน</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default UserProfile;
