// ==UserScript==
// @name         ChatGPT Selection Asker
// @namespace    https://github.com/st747/chatgpt-selection-asker
// @version      0.1.2
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
  const MENU_ID = "chatgpt-selection-asker-menu-host";

  let selectedText = "";
  let lastSelectionText = "";
  let lastSelectionAt = 0;
  let menuHost = null;
  let removeDismissListeners = null;
  const handledContextMenuEvents = new WeakSet();

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

  function dismissMenu() {
    if (removeDismissListeners) {
      removeDismissListeners();
      removeDismissListeners = null;
    }

    if (menuHost) {
      menuHost.remove();
      menuHost = null;
    }
  }

  function addDismissListeners() {
    const dismissOnPointerDown = (event) => {
      if (menuHost && !menuHost.contains(event.target)) {
        dismissMenu();
      }
    };
    const dismissOnEscape = (event) => {
      if (event.key === "Escape") {
        dismissMenu();
      }
    };

    document.addEventListener("pointerdown", dismissOnPointerDown, true);
    document.addEventListener("keydown", dismissOnEscape, true);
    window.addEventListener("scroll", dismissMenu, true);
    window.addEventListener("resize", dismissMenu, true);

    removeDismissListeners = () => {
      document.removeEventListener("pointerdown", dismissOnPointerDown, true);
      document.removeEventListener("keydown", dismissOnEscape, true);
      window.removeEventListener("scroll", dismissMenu, true);
      window.removeEventListener("resize", dismissMenu, true);
    };
  }

  function positionMenu(host, x, y) {
    const margin = 8;
    const rect = host.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - margin);
    const top = Math.min(y, window.innerHeight - rect.height - margin);

    host.style.left = `${Math.max(margin, left)}px`;
    host.style.top = `${Math.max(margin, top)}px`;
  }

  function createMenu(x, y) {
    dismissMenu();

    const host = document.createElement("div");
    host.id = MENU_ID;
    host.style.position = "fixed";
    host.style.left = "0";
    host.style.top = "0";
    host.style.zIndex = "2147483647";
    host.style.width = "max-content";
    host.style.maxWidth = "calc(100vw - 16px)";

    const shadow = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        color-scheme: light dark;
        font-family:
          Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
        font-size: 14px;
      }

      .menu {
        min-width: 168px;
        overflow: hidden;
        border: 1px solid rgba(125, 125, 125, 0.28);
        border-radius: 8px;
        background: Canvas;
        color: CanvasText;
        box-shadow:
          0 14px 40px rgba(0, 0, 0, 0.22),
          0 2px 8px rgba(0, 0, 0, 0.12);
        padding: 4px;
      }

      button {
        display: block;
        width: 100%;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: inherit;
        cursor: pointer;
        font: inherit;
        line-height: 1.25;
        padding: 9px 12px;
        text-align: left;
        white-space: nowrap;
      }

      button:hover,
      button:focus-visible {
        background: color-mix(in srgb, CanvasText 10%, transparent);
        outline: none;
      }

      .hint {
        display: block;
        margin-top: 2px;
        color: color-mix(in srgb, CanvasText 62%, transparent);
        font-size: 12px;
      }
    `;

    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "menu");

    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.innerHTML = canPrefillWithUrl(selectedText)
      ? 'Ask ChatGPT<span class="hint">Open with selected text</span>'
      : 'Copy and open ChatGPT<span class="hint">Paste manually in ChatGPT</span>';
    button.addEventListener("click", () => {
      const text = selectedText;
      dismissMenu();
      sendTextToChatGpt(text);
    });

    menu.append(button);
    shadow.append(style, menu);
    document.documentElement.append(host);

    menuHost = host;
    positionMenu(host, x, y);
    addDismissListeners();
    button.focus({ preventScroll: true });
  }

  function handleContextMenu(event) {
    if (handledContextMenuEvents.has(event)) {
      return;
    }

    handledContextMenuEvents.add(event);

    const text = getCurrentOrRecentSelection();

    if (!text) {
      dismissMenu();
      return;
    }

    selectedText = text;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    createMenu(event.clientX, event.clientY);
  }

  function handleShortcut(event) {
    if (!event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) {
      return;
    }

    if (event.key.toLowerCase() !== "g") {
      return;
    }

    if (openSelectedTextInChatGpt()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  window.addEventListener("contextmenu", handleContextMenu, true);
  document.addEventListener("contextmenu", handleContextMenu, true);
  document.addEventListener("selectionchange", rememberSelection, true);
  document.addEventListener("mouseup", rememberSelection, true);
  document.addEventListener("keyup", rememberSelection, true);
  document.addEventListener("keydown", handleShortcut, true);

  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("Ask ChatGPT with selected text", () => {
      openSelectedTextInChatGpt();
    });
  }
})();
