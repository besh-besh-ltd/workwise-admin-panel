import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import logo from "../../../public/assets/images/das_logo.png";
import sideMenu from "./menu.json";

interface MenuItem {
  title: string;
  link?: string;
  class?: string;
  active?: boolean;
  children: ChildMenuItem[];
  icon: string;
}

interface ChildMenuItem {
  title: string;
  link?: string;
  class?: string;
  active?: boolean;
  icon: string;
}

interface UserAccess {
  tile: string;
}

const Sidebar: React.FC = () => {
  const [showMenu, setShowMenu] = useState<MenuItem[]>(sideMenu as MenuItem[]);
  const [filteredMenuData, setFilteredMenuData] = useState<MenuItem[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess[] | string>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

   useEffect(() => {
    const savedCollapsed = localStorage.getItem("sidebarCollapsed");
    if (savedCollapsed === "true") {
      setIsCollapsed(true);
      document.body.classList.add("sidebar-mini", "sidebar-collapse");
    }
  }, []);

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem("sidebarCollapsed", newCollapsed.toString());
    if (newCollapsed) {
      document.body.classList.add("sidebar-mini", "sidebar-collapse");
    } else {
      document.body.classList.remove("sidebar-mini", "sidebar-collapse");
    }
  };

  useEffect(() => {
    const accessFromStorage = localStorage.getItem("access");
    if (accessFromStorage) {
      setUserAccess(JSON.parse(accessFromStorage));
    }
    console.log("user access", userAccess);
  }, []);

  useEffect(() => {
    if (Array.isArray(userAccess) && userAccess.length > 0) {
      const filtered = showMenu.reduce<MenuItem[]>((acc, item) => {
        const matchedChildren = item.children.filter((child) =>
          (userAccess as UserAccess[]).some((access) => access.tile === child.title)
        );
        if (matchedChildren.length > 0) {
          const parentWithMatchedChildren = {
            ...item,
            children: matchedChildren,
          };
          acc.push(parentWithMatchedChildren);
        } else {
          const isParentMatch = (userAccess as UserAccess[]).some(
            (access) => access.tile === item.title
          );
          if (isParentMatch) {
            acc.push({ ...item });
          }
        }
        return acc;
      }, []);
      setFilteredMenuData(filtered);
    } else if (userAccess === "all") {
      setFilteredMenuData(showMenu);
    } else {
      setFilteredMenuData([]);
    }
  }, [userAccess, showMenu]);

  useEffect(() => {
    const selectedMenuStr = localStorage.getItem("selectedMenu");
    const selectedMenu = selectedMenuStr ? JSON.parse(selectedMenuStr) : null;

    const updatedMenu = showMenu.slice();
    if (updatedMenu.length > 0) {
      updatedMenu[0].active = false;
    }

    if (selectedMenu) {
      if (
        selectedMenu.index >= 0 &&
        updatedMenu[selectedMenu.index] !== undefined
      ) {
        updatedMenu[selectedMenu.index].active = true;
      }
    }
    setShowMenu(updatedMenu);
  }, []);

  function handleActiveMenu(menuIndex: number, childrenIndex: number | null) {
    const menus: MenuItem[] = [];
    for (let index = 0; index < filteredMenuData.length; index++) {
      const element = { ...filteredMenuData[index], children: [...filteredMenuData[index].children] };
      element.active = false;

      for (let cIndex = 0; cIndex < element.children.length; cIndex++) {
        element.children[cIndex] = { ...element.children[cIndex], active: false };
      }

      if (index === menuIndex) {
        element.active = childrenIndex != null ? true : !element.active;
        if (childrenIndex != null) {
          element.children[childrenIndex] = { ...element.children[childrenIndex], active: true };
        }
      }

      menus.push(element);
    }
    setShowMenu(menus);
  }

  const handlePageNotation = (name: string, index: number, cIndex: number | null) => {
    localStorage.setItem("pageName", name);
    localStorage.setItem(
      "selectedMenu",
      JSON.stringify({
        index: index,
        cIndex: cIndex,
      })
    );
  };

  function truncate(str: string | undefined, maxLength: number): string {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  }

  return (
    <>
      <div className={"main-sidebar sidebar-dark-primary elevation-4 show"}>
        <Link href="#" className="brand-link d-flex justify-content-center">
        {/* Fixing the LCP */}
          <Image
            src={logo}
            alt="Work-wise logo"
            priority
            style={{
              width: isCollapsed ? "40px" : "150px",
              height: "auto",
              transition: "width 0.3s ease-in-out",
            }}
          />
        </Link>
        <div className="sidebar" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
          <nav className="mt-2" style={{ flex: 1, overflowY: "auto" }}>
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {filteredMenuData.map((item, i) => (
                <React.Fragment key={i}>
                  <li
                    className={`nav-item has-treeview ${item.class || ""}`}
                    key={i}
                  >
                    <Link
                      href={item.link || "#"}
                      className={`nav-link ${item.active ? "active" : ""}`}
                      onClick={(e) => {
                        handleActiveMenu(i, null);
                        if (item.link) {
                          handlePageNotation(item.title, i, null);
                        } else {
                          e.preventDefault();
                        }
                      }}
                      title={item.title}
                    >
                      <i className={`${item.icon || "fa fa-circle"} nav-icon`}></i>
                      <p>
                        {truncate(item.title, 20)}
                        {item.children && item.children.length > 0 && (
                          <i className="fa fa-angle-left right"></i>
                        )}
                      </p>
                    </Link>
                  </li>
                  {item.active &&
                    item.children.map((childrenItem, cIndex) => (
                      <li
                        className={`nav-item ml-2 ${childrenItem.class || ""}`}
                        key={`${i}${cIndex}`}
                      >
                        <Link
                          href={childrenItem.link || "#!"}
                          className={`nav-link sidebar-nav-item ${
                            childrenItem.active ? "active" : ""
                          }`}
                          onClick={() => {
                            handleActiveMenu(i, cIndex);
                            handlePageNotation(childrenItem.title, i, cIndex);
                          }}
                          title={childrenItem.title}
                        >
                          <i className={`${childrenItem.icon || "fa fa-circle"} nav-icon`}></i>
                          <p>{truncate(childrenItem.title, 20)}</p>
                        </Link>
                      </li>
                    ))}
                </React.Fragment>
              ))}
            </ul>
          </nav>
          <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <button
              onClick={toggleSidebar}
              className="btn btn-outline-light btn-block"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "flex-start",
                gap: "8px",
                padding: "8px 12px",
                fontSize: "14px",
              }}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`fa fa-angle-double-${isCollapsed ? "right" : "left"}`}></i>
              {!isCollapsed && <span>Collapse</span>}
            </button>
          </div>
        </div>
      </div>
      <div className={"menu-overlay"}></div>
    </>
  );
};

export default Sidebar;
