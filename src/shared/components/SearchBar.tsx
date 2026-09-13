interface Props { value: string; onChange: (value: string) => void; }
export function SearchBar({ value, onChange }: Props) { return <label className="search-box"><span>⌕</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="ابحث برقم الموظف أو التيشرت أو الاسم..." /></label>; }
