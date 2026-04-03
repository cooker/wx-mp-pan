import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Badge, Button, Card, Input, Space, SpinLoading } from 'antd-mobile'
import { AdminListSwiper } from '@/pages/admin/components/AdminListSwiper'
import { adminApi } from '@/api/client'
import type {
  AdminAnalyticsEventItemDto,
  AdminAnalyticsEventsPageDto,
  AdminAnalyticsOverviewDto,
} from '@/api/types'
import { fmtTime } from '@/utils/time'

const OVERVIEW_METRICS: {
  label: string
  pick: (o: AdminAnalyticsOverviewDto) => number
}[] = [
  { label: '总事件', pick: (o) => o.totalEvents },
  { label: '页面访问', pick: (o) => o.homeView },
  { label: '搜索提交', pick: (o) => o.searchSubmit },
  { label: '热门词点击', pick: (o) => o.hotKeywordClick },
  { label: '复制链接', pick: (o) => o.copyLinkClick },
  { label: '提交资源', pick: (o) => o.submitResource },
  { label: '提交屏蔽词', pick: (o) => o.submitBlockedKeyword },
]

export default function AnalyticsPanel() {
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<AdminAnalyticsOverviewDto | null>(null)
  const [event, setEvent] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [searchTick, setSearchTick] = useState(0)
  const pageSize = 20
  const [total, setTotal] = useState(0)
  const [items, setItems] = useState<AdminAnalyticsEventItemDto[]>([])

  const loadOverview = useCallback(async () => {
    const res = await adminApi.get<AdminAnalyticsOverviewDto>('/api/admin/analytics/overview')
    setOverview(res.data || null)
  }, [])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: page - 1, size: pageSize }
      const ev = event.trim()
      const kw = keyword.trim()
      if (ev) params.event = ev
      if (kw) params.keyword = kw
      const res = await adminApi.get<AdminAnalyticsEventsPageDto>('/api/admin/analytics/events', {
        params,
      })
      setTotal(res.data?.total ?? 0)
      setItems(res.data?.items ?? [])
    } finally {
      setLoading(false)
    }
  }, [event, keyword, page, pageSize])

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents, searchTick])

  function runSearch() {
    setPage(1)
    setSearchTick((t) => t + 1)
  }

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
      {overview && (
        <Card
          title="概览"
          className="admin-analytics-overview-card"
          headerStyle={{ paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)' }}
          bodyStyle={{ paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)' }}
        >
          <Space direction="vertical" block style={{ '--gap': 'var(--space-2xs)' } as CSSProperties}>
            {OVERVIEW_METRICS.map(({ label, pick }) => (
              <div key={label} className="row-between admin-analytics-overview-row">
                <span className="admin-analytics-overview-label">{label}</span>
                <Badge content={pick(overview)} color="var(--adm-color-primary)" />
              </div>
            ))}
          </Space>
        </Card>
      )}

      <div className="panel-title">事件明细</div>
      <div className="admin-search-toolbar">
        <Input
          className="admin-search-field"
          placeholder="事件名"
          value={event}
          onChange={setEvent}
          onEnterPress={() => runSearch()}
        />
        <Input
          className="admin-search-field"
          placeholder="关键词"
          value={keyword}
          onChange={setKeyword}
          onEnterPress={() => runSearch()}
        />
        <Button size="mini" onClick={() => runSearch()}>
          查询
        </Button>
      </div>

      {loading && !items.length ? (
        <div className="center-pad">
          <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
        </div>
      ) : (
        <>
          <div className="row-between muted small">
            <span>
              第 {page} / {maxPage} 页，共 {total} 条
            </span>
            <Space>
              <Button
                size="mini"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <Button
                size="mini"
                disabled={page >= maxPage}
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
              >
                下一页
              </Button>
            </Space>
          </div>
          <AdminListSwiper
            slides={items.map((row) => ({
              key: row.id,
              content: (
                <Space direction="vertical" block style={{ '--gap': 'var(--space-2xs)' } as CSSProperties}>
                  <div className="font-semibold">{row.event}</div>
                  <div className="muted small">{fmtTime(row.createdAt)}</div>
                  {row.path ? <div className="break-all small">path: {row.path}</div> : null}
                  {row.deviceId ? <div className="break-all small">device: {row.deviceId}</div> : null}
                  {row.ipAddress ? <div className="small">ip: {row.ipAddress}</div> : null}
                  {row.propsJson ? (
                    <div className="break-all small">props: {row.propsJson}</div>
                  ) : null}
                </Space>
              ),
            }))}
          />
        </>
      )}
    </Space>
  )
}
