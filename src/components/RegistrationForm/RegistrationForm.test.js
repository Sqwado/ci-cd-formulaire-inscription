import { fireEvent, render, screen } from '@testing-library/react';
import RegistrationForm from './RegistrationForm';
import { REGISTRATION_FIELDS } from '../../constants/formFields';

const formValues = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  dateOfBirth: '1990-01-01',
  ville: 'Paris',
  codePostal: '75001'
};

test('affiche le titre, la description et tous les champs', () => {
  render(
    <RegistrationForm
      formValues={formValues}
      fieldErrors={{}}
      isSubmitDisabled={false}
      onChange={jest.fn()}
      onSubmit={jest.fn((event) => event.preventDefault())}
    />
  );

  expect(screen.getByRole('heading', { name: 'Inscription' })).toBeInTheDocument();
  expect(
    screen.getByText('Remplissez le formulaire pour enregistrer vos informations.')
  ).toBeInTheDocument();

  REGISTRATION_FIELDS.forEach((field) => {
    expect(screen.getByTestId(field.testId)).toBeInTheDocument();
  });
});

test('affiche les erreurs de champ et desactive le bouton', () => {
  const fieldErrors = { email: 'Email invalide' };

  render(
    <RegistrationForm
      formValues={formValues}
      fieldErrors={fieldErrors}
      isSubmitDisabled
      onChange={jest.fn()}
      onSubmit={jest.fn()}
    />
  );

  expect(screen.getByTestId('email-error')).toHaveTextContent('Email invalide');
  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('propage le submit et les changements de champ', () => {
  const onSubmit = jest.fn((event) => event.preventDefault());
  const onChange = jest.fn();

  render(
    <RegistrationForm
      title="Nouvelle inscription"
      description="Description personnalisee"
      formValues={formValues}
      fieldErrors={{}}
      isSubmitDisabled={false}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Martin' } });
  fireEvent.click(screen.getByTestId('submit'));

  expect(onChange).toHaveBeenCalled();
  expect(onSubmit).toHaveBeenCalled();
  expect(screen.getByRole('heading', { name: 'Nouvelle inscription' })).toBeInTheDocument();
  expect(screen.getByText('Description personnalisee')).toBeInTheDocument();
});
