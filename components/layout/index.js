import React from "react";
import Sidebar from "./sidebar";
import Header from "./headers";

const Layout = (props) => {
  return (
    <>
      <Header />
      <Sidebar />
      <div className={"content-wrapper"}>{props.children}</div>
    </>
  );
};

export default Layout;
