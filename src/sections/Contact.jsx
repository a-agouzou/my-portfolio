import { FaLinkedinIn, FaArrowRight } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const Contact = () => {
    const socialLinks = [
        {
            name: 'Email',
            icon: <MdEmail className="w-6 h-6" />,
            url: 'mailto:agouzoulabdellah97@gmail.com',
            color: 'text-blue-400'
        }
    ];

    return (
        <div id="contact" className="py-20 px-4 min-h-screen flex justify-center items-center">
            <div className="max-w-3xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Let's Connect
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Open to new opportunities and interesting projects
                    </p>
                    
                    <a 
                        href="https://linkedin.com/in/aagouzou"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-medium hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
                    >
                        <span>Connect on LinkedIn</span>
                        <FaLinkedinIn className="w-5 h-5" />
                    </a>
                </div>

                <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-white font-medium mb-6 text-center">
                        Or Send Me an Email
                    </h3>
                    <div className="max-w-md mx-auto">
                        <a
                            href="mailto:agouzoulabdellah97@gmail.com"
                            className="flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                        >
                            <div className="text-blue-400 group-hover:text-blue-400 transition-colors">
                                <MdEmail className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-medium">Email</h4>
                                <p className="text-gray-400 text-sm truncate">
                                    agouzoulabdellah97@gmail.com
                                </p>
                            </div>
                            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;