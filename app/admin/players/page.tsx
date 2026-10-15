"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeamLogo } from "@/lib/team-logos";
import {
  AdminToolbar, EmptyRow, ErrorBanner, Field, LoadingRow, RowAction, TableFrame, TeamMark,
} from "@/components/admin/admin-ui";

type Team = { id: string; name: string; shortName: string };
type Player = {
  id: string;
  name: string;
  nickname: string | null;
  dateOfBirth: string | null;
  role: string;
  teamId: string;
  photoUrl: string | null;
  team: Team;
  stats?: { singlesPlayed: number; singlesWon: number }[];
};

const EMPTY_FORM = { name: "", nickname: "", dateOfBirth: "", role: "hráč", teamId: "", photoUrl: "" };
const ALL_TEAMS = "__all";

const ROLE_STYLE: Record<string, string> = {
  'kapitán': 'font-semibold text-primary',
  'náhradník': 'text-slate-500',
};

// Prostý porovnávač bez diakritiky — "sasek" najde "Šášek".
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState(ALL_TEAMS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      const [playersResponse, teamsResponse] = await Promise.all([fetch('/api/players'), fetch('/api/teams')]);
      if (!playersResponse.ok || !teamsResponse.ok) throw new Error();
      setPlayers(await playersResponse.json());
      setTeams(await teamsResponse.json());
    } catch {
      setError('Hráče se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // /api/players vrací hráče všech sezón; správa se týká jen soupisek aktivní
  // sezóny, tedy týmů z /api/teams.
  const seasonPlayers = useMemo(() => {
    const teamIds = new Set(teams.map((t) => t.id));
    return players.filter((p) => teamIds.has(p.teamId));
  }, [players, teams]);

  const visible = useMemo(() => {
    const q = fold(query.trim());
    return seasonPlayers.filter((p) =>
      (teamFilter === ALL_TEAMS || p.teamId === teamFilter) &&
      (!q || fold(p.name).includes(q) || (p.nickname && fold(p.nickname).includes(q)))
    );
  }, [seasonPlayers, query, teamFilter]);

  const openDialog = (player: Player | null) => {
    setEditingPlayer(player);
    setFormData(player
      ? {
          name: player.name,
          nickname: player.nickname || "",
          dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : "",
          role: player.role,
          teamId: player.teamId,
          photoUrl: player.photoUrl || "",
        }
      // Nový hráč do právě filtrovaného týmu — typicky se doplňuje soupiska jednoho týmu.
      : { ...EMPTY_FORM, teamId: teamFilter === ALL_TEAMS ? "" : teamFilter });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.teamId) {
      setFormError('Vyberte tým.');
      return;
    }
    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(editingPlayer ? `/api/players/${editingPlayer.id}` : '/api/players', {
        method: editingPlayer ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Hráče se nepodařilo uložit.');
      }
      await fetchData();
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Hráče se nepodařilo uložit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (player: Player) => {
    if (!confirm(`Opravdu smazat hráče ${player.name}? Smažou se i jeho statistiky.`)) return;
    setError("");

    try {
      const response = await fetch(`/api/players/${player.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Hráče se nepodařilo smazat.');
      }
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hráče se nepodařilo smazat.');
    }
  };

  const set = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div>
      <AdminToolbar
        title="Hráči"
        meta={!loading && (visible.length === seasonPlayers.length ? seasonPlayers.length : `${visible.length} z ${seasonPlayers.length}`)}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hledat hráče"
            aria-label="Hledat hráče"
            className="h-8 w-44 pl-8 text-sm"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="h-8 w-48 text-sm" aria-label="Filtrovat podle týmu">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TEAMS}>Všechny týmy</SelectItem>
            {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => openDialog(null)} className="h-8 rounded-md font-semibold">
          <Plus className="mr-1 h-4 w-4" />
          Přidat hráče
        </Button>
      </AdminToolbar>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <TableFrame>
        {loading ? (
          <LoadingRow>Načítám hráče…</LoadingRow>
        ) : visible.length === 0 ? (
          <EmptyRow>{seasonPlayers.length ? 'Filtru neodpovídá žádný hráč.' : 'V aktivní sezóně zatím nejsou žádní hráči.'}</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted hover:bg-muted">
                <TableHead>Hráč</TableHead>
                <TableHead className="hidden md:table-cell">Tým</TableHead>
                <TableHead className="w-24">Role</TableHead>
                <TableHead className="w-20 text-center" title="Odehrané / vyhrané singly v sezóně">Singly</TableHead>
                <TableHead className="w-20"><span className="sr-only">Akce</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => {
                const s = p.stats?.[0];
                return (
                  <TableRow key={p.id} className="border-border hover:bg-rose-50/40">
                    <TableCell className="max-w-0">
                      <span className="truncate font-medium text-slate-900">{p.name}</span>
                      {p.nickname && <span className="ml-1.5 text-xs text-muted-foreground">„{p.nickname}“</span>}
                    </TableCell>
                    <TableCell className="hidden max-w-0 md:table-cell">
                      <div className="flex items-center gap-2">
                        <TeamMark name={p.team.name} shortName={p.team.shortName} logoUrl={getTeamLogo(p.team.name)} />
                        <span className="truncate text-slate-700">{p.team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={`text-xs ${ROLE_STYLE[p.role] ?? 'text-slate-700'}`}>{p.role}</TableCell>
                    <TableCell className="text-center text-sm tnum">
                      {s?.singlesPlayed ? (
                        <>
                          <span className="text-slate-900">{s.singlesPlayed}</span>
                          <span className="text-slate-300"> / </span>
                          <span className="font-semibold text-emerald-700">{s.singlesWon}</span>
                        </>
                      ) : (
                        <span className="text-slate-300">–</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        <RowAction label={`Upravit ${p.name}`} onClick={() => openDialog(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </RowAction>
                        <RowAction label={`Smazat ${p.name}`} tone="danger" onClick={() => handleDelete(p)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </RowAction>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableFrame>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-md">
          <DialogHeader className="border-b border-border px-5 py-3.5">
            <DialogTitle className="text-base">{editingPlayer ? 'Upravit hráče' : 'Nový hráč'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3.5 px-5 py-4">
              <Field label="Jméno a příjmení *" htmlFor="name">
                <Input id="name" value={formData.name} onChange={set('name')} required autoFocus />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Přezdívka" htmlFor="nickname">
                  <Input id="nickname" value={formData.nickname} onChange={set('nickname')} />
                </Field>
                <Field label="Datum narození" htmlFor="dateOfBirth">
                  <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={set('dateOfBirth')} />
                </Field>
              </div>
              <div className="grid grid-cols-[1fr_8rem] gap-3">
                <Field label="Tým *" htmlFor="teamId">
                  <Select value={formData.teamId} onValueChange={(v) => setFormData({ ...formData, teamId: v })}>
                    <SelectTrigger id="teamId"><SelectValue placeholder="Vyberte tým" /></SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Role" htmlFor="role">
                  <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                    <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hráč">Hráč</SelectItem>
                      <SelectItem value="kapitán">Kapitán</SelectItem>
                      <SelectItem value="náhradník">Náhradník</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Fotka" htmlFor="photoUrl" hint="Cesta k souboru ve /public, např. /avatars/jmeno.jpg">
                <Input id="photoUrl" value={formData.photoUrl} onChange={set('photoUrl')} placeholder="/avatars/…" />
              </Field>

              {formError && <ErrorBanner message={formError} />}
            </div>

            <div className="flex justify-end gap-2 border-t border-border bg-muted px-5 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 rounded-md">
                Zrušit
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="h-8 rounded-md font-semibold">
                {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {editingPlayer ? 'Uložit' : 'Přidat hráče'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
