import React, { useEffect, useState } from 'react';
import { getAdminProfile } from "@/utils/services/login";
import { getVariantMappingById, addVendorApproveVariant, getVariantSpecifications } from '@/utils/services/product-management';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import FullLoading from '@/components/loading/FullLoading';
import { vendorApproveList } from '@/utils/services/rfq';
import Select from 'react-select';

interface Specification {
  key: string;
  value: string;
}

interface Make {
  make_name: string;
}

interface ApproverOption {
  label: string;
  value: string | number;
}

interface MappingData {
  mapping_id?: string | number;
  id?: string | number;
  variant_id?: string | number;
  variant_name?: string;
  product_name?: string;
  vendor_organization?: string;
  vendor_email?: string;
  vendor_details?: VendorDetails;
  approved_ids: (string | number)[];
  make_list?: Make[];
  mapped_at?: string;
  status?: boolean;
  mapping_created_by_name?: string;
  mapping_created_at?: string;
  mapping_updated_by_name?: string;
  mapping_updated_at?: string;
  mapping_approved_by_name?: string;
  mapping_approved_at?: string;
  variant_created_by_name?: string;
  variant_created_at?: string;
  variant_updated_by_name?: string;
  variant_updated_at?: string;
  variant_approved_by_name?: string;
  variant_approved_at?: string;
  product_created_by_name?: string;
  product_created_at?: string;
  product_updated_by_name?: string;
  product_updated_at?: string;
  product_approved_by_name?: string;
  product_approved_at?: string;
}

interface VendorDetails {
  id: string | number;
  name: string;
}

// Changes by Agnij May 31, 2025 [Created mapping view/edit page]
const MappingDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mapping, setMapping] = useState<MappingData | null>(null);
  const [variant, setVariant] = useState<unknown>(null); // not in use - cross check and remove
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null); // not in use - cross check and remove
  const [userType, setUserType] = useState<string | null>(null); // not in use - cross check and remove
  const [allMappings, setAllMappings] = useState<MappingData[]>([]); // not in use - cross check and remove
  const [selectedOptions, setSelectedOptions] = useState<ApproverOption[]>([]);
  const [vendorApprovedList, setVendorApprovedList] = useState<ApproverOption[]>([]);
  const [initialApprovedList, setInitialApprovedList] = useState<ApproverOption[]>([]);
  const [makeList, setMakeList] = useState<Make[]>([]);            // Full make list
  const [newMakeInput, setNewMakeInput] = useState<string>("");    // For adding new makes
  const [specifications, setSpecifications] = useState<Specification[]>([]);



  const getVendorApproveList = (): void => {
    vendorApproveList().then((res: { data: Array<{ vendor_approve: string; id: string | number }> }) => {
      let lists: ApproverOption[] = res.data.map((s) => ({
        label: s.vendor_approve,
        value: s.id,
      }));
      setVendorApprovedList(lists);
    })
      .catch((error: Error) => {
        console.log(error)
      });
  };


  useEffect(() => {
    getUserProfile();
    getVendorApproveList();
  }, []);

 useEffect(() => {
  if (id && vendorApprovedList.length > 0) {
    fetchMappingDetails();
  }
}, [id, vendorApprovedList]); // Add vendorApprovedList as a dependency


  const getUserProfile = async (): Promise<void> => {
    try {
      const res : any = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.log(error);
    }
  };

 const fetchMappingDetails = async (): Promise<void> => {
  if (!id) return;

  setLoading(true);
  try {
    // Fetch mapping details by ID

    const mappingsResponse : any = await getVariantMappingById(id as string);

    let mappingsData: MappingData[] = [];

    // Handle different potential response formats
    if (mappingsResponse?.data?.data && Array.isArray(mappingsResponse.data.data)) {
      mappingsData = mappingsResponse.data.data;
    } else if (Array.isArray(mappingsResponse?.data)) {
      mappingsData = mappingsResponse.data;
    } else if (mappingsResponse?.data) {
      if (mappingsResponse.data.data && Array.isArray(mappingsResponse.data.data)) {
        mappingsData = mappingsResponse.data.data;
      } else {
        mappingsData = [mappingsResponse.data as MappingData];
      }
    }

    const mappingData = mappingsData[0]; // Declare `mapping` before using it

    if (!mappingData) {

      setLoading(false);
      return;
    }

    // Now it's safe to use `mapping`
    setMapping(mappingData);

    // Extract make_list if available
    if (mappingData.make_list && Array.isArray(mappingData.make_list)) {
      setMakeList(mappingData.make_list); // Directly set make list
    } else {
      setMakeList([]); // Ensure empty list if not present
    }

    // Fetch variant specifications if variant_id exists
    if (mappingData.variant_id) {
      try {
        const specsResponse : any = await getVariantSpecifications(mappingData.variant_id);

        if (specsResponse?.status === 1) {
          setSpecifications(specsResponse.data || []);
        } else {
          setSpecifications([]);
        }
      } catch (specsError) {
        setSpecifications([]);
      }
    }


    const approvedIds = mappingData.approved_ids;
   const approverOptions: ApproverOption[] = vendorApprovedList
     .filter((approver) => approvedIds.includes(approver.value)) // use `value`, not `id`
     .map((approver) => ({
       label: approver.label,
       value: approver.value,
     }));

    setInitialApprovedList(approverOptions);
    setSelectedOptions(approverOptions);

    if (mappingData.vendor_details) {
      setSelectedVendor(mappingData.vendor_details ?? null);
    }

    setAllMappings(mappingsData);

    setLoading(false);

  } catch (error) {

    toast.error("Failed to load mapping details");
    setLoading(false);
  }
};

  const handleChange = (selected: readonly ApproverOption[] | null): void => {
    setSelectedOptions(selected ? [...selected] : []); // selected is an array of selected option objects
  };

 const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const selectedApprovers = selectedOptions.map(option => option.value);
      const data = {
        mapping_id: id,
        approved_id: selectedApprovers,
        make_list: makeList.map(make => make.make_name), // Extract make names from the list
      };

      const response : any = await addVendorApproveVariant(data);

     if (response.status === 1) {

       toast.success("Mapping updated successfully");
     } else {
       toast.error("Failed to update mapping");
     }
    } catch (error) {
      toast.error("Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="content">
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Variant-Vendor Mapping Details</h1>
            </div>
            <div className="col-sm-6">
              <div className="float-sm-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    router.push("/product-management?tab=mappings")
                  }
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back to Mappings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {loading ? (
            <FullLoading />
          ) : mapping ? (
            <div className="row">
              <div className="col-md-16">
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Mapping ID:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.mapping_id || mapping.id}
                    </div>

                    <div className="col-md-4">
                      <strong>Created By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.mapping_created_by_name || "N/A"} /{" "}
                      {mapping?.mapping_created_at
                        ? new Date(
                            mapping.mapping_created_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="col-md-4">
                      <strong>Updated By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.mapping_updated_by_name || "N/A"} /{" "}
                      {mapping?.mapping_updated_at
                        ? new Date(
                            mapping.mapping_updated_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="col-md-4">
                      <strong>Approved By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.mapping_approved_by_name || "N/A"} /{" "}
                      {mapping?.mapping_approved_at
                        ? new Date(
                            mapping.mapping_approved_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Variant:</strong>
                    </div>
                    <div className="col-md-8">
                      <a
                        href={`/product-management/variant/${mapping.variant_id}`}
                        className="text-primary"
                      >
                        {mapping.variant_name ||
                          "Variant ID: " + mapping.variant_id}
                      </a>
                    </div>

                    <div className="col-md-4">
                      <strong>Created By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.variant_created_by_name || "Unknown"} /{" "}
                      {mapping?.variant_created_at
                        ? new Date(
                            mapping.variant_created_at
                          ).toLocaleDateString()
                        : "Unknown"}
                    </div>

                    <div className="col-md-4">
                      <strong>Updated By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.variant_updated_by_name || "N/A"} /{" "}
                      {mapping?.variant_updated_at
                        ? new Date(
                            mapping.variant_updated_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="col-md-4">
                      <strong>Approved By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping?.variant_approved_by_name || "N/A"} /{" "}
                      {mapping?.variant_approved_at
                        ? new Date(
                            mapping.variant_approved_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Product:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.product_name || "Unknown Product"}
                    </div>

                    <div className="col-md-4">
                      <strong>Created By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.product_created_by_name || "N/A"} /{" "}
                      {mapping.product_created_at
                        ? new Date(
                            mapping.product_created_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="col-md-4">
                      <strong>Updated By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.product_updated_by_name || "N/A"} /{" "}
                      {mapping.product_updated_at
                        ? new Date(
                            mapping.product_updated_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>

                    <div className="col-md-4">
                      <strong>Approved By / At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.product_approved_by_name || "N/A"} /{" "}
                      {mapping.product_approved_at
                        ? new Date(
                            mapping.product_approved_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Current Vendor:</strong>
                    </div>
                    <div className="col-md-8">
                      <strong>
                        {mapping?.vendor_organization || "No organization available"}
                      </strong>
                      <br />
                      <div className="mt-1">
                        <strong>Email: </strong>
                        {mapping?.vendor_email || "No email available"}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Vendor Approved By:</strong>
                    </div>
                    <div className="col-md-8">
                      <Select
                        isMulti
                        options={vendorApprovedList}
                        defaultValue={initialApprovedList}
                        onChange={handleChange}
                        placeholder="Choose approvers..."
                      />
                    </div>
                  </div>


              <div className="row mb-3">
                <div className="col-md-4">
                  <strong>Product Makes:</strong>
                </div>
                <div className="col-md-8">
                  {/* Display existing makes */}
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {makeList.map((make, index) => (
                      <div  key={index}>
                        {make.make_name}
                        <button
                          type="button"
                          onClick={() =>
                            setMakeList((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>

          {/* Add new make */}
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Add new make"
              value={newMakeInput}
              onChange={(e) => setNewMakeInput(e.target.value)}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                if (newMakeInput.trim() !== "") {
                  setMakeList((prev) => [...prev, { make_name: newMakeInput.trim() }]);
                  setNewMakeInput("");
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Mapped At:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.mapped_at
                        ? new Date(mapping.mapped_at).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4">
                      <strong>Status:</strong>
                    </div>
                    <div className="col-md-8">
                      {mapping.status ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </div>
                  </div>

                  {/* Variant Specifications */}
                  {specifications.length > 0 && (
                    <div className="row mb-3">
                      <div className="col-md-12">
                        <h5><strong>Variant Specifications:</strong></h5>
                        <div className="table-responsive">
                          <table className="table table-striped table-sm">
                            <thead>
                              <tr>
                                <th>Specification</th>
                                <th>Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              {specifications.map((spec, index) => (
                                <tr key={index}>
                                  <td><strong>{spec.key}</strong></td>
                                  <td>{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h5>
                <i className="icon fas fa-ban"></i> Mapping Not Found
              </h5>
              <p>
                We couldn&apos;t find the mapping with ID: {id}.<br />
                This could be because:
              </p>
              <ul>
                <li>The mapping ID doesn&apos;t exist in the system</li>
                <li>The mapping was recently deleted</li>
                <li>There might be an issue with the server connection</li>
              </ul>
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() => router.push("/product-management?tab=mappings")}
              >
                <i className="fas fa-arrow-left mr-1"></i> Back to Mappings
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span>
                <i className="fas fa-spinner fa-spin mr-1"></i> Saving...
              </span>
            ) : (
              <span>
                <i className="fas fa-save mr-1"></i> Save Changes
              </span>
            )}
          </button>
        </div>
      </section>
    </section>
  );
};

export default MappingDetail;
