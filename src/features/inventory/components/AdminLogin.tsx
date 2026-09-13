import { FormEvent, useState } from 'react';

interface Props {
  loading: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AdminLogin({ loading, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    await onLogin(email.trim(), password);
  }
  return <div className="modal-backdrop"><form className="modal login-modal" onSubmit={submit}><h2>دخول الأدمن</h2><p>سجّل الدخول للوصول إلى إدارة موظفي استلام الملابس.</p><label>اسم المستخدم<input type="text" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="اكتب اسم المستخدم فقط" required /></label><label>كلمة المرور<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button className="primary-button full" disabled={loading}>{loading ? 'جاري الدخول...' : 'دخول'}</button></form></div>;
}
