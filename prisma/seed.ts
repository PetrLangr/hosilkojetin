import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teams = [
  {
    "name": "AK Kojetín",
    "shortName": "AKK",
    "city": "Kojetín",
    "logoUrl": null
  },
  {
    "name": "Bochořský koblihy",
    "shortName": "BOK", 
    "city": "Bochoř",
    "logoUrl": null
  },
  {
    "name": "Cech křivé šipky",
    "shortName": "CKŠ",
    "city": "",
    "logoUrl": null
  },
  {
    "name": "DC Kraken Dřínov",
    "shortName": "DKD",
    "city": "Dřínov",
    "logoUrl": null
  },
  {
    "name": "DC Stop Chropyně",
    "shortName": "DSC",
    "city": "Chropyně",
    "logoUrl": null
  },
  {
    "name": "Dark Horse Moštárna",
    "shortName": "DHM",
    "city": "",
    "logoUrl": null
  },
  {
    "name": "Draci Počenice",
    "shortName": "DRP",
    "city": "Počenice",
    "logoUrl": null
  },
  {
    "name": "Hospoda Kanada",
    "shortName": "HKA",
    "city": "",
    "logoUrl": null
  },
  {
    "name": "Kohouti Ludslavice",
    "shortName": "KHL",
    "city": "Ludslavice",
    "logoUrl": null
  },
  {
    "name": "Rychlí šneci Vlkoš",
    "shortName": "RSV",
    "city": "Vlkoš",
    "logoUrl": null
  },
  {
    "name": "Stoned Lobo Ponies",
    "shortName": "SLP",
    "city": "",
    "logoUrl": null
  },
  {
    "name": "ŠK Pivní psi Chropyně",
    "shortName": "SPP",
    "city": "Chropyně",
    "logoUrl": null
  }
];

const players = [
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
  { "name": "Záhorovská Zdenka", "dob": "1955-08-28", "team": "Kohouti Ludslavice" }
];

async function main() {
  console.log('Seeding database...');

  // Check if season already exists
  let season = await prisma.season.findFirst({
    where: { name: '2024/2025' }
  });

  if (!season) {
    season = await prisma.season.create({
      data: {
        name: '2024/2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        isActive: true,
      },
    });
    console.log('Created season:', season.name);
  } else {
    console.log('Season already exists:', season.name);
  }

  // Create teams if they don't exist
  const teamMap = new Map();
  for (const teamData of teams) {
    let team = await prisma.team.findFirst({
      where: { 
        name: teamData.name,
        seasonId: season.id
      }
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          ...teamData,
          seasonId: season.id,
        },
      });
      console.log('Created team:', team.name);
    } else {
      console.log('Team already exists:', team.name);
    }
    
    teamMap.set(teamData.name, team.id);
  }

  // Create players
  for (const playerData of players) {
    const teamId = teamMap.get(playerData.team);
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

      console.log('Created player:', player.name, 'for team:', playerData.team);
    } else {
      console.log('Player already exists:', playerData.name);
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });