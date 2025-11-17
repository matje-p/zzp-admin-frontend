import { Link, Outlet, useLocation } from 'react-router-dom';
import { CheckSquare, Landmark, FileText, Send, BookUser, CalendarClock, TrendingUp, Scale } from 'lucide-react';
import TopNav from './TopNav';
import { getForMeTodosCount } from '../../pages/Todos';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const todosCount = getForMeTodosCount();

  const navItems = [
    {
      path: '/todos',
      label: 'To-do\'s',
      badge: todosCount,
      icon: <CheckSquare size={20} />
    },
    {
      path: '/transactions',
      label: 'Transactions',
      icon: <Landmark size={20} />
    },
    {
      path: '/purchase-invoices',
      label: 'Purchase invoices',
      icon: <FileText size={20} />
    },
    {
      path: '/subscriptions',
      label: 'Subscriptions',
      icon: <CalendarClock size={20} />
    },
    {
      path: '/outbound-invoices',
      label: 'Sales invoices',
      icon: <Send size={20} />
    },
    {
      path: '/contacts',
      label: 'Contacts',
      icon: <BookUser size={20} />
    },
    {
      path: '/pl',
      label: 'Profit & Loss',
      icon: <TrendingUp size={20} />
    },
    {
      path: '/balance-sheet',
      label: 'Balance Sheet',
      icon: <Scale size={20} />
    },
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
                  <span className="nav-item-content">
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </span>
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
