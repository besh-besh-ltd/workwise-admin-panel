import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Select, message } from 'antd';
import { mapVariantWithVendor } from '../../utils/services/product-management';
import { getAllVendors } from '../../utils/services/vendor-management';
import { getVendorApprove } from '../../utils/services/vendor-approve-management';

const { Option } = Select;

const MapVariantVendorModal = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [approvals, setApprovals] = useState([]);

  // Fetch vendors and approvals on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorsResponse = await getAllVendors();
        if (vendorsResponse?.data?.data) {
          setVendors(vendorsResponse.data.data);
        }

        const approvalsResponse = await getVendorApprove();
        if (approvalsResponse?.data?.data) {
          setApprovals(approvalsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Failed to load vendors or approvals');
      }
    };

    if (isVisible) {
      fetchData();
      form.resetFields();
    }
  }, [isVisible, form]);

  // Set initial form values when variant changes
  useEffect(() => {
    if (variant && isVisible) {
      form.setFieldsValue({
        variant_id: variant.id,
        vendor_id: undefined,
        approved_by: []
      });
    }
  }, [variant, isVisible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const response = await mapVariantWithVendor(values);
      
      if (response?.data?.status === 1) {
        message.success('Variant mapped with vendor successfully');
        onSuccess && onSuccess();
        onCancel();
      } else {
        message.error(response?.data?.message || 'Failed to map variant with vendor');
      }
    } catch (error) {
      console.error('Error mapping variant with vendor:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to map variant with vendor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Map Variant with Vendor"
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
          Map Variant
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          variant_id: variant?.id,
          vendor_id: undefined,
          approved_by: []
        }}
      >
        <Form.Item
          name="variant_id"
          label="Variant"
          hidden
        >
          <input type="hidden" />
        </Form.Item>

        {variant && (
          <div className="mb-4">
            <p className="mb-1 font-medium">Variant Name:</p>
            <p>{variant.variant_name}</p>
            <p className="mb-1 font-medium mt-2">Product:</p>
            <p>{variant.product_name}</p>
            {variant.category_info && (
              <>
                <p className="mb-1 font-medium mt-2">Category:</p>
                <p>{variant.category_info}</p>
              </>
            )}
          </div>
        )}

        <Form.Item
          name="vendor_id"
          label="Vendor"
          rules={[{ required: true, message: 'Please select a vendor' }]}
        >
          <Select
            placeholder="Select a vendor"
            allowClear
          >
            {vendors.map(vendor => (
              <Option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="approved_by"
          label="Approved By"
        >
          <Select
            placeholder="Select approvals"
            mode="multiple"
            allowClear
          >
            {approvals.map(approval => (
              <Option key={approval.id} value={approval.id}>
                {approval.vendor_approve}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MapVariantVendorModal; 