import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { WelcomeSection } from '../components/WelcomeSection';
import { ProgramsSection } from '../components/ProgramsSection';
import { DailyRhythmSection } from '../components/DailyRhythmSection';
import { EnvironmentGallery } from '../components/EnvironmentGallery';
import { AdmissionsSection } from '../components/AdmissionsSection';
import { ContactFooter } from '../components/ContactFooter';
import { ScheduleVisitModal } from '../components/ScheduleVisitModal';
import { VideoTourModal } from '../components/VideoTourModal';

export const PublicHomePage: React.FC = () => {
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] font-sans antialiased text-slate-800">
      {/* Navigation Header */}
      <Navbar onOpenTourModal={() => setIsTourModalOpen(true)} />

      {/* Main Content Flow */}
      <main className="flex-grow">
        <Hero 
          onOpenTourModal={() => setIsTourModalOpen(true)} 
          onExploreVideo={() => setIsVideoModalOpen(true)} 
        />
        <WelcomeSection />
        <ProgramsSection onOpenTourModal={() => setIsTourModalOpen(true)} />
        <DailyRhythmSection />
        <EnvironmentGallery />
        <AdmissionsSection />
      </main>

      {/* Footer */}
      <ContactFooter onOpenTourModal={() => setIsTourModalOpen(true)} />

      {/* Modals */}
      <ScheduleVisitModal 
        isOpen={isTourModalOpen} 
        onClose={() => setIsTourModalOpen(false)} 
      />
      <VideoTourModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
        onOpenSchedule={() => setIsTourModalOpen(true)}
      />
    </div>
  );
};
