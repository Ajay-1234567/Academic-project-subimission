const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- STARTING CLEAN BUILD ---');

try {
    // 1. Build frontend into a temp 'dist' folder
    // Using --output-path=dist/frontend
    console.log('Building Angular App...');
    execSync('cd frontend && npm install && npm run build -- --output-path=../dist', { stdio: 'inherit' });

    // 2. Clear the target 'public' directory
    const publicDir = path.join(__dirname, 'public');
    if (fs.existsSync(publicDir)) {
        console.log('Clearing old public folder...');
        fs.rmSync(publicDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicDir);

    // 3. Move files from dist/browser (where Angular actually puts them) to public/
    // Angular 17/18 with 'application' builder puts files in <outputPath>/browser
    const browserDir = path.join(__dirname, 'dist', 'browser');
    if (fs.existsSync(browserDir)) {
        console.log('Copying assets from dist/browser to public/');
        fs.cpSync(browserDir, publicDir, { recursive: true });
        console.log('Files moved successfully.');
    } else {
        // Fallback: if browser dir is missing, check dist root
        const distRoot = path.join(__dirname, 'dist');
        console.log('Checking dist root for assets...');
        fs.cpSync(distRoot, publicDir, { recursive: true });
    }

    // 4. Cleanup
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
    console.log('Cleanup finished.');

    console.log('--- BUILD SUCCESSFUL ---');
} catch (error) {
    console.error('--- BUILD FAILED ---');
    console.error(error);
    process.exit(1);
}
