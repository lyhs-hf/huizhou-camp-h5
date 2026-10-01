import { Sheet } from "./Sheet";
import { stationCopy } from "../content/copy";
import type { InteractionId } from "../content/types";
export function KnowledgeDrawer({
  id,
  onClose,
}: {
  id: InteractionId;
  onClose: () => void;
}) {
  return (
    <Sheet titleId="knowledge-title" onClose={onClose}>
      <h2 id="knowledge-title">这一站，孩子在经历什么？</h2>
      <div className="knowledge-sections">
        {["真实体验", "为什么值得", "所在路线"].map((label, i) => (
          <section key={label}>
            <h3>{label}</h3>
            <p>{stationCopy[id].knowledge[i]}</p>
          </section>
        ))}
      </div>
    </Sheet>
  );
}
