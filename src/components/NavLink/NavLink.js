import { Link } from 'react-router-dom';
import './NavLink.css';

function NavLink({
  to,
  href,
  children,
  variant = 'secondary',
  theme = 'light',
  testId,
  external = false
}) {
  const className = [
    'nav-link',
    `nav-link--${variant}`,
    theme === 'dark' ? 'nav-link--on-dark' : ''
  ]
    .filter(Boolean)
    .join(' ');

  if (external || href) {
    return (
      <a
        href={href}
        className={className}
        data-testid={testId}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} data-testid={testId}>
      {children}
    </Link>
  );
}

export default NavLink;
