// ==UserScript==
// @name         ChatGPT Selection Asker
// @namespace    https://github.com/st747/chatgpt-selection-asker
// @version      0.1.0
// @description  Select text on a webpage, right-click, and send it to ChatGPT as a prefilled prompt.
// @author       st747
// @match        *://*/*
// @exclude      https://chatgpt.com/*
// @exclude      https://chat.openai.com/*
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const CHATGPT_URL = "https://chatgpt.com/";
  const MAX_PROMPT_LENGTH = 8000;
  const TRIM_NOTICE =
    "\n\n[Selection was longer than 8000 characters and has been trimmed.]";
  const MENU_ID = "chatgpt-selection-asker-menu-host";

  let selectedText = "";
  let menuHost = null;
  let removeDismissListeners = null;

  function getSelectedText() {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return "";
    }

    return selection.toString().trim();
  }

  function buildPrompt(text) {
    if (text.length <= MAX_PROMPT_LENGTH) {
      return text;
    }

    const allowedTextLength = MAX_PROMPT_LENGTH - TRIM_NOTICE.length;
    return `${text.slice(0, Math.max(0, allowedTextLength)).trimEnd()}${TRIM_NOTICE}`;
  }

  function buildChatGptUrl(prompt) {
    const url = new URL(CHATGPT_URL);
    url.searchParams.set("q", prompt);
    return url.toString();
  }

  function openChatGpt(prompt) {
    const targetUrl = buildChatGptUrl(prompt);

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
    button.innerHTML = 'Ask ChatGPT<span class="hint">Open with selected text</span>';
    button.addEventListener("click", () => {
      const prompt = buildPrompt(selectedText);
      dismissMenu();
      openChatGpt(prompt);
    });

    menu.append(button);
    shadow.append(style, menu);
    document.documentElement.append(host);

    menuHost = host;
    positionMenu(host, x, y);
    addDismissListeners();
    button.focus({ preventScroll: true });
  }

  document.addEventListener(
    "contextmenu",
    (event) => {
      const text = getSelectedText();

      if (!text) {
        dismissMenu();
        return;
      }

      selectedText = text;
      event.preventDefault();
      event.stopPropagation();
      createMenu(event.clientX, event.clientY);
    },
    true,
  );
})();
