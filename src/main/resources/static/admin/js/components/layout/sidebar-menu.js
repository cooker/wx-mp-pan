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
    emits: ['select'],
    template: `
      <el-aside class="admin-aside">
        <div class="admin-aside-cap"><span>菜单</span></div>
        <el-menu
          class="admin-menu"
          :default-active="activeMenu"
          @select="$emit('select', $event)"
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
    `
  };
})();
