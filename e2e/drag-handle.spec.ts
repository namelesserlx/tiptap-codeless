import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4174' });

test('drag-handle shows insert and drag handles and opens the slash menu', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Drag Handle 示例' })).toBeVisible();

    const proseMirror = page.locator('.ProseMirror');
    const proseMirrorBox = await proseMirror.boundingBox();
    if (!proseMirrorBox) {
        throw new Error('Expected a visible ProseMirror editor box for drag handle hover');
    }
    const emptyParagraph = proseMirror.locator('p').last();
    const blockquote = proseMirror.locator('blockquote');

    const blockquoteBox = await blockquote.boundingBox();
    if (!blockquoteBox) {
        throw new Error('Expected a visible blockquote box for drag handle hover');
    }
    await page.mouse.move(
        proseMirrorBox.x + 8,
        blockquoteBox.y + blockquoteBox.height / 2
    );
    await expect(page.locator('[data-drag-handle][data-mode="drag"]')).toBeVisible();

    const emptyParagraphBox = await emptyParagraph.boundingBox();
    if (!emptyParagraphBox) {
        throw new Error('Expected a visible empty paragraph box for insert handle hover');
    }
    await page.mouse.move(
        proseMirrorBox.x + 8,
        emptyParagraphBox.y + emptyParagraphBox.height / 2
    );
    const insertHandle = page.locator('[data-drag-handle][data-mode="insert"]');
    await expect(insertHandle).toBeVisible();
    await insertHandle.click();
    await expect(page.locator('.tiptap-insert-menu')).toBeVisible();
    await expect(page.getByText('插入图片')).toBeVisible();

    await page.keyboard.press('Escape');
    await emptyParagraph.click();
    await page.keyboard.type('/');
    await expect(page.locator('.tiptap-insert-menu')).toBeVisible();
    await expect(page.getByText('插入文件')).toBeVisible();
});
