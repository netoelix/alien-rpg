// Fichas de locais: nenhum destes valores representa o sistema inteiro.
export const locationFields = [
  ['name', 'Nome / designação'],
  ['commonName', 'Nome comum'],
  ['type', 'Tipo de local'],
  ['population', 'População'],
  ['installations', 'Instalações e assentamentos'],
  ['affiliation', 'Afiliação'],
  ['atmosphere', 'Atmosfera e clima'],
  ['temperature', 'Temperatura (opcional)'],
  ['terrain', 'Terreno predominante'],
  ['resources', 'Recursos e serviços'],
];

export function newLocation() {
  return {
    id: crypto.randomUUID(),
    ...Object.fromEntries(locationFields.map(([key]) => [key, ''])),
  };
}

export function validateLocations(locations) {
  if (locations === undefined) return [];
  if (!Array.isArray(locations) || locations.length > 100)
    return ['A lista de locais deve conter no máximo 100 fichas.'];
  const ids = new Set();
  const errors = [];
  for (const location of locations) {
    if (!location || typeof location !== 'object' || Array.isArray(location)) {
      errors.push('Ficha de local inválida.');
      continue;
    }
    if (
      typeof location.id !== 'string' ||
      !/^[a-zA-Z0-9-]+$/.test(location.id) ||
      ids.has(location.id)
    )
      errors.push('Identificador de local inválido ou repetido.');
    ids.add(location.id);
    if (typeof location.name !== 'string' || !location.name.trim())
      errors.push('Informe o nome do local.');
    for (const [key, label] of locationFields) {
      const value = location[key];
      if (value !== undefined && (typeof value !== 'string' || value.length > 4000))
        errors.push(`${label}: use texto de até 4000 caracteres.`);
    }
  }
  return errors;
}

export function publicLocations(locations) {
  return locations.map((location) =>
    Object.fromEntries(
      ['id', ...locationFields.map(([key]) => key)]
        .filter((key) => location[key] !== undefined)
        .map((key) => [key, location[key]]),
    ),
  );
}

// A consulta reúne o cadastro antigo e as fichas sem alterar os dados salvos.
export function consultationLocations(locations = [], installations = []) {
  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  const aliases = (text) => [text, text.replace(/\([^)]*\)/g, '')].map(normalize).filter(Boolean);
  const known = new Set(
    locations.flatMap((local) => [local.name, local.commonName || ''].flatMap(aliases)),
  );
  const result = [...locations];
  installations.forEach((name, index) => {
    if (!name.trim() || aliases(name).some((alias) => known.has(alias))) return;
    result.push({ id: 'catalog-installation-' + index, name });
    aliases(name).forEach((alias) => known.add(alias));
  });
  return result;
}
