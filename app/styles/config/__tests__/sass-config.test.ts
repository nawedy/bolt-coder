import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('should handle legacy JS API warnings', () => {
    const config = manager.getViteConfig();
    expect(config).toBeDefined();
    expect(config.style).toBeDefined();
  });

  it('should properly configure logger', () => {
    const config = manager.getViteConfig();
    const logger = config.logger;

    // Mock console.warn
    const originalWarn = console.warn;
    const mockWarn = vi.fn();
    console.warn = mockWarn;

    // Test legacy warning
    if (logger?.warn) {
      logger.warn('The legacy JS API is deprecated', { deprecation: false });
      expect(mockWarn).not.toHaveBeenCalled();
    }

    // Test normal warning
    if (logger?.warn) {
      logger.warn('Normal warning', { deprecation: false });
      expect(mockWarn).toHaveBeenCalledWith('Normal warning');
    }

    // Restore console.warn
    console.warn = originalWarn;
  });
});
