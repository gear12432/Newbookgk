import React, { useEffect, useRef } from 'react';

export const AdsterraBanner: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous ad instance if re-rendered
    containerRef.current.innerHTML = '';

    // Create an isolated iframe to execute Adsterra's script safely
    const iframe = document.createElement('iframe');
    iframe.style.width = '728px';
    iframe.style.height = '90px';
    iframe.style.border = '0';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';

    containerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              html, body {
                margin: 0;
                padding: 0;
                width: 728px;
                height: 90px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: transparent;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '395ee17b2d7288daf55c4fe140913a59',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highrevenueformat.com/395ee17b2d7288daf55c4fe140913a59/invoke.js"></script>
          </body>
        </html>
      `);
      doc.close();
    }
  }, []);

  return (
    <div className="w-full flex justify-center items-center overflow-hidden bg-slate-100 border-t border-slate-200 h-[50px] relative">
      <div 
        className="absolute flex items-center justify-center transform origin-center scale-[0.48] xs:scale-[0.52] sm:scale-[0.6] transition-transform"
        style={{ width: '728px', height: '90px' }}
        ref={containerRef}
      />
    </div>
  );
};
