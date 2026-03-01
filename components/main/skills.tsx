import { ContributeSection } from "@/components/sub/contribute-section";

export const Skills = () => {
  return (
    <section
      id="skills"
      className="flex flex-col items-center justify-center gap-3 relative py-10 sm:py-20 min-h-[600px] sm:min-h-[1000px] mt-0 sm:-mt-[200px] md:-mt-[340px]"
    >
      <div className="w-full absolute top-0 left-0" style={{ height: "600px" }}>
        <div className="w-full h-full z-[-10] opacity-30 absolute flex items-center justify-center bg-cover">
          <video
            className="w-full h-auto"
            preload="false"
            playsInline
            loop
            muted
            autoPlay
          >
            <source src="/videos/skills-bg.webm" type="video/webm" />
          </video>
        </div>
      </div>

      <div id="insights" className="w-full mt-[200px] sm:mt-[380px] md:mt-[480px] z-10 relative">
        <ContributeSection />
      </div>
    </section>
  );
};
