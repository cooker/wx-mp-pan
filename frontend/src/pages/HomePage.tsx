import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Dialog,
  Input,
  List,
  NavBar,
  Picker,
  Popup,
  Space,
  Toast,
} from 'antd-mobile'
import { api } from '@/api/client'
import type { HomeStatsResponse, SearchItem, SortBy } from '@/api/types'
import { useSiteConfig } from '@/context/SiteConfigContext'

const SORT_PICKER_COLUMNS = [
  [
    { label: '时间', value: 'time' },
    { label: '热度', value: 'hot' },
  ],
]

/** FTS snippet 可能含 `<em>`，用 React 节点渲染，避免 `dangerouslySetInnerHTML`。 */
function serpSnippetContent(html: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /<em>([\s\S]*?)<\/em>/gi
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      nodes.push(html.slice(last, m.index))
    }
    nodes.push(
      <mark key={k++} className="serp-snippet-em">
        {m[1]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  if (last < html.length) {
    nodes.push(html.slice(last))
  }
  return nodes.length ? nodes : [html]
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallthrough */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function SerpBlock({
  item,
  onCopy,
}: {
  item: SearchItem
  onCopy: (item: SearchItem) => void
}) {
  const summary = (item.highlight || '').trim() || '暂无匹配摘要'
  const rawUrl = item.url != null ? String(item.url).trim() : ''
  const title = item.title || '（无标题）'
  const isHttp = /^https?:\/\//i.test(rawUrl)

  function onTitleActivate() {
    if (rawUrl && isHttp) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (rawUrl) void onCopy(item)
  }

  const displayUrl =
    rawUrl.length > 56 ? `${rawUrl.slice(0, 54)}…` : rawUrl || null

  const titleAria =
    !rawUrl
      ? undefined
      : isHttp
        ? '在新窗口打开链接'
        : '复制链接或口令到剪贴板'

  return (
    <article className="serp-item">
      <h2 className="serp-title-line">
        {rawUrl ? (
          <button
            type="button"
            className="serp-title"
            aria-label={titleAria}
            onClick={onTitleActivate}
          >
            {title}
          </button>
        ) : (
          <span className="serp-title serp-title--static">{title}</span>
        )}
      </h2>
      {rawUrl && !isHttp ? (
        <p className="serp-title-hint">非网页链接：点标题与「复制链接」均可复制</p>
      ) : null}
      {displayUrl ? (
        <div className="serp-url-line tabular-nums" title={rawUrl}>
          {displayUrl}
        </div>
      ) : null}
      <p className="serp-snippet">{serpSnippetContent(summary)}</p>
      <div className="serp-meta">
        <div className="serp-meta-left">
          {item.categoryName ? (
            <span className="serp-chip serp-chip--category">{item.categoryName}</span>
          ) : null}
          {item.tags ? (
            <span className="serp-chip serp-chip--tags" title={item.tags}>
              {item.tags}
            </span>
          ) : null}
          <span className="serp-heat tabular-nums" aria-label={`热度 ${item.heatScore ?? 0}`}>
            热度 {item.heatScore ?? 0}
          </span>
        </div>
        {rawUrl ? (
          <button
            type="button"
            className="serp-copy"
            aria-label={`复制「${title}」的链接或口令`}
            onClick={() => void onCopy(item)}
          >
            复制链接
          </button>
        ) : (
          <span
            className="serp-copy-disabled"
            title="该条未填写链接或口令"
            aria-label="无可复制：该条未填写链接或口令"
          >
            无可复制
          </span>
        )}
      </div>
    </article>
  )
}

const DISCLAIMER_SECRET_WINDOW_MS = 3000
const DISCLAIMER_SECRET_DBLCLICKS = 5

export default function HomePage() {
  const navigate = useNavigate()
  const { config, loading: cfgLoading, track } = useSiteConfig()
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('hot')
  const [searching, setSearching] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [items, setItems] = useState<SearchItem[]>([])
  const [stats, setStats] = useState<HomeStatsResponse | null>(null)

  const [actionsDrawerVisible, setActionsDrawerVisible] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [blockKw, setBlockKw] = useState('')

  const disclaimerDblTimesRef = useRef<number[]>([])

  const onDisclaimerSecretDblClick = useCallback(() => {
    const now = Date.now()
    const w = DISCLAIMER_SECRET_WINDOW_MS
    const arr = disclaimerDblTimesRef.current.filter((t) => now - t <= w)
    arr.push(now)
    disclaimerDblTimesRef.current = arr
    if (arr.length < DISCLAIMER_SECRET_DBLCLICKS) return
    const last = arr.slice(-DISCLAIMER_SECRET_DBLCLICKS)
    if (last[last.length - 1] - last[0] <= w) {
      disclaimerDblTimesRef.current = []
      navigate('/admin/login')
    }
  }, [navigate])

  const homeTracked = useRef(false)
  useEffect(() => {
    if (cfgLoading || homeTracked.current) return
    track('home_view')
    homeTracked.current = true
  }, [cfgLoading, track])

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get<HomeStatsResponse>('/api/home/stats')
        setStats(res.data)
      } catch {
        setStats(null)
      }
    })()
  }, [])

  const displayTitle =
    (config?.siteTitle != null && String(config.siteTitle).trim()) || '资源检索系统'

  async function runSearch(kw: string, sort: SortBy) {
    const k = kw.trim()
    if (!k) {
      Toast.show({ content: '请先输入取件码或关键词' })
      return
    }
    setSearching(true)
    setTotal(null)
    setItems([])
    track('search_submit', { keywordLength: k.length, sortBy: sort })
    try {
      const res = await api.post('/api/search', {
        keyword: k,
        page: 0,
        size: 10,
        sortBy: sort,
      })
      const data = res.data as { total?: number; items?: SearchItem[] }
      setTotal(typeof data.total === 'number' ? data.total : 0)
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch {
      Toast.show({ icon: 'fail', content: '搜索未成功，请检查网络后重试' })
    } finally {
      setSearching(false)
    }
  }

  async function onCopyLink(item: SearchItem) {
    const url = item.url != null ? String(item.url).trim() : ''
    if (!url) {
      Toast.show({ content: '该条没有可复制的内容' })
      return
    }
    track('copy_link_click')
    const ok = await copyToClipboard(url)
    Toast.show({
      icon: ok ? 'success' : 'fail',
      content: ok ? '已复制到剪贴板' : '复制失败，请长按链接手动复制',
    })
    if (ok && item.id != null) {
      try {
        await api.post(`/api/resources/${encodeURIComponent(String(item.id))}/heat`)
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, heatScore: (it.heatScore ?? 0) + 1 } : it
          )
        )
      } catch {
        /* ignore */
      }
    }
  }

  async function submitResource() {
    const title = resTitle.trim()
    if (!title) {
      Toast.show({ content: '请填写资源标题' })
      return
    }
    try {
      await api.post('/api/resources', { title, url: resUrl.trim() || undefined })
      Toast.show({ icon: 'success', content: '已提交，审核通过后会出现在搜索结果中。' })
      track('submit_resource')
      setResTitle('')
      setResUrl('')
      setSubmitOpen(false)
    } catch (e: unknown) {
      const ax = e as { response?: { data?: unknown } }
      const t =
        typeof ax.response?.data === 'string'
          ? ax.response.data
          : '提交失败'
      Toast.show({ icon: 'fail', content: t })
    }
  }

  async function submitBlockWord() {
    const kw = blockKw.trim()
    if (!kw) {
      Toast.show({ content: '请填写要屏蔽的词或短语' })
      return
    }
    try {
      const res = await api.post('/api/blocked-keywords', { keyword: kw })
      if (res.status === 409) {
        Toast.show({ content: '该屏蔽词已存在。' })
        return
      }
      Toast.show({ icon: 'success', content: '已提交审核，通过后将在检索中生效。' })
      track('submit_blocked_keyword')
      setBlockKw('')
      setBlockOpen(false)
    } catch (e: unknown) {
      const ax = e as { response?: { data?: unknown } }
      const t =
        typeof ax.response?.data === 'string'
          ? ax.response.data
          : '添加失败'
      Toast.show({ icon: 'fail', content: t })
    }
  }

  return (
    <div className="page-home page-home--baidu">
      <NavBar
        back={null}
        className="serp-nav"
        right={
          <button
            type="button"
            className="serp-nav-more-trigger"
            aria-expanded={actionsDrawerVisible}
            aria-controls="serp-actions-drawer"
            onClick={() => setActionsDrawerVisible(true)}
          >
            <svg
              className="serp-nav-more-trigger__icon"
              width={20}
              height={20}
              viewBox="0 0 24 24"
              aria-hidden
              focusable={false}
            >
              <circle cx={12} cy={6.5} r={1.75} fill="currentColor" />
              <circle cx={12} cy={12} r={1.75} fill="currentColor" />
              <circle cx={12} cy={17.5} r={1.75} fill="currentColor" />
            </svg>
          </button>
        }
      >
        {displayTitle}
      </NavBar>

      <main className="serp-scroll" aria-busy={searching} id="main-content">
        <div className="page-body serp-page-body">
          <div className="serp-main-stack">
            <div className="serp-hero">
              <p className="serp-hint serp-hint--lead">
                输入取件码或关键词，点「搜索」查找。
              </p>
              <Card className="serp-card serp-card--search serp-card--primary" title={null}>
                <div className="serp-search-row">
                  <div className="serp-search-input-wrap">
                    <Input
                      placeholder="取件码或关键词"
                      value={keyword}
                      onChange={setKeyword}
                      clearable
                      className="serp-input"
                      enterKeyHint="search"
                      onEnterPress={() => void runSearch(keyword, sortBy)}
                      aria-label="取件码或关键词"
                    />
                  </div>
                  <Picker
                    columns={SORT_PICKER_COLUMNS}
                    value={[sortBy]}
                    title="排序方式"
                    onConfirm={(v) => {
                      const next = v[0] as SortBy
                      setSortBy(next)
                      const k = keyword.trim()
                      if (k) void runSearch(k, next)
                    }}
                  >
                    {(items, actions) => (
                      <button
                        type="button"
                        className="serp-sort-trigger"
                        onClick={() => actions.open()}
                        aria-label={`排序方式，当前：${items[0]?.label ?? ''}`}
                      >
                        <span className="serp-sort-trigger__text">{items[0]?.label}</span>
                        <span className="serp-sort-trigger__caret" aria-hidden>
                          ▾
                        </span>
                      </button>
                    )}
                  </Picker>
                  <Button
                    size="middle"
                    color="primary"
                    loading={searching}
                    className="serp-search-btn serp-search-btn--row"
                    onClick={() => void runSearch(keyword, sortBy)}
                  >
                    搜索
                  </Button>
                </div>
              </Card>
            </div>

            {stats && typeof stats.totalResources === 'number' && (
              <Card className="serp-card serp-card--stats serp-card--secondary" title={null}>
                <div className="serp-stats-line tabular-nums">
                  收录 <strong>{stats.totalResources}</strong> 条
                </div>
                {stats.hotKeywords?.length ? (
                  <>
                    <div className="serp-hot-label">热门</div>
                    <div className="serp-hot-tags">
                      {stats.hotKeywords.map((h, i) => {
                        const k = h.keyword != null ? String(h.keyword) : ''
                        if (!k) return null
                        return (
                          <button
                            key={`${k}-${i}`}
                            type="button"
                            className="serp-hot-tag tabular-nums"
                            aria-label={`用「${k}」搜索`}
                            onClick={() => {
                              setKeyword(k)
                              track('hot_keyword_click', { keyword: k })
                              void runSearch(k, sortBy)
                            }}
                          >
                            {k}
                            <span className="serp-hot-count">{h.count ?? 0}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="serp-hot-empty">暂无热门词，多搜几次后会出现在这里</div>
                )}
              </Card>
            )}

            <div className="serp-results-region">
            {searching && keyword.trim() ? (
              <div className="serp-loading" role="status" aria-live="polite">
                <span className="visually-hidden">正在搜索</span>
                <div className="serp-skeleton" aria-hidden>
                  <div className="serp-skeleton-line serp-skeleton-line--title" />
                  <div className="serp-skeleton-line serp-skeleton-line--url" />
                  <div className="serp-skeleton-line serp-skeleton-line--body" />
                  <div className="serp-skeleton-line serp-skeleton-line--body short" />
                </div>
              </div>
            ) : null}

            {total !== null && !searching && (
              <div className="serp-result-bar tabular-nums">
                共 <strong>{total}</strong> 条结果（按当前排序）
              </div>
            )}

            {!items.length && total !== null && total === 0 && !searching && (
              <div className="serp-empty">
                未找到与「{keyword.trim()}」匹配的记录，可换个词或检查取件码后再试。
              </div>
            )}

            {items.length > 0 && !searching && (
              <section className="serp-list" aria-label="搜索结果">
                {items.map((it) => (
                  <SerpBlock key={String(it.id ?? it.title)} item={it} onCopy={onCopyLink} />
                ))}
              </section>
            )}
            </div>
          </div>
        </div>
      </main>

      <footer className="serp-disclaimer-fixed" role="contentinfo">
        <div
          className="serp-disclaimer-inner"
          onDoubleClick={onDisclaimerSecretDblClick}
        >
          免责声明：本站不存储、不生成资源内容。展示信息由网友提交，如有侵权请联系删除。投诉路径：点右上角菜单，选「添加屏蔽词」。
        </div>
      </footer>

      <Popup
        visible={actionsDrawerVisible}
        onClose={() => setActionsDrawerVisible(false)}
        position="right"
        showCloseButton
        closeOnMaskClick
        bodyClassName="serp-actions-drawer-body"
        bodyStyle={{
          width: 'min(18rem, 85vw)',
          height: '100%',
          maxHeight: '100dvh',
        }}
      >
        <div className="serp-actions-drawer" id="serp-actions-drawer">
          <List className="serp-actions-drawer__list">
            <List.Item
              clickable
              onClick={() => {
                setActionsDrawerVisible(false)
                setSubmitOpen(true)
              }}
            >
              提交资源
            </List.Item>
            <List.Item
              clickable
              onClick={() => {
                setActionsDrawerVisible(false)
                setBlockOpen(true)
              }}
            >
              添加屏蔽词
            </List.Item>
          </List>
        </div>
      </Popup>

      <Dialog
        visible={submitOpen}
        title="提交资源"
        content={
          <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
            <Input
              placeholder="标题（必填）"
              value={resTitle}
              onChange={setResTitle}
              maxLength={500}
              aria-label="资源标题"
              enterKeyHint="next"
            />
            <Input
              placeholder="链接或取件口令（选填）"
              value={resUrl}
              onChange={setResUrl}
              aria-label="链接或取件口令"
              enterKeyHint="done"
              onEnterPress={() => void submitResource()}
            />
          </Space>
        }
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setSubmitOpen(false),
          },
          {
            key: 'ok',
            text: '提交',
            bold: true,
            onClick: () => void submitResource(),
          },
        ]}
        onClose={() => setSubmitOpen(false)}
      />

      <Dialog
        visible={blockOpen}
        title="添加屏蔽词"
        content={
          <Space direction="vertical" block style={{ '--gap': 'var(--space-md)' } as CSSProperties}>
            <p className="dialog-hint">
              提交后需管理员审核。通过后，含该词的条目将不再出现在搜索结果中（查标题、正文与标签）。
            </p>
            <Input
              placeholder="要屏蔽的词或短语"
              value={blockKw}
              onChange={setBlockKw}
              aria-label="要屏蔽的词或短语"
              enterKeyHint="done"
              onEnterPress={() => void submitBlockWord()}
            />
          </Space>
        }
        actions={[
          {
            key: 'cancel',
            text: '取消',
            onClick: () => setBlockOpen(false),
          },
          {
            key: 'ok',
            text: '添加',
            bold: true,
            onClick: () => void submitBlockWord(),
          },
        ]}
        onClose={() => setBlockOpen(false)}
      />
    </div>
  )
}
