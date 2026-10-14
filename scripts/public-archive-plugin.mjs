export function publicArchivePlugin() {
  return {
    name: 'exclude-local-trash',
    enforce: 'pre',
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/data/archive.json')) return null;
      const archive = JSON.parse(code);
      delete archive.trash;
      return { code: JSON.stringify(archive), map: null };
    },
  };
}
