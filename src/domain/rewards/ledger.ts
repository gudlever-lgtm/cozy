/** Immutable, idempotent accounting for earned Lysglimt and in-game spending. */
export type Entry = {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
};
export type Ledger = {version: 1; entries: Entry[]};

export const emptyLedger = (): Ledger => ({version: 1, entries: []});
export const balance = (ledger: Ledger): number => ledger.entries.reduce(
  (sum, entry) => sum + (entry.type === 'earn' ? entry.amount : -entry.amount), 0);

export function record(ledger: Ledger, entry: Entry): Ledger {
  if (!entry.id || !entry.reason || !Number.isSafeInteger(entry.amount) || entry.amount <= 0 ||
    !['earn', 'spend'].includes(entry.type)) throw Error('Invalid ledger entry');
  const existing = ledger.entries.find(item => item.id === entry.id);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(entry)) throw Error('Conflicting event id');
    return ledger; // Retry of the same reward or purchase has no effect.
  }
  if (entry.type === 'spend' && balance(ledger) < entry.amount) throw Error('Insufficient Lysglimt');
  return {version: 1, entries: [...ledger.entries, {...entry}]};
}

export function validateLedger(ledger: Ledger): Ledger {
  if (!ledger || ledger.version !== 1 || !Array.isArray(ledger.entries)) throw Error('Invalid ledger version');
  let rebuilt = emptyLedger();
  for (const entry of ledger.entries) rebuilt = record(rebuilt, entry);
  if (rebuilt.entries.length !== ledger.entries.length) throw Error('Repeated ledger entry');
  return rebuilt;
}
