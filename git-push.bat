@echo off
echo ========================================
echo Git プッシュスクリプト
echo ========================================
echo.

REM Gitリポジトリが初期化されているか確認
if not exist .git (
    echo Gitリポジトリが初期化されていません。
    echo 初期化しますか？ (Y/N)
    set /p init_choice=
    if /i "%init_choice%"=="Y" (
        call git init
        echo Gitリポジトリを初期化しました。
        echo.
        echo リモートリポジトリを設定してください:
        echo   git remote add origin https://github.com/your-username/your-repo-name.git
        echo.
        pause
        exit /b 0
    ) else (
        echo キャンセルしました。
        pause
        exit /b 0
    )
)

REM 変更をステージング
echo 変更をステージングしています...
call git add .

REM コミット
echo.
echo コミットメッセージを入力してください:
set /p commit_message=
if "%commit_message%"=="" (
    set commit_message=Update
)

echo.
echo コミットしています...
call git commit -m "%commit_message%"

if %errorlevel% neq 0 (
    echo エラー: コミットに失敗しました。
    echo 変更がないか、コミットメッセージが空の可能性があります。
    pause
    exit /b 1
)

REM リモートリポジトリの確認
call git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo リモートリポジトリが設定されていません。
    echo リモートリポジトリのURLを入力してください:
    set /p remote_url=
    if not "%remote_url%"=="" (
        call git remote add origin %remote_url%
    ) else (
        echo リモートURLが入力されませんでした。
        pause
        exit /b 1
    )
)

REM プッシュ
echo.
echo プッシュしています...
call git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ブランチ名が 'main' ではない可能性があります。'master' を試します...
    call git push -u origin master
    
    if %errorlevel% neq 0 (
        echo.
        echo エラー: プッシュに失敗しました。
        echo リモートリポジトリの設定を確認してください。
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo プッシュが完了しました！
echo ========================================
pause

