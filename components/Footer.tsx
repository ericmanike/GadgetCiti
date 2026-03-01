
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 border-t border-gray-800">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-black text-white tracking-tighter font-outfit">Letronix</h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Your trusted platform for premium smartphones, laptops, accessories, and professional IT services.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="text-blue-500 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="#" className="text-blue-500 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="#" className="text-blue-500 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-blue-500 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="#" className="text-blue-500 hover:text-white transition-colors"><Mail className="h-5 w-5" /></a>

                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link href="/buy" className="hover:text-blue-400 transition-colors">Buy Gadgets</Link></li>
                            <li><Link href="/sell" className="hover:text-blue-400 transition-colors">Sell to Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/buy?category=phones" className="hover:text-blue-400 transition-colors">Phones & Tablets</Link></li>
                            <li><Link href="/buy?category=laptops" className="hover:text-blue-400 transition-colors">Computers & Laptops</Link></li>
                            <li><Link href="/buy?category=accessories" className="hover:text-blue-400 transition-colors">Accessories</Link></li>
                            <li><Link href="/services" className="hover:text-blue-400 transition-colors">IT Services</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-white">Contact Us</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                                <span>Kumasi, KNUST</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                                <span>054 344 2518</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                                <span>contact@letronix.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Letronix Hub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
