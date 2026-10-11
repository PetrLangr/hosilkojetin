// Oficiální loga ze starého webu HŠL (public/logos/official_*). Klíč je název týmu
// znormalizovaný (bez diakritiky, velikosti písmen a nealfanumerických znaků), aby
// sedělo i na varianty zápisu napříč sezónami ("Š Vepři K" i "Š VEPŘI K" i "...Kojetín").
// Pokrývá 6 současných týmů, které logo mají, a historické týmy z archivu.
// Týmy, které na starém webu měly jen zástupné "LOGO TÝMU", tu nejsou — spadnou na
// své současné logo (níže) nebo na výchozí obrázek.
const normalizeTeam = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

const officialLogos: Record<string, string> = {
  bochorskykoblihy: 'official_bochor.jpg',
  stonedloboponies: 'official_badastone.jpg',
  dckrakendrinov: 'official_dckrakendrinov.jpg',
  dckrakendrinova: 'official_dckrakendrinov.jpg',
  dckrakendrinovb: 'official_dckrakendrinov.jpg',
  dcracekchropyne: 'official_racek.jpg',
  dcstopchropyne: 'official_stop.jpeg',
  draci: 'official_draci.jpg',
  dracia: 'official_draci.jpg',
  dracipocenice: 'official_draci.jpg',
  dracib: 'official_dracci.jpg',
  draccipocenice: 'official_dracci.jpg',
  kinocity: 'official_Kinocity.jpg',
  kinocitykojetin: 'official_Kinocity.jpg',
  kromerizstilvi: 'official_lvi.png',
  medvedi: 'official_meda.jpg',
  panteri: 'official_panter.jpeg',
  panteri2016: 'official_panter.jpeg',
  rychlisnecivlkos: 'official_sneci.jpeg',
  sportbarbadaa: 'official_bada.png',
  sportbarbadab: 'official_bada.png',
  syslitvorovice: 'official_sysli.jpg',
  tygriprostejov: 'official_ty.jpg',
  sveprik: 'official_vepri.jpg',
  sveprikkojetin: 'official_vepri.jpg',
  sveprikb: 'official_prasatab.jpg',
  skbrablencikojetin: 'official_brablenci.jpg',
  // Hannibal Lecter měl na webu jednu variantu loga; v datech je zapsán mnoha způsoby
  hanniballecter: 'official_hannibal.jpg',
  skhanniballecter: 'official_hannibal.jpg',
  skhaniballecter: 'official_hannibal.jpg',
  hanniballectera: 'official_hannibal.jpg',
  hanniballecterb: 'official_hannibal.jpg',
  skhanniballectera: 'official_hannibal.jpg',
  skhanniballecterb: 'official_hannibal.jpg',
};

// Team logo mapping based on team names
export function getTeamLogo(teamName: string): string {
  const official = officialLogos[normalizeTeam(teamName)];
  if (official) return `/logos/${official}`;

  const logoMapping: Record<string, string> = {
    'AK Kojetín': '/logos/akkojetin_logo.png',
    'Bochořský koblihy': '/logos/bochorskykoblihy_logo.png',
    // Nové logo dodané s přihláškou na sezónu 2026/2027 (terč se třemi šipkami).
    // Předchozí verze zůstává v repozitáři jako cechkrivesipky_logo.png.
    'Cech křivé šipky': '/logos/cechkrivesipky_logo.jpg',
    'DC Kraken Dřínov': '/logos/dckrakendrinov_logo.png',
    'DC Stop Chropyně': '/logos/dcstopchropyne_logo.png',
    'Dark Horse Moštárna': '/logos/darkhorsemostarna_logo.png',
    'Draci Počenice': '/logos/dracipocenice_logo.png',
    'Heffron Prostějov': '/logos/heffronprostejov_logo.jpg',
    'Hospoda Kanada': '/logos/hospodakanada_logo.png',
    'Kohouti Ludslavice': '/logos/kohoutiludslavice_logo.png',
    'Rychlí šneci Vlkoš': '/logos/rychlisnecivlkos_logo.png',
    'Stoned Lobo Ponies': '/logos/stonedloboponies_logo.png',
    'ŠK Pivní psi Chropyně': '/logos/skpivnipsichropyne_logo.png',
    'Záhořani Prostějov': '/logos/zahoraniprostejov_logo.jpg'
  };

  return logoMapping[teamName] || '/logos/default-team.png';
}

// Team-specific gradients based on exact logo colors
export function getTeamGradient(teamName: string): string {
  const teamGradients: Record<string, string> = {
    'DC Stop Chropyně': 'from-emerald-800 to-emerald-900', // Dark forest green circle
    'Rychlí šneci Vlkoš': 'from-slate-800 via-emerald-600 to-amber-500', // Navy + green spiral + yellow
    'ŠK Pivní psi Chropyně': 'from-amber-400 to-orange-500', // Golden paw background
    'Bochořský koblihy': 'from-emerald-700 via-amber-500 to-orange-600', // Green + golden donut
    'Cech křivé šipky': 'from-red-700 to-red-800', // Deep red from logo
    'Hospoda Kanada': 'from-red-600 via-amber-500 to-red-700', // Red + golden beer mug
    'Kohouti Ludslavice': 'from-red-600 via-amber-200 to-red-700', // Red + cream rooster
    'Stoned Lobo Ponies': 'from-emerald-700 via-amber-400 to-emerald-800', // Green + golden horse
    'DC Kraken Dřínov': 'from-teal-500 to-teal-600', // Need to see this logo
    'AK Kojetín': 'from-indigo-500 to-indigo-600', // Need to see this logo
    'Draci Počenice': 'from-emerald-500 to-emerald-600', // Need to see this logo
    'Dark Horse Moštárna': 'from-amber-500 via-slate-800 to-amber-600', // Golden + black horse
    'Heffron Prostějov': 'from-green-800 via-amber-500 to-green-900', // Dark green banner + gold rim
    'Záhořani Prostějov': 'from-slate-600 to-slate-700' // Navy shield + crossed darts
  };
  
  return teamGradients[teamName] || 'from-slate-400 to-slate-500';
}

// Team background gradients for card headers (lighter versions)
export function getTeamBackgroundGradient(teamName: string): string {
  const backgroundGradients: Record<string, string> = {
    'DC Stop Chropyně': 'from-emerald-50 to-emerald-100',
    'Rychlí šneci Vlkoš': 'from-slate-50 via-emerald-50 to-amber-50', 
    'ŠK Pivní psi Chropyně': 'from-amber-50 to-orange-50',
    'Bochořský koblihy': 'from-emerald-50 via-amber-50 to-orange-50',
    'Cech křivé šipky': 'from-red-50 to-red-100',
    'Hospoda Kanada': 'from-red-50 via-amber-50 to-red-100',
    'Kohouti Ludslavice': 'from-red-50 via-amber-50 to-red-100',
    'Stoned Lobo Ponies': 'from-emerald-50 via-amber-50 to-emerald-100',
    'DC Kraken Dřínov': 'from-teal-50 to-teal-100',
    'AK Kojetín': 'from-indigo-50 to-indigo-100',
    'Draci Počenice': 'from-emerald-50 to-emerald-100',
    'Dark Horse Moštárna': 'from-amber-50 via-slate-50 to-amber-100',
    'Heffron Prostějov': 'from-green-50 via-amber-50 to-green-100',
    'Záhořani Prostějov': 'from-slate-50 to-slate-100'
  };
  
  return backgroundGradients[teamName] || 'from-slate-50 to-slate-100';
}