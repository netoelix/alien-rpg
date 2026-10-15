import { useEffect, useState } from 'react';

export function ArchiveImage({ src, ...props }) {
  const [privateUrl, setPrivateUrl] = useState(null);
  useEffect(() => {
    let active = true;
    let url;
    setPrivateUrl(null);
    if (
      import.meta.env.MODE !== 'editor' &&
      new URLSearchParams(window.location.search).has('draft') &&
      /^assets\/portrait-[a-f0-9]+\.png$/.test(src)
    ) {
      import('../editor/online-client.js')
        .then(async ({ onlineJson }) => {
          const { content } = await onlineJson(`asset&path=${encodeURIComponent(src)}`);
          if (!active) return;
          const bytes = Uint8Array.from(atob(content), (char) => char.charCodeAt(0));
          url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
          setPrivateUrl(url);
        })
        .catch(() => {
          /* Retratos já publicados continuam disponíveis no caminho estático. */
        });
    }
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);
  return <img {...props} src={privateUrl || src} />;
}
