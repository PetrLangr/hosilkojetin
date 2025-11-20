import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Archive, Construction } from "lucide-react";

export default function ArchivePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-16 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-gray-100 card-shadow">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Archive className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              ARCHIV <span className="text-primary">SEZÓN</span>
            </h1>
          </div>
          <p className="text-xl text-slate-600">
            Prohlédněte si výsledky a statistiky z minulých sezón HŠL
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <Card className="rounded-3xl bg-white border border-gray-100 card-shadow max-w-2xl mx-auto">
        <CardContent className="py-16 text-center">
          <div className="size-24 mx-auto mb-6 rounded-full border-8 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 grid place-items-center">
            <Construction className="h-12 w-12 text-amber-600" />
          </div>

          <Badge className="bg-amber-600 text-white px-4 py-2 text-sm font-bold mb-4">
            PŘIPRAVUJEME
          </Badge>

          <h3 className="text-2xl font-black text-slate-900 mb-3">
            ARCHIV SEZÓN
          </h3>

          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Pracujeme na archivaci minulých sezón. Brzy zde najdete kompletní historii výsledků, statistik a zajímavostí z předchozích ročníků HŠL.
          </p>

          <div className="bg-slate-50 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-slate-600 mb-2"><strong>Co můžete očekávat:</strong></p>
            <ul className="text-sm text-slate-600 space-y-1 text-left">
              <li>• Konečné tabulky minulých sezón</li>
              <li>• Historické výsledky zápasů</li>
              <li>• Vítězné týmy jednotlivých ročníků</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
