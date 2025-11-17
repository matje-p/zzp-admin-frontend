import './TopNav.css';

const TopNav = () => {
  return (
    <header className="top-nav">
      <div className="top-nav-content">
        <h1 className="top-nav-title">ZZP Admin</h1>
        <div className="top-nav-actions">
          <span className="user-info">Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
