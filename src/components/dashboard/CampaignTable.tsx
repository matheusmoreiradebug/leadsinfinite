import { CampaignStat, SourceStat } from "@/types";

interface CampaignTableProps {
  campaigns: CampaignStat[];
  sources: SourceStat[];
}

const sourceColors: Record<string, string> = {
  google:    "text-blue-400",
  instagram: "text-pink-400",
  facebook:  "text-indigo-400",
  tiktok:    "text-slate-300",
  whatsapp:  "text-emerald-400",
};

function sourceColor(s: string) {
  return sourceColors[s?.toLowerCase()] ?? "text-slate-400";
}

function sourceLabel(s: string) {
  const map: Record<string, string> = {
    form:    "Formulário",
    cta_btn: "Botão Kit",
    float:   "Float WA",
  };
  return map[s] ?? s;
}

export function CampaignTable({ campaigns, sources }: CampaignTableProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Campanhas UTM */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Campanhas UTM</h3>
        {campaigns.length === 0 ? (
          <p className="text-slate-500 text-sm">Sem dados de UTM ainda</p>
        ) : (
          <div className="space-y-2">
            {campaigns.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 truncate">{c.campaign}</p>
                  <p className={`text-xs ${sourceColor(c.source)}`}>{c.source}</p>
                </div>
                <span className="text-sm font-semibold text-white flex-shrink-0">{c.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Origem dos leads */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Origem dos Leads</h3>
        {sources.length === 0 ? (
          <p className="text-slate-500 text-sm">Sem dados ainda</p>
        ) : (
          <div className="space-y-3">
            {sources.map((s, i) => {
              const max = sources[0]?.count ?? 1;
              const pct = Math.round((s.count / max) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{sourceLabel(s.source)}</span>
                    <span className="text-sm font-semibold text-white">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
