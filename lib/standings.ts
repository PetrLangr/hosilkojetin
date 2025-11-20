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

    // Get games won and legs from result structure
    // Support multiple formats:
    // - Quick result: homeWins/awayWins, homeLegs/awayLegs
    // - Detailed old format: homeScore/awayScore
    // - Detailed new format: homeGamesWon/awayGamesWon
    const homeGamesWon = result.homeWins ?? result.homeGamesWon ?? result.homeScore ?? 0;
    const awayGamesWon = result.awayWins ?? result.awayGamesWon ?? result.awayScore ?? 0;
    const homeLegs = result.homeLegs ?? result.homeLegsTotal ?? result.homeLegsWon ?? 0;
    const awayLegs = result.awayLegs ?? result.awayLegsTotal ?? result.awayLegsWon ?? 0;
    
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
    // HŠL Points System:
    // V=3 (win with > 8 games)
    // VP=2 (win after 17th game when tied 8-8)
    // PP=1 (loss after 17th game when tied 8-8)
    // P=0 (loss with < 8 games)

    // Check if this was decided in game 17 (tiebreaker)
    const wasTiebreaker = (homeGamesWon === 9 && awayGamesWon === 8) ||
                         (homeGamesWon === 8 && awayGamesWon === 9);

    if (wasTiebreaker) {
      // Match was decided by 17th game (701 DO)
      // Winner gets VP=2, loser gets PP=1
      if (homeGamesWon > awayGamesWon) {
        homeTeam.wonPenalty++;
        homeTeam.points += 2;
        awayTeam.lostPenalty++;
        awayTeam.points += 1;
        homeTeam.form.unshift('WP');
        awayTeam.form.unshift('LP');
      } else {
        awayTeam.wonPenalty++;
        awayTeam.points += 2;
        homeTeam.lostPenalty++;
        homeTeam.points += 1;
        homeTeam.form.unshift('LP');
        awayTeam.form.unshift('WP');
      }
    } else {
      // Regular win/loss (not through tiebreaker)
      if (homeGamesWon > awayGamesWon) {
        // Home team wins (V=3)
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
        homeTeam.form.unshift('W');
        awayTeam.form.unshift('L');
      } else if (awayGamesWon > homeGamesWon) {
        // Away team wins (V=3)
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
        homeTeam.form.unshift('L');
        awayTeam.form.unshift('W');
      } else {
        // This shouldn't happen in HŠL (games must have a winner)
        // But handle edge case where both teams have equal games
        // This could be incomplete match data
        console.warn(`Match ${match.id} has equal games won (${homeGamesWon}-${awayGamesWon}), which shouldn't happen`);
      }
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