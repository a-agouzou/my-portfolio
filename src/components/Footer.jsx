import { FaGithub, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="py-8 px-4 border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center flex justify-between items-center">
                <p className="text-gray-400">
                    © aagouzou {new Date().getFullYear()}
                </p>
                <div className="flex justify-center items-center space-x-6">
                    <a 
                        href="https://github.com/a-agouzou" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="GitHub Profile"
                    >
                        <FaGithub className="w-6 h-6" />
                    </a>
                    <a 
                        href="https://linkedin.com/in/aagouzou" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="LinkedIn Profile"
                    >
                        <FaLinkedinIn className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;