import { 
    FaGithub, 
    FaExternalLinkAlt, 
    FaArrowRight 
} from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';

const Projects = () => {
    const projects = [
        {
            title: 'Paddlefy',
            description: 'A robust web application enabling seamless real-time communication and efficient channel management, built with Django and React.',
            tags: ['Django', 'React', 'Docker', 'PostgreSQL', 'Redis', 'WebSockets'],
            githubLink: 'https://github.com/a-agouzou',
            liveLink: '',
            highlights: [
                'Created an interactive and responsive user interface for chat and channel interactions',
                'Implemented real-time communication using Django Channels and WebSockets',
                'Designed a PostgreSQL database schema using Django ORM for efficient data storage',
                'Deployed the application using Docker for seamless containerization and scalability'
            ]
        },
        {
            title: 'Barbershop Booking System',
            description: 'An intuitive application for scheduling and managing barbershop appointments, featuring a dynamic calendar system and comprehensive service management.',
            tags: ['React', 'TailwindCSS', 'LocalStorage'],
            githubLink: 'https://github.com/a-agouzou/Barbershop',
            liveLink: 'https://barbershop-taupe-eta.vercel.app/',
            highlights: [
                'Developed a responsive and user-friendly interface for booking management',
                'Simulated backend functionality using local storage for rapid development',
                'Designed a dynamic calendar system for real-time slot availability',
                'Created a comprehensive presentation of services, pricing, and barber expertise'
            ]
        },
        {
            title: 'TaskFlow',
            description: 'A modern, responsive Todo List application built with the MERN stack, featuring comprehensive task management capabilities and an admin panel.',
            tags: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'TailwindCSS'],
            githubLink: 'https://github.com/a-agouzou/Web-coding-challenge',
            liveLink: '',
            highlights: [
                'Implemented Create, Read, Update, and Delete (CRUD) functionalities',
                'Enabled task completion tracking with toggle functionality',
                'Designed a clean and modern user interface using Tailwind CSS',
                'Developed an admin panel for efficient task management and oversight'
            ]
        },
        {
            title: 'Inception',
            description : 'An infrastructure for a WordPress site using containerization and virtualization technologies',
            tags: ['Docker', 'WordPress', 'Nginx', 'MariaDB'],
            githubLink: 'https://github.com/a-agouzou/inception',
            liveLink: '',
            highlights: [
                "Built a secure and scalable infrastructure for a WordPress site using Docker and Nginx.",
                "Created custom Dockerfiles for services like NGINX (secured with TLS), WordPress, and MariaDB",
                "Utilized Docker Compose to manage containerized services and ensure data persistence with Docker volumes",
                "Designed an isolated network for containers to enhance security and controlled communication"
            ]
    
        }
    ];

    return (
        <div id="projects" className="min-h-screen py-20 px-4 flex justify-between items-center">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Featured Projects
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A collection of projects that showcase my expertise in full-stack development.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {projects.map((project, index) => (
                        <div 
                            key={index} 
                            className="bg-white/5 rounded-lg border border-white/10 p-6 hover:border-blue-500/50 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold text-white">
                                    {project.title}
                                </h3>
                                <div className="flex gap-3">
                                    <a 
                                        href={project.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label="View GitHub Repository"
                                    >
                                        <FaGithub className="w-5 h-5" />
                                    </a>
                                    <a 
                                        href={project.liveLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label="View Live Demo"
                                    >
                                        <FaExternalLinkAlt className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>

                            <p className="text-gray-300 mb-4 leading-relaxed">
                                {project.description}
                            </p>

                            <ul className="space-y-2 mb-4">
                                {project.highlights.map((highlight, hIndex) => (
                                    <li 
                                        key={hIndex}
                                        className="text-gray-400 flex items-start gap-2"
                                    >
                                        <BsDot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                {project.tags.map((tag, tagIndex) => (
                                    <span 
                                        key={tagIndex}
                                        className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <a 
                        href="https://github.com/a-agouzou"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
                    >
                        View More Projects on GitHub
                        <FaArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Projects;
