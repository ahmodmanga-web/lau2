import { FormEvent, useState } from 'react';

interface Props {
  loading: boolean;
  error: string | null;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function LoginPage({ loading, error, onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onLogin(username.trim(), password);
  }

  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><div className="auth-brand">TWS</div><p className="eyebrow">Triumph White Sands</p><h1>تسجيل الدخول</h1><p className="auth-subtitle">سجّل الدخول للوصول إلى برنامج استلام الملابس.</p><label>اسم المستخدم<input type="text" autoComplete="username" placeholder="اكتب اسم المستخدم" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>كلمة المرور<input type="password" autoComplete="current-password" placeholder="اكتب كلمة المرور" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="auth-error">{error}</p>}<button className="primary-button full" disabled={loading}>{loading ? 'جاري تسجيل الدخول...' : 'دخول'}</button></form></main>;
}
