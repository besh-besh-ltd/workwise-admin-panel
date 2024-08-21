import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

const RejectModal = ({
    openRejectModal,
    closeModal,
    approveVendor,
    data

})=> {
    const [rejectReason, setRejectreason] = useState('');

    const handleReasonChange = (e) => {
        setRejectreason(e.target.value);
    };

    return (
        <Modal show={openRejectModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Reject</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="reasonTextarea">
                        <Form.Label>Reject Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Enter your reason here..."
                            value={rejectReason}
                            onChange={handleReasonChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                    Close
                </Button>
                <Button variant="primary" onClick={()=> approveVendor(data, 2, rejectReason)}>
                    Reject
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RejectModal;
