#!/usr/bin/env node
/**
 * Auto-installation script for kimi-cli dependencies
 * Handles: Python 3.12+, uv, kimi-cli
 */
import { execSync, exec } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);
const KIMI_PATH = join(homedir(), '.local/share/uv/tools/kimi-cli/bin/kimi');
const REQUIRED_PYTHON = '3.12';

function hasCommand(cmd) {
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true; } catch { return false; }
}

async function getPythonVersion() {
  try {
    const { stdout } = await execAsync('python3 --version');
    const match = stdout.match(/Python (\d+\.\d+)/);
    return match ? match[1] : null;
  } catch { return null; }
}

function versionMeetsRequired(version) {
  const [major, minor] = version.split('.').map(Number);
  const [reqMajor, reqMinor] = REQUIRED_PYTHON.split('.').map(Number);
  if (major > reqMajor) return true;
  if (major === reqMajor && minor >= reqMinor) return true;
  return false;
}

async function installUv() {
  console.log('[kimi-provider] Installing uv...');
  try {
    execSync('curl -LsSf https://astral.sh/uv/install.sh | sh', { stdio: 'inherit' });
    console.log('[kimi-provider] ✓ uv installed');
    return true;
  } catch (e) {
    console.error('[kimi-provider] ✗ Failed to install uv:', e.message);
    return false;
  }
}

async function installPythonViaUv() {
  console.log(`[kimi-provider] Installing Python ${REQUIRED_PYTHON} via uv...`);
  try {
    const uvPath = hasCommand('uv') ? 'uv' : join(homedir(), '.cargo/bin/uv');
    execSync(`${uvPath} python install ${REQUIRED_PYTHON}`, { stdio: 'inherit' });
    console.log(`[kimi-provider] ✓ Python ${REQUIRED_PYTHON} installed`);
    return true;
  } catch (e) {
    console.error('[kimi-provider] ✗ Failed to install Python:', e.message);
    return false;
  }
}

async function installKimi() {
  console.log('[kimi-provider] Installing kimi-cli...');
  try {
    const uvPath = hasCommand('uv') ? 'uv' : join(homedir(), '.cargo/bin/uv');
    // Use specific Python version for kimi
    execSync(
      `${uvPath} tool install kimi-cli --python python${REQUIRED_PYTHON}`,
      { stdio: 'inherit' }
    );
    console.log('[kimi-provider] ✓ kimi-cli installed');
    return true;
  } catch (e) {
    console.error('[kimi-provider] ✗ Failed to install kimi-cli:', e.message);
    return false;
  }
}

export async function installDeps() {
  console.log('[kimi-provider] Checking dependencies...');
  
  // Check if kimi is already available
  if (existsSync(KIMI_PATH) || hasCommand('kimi')) {
    console.log('[kimi-provider] ✓ kimi-cli already installed');
    return;
  }
  
  // Check/install uv
  if (!hasCommand('uv')) {
    console.log('[kimi-provider] uv not found');
    if (!await installUv()) {
      console.error('[kimi-provider] Cannot proceed without uv');
      process.exit(1);
    }
  } else {
    console.log('[kimi-provider] ✓ uv available');
  }
  
  // Check Python version
  const pythonVersion = await getPythonVersion();
  if (pythonVersion) {
    console.log(`[kimi-provider] Found Python ${pythonVersion}`);
  }
  
  if (!pythonVersion || !versionMeetsRequired(pythonVersion)) {
    console.log(`[kimi-provider] Python ${REQUIRED_PYTHON}+ required`);
    if (!await installPythonViaUv()) {
      console.error('[kimi-provider] Cannot proceed without Python');
      process.exit(1);
    }
  } else {
    console.log(`[kimi-provider] ✓ Python ${pythonVersion} meets requirements`);
  }
  
  // Install kimi-cli
  if (!await installKimi()) {
    console.error('[kimi-provider] Failed to install kimi-cli');
    process.exit(1);
  }
  
  console.log('[kimi-provider] ✓ All dependencies installed');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  installDeps().catch(e => {
    console.error('[kimi-provider] Installation failed:', e);
    process.exit(1);
  });
}
