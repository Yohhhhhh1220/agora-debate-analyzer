import { NextRequest, NextResponse } from 'next/server'
import { AnalysisData } from '@/types/analysis'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

// OpenAI APIクライアントの初期化（環境変数が設定されている場合）
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// デフォルトモデルのリスト（優先順位順）
const DEFAULT_MODELS = ['gpt-4o-mini-2024-07-18', 'gpt-3.5-turbo', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']

// デバッグ用: 環境変数の状態を確認
console.log('[API] 環境変数の状態:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  openAIModel: process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18 (default)',
  nodeEnv: process.env.NODE_ENV,
})

// OpenAI APIを使用した高度な分析
async function analyzeWithOpenAI(text: string, modelName?: string): Promise<Omit<AnalysisData, 'id' | 'timestamp'>> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured')
  }

  // 使用するモデルを決定
  const model = modelName || process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18'

  const prompt = `あなたは中高生向けディベートの専門審査員です。以下のディベート内容を厳密に分析し、以下の観点で1-20点の範囲で評価してください。

# Constraints (制約条件)

* 各評価基準は20点満点（1〜20の整数）で評価します。

* フィードバックは、「良い点」と「改善する点」の2つに分けて、具体的かつ建設的に日本語で記述してください。
* 良い点：評価が高い項目や優れている点を具体的に指摘してください。
* 改善する点：評価が低い項目や改善できる点を具体的に指摘してください。

* 出力は、指定されたJSON形式のコードブロックのみとし、それ以外のテキスト（「承知しました」などの前置きや解説）は一切含めないでください。

# Evaluation Criteria (評価基準) - 中高生向け

1. 理由の納得感 (Reason) [20点満点]:
   * 主張に対する「なぜなら」がしっかり言えているか。
   * 主張と理由の間に、論理的な飛躍がないか。
   * 理由が明確で、納得できる内容になっているか。
   * (評価ヒント: 理由なき主張は低評価。論理の飛躍がある場合は低評価。)

2. 具体例・エピソード (Example) [20点満点]:
   * 統計データではなく、「例えばこういうことです」というたとえ話や自身の経験、身近な事例が含まれているか。
   * 抽象的な説明だけでなく、具体的な例やエピソードで説明しているか。
   * (評価ヒント: 具体例やエピソードが皆無の場合は低評価。)

3. ユニークさ・新しい視点 (Uniqueness) [20点満点]:
   * ありきたりな意見ではなく、その人ならではの視点や、ハッとするような気づきがあるか。
   * 独自の考えや新しい角度からの意見が含まれているか。
   * (評価ヒント: 非常に一般的で誰でも言えるような内容は低評価。)

4. 言葉の分かりやすさ (Clarity) [20点満点]:
   * 専門用語や難しい言葉を使わず、誰にでもわかる言葉で話しているか。
   * 結論が先に来ているか（PREP法など）。
   * 文章全体が明確で、一読して何を主張したいのかが理解できるか。
   * (評価ヒント: 何を言いたいのか分かりにくい場合は低評価。)

5. 相手への配慮・多角的な視点 (Respect) [20点満点]: 
   * 一方的に自分の意見を押し付けるのではなく、「〜という考えもあるかもしれませんが」のように、反対意見や異なる立場への理解を示しているか。
   * 相手の立場を尊重し、多角的な視点から議論しているか。
   * (評価ヒント: 非常に「一方的」で、他の視点を無視する議論は低評価。)

ディベート内容：
${text}

以下のJSON形式で厳密に回答してください（数値は必ず1-20の範囲の整数で、overallは5項目の合計）：
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
}`

  try {
    console.log(`[API] モデル "${model}" を使用して分析を開始...`)
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'あなたは経験豊富なディベート審査員です。各主張を独立して厳密に評価し、内容の違いを正確に反映した点数を付けます。同じような主張でも、表現や論理構成の違いにより異なる評価をします。出力はJSON形式のコードブロックのみとし、それ以外のテキストは一切含めません。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // より一貫性のある評価のため温度を下げる
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('OpenAI APIからの応答がありません')
    }

    // JSONブロックを抽出（コードブロックが含まれている場合）
    let jsonText = responseText.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '')
    }

    const analysis = JSON.parse(jsonText)
    
    // デバッグ用: 解析されたデータを確認
    console.log('OpenAI API response parsed:', {
      reason: analysis.reason,
      example: analysis.example,
      uniqueness: analysis.uniqueness,
      clarity: analysis.clarity,
      respect: analysis.respect,
      overall: analysis.overall,
    })
    
    // 各項目を1-20の範囲に制限し、整数に変換
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
    
    return {
      text,
      reason,
      example,
      uniqueness,
      clarity,
      respect,
      overall,
      feedback,
      strengths,
      improvements,
    }
  } catch (error: any) {
    console.error('[API] OpenAI API error:', error)
    console.error('[API] OpenAI API エラー詳細:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      name: error?.name,
      type: error?.type,
      response: error?.response,
      stack: error?.stack,
    })
    throw error
  }
}

// 簡易版AI分析関数（OpenAI APIが使用できない場合のフォールバック）
async function analyzeDebateSimple(text: string): Promise<Omit<AnalysisData, 'id' | 'timestamp'>> {
  // テキストの長さと複雑さを分析
  const wordCount = text.split(/\s+/).length
  const sentenceCount = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0).length
  
  // 理由を示す接続詞の検出
  const reasonConnectors = ['なぜなら', 'したがって', 'つまり', 'そのため', '従って', 'だから', '理由', '根拠', 'ため', 'ので']
  const reasonCount = reasonConnectors.reduce((count, connector) => {
    return count + (text.match(new RegExp(connector, 'g')) || []).length
  }, 0)
  
  // 具体例・エピソードを示す表現の検出
  const exampleMarkers = ['例えば', '例', 'エピソード', '経験', '体験', 'たとえば', '具体', '実際', '身近', 'こんな']
  const exampleCount = exampleMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // ユニークさ・新しい視点を示す表現の検出
  const uniquenessMarkers = ['独自', '新しい', 'ユニーク', '斬新', '独自の', '新しい視点', '気づき', '発見', '独自性', '創造']
  const uniquenessCount = uniquenessMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // 相手への配慮・多角的な視点を示す表現の検出
  const respectMarkers = ['一方で', 'しかし', '反対意見', '異なる', '多角的', '配慮', '理解', '立場', '視点', 'かもしれませんが']
  const respectCount = respectMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // スコア計算（簡易版、1-20点に変換）
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
  
  return {
    text,
    reason,
    example,
    uniqueness,
    clarity,
    respect,
    overall,
    feedback: feedback.trim(),
    strengths: strengths.trim(),
    improvements: improvements.trim(),
  }
}

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/analyze リクエストを受信')
  try {
    const body = await request.json()
    const { text } = body
    
    console.log('[API] リクエストボディ:', { 
      textLength: text?.length || 0, 
      textType: typeof text,
      hasText: !!text && typeof text === 'string' && text.trim().length > 0
    })
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      console.error('[API] エラー: テキストが提供されていません')
      return NextResponse.json(
        { error: 'テキストが提供されていません' },
        { status: 400 }
      )
    }
    
    // 分析実行（OpenAI APIが利用可能な場合はそれを使用、そうでなければ簡易版）
    let analysis: Omit<AnalysisData, 'id' | 'timestamp'> | null = null
    let usedOpenAI = false
    let usedModel: string | null = null
    
    try {
      if (openai) {
        console.log('[API] OpenAI APIを使用して分析を開始...')
        
        // モデルエラーの場合にフォールバックを試行
        const modelsToTry = process.env.OPENAI_MODEL 
          ? [process.env.OPENAI_MODEL, ...DEFAULT_MODELS.filter(m => m !== process.env.OPENAI_MODEL)]
          : DEFAULT_MODELS
        
        let lastError: any = null
        for (const modelToTry of modelsToTry) {
          try {
            analysis = await analyzeWithOpenAI(text, modelToTry)
            usedModel = modelToTry
            usedOpenAI = true
            console.log(`[API] OpenAI API分析が正常に完了しました (使用モデル: ${modelToTry})`)
            break
          } catch (modelError: any) {
            // モデルが利用できない場合（403エラー）は次のモデルを試す
            if (modelError?.status === 403 && modelError?.code === 'model_not_found') {
              console.warn(`[API] モデル "${modelToTry}" にアクセスできません。次のモデルを試します...`)
              lastError = modelError
              continue
            }
            // その他のエラーは即座にスロー
            throw modelError
          }
        }
        
        // すべてのモデルで失敗した場合
        if (!usedOpenAI || !analysis) {
          throw lastError || new Error('すべてのモデルでアクセスに失敗しました')
        }
      } else {
        console.log('[API] OpenAI APIが設定されていないため、簡易分析を使用します')
        analysis = await analyzeDebateSimple(text)
      }
    } catch (error: any) {
      console.error('[API] 分析エラー:', error)
      console.error('[API] エラー詳細:', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        name: error?.name,
        stack: error?.stack,
      })
      
      // OpenAI APIでエラーが発生した場合は簡易版にフォールバック
      console.log('[API] エラーのため簡易分析にフォールバックします')
      try {
        analysis = await analyzeDebateSimple(text)
        console.log('[API] 簡易分析が完了しました')
      } catch (fallbackError) {
        console.error('[API] 簡易分析でもエラーが発生:', fallbackError)
        throw fallbackError
      }
      
      // エラー情報をフィードバックに追加（開発環境のみ）
      if (process.env.NODE_ENV === 'development' && usedOpenAI) {
        if (analysis) {
          analysis.feedback = `[注意: OpenAI APIエラーのため簡易分析を使用] ${analysis.feedback}`
        }
      }
    }
    
    // analysisがnullの場合はエラー
    if (!analysis) {
      throw new Error('分析結果が取得できませんでした')
    }
    
    // この時点でanalysisは確実に値を持っている
    const finalAnalysis: Omit<AnalysisData, 'id' | 'timestamp'> = analysis
    
    // 完全なAnalysisDataオブジェクトを作成
    const analysisData: AnalysisData = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...finalAnalysis,
    }
    
    console.log('[API] 分析結果を返却:', { 
      id: analysisData.id, 
      overall: analysisData.overall,
      feedbackLength: analysisData.feedback?.length || 0
    })
    
    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('[API] 予期しないエラー:', error)
    console.error('[API] エラー詳細:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { error: '分析中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
