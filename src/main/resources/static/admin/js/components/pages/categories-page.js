(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminCategoriesPage = {
    name: 'AdminCategoriesPage',
    inject: ['loading', 'categories', 'newCat', 'fmtTime', 'createCategory', 'saveCategory', 'deleteCategory'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="分类管理"
            desc-html="先通过下方<strong>新增分类</strong>填写名称与排序并添加；下方列表展示已有分类的全部信息（可编辑保存或删除）。排序数字越小越靠前。"
          />
        </template>
        <div class="cat-add-panel">
          <div class="cat-add-title">新增分类</div>
          <el-form :inline="true" @submit.prevent="createCategory">
            <el-form-item label="名称">
              <el-input v-model="newCat.name" placeholder="请输入分类名称" clearable maxlength="100" style="width:min(260px, 100%)" @keyup.enter="createCategory" />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="newCat.sortOrder" :min="-9999" :max="9999" controls-position="right" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="button" @click="createCategory">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div v-loading="loading.categories" class="res-list">
          <template v-if="categories.length">
            <div v-for="row in categories" :key="row.id" class="res-list-item">
              <div class="res-list-head">
                <div class="res-list-head-main">
                  <span class="res-id">#{{ row.id }}</span>
                  <span class="res-title">{{ row._editName || row.name || '（未命名）' }}</span>
                </div>
                <div>
                  <el-button type="primary" size="small" link @click="saveCategory(row)">保存</el-button>
                  <el-button type="danger" size="small" link @click="deleteCategory(row)">删除</el-button>
                </div>
              </div>
              <el-descriptions class="res-meta" :column="2" border size="small">
                <el-descriptions-item label="名称" :span="2">
                  <el-input v-model="row._editName" maxlength="100" placeholder="分类名称" />
                </el-descriptions-item>
                <el-descriptions-item label="排序">
                  <el-input-number v-model="row._editSort" :min="-9999" :max="9999" controls-position="right" style="width:140px" />
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ fmtTime(row.createdAt) }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
          <el-empty v-else-if="!loading.categories" description="暂无分类，请在上方添加" :image-size="80" />
        </div>
      </el-card>
    `
  };
})();
