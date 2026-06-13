# chatgpt-selection-asker

一個 Tampermonkey userscript，可以把網頁上選取的文字送到 ChatGPT。

在網頁上選取文字後，按右鍵，選擇 `Tampermonkey` →
`Ask ChatGPT with selected text`，腳本會開啟新的 ChatGPT 分頁，並把選取的
文字預先填入提問欄。腳本不會自動送出訊息，你可以先檢查或修改內容，
再自行送出。

如果選取內容太長，腳本會改成把完整文字複製到剪貼簿，並開啟 ChatGPT
首頁，避免網址太長造成 `HTTP ERROR 431`。

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
- 腳本會排除 ChatGPT 頁面，避免干擾 ChatGPT 本身的介面。
- 選取內容太長時，不會裁切文字；腳本會複製完整內容到剪貼簿，並開啟
  ChatGPT 首頁讓你手動貼上。
- 腳本不會儲存選取文字、API key、歷史紀錄或任何使用者資料。
- 有些網站會強制處理選取行為。如果送出的內容不是剛剛選取的文字，請重新
  選取一次後再使用 Tampermonkey 子選單。
