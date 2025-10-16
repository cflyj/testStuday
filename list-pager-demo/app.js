// Minimal ListPager demo with page/cursor modes and a mock fetcher

/**
 * Contract of fetcher:
 *  - page mode: ({ page, pageSize, query, signal }) => Promise<{ items, pageInfo: { page, pageSize, total } }>
 *  - cursor mode: ({ cursor, limit, query, signal }) => Promise<{ items, cursorInfo: { nextCursor, hasMore } }>
 */

class ListPager {
  constructor(opts) {
    this.mode = opts.mode || 'page';
    this.pageSize = opts.pageSize || 10;
    this.query = opts.query || {};
    this.fetcher = opts.fetcher;
    // If not provided, try slot template #item-slot in DOM
    const slotTmpl = document.getElementById('item-slot');
    const slotHtml = slotTmpl?.innerHTML?.trim();
    this.renderItem = opts.renderItem || (slotHtml
      ? (it) => slotHtml.replace(/\{\{\s*([\w$.]+)\s*\}\}/g, (_, k) => {
          // support nested path like a.b
          try {
            const val = k.split('.').reduce((acc, key) => acc?.[key], it);
            return val == null ? '' : String(val);
          } catch { return ''; }
        })
      : (it) => `<div class="item">${JSON.stringify(it)}</div>`);
    this.getItemKey = opts.getItemKey || ((it, idx) => idx);
    this.root = opts.root; // element to render list into
    this.footer = opts.footer; // element to render controls/state

    // state
    this.items = [];
    this.page = opts.initialPage || 1;
    this.cursor = opts.initialCursor || null;
    this.hasMore = true;
    this.loading = false;
    this.error = null;
    this.controller = null; // AbortController
    this.keepLatest = true; // drop outdated responses
    this._reqId = 0;
  }

  async reload() {
    this.items = [];
    this.page = 1;
    this.cursor = null;
    this.hasMore = true;
    await this.load({ append: false });
  }

  async load({ append } = { append: true }) {
    if (this.loading) return;
    if (!this.hasMore && append) return;

    this.loading = true;
    this.error = null;
    this._reqId++;
    const rid = this._reqId;

    // cancel previous
    if (this.controller) this.controller.abort();
    this.controller = new AbortController();

    try {
      const params = this.mode === 'page'
        ? { page: append ? this.page : 1, pageSize: this.pageSize, query: this.query, signal: this.controller.signal }
        : { cursor: append ? this.cursor : null, limit: this.pageSize, query: this.query, signal: this.controller.signal };

      const res = await this.fetcher(params);
      if (this.keepLatest && rid !== this._reqId) return; // outdated

      const newItems = res.items || [];
      this.items = append ? [...this.items, ...newItems] : newItems;

      if (this.mode === 'page') {
        const { page, total, pageSize } = res.pageInfo || {};
        this.page = (page || (append ? this.page + 1 : 1));
        const totalPages = total != null && pageSize ? Math.ceil(total / pageSize) : undefined;
        this.hasMore = totalPages != null ? this.page < totalPages : newItems.length === this.pageSize;
      } else {
        const { nextCursor, hasMore } = res.cursorInfo || {};
        this.cursor = nextCursor ?? null;
        this.hasMore = hasMore ?? (newItems.length === this.pageSize);
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      this.error = err;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  render() {
    // list (use getItemKey as data-key attribute for debugging)
    this.root.innerHTML = this.items.map((it, idx) => {
      const html = this.renderItem(it, idx);
      // if template root lacks .item class, wrap to keep layout
      const hasItemClass = /class=\"[^\"]*\bitem\b/.test(html);
      return hasItemClass ? html : `<div class="item" data-key="${this.getItemKey(it, idx)}">${html}</div>`;
    }).join('');
    // footer
    if (this.loading) {
      this.footer.innerHTML = `<span class="state">加载中...</span>`;
    } else if (this.error) {
      this.footer.innerHTML = `<span class="state error">加载失败：${this.error.message || this.error}</span>`;
    } else if (!this.hasMore) {
      this.footer.innerHTML = `<span class="state">没有更多了</span>`;
    } else {
      if (this.mode === 'page') {
        this.footer.innerHTML = `<button class="btn" id="next">下一页</button>`;
        this.footer.querySelector('#next').onclick = () => this.load({ append: true });
      } else {
        this.footer.innerHTML = `<button class="btn" id="more">加载更多</button>`;
        this.footer.querySelector('#more').onclick = () => this.load({ append: true });
      }
    }
  }
}

// Mock fetchers
function createMockPageFetcher(total = 105, jitter = [200, 600]) {
  return async ({ page, pageSize, query, signal }) => {
    const delay = Math.floor(Math.random() * (jitter[1] - jitter[0])) + jitter[0];
    await new Promise((r, j) => {
      const t = setTimeout(r, delay);
      signal?.addEventListener('abort', () => { clearTimeout(t); j(new DOMException('Aborted', 'AbortError')); });
    });
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const list = Array.from({ length: Math.max(0, end - start) }, (_, i) => ({ id: start + i + 1, title: `Item #${start + i + 1}`, q: query || null }));
    return { items: list, pageInfo: { page, pageSize, total } };
  };
}

function createMockCursorFetcher(total = 105, jitter = [200, 600]) {
  return async ({ cursor, limit, query, signal }) => {
    const delay = Math.floor(Math.random() * (jitter[1] - jitter[0])) + jitter[0];
    await new Promise((r, j) => {
      const t = setTimeout(r, delay);
      signal?.addEventListener('abort', () => { clearTimeout(t); j(new DOMException('Aborted', 'AbortError')); });
    });
    const start = cursor ? parseInt(cursor, 10) : 0;
    const end = Math.min(start + limit, total);
    const list = Array.from({ length: Math.max(0, end - start) }, (_, i) => ({ id: start + i + 1, title: `Item #${start + i + 1}`, q: query || null }));
    const nextCursor = end < total ? String(end) : null;
    const hasMore = end < total;
    return { items: list, cursorInfo: { nextCursor, hasMore } };
  };
}

// Bootstrap demo
(function main() {
  const listEl = document.getElementById('list');
  const footerEl = document.getElementById('footer');
  const modeEl = document.getElementById('mode');
  const pageSizeEl = document.getElementById('pageSize');
  const reloadEl = document.getElementById('reload');

  let pager = null;

  function buildPager() {
    const mode = modeEl.value;
    const pageSize = Math.max(1, parseInt(pageSizeEl.value, 10) || 10);
    pager = new ListPager({
      mode,
      pageSize,
      fetcher: mode === 'page' ? createMockPageFetcher(87) : createMockCursorFetcher(87),
      renderItem: (it) => `<div class="item">#${it.id} - ${it.title}</div>`,
      getItemKey: (it) => it.id,
      root: listEl,
      footer: footerEl,
    });
    pager.render();
    pager.reload();
  }

  modeEl.onchange = buildPager;
  pageSizeEl.onchange = buildPager;
  reloadEl.onclick = () => pager?.reload();

  buildPager();
})();
