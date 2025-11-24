@echo off
echo ========================================
echo ディベートサイト - Vercelデプロイ
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

REM ログイン状態を確認
vercel whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo Vercelにログインしていません。ログインを開始します...
    vercel login
    if %errorlevel% neq 0 (
        echo エラー: ログインに失敗しました。
        pause
        exit /b 1
    )
)

echo.
echo デプロイを開始します...
echo.

REM デプロイ実行
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo デプロイが完了しました！
    echo ========================================
) else (
    echo.
    echo ========================================
    echo デプロイ中にエラーが発生しました。
    echo ========================================
)

pause

