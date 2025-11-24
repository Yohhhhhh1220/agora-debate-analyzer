@echo off
chcp 65001 >nul
echo ========================================
echo クイックプッシュ（既存リポジトリ用）
echo ========================================
echo.

REM Gitがインストールされているか確認
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: Gitがインストールされていません。
    pause
    exit /b 1
)

REM 変更をステージング
echo 変更をステージングしています...
call git add .

REM コミット
echo.
echo コミットしています...
call git commit -m "中高生向け評価項目に更新"

if %errorlevel% neq 0 (
    echo.
    echo コミットに失敗しました。変更がないか確認してください。
    echo 続行してプッシュを試みますか？ (Y/N)
    set /p continue_choice=
    if /i not "%continue_choice%"=="Y" (
        pause
        exit /b 0
    )
)

REM 現在のブランチ名を取得
for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set current_branch=%%i
if "%current_branch%"=="" (
    echo ブランチが見つかりません。mainブランチを使用します。
    set current_branch=main
)

echo.
echo ブランチ: %current_branch%
echo プッシュしています...
echo.

REM プッシュ
call git push

if %errorlevel% neq 0 (
    echo.
    echo プッシュに失敗しました。上流ブランチを設定して再試行します...
    call git push -u origin %current_branch%
    
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
echo.
pause

