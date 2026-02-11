import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface RejectListItem {
  id: number;
  reject_reason: string;
}

interface DisapprovePayload {
  reject_reason_id?: number;
  reject_reason?: string;
  status: string;
}

interface DisapproveModalProps {
  show: boolean;
  onHide: () => void;
  selectVal: string;
  inputValue: string;
  handleInputDisapprove: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rejectListData: RejectListItem[];
  selectedVendorId: number | string;
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  submitApproveVendor: (vendorId: number | string, payload: DisapprovePayload) => void;
}

const DisapproveModal: React.FC<DisapproveModalProps> = (props) => {
  const { selectVal, inputValue, handleInputDisapprove, rejectListData, selectedVendorId, handleSelect, submitApproveVendor } = props;
  const [payload, setPayload] = useState<DisapprovePayload | null>(null);

  useEffect(() => {
    const newPayload: DisapprovePayload = { status: '0' };
    if (selectVal !== '') {
      newPayload.reject_reason_id = parseInt(selectVal, 10);
    }
    if (inputValue !== '') {
      newPayload.reject_reason = inputValue;
    }
    setPayload(newPayload);
  }, [selectVal, inputValue]);

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
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
                {rejectListData?.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.reject_reason}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            type="text"
            value={inputValue}
            disabled={selectVal ? true : false}
            className="w-100 form-control me-3 w-75"
            placeholder="Reason to disapprove"
            onChange={handleInputDisapprove}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={props.onHide}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => payload && submitApproveVendor(selectedVendorId, payload)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisapproveModal;
