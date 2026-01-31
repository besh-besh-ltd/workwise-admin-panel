import React from "react";
import { useSelector } from "react-redux";

interface RootState {
  sidebarShow: boolean;
}

interface FooterProps {
  [key: string]: unknown;
}

const Footer: React.FC<FooterProps> = (props) => {
  const sidebarShow = useSelector((state: RootState) => state.sidebarShow);
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <>
      <footer className={"main-footer " + (sidebarShow ? "" : "expand")}>
        <strong>
          &copy; {previousYear}-{currentYear}
        </strong>
        &nbsp; All rights reserved.
        <div className="float-right d-none d-sm-inline-block"></div>
      </footer>
    </>
  );
};

export default Footer;
