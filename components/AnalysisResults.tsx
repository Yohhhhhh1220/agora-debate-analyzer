'use client'

import { AnalysisData } from '@/types/analysis'

interface AnalysisResultsProps {
  data: AnalysisData
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const formatScore = (score: number) => {
    return score.toFixed(1)
  }

  const getScoreColor = (score: number, isOverall: boolean = false) => {
    if (isOverall) {
      // 総合評価は100点満点
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      // 各項目は20点満点
      if (score >= 16) return 'text-green-600'
      if (score >= 12) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getScoreBgColor = (score: number, isOverall: boolean = false) => {
    if (isOverall) {
      // 総合評価は100点満点
      if (score >= 80) return 'bg-green-100'
      if (score >= 60) return 'bg-yellow-100'
      return 'bg-red-100'
    } else {
      // 各項目は20点満点
      if (score >= 16) return 'bg-green-100'
      if (score >= 12) return 'bg-yellow-100'
      return 'bg-red-100'
    }
  }

  const metrics = [
    { label: '理由の納得感', value: data.reason, key: 'reason' },
    { label: '具体例・エピソード', value: data.example, key: 'example' },
    { label: 'ユニークさ・新しい視点', value: data.uniqueness, key: 'uniqueness' },
    { label: '言葉の分かりやすさ', value: data.clarity, key: 'clarity' },
    { label: '相手への配慮・多角的な視点', value: data.respect, key: 'respect' },
  ]

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${getScoreBgColor(data.overall, true)} shadow-soft border border-slate-200/50`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-slate-600 tracking-wide uppercase">総合評価</span>
          <span className={`text-4xl font-bold ${getScoreColor(data.overall, true)} tracking-tight`}>
            {formatScore(data.overall)}点
          </span>
        </div>
        <div className="w-full bg-slate-200/60 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              data.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              data.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${(data.overall / 100) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div key={metric.key} className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200/50 shadow-soft">
            <div className="text-xs font-semibold text-slate-600 mb-2 tracking-wide">{metric.label}</div>
            <div className={`text-xl font-bold ${getScoreColor(metric.value)} mb-3 tracking-tight`}>
              {formatScore(metric.value)}点
            </div>
            <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  metric.value >= 16 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  metric.value >= 12 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${(metric.value / 20) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {data.strengths && (
          <div className="p-6 bg-gradient-to-br from-green-50/80 to-green-100/40 rounded-2xl border border-green-200/60 shadow-soft">
            <h3 className="text-sm font-bold text-green-900 mb-3 tracking-tight uppercase">✨ 良い点</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{data.strengths}</p>
          </div>
        )}
        {data.improvements && (
          <div className="p-6 bg-gradient-to-br from-orange-50/80 to-orange-100/40 rounded-2xl border border-orange-200/60 shadow-soft">
            <h3 className="text-sm font-bold text-orange-900 mb-3 tracking-tight uppercase">📈 改善する点</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{data.improvements}</p>
          </div>
        )}
        {!data.strengths && !data.improvements && (
          <div className="p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/40 rounded-2xl border border-blue-200/60 shadow-soft">
            <h3 className="text-sm font-bold text-blue-900 mb-3 tracking-tight uppercase">AIフィードバック</h3>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">{data.feedback}</p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 text-right font-medium">
        {new Date(data.timestamp).toLocaleString('ja-JP')}
      </div>
    </div>
  )
}
