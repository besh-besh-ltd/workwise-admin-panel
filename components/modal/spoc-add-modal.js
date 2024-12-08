import React, { useState } from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import * as yup from "yup";
// import { toast, ToastContainer } from 'react-toastify';
import Loader from '../shared/Loader';

const validateSpocSchema = yup.object().shape({
    spoc_name: yup
      .string()
      .required("Spoc name is required")
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name must not exceed 50 characters"),
    spoc_email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    spoc_mobile: yup
      .string()
      .nullable() // Allows null values
      .test(
        "is-valid-mobile",
        "Please enter a valid mobile number",
        (value) => {
          if (!value) return true; // Pass validation if the field is empty
          const regex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,10}$/;
          return regex.test(value) && value.length >= 10 && value.length <= 15;
        }
      ),
  });

const SpocAddModal = ({
    openModal,
    closeModal,
    vendorId,
    getVendorDetails,
    handleAddSpoc
}) => {

    const [spocDetails, setSpocDetails] = useState({
        spoc_name: "",
        spoc_email: "",
        spoc_mobile: "",
        spoc_role: ""
    })
    const [errors, setErrors] = useState({});

    const validateBody = async () => {
        try {
            await validateSpocSchema.validate(spocDetails, { abortEarly: false });
            setErrors({}); // Clear errors if validation succeeds
            handleAddSpoc(spocDetails);
        } catch (validationErrors) {
            console.log(validationErrors);
            const formattedErrors = {};
            validationErrors.inner.forEach((error) => {
                formattedErrors[error.path] = error.message;
            });
            setErrors(formattedErrors);
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSpocDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value
        }));
    };



    return (
        <>
            {/* <ToastContainer style={{ zIndex: 1056 }} /> */}
            <Modal show={openModal} onHide={closeModal} size="lg" backdrop="static" keyboard={false} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Spoc</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="mb-3">
                            <Col className="col-sm-12 col-md-6 mb-2">
                                <Form.Group controlId="spoc_name">
                                    <Form.Label>Spoc Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="spoc_name"
                                        value={spocDetails.spoc_name}
                                        placeholder="Name"
                                        onChange={handleChange}
                                        isInvalid={!!errors.spoc_name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.spoc_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col className="col-sm-12 col-md-6 mb-2">
                                <Form.Group controlId="spoc_email">
                                    <Form.Label>Spoc Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="spoc_email"
                                        value={spocDetails.spoc_email}
                                        placeholder="Email"
                                        onChange={handleChange}
                                        isInvalid={!!errors.spoc_email}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.spoc_email}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col className="col-sm-12 col-md-6 mb-2">
                                <Form.Group controlId="spoc_mobile">
                                    <Form.Label>Spoc Mobile</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="spoc_mobile"
                                        value={spocDetails.spoc_mobile}
                                        placeholder="Mobile"
                                        onChange={handleChange}
                                        isInvalid={!!errors.spoc_mobile}
                                    />
                                <Form.Control.Feedback type="invalid">{errors.spoc_mobile}</Form.Control.Feedback>
                                </Form.Group>

                            </Col>
                            <Col className="col-sm-12 col-md-6 mb-2">
                                <Form.Group controlId="spoc_role">
                                    <Form.Label>Spoc Role</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="spoc_role"
                                        value={spocDetails.spoc_role}
                                        placeholder="Role"
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                    <Button variant="primary" onClick={() => validateBody()}>Create</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default SpocAddModal
