import { prisma } from '@/lib/prisma';

/**
 * Vybere sezónu podle parametru ?season= (id nebo název, např. "2018/2019").
 * Bez parametru vrací aktivní sezónu — původní chování všech API.
 */
export async function resolveSeason(request: Request) {
  const param = new URL(request.url).searchParams.get('season');

  if (param) {
    const season = await prisma.season.findFirst({
      where: { OR: [{ id: param }, { name: param }] },
    });
    if (season) return season;
  }

  return prisma.season.findFirst({ where: { isActive: true } });
}
