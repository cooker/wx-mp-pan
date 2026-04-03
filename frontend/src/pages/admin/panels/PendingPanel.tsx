import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import {
  Badge,
  Button,
  Dialog,
  ErrorBlock,
  Grid,
  NoticeBar,
  Space,
  SpinLoading,
  Toast,
} from 'antd-mobile'
import {
  AdminResourceFormCard,
  buildResourceUpdatePayload,
  type ResourceFormValues,
} from '@/pages/admin/components/AdminResourceFormCard'
import { adminApi } from '@/api/client'
import type { AdminPendingPage, CategoryDto, PendingResourceDto } from '@/api/types'
import { fmtTime } from '@/utils/time'

const PENDING_PAGE_SIZE = 1

type PendingRow = ResourceFormValues & {
  id: number
  createdAt: string
}

function mapPending(r: PendingResourceDto): PendingRow {
  return {
    id: r.id,
    createdAt: r.createdAt,
    title: r.title,
    url: r.url ?? '',
    type: r.type ?? '',
    tags: r.tags ?? '',
    content: r.content ?? '',
    categoryId: r.categoryId != null && r.categoryId > 0 ? r.categoryId : 0,
  }
}

export default function PendingPanel() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<PendingRow[]>([])
  const [totalPending, setTotalPending] = useState(0)
  const [categories, setCategories] = useState<CategoryDto[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, pRes] = await Promise.all([
        adminApi.get<CategoryDto[]>('/api/admin/categories'),
        adminApi.get<AdminPendingPage>('/api/admin/resources/pending', {
          params: { limit: PENDING_PAGE_SIZE },
        }),
      ])
      setCategories(cRes.data || [])
      const page = pRes.data
      const items = page?.items ?? []
      setTotalPending(page?.total ?? 0)
      setRows(items.map(mapPending))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const catOpts =
    categories.length > 0
      ? [{ label: '不指定', value: 0 }, ...categories.map((c) => ({ label: c.name, value: c.id }))]
      : [{ label: '（暂无分类）', value: 0 }]

  const catColumns = [catOpts]

  function patchRow(id: number, patch: Partial<ResourceFormValues>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function save(row: PendingRow) {
    const title = row.title.trim()
    if (!title) {
      Toast.show({ content: '请填写标题' })
      return
    }
    await adminApi.patch(`/api/admin/resources/${row.id}`, buildResourceUpdatePayload(row))
    Toast.show({ icon: 'success', content: '已保存' })
    void load()
  }

  async function approve(row: PendingRow) {
    const title = row.title.trim()
    if (!title) {
      Toast.show({ content: '请填写标题' })
      return
    }
    await adminApi.patch(`/api/admin/resources/${row.id}`, buildResourceUpdatePayload(row))
    const body: { categoryId?: number } = {}
    if (row.categoryId > 0) {
      body.categoryId = row.categoryId
    }
    await adminApi.post(`/api/admin/resources/${row.id}/approve`, body)
    Toast.show({ icon: 'success', content: '已通过' })
    void load()
  }

  function reject(row: PendingRow) {
    Dialog.confirm({
      title: '提示',
      content: '确定拒绝并删除该条？',
      onConfirm: async () => {
        await adminApi.delete(`/api/admin/resources/${row.id}`)
        Toast.show({ icon: 'success', content: '已拒绝' })
        void load()
      },
    })
  }

  return (
    <div className="admin-pending-form-scope">
      <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
        <div className="row-between admin-resource-toolbar admin-pending-toolbar">
          <div className="admin-pending-toolbar-main">
            <div className="admin-pending-toolbar-title-row">
              <Badge content={totalPending > 0 ? totalPending : undefined} color="primary">
                <span className="admin-pending-toolbar-heading">待审核</span>
              </Badge>
              <Button size="mini" fill="outline" onClick={() => void load()} disabled={loading}>
                刷新
              </Button>
            </div>
            <NoticeBar
              className="admin-pending-notice"
              content={`当前展示最早 ${PENDING_PAGE_SIZE} 条（按提交时间）；保存、通过或拒绝后自动拉取下一条`}
              color="info"
              wrap
              closeable={false}
              shape="rounded"
              bordered="block"
            />
          </div>
        </div>

        {loading && !rows.length ? (
          <div className="center-pad admin-pending-loading">
            <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
          </div>
        ) : rows.length === 0 ? (
          <ErrorBlock
            className="admin-pending-error-block"
            status="empty"
            title="暂无待审核"
            description="用户新提交的资源将按时间顺序出现在这里"
          />
        ) : (
          rows.map((row) => (
            <AdminResourceFormCard
              key={row.id}
              variant="pending"
              cardTitle={`待审核 · #${row.id}`}
              metaLabel="提交时间"
              metaLine={<>提交 {fmtTime(row.createdAt)}</>}
              values={row}
              onChange={(patch) => patchRow(row.id, patch)}
              catColumns={catColumns}
              actions={
                <Grid columns={3} gap={8} className="admin-pending-actions-grid">
                  <Grid.Item>
                    <Button size="small" fill="outline" block onClick={() => void save(row)}>
                      保存
                    </Button>
                  </Grid.Item>
                  <Grid.Item>
                    <Button size="small" color="primary" block onClick={() => void approve(row)}>
                      通过
                    </Button>
                  </Grid.Item>
                  <Grid.Item>
                    <Button size="small" color="danger" block onClick={() => reject(row)}>
                      拒绝
                    </Button>
                  </Grid.Item>
                </Grid>
              }
            />
          ))
        )}
      </Space>
    </div>
  )
}
