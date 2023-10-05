#! /usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');

const args = process.argv.slice(2);
const os = process.platform;

const fileName = os === 'win32' ? 'cli-windows.exe' : os === 'darwin' ? 'cli-darwin' : 'cli-linux';

spawn(join(__dirname, '../dist', fileName), args, {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        FORCE_COLOR: 1
    },
})