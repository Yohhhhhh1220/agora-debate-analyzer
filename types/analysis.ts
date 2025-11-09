export interface AnalysisData {
  id: string
  timestamp: number
  text: string
  logic: number // 論理性 (1-20)
  evidence: number // 証拠 (1-20)
  impact: number // 重要性 (1-20)
  clarity: number // 明確性 (1-20)
  robustness: number // 反論耐性 (1-20)
  overall: number // 総合評価 (5-100, 5項目の合計)
  feedback: string // AIからのフィードバック
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
      logic: number
      evidence: number
      impact: number
      clarity: number
      robustness: number
      overall: number
    }
  }
  teamB: {
    latest: AnalysisData | null
    average: {
      logic: number
      evidence: number
      impact: number
      clarity: number
      robustness: number
      overall: number
    }
  }
  winner: 'A' | 'B' | 'Tie' | null
}

