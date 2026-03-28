(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminAnalyticsPage = {
    name: 'AdminAnalyticsPage',
    inject: ['loading', 'ana', 'fmtTime', 'loadAnalytics', 'searchAnalytics'],
    methods: {
      onAnalyticsViewChange: function () {
        this.ana.page = 1;
        this.ana.keyword = '';
        this.ana.event = '';
        this.loadAnalytics();
      },
      platformLabel: function (code) {
        var m = {
          android: '安卓',
          ios: 'iOS',
          windows: 'Windows',
          macos: 'macOS',
          linux: 'Linux',
          unknown: '未知',
          other: '其他'
        };
        return m[code] || code || '—';
      }
    },
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="埋点报表"
            desc-html="查看首页行为埋点总览；<strong>事件明细</strong>可按类型与 props 关键词筛选；<strong>设备视图</strong>按 User-Agent 归类为安卓、iOS、Windows、macOS、Linux（另含未知/其他）；<strong>IP 视图</strong>按客户端 IP 聚合事件数与最后上报时间。"
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
          <div class="ana-view-switch-wrap">
            <el-radio-group v-model="ana.view" size="default" class="ana-view-switch" @change="onAnalyticsViewChange">
              <el-radio-button label="events">事件明细</el-radio-button>
              <el-radio-button label="device">设备视图</el-radio-button>
              <el-radio-button label="ip">IP 视图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="toolbar ana-toolbar">
            <template v-if="ana.view === 'events'">
              <el-select v-model="ana.event" clearable placeholder="事件类型" style="width:min(220px,100%)">
                <el-option label="页面访问" value="home_view" />
                <el-option label="搜索提交" value="search_submit" />
                <el-option label="热门词点击" value="hot_keyword_click" />
                <el-option label="复制链接" value="copy_link_click" />
                <el-option label="提交资源" value="submit_resource" />
                <el-option label="提交屏蔽词" value="submit_blocked_keyword" />
              </el-select>
              <el-input v-model="ana.keyword" clearable placeholder="props 关键词筛选" style="width:min(260px,100%)" @keyup.enter="searchAnalytics" />
            </template>
            <template v-else-if="ana.view === 'device'">
              <span class="ana-platform-hint">统计全部埋点事件，按 UA 归类；无分页。</span>
            </template>
            <template v-else>
              <el-input v-model="ana.keyword" clearable placeholder="筛选 IP 地址（模糊）" style="width:min(320px,100%)" @keyup.enter="searchAnalytics" />
            </template>
            <el-button v-if="ana.view !== 'device'" type="primary" @click="searchAnalytics">筛选</el-button>
          </div>
          <div class="table-wrap">
            <el-table v-if="ana.view === 'events'" :data="ana.list" stripe border>
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
            <el-table v-else-if="ana.view === 'device'" :data="ana.list" stripe border>
              <el-table-column label="系统" min-width="140">
                <template #default="{ row }">{{ platformLabel(row.groupKey) }}</template>
              </el-table-column>
              <el-table-column prop="eventCount" label="事件数" width="110" />
              <el-table-column label="最后上报" min-width="170">
                <template #default="{ row }">{{ row.lastSeenAt ? fmtTime(row.lastSeenAt) : '—' }}</template>
              </el-table-column>
            </el-table>
            <el-table v-else :data="ana.list" stripe border>
              <el-table-column prop="groupKey" label="IP 地址" min-width="220" show-overflow-tooltip />
              <el-table-column prop="eventCount" label="事件数" width="100" />
              <el-table-column label="最后上报" min-width="170">
                <template #default="{ row }">{{ fmtTime(row.lastSeenAt) }}</template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="ana.view !== 'device'" class="pagination-bar">
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
