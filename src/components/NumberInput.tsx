import Button from './Button';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export default function NumberInput({ label, value, onChange, min = 1, max = 99 }: NumberInputProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <span className="text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 text-xl"
        >
          −
        </Button>
        <span className="w-12 text-center text-xl font-semibold">{value}</span>
        <Button
          variant="default"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 text-xl"
        >
          +
        </Button>
      </div>
    </div>
  );
}
