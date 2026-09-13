import { InventoryItem } from '../domain/inventoryItem';

interface Props { items: InventoryItem[]; canManage: boolean; onEdit: (item: InventoryItem) => void; onDelete: (item: InventoryItem) => void; }

export function InventoryList({ items, canManage, onEdit, onDelete }: Props) {
  const grouped = items.reduce<Record<string, InventoryItem[]>>((groups, item) => {
    const day = new Date(item.createdAt).toLocaleDateString('ar-EG');
    (groups[day] ??= []).push(item);
    return groups;
  }, {});

  return <div className="inventory-list">{Object.entries(grouped).map(([day, dayItems]) => <section className="day-group" key={day}>
    <h2 className="day-heading">سجلات يوم {day}</h2>
    {dayItems.map((item) => (
      <article className="inventory-card" key={item.id}>
        <div className="number-badge">{item.shirtNumber}</div>
        <div className="item-content"><h2>{item.personName}</h2><p>رقم التيشرت: {item.shirtNumber}</p>{item.notes && <p className="notes">ملاحظة: {item.notes}</p>}{item.imageUrl && <a className="image-link" href={item.imageUrl} target="_blank" rel="noreferrer">عرض صورة العيب</a>}<small>تاريخ التسجيل: {new Date(item.createdAt).toLocaleString('ar-EG')}</small>{item.createdByName && <small>أضافه: {item.createdByName}</small>}</div>
        {canManage && <div className="card-actions"><button onClick={() => onEdit(item)}>تعديل</button><button className="danger" onClick={() => onDelete(item)}>حذف</button></div>}
      </article>
    ))}
  </section>)}</div>;
}
