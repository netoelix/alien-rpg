import { editorRequest, onlineEditor } from './editor-request.js';
import { PublicationPanel } from './PublicationPanel.jsx';
import { JournalEditor } from './JournalEditor.jsx';
import { TrashPanel } from './TrashPanel.jsx';
import { moveToTrash, restoreFromTrash } from '../../data/trash.js';
import { AchievementGrants } from './AchievementGrants.jsx';
import { NavigationEditor } from './NavigationEditor.jsx';
import { PortraitUpload } from './PortraitUpload.jsx';
import { MissionSystemPicker } from './MissionSystemPicker.jsx';
import { emptyNavigation } from '../../data/star-map.js';
import { addFragmentosNavigation } from '../../data/fragmentos-navigation.js';
import { useEffect, useState } from 'react';
import {
  newCampaign,
  normalizeArchive,
  validateArchive,
  automaticCampaignTitle,
  campaignAchievements,
} from '../../data/archive-schema.js';
import {
  requiredRecordFields,
  validateEditorRecord,
  characterStates,
} from '../../data/editor-rules.js';
import { applyPlayerProfile } from '../../data/player-profiles.js';
import { missionRecords } from '../../data/schema.js';
import { createDraftPreview } from '../lib/draft-preview.js';
import { Eyebrow } from '../components/Common.jsx';

const sections = [
  ['campaign', 'CAMPANHA'],
  ['navigation', 'MAPA ESTELAR'],
  ['players', 'JOGADORES'],
  ['characters', 'PERSONAGENS'],
  ['timelines', 'MISSÕES'],
  ['logs', 'REGISTROS DE SESSÃO'],
  ['journal', 'DIÁRIOS'],
  ['achievements', 'CONQUISTAS'],
  ['trash', 'LIXEIRA'],
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
  ['dateTime', 'Data no universo'],
  ['esquad', 'Equipe registrada'],
];
const logFields = [
  ['title', 'Título do registro'],
  ['session', 'Sessão / referência'],
  ['dateTime', 'Data no universo'],
  ['esquad', 'Equipe registrada'],
  ['descrition', 'Texto do registro', 'textarea'],
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
      owner: '',
      characterName: '',
      codname: '',
      profession: '',
      about: '',
      images: '',
      lifeStatus: '',
      aliases: [],
    };
  if (section === 'logs')
    return {
      id,
      missionIndex: '',
      title: '',
      session: '',
      dateTime: '',
      esquad: '',
      descrition: '',
    };
  if (section === 'timelines')
    return { id, mission: '', location: '', dateTime: '', esquad: '', logs: [] };
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

function RecordForm({ section, record, campaign, archive, assets, onApply, storageKey }) {
  const [uploadedAssets, setUploadedAssets] = useState([]);
  const [value, setValue] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey)) || structuredClone(record);
    } catch {
      return structuredClone(record);
    }
  });
  const [formDirty, setFormDirty] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const isRequired = (name) => requiredRecordFields[section].includes(name);
  const changeFields = (patch) => {
    const changed = { ...value, ...patch };
    setValue(changed);
    setFormDirty(true);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(changed));
    } catch {
      /* Armazenamento opcional. */
    }
  };
  const change = (name, next) => {
    const profile =
      name === 'profileId' ? archive.playerProfiles.find((profile) => profile.id === next) : null;
    const changed = {
      ...value,
      [name]: next,
      ...(profile ? { playerId: profile.name, biography: profile.biography } : {}),
    };
    if (section === 'logs' && name === 'missionIndex' && next !== '') {
      const mission = campaign.timelines[Number(next)];
      const previous = campaign.timelines[Number(value.missionIndex)];
      for (const field of ['dateTime', 'esquad']) {
        if (!value[field] || (value.missionIndex !== '' && value[field] === previous?.[field]))
          changed[field] = mission?.[field] || '';
      }
    }
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
        : section === 'logs'
          ? logFields
          : section === 'timelines'
            ? missionFields
            : section === 'achievements'
              ? awardFields
              : [
                  ['playerId', 'Nome do jogador'],
                  ['biography', 'Sobre o jogador', 'textarea'],
                ];

  return (
    <form
      className="editor-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const errors = validateEditorRecord(section, value);
        if (errors.length) {
          setFormErrors(errors);
          return;
        }
        setFormErrors([]);
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
          <span className="field-label">
            {label} <small>{isRequired(name) ? 'Obrigatório' : 'Opcional'}</small>
          </span>
          {type === 'textarea' ? (
            <textarea
              required={isRequired(name)}
              readOnly={section === 'players' && !record.profileId && Boolean(value.profileId)}
              value={value[name] || ''}
              onChange={(event) => change(name, event.target.value)}
            />
          ) : (
            <input
              readOnly={section === 'players' && !record.profileId && Boolean(value.profileId)}
              value={value[name] || ''}
              onChange={(event) => change(name, event.target.value)}
              required={isRequired(name)}
            />
          )}
        </label>
      ))}
      {section === 'timelines' && (
        <MissionSystemPicker campaign={campaign} value={value} onChange={changeFields} />
      )}
      {section === 'campaign' ? (
        <>
          <p className="muted small-text">
            Nome ainda indefinido? Deixe em branco para usar o nome automático. Os demais textos
            podem ser preenchidos depois.
          </p>
          <label>
            Estado <small className="field-hint">Preenchido automaticamente · editável</small>
            <select value={value.status} onChange={(event) => change('status', event.target.value)}>
              <option value="planejada">Planejada</option>
              <option value="em-andamento">Em andamento</option>
              <option value="encerrada">Encerrada</option>
            </select>
          </label>
        </>
      ) : null}
      {section === 'players' && !record.profileId && !value.mascot ? (
        <label>
          Cadastro do jogador
          <select
            value={value.profileId || ''}
            onChange={(event) => change('profileId', event.target.value)}
          >
            <option value="">Criar uma pessoa nova</option>
            {archive.playerProfiles
              .filter(
                (profile) => !campaign.players.some((member) => member.profileId === profile.id),
              )
              .map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} · cadastro existente
                </option>
              ))}
          </select>
          <span className="muted small-text">
            Reutilize o cadastro para manter personagens e conquistas ligados à mesma pessoa. Nomes
            iguais não são unidos automaticamente.
          </span>
        </label>
      ) : null}
      {section === 'players' && record.profileId ? (
        <p className="muted small-text">
          Nome e biografia pertencem ao cadastro pessoal. Alterar esses campos atualiza todas as
          campanhas deste jogador; seus personagens continuam separados por campanha.
        </p>
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
            <span className="field-label">
              Jogador <small>Obrigatório</small>
            </span>
            <select
              required
              value={value.owner}
              onChange={(event) => change('owner', event.target.value)}
            >
              <option value="">Selecione um jogador</option>
              {campaign.players.map((player, index) => (
                <option key={player.id} value={String(index)}>
                  {player.playerId}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">
              Retrato <small>Obrigatório</small>
            </span>
            <select
              required
              value={value.images}
              onChange={(event) => change('images', event.target.value)}
            >
              <option value="">Selecione um retrato</option>
              {[...new Set([...assets, ...uploadedAssets, ...(value.images ? [value.images] : [])])]
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
            <span className="field-label">
              Situação do personagem <small>Opcional</small>
            </span>
            <select
              value={value.lifeStatus || ''}
              onChange={(event) => change('lifeStatus', event.target.value)}
            >
              <option value="">Não informado</option>
              {Object.entries(characterStates).map(([state, label]) => (
                <option key={state} value={state}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <PortraitUpload
            onUpload={(asset) => {
              setUploadedAssets((current) => [...current, asset]);
              change('images', asset);
            }}
          />
          <label>
            <span className="field-label">
              Nomes usados nos logs (separados por vírgula) <small>Opcional</small>
            </span>
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
      {section === 'logs' ? (
        <label>
          Missão <small>Obrigatório</small>
          <select
            required
            value={value.missionIndex}
            onChange={(event) => change('missionIndex', event.target.value)}
            disabled={record.recordIndex !== undefined}
          >
            <option value="">Selecione uma missão</option>
            {campaign.timelines.map((mission, index) => (
              <option key={index} value={String(index)}>
                {mission.mission}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {section === 'timelines' ? (
        <p className="muted small-text">
          Cadastre os dados da operação. Depois, adicione os relatos em Registros de sessão. As
          datas pertencem ao universo do jogo.
        </p>
      ) : null}
      {section === 'achievements' ? (
        <>
          <label>
            <span className="field-label">
              Medalha <small>Obrigatório</small>
            </span>
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
            <span className="field-label">
              Categoria <small>Obrigatório</small>
            </span>
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
            <span className="field-label">
              Grau <small>Obrigatório</small>
            </span>
            <select value={value.rank} onChange={(event) => change('rank', event.target.value)}>
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((rank) => (
                <option key={rank}>{rank}</option>
              ))}
            </select>
          </label>
          <AchievementGrants
            archive={archive}
            campaign={campaign}
            value={value}
            onChange={(grants) => change('character', grants)}
          />
        </>
      ) : null}
      {formErrors.length ? (
        <div className="warning" role="alert">
          <p>Confira os campos abaixo:</p>
          <ul>
            {formErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
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
  const [contentSha, setContentSha] = useState(null);
  const [draftRevision, setDraftRevision] = useState('');
  const [assets, setAssets] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [section, setSection] = useState('campaign');
  const [selected, setSelected] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [appliedVersion, setAppliedVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    editorRequest('archive', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        return result;
      })
      .then((result) => {
        let cached;
        try {
          cached = sessionStorage.getItem('alien-editor-draft:' + result.revision);
          for (const previous of result.previousDraftRevisions || []) {
            if (cached) break;
            cached = sessionStorage.getItem('alien-editor-draft:' + previous);
            if (cached) {
              setDraftRevision(previous);
              cached = JSON.stringify(addFragmentosNavigation(JSON.parse(cached)));
            }
          }
        } catch {
          /* Armazenamento opcional. */
        }
        setArchive(normalizeArchive(cached ? JSON.parse(cached) : result.archive));
        setDirty(Boolean(cached));
        if (cached) setMessage('Rascunho desta sessão recuperado. Confira antes de salvar.');
        setRevision(result.revision);
        setAssets(result.assets);
        setContentSha(result.contentSha);
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
    next = normalizeArchive(next);
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
    !campaign || ['campaign', 'journal', 'navigation', 'trash'].includes(section)
      ? []
      : section === 'characters'
        ? characters
        : section === 'achievements'
          ? campaignAchievements(archive, campaign)
          : section === 'logs'
            ? campaign.timelines.flatMap((mission, missionIndex) =>
                missionRecords(mission).map((log, recordIndex) => ({
                  ...log,
                  missionIndex: String(missionIndex),
                  recordIndex,
                })),
              )
            : section === 'players'
              ? campaign.players.map((player) => ({
                  ...player,
                  biography:
                    archive.playerProfiles.find((profile) => profile.id === player.profileId)
                      ?.biography || '',
                }))
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
      target.title = target.title?.trim() || automaticCampaignTitle(next.campaigns, target.id);
    } else if (section === 'logs') {
      const { missionIndex, recordIndex, primary, mission, location, ...log } = value;
      const parent = target.timelines[Number(missionIndex)];
      if (!parent) {
        setMessage('Crie uma missão antes de adicionar registros.');
        return false;
      }
      parent.logs ??= [];
      if (selected === 'new') parent.logs.push(log);
      else parent.logs[recordIndex] = log;
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
    } else if (section === 'achievements') {
      const { character, ...definition } = value;
      const index = next.achievements.findIndex((item) => item.id === definition.id);
      if (index < 0) next.achievements.push(definition);
      else next.achievements[index] = definition;
      target.achievements = target.achievements.filter((item) => item.id !== definition.id);
      if (character.length) target.achievements.push({ id: definition.id, character });
    } else if (section === 'players') {
      try {
        applyPlayerProfile(next, campaignId, value, selected);
      } catch (error) {
        setMessage(error.message);
        return false;
      }
    } else if (section === 'timelines') {
      const { newSystem, ...mission } = value;
      if (newSystem) {
        target.navigation ??= emptyNavigation();
        target.navigation.systems ??= [];
        target.navigation.systems.push({
          ...newSystem,
          name: newSystem.name.trim(),
          installations: newSystem.installations.map((name) => name.trim()).filter(Boolean),
        });
        mission.systemId = newSystem.id;
      }
      if (selected === 'new') target.timelines.push(mission);
      else target.timelines[Number(selected)] = mission;
    } else {
      if (selected === 'new') target[section].push(value);
      else target[section][Number(selected)] = value;
    }
    const errors = validateArchive(next);
    if (errors.length) {
      setMessage(errors.join('\n'));
      return false;
    }
    updateArchive(next);
    setAppliedVersion((version) => version + 1);
    setSelected('');
    setMessage('Alteração aplicada ao rascunho. Use Salvar arquivos para gravar no projeto.');
    return true;
  }

  function acceptArchive(next, status) {
    // Formulários usam índices de listas. Após remover/restaurar, um cache
    // antigo não pode preencher o registro que passou a ocupar aquele índice.
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (
          key.startsWith(`alien-editor-form:${revision}:${campaignId}:`) ||
          key === `alien-journal-form:${revision}:${campaignId}`
        )
          sessionStorage.removeItem(key);
      }
    } catch {
      /* Armazenamento opcional. */
    }
    updateArchive(next);
    if (!next.campaigns.some((item) => item.id === campaignId)) setCampaignId(next.campaigns[0].id);
    setSelected('');
    setAppliedVersion((version) => version + 1);
    setMessage(status);
  }

  function removeRecord(request, explanation) {
    if (
      !window.confirm(
        explanation +
          '\n\nAlterações não aplicadas dos formulários desta campanha serão descartadas. Confirmar envio à lixeira?',
      )
    )
      return false;
    try {
      acceptArchive(
        moveToTrash(archive, { campaignId, ...request }),
        'Item enviado à lixeira do rascunho. Salve os arquivos para guardar a alteração.',
      );
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  }

  function restoreRecord(id) {
    try {
      acceptArchive(
        restoreFromTrash(archive, id),
        'Item restaurado no rascunho. Confira e salve os arquivos.',
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  function removeSelected() {
    const request = { kind: section, id: record.id };
    const effects = {
      campaign:
        'A campanha e seus personagens, missões, diários e concessões sairão do acervo ativo. Cadastros globais de jogadores e conquistas serão preservados.',
      players:
        'Esta participação, seus personagens e diários e as concessões deste jogador nesta campanha serão removidos. O cadastro global e as outras campanhas serão preservados.',
      characters:
        'O personagem e seu diário serão removidos. Os feitos do jogador e os textos históricos das missões serão preservados.',
      timelines:
        'A missão, seus registros de sessão e as paradas vinculadas serão removidos. As demais paradas serão mantidas.',
      logs: 'Somente este registro de sessão será removido. A missão e os demais relatos serão preservados.',
      achievements:
        'Esta definição UNIVERSAL e todas as suas concessões serão removidas de TODAS as campanhas. A restauração inclui as concessões.',
    };
    if (section === 'timelines') request.missionIndex = Number(selected);
    if (section === 'logs') request.missionIndex = Number(record.missionIndex);
    removeRecord(request, effects[section]);
  }

  async function save() {
    setBusy(true);
    try {
      const response = await editorRequest('archive', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive, revision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      try {
        sessionStorage.removeItem('alien-editor-draft:' + revision);
        if (draftRevision) sessionStorage.removeItem('alien-editor-draft:' + draftRevision);
      } catch {
        /* Armazenamento opcional. */
      }
      setRevision(result.revision);
      setDirty(false);
      setMessage(
        onlineEditor
          ? 'Rascunho salvo com histórico. O site público ainda não foi alterado.'
          : `Arquivos salvos. Backup anterior: ${result.backup}. A publicação ainda não foi alterada.`,
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
      updateArchive(normalizeArchive(imported));
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
      <Eyebrow>
        {onlineEditor ? 'Administração / acesso restrito' : 'Administração / somente nesta máquina'}
      </Eyebrow>
      <h1>Editor de campanhas</h1>
      <p className="lead">
        Edite o rascunho, confira e salve. O site público só muda depois da publicação.
      </p>
      <p className="editor-status" role="status">
        {message ||
          (archive ? 'Arquivo carregado. Nenhuma alteração pendente.' : 'Carregando acervo…')}
      </p>
      {archive && campaign ? (
        <>
          <div className="actions">
            <button disabled={busy || !dirty} onClick={save}>
              {onlineEditor ? 'SALVAR RASCUNHO ONLINE' : 'SALVAR ARQUIVOS COM BACKUP'}
            </button>
            <button onClick={() => downloadArchive(archive)}>EXPORTAR BACKUP</button>
            <label className="button">
              IMPORTAR BACKUP
              <input type="file" accept=".json,application/json" onChange={importBackup} />
            </label>
            <a
              className="button"
              href="#"
              target={onlineEditor ? '_self' : '_blank'}
              rel="noreferrer"
              onClick={(event) => {
                try {
                  const url = createDraftPreview(
                    archive,
                    campaign.id,
                    window.localStorage,
                    window.location.origin,
                  );
                  event.currentTarget.href = url;
                  setMessage(
                    'Prévia aberta com o rascunho aplicado. Salvar e publicar continuam sendo etapas separadas.',
                  );
                } catch (error) {
                  event.preventDefault();
                  setMessage('Não foi possível abrir a prévia: ' + error.message);
                }
              }}
            >
              CONFERIR SITE ↗
            </a>
          </div>
          <p className="muted small-text">
            {dirty
              ? 'Há alterações ainda não gravadas. Exporte o rascunho antes de sair.'
              : 'O rascunho está salvo.'}{' '}
            Alterações no formulário precisam ser aplicadas ao rascunho.
          </p>
          {onlineEditor && (
            <PublicationPanel revision={revision} contentSha={contentSha} dirty={dirty} />
          )}
          <div className="toolbar campaign-picker">
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
                const added = newCampaign(undefined, archive.campaigns);
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
          {section === 'logs' ? (
            <p className="muted">
              Selecione uma missão e adicione registros com títulos livres e datas próprias. Todos
              os relatos são editados aqui.
            </p>
          ) : null}
          {section === 'achievements' ? (
            <p className="muted">
              Catálogo geral do RPG: disponível em todas as campanhas. Alterar nome, descrição ou
              medalha atualiza a conquista em todas elas. As concessões abaixo pertencem à campanha
              selecionada.
            </p>
          ) : null}
          {section === 'journal' && (
            <JournalEditor
              key={campaignId}
              campaign={campaign}
              storageKey={`alien-journal-form:${revision}:${campaignId}`}
              onRemove={(characterId, entryId) =>
                removeRecord(
                  { kind: 'journal', id: characterId, entryId },
                  'Esta entrada de diário será enviada à lixeira. As demais páginas serão preservadas.',
                )
              }
              onApply={(characterId, journal) => {
                const next = structuredClone(archive);
                const character = next.campaigns
                  .find((entry) => entry.id === campaignId)
                  .players.flatMap((player) => player.characters)
                  .find((entry) => entry.id === characterId);
                character.journal = journal;
                const errors = validateArchive(next);
                if (errors.length) {
                  setMessage(errors.join(' '));
                  return false;
                }
                updateArchive(next);
                setMessage('Diário aplicado ao rascunho. Confira antes de salvar os arquivos.');
                return true;
              }}
            />
          )}
          {section === 'trash' && (
            <TrashPanel archive={archive} onRestore={restoreRecord} onDelete={removeRecord} />
          )}
          {section === 'navigation' ? (
            <NavigationEditor
              key={campaignId}
              campaign={campaign}
              storageKey={`alien-map-form:${revision}:${campaignId}`}
              onApply={(navigation) =>
                updateArchive({
                  ...archive,
                  campaigns: archive.campaigns.map((entry) =>
                    entry.id === campaignId ? { ...entry, navigation } : entry,
                  ),
                })
              }
            />
          ) : null}
          {!['campaign', 'navigation', 'journal', 'trash'].includes(section) ? (
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
                        (section === 'logs'
                          ? record.title + ' · ' + record.mission
                          : record.mission) ||
                        record.name ||
                        'Conquista sem título'}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          {record && section !== 'navigation' ? (
            <RecordForm
              key={`${campaignId}:${section}:${selected}:${dirty}:${appliedVersion}`}
              section={section}
              record={record}
              campaign={campaign}
              archive={archive}
              assets={assets}
              onApply={applyRecord}
              storageKey={`alien-editor-form:${revision}:${campaignId}:${section}:${selected}`}
            />
          ) : null}
          {record &&
            ['campaign', 'players', 'characters', 'timelines', 'logs', 'achievements'].includes(
              section,
            ) &&
            selected !== 'new' && (
              <div className="actions">
                <button className="danger-button" onClick={removeSelected}>
                  {section === 'players'
                    ? 'REMOVER PARTICIPAÇÃO DESTA CAMPANHA'
                    : section === 'achievements'
                      ? 'EXCLUIR CONQUISTA UNIVERSAL'
                      : 'ENVIAR À LIXEIRA'}
                </button>
              </div>
            )}
        </>
      ) : null}
    </>
  );
}
