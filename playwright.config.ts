import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    use: {
        browserName: 'chromium',
        channel: 'chromium',
        headless: true,
        viewport: {
            width: 1440,
            height: 1200,
        },
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    webServer: [
        {
            command:
                'pnpm --dir examples/code-block-pro exec vite --host 127.0.0.1 --port 4173 --strictPort',
            url: 'http://127.0.0.1:4173',
            reuseExistingServer: false,
            timeout: 120_000,
        },
        {
            command:
                'pnpm --dir examples/drag-handle exec vite --host 127.0.0.1 --port 4174 --strictPort',
            url: 'http://127.0.0.1:4174',
            reuseExistingServer: false,
            timeout: 120_000,
        },
        {
            command:
                'pnpm --dir examples/file-upload exec vite --host 127.0.0.1 --port 4175 --strictPort',
            url: 'http://127.0.0.1:4175',
            reuseExistingServer: false,
            timeout: 120_000,
        },
    ],
});
