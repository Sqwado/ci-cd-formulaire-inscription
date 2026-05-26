import './RegistrationsList.css';

function RegistrationsList({
  registrations,
  title = 'Liste des inscrits',
  headingLevel = 'h2',
  highlightedIndex = null,
  testId = 'registrations-list-section',
  emptyMessage = 'Aucun inscrit pour le moment.'
}) {
  const HeadingTag = headingLevel;

  return (
    <section className="registrations-section" data-testid={testId}>
      <HeadingTag>{title}</HeadingTag>
      {registrations.length === 0 ? (
        <p data-testid="no-registrations">{emptyMessage}</p>
      ) : (
        <ul data-testid="registrations-list">
          {registrations.map((registration, index) => (
            <li
              key={`${registration.email}-${index}`}
              data-testid="registration-item"
              data-highlight-index={index}
              className={
                index === highlightedIndex ? 'registration-item-highlight' : undefined
              }
            >
              {registration.prenom} {registration.nom} - {registration.email} -{' '}
              {registration.dateOfBirth} - {registration.ville} ({registration.codePostal})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RegistrationsList;
