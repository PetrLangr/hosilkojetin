import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Updated players data
const updatedPlayers = [
  { "name": "Dohnal Michal", "dob": "1974-09-04", "team": "Rychlí šneci Vlkoš" },
  { "name": "Vaculík Tomáš", "dob": "1997-01-13", "team": "Rychlí šneci Vlkoš" },
  { "name": "Vlček Jiří", "dob": "2000-11-05", "team": "Rychlí šneci Vlkoš" },
  { "name": "Opletal Vít", "dob": "1993-08-13", "team": "Rychlí šneci Vlkoš" },
  { "name": "Prokeš Jaroslav", "dob": "1962-05-03", "team": "Rychlí šneci Vlkoš" },
  { "name": "Opletal Milan", "dob": "1986-04-20", "team": "Rychlí šneci Vlkoš" },
  { "name": "Ludvík Stanislav", "dob": "1979-11-02", "team": "Rychlí šneci Vlkoš" },
  { "name": "Kroupa Radek", "dob": "1975-04-02", "team": "DC Stop Chropyně" },
  { "name": "Kroupa Filip", "dob": "2005-04-04", "team": "DC Stop Chropyně" },
  { "name": "Langr Petr", "dob": "2000-11-01", "team": "DC Stop Chropyně" },
  { "name": "Langr David", "dob": "1995-07-31", "team": "DC Stop Chropyně" },
  { "name": "Ferenc Michal", "dob": "1971-05-12", "team": "DC Stop Chropyně" },
  { "name": "Horák Stanislav", "dob": "1978-11-19", "team": "DC Stop Chropyně" },
  { "name": "Topič Jakub", "dob": "1986-04-18", "team": "DC Stop Chropyně" },
  { "name": "Navrátil Tomáš", "dob": "1989-06-10", "team": "DC Stop Chropyně" },
  { "name": "Vítík Adam", "dob": "2007-04-08", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Bosák Michal", "dob": "1981-09-09", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Novák Milan", "dob": "1996-12-09", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Raška Jaroslav", "dob": "1997-08-08", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Vítík Richard", "dob": "1989-10-28", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Černošek Ondřej", "dob": "1992-06-17", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Pavelka Marek", "dob": "1985-03-10", "team": "ŠK Pivní psi Chropyně" },
  { "name": "Miklik Miroslav", "dob": "1981-11-30", "team": "Bochořský koblihy" },
  { "name": "Szabo Štefan", "dob": "1979-05-23", "team": "Bochořský koblihy" },
  { "name": "Kozák Zdeněk senior", "dob": "1970-02-19", "team": "Bochořský koblihy" },
  { "name": "Macháček Vladimír", "dob": "1965-01-22", "team": "Bochořský koblihy" },
  { "name": "Matula Libor", "dob": "1966-11-23", "team": "Bochořský koblihy" },
  { "name": "Horák Jaromír", "dob": "1968-01-21", "team": "Bochořský koblihy" },
  { "name": "Kozák Zdeněk junior", "dob": "2024-06-26", "team": "Bochořský koblihy" },
  { "name": "Zatloukal Pavel", "dob": "1989-12-02", "team": "Bochořský koblihy" },
  { "name": "Richter Jan", "dob": "1986-02-17", "team": "Bochořský koblihy" },
  { "name": "Ošťádal Michal", "dob": "1971-01-26", "team": "Cech křivé šipky" },
  { "name": "Ošťádal Pavel", "dob": "1963-06-16", "team": "Cech křivé šipky" },
  { "name": "Ošťádal Radovan", "dob": "1968-05-10", "team": "Cech křivé šipky" },
  { "name": "Sázel David", "dob": "1992-03-09", "team": "Cech křivé šipky" },
  { "name": "Kapl Tomáš", "dob": "1993-09-12", "team": "Cech křivé šipky" },
  { "name": "Kučera Patrik", "dob": "1999-08-09", "team": "Hospoda Kanada" },
  { "name": "Okura Denis", "dob": "1993-04-07", "team": "Hospoda Kanada" },
  { "name": "Kubíček Patrik", "dob": "1998-09-22", "team": "Hospoda Kanada" },
  { "name": "Andres René", "dob": "1982-02-10", "team": "Hospoda Kanada" },
  { "name": "Galatik Michal", "dob": "1980-12-19", "team": "Hospoda Kanada" },
  { "name": "Lužík Pavel", "dob": "1982-05-30", "team": "Hospoda Kanada" },
  { "name": "Dohnal Vladimír", "dob": "1973-03-04", "team": "Kohouti Ludslavice" },
  { "name": "Dobrovolný Vratislav", "dob": "1969-10-10", "team": "Kohouti Ludslavice" },
  { "name": "Záhorovská Zdenka", "dob": "1955-08-28", "team": "Kohouti Ludslavice" },
  { "name": "Věrný Miroslav", "dob": "1993-05-29", "team": "Stoned Lobo Ponies" },
  { "name": "Krůpka Jan", "dob": "1980-03-07", "team": "Stoned Lobo Ponies" },
  { "name": "Lasovský Tomáš", "dob": "1982-03-07", "team": "Stoned Lobo Ponies" },
  { "name": "Kapoun Michal", "dob": "1979-12-27", "team": "Stoned Lobo Ponies" },
  { "name": "Vybiralík Pavel", "dob": "1991-10-04", "team": "Stoned Lobo Ponies" },
  { "name": "Baďura Michal", "dob": "1973-06-16", "team": "Stoned Lobo Ponies" },
  { "name": "Kapoun Štěpán", "dob": "2007-12-01", "team": "Stoned Lobo Ponies" },
  { "name": "Prokop Jiří", "dob": "2002-08-25", "team": "Stoned Lobo Ponies" },
  { "name": "Judas Roman", "dob": "1978-05-19", "team": "DC Kraken Dřínov" },
  { "name": "Hošek Ivo", "dob": "1970-05-12", "team": "DC Kraken Dřínov" },
  { "name": "Alán Petr", "dob": "1984-03-30", "team": "DC Kraken Dřínov" },
  { "name": "Kučera Jan", "dob": "1984-06-07", "team": "DC Kraken Dřínov" },
  { "name": "Kučírek Ladislav", "dob": "1979-04-02", "team": "DC Kraken Dřínov" },
  { "name": "Navrátil Josef", "dob": "1969-05-16", "team": "DC Kraken Dřínov" },
  { "name": "Horňáček Miloš", "dob": "1975-07-26", "team": "DC Kraken Dřínov" },
  { "name": "Štěpánek Martin", "dob": "1989-02-10", "team": "DC Kraken Dřínov" },
  { "name": "Zahradník Jakub", "dob": "2002-03-22", "team": "DC Kraken Dřínov" },
  { "name": "Peňčík René", "dob": "1969-09-02", "team": "AK Kojetín" },
  { "name": "Charvát Vít", "dob": "1967-02-22", "team": "AK Kojetín" },
  { "name": "Večerka René", "dob": "1994-10-28", "team": "AK Kojetín" },
  { "name": "Fiury František", "dob": "1959-05-10", "team": "AK Kojetín" },
  { "name": "Oplocký Petr", "dob": "1989-06-23", "team": "AK Kojetín" },
  { "name": "Konečný David", "dob": "1981-01-05", "team": "AK Kojetín" },
  { "name": "Ďurian Josef", "dob": null, "team": "AK Kojetín" },
  { "name": "Navrátil Lukáš", "dob": "1988-03-16", "team": "Draci Počenice" },
  { "name": "Tichánek Marcel", "dob": "1984-03-27", "team": "Draci Počenice" },
  { "name": "Urban Luděk", "dob": "1981-03-04", "team": "Draci Počenice" },
  { "name": "Gröpl Jan", "dob": "1986-03-28", "team": "Draci Počenice" },
  { "name": "Bureš Miroslav", "dob": "1984-04-05", "team": "Draci Počenice" },
  { "name": "Vojtek Jiří", "dob": "1976-11-08", "team": "Draci Počenice" },
  { "name": "Čechová Ariana", "dob": null, "team": "Draci Počenice" },
  { "name": "Daněk Pavel", "dob": "1986-09-13", "team": "Draci Počenice" },
  { "name": "Zedníček Martin", "dob": "1970-06-14", "team": "Dark Horse Moštárna" },
  { "name": "Míclo Josef", "dob": "1961-06-10", "team": "Dark Horse Moštárna" },
  { "name": "Pluhař Zdeněk", "dob": "1984-11-08", "team": "Dark Horse Moštárna" },
  { "name": "Hys Tomáš", "dob": "1982-06-27", "team": "Dark Horse Moštárna" },
  { "name": "Dvořák Vojtěch", "dob": "1987-11-17", "team": "Dark Horse Moštárna" },
  { "name": "Gučka Veronika", "dob": "1987-12-08", "team": "Dark Horse Moštárna" },
  { "name": "Jurka Michal", "dob": "1974-02-09", "team": "Dark Horse Moštárna" },
  { "name": "Helis Petr", "dob": "1979-02-09", "team": "Dark Horse Moštárna" },
  { "name": "Stratílalová Alena", "dob": "1973-08-18", "team": "Dark Horse Moštárna" }
];

// Team name mappings to handle inconsistencies
const teamNameMap = new Map([
  ["Češi křivé šipky", "Cech křivé šipky"],
  ["Hospodka Kanada", "Hospoda Kanada"],
  ["SK Pivní psi Chropyně", "ŠK Pivní psi Chropyně"]
]);

async function main() {
  console.log('Updating players database...');

  // Get season
  const season = await prisma.season.findFirst({
    where: { name: '2024/2025' }
  });

  if (!season) {
    console.error('Season 2024/2025 not found!');
    return;
  }

  // Get all teams
  const teams = await prisma.team.findMany({
    where: { seasonId: season.id }
  });

  const teamMap = new Map();
  for (const team of teams) {
    teamMap.set(team.name, team.id);
  }

  let newPlayers = 0;
  let existingPlayers = 0;

  // Process each player
  for (const playerData of updatedPlayers) {
    let teamName = playerData.team;
    
    // Check if we need to map the team name
    if (teamNameMap.has(teamName)) {
      teamName = teamNameMap.get(teamName)!;
    }

    const teamId = teamMap.get(teamName);
    if (!teamId) {
      console.log('Team not found for player:', playerData.name, 'team:', playerData.team);
      continue;
    }

    const existingPlayer = await prisma.player.findFirst({
      where: {
        name: playerData.name,
        teamId: teamId
      }
    });

    if (!existingPlayer) {
      const player = await prisma.player.create({
        data: {
          name: playerData.name,
          teamId: teamId,
          role: 'hráč'
        },
      });
      
      // Create player stats for the season
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          seasonId: season.id,
        },
      });

      console.log('Created player:', player.name, 'for team:', teamName);
      newPlayers++;
    } else {
      existingPlayers++;
    }
  }

  console.log(`\nUpdate complete:`);
  console.log(`- New players added: ${newPlayers}`);
  console.log(`- Existing players skipped: ${existingPlayers}`);
  console.log(`- Total players processed: ${updatedPlayers.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });