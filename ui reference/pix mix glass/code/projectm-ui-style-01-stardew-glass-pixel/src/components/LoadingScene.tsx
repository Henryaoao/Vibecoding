export function LoadingScene() {
  return (
    <section className="loading-scene" aria-label="正在同步 ProjectM 内容" aria-live="polite">
      <div className="loader-core" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="skeleton-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <span />
            <strong />
            <p />
            <p />
          </div>
        ))}
      </div>
    </section>
  );
}
