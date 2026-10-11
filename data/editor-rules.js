export const requiredRecordFields = {
  campaign: [],
  players: ['playerId'],
  characters: ['characterName', 'profession', 'about', 'owner', 'images'],
  timelines: ['mission', 'location', 'dateTime', 'esquad'],
  logs: ['title', 'dateTime', 'esquad', 'descrition', 'missionIndex'],
  achievements: ['name', 'description', 'medal', 'category', 'rank'],
};

export const characterStates = { vivo: 'Vivo', morto: 'Morto', desaparecido: 'Desaparecido' };

export function validateEditorRecord(section, record) {
  const labels = {
    title: 'Título do registro',
    missionIndex: 'Missão',
    playerId: 'Nome do jogador',
    characterName: 'Nome do personagem',
    profession: 'Profissão',
    about: 'Biografia',
    owner: 'Jogador',
    images: 'Retrato',
    mission: 'Nome da missão',
    location: 'Sistema / localização',
    dateTime: 'Data no universo',
    esquad: 'Equipe registrada',
    descrition: 'Relato oficial',
    name: 'Nome da conquista',
    description: 'Descrição',
    medal: 'Medalha',
    category: 'Categoria',
    rank: 'Grau',
  };
  const errors = (requiredRecordFields[section] || [])
    .filter((field) => typeof record[field] !== 'string' || !record[field].trim())
    .map((field) => `${labels[field]}: preencha este campo obrigatório.`);
  if (section === 'achievements') {
    for (const grant of record.character || []) {
      if (!grant.date?.trim())
        errors.push(`Data da concessão de ${grant.name}: preencha este campo obrigatório.`);
    }
  }
  return errors;
}
