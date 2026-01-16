
import React from 'react';

interface SVGViewerProps {
  svgContent: string;
  title: string;
}

export const SVGViewer: React.FC<SVGViewerProps> = ({ svgContent, title }) => {
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 w-full overflow-hidden">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">{title}</h4>
      <div 
        className="w-full h-auto flex justify-center items-center botanical-drawing"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};
