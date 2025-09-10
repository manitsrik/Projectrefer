import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Typography, notification, Select, InputNumber, Row, Col } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CustomerFormPage = ({ agentId, isModal, onFinish: onFinishProp }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (agentId) {
      form.setFieldsValue({ agentId: agentId });
    }
  }, [agentId, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('/customers', values);
      if (response.data.success) {
        notification.success({
          message: 'สำเร็จ',
          description: 'เพิ่มลูกค้าสำเร็จแล้ว!',
        });
        if (isModal && onFinishProp) {
          onFinishProp();
        } else {
          navigate('/agent/dashboard');
        }
      } else {
        throw new Error(response.data.message || 'ไม่สามารถเพิ่มลูกค้าได้');
      }
    } catch (error) {
      notification.error({
        message: 'เกิดข้อผิดพลาด',
        description: error.message || 'ไม่สามารถเพิ่มลูกค้าได้',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        !isModal && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={4} style={{ margin: 0 }}>เพิ่มลูกค้าใหม่</Title>
            <Button type="primary" onClick={() => navigate(-1)}>
              <ArrowLeftOutlined /> กลับ
            </Button>
          </div>
        )
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: 'active', agentId: agentId }}
      >
        <Form.Item name="agentId" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="ชื่อจริง"
              rules={[{ required: true, message: 'กรุณากรอกชื่อจริง!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="นามสกุล"
              rules={[{ required: true, message: 'กรุณากรอกนามสกุล!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="อีเมล"
              rules={[{ required: true, message: 'กรุณากรอกอีเมล!' }, { type: 'email', message: 'กรุณากรอกอีเมลที่ถูกต้อง!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="เบอร์โทร"
              rules={[{ required: true, message: 'กรุณากรอกเบอร์โทร!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="idCardNumber"
          label="รหัสบัตรประชาชน"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="ที่อยู่"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="projectInterest"
              label="โครงการที่ลูกค้าสนใจ"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="budget"
              label="งบประมาณลูกค้า"
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="สถานะ"
          rules={[{ required: true, message: 'กรุณาเลือกสถานะ!' }]}
        >
          <Select>
            <Option value="active">ใช้งาน</Option>
            <Option value="inactive">ไม่ใช้งาน</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            เพิ่มลูกค้า
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CustomerFormPage;