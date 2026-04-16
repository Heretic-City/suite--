"use client";

import { useRef } from "react";
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
  return <div className={`bg-[url('/sprite-sheet.png')] bg-no-repeat ${className || ""}`} style={spriteMap[name]} />;
};

export default function Home() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Timelines (Exactly preserved from your original code)
  const text1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.15, 1], [1, 1, 0, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0, 0.15, 0.2, 0.35, 0.4, 1], [0, 0, 1, 1, 0, 0]);
  const text3Opacity = useTransform(scrollYProgress, [0, 0.4, 0.45, 0.55, 0.6, 1], [0, 0, 1, 1, 0, 0]);
  const text4Opacity = useTransform(scrollYProgress, [0, 0.6, 0.65, 0.75, 0.8, 1], [0, 0, 1, 1, 0, 0]);
  const text5Opacity = useTransform(scrollYProgress, [0, 0.8, 0.85, 1], [0, 0, 1, 1]);
  const vaultOpacity = useTransform(scrollYProgress, [0.05, 0.15, 1], [0, 1, 1]);
  const xrpY = useTransform(scrollYProgress, [0.15, 0.35], [0, 150]); 
  const xrpScale = useTransform(scrollYProgress, [0.05, 0.1, 0.25, 0.27], [0.5, 1, 1, 0]);
  const xrpInsideOpacity = useTransform(scrollYProgress, [0.25, 0.27, 1], [1, 0, 0]);
  const walletOpacity = useTransform(scrollYProgress, [0.3, 0.35, 1], [0, 1, 1]);
  const sxrpOpacity = useTransform(scrollYProgress, [0.35, 0.4, 0.55, 0.6], [0, 1, 1, 0]);
  const sxrpX = useTransform(scrollYProgress, [0.4, 0.6], [0, -310]); 
  const sxrpScale = useTransform(scrollYProgress, [0.55, 0.6], [1, 0.5]); 
  const greenPulseOpacity = useTransform(scrollYProgress, [0.4, 0.42, 1], [0, 1, 1]);
  const greenPulseClip = useTransform(scrollYProgress, [0.4, 0.48], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);
  const hxtOpacity = useTransform(scrollYProgress, [0.45, 0.5, 0.6, 0.65], [0, 1, 1, 0]);
  const hxtX = useTransform(scrollYProgress, [0.5, 0.65], [310, 0]); 
  const hxtScale = useTransform(scrollYProgress, [0.6, 0.65], [1, 0.5]); 
  const orangeFuelOpacity = useTransform(scrollYProgress, [0.55, 0.57, 1], [0, 1, 1]);
  const orangeFuelClip = useTransform(scrollYProgress, [0.55, 0.62], ["inset(0 0% 0 100%)", "inset(0 0% 0 0)"]);
  const bgOpacity = useTransform(scrollYProgress, [0.3, 0.5, 1], [0, 1, 1]);

  return (
    /* 🚨 THE TRACK: Defines how much scrolling room we have. 500vh ensures Desktop feels right. */
    <div ref={containerRef} className="relative h-[500vh] bg-[#0a0f16] text-base-content">
      
      {/* 🚨 THE STICKY STAGE: This stays glued to the viewport while you scroll through the 500vh track */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Background */}
        <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
          <Sprite name="lattice" />
        </motion.div>

        {/* Storytelling Text */}
        <div className="absolute top-24 z-50 text-center px-5 w-full flex justify-center pointer-events-none">
          <motion.div style={{ opacity: text1Opacity }} className="absolute">
            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 drop-shadow-md">"Bridging the Unbridgeable."</h1>
            <p className="text-lg opacity-70">Scroll to initialize the Heretic City Vault sequence...</p>
          </motion.div>
          <motion.div style={{ opacity: text2Opacity }} className="absolute">
            <h1 className="text-3xl md:text-5xl font-bold text-neutral-content mb-2">Securing the Asset</h1>
            <p className="text-lg opacity-70">Depositing native XRP into the isolated Heretic City Vault.</p>
          </motion.div>
          <motion.div style={{ opacity: text3Opacity }} className="absolute">
            <h1 className="text-3xl md:text-5xl font-bold text-success mb-2 drop-shadow-md">Minting sXRP</h1>
            <p className="text-lg opacity-70">Synthesizing the Starknet equivalent payload...</p>
          </motion.div>
          <motion.div style={{ opacity: text4Opacity }} className="absolute">
            <h1 className="text-3xl md:text-5xl font-bold text-warning mb-2 drop-shadow-md">Injecting HXT</h1>
            <p className="text-lg opacity-70">Fueling the liquid pool with native Heretic token architecture.</p>
          </motion.div>
          <motion.div style={{ opacity: text5Opacity }} className="absolute">
            <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2 drop-shadow-md">Bridge Complete</h1>
            <p className="text-lg opacity-70">Ready for deployment.</p>
          </motion.div>
        </div>

        {/* Asset Animation Stage */}
        <div className="relative w-full max-w-4xl h-[400px] z-10 flex items-center justify-center mt-10 pointer-events-none">
          <motion.div style={{ opacity: walletOpacity }} className="absolute z-20 w-20 h-20 bg-base-300/50 rounded-2xl border border-success/30 flex items-center justify-center backdrop-blur-sm left-[10%]">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </motion.div>
          <motion.div style={{ opacity: vaultOpacity }} className="absolute z-20 top-[120px]">
            <Sprite name="vault" className="drop-shadow-2xl rounded-xl" />
          </motion.div>
          <motion.div style={{ opacity: xrpInsideOpacity, scale: xrpScale, y: xrpY, x: -18 }} className="absolute z-30 top-[10px] left-1/2 -translate-x-1/2">
            <Sprite name="xrp" />
          </motion.div>
          <motion.div style={{ opacity: greenPulseOpacity, clipPath: greenPulseClip }} className="absolute z-10 top-[230px] left-[150px] animate-pulse">
            <Sprite name="greenPulse" />
          </motion.div>
          <motion.div style={{ opacity: sxrpOpacity, x: sxrpX, scale: sxrpScale }} className="absolute z-30 top-[220px]">
            <Sprite name="sxrp" className="shadow-[0_0_15px_rgba(74,222,128,0.6)]" />
          </motion.div>
          <motion.div style={{ opacity: orangeFuelOpacity, clipPath: orangeFuelClip }} className="absolute z-10 top-[230px] right-[150px] animate-pulse">
            <Sprite name="orangeFuel" />
          </motion.div>
          <motion.div style={{ opacity: hxtOpacity, x: hxtX, scale: hxtScale }} className="absolute z-30 top-[200px]">
            <Sprite name="hxt" className="shadow-[0_0_15px_rgba(251,146,60,0.6)]" />
          </motion.div>
        </div>
        
        {/* Navigation Button */}
        <motion.div style={{ opacity: text5Opacity }} className="absolute bottom-20 z-50 pointer-events-auto">
          {/* 🚨 Navigate to Explorer */}
          <Link href="/explorer">
            <button className="btn btn-primary btn-lg shadow-[0_0_20px_rgba(var(--p),0.5)] hover:scale-105 transition-transform">
              Enter Heretic City
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}