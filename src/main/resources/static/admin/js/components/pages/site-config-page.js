(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminSiteConfigPage = {
    name: 'AdminSiteConfigPage',
    inject: [
      'loading',
      'siteForm',
      'trackingEventOptions',
      'saveSiteConfig',
      'exportSiteConfig',
      'importSiteConfigPick'
    ],
    methods: {
      addAppRec: function () {
        if (!this.siteForm.appRecommendations) {
          this.siteForm.appRecommendations = [];
        }
        if (this.siteForm.appRecommendations.length >= 30) {
          return;
        }
        this.siteForm.appRecommendations.push({ name: '', iconUrl: '', downloadUrl: '' });
      },
      removeAppRec: function (idx) {
        this.siteForm.appRecommendations.splice(idx, 1);
      }
    },
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="网站配置"
            desc-html="配置前台<strong>网站标题</strong>、<strong>首页 head 脚本</strong>（请仅粘贴可信内容）、<strong>埋点</strong>与<strong>首页 APP 推荐</strong>。支持<strong>导出 / 导入 JSON</strong> 备份与迁移；导入会覆盖当前库中配置。保存或导入后访客下次打开首页生效。"
          />
        </template>
        <div v-loading="loading.siteConfig">
          <div class="toolbar site-config-toolbar">
            <el-button type="primary" plain @click="exportSiteConfig">导出配置 JSON</el-button>
            <el-button type="success" plain @click="importSiteConfigPick">导入 JSON</el-button>
          </div>
          <el-form label-width="120px" style="max-width:720px" @submit.prevent="saveSiteConfig">
            <el-form-item label="网站标题" required>
              <el-input v-model="siteForm.siteTitle" maxlength="200" show-word-limit placeholder="显示在浏览器标签与首页标题" />
            </el-form-item>
            <el-form-item label="首页 head 脚本">
              <el-input
                v-model="siteForm.headerScript"
                type="textarea"
                :rows="10"
                maxlength="100000"
                show-word-limit
                placeholder="可选。可粘贴 &lt;script&gt;…&lt;/script&gt;、&lt;meta&gt; 等，将追加到首页 head"
              />
            </el-form-item>
            <el-form-item label="埋点开关">
              <el-switch v-model="siteForm.trackingEnabled" inline-prompt active-text="开" inactive-text="关" />
            </el-form-item>
            <el-form-item label="埋点勾选">
              <el-checkbox-group v-model="siteForm.trackingEvents" :disabled="!siteForm.trackingEnabled">
                <el-checkbox v-for="ev in trackingEventOptions" :key="ev.value" :value="ev.value">
                  {{ ev.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="首页 APP 推荐">
              <div class="app-rec-editor">
                <p class="app-rec-hint">可添加多个推荐项；下载链接必填（http/https）。未填图标的项将显示名称首字占位。最多 30 条。</p>
                <div v-for="(row, idx) in siteForm.appRecommendations" :key="idx" class="app-rec-row">
                  <el-input v-model="row.name" placeholder="名称（可选）" maxlength="80" clearable class="app-rec-field" />
                  <el-input v-model="row.iconUrl" placeholder="图标 URL（https…）" maxlength="2000" clearable class="app-rec-field" />
                  <el-input v-model="row.downloadUrl" placeholder="下载链接（必填）" maxlength="2000" clearable class="app-rec-field" />
                  <el-button type="danger" plain @click="removeAppRec(idx)">删除</el-button>
                </div>
                <el-button :disabled="siteForm.appRecommendations.length >= 30" @click="addAppRec">添加一项</el-button>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" native-type="submit">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    `
  };
})();
