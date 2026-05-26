export const EMPTY_FORM_VALUES = {
  nom: '',
  prenom: '',
  email: '',
  dateOfBirth: '',
  ville: '',
  codePostal: ''
};

export const REGISTRATION_FIELDS = [
  {
    name: 'nom',
    label: 'Nom',
    placeholder: 'Dupont',
    testId: 'nom',
    errorTestId: 'nom-error',
    type: 'text'
  },
  {
    name: 'prenom',
    label: 'Prenom',
    placeholder: 'Jean',
    testId: 'prenom',
    errorTestId: 'prenom-error',
    type: 'text'
  },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'jean.dupont@email.com',
    testId: 'email',
    errorTestId: 'email-error',
    type: 'email'
  },
  {
    name: 'dateOfBirth',
    label: 'Date de naissance',
    placeholder: 'YYYY-MM-DD',
    testId: 'dateDeNaissance',
    errorTestId: 'dateOfBirth-error',
    type: 'text'
  },
  {
    name: 'ville',
    label: 'Ville',
    placeholder: 'Paris',
    testId: 'ville',
    errorTestId: 'ville-error',
    type: 'text'
  },
  {
    name: 'codePostal',
    label: 'Code postal',
    placeholder: '75001',
    testId: 'codePostal',
    errorTestId: 'codePostal-error',
    type: 'text'
  }
];
