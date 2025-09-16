export interface TeamRecord {
  teamId: string;
  teamName: string;
  shortName: string;
  played: number;
  won: number;
  wonPenalty: number;
  lostPenalty: number;
  lost: number;
  legsFor: number;
  legsAgainst: number;
  legDifference: number;
  points: number;
  form: string[]; // Last 5 results: 'W', 'WP', 'LP', 'L'
}

export function calculatePoints(won: number, wonPenalty: number, lostPenalty: number): number {
  return won * 3 + wonPenalty * 2 + lostPenalty * 1;
}

export function calculateStandings(teams: any[], matches: any[]): TeamRecord[] {
  const standings: Map<string, TeamRecord> = new Map();
  
  // Initialize standings for all teams
  teams.forEach(team => {
    standings.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      played: 0,
      won: 0,
      wonPenalty: 0,
      lostPenalty: 0,
      lost: 0,
      legsFor: 0,
      legsAgainst: 0,
      legDifference: 0,
      points: 0,
      form: []
    });
  });

  // Process completed matches
  matches.filter(match => match.endTime && match.result).forEach(match => {
    const homeTeam = standings.get(match.homeTeamId);
    const awayTeam = standings.get(match.awayTeamId);
    
    if (!homeTeam || !awayTeam || !match.result) return;

    const result = match.result as any;
    const homeLegs = result.homeLegs || 0;
    const awayLegs = result.awayLegs || 0;
    
    // Update games played
    homeTeam.played++;
    awayTeam.played++;
    
    // Update legs
    homeTeam.legsFor += homeLegs;
    homeTeam.legsAgainst += awayLegs;
    awayTeam.legsFor += awayLegs;
    awayTeam.legsAgainst += homeLegs;
    
    // Calculate leg difference
    homeTeam.legDifference = homeTeam.legsFor - homeTeam.legsAgainst;
    awayTeam.legDifference = awayTeam.legsFor - awayTeam.legsAgainst;
    
    // Determine match result and assign points according to HŠL rules
    // V=3, VP=2, PP=1, P=0
    const legDifference = homeLegs - awayLegs;
    
    if (legDifference > 1) {
      // Home team wins clearly (V=3)
      homeTeam.won++;
      homeTeam.points += 3;
      awayTeam.lost++;
      homeTeam.form.unshift('W');
      awayTeam.form.unshift('L');
    } else if (legDifference === 1) {
      // Home team wins on penalty (VP=2, PP=1)
      homeTeam.wonPenalty++;
      homeTeam.points += 2;
      awayTeam.lostPenalty++;
      awayTeam.points += 1;
      homeTeam.form.unshift('WP');
      awayTeam.form.unshift('LP');
    } else if (legDifference === -1) {
      // Away team wins on penalty (VP=2, PP=1)
      awayTeam.wonPenalty++;
      awayTeam.points += 2;
      homeTeam.lostPenalty++;
      homeTeam.points += 1;
      homeTeam.form.unshift('LP');
      awayTeam.form.unshift('WP');
    } else if (legDifference < -1) {
      // Away team wins clearly (V=3)
      awayTeam.won++;
      awayTeam.points += 3;
      homeTeam.lost++;
      homeTeam.form.unshift('L');
      awayTeam.form.unshift('W');
    }
    
    // Keep only last 5 form results
    if (homeTeam.form.length > 5) homeTeam.form = homeTeam.form.slice(0, 5);
    if (awayTeam.form.length > 5) awayTeam.form = awayTeam.form.slice(0, 5);
  });

  return Array.from(standings.values());
}

export function sortStandings(standings: TeamRecord[]): TeamRecord[] {
  return standings.sort((a, b) => {
    // 1. Body
    if (a.points !== b.points) return b.points - a.points;
    
    // 2. Vzájemný duel - TODO: implementovat později
    
    // 3. Leg difference
    if (a.legDifference !== b.legDifference) return b.legDifference - a.legDifference;
    
    // 4. Legy pro
    if (a.legsFor !== b.legsFor) return b.legsFor - a.legsFor;
    
    // 5. Los (abecedně podle názvu)
    return a.teamName.localeCompare(b.teamName);
  });
}