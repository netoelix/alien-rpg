import { writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function savePortrait(root, bytes, contentType) {
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (
    !bytes.length ||
    bytes.length > 2 * 1024 * 1024 ||
    !((contentType === 'image/png' && png) || (contentType === 'image/jpeg' && jpeg))
  )
    throw Object.assign(new Error('Envie um retrato PNG ou JPEG de até 2 MB.'), { status: 422 });
  const filename =
    'portrait-' + createHash('sha256').update(bytes).digest('hex') + (png ? '.png' : '.jpg');
  const directory = path.join(root, 'public', 'assets');
  await mkdir(directory, { recursive: true });
  try {
    await writeFile(path.join(directory, filename), bytes, { flag: 'wx' });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
  return { asset: 'assets/' + filename };
}
