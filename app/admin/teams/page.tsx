"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getTeamLogo } from "@/lib/team-logos";
import {
  AdminToolbar, EmptyRow, ErrorBanner, Field, LoadingRow, RowAction, TableFrame, TeamMark,
} from "@/components/admin/admin-ui";

type Team = {
  id: string;
  name: string;
  shortName: string;
  city: string | null;
  logoUrl: string | null;
  captain: { name: string } | null;
  _count?: { players: number };
  players?: unknown[];
};

const EMPTY_FORM = { name: "", shortName: "", city: "", logoUrl: "" };

export default function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error();
      setTeams(await response.json());
    } catch {
      setError('Týmy se nepodařilo načíst.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const openDialog = (team: Team | null) => {
    setEditingTeam(team);
    setFormData(team
      ? { name: team.name, shortName: team.shortName, city: team.city || "", logoUrl: team.logoUrl || "" }
      : EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams', {
        method: editingTeam ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Tým se nepodařilo uložit.');
      }
      await fetchTeams();
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Tým se nepodařilo uložit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Opravdu smazat tým ${team.name}?`)) return;
    setError("");

    try {
      const response = await fetch(`/api/teams/${team.id}`, { method: 'DELETE' });
      if (!response.ok) {
        // API vrací srozumitelný důvod (např. tým má hráče) — dřív zapadl v konzoli.
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Tým se nepodařilo smazat.');
      }
      await fetchTeams();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tým se nepodařilo smazat.');
    }
  };

  const set = (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div>
      <AdminToolbar title="Týmy" meta={!loading && teams.length}>
        <Button size="sm" onClick={() => openDialog(null)} className="h-8 rounded-md font-semibold">
          <Plus className="mr-1 h-4 w-4" />
          Přidat tým
        </Button>
      </AdminToolbar>

      {error && <ErrorBanner message={error} onClose={() => setError('')} />}

      <TableFrame>
        {loading ? (
          <LoadingRow>Načítám týmy…</LoadingRow>
        ) : teams.length === 0 ? (
          <EmptyRow>V aktivní sezóně zatím nejsou žádné týmy.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted hover:bg-muted">
                <TableHead>Tým</TableHead>
                <TableHead className="w-20">Zkratka</TableHead>
                <TableHead className="hidden md:table-cell">Město</TableHead>
                <TableHead className="hidden lg:table-cell">Kapitán</TableHead>
                <TableHead className="w-16 text-center">Hráči</TableHead>
                <TableHead className="w-20"><span className="sr-only">Akce</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => {
                const playerCount = team._count?.players ?? team.players?.length ?? 0;
                return (
                  <TableRow key={team.id} className="border-border hover:bg-rose-50/40">
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <TeamMark name={team.name} shortName={team.shortName} logoUrl={getTeamLogo(team.name)} />
                        <Link href={`/team/${team.id}`} className="font-medium text-slate-900 hover:text-primary">
                          {team.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-600">{team.shortName}</TableCell>
                    <TableCell className="hidden text-slate-600 md:table-cell">
                      {team.city || <span className="text-slate-300">–</span>}
                    </TableCell>
                    <TableCell className="hidden text-slate-700 lg:table-cell">
                      {team.captain?.name || <span className="text-xs text-amber-700">není určen</span>}
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-900 tnum">{playerCount}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-0.5">
                        <RowAction label={`Upravit ${team.name}`} onClick={() => openDialog(team)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </RowAction>
                        <RowAction label={`Smazat ${team.name}`} tone="danger" onClick={() => handleDelete(team)}>
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
            <DialogTitle className="text-base">{editingTeam ? `Upravit tým` : 'Nový tým'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3.5 px-5 py-4">
              <Field label="Název týmu *" htmlFor="name">
                <Input id="name" value={formData.name} onChange={set('name')} required autoFocus />
              </Field>
              <div className="grid grid-cols-[6rem_1fr] gap-3">
                <Field label="Zkratka *" htmlFor="shortName">
                  <Input id="shortName" value={formData.shortName} onChange={set('shortName')} maxLength={5} required className="font-mono uppercase" />
                </Field>
                <Field label="Město" htmlFor="city">
                  <Input id="city" value={formData.city} onChange={set('city')} />
                </Field>
              </div>
              <Field label="Logo" htmlFor="logoUrl" hint="Cesta k souboru ve /public, např. /logos/tym.png">
                <Input id="logoUrl" value={formData.logoUrl} onChange={set('logoUrl')} placeholder="/logos/…" />
              </Field>

              {formError && <ErrorBanner message={formError} />}
            </div>

            <div className="flex justify-end gap-2 border-t border-border bg-muted px-5 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="h-8 rounded-md">
                Zrušit
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="h-8 rounded-md font-semibold">
                {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {editingTeam ? 'Uložit' : 'Vytvořit tým'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
