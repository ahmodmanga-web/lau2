import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { InventoryDraft, InventoryItem, Worker } from '../domain/inventoryItem';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = url && key ? createClient(url, key) : null;
export type AuthUser = User;

type Row = {
  id: string; shirt_number: string; person_name: string; worker_id: string | null; employee_number: string | null; created_by_name: string | null; notes: string | null; image_url: string | null;
  created_at: string; updated_at: string;
  workers?: { employee_number: string; name: string } | null;
};

function mapRow(row: Row): InventoryItem {
  return { id: row.id, shirtNumber: row.shirt_number, personName: row.workers?.name ?? row.person_name, workerId: row.worker_id, employeeNumber: row.workers?.employee_number ?? row.employee_number, createdByName: row.created_by_name, notes: row.notes, imageUrl: row.image_url, createdAt: row.created_at, updatedAt: row.updated_at };
}

function requireClient() {
  if (!supabase) throw new Error('أضف بيانات Supabase في ملف .env.local ثم أعد تشغيل التطبيق.');
  return supabase;
}

export async function getCurrentUser() {
  const client = requireClient();
  const { data, error } = await client.auth.getUser();
  if (error && error.message !== 'Auth session missing!') throw error;
  return data.user;
}

export async function signIn(email: string, password: string) {
  const loginEmail = email.includes('@') ? email : `${email.toLowerCase()}@inventory.local`;
  const { data, error } = await requireClient().auth.signInWithPassword({ email: loginEmail, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await requireClient().auth.signOut();
  if (error) throw error;
}

export async function isAdmin(user: AuthUser | null) {
  if (!user) return false;
  const { data, error } = await requireClient().from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export const inventoryRepository = {
  async list() {
    const { data, error } = await requireClient().from('tshirt_inventory').select('*, workers(employee_number,name)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Row[]).map(mapRow);
  },
  async create(draft: InventoryDraft) {
    const client = requireClient();
    const imageUrl = await uploadImage(client, draft.imageFile);
    const user = await getCurrentUser();
    const createdByName = user?.user_metadata?.username || user?.user_metadata?.name || user?.email || 'مستخدم';
    const { data, error } = await client.from('tshirt_inventory').insert({ shirt_number: draft.shirtNumber, worker_id: draft.workerId, created_by_name: createdByName, notes: draft.notes, image_url: imageUrl }).select('*, workers(employee_number,name)').single();
    if (error) throw error;
    return mapRow(data as Row);
  },
  async update(id: string, draft: InventoryDraft) {
    const client = requireClient();
    const imageUrl = await uploadImage(client, draft.imageFile);
    const { data, error } = await client.from('tshirt_inventory').update({ shirt_number: draft.shirtNumber, worker_id: draft.workerId, notes: draft.notes, ...(imageUrl ? { image_url: imageUrl } : {}) }).eq('id', id).select('*, workers(employee_number,name)').single();
    if (error) throw error;
    return mapRow(data as Row);
  },
  async remove(id: string) {
    const { error } = await requireClient().from('tshirt_inventory').delete().eq('id', id);
    if (error) throw error;
  }
  ,
  async listWorkers() {
    const { data, error } = await requireClient().from('workers').select('id, employee_number, name, shirt_count').order('employee_number');
    if (error) throw error;
    return (data as { id: string; employee_number: string; name: string; shirt_count: number }[]).map((row): Worker => ({ id: row.id, employeeNumber: row.employee_number, name: row.name, shirtCount: row.shirt_count }));
  },
  async createWorker(worker: Omit<Worker, 'id'>) {
    const { data, error } = await requireClient().from('workers').insert({ employee_number: worker.employeeNumber, name: worker.name, shirt_count: worker.shirtCount }).select().single();
    if (error) {
      if (error.code === '23505') throw new Error('رقم الموظف مستخدم بالفعل، اكتب رقمًا مختلفًا.');
      throw error;
    }
    return { id: data.id, employeeNumber: data.employee_number, name: data.name, shirtCount: data.shirt_count } as Worker;
  },
  async updateWorker(id: string, worker: Omit<Worker, 'id'>) {
    const { data, error } = await requireClient().from('workers').update({ employee_number: worker.employeeNumber, name: worker.name, shirt_count: worker.shirtCount }).eq('id', id).select().single();
    if (error) {
      if (error.code === '23505') throw new Error('رقم الموظف مستخدم بالفعل، اكتب رقمًا مختلفًا.');
      throw error;
    }
    return { id: data.id, employeeNumber: data.employee_number, name: data.name, shirtCount: data.shirt_count } as Worker;
  },
  async deleteWorker(id: string) {
    const { error } = await requireClient().from('workers').delete().eq('id', id);
    if (error) throw error;
  }
};

async function uploadImage(client: SupabaseClient, file: File | null) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) throw new Error('اختَر ملف صورة صالحًا.');
  if (file.size > 5 * 1024 * 1024) throw new Error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
  const { error } = await client.storage.from('tshirt-defects').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = client.storage.from('tshirt-defects').getPublicUrl(path);
  return data.publicUrl;
}
