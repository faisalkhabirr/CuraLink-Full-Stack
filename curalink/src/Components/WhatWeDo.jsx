import React from 'react';
import './WhatWeDo.css'; // Ensure this CSS file exists
import { Link } from 'react-router-dom';

// Placeholder for feature data
const curaLinkFeatures = [
  {
    title: "Simplified Drug Information",
    description: "We translate complex medical jargon into clear, easy-to-understand language so you know exactly what your medications do.",
    link: "/"
  },
  {
    title: "Dosage & Interaction Alerts",
    description: "Get personalized alerts for potential drug interactions and dosage reminders tailored to your health profile.",
    link: "/"
  },
  {
    title: "Side Effect Tracker",
    description: "Log and monitor any side effects and easily share the data with your healthcare provider during your next visit.",
    link: "/"
  },
  {
    title: "Wellness & Usage Guides",
    description: "Access curated guides on how to correctly use different forms of medicine, from inhalers to injectables.",
    link: "/"
  },
];

function WhatWeDoSection() {
  return (
    <section className="whatWeDoContainer">
      
      {/* --- Left Column: Title and Background --- */}
      <div className="leftColumn show">
        <div className="leftContent">
          <h2 className="sectionTitle">What We Do?</h2>
          <p className="sectionSubtitle">Empowering health choices through clarity and information.</p>
        </div>
      </div>

      {/* --- Right Column: Scrollable Features --- */}
      <div className="rightColumnScroll">
        <div className="featureList">
          
          {curaLinkFeatures.map((feature, index) => (
            <Link 
              key={index} 
              to={feature.link} 
              className="featureCard"
            >
              <h3 className="cardTitle" id='whatWeDoCT'>{feature.title}</h3>
              <p className="cardDescription">{feature.description}</p>
              {/* <div className="cardLink">View Details →</div> */}
            </Link>
          ))}
          
        </div>
      </div>
      
    </section>
  );
}

export default WhatWeDoSection;