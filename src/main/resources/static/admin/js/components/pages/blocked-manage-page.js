(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminBlockedManagePage = {
    name: 'AdminBlockedManagePage',
    inject: ['loading', 'blockedActiveList', 'newBlockedKw', 'fmtTime', 'createBlockedActive', 'deleteBlockedActive'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="屏蔽词管理"
            desc-html="已生效的屏蔽词将用于检索过滤（标题、正文、标签）。可在此<strong>直接添加</strong>生效词，或删除；用户提交的申请仍在「屏蔽词审核」中处理。"
          />
        </template>
        <div class="cat-add-panel">
          <div class="cat-add-title">新增屏蔽词</div>
          <el-form :inline="true" @submit.prevent="createBlockedActive">
            <el-form-item label="关键词">
              <el-input v-model="newBlockedKw" placeholder="输入需屏蔽的词或短语" clearable maxlength="200" style="width:min(320px, 100%)" @keyup.enter="createBlockedActive" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="button" @click="createBlockedActive">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-loading="loading.blockedManage" class="res-list">
          <template v-if="blockedActiveList.length">
            <div v-for="row in blockedActiveList" :key="row.id" class="res-list-item">
              <div class="res-list-head">
                <div class="res-list-head-main">
                  <span class="res-id">#{{ row.id }}</span>
                  <span class="res-title" style="font-weight:500;color:var(--el-text-color-regular)">已生效</span>
                </div>
                <el-button type="danger" size="small" link @click="deleteBlockedActive(row)">删除</el-button>
              </div>
              <el-descriptions class="res-meta" :column="1" border size="small">
                <el-descriptions-item label="关键词（完整内容）">
                  <pre class="res-content kw-full">{{ row.keyword }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ fmtTime(row.createdAt) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
          <el-empty v-else-if="!loading.blockedManage" description="暂无已生效屏蔽词" :image-size="80" />
        </div>
      </el-card>
    `
  };
})();
