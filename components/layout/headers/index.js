import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faUser, faBell } from "@fortawesome/free-solid-svg-icons";
import { useDispatch } from "react-redux";
import { removeToken, saveToken } from "@/app/login-slice";
const Header = (props) => {
  const dispatch = useDispatch();
  const route = useRouter();
  const [dropdown, setDropdown] = useState(0);
  const [routeName, setrouteName] = useState("");
  const handlePageNotation = (name) => {
    localStorage.setItem("pageName", name);
  };
  useEffect(() => {
    setrouteName(localStorage.getItem("pageName"));
  }, [route.pathname]);
  const handleDropDown = (N) => {
    if (dropdown == N) {
      setDropdown(0);
    } else {
      setDropdown(N);
    }
  };
  return (
    // <React.Fragment>
    <nav
      className={
        "main-header navbar navbar-expand bg-white navbar-light border-bottom " +
        ""
      }
    >
      <h4 className="header-route">{routeName}</h4>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item dropdown">
          <Link
            href="#"
            className="nav-link"
            data-bs-toggle="dropdown"
            aria-expanded="true"
            onClick={() => handleDropDown(1)}
          >
            <FontAwesomeIcon
              icon={faBell}
              className="fa-solid fa-bell"
            ></FontAwesomeIcon>
            {/* <i class="fa-solid fa-bell"></i> */}
          </Link>

          <div
            onClick={() => handleDropDown(1)}
            className={`dropdown-menu dropdown-menu-right ${
              dropdown == 1 ? "show" : ""
            }`}
          >
            <Link
              className="dropdown-item"
              href="/system-notification"
              onClick={() => handlePageNotation("notification")}
            >
              <h3 className="dropdown-item-title">System Notification</h3>
            </Link>

            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title"></h3>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title"></h3>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title"></h3>
            </button>
            <div className="dropdown-divider"></div>
          </div>
        </li>
        <li className="nav-item dropdown">
          <Link
            href="#"
            className="nav-link"
            data-bs-toggle="dropdown"
            aria-expanded="true"
            onClick={() => handleDropDown(2)}
          >
            <FontAwesomeIcon
              icon={faGear}
              className="fa-solid fa-gear"
            ></FontAwesomeIcon>
            {/* <i class="fa-solid fa-gear"></i> */}
          </Link>
          <div
            onClick={() => handleDropDown(2)}
            className={`dropdown-menu dropdown-menu-lg dropdown-menu-right ${
              dropdown == 2 ? "show" : ""
            }`}
          >
            <button className="dropdown-item">
              <h3 className="dropdown-item-title">Logo</h3>
            </button>

            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title">Site Title</h3>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title">SMTP Configuration</h3>
            </button>
            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3 className="dropdown-item-title">Admin Email</h3>
            </button>
            <div className="dropdown-divider"></div>
          </div>
        </li>
        <li className="nav-item dropdown">
          <Link
            href="#"
            className="nav-link"
            data-bs-toggle="dropdown"
            aria-expanded="true"
            onClick={() => handleDropDown(3)}
          >
            <FontAwesomeIcon
              icon={faUser}
              className="fa-solid fa-user mr-2"
            ></FontAwesomeIcon>
          </Link>
          <div
            onClick={() => handleDropDown(3)}
            className={`dropdown-menu dropdown-menu-lg dropdown-menu-right ${
              dropdown == 3 ? "show" : ""
            }`}
          >
            <button className="dropdown-item">
              <h3 className="dropdown-item-title">Edit Profile</h3>
            </button>

            <div className="dropdown-divider"></div>
            <button className="dropdown-item">
              <h3
                className="dropdown-item-title"
                onClick={() => {
                  dispatch(removeToken());
                  route.push("/");
                }}
              >
                Logout
              </h3>
            </button>
            <div className="dropdown-divider"></div>
          </div>
        </li>
      </ul>
    </nav>
    // </React.Fragment>
  );
};

export default Header;
