'use client'

import { TeamComparison as TeamComparisonType } from '@/types/analysis'

interface TeamComparisonProps {
  comparison: TeamComparisonType
}

export default function TeamComparison({ comparison }: TeamComparisonProps) {
  const { teamA, teamB, winner } = comparison

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

  const formatScore = (score: number) => score.toFixed(1)

  const metrics = [
    { key: 'reason', label: '理由の納得感' },
    { key: 'example', label: '具体例・エピソード' },
    { key: 'uniqueness', label: 'ユニークさ・新しい視点' },
    { key: 'clarity', label: '言葉の分かりやすさ' },
    { key: 'respect', label: '相手への配慮・多角的な視点' },
  ] as const

  return (
    <div className="space-y-6">
      {/* 勝者表示 */}
      {winner && (
        <div className={`p-6 rounded-2xl text-center shadow-soft border ${
          winner === 'Tie' 
            ? 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300/50' 
            : winner === 'A' 
            ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300/50' 
            : 'bg-gradient-to-br from-red-100 to-red-200 border-red-300/50'
        }`}>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">
            {winner === 'Tie' 
              ? '引き分け' 
              : winner === 'A' 
              ? '🏆 チームAの勝利' 
              : '🏆 チームBの勝利'}
          </h3>
          <p className="text-base text-slate-700 font-medium">
            {winner === 'Tie' 
              ? '両チームの評価が同等です' 
              : `現在、${winner === 'A' ? 'チームA' : 'チームB'}が優位に立っています`}
          </p>
        </div>
      )}

      {/* 比較表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* チームA */}
        <div className="border border-blue-200/60 rounded-2xl p-6 bg-gradient-to-br from-blue-50/50 to-blue-100/30 shadow-soft">
          <h3 className="text-xl font-bold text-blue-900 mb-6 tracking-tight">チームA 最新スコア</h3>
          
          {/* 総合評価を大きく表示 */}
          {teamA.latest ? (
            <div className={`mb-8 p-6 rounded-2xl ${getScoreBgColor(teamA.latest.overall, true)} shadow-soft border border-slate-200/50`}>
              <div className="text-sm font-semibold text-slate-600 mb-3 tracking-wide uppercase">総合評価</div>
              <div className={`text-5xl font-bold ${getScoreColor(teamA.latest.overall, true)} mb-4 tracking-tight`}>
                {formatScore(teamA.latest.overall)}点
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-3.5 overflow-hidden">
                <div
                  className={`h-3.5 rounded-full transition-all duration-500 ${
                    teamA.latest.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    teamA.latest.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${teamA.latest.overall}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-2xl bg-slate-100 shadow-soft border border-slate-200/50">
              <div className="text-sm font-semibold text-slate-600 mb-3 tracking-wide uppercase">総合評価</div>
              <div className="text-5xl font-bold text-slate-400 mb-4 tracking-tight">-点</div>
            </div>
          )}

          {/* 各項目 */}
          <div className="space-y-4">
            {metrics.map((metric) => {
              const score = teamA.latest ? teamA.latest[metric.key] : 0
              return (
                <div key={metric.key} className="bg-white/60 rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                    <span className={`text-base font-bold ${getScoreColor(score)}`}>
                      {formatScore(score)}点
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        score >= 16 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        score >= 12 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${(score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* チームB */}
        <div className="border border-red-200/60 rounded-2xl p-6 bg-gradient-to-br from-red-50/50 to-red-100/30 shadow-soft">
          <h3 className="text-xl font-bold text-red-900 mb-6 tracking-tight">チームB 最新スコア</h3>
          
          {/* 総合評価を大きく表示 */}
          {teamB.latest ? (
            <div className={`mb-8 p-6 rounded-2xl ${getScoreBgColor(teamB.latest.overall, true)} shadow-soft border border-slate-200/50`}>
              <div className="text-sm font-semibold text-slate-600 mb-3 tracking-wide uppercase">総合評価</div>
              <div className={`text-5xl font-bold ${getScoreColor(teamB.latest.overall, true)} mb-4 tracking-tight`}>
                {formatScore(teamB.latest.overall)}点
              </div>
              <div className="w-full bg-slate-200/60 rounded-full h-3.5 overflow-hidden">
                <div
                  className={`h-3.5 rounded-full transition-all duration-500 ${
                    teamB.latest.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    teamB.latest.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${teamB.latest.overall}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 rounded-2xl bg-slate-100 shadow-soft border border-slate-200/50">
              <div className="text-sm font-semibold text-slate-600 mb-3 tracking-wide uppercase">総合評価</div>
              <div className="text-5xl font-bold text-slate-400 mb-4 tracking-tight">-点</div>
            </div>
          )}

          {/* 各項目 */}
          <div className="space-y-4">
            {metrics.map((metric) => {
              const score = teamB.latest ? teamB.latest[metric.key] : 0
              return (
                <div key={metric.key} className="bg-white/60 rounded-xl p-4 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                    <span className={`text-base font-bold ${getScoreColor(score)}`}>
                      {formatScore(score)}点
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        score >= 16 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                        score >= 12 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                        'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${(score / 20) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 最新のフィードバック */}
      {(teamA.latest || teamB.latest) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teamA.latest && (
            <div className="p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/40 rounded-2xl border border-blue-200/60 shadow-soft">
              <h4 className="text-base font-bold text-blue-900 mb-3 tracking-tight">チームA 最新フィードバック</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{teamA.latest.feedback}</p>
            </div>
          )}
          {teamB.latest && (
            <div className="p-6 bg-gradient-to-br from-red-50/80 to-red-100/40 rounded-2xl border border-red-200/60 shadow-soft">
              <h4 className="text-base font-bold text-red-900 mb-3 tracking-tight">チームB 最新フィードバック</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{teamB.latest.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

