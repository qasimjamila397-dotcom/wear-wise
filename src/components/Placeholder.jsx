export default function Placeholder({ title, stage, children }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      <p>{children}</p>
      <p className="muted">This screen is built in Stage {stage}. It is not available yet.</p>
    </section>
  );
}
