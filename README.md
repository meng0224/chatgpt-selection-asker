# chatgpt-selection-asker

一個 Tampermonkey userscript，可以把網頁上選取的文字送到 ChatGPT。

在網頁上選取文字後，按右鍵並選擇 `Ask ChatGPT`，腳本會開啟新的
ChatGPT 分頁，並把選取的文字預先填入提問欄。腳本不會自動送出訊息，
你可以先檢查或修改內容，再自行送出。

## 安裝

1. 在瀏覽器安裝 [Tampermonkey](https://www.tampermonkey.net/)。
2. 開啟 `chatgpt-selection-asker.user.js`，或在 Tampermonkey 建立新腳本，
   並貼上該檔案的內容。
3. 儲存並啟用腳本。

## 使用方式

1. 在一般網頁上選取文字。
2. 對選取的文字按右鍵。
3. 選擇 `Ask ChatGPT`。
4. 在 ChatGPT 檢查預先填入的提問內容，確認後再送出。

## 注意事項

- 這是頁面層級的自訂選單。Tampermonkey 無法把項目加入瀏覽器原生右鍵選單。
- 腳本會排除 ChatGPT 頁面，避免干擾 ChatGPT 本身的介面。
- 選取內容太長時，會裁切到約 8000 個字元，並附上一段簡短提示。
- 腳本不會儲存選取文字、API key、歷史紀錄或任何使用者資料。
- 有些網站會強制處理選取或右鍵行為。如果某個網站擋住選單，請改用一般複製貼上。
