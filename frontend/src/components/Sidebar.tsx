import { NavLink } from "react-router-dom";

const links = [
  ["/", "Dashboard"],
  ["/profiles", "Profiles"],
  ["/resumes", "Resumes"],
  ["/sources", "Sources"],
  ["/settings", "Settings"],
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <p className="eyebrow">Local-first job search</p>
        <h1>OpenJobs Local</h1>
        <p className="muted">Aggregate, rank, and track jobs against multiple search profiles.</p>
      </div>
      <nav>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
