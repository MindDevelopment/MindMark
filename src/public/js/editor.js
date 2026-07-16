(function () {
  const textarea = document.getElementById('editor-textarea');
  const preview = document.getElementById('editor-preview');
  const saveBtn = document.getElementById('save-btn');
  const docTitle = document.getElementById('doc-title');
  const docId = document.getElementById('doc-id');
  const saveDot = document.getElementById('save-dot');
  const saveText = document.getElementById('save-text');
  const wordCount = document.getElementById('word-count');
  const lineCount = document.getElementById('line-count');
  const charCount = document.getElementById('char-count');
  const resizeHandle = document.getElementById('resize-handle');

  let previewTimer = null;
  let saveTimer = null;
  let isDirty = false;

  // ---- Resizable panes ----
  let isResizing = false;

  resizeHandle.addEventListener('mousedown', function (e) {
    isResizing = true;
    resizeHandle.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isResizing) return;
    const editorBody = document.querySelector('.editor-body');
    const rect = editorBody.getBoundingClientRect();
    let pct = ((e.clientX - rect.left) / rect.width) * 100;
    pct = Math.max(20, Math.min(80, pct));
    const editorPane = document.getElementById('editor-pane');
    const previewPane = document.getElementById('preview-pane');
    editorPane.style.flex = 'none';
    editorPane.style.width = pct + '%';
    previewPane.style.flex = 'none';
    previewPane.style.width = (100 - pct) + '%';
  });

  document.addEventListener('mouseup', function () {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove('resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // ---- Text manipulation helpers ----
  function insertText(before, after) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    textarea.setRangeText(before + selected + after, start, end, 'end');
    textarea.focus();
    triggerChange();
  }

  function insertAtCursor(text) {
    const start = textarea.selectionStart;
    textarea.setRangeText(text, start, start, 'end');
    textarea.focus();
    triggerChange();
  }

  function insertLinePrefix(prefix) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = val.indexOf('\n', end);
    const line = val.substring(lineStart, lineEnd === -1 ? val.length : lineEnd);
    const toggled = line.startsWith(prefix) ? line.slice(prefix.length) : prefix + line;
    textarea.setRangeText(toggled, lineStart, lineEnd === -1 ? val.length : lineEnd, 'end');
    textarea.focus();
    triggerChange();
  }

  function triggerChange() {
    textarea.dispatchEvent(new Event('input'));
  }

  // ---- Toolbar ----
  document.querySelector('.editor-toolbar').addEventListener('click', function (e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    switch (cmd) {
      case 'bold': insertText('**', '**'); break;
      case 'italic': insertText('*', '*'); break;
      case 'strikethrough': insertText('~~', '~~'); break;
      case 'heading': insertText('## ', ''); break;
      case 'code': insertText('```\n', '\n```'); break;
      case 'link': insertText('[', '](url)'); break;
      case 'image': insertText('![', '](url)'); break;
      case 'list': insertLinePrefix('- '); break;
      case 'olist': insertLinePrefix('1. '); break;
      case 'blockquote': insertLinePrefix('> '); break;
      case 'hr': insertAtCursor('\n---\n'); break;
      case 'table':
        insertAtCursor('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n');
        break;
    }
  });

  // ---- Live preview with debounce ----
  async function updatePreview(content) {
    try {
      const res = await fetch('/editor/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      preview.innerHTML = data.html;
      // Re-highlight code blocks
      preview.querySelectorAll('pre code').forEach(function (block) {
        if (typeof hljs !== 'undefined') {
          hljs.highlightElement(block);
        }
      });
    } catch {
      // silent fail for preview
    }
  }

  function schedulePreview() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      updatePreview(textarea.value);
    }, 300);
  }

  // ---- Status bar ----
  function updateStatus() {
    const val = textarea.value;
    const words = val.trim() ? val.trim().split(/\s+/).length : 0;
    const lines = val ? val.split('\n').length : 0;
    const chars = val.length;
    wordCount.textContent = words + ' word' + (words !== 1 ? 's' : '');
    lineCount.textContent = lines + ' line' + (lines !== 1 ? 's' : '');
    charCount.textContent = chars + ' character' + (chars !== 1 ? 's' : '');
  }

  // ---- Dirty tracking ----
  function markDirty() {
    isDirty = true;
    saveDot.className = 'dot saving';
    saveText.textContent = 'Unsaved';
  }

  function markSaved() {
    isDirty = false;
    saveDot.className = 'dot saved';
    saveText.textContent = 'Saved';
  }

  function markError() {
    saveDot.className = 'dot error';
    saveText.textContent = 'Error saving';
  }

  // ---- Input handler ----
  textarea.addEventListener('input', function () {
    markDirty();
    schedulePreview();
    updateStatus();
    scheduleAutoSave();
  });

  // ---- Auto-save ----
  function scheduleAutoSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      if (isDirty) saveDocument();
    }, 5000);
  }

  // ---- Save ----
  async function saveDocument() {
    const content = textarea.value;
    const title = docTitle.value || 'Untitled';
    const id = docId.value || null;
    try {
      const res = await fetch('/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, content }),
      });
      const data = await res.json();
      if (data.id) {
        if (!docId.value) {
          window.history.replaceState(null, '', '/editor?id=' + data.id);
          docId.value = data.id;
        }
        markSaved();
      }
    } catch {
      markError();
    }
  }

  saveBtn.addEventListener('click', saveDocument);

  docTitle.addEventListener('input', function () {
    markDirty();
    scheduleAutoSave();
  });

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDocument();
    }
    // toolbar shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      insertText('**', '**');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      insertText('*', '*');
    }
  });

  // ---- Initial load ----
  updateStatus();
  if (textarea.value.trim()) {
    updatePreview(textarea.value);
  }

  // Load highlight.js for initial content
  var hljsScript = document.createElement('script');
  hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.0/highlight.min.js';
  hljsScript.onload = function () {
    preview.querySelectorAll('pre code').forEach(function (block) {
      hljs.highlightElement(block);
    });
  };
  document.head.appendChild(hljsScript);
})();
