// Team logo mapping based on team names
export function getTeamLogo(teamName: string): string {
  const logoMapping: Record<string, string> = {
    'AK Kojetín': '/logos/akkojetin_logo.png',
    'Bochořský koblihy': '/logos/bochorskykoblihy_logo.png',
    'Cech křivé šipky': '/logos/cechkrivesipky_logo.png',
    'DC Kraken Dřínov': '/logos/dckrakendrinov_logo.png',
    'DC Stop Chropyně': '/logos/dcstopchropyne_logo.png',
    'Dark Horse Moštárna': '/logos/darkhorsemostarna_logo.png',
    'Draci Počenice': '/logos/dracipocenice_logo.png',
    'Hospoda Kanada': '/logos/hospodakanada_logo.png',
    'Kohouti Ludslavice': '/logos/kohoutiludslavice_logo.png',
    'Rychlí šneci Vlkoš': '/logos/rychlisnecivlkos_logo.png',
    'Stoned Lobo Ponies': '/logos/stonedloboponies_logo.png',
    'ŠK Pivní psi Chropyně': '/logos/skpivnipsichropyne_logo.png'
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
    'Dark Horse Moštárna': 'from-amber-500 via-slate-800 to-amber-600' // Golden + black horse
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
    'Dark Horse Moštárna': 'from-amber-50 via-slate-50 to-amber-100'
  };
  
  return backgroundGradients[teamName] || 'from-slate-50 to-slate-100';
}