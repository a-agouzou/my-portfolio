const Hero = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20" id="hero">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Abdellah Agouzoul
                    </span>
                </h1>

                <div className="mb-6">
                    <span className="text-lg md:text-xl lg:text-2xl text-gray-300">
                        Full Stack Software Engineer
                    </span>
                </div>

                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                    With a focus on both Backend and Frontend development, I'm a software engineer 
                    dedicated to creating exceptional digital experiences. My main objective is to 
                    create accessible products that enhance user engagement and satisfaction.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <a 
                        href="#contact" 
                        className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700"
                    >
                        Contact Me
                    </a>
                    <a 
                        href="#projects" 
                        className="px-8 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/10"
                    >
                        View Projects
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Hero;