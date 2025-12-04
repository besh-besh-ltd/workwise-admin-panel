import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import logo from "../../../public/assets/images/das_logo.png";
import sideMenu from "./menu.json";

const Sidebar = () => {
  const [showMenu, setShowMenu] = useState(sideMenu);
  const [filteredMenuData, setFilteredMenuData] = useState([]);
  const [userAccess, setUserAccess] = useState([]);

  useEffect(() => {
    const accessFromStorage = localStorage.getItem("access");
    if (accessFromStorage) {
      setUserAccess(JSON.parse(accessFromStorage));
    }
    console.log("user access", userAccess);
  }, []);

  useEffect(() => {
    if (userAccess.length > 0) {
      if (userAccess === "all") {
        setFilteredMenuData(showMenu);
      } else {
        const filtered = showMenu.reduce((acc, item) => {
          const matchedChildren = item.children.filter((child) =>
            userAccess.some((access) => access.tile === child.title)
          );
          if (matchedChildren.length > 0) {
            const parentWithMatchedChildren = {
              ...item,
              children: matchedChildren,
            };
            acc.push(parentWithMatchedChildren);
          } else {
            const isParentMatch = userAccess.some(
              (access) => access.tile === item.title
            );
            if (isParentMatch) {
              acc.push({ ...item });
            }
          }
          return acc;
        }, []);
        setFilteredMenuData(filtered);
      }
    } else {
      setFilteredMenuData([]);
    }
  }, [userAccess, showMenu]);

  useEffect(() => {
    let selectedMenu = localStorage.getItem("selectedMenu")
      ? JSON.parse(localStorage.getItem("selectedMenu"))
      : null;

    let updatedMenu = showMenu.slice();
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

  function handleActiveMenu(menuIndex, childrenIndex) {
    let menus = [];
    for (let index = 0; index < filteredMenuData.length; index++) {
      const element = { ...filteredMenuData[index] }; // Ensure a new object is created
      element.active = false;

      for (let cIndex = 0; cIndex < element.children.length; cIndex++) {
        element.children[cIndex].active = false;
      }

      if (index === menuIndex) {
        element.active = childrenIndex != null ? true : !element.active;
        if (childrenIndex != null) {
          element.children[childrenIndex].active = true;
        }
      }

      menus.push(element);
    }
    setShowMenu(menus);
  }

  const handlePageNotation = (name, index, cIndex) => {
    localStorage.setItem("pageName", name);
    localStorage.setItem(
      "selectedMenu",
      JSON.stringify({
        index: index,
        cIndex: cIndex,
      })
    );
  };

  function truncate(str, maxLength) {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}


  return (
    <>
      <div className={"main-sidebar sidebar-dark-primary elevation-4 show"}>
        <Link href="#" className="brand-link d-flex justify-content-center">
        {/* Fixing the LCP */}
          <Image src={logo} alt="Logo-1" priority/>
        </Link>
        <div className="sidebar">
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              {filteredMenuData.map((item, i) => (
                <React.Fragment key={i}>
                  <li
                    className={`nav-item has-treeview ${item.class}`}
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
                    >
                      <i className="nav-icon"></i>
                      <p>
                        <i className="nav-icon"></i> {truncate(item.title, 20)}
                      </p>
                    </Link>
                  </li>
                  {item.active &&
                    item.children.map((childrenItem, cIndex) => (
                      <li
                        className={`nav-item ml-2 ${childrenItem.class}`}
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
                        >
                          <i className="fa fa-check nav-icon"></i>
                          <p>{truncate(childrenItem.title, 20)}</p>
                        </Link>
                      </li>
                    ))}
                </React.Fragment>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className={"menu-overlay"}></div>
    </>
  );
};

export default Sidebar;
