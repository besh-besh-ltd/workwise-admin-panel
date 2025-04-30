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

      // Changes by Agnij April 30, 2025 [Fixed variant payload to match backend requirements]
      // Format the request payload with the correct field names
      const payload = {
        product_id: productId,
        variant_name: values.variant_name.trim() // This is what the form collects, ensure it's trimmed
      };
      
      console.log('Submitting variant:', payload);

      const response = await addProductVariant(payload);
      console.log('Variant response:', response);
      
      if (response?.data?.status === 1) {
        message.success('Product variant added successfully');
        form.resetFields();
        // Make sure we have the data needed for onSuccess
        const successData = {
          ...response.data.data,
          product_id: productId,
          variant_name: payload.variant_name // Include variant_name in success data
        };
        console.log('Calling onSuccess with:', successData);
        onSuccess && onSuccess(successData);
        onCancel();
      } else {
        console.error('Failed response:', response);
        message.error(response?.data?.message || 'Failed to add product variant');
      }
    } catch (error) {
      console.error('Error adding product variant:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
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
        <p>{productName || 'N/A'}</p>
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
            { max: 100, message: 'Variant name can be at most 100 characters' },
            { whitespace: true, message: 'Variant name cannot be empty' }
          ]}
        >
          <Input placeholder="Enter variant name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddProductVariantModal; 