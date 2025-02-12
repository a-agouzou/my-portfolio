const About = () => {
    const skills = [
        { category: "Languages", items: ["JavaScript", "TypeScript", "C/C++"] },
        { category: "Frontend", items: ["React", "HTML5", "CSS3", "Tailwind"] },
        { category: "Backend", items: ["Django", "Express.js"] },
        { category: "Mobile", items: ["React Native", "Expo"] },
        { category: "Databases", items: ["PostgreSQL", "MongoDB", "Prisma", "Redis"] },
        { category: "Tools/Platforms", items: ["Git", "Github", "Docker", "Unix CLI"] },
    ];

    const experience = {
        title: "Freelance | Full-Stack Mobile Developer",
        period: "Oct 2024 - Jan 2025",
        company: "Ajyal Association",
        description: "Developed a mobile app using React Native with Expo Router and Express.js to manage the association's orphan and family welfare programs.",
        achievements: [
            "Designed and developed a scalable mobile app using React Native, Expo Router, and Express.js",
            "Built a robust backend with Express.js and Prisma, integrating PostgreSQL for data management",
            "Created real-time tracking features for educational sessions and medical assistance",
            "Implemented export features for generating program reports and analytics",
            "Delivered an intuitive admin interface for project tracking and management"
        ]
    };

    return (
        <div id="about" className="min-h-screen py-20 px-4 flex justify-center items-center">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">
                    About Me
                </h2>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <p className="text-gray-300 leading-relaxed">
                                I'm a Full Stack Developer with expertise in JavaScript, React, Python, Django, 
                                and a deep understanding of C/C++. I have a passion for solving complex coding 
                                challenges and exploring new technological frontiers.
                            </p>
                            <p className="text-gray-300 leading-relaxed">
                                I'm driven by the desire to work alongside talented teams to create cutting-edge 
                                solutions. Currently seeking opportunities where I can apply my skills and 
                                continue to evolve as a developer.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <h3 className="text-white font-semibold text-xl">Professional Experience</h3>
                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-white font-medium max-w-1/">{experience.title}</h4>
                                    </div>
                                        <span className="text-blue-400 text-sm">{experience.period}</span>
                                    <p className="text-gray-300">{experience.description}</p>
                                    <ul className="space-y-2 mt-3">
                                        {experience.achievements.map((achievement, index) => (
                                            <li key={index} className="text-gray-400 flex items-start gap-2">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                                                <span>{achievement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="border-l-2 border-blue-500 pl-4 py-2">
                                <h3 className="text-white font-semibold">Education</h3>
                                <div className="mt-2">
                                    <div className="flex items-center justify-between">
                                    <p className="text-white">1337 Coding School</p>
                                    <span className="text-blue-400 text-sm">2022 - Present</span>

                                    </div>
                                    <p className="text-gray-400">Computer Science</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Peer-to-peer learning environment focused on project-based learning
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className=" border-l border-white/30 rounded-lg p-6">
                        <h3 className="text-white font-semibold text-xl mb-6">Technical Skills</h3>
                        <div className="space-y-6">
                            {skills.map((skillGroup, index) => (
                                <div key={index}>
                                    <h4 className="text-blue-400 mb-3 font-medium">{skillGroup.category}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {skillGroup.items.map((skill, skillIndex) => (
                                            <span 
                                                key={skillIndex}
                                                className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300 hover:bg-white/20 transition-colors"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-300 mb-4">
                        Interested in collaboration? Let's create something amazing together!
                    </p>
                    <a 
                        href="#contact" 
                        className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                    >
                        Get in Touch
                    </a>
                </div>
            </div>
        </div>
    );
}

export default About;