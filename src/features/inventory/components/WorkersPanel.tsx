import { FormEvent, useState } from 'react';
import { Worker } from '../domain/inventoryItem';

interface Props {
  workers: Worker[];
  onAdd: (worker: Omit<Worker, 'id'>) => Promise<void>;
  onUpdate: (id: string, worker: Omit<Worker, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function WorkersPanel({ workers, onAdd, onUpdate, onDelete, onClose }: Props) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [name, setName] = useState('');
  const [shirtCount, setShirtCount] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!employeeNumber.trim() || !name.trim()) return;
    await onAdd({ employeeNumber: employeeNumber.trim(), name: name.trim(), shirtCount: Math.max(0, Number(shirtCount) || 0) });
    setEmployeeNumber('');
    setName('');
    setShirtCount('');
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="modal admin-modal"><div className="modal-header"><h2>موظفو استلام الملابس</h2><button type="button" onClick={onClose}>×</button></div><p className="panel-hint">أضف الأشخاص الذين سيظهرون في اختيار العامل عند تسجيل الملابس.</p><form className="worker-form" onSubmit={submit}><input placeholder="رقم الموظف" value={employeeNumber} onChange={(event) => setEmployeeNumber(event.target.value)} required /><input placeholder="اسم الشخص المستلم للملابس" value={name} onChange={(event) => setName(event.target.value)} required /><input type="number" min="0" placeholder="كام تيشرت؟" value={shirtCount} onChange={(event) => setShirtCount(event.target.value)} required /><button className="primary-button">إضافة مستلم ملابس</button></form><div className="workers-list">{workers.map((worker) => <WorkerRow key={worker.id} worker={worker} onDelete={onDelete} onSave={onUpdate} />)}</div></section></div>;
}

function WorkerRow({ worker, onDelete, onSave }: { worker: Worker; onDelete: (id: string) => Promise<void>; onSave: (id: string, worker: Omit<Worker, 'id'>) => Promise<void> }) {
  const [employeeNumber, setEmployeeNumber] = useState(worker.employeeNumber);
  const [shirtCount, setShirtCount] = useState(String(worker.shirtCount));
  const [name, setName] = useState(worker.name);
  return <div className="worker-row admin-row"><input value={employeeNumber} aria-label="رقم الموظف" onChange={(event) => setEmployeeNumber(event.target.value)} /><input value={name} aria-label="اسم العامل" onChange={(event) => setName(event.target.value)} /><input type="number" min="0" value={shirtCount} aria-label="عدد التيشرتات" onChange={(event) => setShirtCount(event.target.value)} /><button type="button" onClick={() => void onSave(worker.id, { employeeNumber: employeeNumber.trim(), name: name.trim(), shirtCount: Math.max(0, Number(shirtCount) || 0) })}>حفظ</button><button type="button" className="danger-text" onClick={() => void onDelete(worker.id)}>حذف</button></div>;
}
