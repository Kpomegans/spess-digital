
import React from 'react';

interface InfoRowProps {
  label: string;
  content: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, content }) => (
  <div className="py-3 border-b border-slate-50 last:border-0">
    <span className="block text-xs font-bold text-emerald-700 uppercase mb-1">{label}</span>
    <p className="text-slate-700 leading-relaxed text-sm">{content}</p>
  </div>
);

interface ApparatusCardProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, string | string[] | any>;
}

export const ApparatusCard: React.FC<ApparatusCardProps> = ({ title, icon, data }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-emerald-200 transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 font-serif">{title}</h3>
      </div>
      <div className="space-y-1">
        {Object.entries(data).map(([key, value]) => {
          if (typeof value === 'string') {
            return <InfoRow key={key} label={key} content={value} />;
          }
          if (Array.isArray(value)) {
            return <InfoRow key={key} label={key} content={value.join(', ')} />;
          }
          if (typeof value === 'object' && value !== null) {
            // Nested object like InflorescenceData or OvaryData
            return (
              <div key={key} className="mt-4 pt-4 border-t border-emerald-50">
                <span className="text-sm font-bold text-emerald-800 italic block mb-2 capitalize">{key}</span>
                {Object.entries(value).map(([subKey, subVal]) => (
                    <InfoRow key={subKey} label={subKey} content={Array.isArray(subVal) ? subVal.join(', ') : subVal as string} />
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
