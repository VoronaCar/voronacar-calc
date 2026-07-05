interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
} [cite: 1421]

export default function NoteInput({ value, onChange, placeholder = "заметка..." }: Props) { [cite: 1422, 1424]
  return (
    <input
      type="text" [cite: 1427]
      value={value} [cite: 1430]
      onChange={(e) => onChange(e.target.value)} [cite: 1428]
      placeholder={placeholder} [cite: 1429]
      class="flex-1 min-w-[120px] border-0 border-b border-dashed border-muted-foreground/30 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-[#013AD1] px-1 py-0.5 transition-colors" [cite: 1432]
    />
  );
}