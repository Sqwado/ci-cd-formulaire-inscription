import './PageNavigation.css';

const VARIANT_CLASSES = {
  card: 'page-navigation--card',
  'below-form': 'page-navigation--below-form',
  'on-dark': 'page-navigation--on-dark',
  inline: ''
};

function PageNavigation({
  children,
  variant = 'card',
  ariaLabel = 'Navigation principale',
  className = ''
}) {
  const variantClass = VARIANT_CLASSES[variant] ?? '';

  return (
    <nav
      className={`page-navigation ${variantClass} ${className}`.trim()}
      aria-label={ariaLabel}
      data-testid="page-navigation"
    >
      {children}
    </nav>
  );
}

export default PageNavigation;
