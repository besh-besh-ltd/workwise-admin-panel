import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { addProductVariant } from '../../utils/services/product-management';

const AddProductVariantModal = ({ isVisible, onCancel, productId, productName, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      form.resetFields();
    }
  }, [isVisible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Add product ID to the form values
      values.product_id = productId;

      const response = await addProductVariant(values);
      
      if (response?.data?.status === 1) {
        message.success('Product variant added successfully');
        form.resetFields();
        onSuccess && onSuccess(response.data.data);
        onCancel();
      } else {
        message.error(response?.data?.message || 'Failed to add product variant');
      }
    } catch (error) {
      console.error('Error adding product variant:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to add product variant');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Product Variant"
      visible={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Add Variant
        </Button>
      ]}
    >
      <div className="mb-4">
        <p className="mb-1 font-medium">Product:</p>
        <p>{productName}</p>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          variant_name: ''
        }}
      >
        <Form.Item
          name="variant_name"
          label="Variant Name"
          rules={[
            { required: true, message: 'Please enter variant name' },
            { max: 100, message: 'Variant name can be at most 100 characters' }
          ]}
        >
          <Input placeholder="Enter variant name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductVariantModal; 