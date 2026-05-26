function HomePage({ onStart }) {
  return (
    <section className="home-page" data-testid="home-page">
      <h1>Bienvenue</h1>
      <p>
        Inscrivez-vous en quelques clics. Renseignez vos informations personnelles
        et consultez la liste des inscrits.
      </p>
      <button type="button" data-testid="go-to-registration" onClick={onStart}>
        Commencer l&apos;inscription
      </button>
    </section>
  );
}

export default HomePage;
