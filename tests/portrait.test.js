import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { savePortrait } from '../scripts/portrait-store.mjs';

test('retratos usam nome gerado, preservam conteúdo e rejeitam formato e tamanho inválidos', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'alien-portrait-'));
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aM/8AAAAASUVORK5CYII=',
    'base64',
  );
  try {
    const result = await savePortrait(root, png, 'image/png');
    assert.match(result.asset, /^assets\/portrait-[a-f0-9]{64}\.png$/);
    assert.deepEqual(await readFile(path.join(root, 'public', result.asset)), png);
    assert.deepEqual(await savePortrait(root, png, 'image/png'), result);
    await assert.rejects(savePortrait(root, Buffer.from('<svg/>'), 'image/png'));
    await assert.rejects(savePortrait(root, png, 'image/jpeg'));
    await assert.rejects(savePortrait(root, Buffer.alloc(2 * 1024 * 1024 + 1), 'image/png'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
