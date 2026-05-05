
/**
 * Utility for persisting FileSystemFileHandle in IndexedDB.
 * Since handles are not serializable to localStorage, IndexedDB is required.
 */
export async function getFileHandle(): Promise<FileSystemFileHandle | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open('momentum_db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('handles');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readonly');
      const store = tx.objectStore('handles');
      const getReq = store.get('sync_file');
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
}

export async function saveFileHandle(handle: FileSystemFileHandle): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('momentum_db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('handles');
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      store.put(handle, 'sync_file');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

export async function removeFileHandle(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.open('momentum_db', 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('handles', 'readwrite');
      const store = tx.objectStore('handles');
      store.delete('sync_file');
      tx.oncomplete = () => resolve();
    };
  });
}

export async function verifyPermission(fileHandle: FileSystemFileHandle, readWrite: boolean): Promise<boolean> {
  const options: any = {};
  if (readWrite) {
    options.mode = 'readwrite';
  }
  // Check if permission was already granted. If so, return true.
  if ((await (fileHandle as any).queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await (fileHandle as any).requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}
