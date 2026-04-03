import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Button, Dialog, Input, Space, SpinLoading, Toast } from 'antd-mobile'
import { AdminListSwiper } from '@/pages/admin/components/AdminListSwiper'
import { adminApi } from '@/api/client'
import type { ActiveBlockedKeywordDto } from '@/api/types'
import { fmtTime } from '@/utils/time'

export default function BlockedManagePanel() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ActiveBlockedKeywordDto[]>([])
  const [kw, setKw] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<ActiveBlockedKeywordDto[]>('/api/admin/blocked-keywords/active')
      setRows(res.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function add() {
    const k = kw.trim()
    if (!k) {
      Toast.show({ content: '请输入关键词' })
      return
    }
    await adminApi.post('/api/admin/blocked-keywords/active', { keyword: k })
    Toast.show({ icon: 'success', content: '屏蔽词已添加' })
    setKw('')
    void load()
  }

  function del(row: ActiveBlockedKeywordDto) {
    Dialog.confirm({
      title: '提示',
      content: '确定删除该屏蔽词？删除后立即在检索中失效。',
      onConfirm: async () => {
        await adminApi.delete(`/api/admin/blocked-keywords/active/${row.id}`)
        Toast.show({ icon: 'success', content: '已删除' })
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
    <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
      <Input placeholder="新屏蔽词" value={kw} onChange={setKw} />
      <Button color="primary" onClick={() => void add()}>
        添加
      </Button>
      <AdminListSwiper
        slides={rows.map((row) => ({
          key: row.id,
          content: (
            <Space direction="vertical" block style={{ '--gap': 'var(--space-sm)' } as CSSProperties}>
              <div className="font-semibold">{row.keyword}</div>
              <div className="muted small">{fmtTime(row.createdAt)}</div>
              <Button size="small" color="danger" onClick={() => del(row)}>
                删除
              </Button>
            </Space>
          ),
        }))}
      />
    </Space>
  )
}
