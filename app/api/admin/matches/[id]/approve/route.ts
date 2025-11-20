import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Update match status to approved/completed
    const match = await prisma.match.update({
      where: { id },
      data: {
        status: 'completed',
        endTime: new Date() // Mark as completed when approved
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error('Error approving match:', error);
    return NextResponse.json({ error: 'Failed to approve match' }, { status: 500 });
  }
}