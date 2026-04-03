import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '@/api/client'
import type { SiteConfigDto } from '@/api/types'
import { injectHeadFragment } from '@/lib/headInjection'
import { buildTracker } from '@/lib/tracking'

type Ctx = {
  config: SiteConfigDto | null
  loading: boolean
  refresh: () => Promise<void>
  track: (event: string, props?: Record<string, unknown>) => void
}

const SiteConfigContext = createContext<Ctx | null>(null)

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfigDto | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<SiteConfigDto>('/api/site/config')
      const c = res.data
      setConfig(c)
      const t = (c.siteTitle != null ? String(c.siteTitle).trim() : '') || '资源检索系统'
      document.title = t
      injectHeadFragment(c.headerScript)
    } catch {
      setConfig(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const tracker = useMemo(() => buildTracker(config), [config])
  const track = tracker.track

  const value = useMemo(
    () => ({ config, loading, refresh, track }),
    [config, loading, refresh, track]
  )

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext)
  if (!ctx) throw new Error('useSiteConfig must be used within SiteConfigProvider')
  return ctx
}
