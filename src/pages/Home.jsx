import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaPlay, FaStar, FaUsers, FaTshirt, FaCamera, FaHeart, FaShoppingBag, FaRocket, FaGem, FaLightbulb, FaAtom, FaDna, FaRobot } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import { quantumColorGenerator } from '../ui/quantumColors';

export default function Home() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [quantumPalette, setQuantumPalette] = useState(null);
  const [particleSystem, setParticleSystem] = useState([]);

  // Initialize quantum color palette and particle system
  useEffect(() => {
    const palette = quantumColorGenerator.generateEmotionPalette('confidence', 0.9, {
      colorDNA: { warmTones: 0.7, coolTones: 0.3, brights: 0.8, neutrals: 0.2 }
    });
    setQuantumPalette(palette);
    
    // Initialize particle system
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2
    }));
    setParticleSystem(particles);
  }, []);

  // Track mouse movement for parallax and quantum field effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
      
      // Update particle system based on mouse interaction
      setParticleSystem(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx + (Math.random() - 0.5) * 0.1,
        y: particle.y + particle.vy + (Math.random() - 0.5) * 0.1,
        vx: particle.vx * 0.99,
        vy: particle.vy * 0.99
      })));
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Hero slides with quantum fashion themes
  const heroSlides = [
    {
      title: "QUANTUM FASHION",
      subtitle: "Reality-Bending Style Technology",
      description: "Experience clothing that adapts to your biometrics and emotional state in real-time"
    },
    {
      title: "NEURAL STYLING",
      subtitle: "AI-Powered Fashion Intelligence", 
      description: "Advanced algorithms that understand your style DNA better than you do"
    },
    {
      title: "HOLOGRAPHIC COUTURE",
      subtitle: "Future Fashion Today",
      description: "Immersive try-on experiences with photon-level fabric simulation"
    }
  ];

  // Revolutionary features with quantum properties
  const features = [
    {
      icon: FaAtom,
      title: "QUANTUM PHYSICS MODELING",
      subtitle: "Molecular Fashion Simulation",
      description: "Experience clothing behavior at the atomic level with our quantum fabric physics engine",
      accent: "emerald",
      particles: 15
    },
    {
      icon: FaDna,
      title: "BIOMETRIC ADAPTATION",
      subtitle: "DNA-Based Style Matching",
      description: "Clothing that responds to your genetic markers, mood, and physiological state",
      accent: "cyan",
      particles: 20
    },
    {
      icon: FaRobot,
      title: "NEURAL CONSCIOUSNESS",
      subtitle: "Self-Aware Fashion AI",
      description: "AI that learns your style preferences and evolves your wardrobe autonomously",
      accent: "teal",
      particles: 25
    }
  ];

  // Auto-rotate features and hero slides
  useEffect(() => {
    const featureInterval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    
    return () => {
      clearInterval(featureInterval);
      clearInterval(slideInterval);
    };
  }, [features.length, heroSlides.length]);

  const collections = [
    {
      name: "NEON FUTURE",
      category: "Streetwear",
      items: 127,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-emerald-400 to-cyan-400"
    },
    {
      name: "MIDNIGHT LUXURY",
      category: "Evening Wear",
      items: 89,
      image: "https://images.unsplash.com/photo-1566479179817-c0a7e4f56a59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-purple-400 to-pink-400"
    },
    {
      name: "DIGITAL COUTURE",
      category: "High Fashion",
      items: 156,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "from-blue-400 to-indigo-400"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: quantumPalette ? 
        `linear-gradient(135deg, ${quantumPalette.applications.backgrounds.primary}20, ${quantumPalette.applications.backgrounds.secondary}30, ${quantumPalette.applications.backgrounds.accent})`
        : 'linear-gradient(135deg, #FF006E20, #8338EC30, #3A86FF20)'
    }}>
      
      {/* Quantum Particle Field */}
      <div className="fixed inset-0 pointer-events-none">
        {particleSystem.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-cyan-400/50 to-purple-500/50 blur-sm"
            animate={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              scale: [0.5, 1, 0.5],
              opacity: [0.2, particle.opacity, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`
            }}
          />
        ))}
      </div>

      {/* Dynamic Holographic Background */}
      <div className="fixed inset-0 opacity-40">
        {/* Quantum Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 69, 19, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px) rotate(${mousePosition.x * 0.01}deg)`
        }}></div>
        
        {/* Floating Quantum Geometries */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute backdrop-blur-2xl`}
            animate={{
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotateY: [0, 180, 360]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              width: `${100 + i * 30}px`,
              height: `${100 + i * 30}px`,
              left: `${5 + i * 8}%`,
              top: `${10 + i * 7}%`,
              background: quantumPalette ? 
                `linear-gradient(${45 + i * 30}deg, ${quantumPalette.primary[i % quantumPalette.primary.length]}40, ${quantumPalette.accent[i % quantumPalette.accent.length]}20)`
                : `linear-gradient(${45 + i * 30}deg, #FF006E40, #8338EC20)`,
              clipPath: i % 6 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                        i % 6 === 1 ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' :
                        i % 6 === 2 ? 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' :
                        i % 6 === 3 ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' :
                        i % 6 === 4 ? 'circle(40% at 50% 50%)' :
                        'polygon(50% 0%, 90% 20%, 100% 60%, 75% 100%, 25% 100%, 0% 60%, 10% 20%)'
            }}
          />
        ))}
        
        {/* Holographic Light Rays */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute w-1 origin-bottom"
            animate={{
              height: ['0vh', '100vh', '0vh'],
              opacity: [0, 0.6, 0],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 11}%`,
              bottom: '0px',
              background: quantumPalette ? 
                `linear-gradient(to top, ${quantumPalette.accent[i % quantumPalette.accent.length]}80, transparent)`
                : `linear-gradient(to top, #00FFFF80, transparent)`
            }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <section className="relative">
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-12"
        >
          <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-sm tracking-widest">FUTURE.FASHION.NOW</span>
          </div>
          
          <motion.h1 
            className="text-7xl lg:text-8xl font-black mb-8 leading-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {heroSlides[currentSlide].title.split(' ').map((word, index) => (
              <motion.span
                key={index}
                className={index % 2 === 0 
                  ? "bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 bg-clip-text text-transparent" 
                  : "text-white"
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {word}{' '}
              </motion.span>
            ))}
          </motion.h1>

            <motion.p 
              className="text-2xl text-white mb-6 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {heroSlides[currentSlide].subtitle}
            </motion.p>
            
            <motion.p 
              className="text-lg text-white/80 mb-16 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Experience the next generation of virtual fashion with cutting-edge AI technology
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {user ? (
                <Link
                  to="/catalog"
                  className="group relative px-12 py-4 bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 text-black font-bold tracking-wide rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-rose-400/40"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <span>ENTER CYBERSPACE</span>
                    <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300 via-amber-300 to-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </Link>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group relative px-12 py-4 bg-gradient-to-r from-rose-400 via-amber-400 to-sky-400 text-black font-bold tracking-wide rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-rose-400/40"
                >
                  <span className="relative z-10 flex items-center space-x-3">
                    <span>JACK IN NOW</span>
                    <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-300 via-amber-300 to-sky-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
              )}
              
              <Link
                to="/try-on"
                className="group flex items-center space-x-3 px-10 py-4 bg-white/15 backdrop-blur-xl border border-white/30 text-white font-medium tracking-wide rounded-full hover:bg-white/25 transition-all duration-300"
              >
                <FaCamera className="w-5 h-5" />
                <span>NEURAL SCAN</span>
              </Link>
            </motion.div>
        </motion.div>
      </div>
    </section>

    {/* Cyber Features Grid */}
    <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm tracking-widest">NEURAL.SYSTEMS.ONLINE</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-black text-white mb-6">
              CYBER
              <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-amber-400 to-sky-400 bg-clip-text text-transparent">
                FASHION.SYS
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              Revolutionary neural networks interfacing with quantum fashion matrices
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                title: "AI NEURAL SCAN",
                description: "Quantum body mapping with molecular precision",
                icon: "🧠",
                gradient: "from-rose-400 to-orange-400",
                borderColor: "border-rose-400/30",
                step: "01"
              },
              {
                title: "HOLO PROJECTION",
                description: "Real-time 4D clothing visualization",
                icon: "🔮",
                gradient: "from-fuchsia-400 to-violet-500", 
                borderColor: "border-fuchsia-400/30",
                step: "02"
              },
              {
                title: "QUANTUM FITTING",
                description: "Molecular fabric simulation technology",
                icon: "⚡",
                gradient: "from-sky-400 to-cyan-500",
                borderColor: "border-sky-400/30",
                step: "03"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`group relative overflow-hidden rounded-3xl bg-black/50 backdrop-blur-xl border ${feature.borderColor} hover:border-white/40 transition-all duration-500`}
              >
                <div className="p-8 relative z-10">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-white to-gray-100 backdrop-blur-xl border-2 border-purple-500/80 rounded-2xl flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-black text-purple-600 font-mono">{feature.step}</span>
                  </div>
                  
                  <div className="text-6xl mb-6 text-center">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4 font-mono tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className={`w-full h-1 bg-gradient-to-r ${feature.gradient} rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works - Clear Numbered Steps */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-white font-mono text-sm tracking-widest">HOW.IT.WORKS</span>
            </div>
            
            <h2 className="text-6xl lg:text-7xl font-black text-white mb-6">
              THREE SIMPLE
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                STEPS
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get started with virtual fashion in three easy steps
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "UPLOAD YOUR PHOTO",
                description: "Take a photo or use your camera to capture your look",
                icon: FaCamera,
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-500/20 to-pink-500/20"
              },
              {
                step: "2", 
                title: "CHOOSE YOUR STYLE",
                description: "Browse our catalog and select items you want to try",
                icon: FaTshirt,
                color: "from-cyan-500 to-blue-500",
                bgColor: "from-cyan-500/20 to-blue-500/20"
              },
              {
                step: "3",
                title: "SEE THE MAGIC",
                description: "Watch as AI perfectly fits clothes to your body",
                icon: FaRocket,
                color: "from-emerald-500 to-teal-500",
                bgColor: "from-emerald-500/20 to-teal-500/20"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group relative"
                >
                  {/* Connection Line (not for last item) */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-24 left-full w-12 h-0.5 bg-gradient-to-r from-purple-400/50 to-transparent z-0" />
                  )}
                  
                  <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 group-hover:transform group-hover:-translate-y-2">
                    {/* Large Step Number */}
                    <div className="absolute -top-8 left-8">
                      <div className={`w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-2xl border-4 border-purple-500/30`}>
                        <span className="text-3xl font-black text-purple-600">{item.step}</span>
                      </div>
                      <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${item.color} opacity-20 rounded-3xl blur-lg`}></div>
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-white mb-4 font-mono tracking-wider text-center">
                      {item.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-center">
                      {item.description}
                    </p>
                    
                    {/* Gradient Border Animation */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Cyber Stats Matrix */}
      <section className="py-24 relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 via-amber-400/10 to-sky-400/10"></div>
          {/* Matrix Rain Effect */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 bg-gradient-to-b from-cyan-400/80 to-transparent"
              animate={{
                height: ['0px', '200px', '0px'],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "linear"
              }}
              style={{
                left: `${i * 5}%`,
                top: '0px'
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { value: "500K+", label: "NEURAL LINKS", sublabel: "Active brain-computer interfaces" },
              { value: "10M+", label: "HOLO SESSIONS", sublabel: "Virtual reality fittings completed" },
              { value: "99.9%", label: "ACCURACY RATE", sublabel: "Quantum measurement precision" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="text-7xl lg:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-400 bg-clip-text text-transparent mb-2 font-mono">
                    {stat.value}
                  </div>
                  <div className="absolute inset-0 text-7xl lg:text-8xl font-black text-cyan-400/10 blur-sm group-hover:blur-none transition-all duration-300">
                    {stat.value}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-mono tracking-wider">{stat.label}</h3>
                <p className="text-gray-400 font-light">{stat.sublabel}</p>
                
                {/* Cyber border effect */}
                <div className="mt-4 mx-auto w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Cyber CTA Terminal */}
      <section className="py-32 relative overflow-hidden">
        {/* Digital Grid Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px),
                linear-gradient(180deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          ></div>
          
          {/* Floating cyber elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 border border-cyan-400/50 bg-cyan-400/10"
              animate={{
                x: [0, 200, 0],
                y: [0, -100, 0],
                rotate: [0, 360, 0]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + i * 10}%`
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="bg-black/50 backdrop-blur-xl border border-cyan-400/30 rounded-3xl p-12">
              <h2 className="text-6xl lg:text-7xl font-black text-white mb-8 leading-tight font-mono">
                READY TO
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">
                  JACK.IN?
                </span>
              </h2>
              
              <p className="text-xl text-cyan-200 mb-12 leading-relaxed font-light">
                Initialize your neural connection to the fashion metaverse.
                <br />Your digital wardrobe awaits activation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {user ? (
                  <Link
                    to="/catalog"
                    className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold tracking-wide rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/50"
                  >
                    <span className="relative z-10 flex items-center space-x-3 font-mono">
                      <span>ENTER.MATRIX</span>
                      <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="group relative px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-bold tracking-wide rounded-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/50"
                  >
                    <span className="relative z-10 flex items-center space-x-3 font-mono">
                      <span>INITIALIZE.USER</span>
                      <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </button>
                )}
                
                <Link
                  to="/try-on"
                  className="group flex items-center space-x-3 px-10 py-5 bg-black/30 backdrop-blur-xl border border-purple-400/30 text-purple-400 font-medium tracking-wide rounded-full hover:bg-purple-400/10 transition-all duration-300"
                >
                  <FaCamera className="w-5 h-5" />
                  <span className="font-mono">NEURAL.SCAN</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab="signup"
      />
    </div>
  );
}
