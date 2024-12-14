import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#1a1d23] text-white pt-10 px-5 md:px-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h2 className="text-lg font-semibold mb-4">WatchTower</h2>
                    <p className='text-[#ccd8f0]'>Real-time monitoring and insights for your infrastructure and applications.</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Company<span className='text-3xl font-bold text-primary'>.</span></h3>
                    <ul>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>About Us</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Careers</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Press</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Resources<span className='text-3xl font-bold text-primary'>.</span></h3>
                    <ul>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Help Center</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Documentation</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>API Reference</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Contact<span className='text-3xl font-bold text-primary'>.</span></h3>
                    <ul>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Support</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Sales</Link></li>
                        <li><Link href="#" className='text-[#ccd8f0] hover:text-primary transition-all'>Partners</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-neutral-600 mt-8 py-4 text-center">
                <p className='text-[#ccd8f0]'>&copy; {new Date().getFullYear()} WatchTower. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;