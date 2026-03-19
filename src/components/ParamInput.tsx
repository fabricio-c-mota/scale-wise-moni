import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  suffix?: string;
}

export function ParamInput({ label, value, min, max, step, onChange, format, suffix }: Props) {
  const isPercentage = !!format && !suffix;
  const displayValue = isPercentage ? value : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseFloat(e.target.value);
    if (!isNaN(raw)) {
      const clamped = Math.min(max, Math.max(min, raw));
      onChange(clamped);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={displayValue}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          className="h-9 font-mono text-sm bg-background"
        />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  );
}
