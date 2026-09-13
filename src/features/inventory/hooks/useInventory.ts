import { useCallback, useEffect, useState } from 'react';
import { InventoryDraft, InventoryItem } from '../domain/inventoryItem';

type Repository = {
  list: () => Promise<InventoryItem[]>;
  create: (draft: InventoryDraft) => Promise<InventoryItem>;
  update: (id: string, draft: InventoryDraft) => Promise<InventoryItem>;
  remove: (id: string) => Promise<void>;
};

export function useInventory(repository: Repository) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setItems(await repository.list()); } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر تحميل البيانات'); }
    finally { setLoading(false); }
  }, [repository]);

  useEffect(() => { void reload(); }, [reload]);

  async function save(id: string | undefined, draft: InventoryDraft) {
    setSaving(true); setError(null);
    try {
      const saved = id ? await repository.update(id, draft) : await repository.create(draft);
      setItems((current) => id ? current.map((item) => item.id === id ? saved : item) : [saved, ...current]);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حفظ السجل'); return false; }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    try { await repository.remove(id); setItems((current) => current.filter((item) => item.id !== id)); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'تعذر حذف السجل'); return false; }
  }

  return { items, loading, saving, error, reload, save, remove };
}
