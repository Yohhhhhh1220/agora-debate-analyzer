'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AnalysisData } from '@/types/analysis'

interface AnalysisChartProps {
  data: AnalysisData[]
}

export default function AnalysisChart({ data }: AnalysisChartProps) {
  const chartData = data.map((item, index) => ({
    name: `分析${index + 1}`,
    timestamp: new Date(item.timestamp).toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    論理性: item.logic,
    証拠: item.evidence,
    重要性: item.impact,
    明確性: item.clarity,
    反論耐性: item.robustness,
    総合評価: item.overall,
  }))

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: 'スコア', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 20]}
            tick={{ fontSize: 12 }}
            label={{ value: '各項目スコア (20点満点)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="論理性" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="証拠" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="重要性" 
            stroke="#f59e0b" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="明確性" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="反論耐性" 
            stroke="#ec4899" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            yAxisId="right"
          />
          <Line 
            type="monotone" 
            dataKey="総合評価" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

