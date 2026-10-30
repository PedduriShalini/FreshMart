import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: "bi-house",
      end: true,
    },
    {
      title: "Products",
      path: "/admin/products",
      icon: "bi-cart",
    },
    {
      title: "Categories",
      path: "/admin/categories",
      icon: "bi-list",
    },
    {
      title: "Orders",
      path: "/admin/orders",
      icon: "bi-basket2",
    },
    {
      title: "Customers",
      path: "/admin/customers",
      icon: "bi-people",
    },
    {
      title: "Reviews",
      path: "/admin/reviews",
      icon: "bi-star",
    },
  ];

  const upcomingItems = [
    {
      title: "Support",
      icon: "bi-headset",
    },
  ];

  return (
    <aside className="sidebar">
      <h4 className="logo">FreshMart</h4>

      <ul className="menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end || false}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.title}</span>
            </NavLink>
          </li>
        ))}

        <p className="menu-title">Store Management</p>

        {upcomingItems.map((item) => (
          <li key={item.title}>
            <span
              className="sidebar-link disabled-link"
              title={`${item.title} page is not implemented yet`}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.title}</span>
              <small className="ms-auto">Soon</small>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
