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
                  content: `あなたは中高生向けディベートの専門審査員です。以下のディベート内容を厳密に分析し、以下の観点で1-20点の範囲で評価してください。

# Constraints (制約条件)

* 各評価基準は20点満点（1〜20の整数）で評価します。

* フィードバックは、「良い点」と「改善する点」の2つに分けて、具体的かつ建設的に日本語で記述してください。
* 良い点：評価が高い項目や優れている点を具体的に指摘してください。
* 改善する点：評価が低い項目や改善できる点を具体的に指摘してください。

* 出力は、指定されたJSON形式のコードブロックのみとし、それ以外のテキスト（「承知しました」などの前置きや解説）は一切含めないでください。

# Evaluation Criteria (評価基準) - 中高生向け

1. 理由の納得感 (Reason) [20点満点]:
   * 主張に対する「なぜなら」がしっかり言えているか。論理の飛躍がないか。
   * 主張と理由の間に、論理的な飛躍、矛盾、循環論法がないか。
   * (評価ヒント: 理由なき主張は低評価。「なんとなく」ではなく、理由と言葉を結びつける基礎的な論理力があるか。)

2. 具体例・エピソード (Example) [20点満点]:
   * 統計データではなく、「例えばこういうことです」というたとえ話や自身の経験、身近な事例が含まれているか。
   * 抽象的な話を具体化する能力があるか。
   * (評価ヒント: 「証拠」は難しくても、「例え話」なら中高生でも豊富に出せる。具体例が皆無の場合は低評価。)

3. ユニークさ・新しい視点 (Uniqueness) [20点満点]:
   * ありきたりな意見ではなく、その人ならではの視点や、ハッとするような気づきがあるか。
   * 「正解」を探すのではなく、自分なりの考えを持っているか。
   * (評価ヒント: 「だから何？」という疑問が残る場合は低評価。独自性や創造性を評価します。)

4. 言葉の分かりやすさ (Clarity) [20点満点]:
   * 専門用語や難しい言葉を使わず、誰にでもわかる言葉で話しているか。
   * 結論が先に来ているか（PREP法など）。
   * (評価ヒント: 何を言いたいのか分かりにくい場合は低評価。「難しいことを簡単に伝える」ことの価値を評価します。)

5. 相手への配慮・多角的な視点 (Respect) [20点満点]: 
   * 一方的に自分の意見を押し付けるのではなく、「〜という考えもあるかもしれませんが」のように、反対意見や異なる立場への理解を示しているか。
   * 相手から予想される主要な反論や疑問点に対して、あらかじめ備えができているか。
   * (評価ヒント: 非常に「一方的」で、想定される反論に脆い議論は低評価。攻撃力ではなく包容力を評価します。)

ディベート内容：
${text}

以下のJSON形式で回答してください（数値は必ず1-20の範囲の整数で、overallは5項目の合計）：
{
  "reason": 数値,
  "example": 数値,
  "uniqueness": 数値,
  "clarity": 数値,
  "respect": 数値,
  "overall": 数値,
  "strengths": "良い点を具体的に記述（日本語、評価が高い項目や優れている点を指摘）",
  "improvements": "改善する点を具体的に記述（日本語、評価が低い項目や改善できる点を指摘）",
  "feedback": "strengthsとimprovementsを結合した文章（後方互換性のため）"
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
              
              const reason = Math.max(1, Math.min(20, Math.round(analysis.reason || 10)))
              const example = Math.max(1, Math.min(20, Math.round(analysis.example || 10)))
              const uniqueness = Math.max(1, Math.min(20, Math.round(analysis.uniqueness || 10)))
              const clarity = Math.max(1, Math.min(20, Math.round(analysis.clarity || 10)))
              const respect = Math.max(1, Math.min(20, Math.round(analysis.respect || 10)))
              const overall = reason + example + uniqueness + clarity + respect
              
              // フィードバックの処理
              const strengths = analysis.strengths || ''
              const improvements = analysis.improvements || ''
              const feedback = analysis.feedback || (strengths && improvements ? `${strengths}\n\n${improvements}` : '分析を完了しました。')
              
              send({
                type: 'complete',
                data: {
                  reason,
                  example,
                  uniqueness,
                  clarity,
                  respect,
                  overall,
                  feedback,
                  strengths,
                  improvements,
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
            
            const reasonConnectors = ['なぜなら', 'したがって', 'つまり', 'そのため', '従って', 'だから', '理由', '根拠', 'ため', 'ので']
            const reasonCount = reasonConnectors.reduce((count, connector) => {
              return count + (text.match(new RegExp(connector, 'g')) || []).length
            }, 0)
            
            const exampleMarkers = ['例えば', '例', 'エピソード', '経験', '体験', 'たとえば', '具体', '実際', '身近', 'こんな']
            const exampleCount = exampleMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const uniquenessMarkers = ['独自', '新しい', 'ユニーク', '斬新', '独自の', '新しい視点', '気づき', '発見', '独自性', '創造']
            const uniquenessCount = uniquenessMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const respectMarkers = ['一方で', 'しかし', '反対意見', '異なる', '多角的', '配慮', '理解', '立場', '視点', 'かもしれませんが']
            const respectCount = respectMarkers.reduce((count, marker) => {
              return count + (text.match(new RegExp(marker, 'g')) || []).length
            }, 0)
            
            const reasonScore = sentenceCount > 0 
              ? Math.max(1, Math.min(20, Math.round((reasonCount / sentenceCount) * 10 + 5)))
              : 5
            const exampleScore = exampleCount > 0
              ? Math.max(1, Math.min(20, Math.round((exampleCount / sentenceCount) * 8 + 3)))
              : 1
            const uniquenessScore = uniquenessCount > 0
              ? Math.max(1, Math.min(20, Math.round((uniquenessCount / sentenceCount) * 6 + 5)))
              : 5
            const clarityScore = Math.max(1, Math.min(20, Math.round((sentenceCount > 0 ? 12 : 5) + (wordCount > 50 ? 5 : 0))))
            const respectScore = respectCount > 0
              ? Math.max(1, Math.min(20, Math.round((respectCount / sentenceCount) * 5 + 5)))
              : 5
            
            const reason = reasonScore
            const example = exampleScore
            const uniqueness = uniquenessScore
            const clarity = clarityScore
            const respect = respectScore
            const overall = reason + example + uniqueness + clarity + respect
            
            // フィードバック生成（良い点と改善点に分ける）
            let strengths = ''
            let improvements = ''
            
            if (overall >= 80) {
              strengths = '優れたディベートです。論理的な構成と明確な説明が提示されています。'
            } else if (overall >= 60) {
              strengths = '良好なディベートです。基本的な論理構造は整っています。'
            } else {
              strengths = '基本的な構成は理解できます。'
            }
            
            const improvementPoints: string[] = []
            if (reasonCount < 2) {
              improvementPoints.push('「なぜなら」などの理由を示す言葉をより多く使用することで、論理的な流れがより明確になります。')
            }
            
            if (exampleCount < 1) {
              improvementPoints.push('具体例やエピソードを追加することで、主張がより分かりやすくなります。')
            }
            
            if (uniquenessCount < 1) {
              improvementPoints.push('自分なりの視点や気づきを追加することで、より魅力的な議論になります。')
            }
            
            if (respectCount < 1) {
              improvementPoints.push('反対意見や異なる立場への理解を示すことで、より多角的な議論になります。')
            }
            
            improvements = improvementPoints.length > 0 
              ? improvementPoints.join(' ') 
              : 'さらなる向上を目指して、より具体的な例や独自の視点を追加してみてください。'
            
            const feedback = `${strengths}\n\n${improvements}`
            
            send({
              type: 'complete',
              data: {
                reason,
                example,
                uniqueness,
                clarity,
                respect,
                overall,
                feedback: feedback.trim(),
                strengths: strengths.trim(),
                improvements: improvements.trim(),
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

