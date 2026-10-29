// Storage layer: everything that talks to the browser's IndexedDB lives here.
// Data stays on the user's device. Nothing is sent to a server.
const DB_NAME = "wearwise";
const DB_VERSION = 1;

export function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not allow local storage for this site."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      // "items" = clothing records, "photos" = image files, "looks" = saved outfits
      for (const name of ["items", "photos", "looks"]) {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open storage."));
    request.onblocked = () => reject(new Error("Storage is blocked by another open tab."));
  });
}

export async function countItems() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const query = db.transaction("items").objectStore("items").count();
    query.onsuccess = () => { db.close(); resolve(query.result); };
    query.onerror = () => { db.close(); reject(query.error || new Error("Could not read storage.")); };
  });
}
