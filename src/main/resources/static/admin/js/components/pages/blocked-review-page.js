(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminBlockedReviewPage = {
    name: 'AdminBlockedReviewPage',
    inject: ['loading', 'blockedList', 'fmtTime', 'approveBlocked', 'rejectBlocked'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="屏蔽词审核"
            desc-html="每条记录以列表展示<strong>完整关键词</strong>与提交时间；通过后将在检索过滤中生效。"
          />
        </template>
        <div v-loading="loading.blocked" class="res-list">
          <template v-if="blockedList.length">
            <div v-for="row in blockedList" :key="row.id" class="res-list-item">
              <div class="res-list-head">
                <div class="res-list-head-main">
                  <span class="res-id">#{{ row.id }}</span>
                  <span class="res-title" style="font-weight:500;color:var(--el-text-color-regular)">屏蔽词申请</span>
                </div>
                <div>
                  <el-button type="primary" size="small" link @click="approveBlocked(row)">通过</el-button>
                  <el-button type="danger" size="small" link @click="rejectBlocked(row)">拒绝</el-button>
                </div>
              </div>
              <el-descriptions class="res-meta" :column="1" border size="small">
                <el-descriptions-item label="关键词（完整内容）">
                  <pre class="res-content kw-full">{{ row.keyword }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="提交时间">{{ fmtTime(row.createdAt) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
          <el-empty v-else-if="!loading.blocked" description="暂无待审核屏蔽词" :image-size="80" />
        </div>
      </el-card>
    `
  };
})();
