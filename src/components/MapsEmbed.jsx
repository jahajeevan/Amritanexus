import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapsEmbed({ mapsLink, venueName = 'Event Venue' }) {
  const getEmbedUrl = (link) => {
    if (!link) return '';
    
    // If already an embed link
    if (link.includes('/embed') || link.includes('output=embed')) {
      return link;
    }

    // Try to extract query parameter q=
    try {
      const url = new URL(link);
      const q = url.searchParams.get('q');
      if (q) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
      
      // If it contains /place/
      if (link.includes('/place/')) {
        const parts = link.split('/place/');
        if (parts[1]) {
          const place = parts[1].split('/')[0].replace(/\+/g, ' ');
          return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
        }
      }
    } catch (e) {
      // Failed to parse URL, fallback to default
    }

    // Fallback: search by name or general campus
    return `https://maps.google.com/maps?q=${encodeURIComponent(venueName || 'Amrita Vishwa Vidyapeetham Ettimadai')}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const embedUrl = getEmbedUrl(mapsLink);

  return (
    <div className="rounded-xl overflow-hidden border border-ignite-border bg-ignite-secondary relative shadow-sm">
      {embedUrl ? (
        <iframe
          title={`Google Maps embed for ${venueName}`}
          src={embedUrl}
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
        />
      ) : (
        <div className="h-[250px] flex flex-col items-center justify-center text-ignite-muted p-5 text-center">
          <MapPin className="h-8 w-8 text-ignite-primary/40 mb-2 animate-bounce" />
          <p className="text-xs font-semibold">Interactive map unavailable</p>
          <p className="text-[10px] mt-1">Check the directions link below to locate the venue.</p>
        </div>
      )}
      <div className="bg-white border-t border-ignite-border p-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-ignite-text truncate pr-4">{venueName || 'Amrita Campus'}</span>
        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-ignite-primary hover:underline shrink-0"
          >
            Get Directions
          </a>
        )}
      </div>
    </div>
  );
}
