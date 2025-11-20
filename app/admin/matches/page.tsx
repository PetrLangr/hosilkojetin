"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Target, CheckCircle, AlertCircle, Clock, Edit, Eye } from "lucide-react";
import { TeamLogo } from "@/components/team-logo";
import Link from "next/link";

export default function AdminMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (response.ok) {
        const matchesData = await response.json();
        setMatches(matchesData);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/approve`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchMatches();
      }
    } catch (error) {
      console.error('Error approving match:', error);
    }
  };

  const getMatchStatus = (match: any) => {
    if (!match.result) {
      return { status: 'scheduled', label: 'Naplánováno', color: 'bg-slate-100 text-slate-600' };
    }
    
    if (match.result?.status === 'pending_approval') {
      return { status: 'pending', label: 'Čeká na schválení', color: 'bg-amber-100 text-amber-700' };
    }
    
    if (match.endTime) {
      return { status: 'completed', label: 'Dokončeno', color: 'bg-green-100 text-green-700' };
    }
    
    return { status: 'in_progress', label: 'Probíhá', color: 'bg-blue-100 text-blue-700' };
  };

  // Group matches by round
  const matchesByRound = matches.reduce((acc: any, match: any) => {
    const round = match.round || 1;
    if (!acc[round]) {
      acc[round] = [];
    }
    acc[round].push(match);
    return acc;
  }, {});

  const sortedRounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">SPRÁVA ZÁPASŮ</h2>
        <p className="text-slate-600 font-medium">Přehled všech zápasů, schvalování výsledků a kontrola</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-slate-600 mb-1">
              {matches.filter(m => !m.result).length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Naplánováno</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-amber-600 mb-1">
              {matches.filter(m => m.result?.status === 'pending_approval').length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Čeká schválení</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-green-600 mb-1">
              {matches.filter(m => m.endTime).length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Dokončeno</div>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-black text-primary mb-1">
              {matches.length}
            </div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Celkem</div>
          </CardContent>
        </Card>
      </div>

      {/* Matches by Round */}
      {loading ? (
        <Card className="rounded-2xl">
          <CardContent className="py-8 text-center">
            <Calendar className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-slate-600">Načítám zápasy...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedRounds.map(round => (
            <Card key={round} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-primary text-white font-bold">
                    {round}. KOLO
                  </Badge>
                  <span className="text-slate-600">
                    ({matchesByRound[round].filter((m: any) => m.endTime).length}/{matchesByRound[round].length} dokončeno)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zápas</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Stav</TableHead>
                      <TableHead>Výsledek</TableHead>
                      <TableHead className="text-right">Akce</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchesByRound[round].map((match: any) => {
                      const status = getMatchStatus(match);
                      
                      return (
                        <TableRow key={match.id} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded bg-white shadow-sm border p-1">
                                <TeamLogo teamName={match.homeTeam.name} className="w-full h-full object-contain" />
                              </div>
                              <span className="font-semibold text-slate-900">
                                {match.homeTeam.name}
                              </span>
                              <span className="text-slate-400">vs</span>
                              <span className="font-semibold text-slate-900">
                                {match.awayTeam.name}
                              </span>
                              <div className="size-8 rounded bg-white shadow-sm border p-1">
                                <TeamLogo teamName={match.awayTeam.name} className="w-full h-full object-contain" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Calendar className="h-3 w-3" />
                              {match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'TBD'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`font-semibold ${status.color}`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {match.result ? (
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary text-white font-bold">
                                  {match.result.homeScore} : {match.result.awayScore}
                                </Badge>
                                {status.status === 'pending' && (
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {status.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => approveMatch(match.id)}
                                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Schválit
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="rounded-lg border-primary text-primary hover:bg-primary hover:text-white"
                              >
                                <Link href={`/match/${match.id}`}>
                                  {status.status === 'scheduled' ? (
                                    <>
                                      <Edit className="h-3 w-3 mr-1" />
                                      Zadat
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Detail
                                    </>
                                  )}
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}