@echo off
echo ========================================
echo ディベートサイト - 初回Vercelデプロイ
echo ========================================
echo.

REM Vercel CLIがインストールされているか確認
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercel CLIが見つかりません。インストール中...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo エラー: Vercel CLIのインストールに失敗しました。
        echo 手動でインストールしてください: npm install -g vercel
        pause
        exit /b 1
    )
)

echo.
echo Vercel CLIが見つかりました。
echo.

REM ログイン
echo Vercelにログインします...
vercel login
if %errorlevel% neq 0 (
    echo エラー: ログインに失敗しました。
    pause
    exit /b 1
)

echo.
echo 初回デプロイを開始します...
echo 質問に答えてください:
echo   - Set up and deploy? → Y (Yes)
echo   - Which scope? → アカウントを選択
echo   - Link to existing project? → N (No)
echo   - What's your project's name? → プロジェクト名を入力
echo   - In which directory is your code located? → ./ (Enter)
echo   - Want to override the settings? → N (No)
echo.

REM 初回デプロイ（対話形式）
vercel

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo 初回デプロイが完了しました！
    echo.
    echo 環境変数を設定する場合:
    echo   vercel env add OPENAI_API_KEY
    echo   vercel env add OPENAI_MODEL
    echo.
    echo 本番環境にデプロイする場合:
    echo   vercel --prod
    echo ========================================
) else (
    echo.
    echo ========================================
    echo デプロイ中にエラーが発生しました。
    echo ========================================
)

pause

