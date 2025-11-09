@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo 依存関係をインストールしています...
call npm install
if %errorlevel% equ 0 (
    echo.
    echo インストールが完了しました！
    echo.
    echo 開発サーバーを起動します...
    call npm run dev
) else (
    echo.
    echo エラーが発生しました。npmがインストールされているか確認してください。
    pause
)

