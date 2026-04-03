import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { Button, Input, Modal, Space, SpinLoading, Stepper, Tag, Toast } from 'antd-mobile'
import { adminApi } from '@/api/client'
import type { CategoryDto } from '@/api/types'

export default function CategoriesPanel() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<CategoryDto[]>([])
  const [newName, setNewName] = useState('')
  const [newSort, setNewSort] = useState(0)

  const [editModal, setEditModal] = useState<CategoryDto | null>(null)
  const [editName, setEditName] = useState('')
  const [editSort, setEditSort] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.get<CategoryDto[]>('/api/admin/categories')
      setRows(res.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (editModal) {
      setEditName(editModal.name)
      setEditSort(editModal.sortOrder)
    }
  }, [editModal])

  async function createCat() {
    const name = newName.trim()
    if (!name) {
      Toast.show({ content: '请输入分类名称' })
      return
    }
    await adminApi.post('/api/admin/categories', { name, sortOrder: newSort })
    Toast.show({ icon: 'success', content: '分类已添加' })
    setNewName('')
    setNewSort(0)
    void load()
  }

  async function saveEdit() {
    if (!editModal) return
    const name = editName.trim()
    if (!name) {
      Toast.show({ content: '请输入分类名称' })
      return
    }
    await adminApi.put(`/api/admin/categories/${editModal.id}`, {
      name,
      sortOrder: editSort,
    })
    Toast.show({ icon: 'success', content: '已保存' })
    setEditModal(null)
    void load()
  }

  async function deleteRow(row: CategoryDto) {
    await adminApi.delete(`/api/admin/categories/${row.id}`)
    Toast.show({ icon: 'success', content: '已删除' })
    void load()
  }

  const sortedRows = [...rows].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.name.localeCompare(b.name, 'zh-CN')
  })

  if (loading && !rows.length) {
    return (
      <div className="center-pad">
        <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
      </div>
    )
  }

  return (
    <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
      <div className="panel-title">新增分类</div>
      <Input placeholder="名称" value={newName} onChange={setNewName} />
      <div className="row-between">
        <span className="muted">排序</span>
        <Stepper value={newSort} onChange={setNewSort} />
      </div>
      <Button color="primary" onClick={() => void createCat()}>
        添加
      </Button>

      <div className="panel-title" style={{ marginTop: 'var(--space-sm)' }}>
        全部分类
      </div>
      {sortedRows.length === 0 ? (
        <div className="muted small">暂无分类</div>
      ) : (
        <div className="admin-category-tags" role="list">
          {sortedRows.map((row) => (
            <div key={row.id} className="admin-category-tag-item" role="listitem">
              <Tag
                color="primary"
                fill="outline"
                round
                className="admin-category-tag"
                onClick={() => setEditModal(row)}
              >
                <span className="admin-category-tag-inner">
                  <span className="admin-category-tag-name">{row.name}</span>
                  <span className="admin-category-tag-meta">{row.sortOrder}</span>
                </span>
              </Tag>
              <button
                type="button"
                className="admin-category-tag-del"
                aria-label={`删除分类 ${row.name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  void deleteRow(row)
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal
        visible={editModal != null}
        title="编辑分类"
        content={
          <Space direction="vertical" block style={{ '--gap': 'var(--space-md)', width: '100%' } as CSSProperties}>
            <Input placeholder="名称" value={editName} onChange={setEditName} maxLength={200} />
            <div className="row-between">
              <span className="muted">排序</span>
              <Stepper value={editSort} onChange={setEditSort} />
            </div>
          </Space>
        }
        closeOnMaskClick
        showCloseButton
        onClose={() => setEditModal(null)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setEditModal(null),
          },
          {
            key: 'save',
            text: '保存',
            primary: true,
            onClick: () => void saveEdit(),
          },
        ]}
      />
    </Space>
  )
}
