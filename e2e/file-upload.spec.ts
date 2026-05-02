import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const imageFixture = fileURLToPath(new URL('./fixtures/demo-image.svg', import.meta.url));
const fileFixture = fileURLToPath(new URL('./fixtures/demo.txt', import.meta.url));

test.use({ baseURL: 'http://127.0.0.1:4175' });

test('file-upload inserts an image preview through the image action button', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'File Upload 示例' })).toBeVisible();

    const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: '插入图片' }).click(),
    ]);
    await fileChooser.setFiles(imageFixture);

    await expect(page.locator('.tiptap-upload-image__img')).toBeVisible();
});

test('file-upload switches storage mode and inserts a file card', async ({ page }) => {
    await page.goto('/');

    await page.locator('.storage-mode-select').selectOption('base64');
    await expect(page.locator('.footer strong')).toContainText('Base64 模式');

    const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.getByRole('button', { name: '插入文件' }).click(),
    ]);
    await fileChooser.setFiles(fileFixture);

    await expect(page.locator('.tiptap-upload-file__name')).toHaveText('demo.txt');
    await expect(page.locator('.tiptap-upload-file__meta')).toContainText('text/plain');
});
