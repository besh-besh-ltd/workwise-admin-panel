import React, { useState, useEffect } from 'react';
import { Button, Table, Space, Popconfirm, message, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import { 
  getProductVariants, 
  deleteProductVariant, 
  mapVariantWithVendor,
  getVariantMappings
} from "@/utils/services/product-management";
import AddProductVariantModal from './AddProductVariantModal';
import MapVariantVendorModal from '../modal/MapVariantVendorModal';

const ProductVariantsTab = ({ product }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const fetchVariants = async () => {
    if (!product || !product.id) return;
    
    setLoading(true);
    try {
      const response = await getProductVariants(product.id);
      if (response?.data?.data) {
        setVariants(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      message.error('Failed to load product variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product && product.id) {
      fetchVariants();
    }
  }, [product]);

  const handleAddVariant = () => {
    setShowAddModal(true);
  };

  const handleMapVariant = (variant) => {
    setSelectedVariant(variant);
    setShowMapModal(true);
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const response = await deleteProductVariant(variantId);
      if (response?.data?.status === 1) {
        message.success('Product variant deleted successfully');
        fetchVariants();
      } else {
        message.error(response?.data?.message || 'Failed to delete product variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      message.error('Failed to delete product variant');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '10%',
    },
    {
      title: 'Variant Name',
      dataIndex: 'variant_name',
      key: 'variant_name',
    },
    {
      title: 'Category',
      dataIndex: 'category_info',
      key: 'category_info',
      render: (text) => text || '-',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '20%',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<LinkOutlined />}
            onClick={() => handleMapVariant(record)}
          >
            Map to Vendor
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this variant?"
            onConfirm={() => handleDeleteVariant(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="danger" 
              size="small" 
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-variants-tab">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Variants</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVariant}
        >
          Add Variant
        </Button>
      </div>

      {variants.length === 0 && !loading ? (
        <Empty description="No variants found for this product" />
      ) : (
        <Table
          columns={columns}
          dataSource={variants}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <AddProductVariantModal
        isVisible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        productId={product?.id}
        productName={product?.name}
        onSuccess={fetchVariants}
      />

      <MapVariantVendorModal
        isVisible={showMapModal}
        onCancel={() => setShowMapModal(false)}
        variant={selectedVariant}
        onSuccess={fetchVariants}
      />
    </div>
  );
};

export default ProductVariantsTab; 