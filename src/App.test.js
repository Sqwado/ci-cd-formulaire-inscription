import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';
import * as moduleApi from './module/module';

const goToRegistrationPage = () => {
  fireEvent.click(screen.getByTestId('go-to-registration'));
};

const fillValidForm = () => {
  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'jean.dupont@email.com' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '1990-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '75001' } });
};

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  jest.useRealTimers();
});

test('shows home page before registration form', () => {
  render(<App />);
  expect(screen.getByTestId('home-page')).toBeInTheDocument();
  expect(screen.queryByTestId('submit')).not.toBeInTheDocument();

  goToRegistrationPage();
  expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
  expect(screen.getByTestId('submit')).toBeInTheDocument();
});

test('disable submit button while required fields are not valid', () => {
  render(<App />);
  goToRegistrationPage();
  expect(screen.getByTestId('submit')).toBeDisabled();

  fillValidForm();
  expect(screen.getByTestId('submit')).toBeEnabled();

  fireEvent.change(screen.getByTestId('email'), { target: { value: '' } });
  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('show field errors in red and global error toast on invalid submission', () => {
  render(<App />);
  goToRegistrationPage();

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean' } });
  fireEvent.change(screen.getByTestId('email'), { target: { value: 'email-invalide' } });
  fireEvent.change(screen.getByTestId('dateDeNaissance'), { target: { value: '2009-01-01' } });
  fireEvent.change(screen.getByTestId('ville'), { target: { value: 'Paris9' } });
  fireEvent.change(screen.getByTestId('codePostal'), { target: { value: '7500' } });

  const form = screen.getByTestId('submit').closest('form');
  fireEvent.submit(form);

  expect(screen.getByTestId('email-error')).toBeInTheDocument();
  expect(screen.getByTestId('dateOfBirth-error')).toBeInTheDocument();
  expect(screen.getByTestId('ville-error')).toBeInTheDocument();
  expect(screen.getByTestId('codePostal-error')).toBeInTheDocument();
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Veuillez corriger les erreurs du formulaire.');
  expect(localStorage.getItem('registrations')).toBeNull();
});

test('submit valid form, show success toast, clear fields and save in registrations list', () => {
  render(<App />);
  goToRegistrationPage();
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('success-toast')).toHaveTextContent('Formulaire valide et enregistre.');
  expect(screen.getByTestId('nom')).toHaveValue('');
  expect(screen.getByTestId('prenom')).toHaveValue('');
  expect(screen.getByTestId('email')).toHaveValue('');
  expect(screen.getByTestId('dateDeNaissance')).toHaveValue('');
  expect(screen.getByTestId('ville')).toHaveValue('');
  expect(screen.getByTestId('codePostal')).toHaveValue('');

  expect(JSON.parse(localStorage.getItem('registrations'))).toEqual([
    {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      dateOfBirth: '1990-01-01',
      ville: 'Paris',
      codePostal: '75001'
    }
  ]);
});

test('hide success toast after timeout', () => {
  jest.useFakeTimers();
  render(<App />);
  goToRegistrationPage();
  fillValidForm();

  fireEvent.click(screen.getByTestId('submit'));
  expect(screen.getByTestId('success-toast')).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(3000);
  });

  expect(screen.queryByTestId('success-toast')).not.toBeInTheDocument();
});

test('load and display previously saved registrations list', () => {
  localStorage.setItem(
    'registrations',
    JSON.stringify([
      {
        nom: 'Martin',
        prenom: 'Alice',
        email: 'alice.martin@email.com',
        dateOfBirth: '1991-04-20',
        ville: 'Lyon',
        codePostal: '69001'
      }
    ])
  );

  render(<App />);
  goToRegistrationPage();

  expect(screen.queryByTestId('no-registrations')).not.toBeInTheDocument();
  expect(screen.getByTestId('registration-item')).toHaveTextContent('Alice Martin');
});

test('shows empty registrations message by default', () => {
  render(<App />);
  goToRegistrationPage();
  expect(screen.getByTestId('no-registrations')).toBeInTheDocument();
});

test('show fallback error toast when localStorage parsing fails on load', () => {
  localStorage.setItem('registrations', '{invalid json');
  render(<App />);
  goToRegistrationPage();
  expect(screen.getByTestId('error-toast')).toHaveTextContent('unable to parse saved registrations');
});

test('show fallback error toast when loading registrations throws without message', () => {
  const registrationsSpy = jest.spyOn(moduleApi, 'getRegistrations').mockImplementation(() => {
    throw {};
  });

  render(<App />);
  goToRegistrationPage();
  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  registrationsSpy.mockRestore();
});

test('handles unknown field name change without crashing', () => {
  render(<App />);
  goToRegistrationPage();
  fireEvent.change(screen.getByTestId('nom'), { target: { name: 'unknownField', value: 'foo' } });
  expect(screen.getByTestId('submit')).toBeDisabled();
});

test('show error toast when handleSubmit throws with message', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw new Error('Erreur de sauvegarde');
  });

  render(<App />);
  goToRegistrationPage();
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Erreur de sauvegarde');
  submitSpy.mockRestore();
});

test('show fallback error toast when handleSubmit throws without message', () => {
  const submitSpy = jest.spyOn(moduleApi, 'handleSubmit').mockImplementation(() => {
    throw {};
  });

  render(<App />);
  goToRegistrationPage();
  fillValidForm();
  fireEvent.click(screen.getByTestId('submit'));

  expect(screen.getByTestId('error-toast')).toHaveTextContent('Une erreur est survenue');
  submitSpy.mockRestore();
});

test('display nom and prenom field errors for invalid values', () => {
  render(<App />);
  goToRegistrationPage();

  fireEvent.change(screen.getByTestId('nom'), { target: { value: 'Dupont1' } });
  fireEvent.change(screen.getByTestId('prenom'), { target: { value: 'Jean2' } });

  expect(screen.getByTestId('nom-error')).toBeInTheDocument();
  expect(screen.getByTestId('prenom-error')).toBeInTheDocument();
});