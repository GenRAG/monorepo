import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma v6 skips .env loading when prisma.config.ts is present — load it manually
try {
    process.loadEnvFile();
} catch {
    /* no .env file, env vars already set */
}

export default defineConfig({
    schema: path.join('prisma', 'schema'),
    earlyAccess: true,
});
