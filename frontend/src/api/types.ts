export type SortBy = 'relevance' | 'time' | 'hot'

export interface SearchItem {
  id: number | null
  title: string | null
  type: string | null
  tags: string | null
  url: string | null
  highlight: string | null
  categoryName: string | null
  heatScore: number
}

export interface HotKeywordItem {
  keyword: string | null
  count: number
}

export interface HomeStatsResponse {
  totalResources: number
  hotKeywords: HotKeywordItem[]
}

export interface SiteConfigDto {
  siteTitle: string | null
  headerScript: string | null
  trackingEnabled: boolean
  trackingEvents: string[] | null
}

export interface CategoryDto {
  id: number
  name: string
  sortOrder: number
  createdAt: string
}

export interface PendingResourceDto {
  id: number
  title: string
  url: string | null
  content: string | null
  type: string | null
  tags: string | null
  categoryId: number | null
  createdAt: string
}

export interface AdminPendingPage {
  total: number
  items: PendingResourceDto[]
}

export interface AdminPublishedResourceDto {
  id: number
  title: string
  url: string | null
  type: string | null
  tags: string | null
  categoryId: number | null
  categoryName: string | null
  heatScore: number
  createdAt: string
  updatedAt: string
  content: string | null
}

export interface AdminPublishedPage {
  total: number
  items: AdminPublishedResourceDto[]
}

export interface PendingBlockedKeywordDto {
  id: number
  keyword: string
  createdAt: string
}

export interface ActiveBlockedKeywordDto {
  id: number
  keyword: string
  createdAt: string
}

export interface AdminAnalyticsOverviewDto {
  totalEvents: number
  homeView: number
  searchSubmit: number
  hotKeywordClick: number
  copyLinkClick: number
  submitResource: number
  submitBlockedKeyword: number
}

export interface AdminAnalyticsEventItemDto {
  id: number
  event: string
  path: string | null
  propsJson: string | null
  userAgent: string | null
  deviceId: string | null
  ipAddress: string | null
  createdAt: string
}

export interface AdminAnalyticsEventsPageDto {
  total: number
  items: AdminAnalyticsEventItemDto[]
}
