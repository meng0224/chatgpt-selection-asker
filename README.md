# chatgpt-selection-asker

一個 Tampermonkey userscript，可以把網頁上選取的文字送到 ChatGPT。

在網頁上選取文字後，按右鍵，選擇 `Tampermonkey` →
`Ask ChatGPT with selected text`，腳本會開啟新的 ChatGPT 分頁，並把選取的
文字預先填入提問欄。腳本不會自動送出訊息，你可以先檢查或修改內容，
再自行送出。

如果選取內容太長，腳本會暫存完整文字並開啟 ChatGPT 首頁，接著自動把
文字填入 ChatGPT 輸入框，避免網址太長造成 `HTTP ERROR 431`。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 開啟 `chatgpt-selection-asker.user.js`，或在 Tampermonkey 建立新腳本，
   並貼上該檔案的內容。
3. 儲存並啟用腳本。

## 使用方式

1. 在一般網頁上選取文字。
2. 對選取的文字按右鍵。
3. 選擇 `Tampermonkey`。
4. 選擇 `Ask ChatGPT with selected text`。
5. 在 ChatGPT 檢查預先填入的提問內容，確認後再送出。

## 注意事項

- 腳本不會攔截網站的右鍵選單，只會註冊 Tampermonkey 子選單項目。
- 腳本會在 ChatGPT 頁面讀取暫存文字並嘗試填入輸入框，不會自動送出訊息。
- 選取內容太長時，不會裁切文字；填入成功後會清除暫存內容。
- 如果 ChatGPT 介面變更導致自動填入失敗，腳本會改把文字複製到剪貼簿，
  並提示你按 `Ctrl+V` 手動貼上。
- 腳本不會儲存 API key、歷史紀錄或任何使用者資料。
- 有些網站會強制處理選取行為。如果送出的內容不是剛剛選取的文字，請重新
  選取一次後再使用 Tampermonkey 子選單。

## 授權

MIT
