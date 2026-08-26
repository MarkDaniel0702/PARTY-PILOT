import { GAME_GROUPS } from './gameData';

function MetaChip({ icon: Icon, label, variant }) {
  const className = variant ? `meta-chip meta-${variant}` : 'meta-chip';
  return (
    <span className={className}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{label}</span>
    </span>
  );
}

function GameCard({ href, icon: Icon, title, desc, accent, meta }) {
  return (
    <a className="game-card" href={href} style={{ '--card-accent': accent }}>
      <span className="card-icon" aria-hidden="true">
        <Icon size={30} strokeWidth={1.75} />
      </span>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{desc}</p>
      <div className="card-meta">
        {meta.map((chip) => (
          <MetaChip key={chip.label} {...chip} />
        ))}
      </div>
    </a>
  );
}

function GameGroup({ label, icon: Icon, games }) {
  return (
    <div className="game-group">
      <h2 className="game-group-label">
        <Icon size={16} strokeWidth={2} aria-hidden="true" />
        <span>{label}</span>
      </h2>
      <div className="game-grid">
        {games.map((game) => (
          <GameCard key={game.href} {...game} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main className="home">
      <header className="home-header">
        <div className="badge">PARTY NIGHT &middot; NO SIGN-UP &middot; NO HOST REQUIRED</div>
        <h1 className="home-title">
          <span className="line line-1">B-</span>
          <span className="line line-2">ROTATION</span>
        </h1>
        <p className="home-tagline">
          12 party games. One shared screen. The app runs turns, customizable timers, and scoring
          — nobody has to sit out and host.
        </p>
      </header>

      <section className="game-groups">
        {GAME_GROUPS.map((group) => (
          <GameGroup key={group.label} {...group} />
        ))}
      </section>

      <footer className="home-footer">Works on one screen &middot; no install &middot; no accounts</footer>
    </main>
  );
}
