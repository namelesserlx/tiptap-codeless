import { expect, test } from '@playwright/test';

test.use({ baseURL: 'http://127.0.0.1:4173' });

test('code-block-pro supports language switching and mermaid diagram toggling', async ({
    page,
}) => {
    const lifecycleWarnings: string[] = [];

    page.on('console', (message) => {
        if (message.text().includes('flushSync was called from inside a lifecycle method')) {
            lifecycleWarnings.push(message.text());
        }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'CodeBlock Pro Example' })).toBeVisible();
    await expect.poll(() => lifecycleWarnings).toHaveLength(0);

    const codeBlocks = page.locator('.code-block-pro-wrapper');
    await expect(codeBlocks).toHaveCount(4);

    const typescriptBlock = codeBlocks.nth(1);
    await typescriptBlock.scrollIntoViewIfNeeded();
    await typescriptBlock.getByRole('button', { name: '选择编程语言' }).click();
    await page.getByRole('button', { name: 'Java', exact: true }).click();
    await expect(typescriptBlock.locator('.language-label')).toHaveText('Java');

    const mermaidBlock = codeBlocks.nth(3);
    await mermaidBlock.scrollIntoViewIfNeeded();
    await mermaidBlock.getByRole('button', { name: '显示图表' }).click();
    await expect(mermaidBlock.locator('.mermaid-container')).toBeVisible();
    await mermaidBlock.getByRole('button', { name: '显示代码', exact: true }).click();
    await expect(mermaidBlock.locator('.mermaid-container')).toHaveCount(0);
});
