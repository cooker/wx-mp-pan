import type { ReactNode } from 'react'
import { Card, Empty, Swiper } from 'antd-mobile'

export type AdminSwiperSlide = {
  key: string | number
  content: ReactNode
}

type Props = {
  slides: AdminSwiperSlide[]
  emptyDescription?: string
}

export function AdminListSwiper({ slides, emptyDescription = '暂无数据' }: Props) {
  if (slides.length === 0) {
    return <Empty description={emptyDescription} />
  }
  const n = slides.length
  return (
    <Swiper
      className="admin-list-swiper"
      loop={n > 1}
      indicator={n > 1 ? undefined : false}
      style={{ '--width': '100%', '--height': 'auto' }}
      slideSize={100}
      stuckAtBoundary
    >
      {slides.map((s) => (
        <Swiper.Item key={s.key}>
          <Card className="admin-swiper-card" bodyStyle={{ padding: 'var(--space-md)' }}>
            {s.content}
          </Card>
        </Swiper.Item>
      ))}
    </Swiper>
  )
}
