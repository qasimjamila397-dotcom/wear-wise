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

function friendly(err) {
  if (err && err.name === "QuotaExceededError") return new Error("Your device storage is full. Free some space and try again.");
  return err instanceof Error ? err : new Error("Storage is not available.");
}

// Runs one small storage job and closes the connection afterwards.
async function run(store, mode, job) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    let req;
    try {
      const tx = db.transaction(store, mode);
      req = job(tx.objectStore(store));
      tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
      tx.onerror = () => { db.close(); reject(friendly(tx.error)); };
      tx.onabort = () => { db.close(); reject(friendly(tx.error)); };
    } catch (e) { db.close(); reject(friendly(e)); }
  });
}

export const countItems = () => run("items", "readonly", (s) => s.count());
export const getAllItems = () => run("items", "readonly", (s) => s.getAll());
export const saveItem = (item) => run("items", "readwrite", (s) => s.put(item));
export const deleteItem = (id) => run("items", "readwrite", (s) => s.delete(id));
export const newId = () =>
  (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
