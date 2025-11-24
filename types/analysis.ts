export interface AnalysisData {
  id: string
  timestamp: number
  text: string
  reason: number // 理由の納得感 (1-20)
  example: number // 具体例・エピソード (1-20)
  uniqueness: number // ユニークさ・新しい視点 (1-20)
  clarity: number // 言葉の分かりやすさ (1-20)
  respect: number // 相手への配慮・多角的な視点 (1-20)
  overall: number // 総合評価 (5-100, 5項目の合計)
  feedback: string // AIからのフィードバック（後方互換性のため残す）
  strengths?: string // 良い点
  improvements?: string // 改善する点
}

export interface AnalysisRequest {
  text: string
  debateId?: string
}

export interface TeamDebateData {
  teamA: AnalysisData[]
  teamB: AnalysisData[]
  topic: string
  currentTurn: 'A' | 'B'
  round: number
}

export interface TeamComparison {
  teamA: {
    latest: AnalysisData | null
    average: {
      reason: number
      example: number
      uniqueness: number
      clarity: number
      respect: number
      overall: number
    }
  }
  teamB: {
    latest: AnalysisData | null
    average: {
      reason: number
      example: number
      uniqueness: number
      clarity: number
      respect: number
      overall: number
    }
  }
  winner: 'A' | 'B' | 'Tie' | null
}
