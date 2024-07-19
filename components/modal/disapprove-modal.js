import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const DisapproveModal = (props) => {
    const { selectVal, inputValue, handleInputDisapprove, rejectListData, selectedVendorId, handleSelect, submitApproveVendor } = props;
    const [payload, setPayload] = useState(null)

    useEffect(() => {
        const newPayload = {};
        if (selectVal !== '') {
            newPayload.reject_reason_id = selectVal;
        }
        if (inputValue !== '') {
            newPayload.reject_reason = inputValue;
        }
        newPayload.status = '0';

        setPayload(newPayload);
    }, [selectVal, inputValue])
    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title className="p-1">Disapprove</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="">
                    <div className="form-group">
                        <div className="form-group">
                            <select
                                id="select-input"
                                className="form-control"
                                value={selectVal}
                                onChange={handleSelect}
                                disabled={inputValue ? true : false}
                            >
                                <option value="" disabled>Select Reason to disapprove</option>
                                {rejectListData?.map((option, index) => (
                                    <option key={option.id} value={option.id}>
                                        {option.reject_reason}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <input type="text" value={inputValue} disabled={selectVal ? true : false} className="w-100 form-control me-3 w-75" placeholder="Reason to disapprove" onChange={handleInputDisapprove} />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={props.onHide}>
                    Cancel
                </Button>
                <Button variant="secondary" onClick={() => submitApproveVendor(selectedVendorId, payload)}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DisapproveModal