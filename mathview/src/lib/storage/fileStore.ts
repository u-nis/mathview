/**
 * IndexedDB blob store for the image / PDF reference tabs.
 * localStorage is too small (~5MB, strings only) for PDFs, IndexedDB isn't.
 */

const DB_NAME = "mathview";
const STORE = "files";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export function putFile(id: string, blob: Blob): Promise<IDBValidKey> {
  return run("readwrite", (s) => s.put(blob, id));
}

export function getFile(id: string): Promise<Blob | undefined> {
  return run<Blob | undefined>("readonly", (s) => s.get(id));
}

export function deleteFile(id: string): Promise<undefined> {
  return run("readwrite", (s) => s.delete(id));
}
