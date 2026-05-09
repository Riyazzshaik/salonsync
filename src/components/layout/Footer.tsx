import { Scissors } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-xl mb-4">
            <div className="bg-white text-primary p-1.5 rounded-lg">
              <Scissors size={20} />
            </div>
            SalonSync
          </div>
          <p className="text-gray-400 max-w-sm">
            Skip the Wait. Book Smarter. Find nearby salons, check live wait times, and reserve your slot instantly.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Platform</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-accent transition-colors">Find Salons</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">For Salon Owners</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} SalonSync. All rights reserved.
      </div>
    </footer>
  );
};