import { useEffect, useMemo, useState } from 'react';
import { InventoryForm } from '../features/inventory/components/InventoryForm';
import { InventoryList } from '../features/inventory/components/InventoryList';
import { inventoryRepository } from '../features/inventory/data/inventoryRepository';
import { InventoryItem } from '../features/inventory/domain/inventoryItem';
import { Worker } from '../features/inventory/domain/inventoryItem';
import { WorkersPanel } from '../features/inventory/components/WorkersPanel';
import { getCurrentUser, isAdmin, signIn, signOut } from '../features/inventory/data/inventoryRepository';
import { User } from '@supabase/supabase-js';
import { useInventory } from '../features/inventory/hooks/useInventory';
import { SearchBar } from '../shared/components/SearchBar';
import { Toast } from '../shared/components/Toast';
import { LoginPage } from '../features/inventory/components/LoginPage';

export default function App() {
  const inventory = useInventory(inventoryRepository);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workersOpen, setWorkersOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (inventory.error) setToast(inventory.error);
  }, [inventory.error]);

  useEffect(() => {
    if (!adminUser) return;
    void inventoryRepository.listWorkers().then(setWorkers).catch((cause) => setToast(cause instanceof Error ? cause.message : 'تعذر تحميل الموظفين'));
    void inventory.reload();
  }, [adminUser, inventory.reload]);

  useEffect(() => {
    void getCurrentUser().then(async (user) => { setAdminUser(user ?? null); setAdminAllowed(await isAdmin(user ?? null)); }).catch((cause) => setAuthError(cause instanceof Error ? cause.message : 'تعذر التحقق من جلسة الدخول')).finally(() => setAuthLoading(false));
  }, []);

  async function handleLogin(username: string, password: string) {
    setLoginLoading(true);
    setAuthError(null);
    try {
      const user = await signIn(username, password);
      setAdminUser(user);
      setAdminAllowed(await isAdmin(user));
    } catch (cause) {
      setAuthError(cause instanceof Error ? cause.message : 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    setAdminUser(null);
    setAdminAllowed(false);
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return inventory.items;
    return inventory.items.filter((item) =>
      `${item.shirtNumber} ${item.employeeNumber ?? ''} ${item.personName} ${item.notes ?? ''}`
        .toLocaleLowerCase()
        .includes(query)
    );
  }, [inventory.items, search]);

  if (authLoading) return <main className="auth-page"><div className="auth-card auth-loading">جاري التحميل...</div></main>;
  if (!adminUser) return <LoginPage loading={loginLoading} error={authError} onLogin={handleLogin} />;

  async function handleDelete(item: InventoryItem) {
    if (!window.confirm(`هل تريد حذف سجل ${item.personName}؟`)) return;
    const deleted = await inventory.remove(item.id);
    if (deleted) setToast('تم حذف السجل');
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Triumph White Sands</p>
          <h1>laundry</h1>
          {adminUser && <p className="signed-in-user">مسجل الدخول: {adminUser.user_metadata?.username || adminUser.user_metadata?.name || adminUser.email}</p>}
        </div>
        <button className="primary-button" onClick={() => { setEditing(null); setFormOpen(true); }}>
          + إضافة سجل
        </button>
        <div className="topbar-actions">{adminAllowed && <button className="secondary-button" onClick={() => setWorkersOpen(true)}>موظفين استلام الملابس</button>}<button className="secondary-button" onClick={() => void handleLogout()}>خروج</button></div>
      </header>

      <section className="summary-grid">
        <div className="summary-card accent"><span>إجمالي السجلات</span><strong>{filteredItems.length}</strong></div>
      </section>

      <section className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <button className="secondary-button" onClick={inventory.reload} disabled={inventory.loading}>↻ تحديث</button>
      </section>

      {inventory.loading && !inventory.items.length ? <div className="state-card">جاري تحميل السجلات...</div> : null}
      {!inventory.loading && !filteredItems.length ? <div className="state-card"><strong>لا توجد سجلات</strong><span>أضف أول تيشرت من الزر أعلاه.</span></div> : null}
      <InventoryList items={filteredItems} canManage={adminAllowed} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDelete={handleDelete} />

      {formOpen && (
        <InventoryForm
          item={editing}
          workers={workers}
          saving={inventory.saving}
          onClose={() => setFormOpen(false)}
          onSubmit={async (draft) => {
            const saved = await inventory.save(editing?.id, draft);
            if (saved) { setFormOpen(false); setToast(editing ? 'تم تعديل السجل' : 'تمت إضافة السجل'); }
          }}
        />
      )}
      {workersOpen && <WorkersPanel workers={workers} onClose={() => setWorkersOpen(false)} onAdd={async (worker) => { try { const saved = await inventoryRepository.createWorker(worker); setWorkers((current) => [...current, saved].sort((a, b) => a.employeeNumber.localeCompare(b.employeeNumber))); setToast('تمت إضافة الموظف'); } catch (cause) { setToast(cause instanceof Error ? cause.message : 'تعذر إضافة الموظف'); } }} onUpdate={async (id, worker) => { try { const saved = await inventoryRepository.updateWorker(id, worker); setWorkers((current) => current.map((item) => item.id === id ? saved : item)); setToast('تم تحديث بيانات الموظف'); } catch (cause) { setToast(cause instanceof Error ? cause.message : 'تعذر تحديث الموظف'); } }} onDelete={async (id) => { try { await inventoryRepository.deleteWorker(id); setWorkers((current) => current.filter((worker) => worker.id !== id)); setToast('تم حذف الموظف'); } catch (cause) { setToast(cause instanceof Error ? cause.message : 'تعذر حذف الموظف'); } }} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
