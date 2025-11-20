"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Edit, Trash2, MapPin, Trophy } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    city: "",
    logoUrl: ""
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const teamsData = await response.json();
        setTeams(teamsData);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTeam ? `/api/teams/${editingTeam.id}` : '/api/teams';
      const method = editingTeam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchTeams();
        setDialogOpen(false);
        setEditingTeam(null);
        setFormData({ name: "", shortName: "", city: "", logoUrl: "" });
      }
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      shortName: team.shortName,
      city: team.city || "",
      logoUrl: team.logoUrl || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Opravdu chcete smazat tento tým?')) return;
    
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchTeams();
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const openNewTeamDialog = () => {
    setEditingTeam(null);
    setFormData({ name: "", shortName: "", city: "", logoUrl: "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">SPRÁVA TÝMŮ</h2>
          <p className="text-slate-600 font-medium">Přidávání, úprava a mazání týmů</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewTeamDialog} className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Přidat tým
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {editingTeam ? 'Upravit tým' : 'Nový tým'}
              </DialogTitle>
              <DialogDescription>
                {editingTeam ? 'Upravte informace o týmu' : 'Vyplňte údaje nového týmu'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Název týmu *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Název týmu"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortName">Zkratka *</Label>
                <Input
                  id="shortName"
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="Zkratka (3 znaky)"
                  maxLength={5}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Město</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Město"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL loga</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/logos/team.png"
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="rounded-xl bg-primary hover:bg-[#9F1239] text-white font-bold flex-1">
                  {editingTeam ? 'Uložit změny' : 'Vytvořit tým'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">
                  Zrušit
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Table */}
      <Card className="rounded-2xl bg-white border border-gray-100 card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Všechny týmy ({teams.length})
          </CardTitle>
          <CardDescription>
            Kompletní seznam týmů v aktuální sezóně
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Users className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Načítám týmy...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Název týmu</TableHead>
                  <TableHead>Zkratka</TableHead>
                  <TableHead>Město</TableHead>
                  <TableHead>Hráči</TableHead>
                  <TableHead>Kapitán</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="size-10 rounded-lg bg-white shadow-sm border border-slate-200 p-1">
                        <TeamLogo 
                          teamName={team.name}
                          className="w-full h-full object-contain"
                          fallbackText={team.shortName}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{team.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary font-bold">
                        {team.shortName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {team.city || 'Neuvedeno'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">
                        {team.players?.length || 0} hráčů
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {team.captain ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium">{team.captain.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Není nastaven</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(team)}
                          className="rounded-lg border-accent text-accent hover:bg-accent hover:text-white"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(team.id)}
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