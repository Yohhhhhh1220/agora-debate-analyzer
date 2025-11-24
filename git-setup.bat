@echo off
echo ========================================
echo Git リポジトリ初期設定
echo ========================================
echo.

REM Gitリポジトリが初期化されているか確認
if exist .git (
    echo Gitリポジトリは既に初期化されています。
    echo.
    call git remote -v
    echo.
    pause
    exit /b 0
)

echo Gitリポジトリを初期化します...
call git init

if %errorlevel% neq 0 (
    echo エラー: Gitの初期化に失敗しました。
    pause
    exit /b 1
)

echo.
echo Gitリポジトリを初期化しました。
echo.

REM 初回コミット
echo すべてのファイルをステージングしています...
call git add .

echo.
echo 初回コミットを作成します...
call git commit -m "Initial commit"

if %errorlevel% neq 0 (
    echo 警告: コミットに失敗しました（変更がない可能性があります）。
)

echo.
echo ========================================
echo 次のステップ:
echo ========================================
echo.
echo 1. GitHubでリポジトリを作成してください
echo 2. 以下のコマンドでリモートを追加:
echo    git remote add origin https://github.com/your-username/your-repo-name.git
echo 3. 以下のコマンドでプッシュ:
echo    git push -u origin main
echo.
echo または、git-push.bat を実行してください。
echo.
pause

