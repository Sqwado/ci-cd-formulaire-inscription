import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavLink from './NavLink';

test('affiche un lien interne', () => {
  render(
    <MemoryRouter>
      <NavLink to="/register" testId="go-to-registration" variant="primary">
        Inscription
      </NavLink>
    </MemoryRouter>
  );

  const link = screen.getByTestId('go-to-registration');
  expect(link).toHaveAttribute('href', '/register');
  expect(link).toHaveClass('nav-link--primary');
});

test('affiche un lien externe', () => {
  render(
    <NavLink href="/docs/index.html" external testId="go-to-docs" theme="dark">
      Documentation
    </NavLink>
  );

  const link = screen.getByTestId('go-to-docs');
  expect(link).toHaveAttribute('href', '/docs/index.html');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveClass('nav-link--on-dark');
});
