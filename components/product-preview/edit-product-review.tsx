import React, { useEffect, useRef, useState, ChangeEvent, RefObject } from "react";
import Link from "next/link";
import FormikField from "@/components/shared/FormikField";
import {
  categoryList,
  vendorApproveList,
  vendorList,
} from "@/utils/services/rfq";
import { getProducts, handleUpdateProduct } from "@/utils/services/products";
import * as yup from "yup";
import { ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikTouched } from "formik";
import { ToastContainer, toast } from "react-toastify";
import Select, { SingleValue, StylesConfig } from "react-select";
import { useRouter, NextRouter } from "next/router";

interface CategoryOption {
  value: number;
  label: string;
}

interface VendorOption {
  value: number | string;
  label: string;
}

interface ProductCategory {
  id: number;
  category_name: string;
}

interface ProductImage {
  is_featured: number;
  product_image_url: string;
}

interface ProductVariant {
  variant_name: string;
  variant_value: string;
}

interface VendorApproved {
  id: number;
}

interface ProductDetails {
  name?: string;
  description?: string;
  manufacturer?: string;
  availability?: number;
  product_categories?: ProductCategory[];
  featured?: string;
  vendor_approved_by?: VendorApproved[];
  approved_name?: string;
  vendor?: number;
  is_featured?: number;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  qap_new_file_name?: string;
  tds_new_file_name?: string;
}

interface CategoryItem {
  id: number;
  title: string;
  parent_id: number;
}

interface VendorItem {
  id: number;
  name: string;
}

interface VendorApproveItem {
  id: number;
  vendor_approve: string;
}

interface Variation {
  attribute: string;
  attributeValue: string;
}

interface FormValues {
  name: string;
  description: string;
  manufacturer: string;
  availability: number | string;
  categories: number[] | ProductCategory[][];
  featured: string;
  status: number;
  approved_id: number[] | string;
  approved_name: string;
  variations: Variation[];
  vendor: number | string;
  is_featured: number | string;
  gallery?: FileList;
  qap?: File;
  tds?: File;
}

interface IsFeaturedOption {
  label: string;
  value: string;
}

const EditProductReview: React.FC = () => {
  const parentSelectRef = useRef<any>(null);
  const levelOneSelectRef = useRef<any>(null);
  const levelTwoSelectRef = useRef<any>(null);
  const levelThreeSelectRef = useRef<any>(null);
  const levelFourSelectRef = useRef<any>(null);
  const levelFiveSelectRef = useRef<any>(null);
  const levelSixSelectRef = useRef<any>(null);
  const [catloading, setcatloading] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [parentCategories, setParentCategories] = useState<CategoryOption[]>([]);
  const [cat_id, setCat_id] = useState<number | string>("");
  const [levelOneCat, setlevelOneCat] = useState<CategoryOption[]>([]);
  const [levelTwoCat, setlevelTwoCat] = useState<CategoryOption[]>([]);
  const [levelThreeCat, setlevelThreeCat] = useState<CategoryOption[]>([]);
  const [levelFourCat, setlevelFourCat] = useState<CategoryOption[]>([]);
  const [levelFiveCat, setlevelFiveCat] = useState<CategoryOption[]>([]);
  const [levelSixCat, setlevelSixCat] = useState<CategoryOption[]>([]);
  const [vendorApprovedList, setVendorApprovedList] = useState<VendorOption[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [selectedFeaturedFiles, setSelectedFeaturedFiles] = useState<File[]>([]);
  const [levelOneCatSelected, setlevelOneCatSelected] = useState<number | string>("");
  const [levelTwoCatSelected, setlevelTwoCatSelected] = useState<number | string>("");
  const [levelThreeCatSelected, setlevelThreeCatSelected] = useState<number | string>("");
  const [levelFourCatSelected, setlevelFourCatSelected] = useState<number | string>("");
  const [levelFiveCatSelected, setlevelFiveCatSelected] = useState<number | string>("");
  const [levelSixCatSelected, setlevelSixCatSelected] = useState<number | string>("");
  const [mainLoading, setMainLoading] = useState<boolean>(false);
  const [vendorData, setVendorData] = useState<VendorOption[]>([]);
  const [productDetailsData, setProductDetailsData] = useState<ProductDetails>({});
  const [variantData, setVariantData] = useState<Variation[] | string>("");
  const [categoryData, setCategoryData] = useState<CategoryOption[]>([]);
  const [selectedFile, setSelectedFile] = useState<string[]>([]);
  const [fileType, setFileType] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [parentSelectValue, setParentSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelOneSelectValue, setlevelOneSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelTwoSelectValue, setlevelTwoSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelThreeSelectValue, setlevelThreeSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelFourSelectValue, setlevelFourSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelFiveSelectValue, setlevelFiveSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const [levelSixSelectValue, setlevelSixSelectValue] = useState<CategoryOption | CategoryOption[]>([]);
  const router: NextRouter = useRouter();
  const { id } = router.query;
  const uploadedImage = React.useRef<HTMLImageElement>(null);
  const imageUploader = React.useRef<HTMLInputElement>(null);
  let files: File | undefined;
  let gallery: FileList | undefined;

  const isFeaturesArray: IsFeaturedOption[] = [
    { label: "Select is Featured", value: "" },
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  useEffect(() => {
    if (id) {
      getCategories();
      getVendorApproveList();
      getVendor();
      getProductDetails();
    }
  }, [id]);

  useEffect(() => {
    if (
      categoryData.length > 0 &&
      categories.length > 0 &&
      parentCategories.length > 0
    ) {
      setParentSelectValue(categoryData[0]);
      setlevelOneSelectValue(categoryData[1]);
      setlevelTwoSelectValue(categoryData[2]);
      setlevelThreeSelectValue(categoryData[3]);
      setlevelFourSelectValue(categoryData[4]);
      setlevelFiveSelectValue(categoryData[5]);
      setlevelSixSelectValue(categoryData[6]);
      parentSelectRef?.current?.setValue(parentSelectValue);
      levelOneSelectRef?.current?.setValue(levelOneSelectValue);
      levelTwoSelectRef?.current?.setValue(levelTwoSelectValue);
      levelThreeSelectRef?.current?.setValue(levelThreeSelectValue);
      levelFourSelectRef?.current?.setValue(levelFourSelectValue);
      levelFiveSelectRef?.current?.setValue(levelFiveSelectValue);
      levelSixSelectRef?.current?.setValue(levelSixSelectValue);
    }
  }, [
    categoryData,
    categories,
    parentCategories,
    levelOneCatSelected,
    levelTwoCatSelected,
    levelThreeCatSelected,
    levelFourCatSelected,
    levelFiveCatSelected,
    levelSixCatSelected,
  ]);

  useEffect(() => {
    getGalleryImage();
  }, [productDetailsData]);

  const initialValues: FormValues = {
    name: productDetailsData.name ? productDetailsData.name : "",
    description: productDetailsData.description
      ? productDetailsData.description
      : "",
    manufacturer: productDetailsData.manufacturer
      ? productDetailsData.manufacturer
      : "",
    availability:
      productDetailsData.availability !== undefined
        ? productDetailsData.availability
        : "",
    categories: productDetailsData.product_categories
      ? [productDetailsData.product_categories]
      : [],
    featured: productDetailsData.featured ? productDetailsData.featured : "",
    status: 1,
    approved_id:
      productDetailsData.vendor_approved_by &&
      productDetailsData.vendor_approved_by?.length > 0
        ? productDetailsData.vendor_approved_by?.map((item) => item.id)
        : "",
    approved_name: productDetailsData.approved_name
      ? productDetailsData.approved_name
      : "",
    variations:
      variantData && typeof variantData !== 'string' && variantData.length !== 0
        ? variantData
        : [{ attribute: "", attributeValue: "" }],
    vendor: productDetailsData.vendor ? productDetailsData.vendor : "",
    is_featured:
      productDetailsData.is_featured === 0 ||
      productDetailsData.is_featured === 1
        ? productDetailsData.is_featured
        : "",
  };

  const customSelectStyles: StylesConfig<CategoryOption, false> = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 50,
    }),
  };

  const getCategories = (): void => {
    setcatloading(true);
    categoryList()
      .then((rsp: { data: CategoryItem[] }) => {
        setcatloading(false);
        let options: CategoryOption[] = [];
        let parentOptions: CategoryOption[] = [];
        rsp.data.map((item) => {
          options.push({ value: item?.id, label: item?.title });
          if (item.parent_id == 0) {
            parentOptions.push({ value: item?.id, label: item?.title });
          }
        });
        setCategories(rsp.data);
        setParentCategories(parentOptions);
      })
      .catch(() => {
        setcatloading(false);
      });
  };

  const getChildCategories = (catId: number | undefined, level: string): void => {
    if (!catId) return;
    let childItems = categories.filter((item) => item.parent_id == catId);
    let options: CategoryOption[] = [];
    if (childItems.length > 0) {
      childItems.map((item) => {
        options.push({ value: item?.id, label: item?.title });
      });
    }
    if (level == "1") {
      setlevelOneCat(options);
      setlevelOneCatSelected(catId);
      setlevelTwoCatSelected("");
      setlevelThreeCatSelected("");
      setlevelFourCatSelected("");
      setlevelFiveCatSelected("");
      setlevelSixCatSelected("");
    } else if (level == "2") {
      setlevelTwoCat(options);
      setlevelTwoCatSelected(catId);
      setlevelThreeCatSelected("");
      setlevelFourCatSelected("");
      setlevelFiveCatSelected("");
      setlevelSixCatSelected("");
    } else if (level == "3") {
      setlevelThreeCat(options);
      setlevelThreeCatSelected(catId);
      setlevelFourCatSelected("");
      setlevelFiveCatSelected("");
      setlevelSixCatSelected("");
    } else if (level == "4") {
      setlevelFourCat(options);
      setlevelFourCatSelected(catId);
      setlevelFiveCatSelected("");
      setlevelSixCatSelected("");
    } else if (level == "5") {
      setlevelFiveCat(options);
      setlevelFiveCatSelected(catId);
      setlevelSixCatSelected("");
    } else if (level == "6") {
      setlevelSixCat(options);
      setlevelSixCatSelected(catId);
    }
  };

  const getVendor = (): void => {
    vendorList(null)
      .then((rsp: { data: VendorItem[] }) => {
        let lists: VendorOption[] = rsp.data.map((s) => ({
          label: s.name,
          value: s.id,
        }));
        setVendorData(lists);
      })
      .catch(() => {
        setcatloading(false);
      });
  };

  const getVendorApproveList = (): void => {
    vendorApproveList().then((res: { data: VendorApproveItem[] }) => {
      let lists: VendorOption[] = res.data.map((s) => ({
        label: s.vendor_approve,
        value: s.id,
      }));
      lists.unshift({ label: "Select Vendor list", value: "" });
      lists.push({ label: "Other", value: "o" });
      setVendorApprovedList(lists);
    });
  };

  const getProductDetails = (): void => {
    getProducts(id as string)
      .then((response: { data: ProductDetails & { product_variants: ProductVariant[] } }) => {
        setProductDetailsData(response.data);
        let category: CategoryOption[] = [];
        response.data.product_categories?.map((data) => {
          category.push({
            label: data.category_name,
            value: data.id,
          });
        });
        setCategoryData(category);
        let variant: Variation[] = [];
        response.data.product_variants.map((data) => {
          variant.push({
            attribute: data.variant_name,
            attributeValue: data.variant_value,
          });
        });
        setVariantData(variant);
      })
      .catch(() => {
        setcatloading(false);
      });
  };

  const imageUploadHandler = (events: ChangeEvent<HTMLInputElement>): void => {
    const fileList = events.target.files;
    if (!fileList || !fileList[0]) return;
    const file = fileList[0];
    const selectedFiles = Array.from(fileList);
    setSelectedFeaturedFiles(selectedFiles);
    if (file) {
      const reader = new FileReader();
      const { current } = uploadedImage;
      if (current) {
        (current as any).file = file;
      }

      reader.onload = (e) => {
        if (current && e.target?.result) {
          current.src = e.target.result as string;
          setSelectedFile([current.src]);
        }
      };
      reader.readAsDataURL(file);
      setFileType([file.type]);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const fileList = e.target.files;
    if (!fileList) return;
    const selectedFiles = Array.from(fileList);
    setImages(selectedFiles);
    setGalleryImages([]);
    setSelectedGalleryFiles(selectedFiles);
  };

  const getGalleryImage = (): void => {
    let image: string[] = [];
    productDetailsData?.product_images?.map((img) => {
      if (img.is_featured == 0) {
        image.push(img.product_image_url);
      }
    });
    setGalleryImages(image);
  };

  const submitHandler = (values: FormValues): void => {
    const payload = new FormData();
    payload.append(`name`, values.name);
    payload.append(`description`, values.description);
    payload.append(`manufacturer`, values.manufacturer);
    payload.append(`availability`, String(values.availability));
    payload.append(`status`, "1");
    payload.append(
      `approved_id`,
      values.approved_id == "o" ? "" : JSON.stringify(values.approved_id)
    );
    payload.append(
      `approved_name`,
      values.approved_id == "o" ? values.approved_name : ""
    );
    payload.append(`variations`, JSON.stringify(values.variations));
    selectedGalleryFiles.forEach((file) => {
      payload.append(`gallery`, file, file.name);
    });
    selectedFeaturedFiles.forEach((file) => {
      payload.append(`featured`, file, file.name);
    });
    let selectedCategories: (number | string)[] = [
      levelOneCatSelected,
      levelTwoCatSelected,
      levelThreeCatSelected,
      levelFourCatSelected,
      levelFiveCatSelected,
      levelSixCatSelected,
    ];
    selectedCategories = selectedCategories.filter(
      (v) => v !== "" && v !== null
    );
    payload.append(`categories`, JSON.stringify(selectedCategories));
    payload.append(`vendor`, String(values.vendor));
    payload.append(`is_featured`, String(values.is_featured));
    setMainLoading(true);
    handleUpdateProduct(payload, id as string)
      .then((res: { message: string }) => {
        toast(res.message);
        router.push("/product-preview");
      })
      .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Edit Product</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="text-left pb-4">
            <Link className="btn btn-primary" href="/product-preview">
              <span className="fa fa-angle-left mr-2"></span>Go Back
            </Link>
          </div>
          <div className="card col-12">
            <div className="card-body mt-3">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-12">
                    <div className="add-prod-con">
                      <Formik
                        enableReinitialize={true}
                        initialValues={initialValues}
                        validationSchema={yup.object().shape({
                          name: yup.string().required("Name is required"),
                          description: yup.string(),
                          approved_id: yup.array(),
                          is_featured: yup
                            .string()
                            .required("Is Featured is required"),
                        })}
                        onSubmit={(values) => {
                          submitHandler(values);
                        }}
                      >
                        {({
                          errors,
                          touched,
                          values,
                          handleChange,
                          setFieldValue,
                        }) => (
                          <Form>
                            {productDetailsData &&
                              Object.keys(productDetailsData).length !== 0 && (
                                <div className="row add-product">
                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <FormikField
                                        label="Product Name"
                                        isRequired={true}
                                        name="name"
                                        touched={touched as any}
                                        errors={errors as any}
                                      />
                                    </div>
                                  </div>

                                  {!catloading && (
                                    <>
                                      <div className="col-md-3">
                                        <div className="form-group">
                                          <Select
                                            ref={parentSelectRef}
                                            options={parentCategories}
                                            placeholder="Select Category"
                                            isClearable={true}
                                            value={parentSelectValue as CategoryOption}
                                            styles={customSelectStyles}
                                            onChange={(e: SingleValue<CategoryOption>) => {
                                              setlevelOneCat([]);
                                              setlevelTwoCat([]);
                                              setlevelThreeCat([]);
                                              setlevelFourCat([]);
                                              setlevelFiveCat([]);
                                              setlevelSixCat([]);
                                              getChildCategories(e?.value, "1");
                                              if (e && e.value) {
                                                setParentSelectValue({
                                                  label: e.label,
                                                  value: e.value,
                                                });
                                                setFieldValue("categories", [
                                                  e.value,
                                                ]);
                                                setCat_id(e.value);
                                              } else {
                                                setFieldValue("categories", []);
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                      {levelOneCat &&
                                        levelOneCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelOneSelectRef}
                                                options={levelOneCat}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                value={levelOneSelectValue as CategoryOption}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "2"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelOneSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      {levelTwoCat &&
                                        levelTwoCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelTwoSelectRef}
                                                options={levelTwoCat}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                value={levelTwoSelectValue as CategoryOption}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "3"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelTwoSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      {levelThreeCat &&
                                        levelThreeCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelThreeSelectRef}
                                                options={levelThreeCat}
                                                value={levelThreeSelectValue as CategoryOption}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "4"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelThreeSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                      {levelFourCat &&
                                        levelFourCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelFourSelectRef}
                                                options={levelFourCat}
                                                value={levelFourSelectValue as CategoryOption}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "5"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelFourSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}

                                      {levelFiveCat &&
                                        levelFiveCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelFiveSelectRef}
                                                options={levelFiveCat}
                                                value={levelFiveSelectValue as CategoryOption}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "6"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelFiveSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                      {levelSixCat &&
                                        levelSixCat.length > 0 && (
                                          <div className="col-md-3">
                                            <div className="form-group">
                                              <Select
                                                ref={levelSixSelectRef}
                                                options={levelSixCat}
                                                value={levelSixSelectValue as CategoryOption}
                                                placeholder="Select Sub Category"
                                                isClearable={true}
                                                styles={customSelectStyles}
                                                onChange={(e: SingleValue<CategoryOption>) => {
                                                  getChildCategories(
                                                    e?.value,
                                                    "7"
                                                  );
                                                  if (e && e.value) {
                                                    setlevelSixSelectValue({
                                                      label: e.label,
                                                      value: e.value,
                                                    });
                                                    setCat_id(e.value);
                                                  } else {
                                                    setCat_id("");
                                                  }
                                                }}
                                              />
                                            </div>
                                          </div>
                                        )}
                                    </>
                                  )}

                                  <div className="col-md-12">
                                    <div className="form-group">
                                      <FormikField
                                        label="Product Description"
                                        type="textarea"
                                        isRequired={false}
                                        name="description"
                                        touched={touched as any}
                                        errors={errors as any}
                                        className="text-editor-area"
                                        cols={30}
                                        rows={10}
                                      />
                                    </div>
                                  </div>

                                  {values.approved_id == "o" && (
                                    <div className="col-md-8">
                                      <div className="form-group">
                                        <FormikField
                                          label="Approved name"
                                          isRequired={true}
                                          name="approved_name"
                                          touched={touched as any}
                                          errors={errors as any}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="col-md-12">
                                    <div className="row">
                                      <label>Upload Product Images</label>
                                      <Field
                                        id="gallery"
                                        name="gallery"
                                        type="file"
                                        className="file-control"
                                        value={undefined}
                                        multiple
                                        innerRef={imageUploader}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                          handleImageChange(event);
                                          gallery = event.target.files || undefined;
                                          setFieldValue("gallery", gallery);
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="gallery-image-pane d-flex">
                                    {galleryImages &&
                                      galleryImages.length !== 0 &&
                                      galleryImages.map((data, index) => {
                                        return (
                                          <div className="image-panel" key={index}>
                                            <img
                                              src={data}
                                              style={{
                                                width: "80px",
                                                height: "80px",
                                                objectFit: "cover",
                                              }}
                                              alt={`gallery-${index}`}
                                            />
                                          </div>
                                        );
                                      })}
                                    {images &&
                                      images.length !== 0 &&
                                      images.map((data, index) => {
                                        return (
                                          <div className="image-panel" key={index}>
                                            <img
                                              src={URL.createObjectURL(data)}
                                              style={{
                                                width: "80px",
                                                height: "80px",
                                                objectFit: "cover",
                                              }}
                                              alt={`upload-${index}`}
                                            />
                                          </div>
                                        );
                                      })}
                                  </div>

                                  <div className="col-md-12">
                                    <div className="row featured-image">
                                      <label>Upload Featured Image</label>
                                      <Field
                                        id="file"
                                        name="featured"
                                        type="file"
                                        className="file-control"
                                        value={undefined}
                                        innerRef={imageUploader}
                                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                          files = event.target.files?.[0];
                                          setFieldValue("featured", files);
                                          imageUploadHandler(event);
                                        }}
                                      />

                                      {productDetailsData.product_images &&
                                        productDetailsData.product_images
                                          .length !== 0 &&
                                        productDetailsData.product_images.map(
                                          (data, index) => {
                                            return (
                                              data.is_featured == 1 && (
                                                <div className="mt-2 mb-2" key={index}>
                                                  <img
                                                    ref={uploadedImage}
                                                    src={data.product_image_url}
                                                    style={{
                                                      width: "80px",
                                                      height: "80px",
                                                      objectFit: "cover",
                                                    }}
                                                    alt="featured"
                                                  />
                                                </div>
                                              )
                                            );
                                          }
                                        )}
                                    </div>
                                  </div>

                                  <div className="col-md-12">
                                    <div className="row qap-file">
                                      <label>Upload QAP File</label>
                                      <Field
                                        id="qap-file"
                                        name="qap"
                                        accept=".pdf"
                                        type="file"
                                        className="file-control"
                                        value={undefined}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                          const qap = e.target.files?.[0];
                                          setFieldValue("qap", qap);
                                        }}
                                      />

                                      {productDetailsData?.qap_new_file_name && (
                                        <div className="mt-2 mb-2">
                                          <>
                                            <a
                                              href={
                                                productDetailsData?.qap_new_file_name
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <i className="fa fa-file"></i>
                                            </a>
                                          </>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="col-md-12">
                                    <div className="row qap-file">
                                      <label>Upload TDS File</label>
                                      <Field
                                        id="tds-file"
                                        name="tds"
                                        accept=".pdf"
                                        type="file"
                                        className="file-control"
                                        value={undefined}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                          const tds = e.target.files?.[0];
                                          setFieldValue("tds", tds);
                                        }}
                                      />

                                      {productDetailsData?.tds_new_file_name && (
                                        <div className="mt-2 mb-2">
                                          <>
                                            <a
                                              href={
                                                productDetailsData?.tds_new_file_name
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <i className="fa fa-file"></i>
                                            </a>
                                          </>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="prod-spec-sec p-0 pt-3">
                                    <div className="col-md-12">
                                      <div className="specification ">
                                        <label>Product Variants</label>
                                        <FieldArray name="variations">
                                          {({ push, remove }) => (
                                            <>
                                              {variantData &&
                                                values.variations.map(
                                                  (field, index) => (
                                                    <div
                                                      key={index}
                                                      className="row"
                                                    >
                                                      <div className="col-md-3">
                                                        <div className="form-group">
                                                          <Field
                                                            name={`variations.${index}.attribute`}
                                                            type="text"
                                                            placeholder="Attribute"
                                                          />
                                                          <div className="form-error">
                                                            <ErrorMessage
                                                              name={`variations.${index}.attribute`}
                                                              className="form-error"
                                                            />
                                                          </div>
                                                        </div>
                                                      </div>

                                                      <div className="col-md-3">
                                                        <div className="form-group">
                                                          <Field
                                                            name={`variations.${index}.attributeValue`}
                                                            type="text"
                                                            placeholder="Attribute Value"
                                                          />
                                                          <div className="form-error">
                                                            <ErrorMessage
                                                              name={`variations.${index}.attributeValue`}
                                                              className="form-error"
                                                            />
                                                          </div>
                                                        </div>
                                                      </div>

                                                      {values.variations
                                                        .length > 1 && (
                                                        <div className="col-md-3">
                                                          <div className="form-group">
                                                            <Link
                                                              href="/"
                                                              onClick={(
                                                                event
                                                              ) => {
                                                                event.preventDefault();
                                                                remove(index);
                                                              }}
                                                              className="btn btn-primary"
                                                            >
                                                              Remove
                                                            </Link>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                )}
                                              <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() =>
                                                  push({
                                                    attribute: "",
                                                    attributeValue: "",
                                                  })
                                                }
                                              >
                                                Add Field
                                              </button>
                                            </>
                                          )}
                                        </FieldArray>
                                      </div>
                                      <div className="d-flex gap-4 mt-4">
                                        <div className="form-group">
                                          <FormikField
                                            label="Is Featured"
                                            type="select"
                                            selectOptions={isFeaturesArray}
                                            isRequired={true}
                                            name="is_featured"
                                            touched={touched as any}
                                            errors={errors as any}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                            <button
                              type="submit"
                              className="page-link btn btn-secondary"
                            >
                              Save
                            </button>
                          </Form>
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default EditProductReview;
