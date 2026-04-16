"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const Sprite = ({ name, className }: { name: string; className?: string }) => {
  const spriteMap: Record<string, React.CSSProperties> = {
    vault: { backgroundPosition: "10% 12%", backgroundSize: "250%", width: "220px", height: "220px" },
    xrp: { backgroundPosition: "85% 4%", backgroundSize: "400%", width: "100px", height: "100px", borderRadius: "50%" },
    sxrp: { backgroundPosition: "66% 36%", backgroundSize: "450%", width: "110px", height: "110px", borderRadius: "50%" },
    hxt: { backgroundPosition: "100% 36%", backgroundSize: "450%", width: "110px", height: "110px", borderRadius: "50%" },
    lattice: { backgroundPosition: "100% 100%", backgroundSize: "200%", width: "100%", height: "100%" },
    greenPulse: { backgroundPosition: "18% 85%", backgroundSize: "380%", width: "140px", height: "100px" },
    orangeFuel: { backgroundPosition: "52% 85%", backgroundSize: "380%", width: "140px", height: "80px" },
  };
  return (
    <div 
      className={`bg-[url('/sprite-sheet.png')] bg-no-repeat ${className || ""}`} 
      style={{ ...spriteMap[name], transform: "translateZ(0)", backfaceVisibility: "hidden" }} 
    />
  );
};

export default function Home() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // 🚨 DEVICE DETECTION
  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 768);
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 🚨 CLEAN TEXT TIMELINES (No Overlap)
  const text1Opacity = useTransform(scrollYProgress, [0, 0.08, 0.12], [1, 1, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0.12, 0.18, 0.32, 0.38], [0, 1, 1, 0]);
  const text3Opacity = useTransform(scrollYProgress, [0.38, 0.45, 0.55, 0.62], [0, 1, 1, 0]);
  const text4Opacity = useTransform(scrollYProgress, [0.62, 0.7, 0.82, 0.88], [0, 1, 1, 0]);
  const text5Opacity = useTransform(scrollYProgress, [0.88, 0.95, 1], [0, 1, 1]);

  // Asset Animations
  const vaultOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const xrpY = useTransform(scrollYProgress, [0.15, 0.35], [0, 150]); 
  const xrpScale = useTransform(scrollYProgress, [0.05, 0.1, 0.25, 0.27], [0.5, 1, 1, 0]);
  const sxrpOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0]);
  const sxrpX = useTransform(scrollYProgress, [0.4, 0.6], [0, -310]); 
  const hxtOpacity = useTransform(scrollYProgress, [0.45, 0.5, 0.6, 0.65], [0, 1, 1, 0]);
  const hxtX = useTransform(scrollYProgress, [0.5, 0.65], [310, 0]); 

  return (
    <div ref={containerRef} className="relative h-[450vh] bg-[#0a0f16]">
      
      {/* 🚨 THE GLIDE STAGE */}
      <div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center overflow-hidden pointer-events-none z-10">
        
        {/* Background - Lattice stays light for both */}
        <motion.div style={{ opacity: 0.4 }} className="absolute inset-0 z-0 flex items-center justify-center">
          <Sprite name="lattice" />
        </motion.div>

        {/* Text Layer - Adjusted for mobile scale */}
        <div className="absolute top-28 md:top-32 z-50 text-center px-5 w-full">
          <motion.div style={{ opacity: text1Opacity }} className="absolute inset-0 flex flex-col items-center">
            <h1 className="text-2xl md:text-5xl font-bold text-primary">"Bridging the Unbridgeable."</h1>
          </motion.div>
          <motion.div style={{ opacity: text2Opacity }} className="absolute inset-0 flex flex-col items-center">
            <h1 className="text-2xl md:text-5xl font-bold text-neutral-content">Securing the Asset</h1>
          </motion.div>
          <motion.div style={{ opacity: text3Opacity }} className="absolute inset-0 flex flex-col items-center">
            <h1 className="text-2xl md:text-5xl font-bold text-success">Minting sXRP</h1>
          </motion.div>
          <motion.div style={{ opacity: text4Opacity }} className="absolute inset-0 flex flex-col items-center">
            <h1 className="text-2xl md:text-5xl font-bold text-warning">Injecting HXT</h1>
          </motion.div>
          <motion.div style={{ opacity: text5Opacity }} className="absolute inset-0 flex flex-col items-center">
            <h1 className="text-2xl md:text-5xl font-bold text-primary">Bridge Complete</h1>
          </motion.div>
        </div>

        {/* 🚨 ASSET STAGE */}
        <div className="relative w-full max-w-4xl h-[400px] z-20 flex items-center justify-center">
          
          <motion.div style={{ opacity: vaultOpacity }} className="absolute z-20 top-[100px]">
            {/* Desktop Glide: High quality | Mobile Glide: Clean and Fast */}
            <Sprite name="vault" className={!isMobile ? "drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" : ""} />
          </motion.div>

          <motion.div style={{ scale: xrpScale, y: xrpY, x: -18 }} className="absolute z-30 top-0 left-1/2 -translate-x-1/2">
            <Sprite name="xrp" />
          </motion.div>

          <motion.div style={{ opacity: sxrpOpacity, x: sxrpX }} className="absolute z-30 top-[200px]">
            <Sprite name="sxrp" className={!isMobile ? "shadow-[0_0_20px_rgba(74,222,128,0.4)]" : ""} />
          </motion.div>

          <motion.div style={{ opacity: hxtOpacity, x: hxtX }} className="absolute z-30 top-[180px]">
            <Sprite name="hxt" className={!isMobile ? "shadow-[0_0_20px_rgba(251,146,60,0.4)]" : ""} />
          </motion.div>

          {/* 🚨 DESKTOP ONLY GLOWS: Hidden on mobile glide to prevent memory crash */}
          {!isMobile && (
            <>
              <motion.div style={{ opacity: sxrpOpacity }} className="absolute z-10 top-[210px] left-[150px] blur-xl scale-150">
                <Sprite name="greenPulse" />
              </motion.div>
              <motion.div style={{ opacity: hxtOpacity }} className="absolute z-10 top-[210px] right-[150px] blur-xl scale-150">
                <Sprite name="orangeFuel" />
              </motion.div>
            </>
          )}
        </div>

        <motion.div style={{ opacity: text5Opacity }} className="absolute bottom-20 z-50 pointer-events-auto">
          <Link href="/explorer">
            <button className="btn btn-primary btn-lg px-12 shadow-2xl hover:scale-105 transition-all">
              Enter Heretic City
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}