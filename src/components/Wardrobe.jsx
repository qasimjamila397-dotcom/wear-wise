import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, COLORS, STYLES } from "../data/options.js";
import { getAllItems, getAllPhotos, saveItemAndPhoto, deleteItemAndPhoto, newId } from "../storage/db.js";
import ItemForm from "./ItemForm.jsx";

export default function Wardrobe() {
  const [items, setItems] = useState(null); // null = loading
  const [photoUrls, setPhotoUrls] = useState({}); // item id -> temporary picture address
  const urlsRef = useRef([]);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState({ mode: "list", item: null });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("");

  const load = async () => {
    try {
      const [list, photos] = await Promise.all([getAllItems(), getAllPhotos()]);
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
      const map = {};
      for (const p of photos) if (p.blob) { const u = URL.createObjectURL(p.blob); map[p.id] = u; urlsRef.current.push(u); }
      setPhotoUrls(map); setItems(list);
    } catch (e) { setLoadError(e.message || "Storage is not available."); }
  };
  useEffect(() => { load(); return () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); }, []);

  async function onSave(values, photo) {
    setSaving(true); setSaveError("");
    try {
      const now = Date.now();
      const old = view.item;
      await saveItemAndPhoto(old ? { ...old, ...values, updatedAt: now } : { id: newId(), ...values, createdAt: now, updatedAt: now }, photo);
      await load();
      setMsg(old ? "Item updated." : "Item added.");
      setView({ mode: "list", item: null });
    } catch (e) { setSaveError(e.message || "Could not save. Please try again."); }
    setSaving(false);
  }
  async function onDelete(id) {
    try { await deleteItemAndPhoto(id); setConfirmId(""); await load(); setMsg("Item deleted."); }
    catch (e) { setMsg(""); setLoadError(e.message || "Could not delete."); }
  }

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (items || []).filter((i) =>
      (!cat || i.category === cat) && (!color || i.color === color || i.color2 === color) && (!style || i.style === style) &&
      (!t || [i.name, i.subcategory, i.color, i.color2, i.notes].join(" ").toLowerCase().includes(t))
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [items, q, cat, color, style]);

  if (view.mode === "form")
    return <ItemForm initial={view.item} photoUrl={view.item ? photoUrls[view.item.id] : ""} saving={saving} saveError={saveError}
      onSave={onSave} onCancel={() => { setSaveError(""); setView({ mode: "list", item: null }); }} />;

  if (loadError) return <section className="card"><p role="alert" className="error">Your wardrobe could not be loaded. {loadError}</p></section>;
  if (items === null) return <p className="muted">Loading your wardrobe…</p>;

  return (
    <div>
      <div className="head"><h1>My Wardrobe</h1>
        <button className="btn primary" onClick={() => { setMsg(""); setView({ mode: "form", item: null }); }}>Add item</button></div>
      <p role="status" className="ok">{msg}</p>

      {items.length === 0 ? (
        <section className="card"><h2>Nothing here yet</h2><p>Tap “Add item” to enter your first piece of clothing.</p></section>
      ) : (
        <>
          <div className="filters">
            <label className="sr" htmlFor="q">Search</label>
            <input id="q" type="search" placeholder="Search your clothes" value={q} onChange={(e) => setQ(e.target.value)} />
            <label className="sr" htmlFor="fc">Category</label>
            <select id="fc" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>
              {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}</select>
            <label className="sr" htmlFor="fl">Colour</label>
            <select id="fl" value={color} onChange={(e) => setColor(e.target.value)}><option value="">All colours</option>
              {Object.keys(COLORS).map((c) => <option key={c}>{c}</option>)}</select>
            <label className="sr" htmlFor="fs">Style</label>
            <select id="fs" value={style} onChange={(e) => setStyle(e.target.value)}><option value="">All styles</option>
              {STYLES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <p className="muted">{shown.length} of {items.length} {items.length === 1 ? "item" : "items"}</p>
          {shown.length === 0 && <p>No items match. Try clearing a filter.</p>}
          <ul className="items">
            {shown.map((i) => (
              <li key={i.id} className="card item">
                <div className="photo" aria-hidden={photoUrls[i.id] ? undefined : "true"} style={photoUrls[i.id] ? undefined : { background: COLORS[i.color] }}>
                  {photoUrls[i.id] && <img src={photoUrls[i.id]} alt={i.name + ", " + i.color.toLowerCase()} />}
                </div>
                <div className="info">
                  <strong>{i.name}</strong>
                  <span className="muted">{i.subcategory} · {i.color}{i.color2 ? " + " + i.color2 : ""} · {i.pattern}{i.style ? " · " + i.style : ""}</span>
                  {confirmId === i.id ? (
                    <div className="row"><span>Delete “{i.name}”?</span>
                      <button className="btn danger" onClick={() => onDelete(i.id)}>Yes, delete</button>
                      <button className="btn" onClick={() => setConfirmId("")}>Keep</button></div>
                  ) : (
                    <div className="row">
                      <button className="btn" onClick={() => { setMsg(""); setView({ mode: "form", item: i }); }} aria-label={"Edit " + i.name}>Edit</button>
                      <button className="btn" onClick={() => setConfirmId(i.id)} aria-label={"Delete " + i.name}>Delete</button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
