import { NextRequest, NextResponse } from 'next/server'
import { AnalysisData } from '@/types/analysis'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

// OpenAI APIクライアントの初期化（環境変数が設定されている場合）
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

// デバッグ用: 環境変数の状態を確認
console.log('[API] 環境変数の状態:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0,
  openAIModel: process.env.OPENAI_MODEL || 'gpt-4o-mini (default)',
  nodeEnv: process.env.NODE_ENV,
})

// OpenAI APIを使用した高度な分析
async function analyzeWithOpenAI(text: string): Promise<Omit<AnalysisData, 'id' | 'timestamp'>> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured')
  }

  const prompt = `あなたはディベートの専門審査員です。以下のディベート内容を厳密に分析し、以下の観点で1-20点の範囲で評価してください。

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

以下のJSON形式で厳密に回答してください（数値は必ず1-20の範囲の整数で、overallは5項目の合計）：
{
  "logic": 数値,
  "evidence": 数値,
  "impact": 数値,
  "clarity": 数値,
  "robustness": 数値,
  "overall": 数値,
  "feedback": "具体的なフィードバック文章（日本語、なぜその点数になったのかが明確にわかるように記述）"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // .envファイルで指定されたモデルを使用
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
      logic: analysis.logic,
      evidence: analysis.evidence,
      impact: analysis.impact,
      clarity: analysis.clarity,
      robustness: analysis.robustness,
      overall: analysis.overall,
    })
    
    // 各項目を1-20の範囲に制限し、整数に変換
    const logic = Math.max(1, Math.min(20, Math.round(analysis.logic || 10)))
    const evidence = Math.max(1, Math.min(20, Math.round(analysis.evidence || 10)))
    const impact = Math.max(1, Math.min(20, Math.round(analysis.impact || 10)))
    const clarity = Math.max(1, Math.min(20, Math.round(analysis.clarity || 10)))
    const robustness = Math.max(1, Math.min(20, Math.round(analysis.robustness || 10)))
    const overall = logic + evidence + impact + clarity + robustness
    
    return {
      text,
      logic,
      evidence,
      impact,
      clarity,
      robustness,
      overall,
      feedback: analysis.feedback || '分析を完了しました。',
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
  
  // 論理的な接続詞の検出
  const logicalConnectors = ['なぜなら', 'したがって', 'つまり', 'しかし', '一方で', 'さらに', 'また', '例えば', 'そのため', '従って']
  const connectorCount = logicalConnectors.reduce((count, connector) => {
    return count + (text.match(new RegExp(connector, 'g')) || []).length
  }, 0)
  
  // 証拠を示す表現の検出
  const evidenceMarkers = ['データ', '研究', '調査', '統計', '例', '証拠', '根拠', '報告', '論文', '実験']
  const evidenceCount = evidenceMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // 重要性を示す表現の検出
  const impactMarkers = ['重要', '影響', '効果', '意義', '価値', '必要性', '緊急', '深刻']
  const impactCount = impactMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // 反論への言及の検出
  const robustnessMarkers = ['反論', '批判', '疑問', '懸念', '課題', '問題点', '限界', '例外', 'しかし', '一方で']
  const robustnessCount = robustnessMarkers.reduce((count, marker) => {
    return count + (text.match(new RegExp(marker, 'g')) || []).length
  }, 0)
  
  // スコア計算（簡易版、1-20点に変換）
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
  
  // フィードバック生成
  let feedback = ''
  if (overall >= 80) {
    feedback = '優れたディベートです。論理的な構成と明確な証拠が提示されています。'
  } else if (overall >= 60) {
    feedback = '良好なディベートです。いくつかの改善点がありますが、基本的な論理構造は整っています。'
  } else {
    feedback = '改善の余地があります。より明確な論理構造と証拠の提示を心がけてください。'
  }
  
  if (connectorCount < 2) {
    feedback += ' 論理的な接続詞をより多く使用することで、論理的な流れがより明確になります。'
  }
  
  if (evidenceCount < 1) {
    feedback += ' 具体的な証拠やデータを追加することで、主張の説得力が向上します。'
  }
  
  if (impactCount < 1) {
    feedback += ' 主張の重要性や影響について説明を追加することで、より説得力のある議論になります。'
  }
  
  if (robustnessCount < 1) {
    feedback += ' 予想される反論への対応を追加することで、議論の堅牢性が向上します。'
  }
  
  return {
    text,
    logic,
    evidence,
    impact,
    clarity,
    robustness,
    overall,
    feedback: feedback.trim(),
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
    let analysis: Omit<AnalysisData, 'id' | 'timestamp'>
    let usedOpenAI = false
    
    try {
      if (openai) {
        console.log('[API] OpenAI APIを使用して分析を開始...')
        analysis = await analyzeWithOpenAI(text)
        usedOpenAI = true
        console.log('[API] OpenAI API分析が正常に完了しました')
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
        analysis.feedback = `[注意: OpenAI APIエラーのため簡易分析を使用] ${analysis.feedback}`
      }
    }
    
    // 完全なAnalysisDataオブジェクトを作成
    const analysisData: AnalysisData = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...analysis,
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
