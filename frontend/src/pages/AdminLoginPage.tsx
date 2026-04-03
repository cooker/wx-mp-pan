import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Card, Input, NavBar } from 'antd-mobile'

export default function AdminLoginPage() {
  const [sp] = useSearchParams()
  const err = sp.get('error')
  const logout = sp.get('logout')

  const banner = useMemo(() => {
    if (logout != null) return { type: 'ok' as const, text: '已退出登录。' }
    if (err != null)
      return { type: 'err' as const, text: '账号或密码不正确，请检查后重试。' }
    return null
  }, [err, logout])

  return (
    <div className="page-login">
      <NavBar back={null}>管理后台</NavBar>
      <div className="page-body">
        <Card title="登录" bodyStyle={{ padding: 'var(--space-lg)' }}>
          {banner && (
            <div
              className={banner.type === 'ok' ? 'banner-ok' : 'banner-err'}
              style={{ marginBottom: 'var(--space-md)' }}
            >
              {banner.text}
            </div>
          )}
          <form className="native-form" action="/admin/perform_login" method="post" autoComplete="on">
            <label className="native-label" htmlFor="adm-user">
              账号
            </label>
            <Input
              id="adm-user"
              name="username"
              placeholder="账号"
              defaultValue=""
              type="text"
              autoComplete="username"
              autoCapitalize="off"
            />
            <label className="native-label" htmlFor="adm-pass">
              密码
            </label>
            <Input
              id="adm-pass"
              name="password"
              placeholder="密码"
              defaultValue=""
              type="password"
              autoComplete="current-password"
            />
            <Button block color="primary" type="submit" style={{ marginTop: 'var(--space-md)' }}>
              登录
            </Button>
          </form>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <a href="/">返回首页</a>
          </div>
        </Card>
      </div>
    </div>
  )
}
