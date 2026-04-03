import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Button, Input, Selector, Space, SpinLoading, Switch, TextArea, Toast } from 'antd-mobile'
import { adminApi } from '@/api/client'
import type { SiteConfigDto } from '@/api/types'

const TRACKING_EVENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'home_view', label: '页面访问' },
  { value: 'search_submit', label: '搜索提交' },
  { value: 'hot_keyword_click', label: '热门词点击' },
  { value: 'copy_link_click', label: '复制链接' },
  { value: 'submit_resource', label: '提交资源' },
  { value: 'submit_blocked_keyword', label: '提交屏蔽词' },
]

export default function SiteConfigPanel() {
  const [loading, setLoading] = useState(false)
  const [siteTitle, setSiteTitle] = useState('')
  const [headerScript, setHeaderScript] = useState('')
  const [trackingEnabled, setTrackingEnabled] = useState(false)
  const [trackingEvents, setTrackingEvents] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<SiteConfigDto>('/api/admin/site-config')
      const d = res.data
      setSiteTitle(d.siteTitle || '')
      setHeaderScript(d.headerScript != null ? d.headerScript : '')
      setTrackingEnabled(!!d.trackingEnabled)
      setTrackingEvents(Array.isArray(d.trackingEvents) ? d.trackingEvents : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    const t = siteTitle.trim()
    if (!t) {
      Toast.show({ content: '请输入网站标题' })
      return
    }
    await adminApi.put('/api/admin/site-config', {
      siteTitle: t,
      headerScript: headerScript || '',
      trackingEnabled,
      trackingEvents: trackingEnabled ? trackingEvents : [],
    })
    Toast.show({ icon: 'success', content: '已保存' })
  }

  if (loading && !siteTitle && !headerScript) {
    return (
      <div className="center-pad">
        <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
      </div>
    )
  }

  return (
    <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
      <div className="panel-title">网站标题</div>
      <Input placeholder="网站标题" value={siteTitle} onChange={setSiteTitle} maxLength={200} />

      <div className="panel-title">Head 注入</div>
      <TextArea
        placeholder="可插入统计脚本等（请谨慎）"
        value={headerScript}
        onChange={setHeaderScript}
        rows={6}
        showCount
      />

      <div className="row-between">
        <span>启用埋点</span>
        <Switch checked={trackingEnabled} onChange={setTrackingEnabled} />
      </div>

      {trackingEnabled ? (
        <>
          <div className="panel-title">上报事件</div>
          <Selector
            multiple
            columns={2}
            options={TRACKING_EVENT_OPTIONS}
            value={trackingEvents}
            onChange={(v) => setTrackingEvents(v)}
          />
        </>
      ) : null}

      <Button color="primary" onClick={() => void save()}>
        保存
      </Button>
    </Space>
  )
}
