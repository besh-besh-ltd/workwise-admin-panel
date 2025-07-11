import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '@/utils/axios';
import axiosxdata from '@/utils/axios/xxx-form-data';

const SpocManagement = () => {
  const [spocs, setSpocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSpocs();
  }, [currentPage]);

  const fetchSpocs = async () => {
    setLoading(true);
    try {
      const cacheBuster = Date.now();
      const url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/spoc-list?limit=${itemsPerPage}&page=${currentPage}&cb=${cacheBuster}`;

      const response = await axiosInstance.get(url);

      const spocData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data || [];
      const totalCount = response?.total ?? response?.data?.total ?? 0;

      setSpocs(spocData);
      setTotal(totalCount);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (error) {
      console.error('Error fetching SPOCs:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch SPOCs');
    } finally {
      setLoading(false);
    }
  };

  const [updateLoading, setUpdateLoading] = useState(false);

  const handleStatusUpdate = async (vendorId, spocId, newStatus) => {
    setUpdateLoading(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${vendorId}/update-spoc/${spocId}`;
      await axiosxdata.put(url, { status: newStatus });
      toast.success(newStatus === 1 ? 'SPOC approved successfully' : 'SPOC disapproved successfully');
      fetchSpocs();
    } catch (error) {
      console.error('Error updating SPOC status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update SPOC status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <Badge bg="danger">Disapproved</Badge>;
      case 1:
        return <Badge bg="success">Approved</Badge>;
      case 2:
        return <Badge bg="warning">Pending</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <h2>SPOC Management</h2>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Vendor</th>
                    <th>Created By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {spocs.map((spoc) => (
                    <tr key={spoc.id}>
                      <td>{spoc.name}</td>
                      <td>{spoc.email}</td>
                      <td>{spoc.mobile}</td>
                      <td>{spoc.role}</td>
                      <td>{spoc.vendor_name}</td>
                      <td>{spoc.created_by_name || 'N/A'}</td>
                      <td>{getStatusBadge(spoc.status)}</td>
                      <td>
                        {spoc.status !== 1 && (
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleStatusUpdate(spoc.user_id, spoc.id, 1)}
                          >
                            Approve
                          </Button>
                        )}
                        {spoc.status !== 0 && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatusUpdate(spoc.user_id, spoc.id, 0)}
                          >
                            Disapprove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  />
                  
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx + 1}
                      active={currentPage === idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  
                  <Pagination.Next
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpocManagement; 