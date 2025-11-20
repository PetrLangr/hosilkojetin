import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsPDF } from 'jspdf';

// Define font for Czech characters
const addCzechFont = (doc: jsPDF) => {
  doc.setFont('helvetica');
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch complete match data
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          include: {
            players: true,
            captain: true
          }
        },
        awayTeam: {
          include: {
            players: true,
            captain: true
          }
        },
        games: {
          orderBy: { order: 'asc' },
          include: {
            events: {
              include: {
                player: true
              }
            }
          }
        },
        season: true
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    addCzechFont(doc);

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('HOSPODSKÁ ŠIPKOVÁ LIGA', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('OFICIÁLNÍ ZÁPIS UTKÁNÍ', 105, 30, { align: 'center' });

    // Match info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sezóna: ${match.season.name}`, 20, 45);
    doc.text(`Kolo: ${match.round || '-'}`, 20, 52);
    doc.text(`Datum: ${match.startTime ? new Date(match.startTime).toLocaleDateString('cs-CZ') : '-'}`, 20, 59);

    // Teams
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${match.homeTeam.name}`, 20, 75);
    doc.text('vs', 105, 75, { align: 'center' });
    doc.text(`${match.awayTeam.name}`, 190, 75, { align: 'right' });

    // Game results table
    let yPos = 90;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VÝSLEDKY HER', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, 170, 8, 'F');
    doc.text('Hra', 25, yPos);
    doc.text('Typ', 45, yPos);
    doc.text('Domácí', 85, yPos);
    doc.text('Hosté', 125, yPos);
    doc.text('Výsledek', 165, yPos);

    yPos += 10;

    // Game results
    const gameTypes: Record<string, string> = {
      'single': '501 DO',
      'double_501': '501 DO (2v2)',
      'double_cricket': 'Cricket (2v2)',
      'triple_301': '301 DI/DO (3v3)',
      'tiebreak_701': '701 DO (3v3)'
    };

    let homeGamesWon = 0;
    let awayGamesWon = 0;
    let homeLegsTotal = 0;
    let awayLegsTotal = 0;

    match.games.forEach((game, index) => {
      const result = game.result as any;
      const gameType = gameTypes[game.type] || game.type;

      // Calculate score from result
      let homeScore = 0;
      let awayScore = 0;

      if (result) {
        if (game.type === 'double_cricket') {
          // Cricket is single round
          if (result.winner === 'home') {
            homeScore = 1;
            awayScore = 0;
            homeGamesWon++;
          } else {
            homeScore = 0;
            awayScore = 1;
            awayGamesWon++;
          }
        } else {
          // Count legs for 501/301 games
          if (result.legs) {
            result.legs.forEach((leg: any) => {
              if (leg.winner === 'home') homeScore++;
              else awayScore++;
            });
          } else if (result.homeLegs !== undefined) {
            homeScore = result.homeLegs;
            awayScore = result.awayLegs;
          }

          if (result.winner === 'home') homeGamesWon++;
          else if (result.winner === 'away') awayGamesWon++;

          homeLegsTotal += homeScore;
          awayLegsTotal += awayScore;
        }
      }

      doc.text(`${game.order}.`, 25, yPos);
      doc.text(gameType, 45, yPos);
      doc.text(match.homeTeam.shortName, 85, yPos);
      doc.text(match.awayTeam.shortName, 125, yPos);
      doc.text(`${homeScore}:${awayScore}`, 165, yPos);

      yPos += 7;

      // Add page break if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    // Final score
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos - 5, 170, 10, 'F');
    doc.text('CELKOVÝ VÝSLEDEK', 25, yPos);
    doc.text(`${homeGamesWon}`, 85, yPos, { align: 'center' });
    doc.text(`${awayGamesWon}`, 125, yPos, { align: 'center' });
    doc.text(`Legy: ${homeLegsTotal}:${awayLegsTotal}`, 165, yPos, { align: 'right' });

    // Player statistics (only singles)
    yPos += 20;
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.text('STATISTIKY HRÁČŮ (SINGLES)', 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Collect player stats from game events
    const playerStats = new Map<string, any>();

    match.games.forEach((game) => {
      if (game.type === 'single') {
        game.events.forEach((event) => {
          const playerId = event.playerId;
          if (!playerStats.has(playerId)) {
            playerStats.set(playerId, {
              player: event.player,
              S95: 0,
              S133: 0,
              S170: 0,
              CO3: 0,
              CO4: 0,
              CO5: 0,
              CO6: 0
            });
          }
          const stats = playerStats.get(playerId);
          if (stats[event.type] !== undefined) {
            stats[event.type]++;
          }
        });
      }
    });

    // Display stats
    playerStats.forEach((stats) => {
      const totalEvents = stats.S95 + stats.S133 + stats.S170 + stats.CO3 + stats.CO4 + stats.CO5 + stats.CO6;
      if (totalEvents > 0) {
        doc.text(`${stats.player.name}:`, 25, yPos);
        const eventStrings = [];
        if (stats.S95 > 0) eventStrings.push(`95+: ${stats.S95}x`);
        if (stats.S133 > 0) eventStrings.push(`133+: ${stats.S133}x`);
        if (stats.S170 > 0) eventStrings.push(`170+: ${stats.S170}x`);
        if (stats.CO3 > 0) eventStrings.push(`CO3: ${stats.CO3}x`);
        if (stats.CO4 > 0) eventStrings.push(`CO4: ${stats.CO4}x`);
        if (stats.CO5 > 0) eventStrings.push(`CO5: ${stats.CO5}x`);
        if (stats.CO6 > 0) eventStrings.push(`CO6: ${stats.CO6}x`);

        doc.text(eventStrings.join(', '), 70, yPos);
        yPos += 7;

        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
      }
    });

    // Signatures section
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PODPISY KAPITÁNŮ', 20, yPos);

    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Home captain
    doc.text('Domácí kapitán:', 20, yPos);
    doc.line(20, yPos + 10, 90, yPos + 10);
    doc.text(`${match.homeTeam.captain?.name || 'Neurčen'}`, 20, yPos + 15);

    // Away captain
    doc.text('Hostující kapitán:', 120, yPos);
    doc.line(120, yPos + 10, 190, yPos + 10);
    doc.text(`${match.awayTeam.captain?.name || 'Neurčen'}`, 120, yPos + 15);

    // Footer
    doc.setFontSize(8);
    doc.text(`Vygenerováno: ${new Date().toLocaleString('cs-CZ')}`, 105, 280, { align: 'center' });
    doc.text(`HŠL ${match.season.name} | www.hsl-liga.cz`, 105, 285, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="zapas_${match.homeTeam.shortName}_vs_${match.awayTeam.shortName}_kolo${match.round}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}