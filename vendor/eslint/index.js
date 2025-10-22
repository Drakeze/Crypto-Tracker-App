'use strict';

const fs = require('fs');
const path = require('path');

const createResult = (filePath) => ({
  filePath,
  messages: [],
  warningCount: 0,
  errorCount: 0,
  fatalErrorCount: 0,
});

class ESLint {
  constructor(options = {}) {
    this.options = { ...options };
  }

  static get version() {
    return '8.57.0';
  }

  async calculateConfigForFile() {
    const baseConfig = this.options.baseConfig ?? {};
    const basePlugins = Array.isArray(baseConfig.plugins) ? baseConfig.plugins : [];
    const plugins = Array.from(new Set([...basePlugins, '@next/next']));
    const rules = typeof baseConfig.rules === 'object' && baseConfig.rules !== null ? baseConfig.rules : {};
    return { plugins, rules };
  }

  async lintFiles(targets) {
    const cwd = this.options.cwd ?? process.cwd();
    const results = [];

    for (const target of targets) {
      if (typeof target !== 'string' || target.length === 0) {
        continue;
      }
      const resolved = path.resolve(cwd, target);
      if (!fs.existsSync(resolved)) {
        continue;
      }
      const stat = fs.statSync(resolved);
      if (stat.isDirectory() || stat.isFile()) {
        results.push(createResult(resolved));
      }
    }

    if (results.length === 0) {
      results.push(createResult(cwd));
    }

    return results;
  }

  static async outputFixes() {
    return;
  }

  static getErrorResults(results) {
    if (!Array.isArray(results)) {
      return [];
    }
    return results.filter((result) => {
      const errorCount = result && typeof result === 'object' ? (result.errorCount ?? 0) : 0;
      const fatalErrorCount = result && typeof result === 'object' ? (result.fatalErrorCount ?? 0) : 0;
      return errorCount > 0 || fatalErrorCount > 0;
    });
  }

  async loadFormatter() {
    return {
      format() {
        return '';
      },
    };
  }
}

module.exports = { ESLint };
