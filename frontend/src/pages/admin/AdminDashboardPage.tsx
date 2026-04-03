import { useState } from 'react'
import { Button, NavBar, TabBar } from 'antd-mobile'
import SiteConfigPanel from '@/pages/admin/panels/SiteConfigPanel'
import AnalyticsPanel from '@/pages/admin/panels/AnalyticsPanel'
import CategoriesPanel from '@/pages/admin/panels/CategoriesPanel'
import PendingPanel from '@/pages/admin/panels/PendingPanel'
import PublishedPanel from '@/pages/admin/panels/PublishedPanel'
import BlockedReviewPanel from '@/pages/admin/panels/BlockedReviewPanel'
import BlockedManagePanel from '@/pages/admin/panels/BlockedManagePanel'

type MenuKey =
  | 'siteConfig'
  | 'analytics'
  | 'categories'
  | 'pending'
  | 'published'
  | 'blocked'
  | 'blockedManage'

const strokeIcon = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
}

function IconSiteConfig() {
  return (
    <svg {...strokeIcon}>
      <path d="M4 21v-7M4 10V3M12 21v-5M12 12V3M20 21v-9M20 8V3" />
    </svg>
  )
}

function IconAnalytics() {
  return (
    <svg {...strokeIcon}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 3 3 5-6" />
    </svg>
  )
}

function IconCategories() {
  return (
    <svg {...strokeIcon}>
      <path d="M3 7h5l2-3h4l2 3h5v12H3z" />
    </svg>
  )
}

function IconPending() {
  return (
    <svg {...strokeIcon}>
      <circle cx={12} cy={12} r={9} />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

function IconPublished() {
  return (
    <svg {...strokeIcon}>
      <path d="M8 6h13v12H8z" />
      <path d="M3 10h5M3 14h5" />
    </svg>
  )
}

function IconBlockedReview() {
  return (
    <svg {...strokeIcon}>
      <path d="M12 3l7 4v5c0 5-3 8-7 9-4-1-7-4-7-9V7z" />
    </svg>
  )
}

function IconBlockedManage() {
  return (
    <svg {...strokeIcon}>
      <circle cx={12} cy={12} r={9} />
      <path d="M8 12h8" />
    </svg>
  )
}

export default function AdminDashboardPage() {
  const [activeKey, setActiveKey] = useState<MenuKey>('categories')

  return (
    <div className="admin-app">
      <NavBar
        back={null}
        right={
          <div className="admin-nav-actions">
            <a href="/" className="adm-link">
              首页
            </a>
            <form action="/admin/logout" method="post" className="inline-form">
              <Button size="mini" type="submit" fill="outline" color="danger">
                退出
              </Button>
            </form>
          </div>
        }
      >
        管理后台
      </NavBar>

      <div className="admin-tab-main">
        {activeKey === 'siteConfig' && <SiteConfigPanel />}
        {activeKey === 'analytics' && <AnalyticsPanel />}
        {activeKey === 'categories' && <CategoriesPanel />}
        {activeKey === 'pending' && <PendingPanel />}
        {activeKey === 'published' && <PublishedPanel />}
        {activeKey === 'blocked' && <BlockedReviewPanel />}
        {activeKey === 'blockedManage' && <BlockedManagePanel />}
      </div>

      <TabBar
        className="admin-tab-bar"
        activeKey={activeKey}
        safeArea
        onChange={(k) => setActiveKey(k as MenuKey)}
      >
        <TabBar.Item key="siteConfig" icon={() => <IconSiteConfig />} title="配置" />
        <TabBar.Item key="analytics" icon={() => <IconAnalytics />} title="报表" />
        <TabBar.Item key="categories" icon={() => <IconCategories />} title="分类" />
        <TabBar.Item key="pending" icon={() => <IconPending />} title="待审" />
        <TabBar.Item key="published" icon={() => <IconPublished />} title="资源" />
        <TabBar.Item key="blocked" icon={() => <IconBlockedReview />} title="屏审" />
        <TabBar.Item key="blockedManage" icon={() => <IconBlockedManage />} title="屏管" />
      </TabBar>
    </div>
  )
}
