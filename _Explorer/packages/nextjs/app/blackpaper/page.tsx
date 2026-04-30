"use client";

import { useEffect, useState, useRef } from "react";
import Head from "next/head";

export default function Home() {
  const [sections, setSections] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch the JSON data
  useEffect(() => {
    fetch('/blackpaper.json')
      .then(res => res.json())
      .then(data => setSections(data.sections))
      .catch(err => console.error("JSON Load Error:", err));
  }, []);

  // Intersection Observer for the scroll animation
  useEffect(() => {
    if (!containerRef.current || sections.length === 0) return;

    const lines = containerRef.current.querySelectorAll(".scroll-line");
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
        }
      });
    }, { threshold: 0.2 });

    lines.forEach(line => observer.observe(line));

    return () => observer.disconnect();
  }, [sections]);

  // Helper to safely render inline code formatting
  const renderText = (text: string) => {
    return text.split("\n\n").map((paragraph, index) => {
      // Split the paragraph by backticks to find inline code
      const parts = paragraph.split(/`([^`]+)`/g);
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {parts.map((part, i) => 
            // Odd indices match the content inside the backticks
            i % 2 === 1 ? (
              <span key={i} className="bg-[#00FFC0]/10 text-[#00FFC0] px-1.5 py-0.5 rounded font-mono text-[0.95rem]">
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <>
      <Head>
        <title>HXT — The Black Paper</title>
      </Head>

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2a2a2a_0%,#0b0b0b_55%,#000_100%)] font-serif text-[#f4f1ea] py-16 px-5 relative">
        
        {/* The Black Paper Container */}
        <div className="relative max-w-5xl mx-auto p-8 md:p-16 bg-[linear-gradient(145deg,#111,#0a0a0a)] rounded-xl border border-[#00FFC0]/10 shadow-[0_0_60px_rgba(0,255,192,0.05),0_0_120px_rgba(0,0,0,0.9)] overflow-hidden group">
          
          {/* Scanline Animation */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,255,192,0.03)_0px,rgba(0,255,192,0.03)_1px,transparent_2px,transparent_4px)] animate-[scanMove_8s_linear_infinite]" />

          {/* Dynamic Content */}
          <div ref={containerRef} className="relative z-10">
            {sections.map((section, idx) => (
              <div key={idx} className="mb-24 scroll-line opacity-0 translate-y-10 blur-sm transition-all duration-1200 ease-out">
                
                {section.title && (
                  <h2 className="text-2xl md:text-3xl font-bold mb-5 text-[#ff8c3c]">
                    {section.title}
                  </h2>
                )}

                {section.content && renderText(section.content)}

                {/* Modules (Code Blocks and Routing Grids) */}
                {section.modules?.map((module: any, modIdx: number) => (
                  <div key={modIdx} className="bg-white/5 border border-[#00FFC0]/10 p-6 rounded-lg my-8 transition-all duration-300 hover:border-[#00FFC0]/35 hover:shadow-[0_0_30px_rgba(0,255,192,0.08)]">
                    
                    <h3 className="text-xl font-bold mb-3 text-[#00FFC0]">{module.title}</h3>

                    {module.type === "code-block" && (
                      <pre className="bg-[#0d1117] p-5 rounded-lg overflow-x-auto border border-[#00FFC0]/15 mt-4">
                        <code className="text-[#00FFC0] font-mono text-[0.95rem]">{module.code}</code>
                      </pre>
                    )}

                    {module.type === "routing-grid" && (
                      <>
                        {module.intro && renderText(module.intro)}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                          {module.table.map((row: any, rowIdx: number) => (
                            <div key={rowIdx} className="bg-[#00FFC0]/5 p-5 rounded-lg border border-[#00FFC0]/20">
                              <h3 className="text-lg font-bold text-[#00FFC0] mb-2">{row.method}</h3>
                              <p className="mb-2"><strong>Field:</strong> {row.field}</p>
                              <p className="mb-2"><strong>Logic:</strong> {row.logic}</p>
                              <p><strong>User:</strong> {row.user}</p>
                            </div>
                          ))}
                        </div>

                        {module.conclusion && <div className="mt-6">{renderText(module.conclusion)}</div>}
                      </>
                    )}
                  </div>
                ))}

                {/* Tokenomics Block */}
                {section.tokenomics && (
                  <div className="mt-8">
                    <p className="mb-6 font-bold text-lg">Total Supply: <span className="text-[#00FFC0]">{section.tokenomics.total_supply}</span></p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                      {section.tokenomics.distribution.map((item: any, itemIdx: number) => (
                        <div key={itemIdx} className="bg-[#00FFC0]/5 p-5 rounded-lg border border-[#00FFC0]/20 text-center">
                          <h3 className="text-3xl font-bold text-[#ff8c3c] mb-2">{item.percent}%</h3>
                          <p className="font-semibold">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    {section.tokenomics.additional_notes && (
                      <div className="mt-8">{renderText(section.tokenomics.additional_notes)}</div>
                    )}
                  </div>
                )}

                {section.conclusion && renderText(section.conclusion)}

              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Tailwind Custom Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanMove {
          from { transform: translateY(0); }
          to   { transform: translateY(40px); }
        }
        .reveal {
          opacity: 1 !important;
          transform: translateY(0) !important;
          filter: blur(0) !important;
          text-shadow: 0 0 6px rgba(255,140,60,0.4), 0 0 18px rgba(255,60,20,0.3);
        }
      `}} />
    </>
  );
}