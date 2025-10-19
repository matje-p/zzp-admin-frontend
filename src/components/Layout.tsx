import { Link, Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import './Layout.css';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/transactions', label: 'Transactions' },
    { path: '/invoices', label: 'Invoices' },
    { path: '/contacts', label: 'Contacts' },
  ];

  return (
    <div className="layout">
      <TopNav />
      <div className="layout-body">
        <nav className="sidebar">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
