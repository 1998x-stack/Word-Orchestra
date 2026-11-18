import type { VocabularyItem } from './types'
import { normalizeAnswer } from '../practice/answer'

export function validateVocabularyPack(items: readonly VocabularyItem[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  for (const [index, item] of items.entries()) {
    const label = 'item[' + index + ']'
    if (!/^[a-z0-9.-]+$/i.test(item.id)) errors.push(label + ': invalid stable ID')
    if (ids.has(item.id)) errors.push(label + ': duplicate ID ' + item.id)
    ids.add(item.id)
    if (!/^[a-z]+$/i.test(item.lemma)) errors.push(label + ': unsupported spelling')
    if (!item.acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizeAnswer(item.lemma))) {
      errors.push(label + ': lemma must be an accepted answer')
    }
    if (!item.meaningZh.trim() || !item.definitionEn.trim() || !item.exampleEn.trim() || !item.exampleZh.trim()) {
      errors.push(label + ': missing bilingual teaching content')
    }
    if (!item.provenance.source.trim() || !item.provenance.license.trim() ||
      !['draft', 'reviewed'].includes(item.provenance.reviewStatus)) {
      errors.push(label + ': missing review and license provenance')
    }
  }
  return errors
}
