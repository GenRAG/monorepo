"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, Moon, GitGraph } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import { RAGFlowDiagram } from '@/components/ui/ragFlowDiagram';
import { AnimatedSplineBorder } from '@/components/ui/animatedSplineBorder';
import Image from 'next/image';

export default function GenRAGDesign() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" onMouseMove={handleMouseMove}>
      <div className="absolute inset-0 pointer-events-none opacity-80">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(220, 75, 35, 1)" strokeWidth="2"/>
          </pattern>
          
          <pattern id="gridBright" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 120, 80, 1)" strokeWidth="2"/>
          </pattern>
          
          <mask id="revealMask">
            <circle cx="50%" cy="50%" r="0" fill="white">
              <animate
                attributeName="r"
                values="0%;150%;0%"
                dur="6s"
                repeatCount="indefinite"
              />
            </circle>
          </mask>
        </defs>
        
        <g style={{ 
          transform: `translate(${Math.sin(mousePos.x / 100) * 5}px, ${Math.cos(mousePos.y / 100) * 5}px)`,
          transition: 'transform 1s ease-out'
        }}>
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#grid)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="25 25"
              dur="20s"
              repeatCount="indefinite"
            />
          </rect>
          <rect 
            width="100%" 
            height="100%" 
            fill="url(#gridBright)" 
            mask="url(#revealMask)"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="25 25"
              dur="20s"
              repeatCount="indefinite"
            />
          </rect>
        </g>

        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r="250"
          fill="url(#mouseGlow)"
          opacity="0.4"
        />

        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r="0"
          fill="none"
          stroke="rgba(255, 140, 60, 0.4)"
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            values="0;150"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>

      <div 
        className="absolute pointer-events-none"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 140, 60, 0.15) 0%, rgba(255, 100, 40, 0.08) 30%, transparent 70%)',
          filter: 'blur(30px)',
          transition: 'left 0.15s, top 0.15s',
          mixBlendMode: 'screen'
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black/60 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none"></div>

      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none"></div>

      <div className="relative z-20">
        <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl'}`}>
          <div className="flex items-center justify-between px-8 py-3">
            <div className="text-2xl font-bold">GenRAG</div>
            
            <nav className="flex items-center gap-6">
              <a href="#home" className="px-6 py-2 bg-orange-700/30 backdrop-blur-md text-white rounded-lg hover:bg-orange-700/40 transition border border-orange-600/20 shadow-lg">
                Home
              </a>
              <a href="#products" className="px-6 py-2 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-md rounded-lg transition">
                Watchlist
              </a>
              <a href="#about" className="px-6 py-2 text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-md rounded-lg transition">
                Leaderboards
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 backdrop-blur-md rounded-lg transition border border-white/10">
                <Moon size={20} />
              </button>
              <button className="px-6 py-2 bg-orange-700/80 backdrop-blur-md text-white rounded-lg hover:bg-orange-700 transition font-medium border border-orange-600/30 shadow-lg shadow-orange-600/20">
                Sign in
              </button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-8 pt-24">

          <div className="text-center mb-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <h1 className="text-7xl font-bold mb-4">GenRAG</h1>
            <h2 className="text-6xl font-bold mb-4">
              <GitGraph className="inline-block mr-4 text-orange-400" size={60} />
              <span className="text-orange-400">Designed by you</span>
              <span className="text-white">, powered by us.</span>
            </h2>
            <div>
              <button className="mt-6 px-8 py-2 bg-orange-700/80 cursor-pointer backdrop-blur-md text-white rounded-lg hover:bg-orange-700 transition font-medium border border-orange-600/30 shadow-lg shadow-orange-600/20">
                Get Started
              </button>
              <button className="mt-6 ml-4 px-8 py-2 bg-white/10 cursor-pointer backdrop-blur-md text-white rounded-lg hover:bg-white/10 transition font-medium border border-white/10 shadow-lg shadow-black/20">
                Learn More
              </button>
            </div>
            <section className="relative overflow-hidden py-10">
              <div className="container px-8">
                <div className="relative w-full animate-fadeInUp" style={{ animationDelay: '1.2s' }}>
                  <AnimatedSplineBorder>
                    <Spline
                      scene="https://prod.spline.design/6wq8PVEEPfkxrIjs/scene.splinecode"
                      className="w-full h-[300px] max-h-[550px] rounded-[18px]"
                    />
                  </AnimatedSplineBorder>
                </div>
              </div>
            </section>
            <section>
              <h1 className='text-6xl font-bold mb-4 mt-20'>
                Design RAG Workflows Effortlessly
              </h1>
              <p className="text-gray-300 text-xl mb-10">
                Effortlessly build your own customized RAG system using
                an intuitive, node-based interface.
              </p>
              <div className='text-left'>
                <p className='text-gray-500 text-xs'>Simplified exemple of RAG flow</p>
              </div>
              <RAGFlowDiagram />
            </section>
            <section className='flex mt-20'>
              <div className='flex-1 text-left'>
                <h1 className='text-6xl font-bold mb-4'>
                  Deploy, scale, and run your RAG automatically
                </h1>
                <p className="text-gray-300 text-xl mb-10">
                  Once designed, deploy your RAG system with a single click.
                  Our platform handles scaling, monitoring, and maintenance,
                  so you can focus on innovation.
                </p>
              </div>
              <div className='flex-1 ml-20'>
                <div className='bg-white/10 p-5 border border-white/10 rounded-2xl'>
                  <Image
                    src="/deploy.png"
                    alt="Deploy RAG Example"
                    width={800}
                    height={600}
                    className="rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </section>
          </div>
        </main>
        <footer className="py-8 border-t border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-400">
              © 2025 GenRAG All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}