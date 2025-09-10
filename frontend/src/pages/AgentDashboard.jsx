import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Space,
  Badge,
  Table,
  Tag,
  Form,
  Input,
  notification,
  Modal
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  UsergroupAddOutlined,
  ProfileOutlined,
  BellOutlined,
  TeamOutlined,
  EditOutlined,
  SaveOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, updateUser } from '../store/authSlice';
import { fetchCustomers } from '../store/customersSlice';
import { useNavigate } from 'react-router-dom';
import CustomerFormPage from './CustomerFormPage';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { customers, loading: customersLoading } = useSelector((state) => state.customers);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] = useState(false);
  const [isCustomerDetailModalVisible, setIsCustomerDetailModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Load agent's customers on component mount
  useEffect(() => {
    if (user?.agentId) {
      dispatch(fetchCustomers({
        agentId: user.agentId,
        status: 'all',
        page: 1,
        limit: 100
      }));
    }
  }, [dispatch, user?.agentId]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    profileForm.setFieldsValue({
      phone: user?.phone || ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    profileForm.resetFields();
  };

  const handleUpdateProfile = async (values) => {
    setLoading(true);
    try {
      // Call API to update profile
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agents/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (data.success) {
        notification.success({
          message: 'สำเร็จ',
          description: 'อัพเดทเบอร์โทรสำเร็จ'
        });
        setIsEditingProfile(false);
        // Update user data in Redux store
        dispatch(updateUser(data.data));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถอัพเดทเบอร์โทรได้'
      });
    } finally {
      setLoading(false);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'ออกจากระบบ',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'แดชบอร์ด',
    },
    {
      key: 'customers',
      icon: <UsergroupAddOutlined />,
      label: 'ลูกค้าของฉัน',
    },
    {
      key: 'profile',
      icon: <ProfileOutlined />,
      label: 'ข้อมูลส่วนตัว',
    },
  ];

  // Filter customers for current agent
  const myCustomers = customers.filter(customer => 
    customer.agentId === user?.agentId
  ).map(customer => ({
    key: customer.id,
    id: customer.id,
    customerCode: customer.customerCode,
    firstName: customer.firstName,
    lastName: customer.lastName,
    name: `${customer.firstName} ${customer.lastName}`,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    registrationDate: customer.registrationDate,
    projectInterest: customer.projectInterest
  }));

  const customerColumns = [
    {
      title: 'รหัสลูกค้า',
      dataIndex: 'customerCode',
      key: 'customerCode',
      render: (text, record) => (
        <Tag 
          color="green" 
          onClick={() => {
            setSelectedCustomer(record);
            setIsCustomerDetailModalVisible(true);
          }}
          style={{ cursor: 'pointer' }}
        >
          {text}
        </Tag>
      )
    },
    {
      title: 'ชื่อ-นามสกุล',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'อีเมล',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'โครงการที่สนใจ',
      dataIndex: 'projectInterest',
      key: 'projectInterest',
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </Tag>
      )
    },
    {
      title: 'วันที่ลงทะเบียน',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      render: (date) => new Date(date).toLocaleDateString('th-TH')
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              console.log("Selected Customer:", record);
              setSelectedCustomer(record);
              setIsCustomerDetailModalVisible(true);
            }}
          >
            ดูรายละเอียด
          </Button>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="ลูกค้าทั้งหมด"
                    value={myCustomers.length}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="ลูกค้าใช้งาน"
                    value={myCustomers.filter(c => c.status === 'active').length}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Card>
                  <Statistic
                    title="ยอดขายเดือนนี้"
                    value={0}
                    suffix="บาท"
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card title="ลูกค้าล่าสุด" style={{ marginBottom: '24px' }}>
              <Table 
                dataSource={myCustomers} 
                columns={customerColumns}
                pagination={false}
                size="small"
                loading={customersLoading}
                locale={{
                  emptyText: 'ยังไม่มีลูกค้า'
                }}
              />
            </Card>
          </div>
        );
      case 'customers':
        return (
          <Card title="ลูกค้าของฉัน">
            <Row justify="end" style={{ marginBottom: '16px' }}>
              <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddCustomerModalVisible(true)}>
                  เพิ่มลูกค้า
                </Button>
              </Col>
            </Row>
            <Table 
              dataSource={myCustomers} 
              columns={customerColumns}
              loading={customersLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} จาก ${total} รายการ`,
              }}
              locale={{
                emptyText: 'ยังไม่มีลูกค้าที่รับผิดชอบ'
              }}
            />
          </Card>
        );
      case 'profile':
        return (
          <Card 
            title="ข้อมูลส่วนตัว"
            extra={
              !isEditingProfile && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                >
                  แก้ไขเบอร์โทร
                </Button>
              )
            }
          >
            {!isEditingProfile ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text strong>รหัสเอเจนต์:</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user?.agentCode}</Text>
                    </div>
                    <div>
                      <Text strong>ชื่อ:</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user?.firstName}</Text>
                    </div>
                    <div>
                      <Text strong>นามสกุล:</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user?.lastName}</Text>
                    </div>
                    <div>
                      <Text strong>อีเมล:</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user?.email}</Text>
                    </div>
                    <div>
                      <Text strong>เบอร์โทร:</Text>
                      <br />
                      <Text style={{ fontSize: '16px' }}>{user?.phone || '-'}</Text>
                    </div>
                    <div>
                      <Text strong>สถานะ:</Text>
                      <br />
                      <Tag color="green" style={{ fontSize: '14px' }}>
                        ใช้งาน
                      </Tag>
                    </div>
                  </Space>
                </Col>
              </Row>
            ) : (
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleUpdateProfile}
                style={{ maxWidth: '600px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="รหัสเอเจนต์"
                    >
                      <Input value={user?.agentCode} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="อีเมล"
                    >
                      <Input value={user?.email} disabled />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="ชื่อ"
                    >
                      <Input value={user?.firstName} disabled />
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        * ติดต่อผู้ดูแลระบบเพื่อแก้ไข
                      </div>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="นามสกุล"
                    >
                      <Input value={user?.lastName} disabled />
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        * ติดต่อผู้ดูแลระบบเพื่อแก้ไข
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  name="phone"
                  label="เบอร์โทร (สามารถแก้ไขได้)"
                  rules={[
                    { pattern: /^[0-9-]+$/, message: 'เบอร์โทรควรเป็นตัวเลขและขีดกลางเท่านั้น' }
                  ]}
                >
                  <Input placeholder="081-234-5678" />
                </Form.Item>
                
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                  <Space>
                    <Button onClick={handleCancelEdit}>
                      ยกเลิก
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      บันทึกเบอร์โทร
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: '64px', 
          padding: '16px', 
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          {!collapsed && (
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              <TeamOutlined style={{ marginRight: '8px' }} />
              ระบบตัวแทน
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onSelect={({ key }) => setSelectedMenu(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          </Space>
          
          <Space size="middle">
            <Badge count={0}>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.firstName} {user?.lastName}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.agentCode} - เอเจนต์
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px', 
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>

      <Modal
        title="เพิ่มลูกค้าใหม่"
        open={isAddCustomerModalVisible}
        onCancel={() => setIsAddCustomerModalVisible(false)}
        footer={null}
        width={800}
      >
        <CustomerFormPage 
            isModal={true} 
            onFinish={() => {
              setIsAddCustomerModalVisible(false);
              dispatch(fetchCustomers({
                agentId: user.agentId,
                status: 'all',
                page: 1,
                limit: 100
              }));
            }} 
            agentId={user?.agentId} 
        />
      </Modal>

      <Modal
        title="รายละเอียดลูกค้า"
        open={isCustomerDetailModalVisible}
        onCancel={() => {
          setIsCustomerDetailModalVisible(false);
          setSelectedCustomer(null);
        }}
        footer={null}
        width={700}
      >
        {selectedCustomer && (
          <Card bordered={false}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>รหัสลูกค้า:</Text>
                <p>{selectedCustomer.customerCode}</p>
              </Col>
              <Col span={12}>
                <Text strong>ชื่อ-นามสกุล:</Text>
                <p>{selectedCustomer.name}</p>
              </Col>
              <Col span={12}>
                <Text strong>อีเมล:</Text>
                <p>{selectedCustomer.email}</p>
              </Col>
              <Col span={12}>
                <Text strong>เบอร์โทร:</Text>
                <p>{selectedCustomer.phone}</p>
              </Col>
              <Col span={12}>
                <Text strong>โครงการที่สนใจ:</Text>
                <p>{selectedCustomer.projectInterest}</p>
              </Col>
              <Col span={12}>
                <Text strong>สถานะ:</Text>
                <p>
                  <Tag color={selectedCustomer.status === 'active' ? 'green' : 'red'}>
                    {selectedCustomer.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <Text strong>วันที่ลงทะเบียน:</Text>
                <p>{new Date(selectedCustomer.registrationDate).toLocaleDateString('th-TH')}</p>
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
    </Layout>
  );
};

export default AgentDashboard;