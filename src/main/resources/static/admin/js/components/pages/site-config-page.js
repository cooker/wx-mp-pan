(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminSiteConfigPage = {
    name: 'AdminSiteConfigPage',
    inject: ['loading', 'siteForm', 'trackingEventOptions', 'saveSiteConfig'],
    template: `
      <el-card class="page-card" shadow="never">
        <template #header>
          <admin-page-header
            title="网站配置"
            desc-html="配置前台<strong>网站标题</strong>（浏览器标题与首页大标题）及<strong>首页 head 脚本</strong>（将注入访客首页 <code>&lt;head&gt;</code>，支持统计、meta 等；请仅粘贴可信内容）。保存后访客下次打开首页生效。"
          />
        </template>
        <div v-loading="loading.siteConfig">
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
            <el-form-item>
              <el-button type="primary" native-type="submit">保存</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    `
  };
})();
