import React, { useRef, useState, useEffect } from 'react';
import ToggleMenu from './ToggleMenu';
import pic5 from "../assets/pic5.png"; // Left image
import pic6 from "../assets/pic6.png"; // Right image
import pic7 from "../assets/pic7.png"; // Top image
import pic8 from "../assets/pic8.png"; // Bottom image
import Footer from './Footer';
import FeaturesSection from './FeaturesSection';
import AdvertisementSection from './AdvertisementSection';

const Home = () => {
  const paraRef = useRef(null);
  const footerRef = useRef(null);
  const featuresRef = useRef(null);
  const adRef = useRef(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [showToggle, setShowToggle] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Hide ToggleMenu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setHasScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide ToggleMenu when footer is visible
  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowToggle(!entry.isIntersecting);
      },
      { root: null, threshold: 0.01 }
    );

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!paraRef.current) return;
    const rect = paraRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    paraRef.current.style.setProperty('--x', `${x}px`);
    paraRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <>
      <div className="bg-[#CAB964] relative min-h-screen text-black overflow-hidden">
        {/* Header Bar for All Screens - Keeps logo and toggle in line */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:px-12 lg:py-6 xl:px-16 xl:py-6">
          {/* Logo */}
          <img
            src="logocoll.png"
            alt="logo"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12"
          />

          {/* Toggle Menu - Only show when conditions are met */}
          {showToggle && !hasScrolled && (
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12">
              <ToggleMenu />
            </div>
          )}
        </div>

        {/* Main Container - Grid Layout for all 4 images + center text */}
        <div className="min-h-screen flex flex-col justify-center items-center p-4 pt-16 sm:p-6 sm:pt-18 md:p-8 md:pt-20 lg:p-12 lg:pt-20 xl:pt-22">
          
          {/* Top Image */}
          <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
            <img 
              src={pic7} 
              alt="Top" 
              className="w-28 h-auto object-contain
                         sm:w-36
                         md:w-44
                         lg:w-52
                         xl:w-60" 
            />
          </div>

          {/* Middle Section - Left Image + Text + Right Image */}
          <div className="flex items-center justify-center w-full max-w-7xl gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
            
            {/* Left Image */}
            <div className="flex-shrink-0">
              <img 
                src={pic5} 
                alt="Left" 
                className="w-20 h-auto object-contain
                           sm:w-24
                           md:w-28
                           lg:w-36
                           xl:w-44" 
              />
            </div>

            {/* Center Text */}
            <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-3xl">
              <p
                ref={paraRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className={`text-spotlight text-sm leading-5 font-medium text-center transition-all duration-200
                           sm:text-base sm:leading-6
                           md:text-lg md:leading-7
                           lg:text-xl lg:leading-8
                           xl:text-2xl xl:leading-10 ${
                  isHovering ? 'hovering' : ''
                }`}
              >
                Welcome to CollabQuest — your smart workspace for seamless team
                collaboration. Whether you're managing a group project, organizing a startup workflow,
                or planning class assignments, CollabQuest brings everything together in one place. With
                features like customizable workspaces, real-time task updates, live chat, file sharing,
                and AI-powered task suggestions, teams can stay organized, productive, and connected — 
                no matter where they are. Designed with a clean interface and built. CollabQuest is fast,
                responsive, and easy to use. Start building smarter, together.
              </p>
            </div>

            {/* Right Image */}
            <div className="flex-shrink-0">
              <img 
                src={pic6} 
                alt="Right" 
                className="w-16 h-auto object-contain
                           sm:w-20
                           md:w-24
                           lg:w-32
                           xl:w-40" 
              />
            </div>
          </div>

          {/* Bottom Image */}
          <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10">
            <img 
              src={pic8} 
              alt="Bottom" 
              className="w-28 h-auto object-contain
                         sm:w-36
                         md:w-44
                         lg:w-52
                         xl:w-60" 
            />
          </div>
        </div>
      </div>
      
      {/* Other Sections - Responsive */}
      <div className="w-full">
        <FeaturesSection ref={featuresRef} />
        <AdvertisementSection ref={adRef} />
        <Footer ref={footerRef} />
      </div>
    </>
  );
};

export default Home;