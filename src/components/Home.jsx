import { useEffect, useState } from "react";
import { countItems } from "../storage/db.js";

const LINKS = [
  { page: "wardrobe", label: "My Wardrobe", hint: "Add and manage your clothes" },
  { page: "match", label: "Outfit Matcher", hint: "See what goes with one piece" },
  { page: "saved", label: "Saved Looks", hint: "Outfits you have kept" },
  { page: "settings", label: "Settings", hint: "Backup and privacy" },
];

export default function Home({ go }) {
  const [count, setCount] = useState(null); // null = loading
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    countItems()
      .then((n) => active && setCount(n))
      .catch((e) => active && setError(e.message || "Storage is not available."));
    return () => { active = false; };
  }, []);

  return (
    <div>
      <section className="hero">
        <p className="muted">Welcome</p>
        <h1>What are you wearing today?</h1>
        <p>WearWise helps you make outfits from the clothes you already own.</p>
        <button className="btn primary big" onClick={() => go("style")}>Style Me Today</button>
      </section>

      <section className="card" aria-live="polite">
        {error ? (
          <p role="alert">
            Your wardrobe could not be loaded. {error} Try a normal (not private) browser window.
          </p>
        ) : count === null ? (
          <p className="muted">Loading your wardrobe…</p>
        ) : count === 0 ? (
          <div>
            <h2>Your wardrobe is empty</h2>
            <p>Add a few shirts, bottoms and shoes. Then WearWise can suggest what goes together.</p>
            <button className="btn" onClick={() => go("wardrobe")}>Add your first item</button>
          </div>
        ) : (
          <p><strong>{count}</strong> {count === 1 ? "item" : "items"} in your wardrobe</p>
        )}
      </section>

      <h2 className="sr">Quick links</h2>
      <ul className="links">
        {LINKS.map((l) => (
          <li key={l.page}>
            <button className="linkcard" onClick={() => go(l.page)}>
              <strong>{l.label}</strong>
              <span className="muted">{l.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
