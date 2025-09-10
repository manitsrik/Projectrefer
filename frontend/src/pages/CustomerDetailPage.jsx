import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, notification, Row, Col, Descriptions, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api'; // Assuming an api service exists

const { Title, Text } = Typography;

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      console.log('Fetching customer details for ID:', id); // Log the ID
      try {
        setLoading(true);
        const response = await api.get(`/customers/${id}`);
        console.log('API Response for customer details:', response); // Log the full response
        if (response.success) {
          setCustomer(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch customer details');
        }
      } catch (err) {
        setError(err);
        console.error('Error fetching customer details:', err); // Log the error
        notification.error({
          message: 'Error',
          description: err.message || 'Could not load customer details.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCustomerDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="large" tip="Loading customer details..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Customer Details">
        <Text type="danger">Error: {error.message}</Text>
        <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>
          <ArrowLeftOutlined /> Back
        </Button>
      </Card>
    );
  }

  if (!customer) {
    return (
      <Card title="Customer Details">
        <Text>No customer found.</Text>
        <Button type="primary" onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>
          <ArrowLeftOutlined /> Back
        </Button>
      </Card>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0 }}>Customer Details: {customer.firstName} {customer.lastName}</Title>
          <Button type="primary" onClick={() => navigate(-1)}>
            <ArrowLeftOutlined /> Back
          </Button>
        </div>
      }
    >
      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
        <Descriptions.Item label="Customer Code">{customer.customerCode}</Descriptions.Item>
        <Descriptions.Item label="First Name">{customer.firstName}</Descriptions.Item>
        <Descriptions.Item label="Last Name">{customer.lastName}</Descriptions.Item>
        <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{customer.phone}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={customer.status === 'active' ? 'green' : 'red'}>
            {customer.status === 'active' ? 'Active' : 'Inactive'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Registration Date">
          {new Date(customer.registrationDate).toLocaleDateString('th-TH')}
        </Descriptions.Item>
        {/* Add more customer details here as needed */}
      </Descriptions>
    </Card>
  );
};

export default CustomerDetailPage;