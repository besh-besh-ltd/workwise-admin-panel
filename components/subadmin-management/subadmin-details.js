import { getSubAdminDetails } from '@/utils/services/subadmin-management';
import Link from 'next/link'
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import img1 from "../../public/assets/images/products.png";
import Image from 'next/image';

const SubAdminDetails = () => {
    const router = useRouter();
    const [subAdminData, setSubAdminData] = useState(null);

    const handleSubadminData = () => {
        getSubAdminDetails(router?.query?.id)
            .then((res) => {
                setSubAdminData(res.data)
            })
            .catch((err) => console.log("err", err));
    }
    useEffect(() => { console.log(subAdminData, "subAdminData *") }, [subAdminData])
    useEffect(() => {
        if (router?.query?.id) {
            handleSubadminData();
        }
    }, [router])
    return (
        <>
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">SubAdmin</h1>
                    </div>
                </div>
            </div>
            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/subadmin-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <div className="d-flex">
                                <div class="text-center mr-5">
                                    {subAdminData && subAdminData.length > 0 && subAdminData[0].image_url !== null ? (
                                        <Image
                                            width={80}
                                            height={80}
                                            src={subAdminData[0].image_url}
                                            unoptimized
                                            className="rounded-circle prof-img"
                                            alt="..."
                                        />
                                    ) : (
                                        <Image
                                            width={80}
                                            height={80}
                                            src={img1}
                                            unoptimized
                                            className="rounded-circle prof-img"
                                            alt="..." />
                                    )}
                                </div>
                                <div className="ml-4">
                                    <p className="mb-1">
                                        <strong>Name:</strong> {subAdminData && subAdminData.length > 0 && subAdminData[0].name}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Mobile:</strong> {subAdminData && subAdminData.length > 0 && subAdminData[0].mobile}
                                    </p>
                                    <p className="mb-1">
                                        <strong>Email:</strong> {subAdminData && subAdminData.length > 0 && subAdminData[0].email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default SubAdminDetails