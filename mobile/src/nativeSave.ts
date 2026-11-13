import {File, Paths} from 'expo-file-system';
import type {SaveStore} from '../../src/persistence/save';

const active = () => new File(Paths.document, 'cozy-v3-save.json');
const staging = () => new File(Paths.document, 'cozy-v3-save.pending.json');
let writing: Promise<void> = Promise.resolve();

/** A complete checkpoint is first written to a sibling file, then renamed over the active save. */
export const nativeSaveStore: SaveStore = {
  async read() {
    const file = active();
    return file.exists ? file.text() : null;
  },
  async writeAtomically(contents) {
    writing = writing.catch(()=>{}).then(async()=>{
      const temp = staging();
      temp.create({overwrite: true});
      await temp.write(contents);
      await temp.move(active(), {overwrite: true});
    });
    return writing;
  },
};
