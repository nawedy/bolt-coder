import { describe, it, expect, beforeEach } from 'vitest';
import { ModernSassManager } from '~/styles/config/sass-config';
import path from 'path';

describe('ModernSassManager', () => {
  let manager: ModernSassManager;

  beforeEach(() => {
    manager = new ModernSassManager({
      basePath: path.resolve(process.cwd(), 'app/styles'),
      style: 'compressed',
      sourceMap: false,
      additionalData: '',
    });
  });

  it('should properly configure Sass options', () => {
    const config = manager.getViteConfig();
    expect(config).toBeDefined();
    expect(config.preprocessorOptions).toBeDefined();
    expect(config.preprocessorOptions.scss).toBeDefined();
    expect(config.preprocessorOptions.scss.style).toBe('compressed');
    expect(config.preprocessorOptions.scss.sourceMap).toBe(false);
  });

  it('should properly handle imports', () => {
    const config = manager.getViteConfig();
    expect(config.preprocessorOptions.scss.importers).toBeDefined();
    expect(config.preprocessorOptions.scss.importers[0].findFileUrl).toBeDefined();

    const resolvedPath = manager.resolveModulePath('@/variables');
    expect(resolvedPath).toBe(path.resolve(process.cwd(), 'app/styles/variables'));
  });
});
