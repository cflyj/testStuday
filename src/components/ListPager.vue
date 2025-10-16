<template>
  <div class="list-pager">
    <div class="list">
      <template v-for="(it, idx) in items" :key="getItemKey(it, idx)">
        <!-- 默认插槽：父组件决定每个 item 的结构 -->
        <slot :item="it" :index="idx">
          <div class="item">{{ it && it.title ? it.title : JSON.stringify(it) }}</div>
        </slot>
      </template>
    </div>

    <div class="footer">
      <span v-if="loading" class="state">加载中...</span>
      <span v-else-if="error" class="state error">加载失败：{{ errorMsg }}</span>
      <span v-else-if="!hasMore" class="state">没有更多了</span>
      <button
        v-else
        class="btn"
        @click="loadMore"
      >{{ mode === 'page' ? '下一页' : '加载更多' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  mode: { type: String, default: 'page' }, // 'page' | 'cursor'
  pageSize: { type: Number, default: 10 },
  initialPage: { type: Number, default: 1 },
  initialCursor: { type: [String, Number, null], default: null },
  query: { type: Object, default: () => ({}) },
  fetcher: { type: Function, required: true }, // 由父传入
  autoLoad: { type: Boolean, default: true },
  keepLatest: { type: Boolean, default: true },
  getItemKey: { type: Function, default: (it, idx) => (it && (it.id ?? it.key)) ?? idx },
});

const emit = defineEmits(['load-start', 'load-success', 'load-error', 'end']);

const items = ref([]);
const page = ref(props.initialPage);
const cursor = ref(props.initialCursor);
const hasMore = ref(true);
const loading = ref(false);
const error = ref(null);
const errorMsg = computed(() => (error.value && (error.value.message || String(error.value))) || '');

let controller = null; // AbortController
let reqId = 0;

async function load(append = true) {
  if (loading.value) return;
  if (append && !hasMore.value) return;

  loading.value = true;
  error.value = null;
  reqId++;
  const rid = reqId;
  if (controller) controller.abort();
  controller = new AbortController();

  const params = props.mode === 'page'
    ? { page: append ? page.value : 1, pageSize: props.pageSize, query: props.query, signal: controller.signal }
    : { cursor: append ? cursor.value : null, limit: props.pageSize, query: props.query, signal: controller.signal };

  emit('load-start', params);
  try {
    const res = await props.fetcher(params);
    if (props.keepLatest && rid !== reqId) return; // 丢弃过期响应

    const newItems = (res && res.items) || [];
    items.value = append ? items.value.concat(newItems) : newItems;

    if (props.mode === 'page') {
      const pi = res.pageInfo || {};
      page.value = pi.page ?? (append ? page.value + 1 : 1);
      const totalPages = (pi.total != null && pi.pageSize) ? Math.ceil(pi.total / pi.pageSize) : undefined;
      hasMore.value = totalPages != null ? page.value < totalPages : newItems.length === props.pageSize;
    } else {
      const ci = res.cursorInfo || {};
      cursor.value = ci.nextCursor ?? null;
      hasMore.value = ci.hasMore ?? (newItems.length === props.pageSize);
    }

    emit('load-success', { items: newItems, append });
    if (!hasMore.value) emit('end');
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    error.value = e;
    emit('load-error', e);
  } finally {
    loading.value = false;
  }
}

function reload() {
  items.value = [];
  page.value = 1;
  cursor.value = null;
  hasMore.value = true;
  load(false);
}

function loadMore() {
  load(true);
}

// 监听查询条件变化自动重载
watch(() => [props.mode, props.pageSize, props.query], () => {
  if (props.autoLoad) reload();
}, { deep: true });

onMounted(() => {
  if (props.autoLoad) reload();
});

onBeforeUnmount(() => {
  if (controller) controller.abort();
});

defineExpose({ reload, loadMore, state: { items, page, cursor, hasMore, loading, error } });
</script>

<style scoped>
.list-pager { display: block; }
.list { border: 1px solid #e5e5e5; border-radius: 6px; padding: 12px; min-height: 120px; }
.item { padding: 8px 10px; border-bottom: 1px dashed #ddd; }
.item:last-child { border-bottom: none; }
.footer { display: flex; justify-content: center; align-items: center; height: 56px; color: #666; }
.btn { padding: 8px 12px; border: 1px solid #aaa; background: #fff; border-radius: 4px; cursor: pointer; }
.btn[disabled] { opacity: .5; cursor: not-allowed; }
.state { padding: 6px 10px; background: #f7f7f7; color: #333; border-radius: 4px; }
.error { color: #d23; background: #fee; }
</style>
