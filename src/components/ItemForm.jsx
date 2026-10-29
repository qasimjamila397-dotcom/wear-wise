import { useEffect, useRef, useState } from "react";
import { CATEGORIES, COLORS, PATTERNS, STYLES, OCCASIONS, SEASONS } from "../data/options.js";
import { emptyForm, validateItem } from "../utils/validate.js";
import { checkImageFile, resizeImage } from "../images/imageUtils.js";

function Err({ id, text }) {
  return text ? <p className="error" id={id}>{text}</p> : null;
}

export default function ItemForm({ initial, photoUrl, onSave, onCancel, saving, saveError }) {
  const [f, setF] = useState(initial ? { ...emptyForm(), ...initial } : emptyForm());
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState({ action: "keep", blob: null, url: "" }); // keep | set | remove
  const [photoError, setPhotoError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const newUrl = useRef("");
  useEffect(() => () => { if (newUrl.current) URL.revokeObjectURL(newUrl.current); }, []);
  const shownPhoto = photo.action === "set" ? photo.url : photo.action === "remove" ? "" : photoUrl || "";

  async function choosePhoto(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const problem = checkImageFile(file);
    if (problem) { setPhotoError(problem); return; }
    setPhotoError(""); setPreparing(true);
    try {
      const blob = await resizeImage(file);
      if (newUrl.current) URL.revokeObjectURL(newUrl.current);
      newUrl.current = URL.createObjectURL(blob);
      setPhoto({ action: "set", blob, url: newUrl.current });
    } catch (err) { setPhotoError(err.message || "That photo could not be used."); }
    setPreparing(false);
  }
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k, v) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  function submit(e) {
    e.preventDefault();
    const r = validateItem(f);
    setErrors(r.errors);
    if (r.ok) onSave(r.values, photo.action === "set" ? { type: "set", blob: photo.blob } : photo.action === "remove" ? { type: "remove" } : { type: "keep" });
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

      <label htmlFor="f-photo">Photo (optional)</label>
      {shownPhoto && <img className="preview" src={shownPhoto} alt="Preview of the photo for this item" />}
      <input id="f-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} disabled={preparing} aria-describedby="e-photo" />
      <p className="muted">{preparing ? "Preparing photo…" : shownPhoto ? "Choose another file to replace this photo." : "You can skip this. Photos stay on your device."}</p>
      <Err id="e-photo" text={photoError} />
      {shownPhoto && <button type="button" className="btn" onClick={() => setPhoto({ action: "remove", blob: null, url: "" })}>Remove photo</button>}

      <div className="row">
        <button type="submit" className="btn primary" disabled={saving || preparing}>{saving ? "Saving…" : "Save item"}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
