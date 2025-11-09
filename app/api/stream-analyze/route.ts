import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// OpenAI APIクライアントの初期化
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'テキストが提供されていません' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // SSEストリームの設定
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
          if (openai) {
            // OpenAI APIを使用したストリーミング分析
            const completion = await openai.chat.completions.create({
              model: 'gpt-4-turbo-preview',
              messages: [
                {
                  role: 'system',
                  content: 'あなたはディベートの専門家です。ディベート内容を客観的かつ建設的に分析します。出力はJSON形式のコードブロックのみとし、それ以外のテキストは一切含めません。',
                },
                {
                  role: 'user',
                  content: `あなたはディベートの専門審査員です。以下のディベート内容を厳密に分析し、以下の観点で1-20点の範囲で評価してください。

# Constraints (制約条件)

* 各評価基準は20点満点（1〜20の整数）で評価します。

* フィードバックは、具体的かつ建設的であり、なぜその点数になったのかが明確にわかるように日本語で記述してください。

* 出力は、指定されたJSON形式のコードブロックのみとし、それ以外のテキスト（「承知しました」などの前置きや解説）は一切含めないでください。

# Evaluation Criteria (評価基準)

1. 論理性 (Logic) [20点満点]:
   * 主張（結論）と理由付け（根拠）が明確に示されているか。
   * 主張と理由の間に、論理的な飛躍、矛盾、循環論法がないか。
   * (評価ヒント: 理由なき主張は低評価。)

2. 証拠 (Evidence) [20点満点]:
   * 主張を裏付けるための客観的な証拠（統計、データ、専門家の見解、公的な報告書、具体的な事例）が提示されているか。
   * 「多くの人が」「普通は」といった曖昧な表現や、個人の感想・憶測だけで構成されていないか。
   * (評価ヒント: 証拠が皆無の場合は1点。)

3. 重要性 (Impact) [20点満点]:
   * その主張が、論題全体にとって「なぜ重要なのか」が説明されているか。
   * 主張が認められた場合の影響の「規模（どれだけ広範囲か）」「深刻度（どれだけ重大か）」が示されているか。
   * (評価ヒント: 「だから何？」という疑問が残る場合は低評価。)

4. 明確性 (Clarity) [20点満点]:
   * 文章全体が明確で、一読して何を主張したいのかが理解できるか。
   * 曖昧な表現で読者を混乱させていないか。
   * (評価ヒント: 何を言いたいのか分かりにくい場合は低評価。)

5. 反論耐性 (Robustness) [20点満点]: 
   * 相手から予想される主要な反論や疑問点に対して、あらかじめ備えができているか。
   * 主張に、例外や不利な側面を無視するなどの「分かりやすい弱点」が放置されていないか。
   * 例えば、コスト、倫理的な問題、実現可能性など、論題特有の反論ポイントを考慮しているか。
   * (評価ヒント: 非常に「一方的」で、想定される反論に脆い議論は低評価。)

ディベート内容：
${text}

以下のJSON形式で回答してください（数値は必ず1-20の範囲の整数で、overallは5項目の合計）：
{
  "logic": 数値,
  "evidence": 数値,
  "impact": 数値,
  "clarity": 数値,
  "robustness": 数値,
  "overall": 数値,
  "feedback": "フィードバック文章"
}`,
                },
              ],
              temperature: 0.7,
              response_format: { type: 'json_object' },
              stream: true,
            })

            let fullResponse = ''
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                send({ type: 'progress', content })
              }
            }

            try {
              // JSONブロックを抽出
              let jsonText = fullResponse.trim()
              if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '')
              }
              const analysis = JSON.parse(jsonText)
              
              const logic = Math.max(1, Math.min(20, Math.round(analysis.logic || 10)))
              const evidence = Math.max(1, Math.min(20, Math.round(analysis.evidence || 10)))
              const impact = Math.max(1, Math.min(20, Math.round(analysis.impact || 10)))
              const clarity = Math.max(1, Math.min(20, Math.round(analysis.clarity || 10)))
              const robustness = Math.max(1, Math.min(20, Math.round(analysis.robustness || 10)))
              const overall = logic + evidence + impact + clarity + robustness
              
              send({
                type: 'complete',
                data: {
                  logic,
                  evidence,
                  impact,
                  clarity,
                  robustness,
                  overall,
                  feedback: analysis.feedback || '分析を完了しました。',
                },
              })
            } catch (parseError) {
              send({ type: 'error', error: '分析結果の解析に失敗しました' })
            }
          } else {
            // 簡易版分析（ストリーミングなし）
            send({ type: 'progress', content: '分析を開始しています...' })
            
            // 簡易分析ロジック
            const wordCount = text.split(/\s+/).length
            const sentenceCount = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0).length
            
            const logicalConnectors = ['なぜなら', 'したがって', 'つまり', 'しかし', '一方で', 'さらに', 'また', '例えば', 'そのため', '従って']
            const connectorCount = logicalConnectors.reduce((count, connector) => {
              return count + (text.match(new RegExp(connector, 'g')) || []).length
            }, 0)
            
            const evidenceMarkers = ['データ', '研究', '調査', '統計', '例', '証拠', '根拠', '報告', '論文', '実験']
            const evidenceCount = evidenceMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const impactMarkers = ['重要', '影響', '効果', '意義', '価値', '必要性', '緊急', '深刻']
            const impactCount = impactMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const robustnessMarkers = ['反論', '批判', '疑問', '懸念', '課題', '問題点', '限界', '例外', 'しかし', '一方で']
            const robustnessCount = robustnessMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const logicScore = sentenceCount > 0 
              ? Math.max(1, Math.min(20, Math.round((connectorCount / sentenceCount) * 10 + 5)))
              : 5
            const evidenceScore = evidenceCount > 0
              ? Math.max(1, Math.min(20, Math.round((evidenceCount / sentenceCount) * 8 + 3)))
              : 1
            const impactScore = impactCount > 0
              ? Math.max(1, Math.min(20, Math.round((impactCount / sentenceCount) * 6 + 5)))
              : 5
            const clarityScore = Math.max(1, Math.min(20, Math.round((sentenceCount > 0 ? 12 : 5) + (wordCount > 50 ? 5 : 0))))
            const robustnessScore = robustnessCount > 0
              ? Math.max(1, Math.min(20, Math.round((robustnessCount / sentenceCount) * 5 + 5)))
              : 5
            
            const logic = logicScore
            const evidence = evidenceScore
            const impact = impactScore
            const clarity = clarityScore
            const robustness = robustnessScore
            const overall = logic + evidence + impact + clarity + robustness
            
            let feedback = ''
            if (overall >= 80) {
              feedback = '優れたディベートです。論理的な構成と明確な証拠が提示されています。'
            } else if (overall >= 60) {
              feedback = '良好なディベートです。いくつかの改善点がありますが、基本的な論理構造は整っています。'
            } else {
              feedback = '改善の余地があります。より明確な論理構造と証拠の提示を心がけてください。'
            }
            
            send({
              type: 'complete',
              data: {
                logic,
                evidence,
                impact,
                clarity,
                robustness,
                overall,
                feedback: feedback.trim(),
              },
            })
          }
        } catch (error) {
          console.error('Streaming error:', error)
          send({ type: 'error', error: '分析中にエラーが発生しました' })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Request error:', error)
    return new Response(
      JSON.stringify({ error: 'リクエストの処理中にエラーが発生しました' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

