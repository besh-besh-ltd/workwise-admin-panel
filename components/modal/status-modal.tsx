import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

interface StatusFormData {
  status: string;
  comment: string;
}

interface StatusData {
  status?: string;
  comment?: string;
}

interface StatusModalProps {
  openModal: boolean;
  closeModal: () => void;
  data: StatusData | null;
  updateAdminStatus: (formData: StatusFormData) => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  openModal,
  closeModal,
  data,
  updateAdminStatus
}) => {
  const [formData, setFormData] = useState<StatusFormData>({ status: "Pending", comment: "" });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  useEffect(() => {
    setFormData({
      status: data?.status || "Pending",
      comment: data?.comment || ""
    });
  }, [data]);

  return (
    <Modal show={openModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update Admin Status</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="currentStatusArea" className="mb-2">
            <Form.Label>Select Status</Form.Label>
            <Form.Control
              as="select"
              name="status"
              onChange={handleFormChange}
              value={formData.status}
            >
              <option value="Pending">Pending</option>
              <option value="Working">Working</option>
              <option value="Complete">Complete</option>
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="reasonTextarea">
            <Form.Label>Add Your Remarks</Form.Label>
            <Form.Control
              as="textarea"
              name="comment"
              rows={4}
              placeholder="Enter your comment here..."
              value={formData.comment}
              onChange={handleFormChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
        <Button variant="primary" onClick={() => updateAdminStatus(formData)}>
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StatusModal;
