import { useState } from "react";
import { CATEGORIES, COLORS, PATTERNS, STYLES, OCCASIONS, SEASONS } from "../data/options.js";
import { emptyForm, validateItem } from "../utils/validate.js";

function Err({ id, text }) {
  return text ? <p className="error" id={id}>{text}</p> : null;
}

export default function ItemForm({ initial, onSave, onCancel, saving, saveError }) {
  const [f, setF] = useState(initial ? { ...emptyForm(), ...initial } : emptyForm());
  const [errors, setErrors] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k, v) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  function submit(e) {
    e.preventDefault();
    const r = validateItem(f);
    setErrors(r.errors);
    if (r.ok) onSave(r.values);
  }
  const bad = (k) => (errors[k] ? { "aria-invalid": true, "aria-describedby": "e-" + k } : {});

  return (
    <form className="card form" onSubmit={submit} noValidate>
      <h1>{initial ? "Edit item" : "Add an item"}</h1>
      {Object.keys(errors).length > 0 && <p role="alert" className="error">Please fix the highlighted fields.</p>}
      {saveError && <p role="alert" className="error">{saveError}</p>}

      <label htmlFor="f-name">Name</label>
      <input id="f-name" value={f.name} maxLength={60} onChange={(e) => set("name", e.target.value)} {...bad("name")} />
      <Err id="e-name" text={errors.name} />

      <label htmlFor="f-cat">Category</label>
      <select id="f-cat" value={f.category} onChange={(e) => setF((p) => ({ ...p, category: e.target.value, subcategory: CATEGORIES[e.target.value].subs[0] }))}>
        {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
      </select>

      <label htmlFor="f-sub">Type</label>
      <select id="f-sub" value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} {...bad("subcategory")}>
        {(CATEGORIES[f.category]?.subs || []).map((s) => <option key={s}>{s}</option>)}
      </select>

      <label htmlFor="f-color">Main colour</label>
      <select id="f-color" value={f.color} onChange={(e) => set("color", e.target.value)} {...bad("color")}>
        <option value="">Choose a colour…</option>
        {Object.keys(COLORS).map((c) => <option key={c}>{c}</option>)}
      </select>
      <Err id="e-color" text={errors.color} />

      <label htmlFor="f-color2">Second colour (optional)</label>
      <select id="f-color2" value={f.color2} onChange={(e) => set("color2", e.target.value)}>
        <option value="">None</option>
        {Object.keys(COLORS).map((c) => <option key={c}>{c}</option>)}
      </select>

      <label htmlFor="f-pattern">Pattern</label>
      <select id="f-pattern" value={f.pattern} onChange={(e) => set("pattern", e.target.value)}>
        {PATTERNS.map((p) => <option key={p}>{p}</option>)}
      </select>

      <label htmlFor="f-style">Style (optional)</label>
      <select id="f-style" value={f.style} onChange={(e) => set("style", e.target.value)}>
        <option value="">Not sure</option>
        {STYLES.map((s) => <option key={s}>{s}</option>)}
      </select>

      <fieldset><legend>Good for (optional)</legend>
        {OCCASIONS.map((o) => (
          <label key={o} className="check"><input type="checkbox" checked={f.occasions.includes(o)} onChange={() => toggle("occasions", o)} /> {o}</label>
        ))}
      </fieldset>
      <fieldset><legend>Season (optional)</legend>
        {SEASONS.map((s) => (
          <label key={s} className="check"><input type="checkbox" checked={f.seasons.includes(s)} onChange={() => toggle("seasons", s)} /> {s}</label>
        ))}
      </fieldset>

      <label htmlFor="f-notes">Notes (optional)</label>
      <textarea id="f-notes" rows="3" maxLength={300} value={f.notes} onChange={(e) => set("notes", e.target.value)} />

      <div className="row">
        <button type="submit" className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save item"}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
