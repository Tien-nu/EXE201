import { Github } from "@medusajs/icons";
import { Button } from "@modules/common/components/ui";

const Hero = () => {
  return (
    <div className="h-[80vh] w-full relative bg-neutral-950 flex items-center justify-center overflow-hidden">
      {/* Decorative blurred gradient background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/30 blur-[100px] rounded-full opacity-70" />
      </div>

      <div className="z-10 flex flex-col justify-center items-center text-center px-6 gap-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
            Handcrafted <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Crochet Art
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            Discover our collection of beautiful, handmade crochet items. Each piece is crafted with love, care, and attention to detail.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
          <a href="/store" className="group rounded-full px-8 py-3 font-medium bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-white/10 block">
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
