import Image from "next/image";
import React from "react";
const MainLoading = () => {
  return (
    <div className="mainLoading">
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}/das_logo.png`}
        alt="logo"
        width={160}
        height={40}
        priority={true}
      />
      <div class="spinner-border text-light" role="status"></div>
    </div>
  );
};

export default MainLoading;
