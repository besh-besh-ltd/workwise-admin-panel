import React, { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./headers";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = (props) => {
  return (
    <>
      <Header />
      <Sidebar />
      <div className={"content-wrapper"}>{props.children}</div>
    </>
  );
};

export default Layout;
