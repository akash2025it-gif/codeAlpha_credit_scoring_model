const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('[Build] Starting unified build script...');
const isRoot = fs.existsSync(path.join(__dirname, 'frontend'));
const frontendDir = isRoot ? path.join(__dirname, 'frontend') : __dirname;

console.log(`[Build] Operating in directory: ${frontendDir}`);

// Install dependencies in frontend
console.log('[Build] Installing frontend dependencies...');
execSync('npm install --include=dev', { cwd: frontendDir, stdio: 'inherit' });

// Run Vite build
console.log('[Build] Executing Vite build...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

const srcDist = path.join(frontendDir, 'dist');
if (isRoot) {
  const rootDist = path.join(__dirname, 'dist');
  if (fs.existsSync(srcDist)) {
    console.log(`[Build] Syncing ${srcDist} -> ${rootDist}...`);
    fs.cpSync(srcDist, rootDist, { recursive: true, force: true });
  }
}

console.log('[Build] Build completed successfully!');
