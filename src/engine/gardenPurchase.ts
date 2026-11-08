import type { Save } from "./save";
import { place, transact, upgrades, type UpgradeId } from "./world";

/**
 * Purchase and place an owned decoration as a single save-state operation.
 * Guards must be checked when the queued save update is applied, not just
 * when a purchase button was first rendered.
 */
export function buyGardenDecoration(save: Save, id: UpgradeId): Save {
  const item = upgrades.find((entry) => entry.id === id);
  if (!item || id === "cards") return save;
  const { economy } = save;
  if (
    economy.inventory.includes(id) ||
    economy.receipts.includes(`buy:${id}`) ||
    economy.wallet.glimmers < item.cost ||
    economy.wallet.wood < item.wood
  ) {
    return save;
  }
  const purchased = transact(
    economy,
    `buy:${id}`,
    { glimmers: -item.cost, wood: -item.wood },
    id,
  );
  if (!purchased.inventory.includes(id)) return save;
  return {
    ...save,
    economy: purchased,
    placements: place(purchased.inventory, save.placements, {
      id,
      x: item.x,
      y: item.y,
    }),
  };
}
