import React, { useRef, useState } from 'react';
import ToggleMenu from './ToggleMenu';
import pic5 from "../assets/pic5.png"; // Left image
import pic6 from "../assets/pic6.png"; // Right image
import pic7 from "../assets/pic7.png"; // Top image
import pic8 from "../assets/pic8.png"; // Bottom image

const Home = () => {
  const paraRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = paraRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    paraRef.current.style.setProperty('--x', `${x}px`);
    paraRef.current.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="bg-[#CAB964] relative min-h-screen px-8 pt-24 text-black flex flex-col items-center">
      {/* Logo */}
      <img
        src="logocoll.png"
        alt="logo"
        className="w-12 h-12 absolute top-6 left-16"
      />

      {/* Toggle Menu */}
      <div className="absolute w-12 h-12 top-8 right-16">
        <ToggleMenu />
      </div>

      {/* Top Image */}
      <img src={pic7} alt="Top" className="w-1/3 h-auto mb-6" />

      {/* Middle Row with Side Images and Paragraph */}
      <div className="flex justify-center items-center w-full px-4">
        {/* Left Image */}
        <img src={pic5} alt="Left" className="w-1/4 h-auto mr-4" />

        {/* Paragraph */}
        <p
          ref={paraRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`text-spotlight max-w-3xl text-xl leading-9 font-medium text-center transition-all duration-200 ${
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

        {/* Right Image */}
        <img src={pic6} alt="Right" className="w-1/4 h-auto ml-4" />
      </div>

      {/* Bottom Image */}
      <img src={pic8} alt="Bottom" className="w-1/3 h-auto mt-6" />
    </div>
  );
};

export default Home;
