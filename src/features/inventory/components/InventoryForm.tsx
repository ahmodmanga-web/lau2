import { FormEvent, useMemo, useState } from 'react';
import { InventoryDraft, InventoryItem, Worker } from '../domain/inventoryItem';

interface Props { item: InventoryItem | null; workers: Worker[]; saving: boolean; onClose: () => void; onSubmit: (draft: InventoryDraft) => Promise<void>; }

const noteOptions = ['سليم', 'مقاس كبير', 'مقاس صغير', 'به بقعة', 'به قطع أو تلف', 'تم التسليم'];

export function InventoryForm({ item, workers, saving, onClose, onSubmit }: Props) {
  const [number, setNumber] = useState(item?.shirtNumber ?? '');
  const [workerId, setWorkerId] = useState(item?.workerId ?? '');
  const [workerSearch, setWorkerSearch] = useState('');
  const initialNote = item?.notes ?? '';
  const [noteChoice, setNoteChoice] = useState(initialNote && noteOptions.includes(initialNote) ? initialNote : 'ملاحظة مخصصة');
  const [customNote, setCustomNote] = useState(initialNote && !noteOptions.includes(initialNote) ? initialNote : '');
  const [notesOpen, setNotesOpen] = useState(Boolean(initialNote || item?.imageUrl));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const filteredWorkers = useMemo(() => {
    const query = workerSearch.trim().toLocaleLowerCase();
    if (!query) return workers;
    return workers.filter((worker) => `${worker.employeeNumber} ${worker.name}`.toLocaleLowerCase().includes(query));
  }, [workerSearch, workers]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!number.trim() || !workerId) return;
    const notes = noteChoice === 'ملاحظة مخصصة' ? customNote.trim() : noteChoice;
    await onSubmit({ shirtNumber: number.trim(), workerId, notes: notes || null, imageFile });
  }
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="modal" onSubmit={submit}><div className="modal-header"><h2>{item ? 'تعديل السجل' : 'إضافة سجل جديد'}</h2><button type="button" onClick={onClose}>×</button></div><label>رقم التيشرت<input value={number} onChange={(event) => setNumber(event.target.value)} required /></label><label>البحث عن العامل برقم الموظف<input className="worker-search" inputMode="numeric" placeholder="اكتب رقم الموظف للبحث" value={workerSearch} onChange={(event) => setWorkerSearch(event.target.value)} /></label><label>العامل<select value={workerId} onChange={(event) => setWorkerId(event.target.value)} required><option value="">اختر العامل</option>{filteredWorkers.map((worker) => <option key={worker.id} value={worker.id}>{worker.employeeNumber} - {worker.name}</option>)}</select>{workerSearch && !filteredWorkers.length && <small className="form-hint">لا يوجد عامل بهذا الرقم</small>}</label><button type="button" className="notes-button" onClick={() => setNotesOpen((open) => !open)}>📝 {notesOpen ? 'إخفاء الملاحظات' : 'إضافة ملاحظة أو صورة عيب'}</button>{notesOpen && <div className="notes-panel"><label>ملاحظة على اللبس<select value={noteChoice} onChange={(event) => setNoteChoice(event.target.value)}><option value="">بدون ملاحظة</option>{noteOptions.map((option) => <option key={option} value={option}>{option}</option>)}<option value="ملاحظة مخصصة">ملاحظة مخصصة</option></select></label>{noteChoice === 'ملاحظة مخصصة' && <label>اكتب الملاحظة<textarea value={customNote} onChange={(event) => setCustomNote(event.target.value)} rows={3} /></label>}<label>صورة العيب<input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />{item?.imageUrl && !imageFile && <img className="defect-preview" src={item.imageUrl} alt="الصورة الحالية للعيب" />}</label></div>}<button className="primary-button full" disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ السجل'}</button></form></div>;
}
