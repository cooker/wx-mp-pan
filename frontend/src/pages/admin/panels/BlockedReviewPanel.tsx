import { useCallback, useEffect, useState } from 'react'
import { Button, Dialog, Space, SpinLoading, Toast } from 'antd-mobile'
import { AdminListSwiper } from '@/pages/admin/components/AdminListSwiper'
import { adminApi } from '@/api/client'
import type { PendingBlockedKeywordDto } from '@/api/types'
import { fmtTime } from '@/utils/time'

export default function BlockedReviewPanel() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<PendingBlockedKeywordDto[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<PendingBlockedKeywordDto[]>('/api/admin/blocked-keywords/pending')
      setRows(res.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function approve(row: PendingBlockedKeywordDto) {
    await adminApi.post(`/api/admin/blocked-keywords/${row.id}/approve`)
    Toast.show({ icon: 'success', content: '已通过' })
    void load()
  }

  function reject(row: PendingBlockedKeywordDto) {
    Dialog.confirm({
      title: '提示',
      content: '确定拒绝该屏蔽词申请？',
      onConfirm: async () => {
        await adminApi.delete(`/api/admin/blocked-keywords/${row.id}`)
        Toast.show({ icon: 'success', content: '已拒绝' })
        void load()
      },
    })
  }

  if (loading && !rows.length) {
    return (
      <div className="center-pad">
        <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
      </div>
    )
  }

  return (
    <AdminListSwiper
      slides={rows.map((row) => ({
        key: row.id,
        content: (
          <Space direction="vertical" block>
            <div className="font-semibold">{row.keyword}</div>
            <div className="muted small">{fmtTime(row.createdAt)}</div>
            <Space>
              <Button size="small" color="primary" onClick={() => void approve(row)}>
                通过
              </Button>
              <Button size="small" color="danger" onClick={() => reject(row)}>
                拒绝
              </Button>
            </Space>
          </Space>
        ),
      }))}
    />
  )
}
