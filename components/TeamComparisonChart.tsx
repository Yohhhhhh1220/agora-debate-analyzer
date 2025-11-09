'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AnalysisData } from '@/types/analysis'

interface TeamComparisonChartProps {
  teamAData: AnalysisData[]
  teamBData: AnalysisData[]
  isDark?: boolean
}

export default function TeamComparisonChart({ teamAData, teamBData, isDark = false }: TeamComparisonChartProps) {
  // 両チームのデータを統合して時系列で表示
  const maxLength = Math.max(teamAData.length, teamBData.length)
  const chartData = []
  
  // データが空の場合は、初期状態として0点のデータポイントを1つ表示
  if (maxLength === 0) {
    chartData.push({
      name: '初期状態',
      round: 0,
      'チームA-総合': 0,
      'チームB-総合': 0,
    })
  } else {
    for (let i = 0; i < maxLength; i++) {
      const round = i + 1
      const dataPoint: any = {
        name: `ラウンド${round}`,
        round,
      }
      
      if (i < teamAData.length) {
        dataPoint['チームA-総合'] = teamAData[i].overall
      } else {
        dataPoint['チームA-総合'] = 0
      }
      
      if (i < teamBData.length) {
        dataPoint['チームB-総合'] = teamBData[i].overall
      } else {
        dataPoint['チームB-総合'] = 0
      }
      
      chartData.push(dataPoint)
    }
  }

  return (
    <div className={`w-full ${isDark ? 'h-full' : 'h-96'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : undefined} opacity={isDark ? 0.3 : undefined} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: isDark ? 16 : 12, fill: isDark ? '#cbd5e1' : undefined }}
            stroke={isDark ? '#94a3b8' : undefined}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: isDark ? 16 : 12, fill: isDark ? '#cbd5e1' : undefined }}
            stroke={isDark ? '#94a3b8' : undefined}
            label={{ 
              value: 'スコア', 
              angle: -90, 
              position: 'insideLeft',
              style: isDark ? { fill: '#cbd5e1', fontSize: 18 } : undefined
            }}
          />
          <Tooltip 
            contentStyle={isDark ? {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '2px solid #475569',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px'
            } : {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend 
            wrapperStyle={isDark ? { fontSize: '18px', color: '#cbd5e1' } : undefined}
          />
          
          {/* チームA */}
          <Line 
            type="monotone" 
            dataKey="チームA-総合" 
            stroke={isDark ? "#60a5fa" : "#3b82f6"} 
            strokeWidth={isDark ? 4 : 3}
            dot={{ r: isDark ? 6 : 5, fill: isDark ? "#60a5fa" : undefined }}
            activeDot={{ r: isDark ? 10 : 7 }}
            name="チームA 総合評価"
          />
          
          {/* チームB */}
          <Line 
            type="monotone" 
            dataKey="チームB-総合" 
            stroke={isDark ? "#f87171" : "#ef4444"} 
            strokeWidth={isDark ? 4 : 3}
            dot={{ r: isDark ? 6 : 5, fill: isDark ? "#f87171" : undefined }}
            activeDot={{ r: isDark ? 10 : 7 }}
            name="チームB 総合評価"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

