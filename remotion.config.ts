import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {Config} from '@remotion/cli/config';

/**
 * Chrome Headless Shell + FFmpeg memakai `os.tmpdir()` (di Windows: %TEMP%).
 * Kalau folder itu tidak bisa ditulis proses anak — kebijakan sandbox, antivirus,
 * atau profil Puppeteer lama yang ACL-nya rusak — render gagal dengan
 * "Unable to create cache", "Access is denied", atau "spawn EPERM" dan
 * menyisakan debug.log ribuan baris.
 *
 * Jadi scratch space dipindah ke <project>/tmp (sudah ada di .gitignore).
 * Harus di-set di sini, sebelum CLI men-spawn Chrome.
 */
const localTmp = path.join(process.cwd(), 'tmp');
fs.mkdirSync(localTmp, {recursive: true});
process.env.TEMP = localTmp;
process.env.TMP = localTmp;
process.env.TMPDIR = localTmp;

/**
 * Jumlah worker render menyesuaikan mesin: maksimal 4, tidak lebih dari setengah core CPU,
 * dan ~3 GB RAM fisik per worker (terukur: 1 worker ~1,6 GB puncak, 4 worker ~2,7 GB).
 * Laptop 2 core / 8 GB -> 1 worker; 4 core / 8 GB -> 2; 6+ core / 12+ GB -> 4.
 * Timpa kapan saja: --concurrency=N di CLI.
 */
const cores = os.cpus().length;
const ramGb = os.totalmem() / 1024 ** 3;
const workers = Math.max(1, Math.min(4, Math.floor(cores / 2), Math.floor(ramGb / 3)));

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(workers);
