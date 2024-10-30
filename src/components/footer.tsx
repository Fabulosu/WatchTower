import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#1a1d23] text-white pt-10 px-5 md:px-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h2 className="text-lg font-semibold mb-4">WatchTower</h2>
                    <p>Real-time monitoring and insights for your infrastructure and applications.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Company</h3>
                    <ul>
                        <li><Link href="#">About Us</Link></li>
                        <li><Link href="#">Careers</Link></li>
                        <li><Link href="#">Press</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Resources</h3>
                    <ul>
                        <li><Link href="#">Help Center</Link></li>
                        <li><Link href="#">Documentation</Link></li>
                        <li><Link href="#">API Reference</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Contact</h3>
                    <ul>
                        <li><Link href="#">Support</Link></li>
                        <li><Link href="#">Sales</Link></li>
                        <li><Link href="#">Partners</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-neutral-600 mt-8 py-4 text-center">
                <p>&copy; {new Date().getFullYear()} WatchTower. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;