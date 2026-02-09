import { getMemberDetailsById, updateTeamMember } from '@/utils/services/team-management';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import UploadFiles from "@/components/shared/ImagesUpload";
import FormikField from '../shared/FormikField';
import * as yup from "yup";
import Link from 'next/link';
import Image from 'next/image';

interface MemberDetails {
    id: number;
    name: string;
    role: string;
    mobile: string;
    email: string;
    profile_image: string;
    page_id: number;
    linkedin: string;
    twitter: string;
    facebook: string;
    whatsapp: string;
    status: number;
}

interface FormValues {
    name: string;
    role: string;
    mobile: string;
    email: string;
    page_id: number;
    linkedin: string;
    twitter: string;
    facebook: string;
    whatsapp: string;
    status: number;
}

const EditTeamMember: React.FC = () => {
    const router = useRouter();
    const [selectedFilesCreated, setSelectedFilesCreated] = useState<File[]>([]);
    const [selectedFilesReset, setSelectedFilesReset] = useState<boolean>(false);
    const [memberDetails, setMemberDetails] = useState<MemberDetails | null>(null);


    const validationSchema = yup.object().shape({
        name: yup.string().trim().required("Member Name is required"),
        role: yup.string().trim().required("Member Role is required"),
        mobile: yup.string().trim()
            .matches(/^[0-9]+$/, "Mobile number must only contain digits")
            .min(10, "Mobile number must be at least 10 digits")
            .max(15, "Mobile number must be at most 15 digits")
            .nullable()
            .notRequired(),
        email: yup.string().email("Invalid email address").nullable().notRequired(),
        page_id: yup.string().trim().required("Page ID is required"),
        linkedin: yup.string().url("Invalid LinkedIn URL").nullable().notRequired(),
        twitter: yup.string().url("Invalid Twitter URL").nullable().notRequired(),
        facebook: yup.string().url("Invalid Facebook URL").nullable().notRequired(),
        whatsapp: yup.string().trim()
            .matches(/^[0-9]+$/, "WhatsApp number must only contain digits")
            .min(10, "WhatsApp number must be at least 10 digits")
            .max(15, "WhatsApp number must be at most 15 digits")
            .nullable().notRequired(),
        status: yup.number().oneOf([0, 1], "Status must be either 0 or 1").required("Status is required"),
    });

    const getMemberDetails = async (memberId: string | string[]): Promise<void> => {
        try {
            const res : any = await getMemberDetailsById(memberId);
            setMemberDetails(res.data);
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const submitHandler = (values: FormValues, resetForm: () => void): void => {
        let payload = {
            ...values,
            profile_image: selectedFilesCreated[0] ? selectedFilesCreated[0] : null,
        }

        updateTeamMember(memberDetails!.id, payload)
            .then((res: { message: string }) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/team-management");
                }, 2000);
            })
            .catch((error: { message: string }) => {
                toast.error(error.message);
            });
    };

    useEffect(() => {
        if (router.isReady) {
            const { id } = router.query;
            if (id) {
                getMemberDetails(id);
            }
        }
    }, [router]);


    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Update Team Member</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/team-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>

                    {memberDetails &&
                        <div className="card col-12">
                            <div className="card-body">
                                <div className="container-fluid">
                                    <div className="col-md-12">
                                        <Formik
                                            enableReinitialize={true}
                                            initialValues={{
                                                name: memberDetails.name || "",
                                                role: memberDetails.role || "",
                                                mobile: memberDetails.mobile || "",
                                                email: memberDetails.email || "",
                                                page_id: memberDetails.page_id || 2,
                                                linkedin: memberDetails.linkedin || "",
                                                twitter: memberDetails.twitter || "",
                                                facebook: memberDetails.facebook || "",
                                                whatsapp: memberDetails.whatsapp || "",
                                                status: memberDetails.status || 1
                                            }}
                                            validationSchema={validationSchema}
                                            onSubmit={(values, { resetForm }) => {
                                                console.log(values)
                                                submitHandler(values, resetForm);
                                            }}
                                        >
                                            {({ errors, touched, values }: { errors: FormikErrors<FormValues>; touched: FormikTouched<FormValues>; values: FormValues }) => (
                                                <Form>
                                                    <div className="add-product row">
                                                        <div className="col-md-6 col-lg-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Member Name"
                                                                    isRequired={true}
                                                                    name="name"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6 col-lg-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Email"
                                                                    isRequired={false}
                                                                    name="email"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6 col-lg-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Mobile"
                                                                    isRequired={false}
                                                                    name="mobile"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Member Role"
                                                                    isRequired={true}
                                                                    name="role"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Status"
                                                                    type="select"
                                                                    isRequired={true}
                                                                    selectOptions={[
                                                                        {
                                                                            label: "Select Status",
                                                                            value: "",
                                                                            disabled: true,
                                                                        },
                                                                        { label: "Active", value: "1" },
                                                                        { label: "Inactive", value: "0" },
                                                                    ]}
                                                                    name="status"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3">
                                                            <FormikField
                                                                label="View On"
                                                                type="select"
                                                                isRequired={true}
                                                                selectOptions={[
                                                                    {
                                                                        label: "Select Page",
                                                                        value: "",
                                                                        disabled: true,
                                                                    },
                                                                    { label: "Home Page", value: "1" },
                                                                    { label: "About Us Page", value: "2" },
                                                                ]}
                                                                name="page_id"
                                                                touched={touched}
                                                                errors={errors}
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="row px-2 pb-2 pt-0">
                                                                <b className='px-0 mb-2'>Profile Image</b>
                                                                <div className="border rounded p-2">
                                                                    <Image
                                                                        src={memberDetails.profile_image}
                                                                        alt={memberDetails.name}
                                                                        width={150}
                                                                        height={150}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="row">
                                                                <UploadFiles
                                                                    accept={[".png, .jpg, .jpeg, .webp, .gif"]}
                                                                    upload={setSelectedFilesCreated}
                                                                    reset={selectedFilesReset}
                                                                    label="Upload New Image"
                                                                    isMultiple={false}
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="LinkedIn URL"
                                                                    isRequired={true}
                                                                    name="linkedin"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Facebook URL"
                                                                    isRequired={false}
                                                                    name="facebook"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Twitter URL"
                                                                    isRequired={false}
                                                                    name="twitter"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Whatsapp"
                                                                    isRequired={false}
                                                                    name="whatsapp"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="d-flex float-left">
                                                            <button type="submit" className="btn btn-secondary">
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            )
                                            }
                                        </Formik>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </section>
        </>
    );
}

export default EditTeamMember
