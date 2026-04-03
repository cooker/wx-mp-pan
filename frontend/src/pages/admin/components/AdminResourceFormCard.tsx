import { useMemo, type ReactNode } from 'react'
import { Card, Divider, Input, List, SafeArea, Space, TextArea } from 'antd-mobile'
import type { PickerColumn } from 'antd-mobile/es/components/picker'

function labelToString(label: ReactNode): string {
  if (typeof label === 'string' || typeof label === 'number') return String(label)
  return '—'
}

/** 从 Picker 列结构解析分类选项（与新建资源 catOpts 一致） */
function categoryOptionsFromColumns(columns: PickerColumn[]): { label: string; value: number }[] {
  const col = columns[0] ?? []
  const out: { label: string; value: number }[] = []
  for (const item of col) {
    if (typeof item === 'string') continue
    const v = item.value
    const num = typeof v === 'number' ? v : Number.parseInt(String(v), 10)
    if (!Number.isFinite(num)) continue
    out.push({ label: labelToString(item.label), value: num })
  }
  return out.length > 0 ? out : [{ label: '（暂无分类）', value: 0 }]
}

export type ResourceFormValues = {
  title: string
  url: string
  type: string
  tags: string
  content: string
  categoryId: number
}

type Props = {
  cardTitle: ReactNode
  /** 只读元信息行，如提交时间、热度 */
  metaLine?: ReactNode
  /** 元信息行左侧标签，默认「信息」 */
  metaLabel?: string
  /**
   * default：卡片 + 传统表单行（适合非弹层）
   * pending：待审卡片 + List
   * publishedEdit：仅用于底部弹层，无外层 Card，List mode=card + 顶栏说明
   */
  variant?: 'default' | 'pending' | 'publishedEdit'
  values: ResourceFormValues
  onChange: (patch: Partial<ResourceFormValues>) => void
  catColumns: PickerColumn[]
  actions: ReactNode
}

export function AdminResourceFormCard({
  cardTitle,
  metaLine,
  metaLabel = '信息',
  variant = 'default',
  values,
  onChange,
  catColumns,
  actions,
}: Props) {
  const categoryOptions = useMemo(() => categoryOptionsFromColumns(catColumns), [catColumns])

  const categorySelect = (
    <div className="admin-published-create-category">
      <select
        className="admin-published-category-select"
        aria-label="选择分类"
        value={values.categoryId}
        onChange={(e) => onChange({ categoryId: Number(e.target.value) })}
      >
        {categoryOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )

  const formListCore = (
    <>
      <List.Item title="标题">
        <Input
          className="admin-search-field"
          placeholder="标题（必填）"
          value={values.title}
          onChange={(v) => onChange({ title: v })}
          maxLength={200}
        />
      </List.Item>
      <List.Item title="链接与类型">
        <Space direction="vertical" block style={{ width: '100%', '--gap': 'var(--space-xs)' }}>
          <Input
            className="admin-search-field"
            placeholder="链接"
            value={values.url}
            onChange={(v) => onChange({ url: v })}
          />
          <Input
            className="admin-search-field"
            placeholder="类型"
            value={values.type}
            onChange={(v) => onChange({ type: v })}
          />
        </Space>
      </List.Item>
      <List.Item title="标签">
        <Input
          className="admin-search-field"
          placeholder="标签，逗号分隔"
          value={values.tags}
          onChange={(v) => onChange({ tags: v })}
        />
      </List.Item>
      <List.Item title="分类">{categorySelect}</List.Item>
      <List.Item title="正文">
        <TextArea
          className="admin-published-body"
          placeholder="正文（可选）"
          value={values.content}
          onChange={(v) => onChange({ content: v })}
          rows={4}
          showCount
          maxLength={4000}
        />
      </List.Item>
    </>
  )

  if (variant === 'publishedEdit') {
    return (
      <div className="admin-published-edit-sheet">
        <div className="admin-published-edit-sheet-head">
          <div className="admin-published-edit-sheet-title">{cardTitle}</div>
          {metaLine ? <div className="admin-published-edit-sheet-meta muted small">{metaLine}</div> : null}
        </div>
        <List mode="card" className="admin-published-edit-form-list">
          {formListCore}
        </List>
        <Divider className="admin-published-edit-divider" />
        <div className="admin-published-edit-footer">
          {actions}
          <SafeArea position="bottom" />
        </div>
      </div>
    )
  }

  const cardClass =
    variant === 'pending'
      ? 'admin-resource-form-card admin-resource-form-card--pending'
      : 'admin-resource-form-card'

  const headerStyle =
    variant === 'pending'
      ? {
          paddingTop: 'var(--space-sm)',
          paddingBottom: 'var(--space-sm)',
        }
      : { paddingTop: 'var(--space-xs)', paddingBottom: 'var(--space-xs)' }

  const bodyStyle =
    variant === 'pending'
      ? {
          paddingTop: 'var(--space-md)',
          paddingBottom: 'var(--space-md)',
        }
      : { paddingTop: 'var(--space-sm)', paddingBottom: 'var(--space-sm)' }

  const pendingFormBody = (
    <>
      <List className="admin-pending-form-list">
        {metaLine ? (
          <List.Item title={metaLabel} extra={<span className="muted small">{metaLine}</span>} />
        ) : null}
        {formListCore}
      </List>
      <Divider className="admin-pending-form-divider" />
      <div className="admin-pending-form-actions">{actions}</div>
    </>
  )

  const defaultFormBody = (
    <div className="admin-resource-form">
      {metaLine ? (
        <div className="admin-resource-field admin-resource-meta-row">
          <span className="admin-resource-label">{metaLabel}</span>
          <div className="admin-resource-value muted small">{metaLine}</div>
        </div>
      ) : null}

      <div className="admin-resource-field admin-resource-field--block">
        <span className="admin-resource-label">标题</span>
        <Input
          className="admin-search-field"
          placeholder="标题（必填）"
          value={values.title}
          onChange={(v) => onChange({ title: v })}
          maxLength={200}
        />
      </div>

      <div className="admin-form-row-2">
        <Input
          className="admin-search-field admin-form-row-2__cell"
          placeholder="链接"
          value={values.url}
          onChange={(v) => onChange({ url: v })}
        />
        <Input
          className="admin-search-field admin-form-row-2__cell"
          placeholder="类型"
          value={values.type}
          onChange={(v) => onChange({ type: v })}
        />
      </div>

      <div className="admin-resource-field admin-resource-field--block">
        <span className="admin-resource-label">标签</span>
        <Input
          className="admin-search-field"
          placeholder="标签，逗号分隔"
          value={values.tags}
          onChange={(v) => onChange({ tags: v })}
        />
      </div>

      <div className="admin-resource-field admin-resource-field--block">
        <span className="admin-resource-label">分类</span>
        {categorySelect}
      </div>

      <div className="admin-resource-field admin-resource-field--block">
        <span className="admin-resource-label">正文</span>
        <TextArea
          className="admin-published-body"
          placeholder="正文（可选）"
          value={values.content}
          onChange={(v) => onChange({ content: v })}
          rows={4}
          showCount
          maxLength={4000}
        />
      </div>

      <div className="admin-resource-actions">{actions}</div>
    </div>
  )

  return (
    <Card
      className={cardClass}
      title={<span className="admin-resource-form-card-title">{cardTitle}</span>}
      headerStyle={headerStyle}
      bodyStyle={bodyStyle}
    >
      {variant === 'pending' ? pendingFormBody : defaultFormBody}
    </Card>
  )
}

export function buildResourceUpdatePayload(values: ResourceFormValues) {
  const title = values.title.trim()
  const url = values.url.trim()
  const type = values.type.trim()
  const tags = values.tags.trim()
  return {
    title,
    content: values.content ?? '',
    type: type ? type : null,
    tags: tags ? tags : null,
    url,
    categoryId: values.categoryId > 0 ? values.categoryId : null,
  }
}
