import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nepřihlášený uživatel' }, { status: 401 });
    }

    const { pin } = await request.json();
    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'Neplatný PIN kód' }, { status: 400 });
    }

    // Get match details
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    if (!match) {
      return NextResponse.json({ error: 'Zápas nenalezen' }, { status: 404 });
    }

    // Check if user is member of one of the playing teams
    const userTeamId = session.user.player?.team.id;
    const isTeamMember = userTeamId === match.homeTeamId || userTeamId === match.awayTeamId;
    
    if (!isTeamMember) {
      return NextResponse.json({ 
        error: 'Můžete zadávat výsledky pouze zápasů svého týmu' 
      }, { status: 403 });
    }

    // Find the captain of user's team
    const teamId = userTeamId;
    const captain = await prisma.user.findFirst({
      where: {
        role: 'kapitán',
        player: {
          teamId: teamId
        }
      }
    });

    if (!captain) {
      return NextResponse.json({ 
        error: 'Kapitán týmu nenalezen' 
      }, { status: 404 });
    }

    if (!captain.captainPin) {
      return NextResponse.json({ 
        error: 'Kapitán nemá nastaven PIN kód' 
      }, { status: 400 });
    }

    // Verify PIN using bcrypt
    const isValidPin = await bcrypt.compare(pin, captain.captainPin);
    if (!isValidPin) {
      return NextResponse.json({ 
        error: 'Nesprávný PIN kód' 
      }, { status: 403 });
    }

    // Grant temporary access (store in session or JWT)
    return NextResponse.json({ 
      success: true, 
      message: 'PIN ověřen - přístup povolen',
      captainName: captain.name
    });

  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json({ 
      error: 'Chyba při ověřování PIN kódu' 
    }, { status: 500 });
  }
}