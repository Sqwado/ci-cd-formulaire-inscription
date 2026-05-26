import { render, screen, fireEvent } from '@testing-library/react';
import FormField from './FormField';

test('affiche le champ et propage les changements', () => {
  const handleChange = jest.fn();

  render(
    <FormField
      label="Nom"
      name="nom"
      testId="nom"
      errorTestId="nom-error"
      value="Dupont"
      onChange={handleChange}
    />
  );

  const input = screen.getByTestId('nom');
  expect(input).toHaveValue('Dupont');

  fireEvent.change(input, { target: { value: 'Martin' } });
  expect(handleChange).toHaveBeenCalled();
});

test('affiche le message d erreur quand il est fourni', () => {
  render(
    <FormField
      label="Email"
      name="email"
      testId="email"
      errorTestId="email-error"
      value="bad"
      error="email must be a valid email address"
      onChange={() => {}}
    />
  );

  expect(screen.getByTestId('email-error')).toHaveTextContent('email must be a valid email address');
  expect(screen.getByTestId('email-error')).toHaveClass('field-error');
});
