// All the choices shown in forms live here, so they are easy to edit.
// Category KEYS (tops, bottoms...) are used by the outfit engine later. Do not rename them.
export const CATEGORIES = {
  tops: { label: "Tops", subs: ["Shirt", "T-shirt", "Blouse", "Sweater", "Tunic", "Kurta", "Kameez", "Other top"] },
  bottoms: { label: "Bottoms", subs: ["Trousers", "Jeans", "Chinos", "Skirt", "Shorts", "Shalwar", "Other bottom"] },
  onepiece: { label: "One-piece", subs: ["Dress", "Jumpsuit", "Shalwar kameez (set)", "Abaya", "Other one-piece"] },
  layers: { label: "Layers", subs: ["Jacket", "Coat", "Cardigan", "Blazer", "Waistcoat", "Hoodie", "Shawl", "Other layer"] },
  footwear: { label: "Footwear", subs: ["Sneakers", "Flats", "Loafers", "Boots", "Heels", "Sandals", "Other shoes"] },
  accessories: { label: "Accessories", subs: ["Belt", "Bag", "Scarf", "Dupatta", "Watch", "Jewelry", "Other accessory"] },
};
export const COLORS = {
  Black: "#1f1f1f", White: "#f7f7f4", Grey: "#8c8c8c", Navy: "#1f2a4a", Beige: "#d8c3a0", Cream: "#efe6cf",
  Brown: "#6b4a32", "Denim blue": "#4a6c9b", "Light blue": "#9cc3e6", Olive: "#6b7040", Green: "#2f7d4f",
  Red: "#c0302d", Maroon: "#6d1f2b", Pink: "#e58ab0", Purple: "#7a4fb3", Orange: "#e07a2f", Yellow: "#e5c235", Teal: "#1f8a8a",
};
export const PATTERNS = ["Solid", "Striped", "Checked", "Floral", "Printed", "Other"];
export const STYLES = ["Casual", "Smart casual", "Formal", "Traditional", "Modest", "Streetwear"];
export const OCCASIONS = ["University", "Work", "Everyday", "Date", "Party", "Wedding", "Interview", "Travel"];
export const SEASONS = ["Summer", "Winter", "Mild (spring/autumn)"];
