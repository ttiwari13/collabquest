// AdvertisementSection.jsx
import React, { forwardRef } from "react";
import pic4 from "../assets/pic4.png";
const AdvertisementSection = forwardRef(function AdvertisementSection(props, ref) {
  return (
    <section
      ref={ref}
      className="w-full bg-gradient-to-r from-[#265B63] to-[#CAB964] py-12 flex justify-center items-center"
    >
      <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row items-center gap-8 px-6 md:px-0">
        {/* Ad Image */}
        <img
          src={pic4}// Replace with your banner image path
          alt="Special Offer"
          className="w-48 h-48 object-contain rounded-xl shadow-lg bg-gradient-to-r from-[#265B63] to-[#CAB964]"
        />
        {/* Ad Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow">
            🚀 Unlock Premium Collaboration!
          </h3>
          <p className="text-lg text-[#265B63] font-medium mb-6 bg-[#CAB964]/80 rounded-lg px-4 py-2 inline-block">
            Get exclusive access to advanced workspace features, priority support, and more. Upgrade now and boost your team's productivity!
          </p>
          <br />
          <a
            href="/pricing"
            className="inline-block mt-2 px-8 py-3 rounded-full bg-[#265B63] text-[#CAB964] font-bold text-lg shadow-lg hover:bg-[#CAB964] hover:text-[#265B63] transition-colors duration-200"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </section>
  );
});

export default AdvertisementSection;
