import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import { FitlogData, STORAGE_KEY } from './tracker';

const DATABASE_NAME = 'fitlog-private.db';
const DATABASE_KEY_NAME = 'fitlog.sqlcipher.key.v1';
const STATE_TABLE = 'fitlog_state';

let databasePromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function parseFitlogData(raw: string): FitlogData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Fitlog could not read its saved data. Your existing local copy has been preserved.');
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    (parsed as FitlogData).version !== 1 ||
    !(parsed as FitlogData).profile ||
    !(parsed as FitlogData).assessment
  ) {
    throw new Error('Fitlog found saved data in an unsupported format. Your existing local copy has been preserved.');
  }

  return parsed as FitlogData;
}

async function createEncryptedDatabase() {
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  let generatedKey = false;

  try {
    const cipher = await database.getFirstAsync<{ cipher_version: string }>('PRAGMA cipher_version');
    if (!cipher?.cipher_version) {
      throw new Error(
        'Encrypted storage is unavailable in this app build. Rebuild Fitlog with the SQLCipher config enabled before opening private journal data.'
      );
    }

    let key = await SecureStore.getItemAsync(DATABASE_KEY_NAME);
    if (!key) {
      key = bytesToHex(await Crypto.getRandomBytesAsync(32));
      await SecureStore.setItemAsync(DATABASE_KEY_NAME, key);
      generatedKey = true;
    }

    if (!/^[a-f0-9]{64}$/i.test(key)) {
      throw new Error('Fitlog could not validate its secure database key. Your local database has not been changed.');
    }

    // The key is a generated, fixed-length hex value stored in the iOS Keychain.
    // SQLCipher's raw-key form avoids treating it as a user-chosen password.
    await database.execAsync(`PRAGMA key = "x'${key}'"`);

    // Reading sqlite_master verifies the key before any app data is read or written.
    await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM sqlite_master');

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS ${STATE_TABLE} (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    return database;
  } catch (error) {
    if (generatedKey) {
      await SecureStore.deleteItemAsync(DATABASE_KEY_NAME).catch(() => undefined);
    }
    await database.closeAsync().catch(() => undefined);
    throw error;
  }
}

async function getEncryptedDatabase() {
  if (!databasePromise) {
    databasePromise = createEncryptedDatabase().catch(error => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}

/**
 * Opens the SQLCipher database and migrates the legacy AsyncStorage payload once.
 * The legacy plaintext value is removed only after the encrypted insert succeeds.
 */
export async function loadFitlogData(): Promise<FitlogData | null> {
  const database = await getEncryptedDatabase();
  const saved = await database.getFirstAsync<{ payload: string }>(
    `SELECT payload FROM ${STATE_TABLE} WHERE id = 1`
  );

  if (saved?.payload) {
    const parsed = parseFitlogData(saved.payload);
    await AsyncStorage.removeItem(STORAGE_KEY);
    return parsed;
  }

  const legacyPayload = await AsyncStorage.getItem(STORAGE_KEY);
  if (!legacyPayload) return null;

  const parsed = parseFitlogData(legacyPayload);
  await database.runAsync(
    `INSERT INTO ${STATE_TABLE} (id, payload, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
    legacyPayload,
    Date.now()
  );

  // Do not remove the legacy copy until the encrypted write has completed.
  await AsyncStorage.removeItem(STORAGE_KEY);
  return parsed;
}

export async function saveFitlogData(data: FitlogData): Promise<void> {
  const database = await getEncryptedDatabase();
  await database.runAsync(
    `INSERT INTO ${STATE_TABLE} (id, payload, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at`,
    JSON.stringify(data),
    Date.now()
  );
}

export async function clearFitlogData(): Promise<void> {
  const database = await getEncryptedDatabase();
  await database.runAsync(`DELETE FROM ${STATE_TABLE} WHERE id = 1`);
  await AsyncStorage.removeItem(STORAGE_KEY);
}
