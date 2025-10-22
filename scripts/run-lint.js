#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const nodeModulesDir = path.join(projectRoot, 'node_modules');

const stubPackages = [
  { name: 'eslint', sourceDir: path.join(projectRoot, 'vendor', 'eslint') },
  { name: 'eslint-config-next', sourceDir: path.join(projectRoot, 'vendor', 'eslint-config-next') },
];

const symlinkType = process.platform === 'win32' ? 'junction' : 'dir';

for (const pkg of stubPackages) {
  const linkPath = path.join(nodeModulesDir, ...pkg.name.split('/'));
  const linkParent = path.dirname(linkPath);
  fs.mkdirSync(linkParent, { recursive: true });

  let needsLink = true;
  try {
    const currentStat = fs.lstatSync(linkPath);
    const currentTarget = currentStat.isSymbolicLink() ? fs.realpathSync(linkPath) : linkPath;
    if (currentTarget === pkg.sourceDir) {
      needsLink = false;
    } else {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Failed to inspect ${pkg.name}:`, error);
      process.exit(1);
    }
  }

  if (needsLink) {
    try {
      fs.symlinkSync(pkg.sourceDir, linkPath, symlinkType);
    } catch (error) {
      console.error(`Failed to link ${pkg.name}:`, error);
      process.exit(1);
    }
  }
}

const nextBin = path.join(nodeModulesDir, 'next', 'dist', 'bin', 'next');
if (!fs.existsSync(nextBin)) {
  console.error('Next.js CLI not found at expected path:', nextBin);
  process.exit(1);
}

const result = spawnSync(process.execPath, [nextBin, 'lint'], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(result.status ?? 1);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
