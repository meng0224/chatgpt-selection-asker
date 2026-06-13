// ==UserScript==
// @name         ChatGPT Selection Asker
// @namespace    https://github.com/st747/chatgpt-selection-asker
// @version      0.1.4
// @description  Select text on a webpage, right-click, and send it to ChatGPT as a prefilled prompt.
// @author       st747
// @match        *://*/*
// @exclude      https://chat.openai.com/*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const CHATGPT_URL = "https://chatgpt.com/";
  const MAX_PREFILL_URL_LENGTH = 2000;
  const PENDING_TEXT_KEY = "pendingChatGptSelectionText";
  const PENDING_TEXT_CREATED_AT_KEY = "pendingChatGptSelectionCreatedAt";
  const PENDING_TEXT_TTL_MS = 5 * 60 * 1000;
  const PROMPT_WAIT_TIMEOUT_MS = 15000;
  const PROMPT_SELECTOR =
    '#prompt-textarea, textarea, [contenteditable="true"][role="textbox"], [contenteditable="true"]';

  let lastSelectionText = "";
  let lastSelectionAt = 0;

  function getSelectedText() {
    const inputSelection = getFocusedInputSelection();

    if (inputSelection) {
      return inputSelection;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return "";
    }

    return selection.toString().trim();
  }

  function getFocusedInputSelection() {
    const activeElement = document.activeElement;

    if (
      !activeElement ||
      !["INPUT", "TEXTAREA"].includes(activeElement.tagName) ||
      typeof activeElement.selectionStart !== "number" ||
      typeof activeElement.selectionEnd !== "number"
    ) {
      return "";
    }

    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;

    if (start === end) {
      return "";
    }

    return activeElement.value.slice(start, end).trim();
  }

  function rememberSelection() {
    const text = getSelectedText();

    if (!text) {
      return;
    }

    lastSelectionText = text;
    lastSelectionAt = Date.now();
  }

  function getCurrentOrRecentSelection() {
    const text = getSelectedText();

    if (text) {
      lastSelectionText = text;
      lastSelectionAt = Date.now();
      return text;
    }

    if (lastSelectionText && Date.now() - lastSelectionAt < 30000) {
      return lastSelectionText;
    }

    return "";
  }

  function buildChatGptUrl(prompt) {
    const url = new URL(CHATGPT_URL);
    url.searchParams.set("q", prompt);
    return url.toString();
  }

  function openChatGptUrl(targetUrl) {
    if (typeof GM_openInTab === "function") {
      GM_openInTab(targetUrl, {
        active: true,
        insert: true,
        setParent: true,
      });
      return;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }

  function canPrefillWithUrl(text) {
    return buildChatGptUrl(text).length <= MAX_PREFILL_URL_LENGTH;
  }

  function copyToClipboard(text) {
    if (typeof GM_setClipboard === "function") {
      GM_setClipboard(text, "text");
      return true;
    }

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).catch(() => {});
      return true;
    }

    return false;
  }

  function setPendingChatGptText(text) {
    if (typeof GM_setValue !== "function") {
      return false;
    }

    GM_setValue(PENDING_TEXT_KEY, text);
    GM_setValue(PENDING_TEXT_CREATED_AT_KEY, Date.now());
    return true;
  }

  function getPendingChatGptText() {
    if (typeof GM_getValue !== "function") {
      return "";
    }

    const text = GM_getValue(PENDING_TEXT_KEY, "");
    const createdAt = GM_getValue(PENDING_TEXT_CREATED_AT_KEY, 0);

    if (!text) {
      return "";
    }

    if (!createdAt || Date.now() - createdAt > PENDING_TEXT_TTL_MS) {
      clearPendingChatGptText();
      return "";
    }

    return text;
  }

  function clearPendingChatGptText() {
    if (typeof GM_deleteValue !== "function") {
      return;
    }

    GM_deleteValue(PENDING_TEXT_KEY);
    GM_deleteValue(PENDING_TEXT_CREATED_AT_KEY);
  }

  function notify(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.right = "16px";
    toast.style.bottom = "16px";
    toast.style.zIndex = "2147483647";
    toast.style.maxWidth = "min(420px, calc(100vw - 32px))";
    toast.style.padding = "10px 12px";
    toast.style.border = "1px solid rgba(125, 125, 125, 0.28)";
    toast.style.borderRadius = "8px";
    toast.style.background = "Canvas";
    toast.style.color = "CanvasText";
    toast.style.boxShadow =
      "0 14px 40px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.12)";
    toast.style.font =
      '14px/1.45 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

    document.documentElement.append(toast);
    window.setTimeout(() => {
      toast.remove();
    }, 4200);
  }

  function sendTextToChatGpt(text) {
    if (canPrefillWithUrl(text)) {
      openChatGptUrl(buildChatGptUrl(text));
      return "prefill";
    }

    const stored = setPendingChatGptText(text);
    openChatGptUrl(CHATGPT_URL);

    if (!stored) {
      copyToClipboard(text);
      notify("ChatGPT opened, but temporary storage failed. Paste the copied text manually.");
    }

    return stored ? "stored" : "storage-failed";
  }

  function openSelectedTextInChatGpt() {
    const text = getCurrentOrRecentSelection();

    if (!text) {
      return false;
    }

    sendTextToChatGpt(text);
    return true;
  }

  function isChatGptPage() {
    return location.hostname === "chatgpt.com";
  }

  function waitForPromptInput() {
    return new Promise((resolve) => {
      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        const input = document.querySelector(PROMPT_SELECTOR);

        if (input) {
          window.clearInterval(timer);
          resolve(input);
          return;
        }

        if (Date.now() - startedAt > PROMPT_WAIT_TIMEOUT_MS) {
          window.clearInterval(timer);
          resolve(null);
        }
      }, 250);
    });
  }

  function dispatchInputEvents(element) {
    element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fillPromptInput(input, text) {
    input.focus();

    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
      const valueSetter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        "value",
      )?.set;

      if (valueSetter) {
        valueSetter.call(input, text);
      } else {
        input.value = text;
      }

      dispatchInputEvents(input);
      return input.value === text;
    }

    if (input.isContentEditable) {
      input.textContent = text;
      dispatchInputEvents(input);
      return input.textContent === text;
    }

    return false;
  }

  async function fillPendingTextOnChatGpt() {
    const text = getPendingChatGptText();

    if (!text) {
      return;
    }

    const input = await waitForPromptInput();

    if (input && fillPromptInput(input, text)) {
      clearPendingChatGptText();
      notify("已自動填入 ChatGPT，請確認內容後再送出。");
      return;
    }

    copyToClipboard(text);
    clearPendingChatGptText();
    notify("Could not find the ChatGPT input box. Text was copied; press Ctrl+V to paste.");
  }

  if (isChatGptPage()) {
    fillPendingTextOnChatGpt();
  } else {
    document.addEventListener("selectionchange", rememberSelection, true);
    document.addEventListener("mouseup", rememberSelection, true);
    document.addEventListener("keyup", rememberSelection, true);
  }

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Ask ChatGPT with selected text", () => {
      openSelectedTextInChatGpt();
    });
  }
})();
