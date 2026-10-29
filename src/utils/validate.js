import { CATEGORIES, COLORS, PATTERNS, STYLES, OCCASIONS, SEASONS } from "../data/options.js";

export const emptyForm = () => ({
  name: "", category: "tops", subcategory: "Shirt", color: "", color2: "",
  pattern: "Solid", style: "", occasions: [], seasons: [], notes: "",
});

const clean = (s, max) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const onlyAllowed = (list, allowed) => (Array.isArray(list) ? list.filter((x) => allowed.includes(x)) : []);

// Checks a form. Returns { ok, errors, values } where values is the cleaned data.
export function validateItem(f) {
  const errors = {};
  const name = clean(f.name, 60);
  if (!name) errors.name = "Please give this item a name, for example “Blue striped shirt”.";
  if (!CATEGORIES[f.category]) errors.category = "Please choose a category.";
  const subs = CATEGORIES[f.category]?.subs || [];
  if (!subs.includes(f.subcategory)) errors.subcategory = "Please choose a type.";
  if (!COLORS[f.color]) errors.color = "Please choose the main colour.";
  if (f.color2 && !COLORS[f.color2]) errors.color2 = "Please choose a colour from the list.";
  if (!PATTERNS.includes(f.pattern)) errors.pattern = "Please choose a pattern.";
  if (f.style && !STYLES.includes(f.style)) errors.style = "Please choose a style from the list.";
  const values = {
    name, category: f.category, subcategory: f.subcategory, color: f.color, color2: f.color2 || "",
    pattern: f.pattern, style: f.style || "", occasions: onlyAllowed(f.occasions, OCCASIONS),
    seasons: onlyAllowed(f.seasons, SEASONS), notes: clean(f.notes, 300),
  };
  return { ok: Object.keys(errors).length === 0, errors, values };
}
