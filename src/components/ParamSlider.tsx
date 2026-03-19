import { Slider } from "@/components/ui/slider";
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

export function ParamSlider({ label, value, min, max, step, onChange, format, suffix }: Props) {
  const display = format ? format(value) : `${value}${suffix || ""}`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <span className="text-sm font-mono font-medium text-foreground">{display}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="cursor-pointer"
      />
    </div>
  );
}
