import React, { forwardRef } from "react";
import pic8 from "../assets/pic8.png";
import pic7 from "../assets/pic7.png";
import pic6 from "../assets/pic6.png";
import pic5 from "../assets/pic5.png";

const features = [
  {
    title: "Dynamic Workspaces",
    description: "Create, join, and manage multiple workspaces that adapt to your team's needs in real time.",
    image: pic8,
  },
  {
    title: "Proper Dashboard",
    description: "Track your work, progress, and productivity with a comprehensive dashboard.",
    image: pic7,
  },
  {
    title: "Team Collaboration",
    description: "Collaborate seamlessly with your team using chat, file sharing, and real-time updates.",
    image: pic6,
  },
  {
    title: "Focus Mode",
    description: "Minimize distractions and maximize productivity with a dedicated focus mode.",
    image: pic5,
  },
];

const FeaturesSection = forwardRef(function FeaturesSection(props, ref) {
  return (
    <section ref={ref} className="bg-[#CAB964] py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-[#265B63] mb-12">
        Interactive Features
      </h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="group bg-gradient-to-r from-[#265B63] to-[#CAB964] rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 p-8 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2"
          >
            <div className="w-24 h-24 bg-teal-50 rounded-xl flex items-center justify-center overflow-hidden mb-6">
              <img
                src={feature.image}
                alt={feature.title}
                className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-2"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#CAB964]">{feature.title}</h3>
            <p className="text-[#CAB964] text-base">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
});

export default FeaturesSection;
