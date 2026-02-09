import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import * as yup from "yup";

interface CountryCodeItem {
  id: number;
  country_code: string;
  phone_code: string;
}

interface SpocDetails {
  spoc_name: string;
  spoc_email: string;
  spoc_mobile: string;
  spoc_role: string;
  country_code: string;
}

interface SpocAddModalProps {
  openModal: boolean;
  closeModal: () => void;
  handleAddSpoc: (data: Omit<SpocDetails, 'country_code'> & { spoc_mobile: string }) => void;
  countryCode: CountryCodeItem[];
  vendorId?: string;
  getVendorDetails?: (vendorId: string) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

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
    .nullable()
    .test("is-valid-mobile", "Please enter a valid mobile number", (value) => {
      if (!value) return true;
      const regex = /^[0-9]{6,15}$/;
      return regex.test(value);
    }),
});

const SpocAddModal: React.FC<SpocAddModalProps> = ({ openModal, closeModal, handleAddSpoc, countryCode }) => {
  const [spocDetails, setSpocDetails] = useState<SpocDetails>({
    spoc_name: "",
    spoc_email: "",
    spoc_mobile: "",
    spoc_role: "",
    country_code: "+91",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpocDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const validateBody = async () => {
    try {
      await validateSpocSchema.validate(spocDetails, { abortEarly: false });
      setErrors({});

      const countryCodeFormatted = spocDetails.country_code || "";
      const formattedMobile = `${countryCodeFormatted}-${spocDetails.spoc_mobile.replace(/^[0\s]+/, '')}`;

      const { country_code, spoc_mobile, ...finalData } = spocDetails;
      handleAddSpoc({ ...finalData, spoc_mobile: formattedMobile });

      closeModal();
    } catch (validationErrors: any) {
      const formattedErrors: ValidationErrors = {};
      validationErrors.inner.forEach((error: yup.ValidationError) => {
        if (error.path) {
          formattedErrors[error.path] = error.message;
        }
      });
      setErrors(formattedErrors);
    }
  };

  return (
    <Modal show={openModal} onHide={closeModal} size="lg" backdrop="static" keyboard={false} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Spoc</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6} className="mb-2">
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
            <Col md={6} className="mb-2">
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
            <Col md={6} className="mb-2">
              <Form.Group controlId="spoc_mobile">
                <Form.Label>Spoc Mobile</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    name="country_code"
                    value={spocDetails.country_code}
                    onChange={(e) =>
                      setSpocDetails((prevDetails) => ({
                        ...prevDetails,
                        country_code: e.target.value,
                      }))
                    }
                    className="me-2"
                    style={{ maxWidth: "120px" }}
                  >
                    <option value="">Select</option>
                    {Array.isArray(countryCode) &&
                      countryCode.map((item) => (
                        <option key={item.id} value={item.phone_code}>
                          {item.country_code} ({item.phone_code})
                        </option>
                      ))}
                  </Form.Select>

                  <Form.Control
                    type="tel"
                    name="spoc_mobile"
                    value={spocDetails.spoc_mobile}
                    placeholder="Mobile"
                    onChange={handleChange}
                    isInvalid={!!errors.spoc_mobile}
                  />
                </div>
                <Form.Control.Feedback type="invalid">{errors.spoc_mobile}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-2">
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
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
        <Button variant="primary" onClick={validateBody}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SpocAddModal;
