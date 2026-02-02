import React, { useMemo, useCallback } from "react";
import Select, { components } from "react-select";

// Custom Select Option Component for Vendors (shows email/phone)
const CustomVendorOption = (props) => (
  <components.Option {...props}>
    <div>
      <strong>{props?.data?.label}</strong>
      {props?.data?.email && (
        <>
          <br />
          <small>{props?.data?.email}</small>
          {props?.data?.phone && <small className="ms-2">{props?.data?.phone}</small>}
        </>
      )}
    </div>
  </components.Option>
);

// Separate VendorSelect component to prevent focus loss
const VendorSelect = React.memo(({ 
  selectedVendors, 
  onVendorsChange, 
  vendorOptions, 
  vendorSearchLoading,
  onSearchChange
}) => {
  const selectedValue = useMemo(() => {
    return vendorOptions.filter(opt => selectedVendors.includes(String(opt.value)));
  }, [vendorOptions, selectedVendors]);

  const handleChange = useCallback((selectedOptions) => {
    const vendorIds = Array.isArray(selectedOptions) 
      ? selectedOptions.map(opt => String(opt.value))
      : [];
    if (onVendorsChange) {
      onVendorsChange(vendorIds);
    }
  }, [onVendorsChange]);

  const handleInputChange = useCallback((newValue) => {
    if (onSearchChange) {
      onSearchChange(newValue);
    }
  }, [onSearchChange]);

  return (
    <Select
      options={vendorOptions}
      value={selectedValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      placeholder="Search vendors (min 3 characters)..."
      isClearable={true}
      isSearchable={true}
      isMulti={true}
      isLoading={vendorSearchLoading}
      components={{ Option: CustomVendorOption }}
      className="basic-select"
      classNamePrefix="select"
      filterOption={() => true}
      noOptionsMessage={({ inputValue }) => !inputValue || inputValue.length < 3 ? "Please enter at least 3 letters to search" : "No vendors found"}
      blurInputOnSelect={false}
      closeMenuOnSelect={false}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.selectedVendors.length === nextProps.selectedVendors.length &&
         prevProps.selectedVendors.every((id, idx) => id === nextProps.selectedVendors[idx]) &&
         prevProps.vendorOptions.length === nextProps.vendorOptions.length &&
         prevProps.vendorSearchLoading === nextProps.vendorSearchLoading;
});

VendorSelect.displayName = 'VendorSelect';

export default VendorSelect;

