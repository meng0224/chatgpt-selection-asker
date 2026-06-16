# chatgpt-selection-asker

[English](README.md) | 繁體中文

一個 Tampermonkey userscript，可以把網頁上選取的文字送到 ChatGPT，並預先填入提問欄。

在網頁上選取文字後，按右鍵，選擇 `Tampermonkey` -> `Ask ChatGPT with selected text`。腳本會開啟新的 ChatGPT 分頁，並把選取的文字放進提問欄。

腳本不會自動送出訊息。你可以先檢查、修改或取消內容，再自行送出。

## 功能特色

- 從 Tampermonkey 右鍵選單把網頁選取文字送到 ChatGPT。
- 預先填入 ChatGPT 提問欄，但不會自動送出。
- 支援一般網頁、輸入框與文字區塊中的選取內容。
- 選取內容太長時不會裁切文字。
- 如果 ChatGPT 介面變更導致自動填入失敗，會改把文字複製到剪貼簿。
- 不儲存 API key、聊天紀錄或任何使用者資料。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 開啟 [`chatgpt-selection-asker.user.js`](chatgpt-selection-asker.user.js)，或在 Tampermonkey 建立新腳本，並貼上該檔案的內容。
3. 儲存並啟用腳本。

## 使用方式

1. 在一般網頁上選取文字。
2. 對選取的文字按右鍵。
3. 選擇 `Tampermonkey`。
4. 選擇 `Ask ChatGPT with selected text`。
5. 在 ChatGPT 檢查預先填入的提問內容，確認後再手動送出。

## 長文字處理

選取內容較短時，腳本會透過網址參數開啟 ChatGPT，讓文字直接出現在提問欄。

如果選取內容太長，腳本會暫存完整文字，並用一次性 token 開啟 ChatGPT。只有那個由腳本自動開啟、token 相符的 ChatGPT 分頁可以取用暫存文字。這可以避免網址太長造成瀏覽器或伺服器錯誤，例如 `HTTP ERROR 431`。

暫存文字會在成功填入、過期、fallback 流程複製到剪貼簿後清除；如果之後手動開啟新的 ChatGPT 分頁，腳本會清掉殘留暫存，而不會再把舊內容填進輸入框。

## 注意事項

- 腳本不會取代或攔截網站原本的右鍵選單，只會註冊 Tampermonkey 選單命令。
- 腳本只會在 token 相符的自動開啟 ChatGPT 分頁讀取暫存文字並嘗試填入提問欄。
- 如果手動開啟新的 ChatGPT 分頁，殘留暫存會被清掉，不會填入舊內容。
- 腳本不會自動送出訊息。
- 選取內容太長時不會裁切文字。
- 如果 ChatGPT 介面變更導致自動填入失敗，腳本會改把文字複製到剪貼簿，並提示你按 `Ctrl+V` 手動貼上。
- 有些網站會強制處理選取行為。如果送出的內容不是剛剛選取的文字，請重新選取一次後再使用 Tampermonkey 選單。

## 授權

MIT
