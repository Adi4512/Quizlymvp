import { NavLink } from "react-router-dom";
const Hero = () => {
  return (
    <div className="relative min-h-screen w-screen bg-[url('/static/bg.png')] overflow-hidden">
      {/* Background abstract shapes (placeholders) */}

      {/* Glassmorphic Card */}
      <div className="absolute left-1/2 -translate-x-1/2 top-20 bottom-0 z-10 w-[80%] max-w-full">
        <div
          id="blur"
          className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-xl p-12 w-full h-full border border-white/40 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-14 mt-[-15px]">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center font-bold text-white text-lg"></div>
              <span className="font-bold text-lg text-white drop-shadow">
                Quizethic AI
              </span>
            </div>
            {/* Navigation */}
            <nav className="flex gap-8 text-white font-inter font-semibold text-base">
              <NavLink to="home" className="hover:text-white">
                Home
              </NavLink>
              <NavLink to="library" className="hover:text-white">
                Library
              </NavLink>
              <NavLink to="courses" className="hover:text-white">
                Courses
              </NavLink>
              <NavLink to="test" className="hover:text-white">
                Test
              </NavLink>
            </nav>
            {/* Sign up button */}
            <div className="">
              <button className="mr-4  border border-white/50 px-6 py-2 rounded-full text-white font-semibold hover:bg-white/50 transition ">
                Sign up
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            {/* Left: Title, subtitle, CTA */}
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow">
                Unleash Your Inner
                <br />
                Wizard of Wisdom
              </h1>
              <p className="text-white/80 mb-6">
                Embark on a Journey of Knowledge Exploration with Our Extensive
                Collection of Interactive Quizzes.
              </p>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition">
                Get it now
              </button>
            </div>
            {/* Right: Topic selection */}
            <div className="flex flex-col items-center">
              <div className="mt-28 text-white/80 mb-4 text-center">
                HI Aditya! WHAT TOPIC ARE YOU
                <br />
                INTERESTED IN?
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* Topic buttons (placeholders for icons) */}
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🎨</span>
                  <span>Art</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🔬</span>
                  <span>Science</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">⛅</span>
                  <span>Weather</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">⚛️</span>
                  <span>Physics</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🌍</span>
                  <span>Geography</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">➗</span>
                  <span>Math</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🗣️</span>
                  <span>Language</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">🔭</span>
                  <span>Astronomy</span>
                </button>
                <button className="flex flex-col items-center bg-white/20 hover:bg-white/30 rounded-xl p-4 w-28 h-24 text-white">
                  <span className="mb-2">❤️</span>
                  <span>Health</span>
                </button>
              </div>
            </div>
          </div>
          <div className="absolute left-40 bottom-0 w-full h-64 bg-[url('/static/bottom.png')] bg-no-repeat bg-left-bottom bg-contain pointer-events-none"></div>
          <div className="absolute right-0 top-0 w-full h-52 bg-[url('/static/top.png')] bg-no-repeat bg-right-top bg-contain pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
