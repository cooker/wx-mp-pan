(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminPublishedPage = {
    name: 'AdminPublishedPage',
    inject: ['loading', 'pub', 'newRes', 'categories', 'fmtTime', 'createPublishedResource', 'searchPublished', 'loadPublished', 'deletePublished'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="资源管理"
            desc-html="先通过下方<strong>新增资源</strong>填写内容并添加（将直接上线）；下列表为已上线资源，含标题、链接、分类、元数据与<strong>正文全文</strong>；支持搜索与分页；删除后同步移除检索索引。"
          />
        </template>
        <div class="cat-add-panel">
          <div class="cat-add-title">新增资源（直接上线）</div>
          <el-form label-width="88px" style="max-width:720px" @submit.prevent="createPublishedResource">
            <el-form-item label="标题" required>
              <el-input v-model="newRes.title" placeholder="资源标题" maxlength="500" show-word-limit clearable @keyup.enter="createPublishedResource" />
            </el-form-item>
            <el-form-item label="链接">
              <el-input v-model="newRes.url" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" maxlength="2000" placeholder="链接、网盘口令等（可选）" />
            </el-form-item>
            <el-form-item label="类型">
              <el-input v-model="newRes.type" maxlength="100" placeholder="可选" clearable style="width:min(280px,100%)" />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="newRes.tagsStr" maxlength="500" placeholder="多个用英文或中文逗号分隔（可选）" clearable />
            </el-form-item>
            <el-form-item label="分类">
              <el-select v-model="newRes.categoryId" placeholder="不指定分类" clearable style="width:min(320px,100%)">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="正文">
              <el-input v-model="newRes.content" type="textarea" :rows="5" maxlength="50000" show-word-limit placeholder="可选" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="button" @click="createPublishedResource">添加并上线</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="toolbar">
          <el-input v-model="pub.keyword" placeholder="搜索标题、链接、标签、正文…" clearable style="width:min(320px,100%)" @keyup.enter="searchPublished">
            <template #prefix><span style="color:var(--el-text-color-placeholder);font-size:14px">⌕</span></template>
          </el-input>
          <el-button type="primary" @click="searchPublished">搜索</el-button>
        </div>
        <div v-loading="loading.published" class="res-list">
          <template v-if="pub.list.length">
            <div v-for="row in pub.list" :key="row.id" class="res-list-item">
              <div class="res-list-head">
                <div class="res-list-head-main">
                  <span class="res-id">#{{ row.id }}</span>
                  <span class="res-title">{{ row.title }}</span>
                </div>
                <el-button type="danger" size="small" link @click="deletePublished(row)">删除</el-button>
              </div>
              <el-descriptions class="res-meta" :column="2" border size="small">
                <el-descriptions-item label="链接" :span="2">
                  <span v-if="row.url" class="res-url-plain">{{ row.url }}</span>
                  <span v-else style="color:var(--el-text-color-secondary)">—</span>
                </el-descriptions-item>
                <el-descriptions-item label="类型">{{ row.type || '—' }}</el-descriptions-item>
                <el-descriptions-item label="标签">{{ row.tags || '—' }}</el-descriptions-item>
                <el-descriptions-item label="分类">{{ row.categoryName || '—' }}</el-descriptions-item>
                <el-descriptions-item label="热度">{{ row.heatScore }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ fmtTime(row.createdAt) }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ fmtTime(row.updatedAt) }}</el-descriptions-item>
              </el-descriptions>
              <div class="res-content-block">
                <div class="res-label">正文</div>
                <pre class="res-content">{{ row.content ? row.content : '（无）' }}</pre>
              </div>
            </div>
          </template>
          <el-empty v-else-if="!loading.published" description="暂无已上线资源" :image-size="80" />
        </div>
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="pub.page"
            v-model:page-size="pub.size"
            :total="pub.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="loadPublished"
            @size-change="searchPublished"
          />
        </div>
      </el-card>
    `
  };
})();
