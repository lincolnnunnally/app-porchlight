import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyNote({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(label);
  return (
    <div className="grid gap-3">
      <pre className="whitespace-pre-wrap rounded-lg border border-line bg-paper p-4 font-display text-sm leading-relaxed text-paper-ink">
        {text}
      </pre>
      <Button
        variant="ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied("Copied");
            setTimeout(() => setCopied(label), 1200);
          } catch {
            setCopied("Select and copy");
          }
        }}
      >
        {copied}
      </Button>
    </div>
  );
}
