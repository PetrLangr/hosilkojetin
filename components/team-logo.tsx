"use client";

import { useState } from 'react';
import { getTeamLogo } from '@/lib/team-logos';
import { Target } from 'lucide-react';

interface TeamLogoProps {
  teamName: string;
  className?: string;
  fallbackText?: string;
  showFallbackIcon?: boolean;
}

export function TeamLogo({ 
  teamName, 
  className = "w-full h-full object-contain", 
  fallbackText,
  showFallbackIcon = false 
}: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logoUrl = getTeamLogo(teamName);

  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-primary to-accent grid place-items-center text-white font-bold text-xs ${className.includes('rounded') ? '' : 'rounded'}`}>
        {showFallbackIcon ? (
          <Target className="h-6 w-6 text-white" />
        ) : (
          fallbackText || teamName.split(' ').map(word => word[0]).join('').slice(0, 3)
        )}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={teamName}
      className={className}
      style={{
        objectFit: 'contain',
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto'
      }}
      onError={() => setImageError(true)}
    />
  );
}