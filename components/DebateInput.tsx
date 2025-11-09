'use client'

import { useState } from 'react'
import { AnalysisData } from '@/types/analysis'

interface DebateInputProps {
  onAnalysis: (data: AnalysisData) => void
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
}

export default function DebateInput({ onAnalysis, isAnalyzing, setIsAnalyzing }: DebateInputProps) {
  const [text, setText] = useState('')
  const [debateId, setDebateId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isAnalyzing) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, debateId }),
      })

      if (!response.ok) {
        throw new Error('分析に失敗しました')
      }

      const data: AnalysisData = await response.json()
      onAnalysis(data)
      
      // 初回の場合はdebateIdを保存
      if (!debateId) {
        setDebateId(data.id)
      }

      // テキストをクリア（オプション）
      // setText('')
    } catch (error) {
      console.error('Error analyzing debate:', error)
      alert('分析中にエラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="debate-text" className="block text-sm font-semibold text-slate-700 mb-3 tracking-tight">
          ディベート内容を入力してください
        </label>
        <textarea
          id="debate-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="例: 人工知能は人間の仕事を奪うべきではない。なぜなら、AIは人間の創造性や感情を理解できないからである。"
          className="w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white shadow-soft transition-all duration-200 text-slate-900 placeholder:text-slate-400"
          rows={6}
          disabled={isAnalyzing}
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || isAnalyzing}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
      >
        {isAnalyzing ? '分析中...' : '分析を実行'}
      </button>
    </form>
  )
}

