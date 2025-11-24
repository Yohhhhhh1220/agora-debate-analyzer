'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AnalysisData, TeamComparison as TeamComparisonType } from '@/types/analysis'
import TeamComparisonChart from '@/components/TeamComparisonChart'

export default function DisplayPage() {
  const router = useRouter()
  const [teamAData, setTeamAData] = useState<AnalysisData[]>([])
  const [teamBData, setTeamBData] = useState<AnalysisData[]>([])
  const [topic, setTopic] = useState('')

  useEffect(() => {
    // localStorageからデータを読み込む
    const loadData = () => {
      const savedTeamA = localStorage.getItem('debate-teamA-data')
      const savedTeamB = localStorage.getItem('debate-teamB-data')
      const savedTopic = localStorage.getItem('debate-topic')

      if (savedTeamA) {
        try {
          setTeamAData(JSON.parse(savedTeamA))
        } catch (e) {
          console.error('Failed to parse teamA data:', e)
        }
      }
      if (savedTeamB) {
        try {
          setTeamBData(JSON.parse(savedTeamB))
        } catch (e) {
          console.error('Failed to parse teamB data:', e)
        }
      }
      if (savedTopic) {
        setTopic(savedTopic)
      }
    }

    loadData()
    // 定期的にデータを更新（リアルタイム表示のため）
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  // チーム比較データの計算
  const teamComparison = useMemo<TeamComparisonType>(() => {
    const calculateAverage = (data: AnalysisData[]) => {
      if (data.length === 0) {
        return {
          reason: 0,
          example: 0,
          uniqueness: 0,
          clarity: 0,
          respect: 0,
          overall: 0,
        }
      }
      return {
        reason: data.reduce((sum, d) => sum + d.reason, 0) / data.length,
        example: data.reduce((sum, d) => sum + d.example, 0) / data.length,
        uniqueness: data.reduce((sum, d) => sum + d.uniqueness, 0) / data.length,
        clarity: data.reduce((sum, d) => sum + d.clarity, 0) / data.length,
        respect: data.reduce((sum, d) => sum + d.respect, 0) / data.length,
        overall: data.reduce((sum, d) => sum + d.overall, 0) / data.length,
      }
    }

    const teamAAvg = calculateAverage(teamAData)
    const teamBAvg = calculateAverage(teamBData)

    let winner: 'A' | 'B' | 'Tie' | null = null
    const teamALatest = teamAData.length > 0 ? teamAData[teamAData.length - 1] : null
    const teamBLatest = teamBData.length > 0 ? teamBData[teamBData.length - 1] : null
    if (teamALatest || teamBLatest) {
      const teamAScore = teamALatest ? teamALatest.overall : 0
      const teamBScore = teamBLatest ? teamBLatest.overall : 0
      if (teamAScore > teamBScore + 2) {
        winner = 'A'
      } else if (teamBScore > teamAScore + 2) {
        winner = 'B'
      } else if (teamALatest && teamBLatest) {
        winner = 'Tie'
      }
    }

    return {
      teamA: {
        latest: teamAData.length > 0 ? teamAData[teamAData.length - 1] : null,
        average: teamAAvg,
      },
      teamB: {
        latest: teamBData.length > 0 ? teamBData[teamBData.length - 1] : null,
        average: teamBAvg,
      },
      winner,
    }
  }, [teamAData, teamBData])

  const getScoreColor = (score: number, isOverall: boolean = false) => {
    if (isOverall) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    } else {
      if (score >= 16) return 'text-green-600'
      if (score >= 12) return 'text-yellow-600'
      return 'text-red-600'
    }
  }

  const getScoreBgColor = (score: number, isOverall: boolean = false) => {
    if (isOverall) {
      if (score >= 80) return 'bg-green-100'
      if (score >= 60) return 'bg-yellow-100'
      return 'bg-red-100'
    } else {
      if (score >= 16) return 'bg-green-100'
      if (score >= 12) return 'bg-yellow-100'
      return 'bg-red-100'
    }
  }

  const formatScore = (score: number) => score.toFixed(1)

  return (
    <main className="h-screen w-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 overflow-hidden relative">
      {/* 右上のボタン */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 px-3 py-1.5 bg-slate-700/80 text-white rounded-lg text-xs font-semibold hover:bg-slate-600 transition-all duration-200 z-10"
      >
        管理画面に戻る
      </button>

      <div className="h-full w-full mx-auto flex flex-col" style={{ aspectRatio: '16/9' }}>
        {/* ヘッダー */}
        <div className="text-center mb-2 flex-shrink-0">
          {topic && (
            <h1 className="text-6xl font-bold text-white mb-2 tracking-tight">
              {topic}
            </h1>
          )}
        </div>

        {/* メインコンテンツ - 横並びレイアウト */}
        <div className="flex-1 grid grid-cols-3 gap-4 mb-2 min-h-0">
          {/* 左側: チームA */}
          <div className="bg-gradient-to-br from-blue-900/80 to-blue-800/60 rounded-2xl p-4 border-4 border-blue-500/50 shadow-2xl flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-3 text-center tracking-tight">
              チームA
            </h2>
            
            {/* 総合評価 */}
            {teamComparison.teamA.latest ? (
              <div className={`mb-3 p-4 rounded-2xl ${getScoreBgColor(teamComparison.teamA.latest.overall, true)} shadow-xl border-2 border-white/20 flex-shrink-0`}>
                <div className="text-sm font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
                  総合評価
                </div>
                <div className={`text-7xl font-bold ${getScoreColor(teamComparison.teamA.latest.overall, true)} mb-3 text-center tracking-tight`}>
                  {formatScore(teamComparison.teamA.latest.overall)}点
                </div>
                <div className="w-full bg-slate-300/60 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      teamComparison.teamA.latest.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      teamComparison.teamA.latest.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${teamComparison.teamA.latest.overall}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-3 p-4 rounded-2xl bg-slate-700/80 shadow-xl border-2 border-white/20 flex-shrink-0">
                <div className="text-sm font-bold text-slate-300 mb-2 text-center uppercase tracking-wide">
                  総合評価
                </div>
                <div className="text-7xl font-bold text-slate-500 mb-3 text-center tracking-tight">-点</div>
              </div>
            )}

            {/* 各項目 - グリッドレイアウト */}
            <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
              {[
                { key: 'reason', label: '理由の納得感' },
                { key: 'example', label: '具体例・エピソード' },
                { key: 'uniqueness', label: 'ユニークさ・新しい視点' },
                { key: 'clarity', label: '言葉の分かりやすさ' },
                { key: 'respect', label: '相手への配慮・多角的な視点' },
              ].map((metric) => {
                const score = teamComparison.teamA.latest ? (teamComparison.teamA.latest[metric.key as keyof typeof teamComparison.teamA.latest] as number) : 0
                return (
                  <div key={metric.key} className="bg-white/80 rounded-xl py-3 px-3 border-2 border-white/50 flex flex-col h-full">
                    <span className="text-xl font-bold text-slate-800 mb-2 text-left flex-shrink-0">{metric.label}</span>
                    <div className="flex-1 flex items-center justify-center pb-4">
                      <span className={`text-5xl font-bold ${getScoreColor(score)} text-center`}>
                        {formatScore(score)}点
                      </span>
                    </div>
                    <div className="w-full bg-slate-300/60 rounded-full h-2 overflow-hidden mt-auto flex-shrink-0">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
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

          {/* 中央: グラフエリア */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border-4 border-slate-600/50 shadow-2xl flex flex-col min-h-0">
            <h2 className="text-2xl font-bold text-white mb-3 text-center tracking-tight flex-shrink-0">
              比較推移グラフ
            </h2>
            <div className="flex-1 min-h-0">
              <TeamComparisonChart teamAData={teamAData} teamBData={teamBData} isDark={true} />
            </div>
          </div>

          {/* 右側: チームB */}
          <div className="bg-gradient-to-br from-red-900/80 to-red-800/60 rounded-2xl p-4 border-4 border-red-500/50 shadow-2xl flex flex-col">
            <h2 className="text-3xl font-bold text-white mb-3 text-center tracking-tight">
              チームB
            </h2>
            
            {/* 総合評価 */}
            {teamComparison.teamB.latest ? (
              <div className={`mb-3 p-4 rounded-2xl ${getScoreBgColor(teamComparison.teamB.latest.overall, true)} shadow-xl border-2 border-white/20 flex-shrink-0`}>
                <div className="text-sm font-bold text-slate-700 mb-2 text-center uppercase tracking-wide">
                  総合評価
                </div>
                <div className={`text-7xl font-bold ${getScoreColor(teamComparison.teamB.latest.overall, true)} mb-3 text-center tracking-tight`}>
                  {formatScore(teamComparison.teamB.latest.overall)}点
                </div>
                <div className="w-full bg-slate-300/60 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      teamComparison.teamB.latest.overall >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      teamComparison.teamB.latest.overall >= 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${teamComparison.teamB.latest.overall}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-3 p-4 rounded-2xl bg-slate-700/80 shadow-xl border-2 border-white/20 flex-shrink-0">
                <div className="text-sm font-bold text-slate-300 mb-2 text-center uppercase tracking-wide">
                  総合評価
                </div>
                <div className="text-7xl font-bold text-slate-500 mb-3 text-center tracking-tight">-点</div>
              </div>
            )}

            {/* 各項目 - グリッドレイアウト */}
            <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
              {[
                { key: 'reason', label: '理由の納得感' },
                { key: 'example', label: '具体例・エピソード' },
                { key: 'uniqueness', label: 'ユニークさ・新しい視点' },
                { key: 'clarity', label: '言葉の分かりやすさ' },
                { key: 'respect', label: '相手への配慮・多角的な視点' },
              ].map((metric) => {
                const score = teamComparison.teamB.latest ? (teamComparison.teamB.latest[metric.key as keyof typeof teamComparison.teamB.latest] as number) : 0
                return (
                  <div key={metric.key} className="bg-white/80 rounded-xl py-3 px-3 border-2 border-white/50 flex flex-col h-full">
                    <span className="text-xl font-bold text-slate-800 mb-2 text-left flex-shrink-0">{metric.label}</span>
                    <div className="flex-1 flex items-center justify-center pb-4">
                      <span className={`text-5xl font-bold ${getScoreColor(score)} text-center`}>
                        {formatScore(score)}点
                      </span>
                    </div>
                    <div className="w-full bg-slate-300/60 rounded-full h-2 overflow-hidden mt-auto flex-shrink-0">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
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
      </div>
    </main>
  )
}

