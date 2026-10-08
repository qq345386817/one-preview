(function () {
  "use strict";
  const zh = document.documentElement.lang === "zh-Hans";
  const words = zh ? {
    ready: "已完成排版", pages: "页 A4", changed: "内容已更改，请更新预览。", working: "正在渲染图表、字体并分页…",
    images: "张图片已选择", duplicates: "图片文件名重复，请选择名称不同的文件。", imageSize: "最多选择 16 张图片，每张不超过 5 MB，总大小不超过 20 MB。",
    unsupported: "请选择 .md 或 .markdown 文本文件（不超过 500 KB）。", read: "无法读取文件，请重新选择。",
    encoding: "无法识别文件的文本编码，请保存为 UTF-8 后重试。",
    errors: { empty: "请输入 Markdown 内容。", size: "文档超过 500 KB，请缩小后重试。", pages: "文档超过 100 页，请分成较小的报告。", row: "表格中有一行高于一页，请缩短或拆分该行。", block: "有一个元素无法在一页内安全显示，请拆分长列表项、公式或图片后重试。", width: "内容超过页面宽度，请减少表格列数或缩短公式后重试。", fonts: "字体未能加载，请重新生成预览。", resources: "排版组件未能加载，请刷新页面。" },
    labels: { image: "图片不可用", diagram: "流程图未能渲染，已保留原文", math: "公式未能渲染，已保留原文", page: "第 %d 页 / 共 %d 页", title: "Markdown 报告" },
    print: "请选择 A4、100% 缩放，并关闭浏览器附加的页眉和页脚。iPhone / iPad 可在系统打印预览中分享或保存 PDF。"
  } : {
    ready: "Report ready", pages: "A4 pages", changed: "Content changed. Update the preview before printing.", working: "Rendering diagrams, loading fonts and arranging pages…",
    images: "images selected", duplicates: "Two images have the same file name. Choose uniquely named files.", imageSize: "Choose up to 16 images, at most 5 MB each and 20 MB in total.",
    unsupported: "Choose a .md or .markdown text file, up to 500 KB.", read: "Could not read the file. Please choose it again.",
    encoding: "Could not read the text encoding. Save the file as UTF-8 and try again.",
    errors: { empty: "Enter some Markdown first.", size: "This document exceeds 500 KB. Try a smaller report.", pages: "This report exceeds 100 pages. Split it into smaller reports.", row: "A table row is taller than one page. Shorten or split that row.", block: "An element cannot fit safely on one page. Split long list items, formulas or images and try again.", width: "Content exceeds the page width. Reduce table columns or shorten the formula and try again.", fonts: "Fonts did not finish loading. Try updating the preview.", resources: "A report component could not load. Reload this page." },
    labels: { image: "Image unavailable", diagram: "Diagram could not be rendered; source retained", math: "Formula could not be rendered; source retained", page: "Page %d / %d", title: "Markdown report" },
    print: "Choose A4 paper and 100% scale, and turn off browser headers and footers. On iPhone or iPad, share or save the PDF from the system print preview."
  };
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
    const scale = Math.min(1, (viewport.parentElement.clientWidth - 32) / page.width);
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
      lastResult = await frame.contentWindow.OnePreviewReport.render(source.value, { assets, labels: words.labels });
      renderedRevision = version;
      for (const message of lastResult.warnings) {
        const notice = document.createElement("li"); notice.textContent = message; notices.append(notice);
      }
      fit();
      const pageLabel = !zh && lastResult.pages.length === 1 ? "A4 page" : words.pages;
      status.textContent = version === revision ? `${words.ready} · ${lastResult.pages.length} ${pageLabel}` : words.changed;
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
      assets = next; document.getElementById("asset-count").textContent = `${files.length} ${words.images}`;
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
