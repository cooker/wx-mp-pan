import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import {
  Button,
  Card,
  Dialog,
  Ellipsis,
  Grid,
  Input,
  List,
  Popup,
  Space,
  SpinLoading,
  TextArea,
  Toast,
} from 'antd-mobile'
import {
  AdminResourceFormCard,
  buildResourceUpdatePayload,
  type ResourceFormValues,
} from '@/pages/admin/components/AdminResourceFormCard'
import { adminApi } from '@/api/client'
import type { AdminPublishedPage, AdminPublishedResourceDto, CategoryDto } from '@/api/types'

type PublishedRow = ResourceFormValues & {
  id: number
  heatScore: number
  createdAt: string
  updatedAt: string
  categoryName: string | null
}

function mapPublished(r: AdminPublishedResourceDto): PublishedRow {
  return {
    id: r.id,
    heatScore: r.heatScore,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    categoryName: r.categoryName,
    title: r.title,
    url: r.url ?? '',
    type: r.type ?? '',
    tags: r.tags ?? '',
    content: r.content ?? '',
    categoryId: r.categoryId != null && r.categoryId > 0 ? r.categoryId : 0,
  }
}

export default function PublishedPanel() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [searchTick, setSearchTick] = useState(0)
  const pageSize = 20
  const [total, setTotal] = useState(0)
  const [list, setList] = useState<PublishedRow[]>([])
  const [draft, setDraft] = useState<PublishedRow | null>(null)

  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCatId, setNewCatId] = useState(0)
  const [createExpanded, setCreateExpanded] = useState(false)

  const loadCats = useCallback(async () => {
    const res = await adminApi.get<CategoryDto[]>('/api/admin/categories')
    setCategories(res.data || [])
  }, [])

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page: page - 1, size: pageSize }
      const kw = keyword.trim()
      if (kw) params.keyword = kw
      const res = await adminApi.get<AdminPublishedPage>('/api/admin/resources/published', {
        params,
      })
      setTotal(res.data?.total ?? 0)
      setList((res.data?.items ?? []).map(mapPublished))
    } finally {
      setLoading(false)
    }
  }, [keyword, page, pageSize])

  useEffect(() => {
    void loadCats()
  }, [loadCats])

  useEffect(() => {
    void loadList()
  }, [loadList, searchTick])

  function runSearch() {
    setPage(1)
    setSearchTick((t) => t + 1)
  }

  const catOpts =
    categories.length > 0
      ? [{ label: '不指定', value: 0 }, ...categories.map((c) => ({ label: c.name, value: c.id }))]
      : [{ label: '（暂无分类）', value: 0 }]

  const catColumns = [catOpts]

  async function createRes() {
    const title = newTitle.trim()
    if (!title) {
      Toast.show({ content: '请输入标题' })
      return
    }
    const tags = newTags
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean)
    const body: Record<string, unknown> = { title }
    const u = newUrl.trim()
    if (u) body.url = u
    const c = newContent.trim()
    if (c) body.content = c
    const ty = newType.trim()
    if (ty) body.type = ty
    if (tags.length) body.tags = tags
    if (newCatId > 0) body.categoryId = newCatId
    await adminApi.post('/api/admin/resources', body)
    Toast.show({ icon: 'success', content: '资源已上线' })
    setNewTitle('')
    setNewUrl('')
    setNewType('')
    setNewTags('')
    setNewContent('')
    setNewCatId(0)
    setCreateExpanded(false)
    runSearch()
  }

  async function savePublished(row: PublishedRow) {
    const title = row.title.trim()
    if (!title) {
      Toast.show({ content: '请填写标题' })
      return
    }
    await adminApi.patch(`/api/admin/resources/published/${row.id}`, buildResourceUpdatePayload(row))
    Toast.show({ icon: 'success', content: '已保存' })
    setSearchTick((t) => t + 1)
  }

  async function saveDraft() {
    if (!draft) return
    await savePublished(draft)
    setDraft(null)
  }

  function deleteRow(row: PublishedRow) {
    Dialog.confirm({
      title: '提示',
      content: '确定删除该资源？将从检索中移除。',
      onConfirm: async () => {
        await adminApi.delete(`/api/admin/resources/published/${row.id}`)
        Toast.show({ icon: 'success', content: '已删除' })
        if (draft?.id === row.id) setDraft(null)
        setSearchTick((t) => t + 1)
      },
    })
  }

  const maxPage = Math.max(1, Math.ceil(total / pageSize))

  return (
    <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
      {!createExpanded ? (
        <Button
          block
          fill="outline"
          size="small"
          className="admin-published-create-expand"
          onClick={() => setCreateExpanded(true)}
        >
          展开新建资源
        </Button>
      ) : (
        <Card
          title="新建资源"
          extra={
            <Button size="mini" fill="none" color="primary" onClick={() => setCreateExpanded(false)}>
              隐藏
            </Button>
          }
          className="admin-published-create-card"
          headerStyle={{ paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)' }}
          bodyStyle={{ paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)' }}
        >
          <Space direction="vertical" block style={{ '--gap': 'var(--space-xs)' } as CSSProperties}>
            <Input
              className="admin-search-field"
              placeholder="标题（必填）"
              value={newTitle}
              onChange={setNewTitle}
              maxLength={200}
            />
            <div className="admin-form-row-2">
              <Input
                className="admin-search-field"
                placeholder="链接"
                value={newUrl}
                onChange={setNewUrl}
              />
              <Input
                className="admin-search-field"
                placeholder="类型"
                value={newType}
                onChange={setNewType}
              />
            </div>
            <Input
              className="admin-search-field"
              placeholder="标签，逗号分隔"
              value={newTags}
              onChange={setNewTags}
            />
            <div className="admin-published-create-category">
              <select
                className="admin-published-category-select"
                aria-label="选择分类"
                value={newCatId}
                onChange={(e) => setNewCatId(Number(e.target.value))}
              >
                {catOpts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <TextArea
              className="admin-published-body"
              placeholder="正文（可选）"
              value={newContent}
              onChange={setNewContent}
              rows={3}
              showCount
              maxLength={4000}
            />
            <Button color="primary" size="small" block onClick={() => void createRes()}>
              创建并上线
            </Button>
          </Space>
        </Card>
      )}

      <div className="panel-title" style={{ marginTop: 'var(--space-2xs)' }}>
        已上线列表
      </div>
      <div className="admin-search-inline">
        <Input
          className="admin-search-field"
          placeholder="关键词"
          value={keyword}
          onChange={setKeyword}
          onEnterPress={() => runSearch()}
        />
        <Button size="mini" onClick={() => runSearch()}>
          搜索
        </Button>
      </div>

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

      {loading && !list.length ? (
        <div className="center-pad">
          <SpinLoading style={{ fontSize: 'var(--size-icon-spin)' }} />
        </div>
      ) : list.length === 0 ? (
        <div className="muted small">暂无数据</div>
      ) : (
        <List className="admin-published-result-list" mode="card">
          {list.map((row) => (
            <List.Item
              key={row.id}
              title={<Ellipsis content={row.title} rows={2} />}
              description={
                <span className="admin-published-list-meta">
                  热度 {row.heatScore}
                  {' · '}
                  分类 {row.categoryName?.trim() ? row.categoryName : '—'}
                  {' · '}
                  标签 {row.tags?.trim() ? row.tags : '—'}
                </span>
              }
              extra={
                <Space style={{ '--gap': 'var(--space-2xs)' } as CSSProperties}>
                  <Button
                    size="mini"
                    fill="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDraft({ ...row })
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="mini"
                    color="danger"
                    fill="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRow(row)
                    }}
                  >
                    删除
                  </Button>
                </Space>
              }
            />
          ))}
        </List>
      )}

      <Popup
        visible={draft !== null}
        onMaskClick={() => setDraft(null)}
        onClose={() => setDraft(null)}
        position="bottom"
        showCloseButton
        destroyOnClose
        bodyStyle={{
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          paddingBottom: 0,
        }}
        bodyClassName="admin-published-edit-popup-body"
      >
        {draft ? (
          <AdminResourceFormCard
            variant="publishedEdit"
            cardTitle="编辑资源"
            metaLine={
              <>
                #{draft.id} · 热度 {draft.heatScore}
                {draft.categoryName?.trim() ? ` · ${draft.categoryName}` : ''}
              </>
            }
            values={draft}
            onChange={(patch) => setDraft((d) => (d ? { ...d, ...patch } : null))}
            catColumns={catColumns}
            actions={
              <Grid columns={2} gap={12} className="admin-published-edit-actions">
                <Grid.Item>
                  <Button block fill="outline" size="large" onClick={() => setDraft(null)}>
                    取消
                  </Button>
                </Grid.Item>
                <Grid.Item>
                  <Button block color="primary" size="large" onClick={() => void saveDraft()}>
                    保存
                  </Button>
                </Grid.Item>
              </Grid>
            }
          />
        ) : null}
      </Popup>
    </Space>
  )
}
