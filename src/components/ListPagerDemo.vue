<template>
  <div class="component-section">
    <h2>📜 长列表分页（插槽版）</h2>

    <div class="controls">
      <label>模式：
        <select v-model="mode">
          <option value="page">page（页码）</option>
          <option value="cursor">cursor（加载更多）</option>
        </select>
      </label>
      <label>pageSize：<input v-model.number="pageSize" type="number" min="1" /></label>
      <button @click="reload">重载</button>
    </div>

    <ListPager
      :mode="mode"
      :page-size="pageSize"
      :fetcher="fetcher"
      :query="{ keyword }"
      @load-error="onError"
      ref="pagerRef"
    >
      <!-- 插槽：父组件定义每个 item 的结构 -->
      <template #default="{ item }">
        <div class="item">
          <strong>#{{ item.id }}</strong>
          <span> - {{ item.title }}</span>
        </div>
      </template>
    </ListPager>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ListPager from './ListPager.vue';

const mode = ref('page');
const pageSize = ref(10);
const keyword = ref('');
const pagerRef = ref(null);

function reload() {
  pagerRef.value?.reload();
}

// 模拟页码/游标两种 fetcher
const fetcher = async (params) => {
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  await delay(200 + Math.random() * 400);
  if (params.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const total = 87;
  if ('page' in params) {
    const { page, pageSize } = params;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const list = Array.from({ length: Math.max(0, end - start) }, (_, i) => ({ id: start + i + 1, title: `Item #${start + i + 1}` }));
    return { items: list, pageInfo: { page, pageSize, total } };
  } else {
    const { cursor, limit } = params;
    const start = cursor ? parseInt(cursor, 10) : 0;
    const end = Math.min(start + limit, total);
    const list = Array.from({ length: Math.max(0, end - start) }, (_, i) => ({ id: start + i + 1, title: `Item #${start + i + 1}` }));
    const nextCursor = end < total ? String(end) : null;
    const hasMore = end < total;
    return { items: list, cursorInfo: { nextCursor, hasMore } };
  }
};

function onError(e) {
  console.warn('ListPager load-error:', e);
}
</script>

<style scoped>
.controls { display: flex; gap: 12px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; }
.item { padding: 8px 10px; border-bottom: 1px dashed #ddd; }
.item:last-child { border-bottom: none; }
button { padding: 6px 10px; }
</style>
