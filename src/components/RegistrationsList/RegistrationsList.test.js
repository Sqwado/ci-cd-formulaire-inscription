import { render, screen } from '@testing-library/react';
import RegistrationsList from './RegistrationsList';

const sampleRegistrations = [
  {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.com',
    dateOfBirth: '1990-01-01',
    ville: 'Paris',
    codePostal: '75001'
  }
];

test('affiche un message quand la liste est vide', () => {
  render(<RegistrationsList registrations={[]} />);
  expect(screen.getByTestId('no-registrations')).toBeInTheDocument();
});

test('affiche les inscriptions et peut mettre en evidence une ligne', () => {
  render(
    <RegistrationsList registrations={sampleRegistrations} highlightedIndex={0} />
  );

  const item = screen.getByTestId('registration-item');
  expect(item).toHaveTextContent('Jean Dupont');
  expect(item).toHaveClass('registration-item-highlight');
});
