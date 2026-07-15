'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface WelcomeAnimationProps {
       onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
       const letters = "LOKALL".split("");

       useEffect(() => {
              const timer = setTimeout(onComplete, 2200); // Slightly longer for better entry
              return () => clearTimeout(timer);
       }, [onComplete]);

       return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A] text-white overflow-hidden">
                     {/* Dynamic Background Particles */}
                     <div className="absolute inset-0 z-0">
                            {[...Array(15)].map((_, i) => (
                                   <motion.div
                                          key={i}
                                          className="absolute rounded-full bg-primary/20 blur-xl"
                                          style={{
                                                 width: Math.random() * 200 + 100,
                                                 height: Math.random() * 200 + 100,
                                                 left: `${Math.random() * 100}%`,
                                                 top: `${Math.random() * 100}%`,
                                          }}
                                          animate={{
                                                 x: [0, Math.random() * 100 - 50],
                                                 y: [0, Math.random() * 100 - 50],
                                                 scale: [1, 1.2, 1],
                                                 opacity: [0.1, 0.3, 0.1],
                                          }}
                                          transition={{
                                                 duration: Math.random() * 10 + 10,
                                                 repeat: Infinity,
                                                 ease: "linear",
                                          }}
                                   />
                            ))}
                            {/* Animated Glow Orbs */}
                            <motion.div
                                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"
                                   animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                                   transition={{ duration: 4, repeat: Infinity }}
                            />
                     </div>

                     <div className="relative z-10 text-center px-6">
                            <AnimatePresence mode="wait">
                                   <motion.div
                                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                   >
                                          {/* LOKALL Logo */}
                                          <motion.div
                                                 initial={{ rotate: -10, scale: 0.5, opacity: 0 }}
                                                 animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                                 transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                                                 className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center"
                                          >
                                                 <Image
                                                        src="/finallogo.jpeg"
                                                        alt="LOKALL"
                                                        width={180}
                                                        height={180}
                                                        className="object-contain rounded-xl"
                                                        priority
                                                 />
                                          </motion.div>

                                          {/* Bottom Progress Bar */}
                                          <div className="mt-12 w-48 h-[2px] bg-white/10 mx-auto rounded-full overflow-hidden">
                                                 <motion.div
                                                        className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                                                        initial={{ width: "0%" }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 2, ease: "easeInOut" }}
                                                 />
                                          </div>
                                   </motion.div>
                            </AnimatePresence>
                     </div>
              </div>
       );
}
