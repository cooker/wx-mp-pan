(function () {
  const { createApp, ref, reactive, onMounted, provide } = Vue;
  const {
    AdminPageHeader,
    AdminSidebarMenu,
    AdminSiteConfigPage,
    AdminAnalyticsPage,
    AdminCategoriesPage,
    AdminPendingPage,
    AdminPublishedPage,
    AdminBlockedReviewPage,
    AdminBlockedManagePage
  } = window.AdminComponents || {};
  const api = axios.create({ withCredentials: true });
  api.interceptors.response.use(
    function (r) { return r; },
    function (err) {
      var d = err.response && err.response.data;
      var msg = (typeof d === 'string' && d) || (d && d.message) || err.message || '请求失败';
      ElementPlus.ElMessage.error(String(msg));
      return Promise.reject(err);
    }
  );

  const app = createApp({
    components: {
      AdminSidebarMenu: AdminSidebarMenu,
      AdminSiteConfigPage: AdminSiteConfigPage,
      AdminAnalyticsPage: AdminAnalyticsPage,
      AdminCategoriesPage: AdminCategoriesPage,
      AdminPendingPage: AdminPendingPage,
      AdminPublishedPage: AdminPublishedPage,
      AdminBlockedReviewPage: AdminBlockedReviewPage,
      AdminBlockedManagePage: AdminBlockedManagePage
    },
    setup: function () {
      var activeMenu = ref('categories');
      var categories = ref([]);
      var newCat = reactive({ name: '', sortOrder: 0 });
      var pendingList = ref([]);
      var blockedList = ref([]);
      var blockedActiveList = ref([]);
      var newBlockedKw = ref('');
      var pub = reactive({ keyword: '', page: 1, size: 20, total: 0, list: [] });
      var ana = reactive({
        overview: {},
        event: '',
        keyword: '',
        page: 1,
        size: 20,
        total: 0,
        list: []
      });
      var newRes = reactive({
        title: '',
        url: '',
        type: '',
        tagsStr: '',
        content: '',
        categoryId: undefined
      });
      var siteForm = reactive({
        siteTitle: '',
        headerScript: '',
        trackingEnabled: false,
        trackingEvents: []
      });
      var trackingEventOptions = [
        { value: 'home_view', label: '页面访问' },
        { value: 'search_submit', label: '搜索提交' },
        { value: 'hot_keyword_click', label: '热门词点击' },
        { value: 'copy_link_click', label: '复制链接' },
        { value: 'submit_resource', label: '提交资源' },
        { value: 'submit_blocked_keyword', label: '提交屏蔽词' }
      ];
      var loading = reactive({
        categories: false,
        pending: false,
        published: false,
        blocked: false,
        blockedManage: false,
        siteConfig: false,
        analytics: false
      });

      function fmtTime(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        return isNaN(d.getTime()) ? String(iso) : d.toLocaleString('zh-CN');
      }

      function decorateCategories(rows) {
        return (rows || []).map(function (r) {
          return Object.assign({}, r, { _editName: r.name, _editSort: r.sortOrder });
        });
      }

      function loadSiteConfig() {
        loading.siteConfig = true;
        api.get('/api/admin/site-config').then(function (res) {
          siteForm.siteTitle = res.data.siteTitle || '';
          siteForm.headerScript = res.data.headerScript != null ? res.data.headerScript : '';
          siteForm.trackingEnabled = !!res.data.trackingEnabled;
          siteForm.trackingEvents = Array.isArray(res.data.trackingEvents) ? res.data.trackingEvents : [];
        }).finally(function () { loading.siteConfig = false; });
      }

      function saveSiteConfig() {
        var t = (siteForm.siteTitle || '').trim();
        if (!t) {
          ElementPlus.ElMessage.warning('请输入网站标题');
          return;
        }
        var hs = siteForm.headerScript;
        if (hs === undefined || hs === null) {
          hs = '';
        }
        api.put('/api/admin/site-config', {
          siteTitle: t,
          headerScript: hs,
          trackingEnabled: !!siteForm.trackingEnabled,
          trackingEvents: siteForm.trackingEnabled ? siteForm.trackingEvents : []
        }).then(function () {
          ElementPlus.ElMessage.success('已保存');
        });
      }

      function loadAnalyticsOverview() {
        return api.get('/api/admin/analytics/overview').then(function (res) {
          ana.overview = res.data || {};
        });
      }

      function loadAnalytics() {
        loading.analytics = true;
        var params = { page: ana.page - 1, size: ana.size };
        var ev = (ana.event || '').trim();
        var kw = (ana.keyword || '').trim();
        if (ev) params.event = ev;
        if (kw) params.keyword = kw;
        return Promise.all([
          loadAnalyticsOverview(),
          api.get('/api/admin/analytics/events', { params: params }).then(function (res) {
            ana.total = res.data.total || 0;
            ana.list = res.data.items || [];
          })
        ]).finally(function () { loading.analytics = false; });
      }

      function searchAnalytics() {
        ana.page = 1;
        loadAnalytics();
      }

      function loadCategories() {
        loading.categories = true;
        api.get('/api/admin/categories').then(function (res) {
          categories.value = decorateCategories(res.data);
        }).finally(function () { loading.categories = false; });
      }

      function createCategory() {
        var name = (newCat.name || '').trim();
        if (!name) {
          ElementPlus.ElMessage.warning('请输入分类名称');
          return;
        }
        var sort = newCat.sortOrder;
        if (sort === null || sort === undefined || sort === '') {
          sort = 0;
        }
        api.post('/api/admin/categories', { name: name, sortOrder: sort }).then(function () {
          ElementPlus.ElMessage.success('分类已添加');
          newCat.name = '';
          newCat.sortOrder = 0;
          loadCategories();
        });
      }

      function saveCategory(row) {
        api.put('/api/admin/categories/' + row.id, { name: row._editName, sortOrder: row._editSort }).then(function () {
          ElementPlus.ElMessage.success('已保存');
          loadCategories();
        });
      }

      function deleteCategory(row) {
        ElementPlus.ElMessageBox.confirm('确定删除？关联资源的分类将被清空。', '提示', { type: 'warning' })
          .then(function () {
            return api.delete('/api/admin/categories/' + row.id);
          }).then(function () {
            ElementPlus.ElMessage.success('已删除');
            loadCategories();
          }).catch(function () {});
      }

      function decoratePending(rows) {
        return (rows || []).map(function (r) {
          return Object.assign({}, r, { _catId: r.categoryId != null ? r.categoryId : undefined });
        });
      }

      function loadPending() {
        loading.pending = true;
        api.get('/api/admin/resources/pending').then(function (res) {
          pendingList.value = decoratePending(res.data);
        }).finally(function () { loading.pending = false; });
      }

      function approveResource(row) {
        var body = {};
        if (row._catId != null && row._catId !== '') {
          body.categoryId = row._catId;
        }
        api.post('/api/admin/resources/' + row.id + '/approve', body).then(function () {
          ElementPlus.ElMessage.success('已通过');
          loadPending();
        });
      }

      function rejectResource(row) {
        ElementPlus.ElMessageBox.confirm('确定拒绝并删除该条？', '提示', { type: 'warning' })
          .then(function () {
            return api.delete('/api/admin/resources/' + row.id);
          }).then(function () {
            ElementPlus.ElMessage.success('已拒绝');
            loadPending();
          }).catch(function () {});
      }

      function loadPublished() {
        loading.published = true;
        var params = { page: pub.page - 1, size: pub.size };
        var kw = (pub.keyword || '').trim();
        if (kw) params.keyword = kw;
        api.get('/api/admin/resources/published', { params: params }).then(function (res) {
          pub.total = res.data.total || 0;
          pub.list = res.data.items || [];
        }).finally(function () { loading.published = false; });
      }

      function searchPublished() {
        pub.page = 1;
        loadPublished();
      }

      function createPublishedResource() {
        var title = (newRes.title || '').trim();
        if (!title) {
          ElementPlus.ElMessage.warning('请输入标题');
          return;
        }
        var tags = [];
        var ts = (newRes.tagsStr || '').trim();
        if (ts) {
          tags = ts.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
        }
        var body = { title: title };
        var u = (newRes.url || '').trim();
        if (u) body.url = u;
        var c = (newRes.content || '').trim();
        if (c) body.content = c;
        var ty = (newRes.type || '').trim();
        if (ty) body.type = ty;
        if (tags.length) body.tags = tags;
        if (newRes.categoryId != null && newRes.categoryId !== '') {
          body.categoryId = newRes.categoryId;
        }
        api.post('/api/admin/resources', body).then(function () {
          ElementPlus.ElMessage.success('资源已上线');
          newRes.title = '';
          newRes.url = '';
          newRes.type = '';
          newRes.tagsStr = '';
          newRes.content = '';
          newRes.categoryId = undefined;
          pub.page = 1;
          loadPublished();
        });
      }

      function deletePublished(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该资源？将从检索中移除。', '提示', { type: 'warning' })
          .then(function () {
            return api.delete('/api/admin/resources/published/' + row.id);
          }).then(function () {
            ElementPlus.ElMessage.success('已删除');
            loadPublished();
          }).catch(function () {});
      }

      function loadBlockedPending() {
        loading.blocked = true;
        api.get('/api/admin/blocked-keywords/pending').then(function (res) {
          blockedList.value = res.data || [];
        }).finally(function () { loading.blocked = false; });
      }

      function approveBlocked(row) {
        api.post('/api/admin/blocked-keywords/' + row.id + '/approve').then(function () {
          ElementPlus.ElMessage.success('已通过');
          loadBlockedPending();
        });
      }

      function rejectBlocked(row) {
        ElementPlus.ElMessageBox.confirm('确定拒绝该屏蔽词申请？', '提示', { type: 'warning' })
          .then(function () {
            return api.delete('/api/admin/blocked-keywords/' + row.id);
          }).then(function () {
            ElementPlus.ElMessage.success('已拒绝');
            loadBlockedPending();
          }).catch(function () {});
      }

      function loadBlockedActive() {
        loading.blockedManage = true;
        api.get('/api/admin/blocked-keywords/active').then(function (res) {
          blockedActiveList.value = res.data || [];
        }).finally(function () { loading.blockedManage = false; });
      }

      function createBlockedActive() {
        var kw = (newBlockedKw.value || '').trim();
        if (!kw) {
          ElementPlus.ElMessage.warning('请输入关键词');
          return;
        }
        api.post('/api/admin/blocked-keywords/active', { keyword: kw }).then(function () {
          ElementPlus.ElMessage.success('屏蔽词已添加');
          newBlockedKw.value = '';
          loadBlockedActive();
        });
      }

      function deleteBlockedActive(row) {
        ElementPlus.ElMessageBox.confirm('确定删除该屏蔽词？删除后立即在检索中失效。', '提示', { type: 'warning' })
          .then(function () {
            return api.delete('/api/admin/blocked-keywords/active/' + row.id);
          }).then(function () {
            ElementPlus.ElMessage.success('已删除');
            loadBlockedActive();
          }).catch(function () {});
      }

      function onMenuSelect(key) {
        activeMenu.value = key;
        if (key === 'categories') loadCategories();
        if (key === 'pending') loadPending();
        if (key === 'published') searchPublished();
        if (key === 'blocked') loadBlockedPending();
        if (key === 'blockedManage') loadBlockedActive();
        if (key === 'siteConfig') loadSiteConfig();
        if (key === 'analytics') searchAnalytics();
      }

      provide('loading', loading);
      provide('siteForm', siteForm);
      provide('trackingEventOptions', trackingEventOptions);
      provide('ana', ana);
      provide('categories', categories);
      provide('newCat', newCat);
      provide('pendingList', pendingList);
      provide('pub', pub);
      provide('newRes', newRes);
      provide('blockedList', blockedList);
      provide('blockedActiveList', blockedActiveList);
      provide('newBlockedKw', newBlockedKw);
      provide('fmtTime', fmtTime);
      provide('saveSiteConfig', saveSiteConfig);
      provide('loadAnalytics', loadAnalytics);
      provide('searchAnalytics', searchAnalytics);
      provide('createCategory', createCategory);
      provide('saveCategory', saveCategory);
      provide('deleteCategory', deleteCategory);
      provide('approveResource', approveResource);
      provide('rejectResource', rejectResource);
      provide('loadPublished', loadPublished);
      provide('searchPublished', searchPublished);
      provide('createPublishedResource', createPublishedResource);
      provide('deletePublished', deletePublished);
      provide('approveBlocked', approveBlocked);
      provide('rejectBlocked', rejectBlocked);
      provide('createBlockedActive', createBlockedActive);
      provide('deleteBlockedActive', deleteBlockedActive);

      onMounted(function () {
        loadCategories();
      });

      return {
        activeMenu: activeMenu,
        onMenuSelect: onMenuSelect
      };
    }
  });

  if (AdminPageHeader) {
    app.component('admin-page-header', AdminPageHeader);
  }

  app.use(ElementPlus).mount('#app');
})();
