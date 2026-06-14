import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Film, Award, Heart, Play } from 'lucide-react';
import parkingGarageImg from './assets/parking_garage.png';
import forestNightImg from './assets/forest_night.png';
import cityEyeImg from './assets/city_eye.png';
import vintageRoomImg from './assets/vintage_room.png';

const imageMap = {
  parking_garage: parkingGarageImg,
  forest_night: forestNightImg,
  city_eye: cityEyeImg,
  vintage_room: vintageRoomImg
};

// Dynamic shifting background gradients for each film theme
const bgGradients = [
  "radial-gradient(circle at 10% 20%, rgba(24, 52, 35, 0.45) 0%, rgba(8, 9, 10, 0.98) 75%), radial-gradient(circle at 90% 80%, rgba(12, 35, 25, 0.35) 0%, #0c0d0e 100%)",
  "radial-gradient(circle at 85% 20%, rgba(58, 15, 15, 0.45) 0%, rgba(8, 9, 10, 0.98) 75%), radial-gradient(circle at 15% 80%, rgba(42, 10, 10, 0.35) 0%, #0c0d0e 100%)",
  "radial-gradient(circle at 15% 15%, rgba(62, 35, 15, 0.45) 0%, rgba(8, 9, 10, 0.98) 70%), radial-gradient(circle at 85% 85%, rgba(45, 15, 35, 0.35) 0%, #0c0d0e 100%)",
  "radial-gradient(circle at 50% 10%, rgba(52, 38, 15, 0.45) 0%, rgba(8, 9, 10, 0.98) 75%), radial-gradient(circle at 50% 90%, rgba(28, 20, 8, 0.35) 0%, #0c0d0e 100%)"
];

// Fallback data if backend is offline
const fallbackProjects = [
  {
    id: 1,
    title: "BLUEPRINT NO. 7",
    tagline: "The structure of memory is built on hollow ground.",
    laurels: "OFFICIAL SELECTION — CANNES 2026",
    rating: 5.0,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "ELENA ROSTOVA, MARCUS VANCE",
      cinematography: "JEAN-PIERRE GAUTIER",
      runtime: "108 MINS",
      year: "2026",
      genre: "NEO-NOIR THRILLER"
    },
    synopsis: "In the concrete belly of an industrial labyrinth, an architect uncovers a blueprint that details not a building, but the exact reconstruction of a crime he has yet to commit.",
    imageKey: "parking_garage"
  },
  {
    id: 2,
    title: "THE LONG QUIET",
    tagline: "Some silences speak louder than sirens.",
    laurels: "WINNER BEST DIRECTOR — SUNDANCE 2026",
    rating: 4.8,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "SARAH CHEN, DAVID OLAOYE",
      cinematography: "ALEXIS KAUR",
      runtime: "95 MINS",
      year: "2025",
      genre: "PSYCHOLOGICAL DRAMA"
    },
    synopsis: "Lost deep within the ancient, whispered pines of the Pacific Northwest, a retired search-and-rescue operator confronts a haunting presence that feeds on the silence of the woods.",
    imageKey: "forest_night"
  },
  {
    id: 3,
    title: "ECHOES OF DUSK",
    tagline: "To see the city is to look within.",
    laurels: "OFFICIAL SELECTION — VENICE 2026",
    rating: 4.9,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "MAYA HARA, CHRISTIAN BALE",
      cinematography: "Z. RAYMOND",
      runtime: "122 MINS",
      year: "2026",
      genre: "SURREALIST SCI-FI"
    },
    synopsis: "A double-exposed journey through the subconscious of a sleepless city. A visual experiment blending urban sprawl with the intimate architecture of human vision.",
    imageKey: "city_eye"
  },
  {
    id: 4,
    title: "THE LAST CRAFTSMAN",
    tagline: "Time is the only antique that cannot be restored.",
    laurels: "AUDIENCE CHOICE — TIFF 2025",
    rating: 4.7,
    metadata: {
      directedBy: "Z. RAYMOND",
      starring: "ARTHUR PENDLETON",
      cinematography: "EMILY WRIGHT",
      runtime: "87 MINS",
      year: "2025",
      genre: "DOCUMENTARY / INDIE"
    },
    synopsis: "An intimate, macro-cinematic look inside a forgotten watchmaker's workshop, where the seconds tick away as a dying art form struggles against the digital age.",
    imageKey: "vintage_room"
  }
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [activeSlide, setActiveSlide] = useState(0); // Start at Slide 1 (normal index 0)
  const [selectedProject, setSelectedProject] = useState(null);
  const [ratingProject, setRatingProject] = useState(null);
  const [userHoverRating, setUserHoverRating] = useState(0);
  
  // Custom cursor states
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState('default'); // 'default', 'hovering-center', 'hovering-interactive'
  
  // Scroll and sizing state for continuous parallax
  const [scrollTop, setScrollTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Mouse position tracker for subtle parallax
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const activeSlideRef = useRef(0);
  const isProgrammaticScroll = useRef(false);
  const programmaticTimeoutRef = useRef(null);

  // Fetch projects from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`)
      .then(res => {
        if (!res.ok) throw new Error("Backend offline");
        return res.json();
      })
      .then(data => setProjects(data))
      .catch(err => {
        console.log("Using fallback project data: ", err.message);
      });
  }, []);

  // Monitor mouse movements for cursor position and parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setCursorPos({ x, y });

      // Calculate relative coordinate from screen center (-1 to 1)
      const relX = (x - window.innerWidth / 2) / (window.innerWidth / 2);
      const relY = (y - window.innerHeight / 2) / (window.innerHeight / 2);
      
      setMouseParallax({ x: relX, y: relY });

      // Detect center hover zone (center 20% of screen)
      const inCenterWidth = x > window.innerWidth * 0.4 && x < window.innerWidth * 0.6;
      const inCenterHeight = y > window.innerHeight * 0.4 && y < window.innerHeight * 0.6;

      // Check if mouse is currently over an interactive element
      const isOverInteractive = e.target.closest('button, a, .rating-interactive, .indicator-dot');

      if (isOverInteractive) {
        setCursorType('hovering-interactive');
      } else if (inCenterWidth && inCenterHeight) {
        setCursorType('hovering-center');
      } else {
        setCursorType('default');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track window resizing for accurate offset calculations
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      if (containerRef.current && projects.length > 0) {
        const targetScroll = (activeSlideRef.current + projects.length) * window.innerHeight;
        containerRef.current.scrollTop = targetScroll;
        setScrollTop(targetScroll);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [projects.length]);

  // Sync scroll height when projects load or screen dimensions update
  useEffect(() => {
    if (containerRef.current && projects.length > 0) {
      const targetScroll = (activeSlide + projects.length) * windowHeight;
      containerRef.current.scrollTop = targetScroll;
      setScrollTop(targetScroll);
    }
  }, [projects, windowHeight]);

  // Update slide reference ref
  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  // Bind keydown events for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (projects.length === 0) return;
      let nextIndex = activeSlideRef.current;

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        nextIndex = (nextIndex + 1) % projects.length;
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        nextIndex = (nextIndex - 1 + projects.length) % projects.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = projects.length - 1;
      }

      if (nextIndex !== activeSlideRef.current) {
        scrollToSlide(nextIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windowHeight, projects.length]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (programmaticTimeoutRef.current) {
        clearTimeout(programmaticTimeoutRef.current);
      }
    };
  }, []);

  // Scroll event handler for syncing active slide index natively with infinite looping
  const handleScroll = () => {
    if (!containerRef.current || projects.length === 0) return;
    
    const scrollY = containerRef.current.scrollTop;
    const setHeight = projects.length * windowHeight;
    
    // Check if we are near the absolute top or bottom boundaries of the 3-set loop
    if (scrollY < 0.5 * windowHeight) {
      // Near top of the first set -> jump forward by one set
      const newScrollY = scrollY + setHeight;
      isProgrammaticScroll.current = true;
      containerRef.current.scrollTop = newScrollY;
      setScrollTop(newScrollY);
      
      const index = Math.round(newScrollY / windowHeight) % projects.length;
      if (index !== activeSlideRef.current) {
        setActiveSlide(index);
      }

      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 50);
    } else if (scrollY > (projects.length * 3 - 1.5) * windowHeight) {
      // Near bottom of the third set -> jump backward by one set
      const newScrollY = scrollY - setHeight;
      isProgrammaticScroll.current = true;
      containerRef.current.scrollTop = newScrollY;
      setScrollTop(newScrollY);
      
      const index = Math.round(newScrollY / windowHeight) % projects.length;
      if (index !== activeSlideRef.current) {
        setActiveSlide(index);
      }

      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 50);
    } else {
      // Normal scroll within middle area
      setScrollTop(scrollY);
      
      if (isProgrammaticScroll.current) return;
      const index = Math.round(scrollY / windowHeight) % projects.length;
      if (index !== activeSlideRef.current) {
        setActiveSlide(index);
      }
    }
  };

  const scrollToSlide = (index) => {
    if (index < 0 || index >= projects.length) return;
    
    isProgrammaticScroll.current = true;
    setActiveSlide(index);
    
    const targetScroll = (index + projects.length) * windowHeight;
    setScrollTop(targetScroll);
    
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }

    if (programmaticTimeoutRef.current) {
      clearTimeout(programmaticTimeoutRef.current);
    }
    programmaticTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 800);
  };

  const handleIndicatorClick = (index) => {
    scrollToSlide(index);
  };

  const submitRating = (rating) => {
    if (!ratingProject) return;

    fetch(`${API_BASE_URL}/api/projects/${ratingProject.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    })
      .then(res => res.json())
      .then(data => {
        // Update local state
        setProjects(prev => prev.map(p => p.id === ratingProject.id ? data.project : p));
        setRatingProject(null);
      })
      .catch(err => {
        // Fallback local update if backend offline
        console.warn("Backend offline, updating local state only");
        setProjects(prev => prev.map(p => {
          if (p.id === ratingProject.id) {
            const newRating = parseFloat(((p.rating + rating) / 2).toFixed(1));
            return { ...p, rating: newRating };
          }
          return p;
        }));
        setRatingProject(null);
      });
  };

  // Helper to render stars
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="star" fill="currentColor" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} className="star half" fill="currentColor" style={{ opacity: 0.8 }} />);
      } else {
        stars.push(<Star key={i} className="star empty" />);
      }
    }
    return stars;
  };

  return (
    <>
      {/* Custom Circular Cursor */}
      <div 
        className={`custom-cursor ${cursorType === 'hovering-center' ? 'hovering-center' : ''} ${cursorType === 'hovering-interactive' ? 'hovering-interactive' : ''}`}
        style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
      >
        <span className="cursor-text">Scroll</span>
      </div>

      {/* Dynamic Background Glow */}
      <div 
        className="app-bg-glow" 
        style={{ background: bgGradients[activeSlide] }} 
      />

      {/* Cinematic Header overlay */}
      <header>
        <a href="#" className="logo">
          Z.<span>RAYMOND</span>
        </a>
        <div className="nav-links">
          {projects.map((p, index) => (
            <a 
              key={p.id} 
              href={`#slide-${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleIndicatorClick(index);
              }}
              className={activeSlide === index ? 'active' : ''}
            >
              {p.title.split(' ')[0]}
            </a>
          ))}
        </div>
      </header>

      {/* Right Side Navigation Dots */}
      <div className="scroll-indicator-container">
        {projects.map((_, index) => (
          <div
            key={index}
            className={`indicator-dot ${activeSlide === index ? 'active' : ''}`}
            onClick={() => handleIndicatorClick(index)}
          />
        ))}
      </div>

      {/* Scrollable Container (snap y mandatory) */}
      <div 
        className="scroll-container" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {[...projects, ...projects, ...projects].map((project, index) => {
          const originalIndex = index % projects.length;
          const isActive = originalIndex === activeSlide;
          // Calculate dynamic vertical parallax offset relative to scroll position
          const offset = scrollTop - index * windowHeight;
          // Since .slide-bg is now position: absolute, translating it by 'offset' keeps it static relative to the viewport.
          // By translating by 'offset * 0.85', we keep it mostly static but allow a subtle 15% parallax shift!
          const yTranslation = offset * 0.85;

          return (
            <section 
              key={`${project.id}-${index}`} 
              id={`slide-${project.id}-${index}`} 
              className="slide"
            >
              {/* Background Parallax Layer */}
              <div className="slide-bg-container">
                <div 
                  className="slide-bg"
                  style={{
                    backgroundImage: `url(${imageMap[project.imageKey]})`,
                    transform: `translate(${isActive ? mouseParallax.x * -15 : 0}px, ${(isActive ? mouseParallax.y * -15 : 0) + yTranslation}px) scale(1.25)`
                  }}
                />
              </div>

              {/* Black Gradient Vignette */}
              <div className="slide-overlay" />

              {/* Slide Content */}
              <div className="slide-content">
                {/* Left Side: Festival Laurels */}
                <div className="side-element laurels-container">
                  <motion.div 
                    className="laurel"
                    initial={{ opacity: 0, x: -50 }}
                    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.4 }}
                  >
                    <Award className="laurel-icon" style={{ color: 'var(--accent-color)', width: '24px', height: '24px', marginBottom: '0.4rem' }} />
                    <span className="laurel-text">{project.laurels.split('—')[0]}</span>
                    <span className="laurel-event">{project.laurels.split('—')[1]}</span>
                  </motion.div>
                </div>

                {/* Center Side: Film Titles & Primary Metadata */}
                <div className="main-details">
                  <motion.p 
                    className="tagline"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isActive ? { opacity: 0.8, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
                  >
                    {project.tagline}
                  </motion.p>
                  
                  <motion.h1 
                    className="film-title"
                    initial={{ opacity: 0, y: 60 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                    transition={{ type: "spring", stiffness: 45, damping: 18, delay: 0.2 }}
                  >
                    {project.title}
                  </motion.h1>

                  <motion.div 
                    className="film-credits"
                    initial={{ opacity: 0 }}
                    animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  >
                    <span>{project.metadata.genre}</span>
                    <span>DIR: {project.metadata.directedBy}</span>
                    <span>{project.metadata.year}</span>
                  </motion.div>

                  <motion.button 
                    className="explore-btn"
                    onClick={() => setSelectedProject(project)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.5 }}
                  >
                    Explore Details
                  </motion.button>
                </div>

                {/* Right Side: 5-Star Rating Visualizer */}
                <div className="side-element rating-container">
                  <motion.div 
                    className="star-rating"
                    initial={{ opacity: 0, x: 50 }}
                    animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                    transition={{ type: "spring", stiffness: 40, damping: 15, delay: 0.4 }}
                  >
                    <span className="rating-num">RATING: {project.rating} / 5</span>
                    <div className="stars">
                      {renderStars(project.rating)}
                    </div>
                    <span 
                      className="rating-interactive"
                      onClick={() => setRatingProject(project)}
                    >
                      [ Rate Film ]
                    </span>
                  </motion.div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Dynamic Detail Modal (AnimatePresence) */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            className="modal-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 150 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="close-modal"
                onClick={() => setSelectedProject(null)}
              >
                <X />
              </button>

              <div className="modal-left">
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-color)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                  {selectedProject.metadata.genre}
                </span>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <p className="modal-synopsis">{selectedProject.synopsis}</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="explore-btn" style={{ padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem' }}>
                    <Play size={12} fill="currentColor" /> Watch Trailer
                  </button>
                </div>
              </div>

              <div className="modal-right">
                <div className="metadata-row">
                  <span className="metadata-label">Directed By</span>
                  <span className="metadata-value">{selectedProject.metadata.directedBy}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Starring</span>
                  <span className="metadata-value">{selectedProject.metadata.starring}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Cinematography</span>
                  <span className="metadata-value">{selectedProject.metadata.cinematography}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Technical Data</span>
                  <span className="metadata-value">{selectedProject.metadata.runtime} / {selectedProject.metadata.year} / {selectedProject.metadata.genre}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Rating Interactive Overlay Modal */}
      <AnimatePresence>
        {ratingProject && (
          <motion.div 
            className="modal-overlay open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRatingProject(null)}
          >
            <motion.div 
              className="rating-modal open"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#fff' }}>
                Rate "{ratingProject.title}"
              </h3>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem' }}>
                Select rating to submit
              </p>
              
              <div className="rating-modal-stars">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star 
                    key={num}
                    className={`rating-modal-star ${(userHoverRating || 0) >= num ? 'selected' : ''}`}
                    fill="currentColor"
                    onMouseEnter={() => setUserHoverRating(num)}
                    onMouseLeave={() => setUserHoverRating(0)}
                    onClick={() => submitRating(num)}
                    style={{ width: '32px', height: '32px' }}
                  />
                ))}
              </div>

              <button 
                className="explore-btn"
                style={{ padding: '0.5rem 1.5rem', fontSize: '0.6rem', marginTop: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
                onClick={() => setRatingProject(null)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
