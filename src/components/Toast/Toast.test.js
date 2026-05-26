import { render, screen } from '@testing-library/react';
import Toast from './Toast';

test('n affiche rien sans message', () => {
  const { container } = render(<Toast message="" type="success" />);
  expect(container).toBeEmptyDOMElement();
});

test('affiche un toast de succes', () => {
  render(<Toast message="Operation reussie" type="success" />);
  const toast = screen.getByTestId('success-toast');
  expect(toast).toHaveTextContent('Operation reussie');
  expect(toast).toHaveClass('toast-success');
});

test('affiche un toast d erreur par defaut', () => {
  render(<Toast message="Une erreur" />);
  const toast = screen.getByTestId('error-toast');
  expect(toast).toHaveTextContent('Une erreur');
  expect(toast).toHaveClass('toast-error');
});
