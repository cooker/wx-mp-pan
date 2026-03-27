(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminPendingPage = {
    name: 'AdminPendingPage',
    inject: ['loading', 'pendingList', 'categories', 'fmtTime', 'approveResource', 'rejectResource'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="资源审核"
            desc-html="待审核资源以列表展示<strong>正文全文</strong>及链接、类型、标签等全部字段；可通过「通过」指定分类后再上线。"
          />
        </template>
        <div v-loading="loading.pending" class="res-list">
          <template v-if="pendingList.length">
            <div v-for="row in pendingList" :key="row.id" class="res-list-item">
              <div class="res-list-head">
                <div class="res-list-head-main">
                  <span class="res-id">#{{ row.id }}</span>
                  <span class="res-title">{{ row.title }}</span>
                </div>
                <div>
                  <el-button type="primary" size="small" link @click="approveResource(row)">通过</el-button>
                  <el-button type="danger" size="small" link @click="rejectResource(row)">拒绝</el-button>
                </div>
              </div>
              <el-descriptions class="res-meta" :column="2" border size="small">
                <el-descriptions-item label="链接" :span="2">
                  <span v-if="row.url" class="res-url-plain">{{ row.url }}</span>
                  <span v-else style="color:var(--el-text-color-secondary)">—</span>
                </el-descriptions-item>
                <el-descriptions-item label="类型">{{ row.type || '—' }}</el-descriptions-item>
                <el-descriptions-item label="标签">{{ row.tags || '—' }}</el-descriptions-item>
                <el-descriptions-item label="审核时分类" :span="2">
                  <el-select v-model="row._catId" placeholder="不指定分类" clearable style="width:min(100%,320px)" size="small">
                    <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
                  </el-select>
                </el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ fmtTime(row.createdAt) }}</el-descriptions-item>
              </el-descriptions>
              <div class="res-content-block">
                <div class="res-label">正文</div>
                <pre class="res-content">{{ row.content ? row.content : '（无）' }}</pre>
              </div>
            </div>
          </template>
          <el-empty v-else-if="!loading.pending" description="暂无待审核资源" :image-size="80" />
        </div>
      </el-card>
    `
  };
})();
