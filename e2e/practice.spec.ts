import { expect, test } from '@playwright/test'

const FIRST_FIVE_WORDS = ['apple', 'book', 'quiet', 'music', 'learn'] as const

test('Copy session finishes, saves, and persists across a full browser reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Copy · 拼写练习/ }).click()
  await page.getByRole('button', { name: /开始练习/ }).click()

  for (const [index, word] of FIRST_FIVE_WORDS.entries()) {
    const input = page.getByRole('textbox', { name: '输入英文单词' })
    await expect(input).toBeFocused()
    await input.fill(word)
    await page.getByRole('button', { name: /检查答案/ }).click()
    await expect(page.getByText('很好，拼写正确。')).toBeVisible()
    await page.getByRole('button', {
      name: index === FIRST_FIVE_WORDS.length - 1 ? /完成本次练习/ : /下一个单词/,
    }).click()
  }

  await expect(page.getByText('本次学习记录已保存在此设备')).toBeVisible()
  await expect(page.getByRole('button', { name: /回放我的作品/ })).toBeEnabled()
  await page.getByRole('button', { name: '学习记录' }).click()
  await expect(page.getByText('练习与作品库')).toBeVisible()
  await expect(page.getByText('拼写练习', { exact: true })).toBeVisible()

  await page.reload()
  await page.getByRole('button', { name: '学习记录' }).click()
  await expect(page.getByText('拼写练习', { exact: true })).toBeVisible()
  await expect(page.getByText('次 Copy 模式尝试')).toBeVisible()
})

test('revealed Recall answers are not reported as successful mastery', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /开始练习/ }).click()

  await page.getByRole('textbox', { name: '输入英文单词' }).fill('orange')
  await page.getByRole('button', { name: /检查答案/ }).click()
  await expect(page.getByText('还差一点，再试一次。')).toBeVisible()
  await page.getByRole('button', { name: '查看答案' }).click()
  await expect(page.getByText('本次已查看答案，因此不会记为成功回忆。')).toBeVisible()
  await page.getByRole('button', { name: /下一个单词/ }).click()

  for (let i = 1; i < FIRST_FIVE_WORDS.length; i += 1) {
    await page.getByRole('button', { name: '跳过这个词' }).click()
    await page.getByRole('button', { name: i === FIRST_FIVE_WORDS.length - 1 ? /完成本次练习/ : /下一个单词/ }).click()
  }

  await expect(page.getByText(/这一段旋律/)).toBeVisible()
  await expect(page.getByText('0%', { exact: true })).toBeVisible()
})

test('switching between practice and journal does not reset active input', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /开始练习/ }).click()
  await page.getByRole('textbox', { name: '输入英文单词' }).fill('ap')
  await page.getByRole('button', { name: '学习记录' }).click()
  await page.getByRole('button', { name: '练习室' }).click()
  await expect(page.getByRole('textbox', { name: '输入英文单词' })).toHaveValue('ap')
})

test('JSON archive import, duplicate skipping, and deliberate deletion work in a browser', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '学习记录' }).click()

  const archivedSession = {
    id: 'imported-demo-session',
    mode: 'recall',
    startedAt: 100,
    completedAt: 200,
    itemIds: ['a1-apple-noun-fruit'],
    attempts: [],
    noteEvents: [{ id: 'note-1', midi: 60, startMs: 0, durationMs: 170, kind: 'character' }],
    mappingVersion: 'c-major-pentatonic-v1',
    presetId: 'soft-triangle-v1',
    tempo: 110,
  }
  const content = JSON.stringify({
    format: 'word-orchestra.sessions',
    schemaVersion: 1,
    exportedAt: 300,
    sessions: [archivedSession],
  })
  const input = page.getByLabel('导入 JSON 归档')
  await input.setInputFiles({ name: 'archive.json', mimeType: 'application/json', buffer: Buffer.from(content) })
  await expect(page.getByText(/导入完成：新增 1 次练习，跳过 0 次重复记录/)).toBeVisible()
  await expect(page.getByRole('button', { name: '删除 imported-demo-session' })).toBeVisible()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出全部 JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^word-orchestra-sessions-.*\.json$/)

  await input.setInputFiles({ name: 'archive.json', mimeType: 'application/json', buffer: Buffer.from(content) })
  await expect(page.getByText(/新增 0 次练习，跳过 1 次重复记录/)).toBeVisible()

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: '删除 imported-demo-session' }).click()
  await expect(page.getByText('练习及关联作品已从本地记录删除。')).toBeVisible()
  await expect(page.getByRole('button', { name: '删除 imported-demo-session' })).toHaveCount(0)
})
