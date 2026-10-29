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

// Runs storage work inside one transaction (all-or-nothing) and closes the connection afterwards.
async function withTx(stores, mode, job) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(stores, mode);
      const req = job(tx);
      tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
      tx.onerror = () => { db.close(); reject(friendly(tx.error)); };
      tx.onabort = () => { db.close(); reject(friendly(tx.error)); };
    } catch (e) { db.close(); reject(friendly(e)); }
  });
}
const run = (store, mode, job) => withTx(store, mode, (tx) => job(tx.objectStore(store)));

export const countItems = () => run("items", "readonly", (s) => s.count());
export const getAllItems = () => run("items", "readonly", (s) => s.getAll());
export const getAllPhotos = () => run("photos", "readonly", (s) => s.getAll());

// photo is {type:"keep"} | {type:"set", blob} | {type:"remove"}. Item and photo are saved together.
export const saveItemAndPhoto = (item, photo = { type: "keep" }) =>
  withTx(["items", "photos"], "readwrite", (tx) => {
    tx.objectStore("items").put(item);
    if (photo.type === "set") tx.objectStore("photos").put({ id: item.id, blob: photo.blob });
    else if (photo.type === "remove") tx.objectStore("photos").delete(item.id);
  });

export const deleteItemAndPhoto = (id) =>
  withTx(["items", "photos"], "readwrite", (tx) => {
    tx.objectStore("items").delete(id);
    tx.objectStore("photos").delete(id);
  });
export const newId = () =>
  (globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2));
