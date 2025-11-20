"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, Edit, Trash2, Calendar, Crown, Users } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    dateOfBirth: "",
    role: "hráč",
    teamId: "",
    photoUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersResponse, teamsResponse] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams')
      ]);
      
      if (playersResponse.ok) {
        const playersData = await playersResponse.json();
        setPlayers(playersData);
      }
      
      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlayer ? `/api/players/${editingPlayer.id}` : '/api/players';
      const method = editingPlayer ? 'PUT' : 'POST';
      
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        await fetchData();
        setDialogOpen(false);
        setEditingPlayer(null);
        setFormData({ name: "", nickname: "", dateOfBirth: "", role: "hráč", teamId: "", photoUrl: "" });
      }
    } catch (error) {
      console.error('Error saving player:', error);
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      nickname: player.nickname || "",
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split('T')[0] : "",
      role: player.role,
      teamId: player.teamId,
      photoUrl: player.photoUrl || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (playerId: string) => {
    if (!confirm('Opravdu chcete smazat tohoto hráče?')) return;
    
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const openNewPlayerDialog = () => {
    setEditingPlayer(null);
    setFormData({ name: "", nickname: "", dateOfBirth: "", role: "hráč", teamId: "", photoUrl: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">SPRÁVA HRÁČŮ</h2>
          <p className="text-slate-600 font-medium">Přidávání, úprava a mazání hráčů</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewPlayerDialog} className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Přidat hráče
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {editingPlayer ? 'Upravit hráče' : 'Nový hráč'}
              </DialogTitle>
              <DialogDescription>
                {editingPlayer ? 'Upravte informace o hráči' : 'Vyplňte údaje nového hráče'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Jméno a příjmení *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jméno Příjmení"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nickname">Přezdívka</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Přezdívka (volitelné)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Datum narození</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamId">Tým *</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte tým" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hráč">Hráč</SelectItem>
                    <SelectItem value="kapitán">Kapitán</SelectItem>
                    <SelectItem value="náhradník">Náhradník</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photoUrl">URL fotky</Label>
                <Input
                  id="photoUrl"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="/avatars/player.jpg"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold flex-1">
                  {editingPlayer ? 'Uložit změny' : 'Vytvořit hráče'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                  Zrušit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Players Table */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Všichni hráči ({players.length})
          </CardTitle>
          <CardDescription>
            Kompletní seznam hráčů v aktuální sezóně
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Target className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Načítám hráče...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jméno</TableHead>
                  <TableHead>Tým</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Věk</TableHead>
                  <TableHead>BPI</TableHead>
                  <TableHead>Zápasy</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-slate-900">{player.name}</div>
                        {player.nickname && (
                          <div className="text-sm text-slate-500">"{player.nickname}"</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded bg-white shadow-sm border border-slate-200 p-0.5">
                          <TeamLogo 
                            teamName={player.team.name}
                            className="w-full h-full object-contain"
                            fallbackText={player.team.shortName}
                          />
                        </div>
                        <span className="text-sm font-medium">{player.team.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {player.role === 'kapitán' ? (
                        <Badge className="bg-primary text-white font-bold">
                          <Crown className="h-3 w-3 mr-1" />
                          {player.role}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-semibold">
                          {player.role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {player.dateOfBirth ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Calendar className="h-3 w-3" />
                          {new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear()} let
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Neuvedeno</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-accent/10 text-accent font-bold">
                        {player.stats?.[0]?.bpi?.toFixed(1) || '0.0'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-semibold">{player.stats?.[0]?.singlesPlayed || 0}</span>
                        <span className="text-slate-400"> / </span>
                        <span className="text-green-600 font-semibold">{player.stats?.[0]?.singlesWon || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(player)}
                          className="rounded-lg border-accent text-accent hover:bg-accent hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(player.id)}
                          className="rounded-lg border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}