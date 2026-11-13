import {restore, snapshot} from '../domain/solitaire/klondike.ts';
import type {State} from '../domain/solitaire/klondike.ts';
import {validateLedger} from '../domain/rewards/ledger.ts';
import type {Ledger} from '../domain/rewards/ledger.ts';

export type SaveV1 = {schemaVersion: 1; solitaire: State; rewards: Ledger};

/** Serialize one logical offline checkpoint. Storage adapter must write atomically. */
export function encodeSave(solitaire: State, rewards: Ledger): string {
  return JSON.stringify({schemaVersion: 1, solitaire: restore(snapshot(solitaire)), rewards: validateLedger(rewards)} satisfies SaveV1);
}

export function decodeSave(serialized: string): SaveV1 {
  const data = JSON.parse(serialized) as Partial<SaveV1>;
  if (!data || data.schemaVersion !== 1) throw Error('Unsupported save version; migration required');
  return {schemaVersion: 1, solitaire: restore(JSON.stringify(data.solitaire)), rewards: validateLedger(data.rewards!)};
}

/** Caller provides platform-specific atomic storage (e.g. write-temp/replace). */
export interface SaveStore {
  read(): Promise<string | null>;
  writeAtomically(contents: string): Promise<void>;
}

export async function saveGame(store: SaveStore, solitaire: State, rewards: Ledger): Promise<void> {
  await store.writeAtomically(encodeSave(solitaire, rewards));
}

export async function loadGame(store: SaveStore): Promise<SaveV1 | null> {
  const contents = await store.read();
  return contents === null ? null : decodeSave(contents);
}
