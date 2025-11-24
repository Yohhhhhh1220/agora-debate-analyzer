@echo off
chcp 65001 >nul
echo ========================================
echo GitHub プッシュスクリプト
echo ========================================
echo.

REM Gitがインストールされているか確認
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: Gitがインストールされていません。
    echo https://git-scm.com/ からGitをインストールしてください。
    pause
    exit /b 1
)

REM Gitリポジトリが初期化されているか確認
if not exist .git (
    echo Gitリポジトリが初期化されていません。初期化します...
    call git init
    if %errorlevel% neq 0 (
        echo エラー: Gitリポジトリの初期化に失敗しました。
        pause
        exit /b 1
    )
    echo Gitリポジトリを初期化しました。
    echo.
)

REM 変更をステージング
echo 変更をステージングしています...
call git add .

REM コミット
echo.
echo コミットメッセージ: "中高生向け評価項目に更新"
call git commit -m "中高生向け評価項目に更新"

if %errorlevel% neq 0 (
    echo.
    echo 警告: コミットに失敗しました（変更がない可能性があります）。
    echo 続行しますか？ (Y/N)
    set /p continue_choice=
    if /i not "%continue_choice%"=="Y" (
        pause
        exit /b 0
    )
)

REM リモートリポジトリの確認
call git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo リモートリポジトリが設定されていません。
    echo.
    echo GitHubリポジトリのURLを入力してください:
    echo 例: https://github.com/your-username/your-repo-name.git
    set /p remote_url=
    if "%remote_url%"=="" (
        echo リモートURLが入力されませんでした。
        pause
        exit /b 1
    )
    call git remote add origin %remote_url%
    if %errorlevel% neq 0 (
        echo エラー: リモートリポジトリの追加に失敗しました。
        pause
        exit /b 1
    )
    echo リモートリポジトリを追加しました。
    echo.
)

REM 現在のブランチ名を確認
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if "%current_branch%"=="" (
    call git checkout -b main >nul 2>&1
    set current_branch=main
)

echo 現在のブランチ: %current_branch%
echo.

REM プッシュ
echo プッシュしています...
call git push -u origin %current_branch%

if %errorlevel% neq 0 (
    echo.
    echo プッシュに失敗しました。別のブランチ名を試します...
    call git push -u origin master
    if %errorlevel% neq 0 (
        echo.
        echo ========================================
        echo プッシュに失敗しました。
        echo ========================================
        echo.
        echo 考えられる原因:
        echo 1. GitHubの認証情報が設定されていない
        echo 2. リモートリポジトリが存在しない
        echo 3. 権限がない
        echo.
        echo 手動でプッシュする場合:
        echo   git push -u origin %current_branch%
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo プッシュが完了しました！
echo ========================================
echo.
pause

