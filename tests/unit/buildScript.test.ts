import assert from 'node:assert/strict';
import test from 'node:test';
import {options} from '../../scripts/build-apk.mjs';

test('incremental build defaults to standalone APK',()=>{
  const parsed=options([]);
  assert.equal(parsed.platform,'apk');
  assert.equal(parsed.freshInstall,false);
  assert.equal(parsed.forcePrebuild,false);
});

test('explicit build options retain AAB and iOS support',()=>{
  assert.equal(options(['--platform','aab','--skip-pull']).platform,'aab');
  assert.equal(options(['--platform','ios']).platform,'ios');
  assert.equal(options(['--force-prebuild','--fresh-install']).freshInstall,true);
});

test('invalid combinations fail before touching files',()=>{
  assert.throws(()=>options(['--platform','debug']),/Platform/);
  assert.throws(()=>options(['--skip-install','--fresh-install']),/Cannot combine/);
  assert.throws(()=>options(['--platform','ios','--output','test.ipa']),/only supported/);
});
