import React, { useState, useEffect } from "react";

interface SpocDetail {
  id: number;
  name: string;
}

interface MapSpocModalProps {
  show: boolean;
  onClose: () => void;
  spocDetails: SpocDetail[];
  onSave: (selectedSpocs: number[]) => void;
  defaultSelected?: number[];
}

const MapSpocModal: React.FC<MapSpocModalProps> = ({ show, onClose, spocDetails, onSave, defaultSelected }) => {
  const [selectedSpocs, setSelectedSpocs] = useState<number[]>([]);

  useEffect(() => {
    setSelectedSpocs(defaultSelected || []);
  }, [defaultSelected, show]);

  if (!show) return null;

  const toggleSpoc = (id: number) => {
    setSelectedSpocs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(selectedSpocs);
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Map SPOCs to Location</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <label className="form-label">Select SPOCs</label>
            <div className="list-group" style={{ maxHeight: "250px", overflowY: "auto" }}>
              {spocDetails?.map((spoc) => (
                <label key={spoc.id} className="list-group-item d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={selectedSpocs.includes(spoc.id)}
                    onChange={() => toggleSpoc(spoc.id)}
                  />
                  {spoc.name}
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MapSpocModal;
