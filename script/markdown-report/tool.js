(function () {
  "use strict";
  const words = JSON.parse(document.getElementById("tool-messages").textContent);
  const source = document.getElementById("markdown-source");
  const frame = document.getElementById("report-frame");
  const status = document.getElementById("report-status");
  const notices = document.getElementById("report-notices");
  const renderButton = document.getElementById("render-report");
  const printButton = document.getElementById("print-report");
  let assets = {}, revision = 0, renderedRevision = -1, busy = false, lastResult;
  function invalidate() {
    revision++; printButton.disabled = true;
    status.textContent = words.changed;
  }
  const loaded = new Promise(resolve => {
    if (frame.contentWindow?.OnePreviewReport) resolve(); else frame.addEventListener("load", resolve, { once: true });
  });
  function fit() {
    if (!lastResult) return;
    const viewport = document.getElementById("report-viewport");
    const page = lastResult.pages[0];
    const last = lastResult.pages[lastResult.pages.length - 1];
    const scrollStyle = getComputedStyle(viewport.parentElement);
    const availableWidth = viewport.parentElement.clientWidth - parseFloat(scrollStyle.paddingLeft) - parseFloat(scrollStyle.paddingRight);
    const scale = Math.min(1, availableWidth / page.width);
    frame.style.width = `${Math.ceil(page.width)}px`;
    frame.style.height = `${Math.ceil(last.y + last.height)}px`;
    frame.style.transform = `scale(${scale})`;
    viewport.style.width = `${page.width * scale}px`;
    viewport.style.height = `${(last.y + last.height) * scale}px`;
  }
  async function render() {
    if (busy) return;
    busy = true; renderButton.disabled = true; printButton.disabled = true;
    const version = revision;
    status.textContent = words.working; notices.replaceChildren();
    try {
      await loaded;
      if (!frame.contentWindow.OnePreviewReport) throw { code: "resources" };
      frame.contentDocument.documentElement.lang = document.documentElement.lang;
      frame.contentDocument.title = words.labels.title;
      lastResult = await frame.contentWindow.OnePreviewReport.render(source.value, { assets, labels: words.labels });
      frame.contentDocument.title = lastResult.title;
      renderedRevision = version;
      for (const message of lastResult.warnings) {
        const notice = document.createElement("li"); notice.textContent = message; notices.append(notice);
      }
      fit();
      status.textContent = version === revision ? words.ready.replace("{count}", lastResult.pages.length) : words.changed;
      printButton.disabled = version !== revision;
    } catch (error) {
      lastResult = null; document.getElementById("report-viewport").style.height = "160px";
      status.textContent = words.errors[error.code] || words.errors.resources;
    } finally { busy = false; renderButton.disabled = false; }
  }
  source.addEventListener("input", invalidate);
  renderButton.addEventListener("click", render);
  printButton.addEventListener("click", () => {
    if (busy || renderedRevision !== revision || !lastResult) return;
    document.getElementById("print-help").textContent = words.print;
    frame.contentWindow.focus(); frame.contentWindow.print();
  });
  document.getElementById("markdown-file").addEventListener("change", async event => {
    const file = event.target.files[0]; if (!file) return;
    invalidate();
    const request = revision;
    try {
      if (!/\.(md|markdown)$/i.test(file.name) || file.size > 500000) throw new Error(words.unsupported);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? "utf-16le" : bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
      let text;
      try { text = new TextDecoder(encoding, { fatal: true }).decode(bytes); } catch (_) { throw new Error(words.encoding); }
      if (request !== revision) return;
      source.value = text; assets = {};
      document.getElementById("asset-count").textContent = "";
      document.getElementById("image-files").value = "";
      invalidate(); await render();
    } catch (error) { if (request === revision) status.textContent = error.message || words.read; }
    finally { event.target.value = ""; }
  });
  document.getElementById("image-files").addEventListener("change", async event => {
    const files = [...event.target.files]; if (!files.length) return;
    invalidate();
    const request = revision;
    try {
      if (files.length > 16 || files.some(f => f.size > 5 * 1024 * 1024) || files.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024) throw new Error(words.imageSize);
      if (new Set(files.map(f => f.name)).size !== files.length) throw new Error(words.duplicates);
      const next = {};
      for (const file of files) {
        if (!/^image\/(png|jpeg|gif|webp|bmp)$/.test(file.type)) throw new Error(words.imageSize);
        next[file.name] = await new Promise((resolve, reject) => {
          const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
        });
      }
      if (request !== revision) return;
      assets = next; document.getElementById("asset-count").textContent = words.images.replace("{count}", files.length);
      invalidate(); await render();
    } catch (error) { if (request === revision) status.textContent = error.message || words.read; }
    finally { event.target.value = ""; }
  });
  document.getElementById("clear-images").addEventListener("click", () => {
    assets = {}; document.getElementById("asset-count").textContent = ""; invalidate();
  });
  async function sample() {
    if (busy) return;
    invalidate();
    const request = revision;
    try {
      const response = await fetch(document.getElementById("load-sample").dataset.sample);
      if (!response.ok) throw new Error(words.read);
      const text = await response.text(); if (request !== revision) return;
      source.value = text; assets = {};
      document.getElementById("asset-count").textContent = "";
      invalidate(); await render();
    } catch (error) { if (request === revision) status.textContent = error.message || words.read; }
  }
  document.getElementById("load-sample").addEventListener("click", sample);
  new ResizeObserver(fit).observe(document.getElementById("report-preview"));
  sample();
})();
