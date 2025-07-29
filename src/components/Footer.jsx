import React from "react";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-10 mt-16 shadow-inner">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                
                {/* Logo & Brand */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-lightaccent dark:bg-darkaccent rounded-xl flex items-center justify-center text-xl font-bold">
                        B
                    </div>
                    <h1 className="text-2xl font-semibold tracking-wide">BlogSpace</h1>
                </div>

                {/* Social Links */}
                <div className="flex gap-6 text-2xl">
                    <a
                        href="https://github.com/your-username"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-gray-400 transition-colors"
                    >
                        <FaGithub />
                    </a>
                    <a
                        href="https://linkedin.com/in/your-username"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                    >
                        <FaLinkedin />
                    </a>
                    <a
                        href="https://instagram.com/your-username"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pink-400 transition-colors"
                    >
                        <FaInstagram />
                    </a>
                </div>

                {/* Copyright */}
                <p className="text-sm text-gray-400 text-center md:text-right">
                    © {new Date().getFullYear()} BlogSpace. Built by Sarthak Sharma.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
