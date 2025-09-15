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
  Badge
} from 'antd';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  ProjectOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { projectsAPI } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { fetchAgents } from '../store/agentsSlice';
import { fetchCustomers, getCustomerStatusCounts } from '../store/customersSlice';
import { setPagination as setAgentsPagination, setFilters as setAgentsFilters } from '../store/agentsSlice';
import { setPagination as setCustomersPagination } from '../store/customersSlice';
import AgentManagement from './AgentManagement';
import CustomerManagement from './CustomerManagement';
import ProjectManagement from './ProjectManagement';
import UserProfile from './UserProfile';
import SettingsPage from './SettingsPage';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { customerStatusCounts } = useSelector((state) => state.customers);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  
  const [stats, setStats] = useState({
    totalAgents: 0,
    pendingAgents: 0,
    totalCustomers: 0,
    pendingCustomers: 0,
    totalProjects: 0,
    approvedCustomers: 0,
    rejectedCustomers: 0,
    approvedAgents: 0,
    rejectedAgents: 0,
    activeProjects: 0,
    inactiveProjects: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Fetch all stats in parallel
        const [pendingAgentsResult, totalAgentsResult, totalCustomersResult, pendingCustomersResult, totalProjectsResult, approvedCustomersResult, rejectedCustomersResult, approvedAgentsResult, rejectedAgentsResult, activeProjectsResult, inactiveProjectsResult] = await Promise.all([
          dispatch(fetchAgents({ status: 'pending', limit: 1 })).unwrap(),
          dispatch(fetchAgents({ limit: 1 })).unwrap(),
          dispatch(fetchCustomers({ limit: 1 })).unwrap(),
          dispatch(fetchCustomers({ status: 'pending', limit: 1 })).unwrap(),
          projectsAPI.getAll({ limit: 1 }),
          dispatch(fetchCustomers({ status: 'approved', limit: 1 })).unwrap(),
          dispatch(fetchCustomers({ status: 'rejected', limit: 1 })).unwrap(),
          dispatch(fetchAgents({ status: 'active', limit: 1 })).unwrap(), // Assuming 'active' is equivalent to 'approved' for agents
          dispatch(fetchAgents({ status: 'inactive', limit: 1 })).unwrap(), // Assuming 'inactive' is equivalent to 'rejected' for agents
          projectsAPI.getAll({ status: 'active', limit: 1 }),
          projectsAPI.getAll({ status: 'inactive', limit: 1 }),
        ]);

        setStats({
          pendingAgents: pendingAgentsResult.pagination?.total || 0,
          totalAgents: totalAgentsResult.pagination?.total || 0,
          totalCustomers: totalCustomersResult.pagination?.total || 0,
          pendingCustomers: pendingCustomersResult.pagination?.total || 0,
          totalProjects: totalProjectsResult.pagination?.total || 0,
          approvedCustomers: approvedCustomersResult.pagination?.total || 0,
          rejectedCustomers: rejectedCustomersResult.pagination?.total || 0,
          approvedAgents: approvedAgentsResult.pagination?.total || 0,
          rejectedAgents: rejectedAgentsResult.pagination?.total || 0,
          activeProjects: activeProjectsResult.pagination?.total || 0,
          inactiveProjects: inactiveProjectsResult.pagination?.total || 0,
        });

      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    if (selectedMenu === 'dashboard') {
      fetchDashboardStats();
      dispatch(getCustomerStatusCounts());
    }
  }, [dispatch, selectedMenu]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleMenuSelect = ({ key }) => {
    // Reset pagination when navigating to specific pages
    if (key === 'agents') {
      dispatch(setAgentsPagination({ current: 1, pageSize: 10 }));
    }
    if (key === 'customers') {
      dispatch(setCustomersPagination({ current: 1, pageSize: 10 }));
    }
    setSelectedMenu(key);
  };

  const handleViewAllAgents = () => {
    dispatch(setAgentsFilters({ status: 'all', search: '' }));
    handleMenuSelect({ key: 'agents' });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'โปรไฟล์',
      onClick: () => setSelectedMenu('profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'ตั้งค่า',
      onClick: () => setSelectedMenu('settings'),
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
      key: 'agents',
      icon: <TeamOutlined />,
      label: 'จัดการเอเจนต์',
    },
    {
      key: 'customers',
      icon: <UsergroupAddOutlined />,
      label: 'จัดการลูกค้า',
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'จัดการโครงการ',
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'รายงาน',
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'dashboard':
        return (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={12} lg={6}>
                <Card title="สถานะเอเจนต์">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'รออนุมัติ', value: stats.pendingAgents },
                          { name: 'ผ่าน', value: stats.approvedAgents },
                          { name: 'ไม่ผ่าน', value: stats.rejectedAgents },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="cell-0" fill="#ffc658" /> {/* Pending */}
                        <Cell key="cell-1" fill="#82ca9d" /> {/* Approved */}
                        <Cell key="cell-2" fill="#ff7300" /> {/* Rejected */}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card title="สถานะลูกค้า">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'รออนุมัติ', value: customerStatusCounts.pending || 0 },
                          { name: 'ผ่าน', value: customerStatusCounts.approved || 0 },
                          { name: 'ไม่ผ่าน', value: customerStatusCounts.rejected || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="cell-0" fill="#ffc658" /> {/* Pending */}
                        <Cell key="cell-1" fill="#82ca9d" /> {/* Approved */}
                        <Cell key="cell-2" fill="#ff7300" /> {/* Rejected */}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card title="สถานะโครงการ">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'ใช้งาน', value: stats.activeProjects },
                          { name: 'ไม่ใช้งาน', value: stats.inactiveProjects },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="cell-0" fill="#82ca9d" /> {/* Active */}
                        <Cell key="cell-1" fill="#ff7300" /> {/* Inactive */}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="เอเจนต์ทั้งหมด"
                    value={stats.totalAgents}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={handleViewAllAgents}
                    >
                      ดูรายละเอียด →
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="เอเจนต์รออนุมัติ"
                    value={stats.pendingAgents}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleMenuSelect({ key: 'agents' })}
                    >
                      ดูรายละเอียด →
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="ลูกค้าทั้งหมด"
                    value={stats.totalCustomers}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleMenuSelect({ key: 'customers' })}
                    >
                      ดูรายละเอียด →
                    </Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="ลูกค้ารออนุมัติ"
                    value={stats.pendingCustomers}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                   <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleMenuSelect({ key: 'customers' })}
                    >
                      ดูรายละเอียด →
                    </Button>
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card>
                  <Statistic
                    title="โครงการทั้งหมด"
                    value={stats.totalProjects}
                    valueStyle={{ color: '#0050b3' }} // A new color for projects
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => handleMenuSelect({ key: 'projects' })}
                    >
                      ดูรายละเอียด →
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Card title="กิจกรรมล่าสุด" style={{ marginBottom: '24px' }}>
              <Text type="secondary">ยังไม่มีข้อมูลกิจกรรม</Text>
            </Card>
          </div>
        );
      case 'agents':
        return <AgentManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'profile':
        return <UserProfile />;
      case 'settings':
        return <SettingsPage />;
      case 'reports':
        return (
          <Card title="รายงาน">
            <Text type="secondary">หน้ารายงาน - กำลังพัฒนา</Text>
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
              SENA Agent
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          items={menuItems}
          onSelect={handleMenuSelect}
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
            <Badge count={stats.pendingAgents + stats.pendingCustomers}>
              <Button type="text" icon={<BellOutlined />} size="large" />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Text strong>{user?.email}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'เอเจนต์'}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: (selectedMenu === 'agents' || selectedMenu === 'customers' || selectedMenu === 'profile' || selectedMenu === 'settings') ? '0' : '24px', 
          padding: (selectedMenu === 'agents' || selectedMenu === 'customers' || selectedMenu === 'profile' || selectedMenu === 'settings') ? '0' : '24px',
          background: (selectedMenu === 'agents' || selectedMenu === 'customers' || selectedMenu === 'profile' || selectedMenu === 'settings') ? '#f0f2f5' : '#fff',
          borderRadius: (selectedMenu === 'agents' || selectedMenu === 'customers') ? '0' : '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;