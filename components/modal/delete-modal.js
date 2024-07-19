import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const DeleteModal = (props) => {
  return (
    <Modal show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>Do you want to delete {props.name} ?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.data}>
          Yes
        </Button>
        <Button variant="primary" onClick={props.onHide}>
          No
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
