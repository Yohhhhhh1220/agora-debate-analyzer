'use client'

import { useState } from 'react'
import { AnalysisData } from '@/types/analysis'

interface TeamDebateInputProps {
  topic: string
  onTopicChange: (topic: string) => void
  currentTurn: 'A' | 'B'
  onTeamASubmit: (data: AnalysisData) => void
  onTeamBSubmit: (data: AnalysisData) => void
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
}

export default function TeamDebateInput({
  topic,
  onTopicChange,
  currentTurn,
  onTeamASubmit,
  onTeamBSubmit,
  isAnalyzing,
  setIsAnalyzing,
}: TeamDebateInputProps) {
  const [teamAText, setTeamAText] = useState('')
  const [teamBText, setTeamBText] = useState('')

  const handleSubmit = async (team: 'A' | 'B') => {
    const text = team === 'A' ? teamAText : teamBText
    if (!text.trim() || isAnalyzing) return

    console.log(`チーム${team}の分析リクエストを送信します...`, { textLength: text.length })
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      console.log('APIレスポンスを受信:', { status: response.status, statusText: response.statusText, ok: response.ok })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '不明なエラー' }))
        console.error('APIエラーレスポンス:', errorData)
        throw new Error(errorData.error || `分析に失敗しました (ステータス: ${response.status})`)
      }

      const data: AnalysisData = await response.json()
      console.log('分析結果を受信:', data)
      
      if (team === 'A') {
        onTeamASubmit(data)
        setTeamAText('')
      } else {
        onTeamBSubmit(data)
        setTeamBText('')
      }
    } catch (error) {
      console.error('分析エラー:', error)
      console.error('エラー詳細:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      alert(`分析中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center">
        <label htmlFor="topic" className="block text-2xl font-bold text-slate-700 mb-4 tracking-tight text-center">
          ディベートのお題
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="例: 人工知能は人間の仕事を奪うべきではない"
          className="w-full max-w-2xl px-6 py-5 text-2xl text-center border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-soft transition-all duration-200 text-slate-900 placeholder:text-slate-400"
          disabled={isAnalyzing}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* チームA */}
        <div className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
          currentTurn === 'A' 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20' 
            : 'border-slate-200 bg-white shadow-soft'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-blue-900 tracking-tight">チームA</h3>
            {currentTurn === 'A' && (
              <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-md">
                入力中
              </span>
            )}
          </div>
          <textarea
            value={teamAText}
            onChange={(e) => setTeamAText(e.target.value)}
            placeholder="チームAの主張を入力..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-soft transition-all duration-200 text-slate-900 placeholder:text-slate-400"
            rows={5}
            disabled={isAnalyzing || currentTurn !== 'A'}
          />
          <button
            onClick={() => handleSubmit('A')}
            disabled={!teamAText.trim() || isAnalyzing || currentTurn !== 'A'}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {isAnalyzing && currentTurn === 'A' ? '分析中...' : '送信'}
          </button>
        </div>

        {/* チームB */}
        <div className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
          currentTurn === 'B' 
            ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 shadow-lg shadow-red-500/20' 
            : 'border-slate-200 bg-white shadow-soft'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-red-900 tracking-tight">チームB</h3>
            {currentTurn === 'B' && (
              <span className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-md">
                入力中
              </span>
            )}
          </div>
          <textarea
            value={teamBText}
            onChange={(e) => setTeamBText(e.target.value)}
            placeholder="チームBの主張を入力..."
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none bg-white shadow-soft transition-all duration-200 text-slate-900 placeholder:text-slate-400"
            rows={5}
            disabled={isAnalyzing || currentTurn !== 'B'}
          />
          <button
            onClick={() => handleSubmit('B')}
            disabled={!teamBText.trim() || isAnalyzing || currentTurn !== 'B'}
            className="mt-4 w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
          >
            {isAnalyzing && currentTurn === 'B' ? '分析中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  )
}

