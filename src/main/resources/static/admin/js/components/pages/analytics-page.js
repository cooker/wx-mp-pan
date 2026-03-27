(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminAnalyticsPage = {
    name: 'AdminAnalyticsPage',
    inject: ['loading', 'ana', 'fmtTime', 'loadAnalytics', 'searchAnalytics'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="埋点报表"
            desc-html="查看首页行为埋点总览与事件明细；支持按事件类型、关键词筛选与分页浏览。"
          />
        </template>
        <div v-loading="loading.analytics">
          <el-row :gutter="12" class="ana-cards">
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">总事件</div><div class="v">{{ ana.overview.totalEvents || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">页面访问</div><div class="v">{{ ana.overview.homeView || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">搜索提交</div><div class="v">{{ ana.overview.searchSubmit || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">热门词点击</div><div class="v">{{ ana.overview.hotKeywordClick || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">复制链接</div><div class="v">{{ ana.overview.copyLinkClick || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">提交资源</div><div class="v">{{ ana.overview.submitResource || 0 }}</div></div></el-col>
            <el-col :xs="12" :sm="8" :md="6"><div class="ana-card"><div class="k">提交屏蔽词</div><div class="v">{{ ana.overview.submitBlockedKeyword || 0 }}</div></div></el-col>
          </el-row>
          <div class="toolbar">
            <el-select v-model="ana.event" clearable placeholder="事件类型" style="width:min(220px,100%)">
              <el-option label="页面访问" value="home_view" />
              <el-option label="搜索提交" value="search_submit" />
              <el-option label="热门词点击" value="hot_keyword_click" />
              <el-option label="复制链接" value="copy_link_click" />
              <el-option label="提交资源" value="submit_resource" />
              <el-option label="提交屏蔽词" value="submit_blocked_keyword" />
            </el-select>
            <el-input v-model="ana.keyword" clearable placeholder="props 关键词筛选" style="width:min(260px,100%)" @keyup.enter="searchAnalytics" />
            <el-button type="primary" @click="searchAnalytics">筛选</el-button>
          </div>
          <div class="table-wrap">
            <el-table :data="ana.list" stripe border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="event" label="事件" min-width="150" />
              <el-table-column prop="path" label="路径" min-width="130" show-overflow-tooltip />
              <el-table-column label="Props" min-width="260" show-overflow-tooltip>
                <template #default="{ row }"><span class="res-url-plain">{{ row.propsJson || '{}' }}</span></template>
              </el-table-column>
              <el-table-column label="UA" min-width="220" show-overflow-tooltip>
                <template #default="{ row }">{{ row.userAgent || '—' }}</template>
              </el-table-column>
              <el-table-column label="设备ID" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">{{ row.deviceId || '—' }}</template>
              </el-table-column>
              <el-table-column label="IP" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">{{ row.ipAddress || '—' }}</template>
              </el-table-column>
              <el-table-column label="时间" min-width="170">
                <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-bar">
            <el-pagination
              v-model:current-page="ana.page"
              v-model:page-size="ana.size"
              :total="ana.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @current-change="loadAnalytics"
              @size-change="searchAnalytics"
            />
          </div>
        </div>
      </el-card>
    `
  };
})();
