import { Sparkles } from "lucide-react";

interface Props {
  text: string;
  kind?: "info" | "warn" | "success";
}

const kinds = {
  info: "bg-brand-50 text-brand-700 border-brand-100",
  warn: "bg-amber-50 text-amber-700 border-amber-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export function InsightCallout({ text, kind = "info" }: Props) {
  return (
    <div
      className={`flex items-start gap-2.5 border px-4 py-3 rounded-xl text-[13px] font-medium ${kinds[kind]}`}
    >
      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
