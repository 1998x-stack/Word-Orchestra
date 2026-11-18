import { describe, expect, it } from 'vitest'
import { VOCABULARY } from '../../data/vocabulary'
import { validateVocabularyPack } from './validation'

describe('vocabulary starter pack', () => {
  it('contains unique IDs and minimally complete bilingual entries', () => {
    expect(validateVocabularyPack(VOCABULARY)).toEqual([])
    expect(new Set(VOCABULARY.map((word) => word.id)).size).toBe(VOCABULARY.length)
  })

  it('labels all prototype examples as pending editorial review', () => {
    expect(VOCABULARY.every((entry) => entry.provenance.reviewStatus === 'draft')).toBe(true)
  })

  it('rejects duplicates and missing provenance', () => {
    const item = VOCABULARY[0]
    expect(validateVocabularyPack([item, item])).toContain('item[1]: duplicate ID ' + item.id)
    expect(validateVocabularyPack([{ ...item, provenance: { ...item.provenance, source: '' } }]))
      .toContain('item[0]: missing review and license provenance')
  })
})
