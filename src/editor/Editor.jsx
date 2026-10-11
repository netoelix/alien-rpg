import { useEffect, useState } from 'react';
import { newCampaign, validateArchive } from '../../data/archive-schema.js';
import { Eyebrow } from '../components/Common.jsx';

const sections = [
  ['campaign', 'CAMPANHA'],
  ['players', 'JOGADORES'],
  ['characters', 'PERSONAGENS'],
  ['timelines', 'MISSÕES'],
  ['achievements', 'CONQUISTAS'],
];

const campaignFields = [
  ['title', 'Nome da campanha'],
  ['summary', 'Resumo da página inicial'],
  ['description', 'Apresentação da campanha', 'textarea'],
  ['period', 'Período no universo'],
  ['unit', 'Unidade / grupo'],
  ['division', 'Divisão / organização'],
  ['author', 'Autor'],
  ['medalArtist', 'Créditos das medalhas'],
];
const characterFields = [
  ['characterName', 'Nome do personagem'],
  ['codname', 'Codinome'],
  ['profession', 'Profissão'],
  ['about', 'Biografia', 'textarea'],
];
const missionFields = [
  ['mission', 'Nome da missão'],
  ['location', 'Sistema / localização'],
  ['dateTime', 'Data no universo'],
  ['esquad', 'Equipe registrada'],
  ['descrition', 'Relato oficial', 'textarea'],
];
const awardFields = [
  ['name', 'Nome da conquista'],
  ['description', 'Descrição', 'textarea'],
];

function downloadArchive(archive, filename = 'alien-rpg-backup.json') {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' }),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function emptyRecord(section, assets) {
  const id = crypto.randomUUID();
  if (section === 'players') return { id, playerId: '', mascot: false, characters: [] };
  if (section === 'characters')
    return {
      id,
      owner: '0',
      characterName: '',
      codname: '',
      profession: '',
      about: '',
      images: 'assets/default-portrait.svg',
      aliases: [],
    };
  if (section === 'timelines')
    return { mission: '', location: '', dateTime: '', esquad: '', descrition: '' };
  return {
    id,
    name: '',
    description: '',
    medal: assets.find((asset) => asset.endsWith('.svg') && asset.includes('Type=')) || '',
    category: 'Combat',
    rank: 'Bronze',
    character: [],
  };
}

function RecordForm({ section, record, campaign, assets, onApply, storageKey }) {
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey)) || structuredClone(record);
    } catch {
      return structuredClone(record);
    }
  });
  const [formDirty, setFormDirty] = useState(false);
  const change = (name, next) => {
    const changed = { ...value, [name]: next };
    setValue(changed);
    setFormDirty(true);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(changed));
    } catch {
      /* Arquivo ainda pode ser salvo pelo formulário. */
    }
  };
  useEffect(() => {
    function protectForm(event) {
      if (formDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', protectForm);
    return () => window.removeEventListener('beforeunload', protectForm);
  }, [formDirty]);
  const fields =
    section === 'campaign'
      ? campaignFields
      : section === 'characters'
        ? characterFields
        : section === 'timelines'
          ? missionFields
          : section === 'achievements'
            ? awardFields
            : [['playerId', 'Nome do jogador']];

  return (
    <form
      className="editor-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (onApply(value)) {
          setFormDirty(false);
          try {
            sessionStorage.removeItem(storageKey);
          } catch {
            /* Armazenamento opcional. */
          }
        }
      }}
    >
      {fields.map(([name, label, type]) => (
        <label key={name}>
          {label}
          {type === 'textarea' ? (
            <textarea
              value={value[name] || ''}
              onChange={(event) => change(name, event.target.value)}
            />
          ) : (
            <input
              value={value[name] || ''}
              onChange={(event) => change(name, event.target.value)}
              required={[
                'title',
                'playerId',
                'characterName',
                'mission',
                'location',
                'dateTime',
                'name',
              ].includes(name)}
            />
          )}
        </label>
      ))}
      {section === 'campaign' ? (
        <label>
          Estado
          <select value={value.status} onChange={(event) => change('status', event.target.value)}>
            <option value="planejada">Planejada</option>
            <option value="em-andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
          </select>
        </label>
      ) : null}
      {section === 'players' ? (
        <label className="editor-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value.mascot)}
            onChange={(event) => change('mascot', event.target.checked)}
          />{' '}
          Grupo de mascotes / NPCs (fora da lista de jogadores)
        </label>
      ) : null}
      {section === 'characters' ? (
        <>
          <label>
            Jogador
            <select value={value.owner} onChange={(event) => change('owner', event.target.value)}>
              {campaign.players.map((player, index) => (
                <option key={player.id} value={String(index)}>
                  {player.playerId}
                </option>
              ))}
            </select>
          </label>
          <label>
            Retrato
            <select value={value.images} onChange={(event) => change('images', event.target.value)}>
              {assets
                .filter(
                  (asset) =>
                    (/\.(png|jpg)$/.test(asset) && !asset.includes('galaxy')) ||
                    asset.endsWith('default-portrait.svg'),
                )
                .map((asset) => (
                  <option key={asset} value={asset}>
                    {asset.split('/').at(-1)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Nomes usados nos logs (separados por vírgula)
            <input
              value={(value.aliases || []).join(', ')}
              onChange={(event) =>
                change(
                  'aliases',
                  event.target.value
                    .split(',')
                    .map((name) => name.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
        </>
      ) : null}
      {section === 'timelines' ? (
        <p className="muted small-text">
          As datas são fictícias. Para censura narrativa, escreva /texto censurado/. Use CORROMPIDO
          para um relato indisponível.
        </p>
      ) : null}
      {section === 'achievements' ? (
        <>
          <label>
            Medalha
            <select value={value.medal} onChange={(event) => change('medal', event.target.value)}>
              {assets
                .filter((asset) => asset.endsWith('.svg') && asset.includes('Type='))
                .map((asset) => (
                  <option key={asset} value={asset}>
                    {asset.split('/').at(-1)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Categoria
            <select
              value={value.category}
              onChange={(event) => change('category', event.target.value)}
            >
              {['Combat', 'Stress', 'Exploration', 'Survival', 'Unique'].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            Grau
            <select value={value.rank} onChange={(event) => change('rank', event.target.value)}>
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((rank) => (
                <option key={rank}>{rank}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Concessões ao jogador</legend>
            {campaign.players
              .filter((player) => !player.mascot)
              .map((player) => {
                const award = value.character.find((award) => award.name === player.playerId);
                return (
                  <div className="grant" key={player.id}>
                    <label className="editor-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(award)}
                        onChange={(event) =>
                          change(
                            'character',
                            event.target.checked
                              ? [...value.character, { name: player.playerId, date: '' }]
                              : value.character.filter((item) => item.name !== player.playerId),
                          )
                        }
                      />
                      {player.playerId}
                    </label>
                    {award ? (
                      <label>
                        Data da concessão (DD/MM/AAAA)
                        <input
                          placeholder="DD/MM/AAAA"
                          value={award.date}
                          onChange={(event) =>
                            change(
                              'character',
                              value.character.map((item) =>
                                item.name === player.playerId
                                  ? { ...item, date: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          required
                        />
                      </label>
                    ) : null}
                  </div>
                );
              })}
          </fieldset>
        </>
      ) : null}
      <button type="submit" className="button solid">
        APLICAR AO RASCUNHO
      </button>
    </form>
  );
}

export default function Editor() {
  const [archive, setArchive] = useState(null);
  const [revision, setRevision] = useState('');
  const [assets, setAssets] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [section, setSection] = useState('campaign');
  const [selected, setSelected] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/__local-editor/archive', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result;
      })
      .then((result) => {
        let cached;
        try {
          cached = sessionStorage.getItem('alien-editor-draft:' + result.revision);
        } catch {
          /* Armazenamento opcional. */
        }
        setArchive(cached ? JSON.parse(cached) : result.archive);
        setDirty(Boolean(cached));
        if (cached) setMessage('Rascunho desta sessão recuperado. Confira antes de salvar.');
        setRevision(result.revision);
        setAssets(result.assets);
        setCampaignId(result.archive.campaigns[0].id);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setMessage(error.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    function protectDraft(event) {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [dirty]);

  function updateArchive(next) {
    try {
      sessionStorage.setItem('alien-editor-draft:' + revision, JSON.stringify(next));
    } catch {
      /* Exportação e gravação continuam disponíveis. */
    }
    setArchive(next);
    setDirty(true);
  }
  const campaign = archive?.campaigns.find((campaign) => campaign.id === campaignId);
  const characters =
    campaign?.players.flatMap((player, owner) =>
      player.characters.map((character) => ({ ...character, owner: String(owner) })),
    ) || [];
  const records =
    !campaign || section === 'campaign'
      ? []
      : section === 'characters'
        ? characters
        : campaign[section];
  const record =
    section === 'campaign'
      ? campaign
      : selected === 'new'
        ? emptyRecord(section, assets)
        : selected !== ''
          ? records[Number(selected)]
          : null;

  function applyRecord(value) {
    const next = structuredClone(archive);
    const target = next.campaigns.find((campaign) => campaign.id === campaignId);
    if (section === 'campaign') {
      for (const field of [...campaignFields.map(([name]) => name), 'status'])
        target[field] = value[field];
    } else if (section === 'characters') {
      const { owner, ...character } = value;
      if (!target.players[Number(owner)])
        return setMessage('Cadastre um jogador antes do personagem.');
      const previousOwner = target.players.findIndex((player) =>
        player.characters.some((item) => item.id === character.id),
      );
      if (previousOwner === Number(owner)) {
        target.players[previousOwner].characters = target.players[previousOwner].characters.map(
          (item) => (item.id === character.id ? character : item),
        );
      } else {
        for (const player of target.players)
          player.characters = player.characters.filter((item) => item.id !== character.id);
        target.players[Number(owner)].characters.push(character);
      }
    } else {
      if (section === 'players' && selected !== 'new') {
        const previousName = target.players[Number(selected)].playerId;
        for (const achievement of target.achievements)
          for (const grant of achievement.character) {
            if (grant.name === previousName) grant.name = value.playerId;
          }
      }
      if (selected === 'new') target[section].push(value);
      else
        target[section][Number(selected)] =
          section === 'players'
            ? {
                ...target.players[Number(selected)],
                playerId: value.playerId,
                mascot: value.mascot,
              }
            : value;
    }
    const errors = validateArchive(next);
    if (errors.length) {
      setMessage(errors.join('\n'));
      return false;
    }
    updateArchive(next);
    setSelected('');
    setMessage('Alteração aplicada ao rascunho. Use Salvar arquivos para gravar no projeto.');
    return true;
  }

  async function save() {
    setBusy(true);
    try {
      const response = await fetch('/__local-editor/archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive, revision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      try {
        sessionStorage.removeItem('alien-editor-draft:' + revision);
      } catch {
        /* Armazenamento opcional. */
      }
      setRevision(result.revision);
      setDirty(false);
      setMessage(
        `Arquivos salvos. Backup anterior: ${result.backup}. A publicação ainda não foi alterada.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) throw new Error('Arquivo acima do limite de 2 MB.');
      const imported = JSON.parse(await file.text());
      const errors = validateArchive(imported);
      if (errors.length) throw new Error(errors.join('\n'));
      updateArchive(imported);
      setCampaignId(imported.campaigns[0].id);
      setSection('campaign');
      setSelected('');
      setMessage('Backup carregado como rascunho. Confira antes de salvar os arquivos.');
    } catch (error) {
      setMessage(error.message);
    }
    event.target.value = '';
  }

  return (
    <>
      <Eyebrow>Administração / somente nesta máquina</Eyebrow>
      <h1>Editor de campanhas</h1>
      <p className="lead">
        Edite o rascunho, confira e salve os arquivos locais. O site público só muda depois da
        publicação.
      </p>
      <p className="editor-status" role="status">
        {message ||
          (archive ? 'Arquivo carregado. Nenhuma alteração pendente.' : 'Carregando acervo…')}
      </p>
      {archive && campaign ? (
        <>
          <div className="actions">
            <button disabled={busy || !dirty} onClick={save}>
              SALVAR ARQUIVOS COM BACKUP
            </button>
            <button onClick={() => downloadArchive(archive)}>EXPORTAR BACKUP</button>
            <label className="button">
              IMPORTAR BACKUP
              <input type="file" accept=".json,application/json" onChange={importBackup} />
            </label>
            <a
              className="button"
              target="_blank"
              rel="noreferrer"
              href={`/#/c/${campaign.id}/campaign`}
            >
              CONFERIR SITE ↗
            </a>
          </div>
          <p className="muted small-text">
            {dirty
              ? 'Há alterações ainda não gravadas. Exporte o rascunho antes de sair.'
              : 'Os arquivos locais estão salvos.'}{' '}
            Alterações no formulário precisam ser aplicadas ao rascunho.
          </p>
          <div className="toolbar">
            <label>
              Campanha
              <select
                value={campaignId}
                onChange={(event) => {
                  setCampaignId(event.target.value);
                  setSelected('');
                }}
              >
                {archive.campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => {
                const added = newCampaign('Nova campanha');
                updateArchive({ ...archive, campaigns: [...archive.campaigns, added] });
                setCampaignId(added.id);
                setSection('campaign');
                setSelected('');
              }}
            >
              NOVA CAMPANHA
            </button>
          </div>
          <div className="tabs">
            {sections.map(([id, label]) => (
              <button
                key={id}
                className={section === id ? 'active' : ''}
                aria-pressed={section === id}
                onClick={() => {
                  setSection(id);
                  setSelected('');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {section !== 'campaign' ? (
            <div className="toolbar">
              <label>
                Registro
                <select value={selected} onChange={(event) => setSelected(event.target.value)}>
                  <option value="">Selecionar…</option>
                  <option value="new">+ Criar registro</option>
                  {records.map((record, index) => (
                    <option key={record.id || index} value={String(index)}>
                      {record.playerId ||
                        record.characterName ||
                        record.mission ||
                        record.name ||
                        'Conquista sem título'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          {record ? (
            <RecordForm
              key={`${campaignId}:${section}:${selected}:${dirty}`}
              section={section}
              record={record}
              campaign={campaign}
              assets={assets}
              onApply={applyRecord}
              storageKey={`alien-editor-form:${revision}:${campaignId}:${section}:${selected}`}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
