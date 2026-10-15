import { useState } from 'react';
import { editorRequest, onlineEditor } from './editor-request.js';

export function PortraitUpload({ onUpload }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage('Preparando retrato…');
    try {
      if (
        !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
        file.size > 15 * 1024 * 1024
      )
        throw new Error('Escolha PNG, JPEG ou WebP de até 15 MB.');
      const image = await createImageBitmap(file);
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      image.close();
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob || blob.size > 2 * 1024 * 1024)
        throw new Error('Imagem muito detalhada. Escolha uma imagem menor.');
      const content = onlineEditor
        ? await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
        : null;
      const response = await editorRequest('portrait', {
        method: 'POST',
        headers: { 'Content-Type': onlineEditor ? 'application/json' : 'image/png' },
        body: onlineEditor ? JSON.stringify({ content }) : blob,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onUpload(result.asset);
      setMessage(
        'Retrato importado e selecionado. Aplique o personagem ao rascunho para associá-lo.',
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  return (
    <div className="portrait-upload">
      <label>
        Importar retrato
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          onChange={upload}
        />
      </label>
      <p className="muted small-text">
        A imagem é armazenada no projeto e reduzida para até 1200 pixels.
      </p>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
