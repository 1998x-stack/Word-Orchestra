export type PracticeMode = 'copy' | 'recall'
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface VocabularyItem {
  id: string
  lemma: string
  acceptedAnswers: string[]
  ipa: string
  cefr: CefrLevel
  partOfSpeech: string
  meaningZh: string
  definitionEn: string
  exampleEn: string
  exampleZh: string
}
