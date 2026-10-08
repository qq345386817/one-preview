/* Shared by the standalone website and the native report exporter. */
(function (global) {
  "use strict";
  const MAX_SOURCE_BYTES = 500000;
  const MAX_PAGES = 100;
  const imageData = /^data:image\/(?:png|jpeg|gif|webp|bmp);base64,[a-z0-9+/=\s]+$/i;
  let serial = 0;
  const defaultLabels = {
    image: "Image unavailable", diagram: "Diagram could not be rendered", math: "Formula could not be rendered",
    page: "Page %d / %d", title: "Markdown report"
  };
  function fail(code) { const error = new Error(code); error.code = code; throw error; }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function escape(value) { return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function deadline(promise, ms, code) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => { const e = new Error(code); e.code = code; reject(e); }, ms);
    })]).finally(() => clearTimeout(timer));
  }
  function highlight(root) {
    if (!global.hljs) return;
    for (const block of root.querySelectorAll("pre code")) {
      if (block.classList.contains("language-mermaid")) continue;
      try { global.hljs.highlightElement(block); } catch (_) { /* Plain code stays readable. */ }
    }
  }
  async function prepare(source, options, labels, warnings) {
    if (!global.marked || !global.DOMPurify) fail("resources");
    const renderer = new global.marked.Renderer();
    // Keep Markdown images inert until explicit user-selected resources have been resolved.
    renderer.image = (href, title, text) => `<img data-report-src="${escape(href)}" alt="${escape(text)}">`;
    const fragment = global.DOMPurify.sanitize(global.marked.parse(source, { gfm: true, breaks: false, renderer }), {
      RETURN_DOM_FRAGMENT: true,
      ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "blockquote", "ul", "ol", "li", "a", "strong", "em", "del", "s", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "img", "input"],
      ALLOWED_ATTR: ["href", "alt", "title", "class", "start", "type", "checked", "disabled", "data-report-src"],
      ALLOW_DATA_ATTR: false, FORBID_ATTR: ["src", "srcset", "style", "id", "name"]
    });
    const root = element("div", "report-source");
    root.append(fragment);
    for (const child of [...root.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent.trim()) child.replaceWith(element("p", "", child.textContent));
        else child.remove();
      }
    }
    for (const node of root.querySelectorAll("[class]")) {
      const language = node.tagName === "CODE" && node.className.match(/(?:^|\s)language-([\w+-]+)/);
      node.className = language ? `language-${language[1]}` : "";
    }
    for (const link of root.querySelectorAll("a")) {
      if (!/^(?:https?:|mailto:|#)/i.test(link.getAttribute("href") || "")) link.removeAttribute("href");
      link.target = "_blank"; link.rel = "noopener noreferrer";
    }
    for (const input of root.querySelectorAll("input")) {
      if (input.type !== "checkbox") input.remove(); else input.disabled = true;
    }
    options.mount.append(root);
    try {
      for (const image of [...root.querySelectorAll("img")]) {
        const reference = image.getAttribute("data-report-src") || image.alt || "image";
        let normalized;
        try { normalized = decodeURIComponent(reference).replace(/\\/g, "/").replace(/^\.\//, ""); } catch (_) { normalized = reference; }
        const assets = options.assets || {};
        const chosen = Object.hasOwn(assets, normalized) ? assets[normalized] : Object.hasOwn(assets, normalized.split("/").pop()) ? assets[normalized.split("/").pop()] : undefined;
        const value = imageData.test(reference) ? reference : chosen;
        try {
          if (!value || !imageData.test(value) || value.length > 14000000) fail("image");
          image.src = value;
          await deadline(image.decode(), 5000, "image");
          if (!image.naturalWidth) fail("image");
          image.removeAttribute("data-report-src");
        } catch (_) {
          const message = `${labels.image}: ${reference.slice(0, 160)}`;
          image.replaceWith(element("span", "report-warning", message));
          warnings.push(message);
        }
      }
      const diagrams = [...root.querySelectorAll("pre code.language-mermaid")];
      if (diagrams.length && !global.mermaid) fail("resources");
      if (diagrams.length) global.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "base", htmlLabels: false,
        fontFamily: getComputedStyle(document.body).fontFamily,
        themeVariables: { primaryColor: "#eaf2fc", primaryBorderColor: "#75a5d7", primaryTextColor: "#182332", lineColor: "#52687c" },
        flowchart: { htmlLabels: false }, maxTextSize: 50000 });
      for (const block of diagrams) {
        try {
          if (/%%\{|^\s*---/m.test(block.textContent)) fail("diagram");
          const result = await deadline(global.mermaid.render(`report-diagram-${++serial}`, block.textContent), 10000, "diagram");
          if (/<foreignObject[\s>]/i.test(result.svg)) fail("diagram");
          const diagram = element("div", "report-diagram");
          diagram.innerHTML = global.DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true }, FORBID_TAGS: ["foreignObject", "a"] });
          block.parentNode.replaceWith(diagram);
        } catch (_) {
          warnings.push(labels.diagram);
          block.className = "";
          block.parentNode.before(element("p", "report-warning", labels.diagram));
          document.querySelectorAll('[id^="dreport-diagram-"]').forEach(n => n.remove());
        }
      }
      highlight(root);
      if (global.renderMathInElement) global.renderMathInElement(root, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }, { left: "$", right: "$", display: false }],
        trust: false, throwOnError: true, maxExpand: 1000, errorCallback: () => warnings.push(labels.math)
      });
      if (document.fonts) await deadline(document.fonts.ready, 10000, "fonts");
      if (root.scrollWidth > root.clientWidth + 1) fail("width");
      return root;
    } catch (error) { root.remove(); throw error; }
  }

  function paginate(source, mount, title, labels) {
    const pages = [];
    let body;
    function newPage() {
      if (pages.length >= MAX_PAGES) fail("pages");
      const page = element("section", "report-page");
      const header = element("header", "report-header");
      header.append(element("span", "", title), element("span", "", "A4"));
      body = element("article", "report-body");
      const footer = element("footer", "report-footer");
      footer.append(element("span", "", title), element("span", "report-page-number"));
      page.append(header, body, footer); mount.append(page); pages.push(page);
    }
    function fits() {
      const limit = body.getBoundingClientRect().bottom - parseFloat(getComputedStyle(body).paddingBottom);
      return body.scrollWidth <= body.clientWidth + 1 && (!body.lastElementChild || body.lastElementChild.getBoundingClientRect().bottom <= limit + 0.25);
    }
    function append(node) { body.append(node); if (fits()) return true; node.remove(); return false; }
    function rangeFragment(node, start, end) {
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      let text, offset = 0, begun = false;
      while ((text = walker.nextNode())) {
        const next = offset + text.length;
        if (!begun && start < next) { range.setStart(text, start - offset); begun = true; }
        if (begun && end <= next) { range.setEnd(text, end - offset); break; }
        offset = next;
      }
      const fragment = node.cloneNode(false);
      fragment.append(range.cloneContents());
      return fragment;
    }
    function splitText(node) {
      if (node.querySelector("img, svg, .katex, table, input")) fail("block");
      const text = node.textContent;
      let start = 0;
      while (start < text.length) {
        let low = start + 1, high = text.length, best = start;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const candidate = rangeFragment(node, start, mid);
          body.append(candidate); const ok = fits(); candidate.remove();
          if (ok) { best = mid; low = mid + 1; } else high = mid - 1;
        }
        if (best === start) {
          if (body.children.length) { newPage(); continue; }
          fail("block");
        }
        if (best < text.length) {
          const boundary = Math.max(text.lastIndexOf("\n", best - 1), text.lastIndexOf(" ", best - 1)) + 1;
          if (boundary > start + (best - start) * 0.8) best = boundary;
          if (/[\uD800-\uDBFF]/.test(text[best - 1])) best--;
          if (best <= start) fail("block");
        }
        body.append(rangeFragment(node, start, best));
        start = best;
        if (start < text.length) newPage();
      }
    }
    function table(node) {
      const header = node.querySelector("thead");
      const rows = [...node.querySelectorAll("tbody > tr")];
      let segment, target;
      function begin() {
        segment = node.cloneNode(false);
        if (header) segment.append(header.cloneNode(true));
        target = element("tbody"); segment.append(target); body.append(segment);
      }
      begin();
      for (const row of rows) {
        const next = row.cloneNode(true); target.append(next);
        if (fits()) continue;
        next.remove();
        if (!target.children.length) segment.remove();
        if (!body.children.length) fail("row");
        newPage(); begin(); target.append(next);
        if (!fits()) fail("row");
      }
      if (!rows.length && !fits()) fail("row");
    }
    function list(node) {
      const items = [...node.children];
      let index = Number(node.getAttribute("start")) || 1;
      let segment = node.cloneNode(false); body.append(segment);
      for (const item of items) {
        segment.append(item);
        if (!fits()) {
          item.remove(); if (!segment.children.length) segment.remove();
          if (!body.children.length) fail("block");
          newPage(); segment = node.cloneNode(false);
          if (node.tagName === "OL") segment.setAttribute("start", index);
          body.append(segment); segment.append(item);
          if (!fits()) fail("block");
        }
        index++;
      }
    }
    newPage();
    for (const node of [...source.children]) {
      if (node.tagName === "TABLE") { table(node); continue; }
      if (/^(UL|OL)$/.test(node.tagName)) { list(node); continue; }
      if (/^H[1-6]$/.test(node.tagName) && body.children.length) {
        body.append(node);
        const remaining = body.getBoundingClientRect().bottom - node.getBoundingClientRect().bottom;
        node.remove(); if (remaining < 70) newPage();
      }
      if (append(node)) continue;
      if (/^(P|PRE|BLOCKQUOTE)$/.test(node.tagName) && !node.querySelector("img, svg, .katex, table, input")) {
        splitText(node); continue;
      }
      if (body.children.length) { newPage(); if (append(node)) continue; }
      splitText(node);
    }
    for (let index = 0; index < pages.length; index++) pages[index].querySelector(".report-page-number").textContent = labels.page.replace("%d", index + 1).replace("%d", pages.length);
    return pages;
  }

  async function render(markdown, options) {
    const mount = options.mount || document.getElementById("report");
    if (!mount) fail("resources");
    mount.replaceChildren();
    const webKit = options.native || (/AppleWebKit/.test(navigator.userAgent) && !/(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent));
    document.body.classList.toggle("report-webkit", !!webKit);
    if (!markdown.trim()) fail("empty");
    if (new TextEncoder().encode(markdown).length > MAX_SOURCE_BYTES) fail("size");
    const labels = Object.assign({}, defaultLabels, options.labels || {});
    const warnings = [];
    let root;
    try {
      root = await prepare(markdown, { ...options, mount }, labels, warnings);
      const title = (options.title || root.querySelector("h1")?.textContent || labels.title).slice(0, 200);
      const pages = paginate(root, mount, title, labels);
      root.remove();
      const links = pages.flatMap((page, index) => {
        const box = page.getBoundingClientRect();
        return [...page.querySelectorAll('a[href]')].flatMap(link => {
          if (!/^(https?:|mailto:)/i.test(link.href)) return [];
          return [...link.getClientRects()].filter(r => r.width > 0 && r.height > 0).map(r => ({
            page: index, url: link.href, x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height
          }));
        });
      });
      return { title, links, warnings: [...new Set(warnings)], pages: pages.map(page => {
        const r = page.getBoundingClientRect();
        return { x: r.left + global.scrollX, y: r.top + global.scrollY, width: r.width, height: r.height };
      }) };
    } catch (error) { if (root) root.remove(); mount.replaceChildren(); throw error; }
  }
  global.OnePreviewReport = { render, MAX_SOURCE_BYTES, MAX_PAGES };
})(window);
