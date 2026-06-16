# chatgpt-selection-asker

English | [繁體中文](README_zhtw.md)

A Tampermonkey userscript that sends selected text from any webpage to ChatGPT as a prefilled prompt.

After selecting text on a webpage, right-click and choose `Tampermonkey` -> `Ask ChatGPT with selected text`. The script opens a new ChatGPT tab and places the selected text into the prompt box for you.

The script does not submit the message automatically. You can review, edit, or cancel the prompt before sending it yourself.

## Features

- Sends selected webpage text to ChatGPT from the Tampermonkey context menu.
- Prefills the ChatGPT prompt without automatically submitting it.
- Supports text selected inside regular pages, inputs, and textareas.
- Handles long selections without cutting them off.
- Falls back to the clipboard if ChatGPT's interface changes and automatic filling fails.
- Does not store API keys, chat history, or user data long term. Selected text is written to local Tampermonkey storage only after you trigger the menu command, so the newly opened ChatGPT tab can fill the prompt.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Open [`chatgpt-selection-asker.user.js`](chatgpt-selection-asker.user.js), or create a new userscript in Tampermonkey and paste the file contents.
3. Save and enable the script.

## Usage

1. Select text on a normal webpage.
2. Right-click the selected text.
3. Choose `Tampermonkey`.
4. Choose `Ask ChatGPT with selected text`.
5. Review the prefilled ChatGPT prompt, then send it manually when ready.

## Text Handling

The script does not place selected text in the ChatGPT URL query. This avoids exposing the selected text through browser history, tab history, or the request sent to `chatgpt.com`.

After you trigger the menu command, the script temporarily stores the full text in local Tampermonkey storage and opens ChatGPT with a one-time token in the URL fragment. Only that automatically opened ChatGPT tab can consume the stored text. This also avoids browser or server errors such as `HTTP ERROR 431` caused by overly long URLs.

Temporary text is cleared after it is successfully filled, after it expires, after the fallback flow copies it to the clipboard, or when a manually opened ChatGPT tab sees leftover temporary text without the matching token.

## Notes

- The script does not replace or intercept a website's native right-click menu. It only registers a Tampermonkey menu command.
- The userscript uses `@match *://*/*` so the Tampermonkey menu command can work on most webpages. It keeps the current or recent selection only in page memory, and writes it to local Tampermonkey storage only after you trigger `Ask ChatGPT with selected text`.
- The script only reads temporarily stored text on the automatically opened ChatGPT tab with the matching one-time token.
- If you manually open a new ChatGPT tab later, leftover temporary text is cleared instead of being filled into the prompt box.
- The script never sends the prompt automatically.
- Long selections are not truncated.
- If automatic filling fails because the ChatGPT interface changed, the script copies the text to the clipboard and asks you to press `Ctrl+V` manually.
- Some websites aggressively manage text selection. If the text sent to ChatGPT is not the text you just selected, select it again and use the Tampermonkey menu once more.

## License

MIT. See [LICENSE](LICENSE).
