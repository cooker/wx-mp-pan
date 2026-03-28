(function () {
  window.AdminComponents = window.AdminComponents || {};
  window.AdminComponents.AdminSidebarMenu = {
    name: 'AdminSidebarMenu',
    props: {
      activeMenu: {
        type: String,
        required: true
      }
    },
    inject: {
      isMobileLayout: { default: null },
      adminAsideOpen: { default: null },
      closeAdminAside: { default: function () {} }
    },
    emits: ['select'],
    computed: {
      asideOpenClass: function () {
        var m = this.isMobileLayout;
        var o = this.adminAsideOpen;
        if (!m || typeof m.value === 'undefined') return true;
        if (!m.value) return true;
        return !!(o && o.value);
      }
    },
    methods: {
      onMenuSelect: function (key) {
        this.$emit('select', key);
        if (this.isMobileLayout && this.isMobileLayout.value && typeof this.closeAdminAside === 'function') {
          this.closeAdminAside();
        }
      },
      onOverlayClick: function () {
        if (typeof this.closeAdminAside === 'function') {
          this.closeAdminAside();
        }
      }
    },
    template: `
      <div class="admin-aside-wrap">
        <div
          v-if="isMobileLayout && isMobileLayout.value && adminAsideOpen && adminAsideOpen.value"
          class="admin-aside-overlay"
          role="presentation"
          @click="onOverlayClick"
        ></div>
        <el-aside
          class="admin-aside"
          :class="{ 'admin-aside--open': asideOpenClass }"
        >
          <div class="admin-aside-cap"><span>菜单</span></div>
          <el-menu
            class="admin-menu"
            :default-active="activeMenu"
            @select="onMenuSelect"
            background-color="transparent"
            text-color="#94a3b8"
            active-text-color="#93c5fd"
          >
            <el-menu-item index="siteConfig">网站配置</el-menu-item>
            <el-menu-item index="analytics">埋点报表</el-menu-item>
            <el-menu-item index="categories">分类管理</el-menu-item>
            <el-menu-item index="pending">资源审核</el-menu-item>
            <el-menu-item index="published">资源管理</el-menu-item>
            <el-menu-item index="blocked">屏蔽词审核</el-menu-item>
            <el-menu-item index="blockedManage">屏蔽词管理</el-menu-item>
          </el-menu>
        </el-aside>
      </div>
    `
  };
})();
