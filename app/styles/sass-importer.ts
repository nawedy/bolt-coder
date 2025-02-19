import type { Importer, CanonicalizeContext } from 'sass';
import * as path from 'path';

export const customSassImporter: Importer = {
  canonicalize(url: string, _context: CanonicalizeContext) {
    // Handle modern Sass imports
    if (url.startsWith('@/') || url.startsWith('~/')) {
      const prefix = url.startsWith('@/') ? 2 : 2;
      const filePath = path.resolve('app/styles', url.slice(prefix));

      return new URL(`file://${filePath}.scss`);
    }

    return null;
  },
  load(_canonicalUrl) {
    // Handle loading the file
    return null; // Let Sass handle file loading
  },
};
