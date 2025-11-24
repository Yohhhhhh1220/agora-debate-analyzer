'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import TeamDebateInput from '@/components/TeamDebateInput'
import TeamComparison from '@/components/TeamComparison'
import TeamComparisonChart from '@/components/TeamComparisonChart'
import { AnalysisData, TeamComparison as TeamComparisonType } from '@/types/analysis'

export default function Home() {
  // 2チーム比較モード
  const [teamAData, setTeamAData] = useState<AnalysisData[]>([])
  const [teamBData, setTeamBData] = useState<AnalysisData[]>([])
  const [topic, setTopic] = useState('')
  const [currentTurn, setCurrentTurn] = useState<'A' | 'B'>('A')
  const [isTeamAnalyzing, setIsTeamAnalyzing] = useState(false)

  const handleTeamASubmit = (data: AnalysisData) => {
    setTeamAData(prev => {
      const newData = [...prev, data]
      // localStorageに保存
      localStorage.setItem('debate-teamA-data', JSON.stringify(newData))
      return newData
    })
    setCurrentTurn('B')
  }

  const handleTeamBSubmit = (data: AnalysisData) => {
    setTeamBData(prev => {
      const newData = [...prev, data]
      // localStorageに保存
      localStorage.setItem('debate-teamB-data', JSON.stringify(newData))
      return newData
    })
    setCurrentTurn('A')
  }

  // topic変更時にも保存
  useEffect(() => {
    if (topic) {
      localStorage.setItem('debate-topic', topic)
    }
  }, [topic])

  // データ変更時にも保存
  useEffect(() => {
    localStorage.setItem('debate-teamA-data', JSON.stringify(teamAData))
  }, [teamAData])

  useEffect(() => {
    localStorage.setItem('debate-teamB-data', JSON.stringify(teamBData))
  }, [teamBData])

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

  const resetTeamDebate = () => {
    if (confirm('2チームのディベートデータをすべて削除しますか？')) {
      setTeamAData([])
      setTeamBData([])
      setTopic('')
      setCurrentTurn('A')
      // localStorageもクリア
      localStorage.removeItem('debate-teamA-data')
      localStorage.removeItem('debate-teamB-data')
      localStorage.removeItem('debate-topic')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              src="/logo.svg"
              alt="アゴラ"
              width={700}
              height={700}
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft-lg p-8 mb-8 border border-slate-200/50">
          <TeamDebateInput
            topic={topic}
            onTopicChange={setTopic}
            currentTurn={currentTurn}
            onTeamASubmit={handleTeamASubmit}
            onTeamBSubmit={handleTeamBSubmit}
            isAnalyzing={isTeamAnalyzing}
            setIsAnalyzing={setIsTeamAnalyzing}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-soft-lg p-8 mb-8 border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              チーム比較結果
            </h2>
            {(teamAData.length > 0 || teamBData.length > 0) && (
                <button
                  onClick={resetTeamDebate}
                  className="px-5 py-2.5 text-sm font-medium bg-red-50 text-red-700 rounded-xl hover:bg-red-100 transition-all duration-200 border border-red-200/50"
                >
                  データをクリア
                </button>
            )}
          </div>
          <TeamComparison comparison={teamComparison} />
        </div>

        <div className="bg-white rounded-2xl shadow-soft-lg p-8 mb-8 border border-slate-200/50">
          <h2 className="text-3xl font-bold mb-6 text-slate-900 tracking-tight">
            比較推移グラフ
          </h2>
          <TeamComparisonChart teamAData={teamAData} teamBData={teamBData} />
        </div>

        {/* ディスプレイ表示ボタン */}
        <div className="text-center">
          <Link
            href="/display"
            target="_blank"
            className="inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xl font-bold rounded-2xl shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105"
          >
            📺 ディスプレイ表示画面を開く
          </Link>
        </div>
      </div>
    </main>
  )
}

