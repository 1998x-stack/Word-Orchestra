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
  await page.getByRole('button', { name: '学习记录' }).click()
  await expect(page.getByText('最近的练习')).toBeVisible()
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
