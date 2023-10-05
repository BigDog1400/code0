#! /usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');
const { chmodSync } = require('fs');

const args = process.argv.slice(2);
const os = process.platform;

const fileName = os === 'win32' ? 'cli-windows.exe' : os === 'darwin' ? 'cli-darwin' : 'cli-linux';
const filePath = join(__dirname, '../dist', fileName);

chmodSync(filePath, 0o777);

spawn(filePath, args, {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        FORCE_COLOR: 1
    },
})