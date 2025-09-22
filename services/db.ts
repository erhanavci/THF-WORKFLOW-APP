import { IDBPCursorWithValue, IDBPDatabase, openDB } from 'idb';
import { Task, Member, Attachment, VoiceNote, BoardConfig } from '../types';
import { DB_CONFIG } from '../constants';

const { DB_NAME, DB_VERSION, STORES } = DB_CONFIG;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDb = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.MEMBERS)) {
          db.createObjectStore(STORES.MEMBERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.ATTACHMENTS)) {
          db.createObjectStore(STORES.ATTACHMENTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.VOICE_NOTES)) {
          db.createObjectStore(STORES.VOICE_NOTES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.CONFIG)) {
            db.createObjectStore(STORES.CONFIG, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Generic CRUD operations
const getAll = async <T,>(storeName: string): Promise<T[]> => {
  const db = await getDb();
  return db.getAll(storeName);
};

const get = async <T,>(storeName: string, id: string): Promise<T | undefined> => {
    const db = await getDb();
    return db.get(storeName, id);
};

const put = async <T,>(storeName: string, item: T): Promise<void> => {
  const db = await getDb();
  await db.put(storeName, item);
};

const remove = async (storeName: string, id: string): Promise<void> => {
    const db = await getDb();
    await db.delete(storeName, id);
};

const clearStore = async (storeName: string): Promise<void> => {
    const db = await getDb();
    await db.clear(storeName);
};


// Task specific operations
export const dbGetTasks = () => getAll<Task>(STORES.TASKS);
export const dbPutTask = (task: Task) => put(STORES.TASKS, task);
export const dbDeleteTask = (id: string) => remove(STORES.TASKS, id);
export const dbClearTasks = () => clearStore(STORES.TASKS);


// Member specific operations
export const dbGetMembers = () => getAll<Member>(STORES.MEMBERS);
export const dbPutMember = (member: Member) => put<Member>(STORES.MEMBERS, member);
export const dbDeleteMember = (id: string) => remove(STORES.MEMBERS, id);
export const dbClearMembers = () => clearStore(STORES.MEMBERS);

// Blob storage for attachments and voice notes
export const dbPutBlob = (storeName: string, id: string, blob: Blob) => {
    return put(storeName, { id, blob });
};

export const dbGetBlob = async (storeName: string, id: string): Promise<Blob | undefined> => {
    const result = await get<{id: string, blob: Blob}>(storeName, id);
    return result?.blob;
}

export const dbDeleteBlob = (storeName: string, id: string) => remove(storeName, id);

// Config specific operations
export const dbGetConfig = (id: string) => get<BoardConfig>(STORES.CONFIG, id);
export const dbPutConfig = (config: BoardConfig) => put<BoardConfig>(STORES.CONFIG, config);