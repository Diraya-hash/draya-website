import { ChevronRight } from "lucide-react";
import type { SkillNode } from "@/lib/graph/types";

/** Native expandable skill ontology (no client JS needed). */
export function SkillTree({ roots }: { roots: SkillNode[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {roots.map((root) => (
        <details key={root.slug} className="group rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-semibold text-foreground">
            <span>{root.name}</span>
            <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
              {root.children.length}
              <ChevronRight className="size-4 transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
            </span>
          </summary>
          <ul className="mt-3 space-y-1.5 border-s border-border ps-4">
            {root.children.map((child) => (
              <li key={child.slug} className="text-sm text-muted-foreground">
                {child.name}
                {child.children.length > 0 && (
                  <ul className="mt-1 space-y-1 border-s border-border ps-4">
                    {child.children.map((g) => (
                      <li key={g.slug} className="text-xs text-muted-foreground/80">
                        {g.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
