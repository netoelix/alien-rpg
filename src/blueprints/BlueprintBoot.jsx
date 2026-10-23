import { useEffect, useState } from 'react';
import './blueprint-boot.css';

// The theatrical delay runs alongside the download, never after it.
const BOOT_DURATION = 2500;

export default function BlueprintBoot() {
  const [Editor, setEditor] = useState(null);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let active = true;
    const timers = [];
    // Visual stages, not a download-byte estimate. Completion waits for the module.
    for (const [delay, value] of [
      [100, 12],
      [450, 32],
      [1050, 48],
      [1450, 74],
      [2100, 92],
    ]) {
      timers.push(
        window.setTimeout(() => {
          if (active) setProgress(value);
        }, delay),
      );
    }
    const minimumDuration = new Promise((resolve) => {
      timers.push(window.setTimeout(resolve, BOOT_DURATION));
    });

    Promise.all([import('./BlueprintEditor.jsx'), minimumDuration])
      .then(([module]) => {
        if (!active) return;
        setProgress(100);
        timers.push(
          window.setTimeout(() => {
            if (active) setEditor(() => module.default);
          }, 200),
        );
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  if (Editor) return <Editor />;

  return (
    <section className="blueprint-boot" aria-label="Inicialização do editor de mapas">
      <div className="blueprint-boot__brand" aria-hidden="true">
        SEVASTOLINK<span>✦</span>
        <small>TERMINAL DE ENGENHARIA</small>
      </div>
      <div className="blueprint-boot__status" role="status" aria-live="polite">
        {error ? (
          <>
            <p>Conexão interrompida. Não foi possível carregar o editor.</p>
            <button onClick={() => window.location.reload()}>Tentar novamente</button>
          </>
        ) : (
          <>
            <div className="blueprint-boot__track" aria-hidden="true">
              <i style={{ width: `${progress}%` }} />
            </div>
            <p>
              {progress === 100
                ? 'CONEXÃO ESTABELECIDA'
                : 'ESTABELECENDO CONEXÃO · CARREGANDO EDITOR'}
            </p>
          </>
        )}
        <small>ARQUIVO ALIEN / SISTEMA DE PLANTAS</small>
      </div>
    </section>
  );
}
