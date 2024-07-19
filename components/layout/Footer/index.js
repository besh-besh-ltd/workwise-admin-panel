import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const Footer = (props) => {
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <>
      <footer className={"main-footer " + (sidebarShow ? "" : "expand")}>
        <strong>
          &copy; {previousYear}-{currentYear}
          {/* <NavLink to='#'>panache.io</NavLink>.  */}
        </strong>
        &nbsp; All rights reserved.
        <div className="float-right d-none d-sm-inline-block"></div>
      </footer>
    </>
  );
};

export default Footer;
