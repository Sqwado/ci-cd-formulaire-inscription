import { render, screen } from '@testing-library/react';
import PageNavigation from './PageNavigation';

test('affiche la barre de navigation avec ses enfants', () => {
  render(
    <PageNavigation variant="card" ariaLabel="Navigation test">
      <span>Lien 1</span>
      <span>Lien 2</span>
    </PageNavigation>
  );

  expect(screen.getByTestId('page-navigation')).toHaveClass('page-navigation--card');
  expect(screen.getByText('Lien 1')).toBeInTheDocument();
  expect(screen.getByText('Lien 2')).toBeInTheDocument();
});

test('applique les variantes below-form et on-dark', () => {
  const { rerender } = render(
    <PageNavigation variant="below-form">
      <span>Sous formulaire</span>
    </PageNavigation>
  );
  expect(screen.getByTestId('page-navigation')).toHaveClass('page-navigation--below-form');

  rerender(
    <PageNavigation variant="on-dark">
      <span>Sur fond sombre</span>
    </PageNavigation>
  );
  expect(screen.getByTestId('page-navigation')).toHaveClass('page-navigation--on-dark');
});

test('ignore un variant inconnu', () => {
  render(
    <PageNavigation variant="inconnu">
      <span>Inconnu</span>
    </PageNavigation>
  );

  expect(screen.getByTestId('page-navigation')).not.toHaveClass('page-navigation--card');
});

test('utilise la variante card par defaut', () => {
  render(
    <PageNavigation>
      <span>Defaut</span>
    </PageNavigation>
  );

  expect(screen.getByTestId('page-navigation')).toHaveClass('page-navigation--card');
});

test('applique la variante inline par defaut sans classe supplementaire', () => {
  render(
    <PageNavigation variant="inline">
      <span>Inline</span>
    </PageNavigation>
  );

  const navigation = screen.getByTestId('page-navigation');
  expect(navigation).toHaveClass('page-navigation');
  expect(navigation).not.toHaveClass('page-navigation--card');
});
