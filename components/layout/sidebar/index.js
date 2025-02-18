import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import logo from "../../../public/assets/images/das_logo.png";
import sideMenu from "./menu.json";
import { getAdminProfile } from "@/utils/services/login"; // Import your API function for fetching the profile

const Sidebar = (props) => {
	const [showMenu, setShowMenu] = useState(sideMenu);
	const [filteredMenuData, setFilteredMenuData] = useState([]);
	const [userAccess, setUserAccess] = useState([]);
	const [userType, setUserType] = useState(null);

	// Fetch admin profile to get user type
	const getUserProfile = async () => {
		try {
			const res = await getAdminProfile();
			setUserType(res.data?.user_type || null);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		// Fetch user profile when the component mounts
		getUserProfile();
	
		const accessFromStorage = localStorage.getItem("access");
		if (accessFromStorage) {
			setUserAccess(JSON.parse(accessFromStorage));
		}
	}, []);

	useEffect(() => {
		// Filter menu data based on user type and user access
		if (userType === 6) {
			// If userType is 6, remove the last 3 menu items
			setFilteredMenuData(showMenu.slice(0, -3)); // Remove last 3 items
		} else if (userAccess.length > 0) {
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
						const isParentMatch = userAccess.some((access) => access.tile === item.title);
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
	}, [userAccess, showMenu, userType]); 

	useEffect(() => {
		let selectedMenu = localStorage.getItem("selectedMenu")
			? JSON.parse(localStorage.getItem("selectedMenu"))
			: null;
		let updatedMenu = showMenu.slice();
		updatedMenu[0].active = false;
		if (selectedMenu) {
			if (selectedMenu.index >= 0) {
				updatedMenu[selectedMenu.index].active = true;
			}
		}
		setShowMenu(updatedMenu);
	}, []);

	function handleActiveMenu(menuIndex, childrenIndex) {
		let menus = [];
		for (let index = 0; index < filteredMenuData.length; index++) {
			const element = filteredMenuData[index];
			for (let cIndex = 0; cIndex < element.children.length; cIndex++) {
				element.children[cIndex].active = false;
			}
			if (index === menuIndex) {
				element.active = childrenIndex != null ? true : !element.active;
				if (childrenIndex != null) {
					element.children[childrenIndex].active = true;
				}
			} else {
				element.active = false;
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

	return (
		<>
			<div className={"main-sidebar sidebar-dark-primary elevation-4 show"}>
				<Link href="#" className="brand-link d-flex justify-content-center">
					<Image src={logo} alt="Logo-1" />
				</Link>
				<div className="sidebar">
					<nav className="mt-2">
						<ul
							className="nav nav-pills nav-sidebar flex-column"
							data-widget="treeview"
							role="menu"
							data-accordion="false"
						>
							{/* ---------- Menu ----------- */}
							{filteredMenuData?.map((item, i) => (
								<>
									<li className={`nav-item has-treeview ${item.class}`} key={i}>
										<Link
											href={item.link ? item.link : ""}
											className={`nav-link ${item.active ? "active" : ""}`}
											onClick={(e) => {
												handleActiveMenu(i, null);
												item.link
													? handlePageNotation(item.title, i, null)
													: e.preventDefault();
											}}
										>
											<i className="nav-icon"></i>
											<p>
												<i className="nav-icon"></i> {item.title}
											</p>
										</Link>
									</li>
									{/* ---------- Children ------- */}
									{item.active &&
										item.children.map((childrenItem, cIndex) => (
											<li
												className={`nav-item ml-2 ${childrenItem.class}`}
												key={`${i}${cIndex}`}
											>
												<Link
													href={childrenItem.link ? childrenItem.link : "#!"}
													className={`nav-link sidebar-nav-item ${childrenItem.active ? "active" : ""}`}
													onClick={() => {
														handleActiveMenu(i, cIndex);
														handlePageNotation(childrenItem.title, i, cIndex);
													}}
												>
													<i className="fa fa-check nav-icon"></i>
													<p>{childrenItem.title}</p>
												</Link>
											</li>
										))}
								</>
							))}
						</ul>
					</nav>
				</div>
			</div>
			<div className={"menu-overlay "}></div>
		</>
	);
};

export default Sidebar;
