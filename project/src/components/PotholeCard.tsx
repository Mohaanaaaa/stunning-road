import React from 'react';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface PotholeCardProps {
  image: string;
  location: string;
  date: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
};

export default function PotholeCard({ image, location, date, severity, description }: PotholeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="relative h-48">
        <img 
          src={image} 
          alt="Pothole" 
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-4 right-4 ${severityColors[severity]} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
          <AlertTriangle size={16} />
          {severity.charAt(0).toUpperCase() + severity.slice(1)} Severity
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin size={18} />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <Calendar size={18} />
          <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>
        </div>
        <p className="text-gray-700">{description}</p>
      </div>
    </div>
  );
}