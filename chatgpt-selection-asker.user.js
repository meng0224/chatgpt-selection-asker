// ==UserScript==
// @name         ChatGPT Selection Asker
// @namespace    https://github.com/st747/chatgpt-selection-asker
// @version      0.1.3
// @description  Select text on a webpage, right-click, and send it to ChatGPT as a prefilled prompt.
// @author       st747
// @match        *://*/*
// @exclude      https://chatgpt.com/*
// @exclude      https://chat.openai.com/*
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const CHATGPT_URL = "https://chatgpt.com/";
  const MAX_PREFILL_URL_LENGTH = 2000;

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

    const copied = copyToClipboard(text);
    openChatGptUrl(CHATGPT_URL);

    if (copied) {
      notify("Selection copied. Paste it into ChatGPT to avoid URL length limits.");
    } else {
      notify("ChatGPT opened, but clipboard access failed. Copy the selection manually.");
    }

    return copied ? "clipboard" : "clipboard-failed";
  }

  function openSelectedTextInChatGpt() {
    const text = getCurrentOrRecentSelection();

    if (!text) {
      return false;
    }

    sendTextToChatGpt(text);
    return true;
  }

  document.addEventListener("selectionchange", rememberSelection, true);
  document.addEventListener("mouseup", rememberSelection, true);
  document.addEventListener("keyup", rememberSelection, true);

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Ask ChatGPT with selected text", () => {
      openSelectedTextInChatGpt();
    });
  }
})();
