import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import logo from "../../../public/assets/images/das_logo.png";
import sideMenu from "./menu.json";

const Sidebar = (props) => {
	const [showMenu, setShowMenu] = useState(sideMenu);
	const [filteredMenuData, setFilteredMenuData] = useState([]);
	const [userAccess, setUserAccess] = useState([]);

	useEffect(() => {
		const accessFromStorage = localStorage.getItem('access');
		if (accessFromStorage) {
			setUserAccess(JSON.parse(accessFromStorage));
		}
	}, []);

	useEffect(() => {
		if (userAccess.length > 0) {
			if (userAccess === 'all') {
				setFilteredMenuData(showMenu);
			} else {
				const filtered = showMenu?.reduce((acc, item) => {
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
	}, [userAccess, showMenu]);

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
			// if (selectedMenu.cIndex >= 0) {
			// 	updatedMenu[selectedMenu.index].children[
			// 		selectedMenu.cIndex
			// 	].active = true;
			// }
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
				childrenIndex != null
					? (element.children[childrenIndex].active = true)
					: "";
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
							{filteredMenuData?.map((item, i) => {
								return (
									<>
										<li
											className={`nav-item has-treeview ${item.class}`}
											key={i}
										>
											<Link
												href={item.link ? item.link : ""}
												className={`nav-link ${item.active ? "active" : ""}`}
												key={i}
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
											item.children.map((childrenItem, cIndex) => {
												return (
													<li
														className={`nav-item ml-2 ${childrenItem.class}`}
														key={`${i}${cIndex}`}
													>
														<Link
															href={
																childrenItem.link ? childrenItem.link : "#!"
															}
															className={`nav-link sidebar-nav-item ${childrenItem.active ? "active" : ""
																}`}
															key={`${i}${cIndex}`}
															onClick={() => {
																handleActiveMenu(i, cIndex);
																handlePageNotation(
																	childrenItem.title,
																	i,
																	cIndex
																);
															}}
														>
															<i className="fa fa-check nav-icon"></i>
															<p>{childrenItem.title}</p>
														</Link>
													</li>
												);
											})}
									</>
								);
							})}
						</ul>
					</nav>
				</div>
			</div>
			<div className={"menu-overlay "}></div>
		</>
	);
};

export default Sidebar;
