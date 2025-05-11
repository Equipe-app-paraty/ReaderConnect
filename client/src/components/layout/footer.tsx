import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="mt-12 bg-white relative">
      <div className="absolute -top-16 w-full overflow-hidden">
        <img
          src="/src/assets/images/wave-divider.svg"
          alt=""
          className="w-full h-16"
        />
      </div>
      <div className="border-t border-neutral-light py-8 relative">
        <div 
          className="absolute inset-0 -z-10 opacity-5"
          style={{
            backgroundImage: "url('/src/assets/images/book-pattern.svg')",
            backgroundSize: "cover"
          }}
        ></div>
        <div className="container mx-auto px-4">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="text-xl font-serif font-bold text-primary-dark flex items-center">
                <i className="ri-book-open-line mr-2 text-secondary"></i>
                BookNook
              </Link>
              <p className="text-sm text-primary-light mt-2 max-w-md">
                Your digital reading companion. Track your reading journey, discover new books, and connect with fellow readers.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-primary-dark uppercase tracking-wider mb-3">Explore</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Home</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Discover</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Categories</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Popular Books</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-primary-dark uppercase tracking-wider mb-3">Account</h3>
                <ul className="space-y-2">
                  <li><Link href="/auth" className="text-sm text-primary-light hover:text-secondary">Sign In</Link></li>
                  <li><Link href="/auth" className="text-sm text-primary-light hover:text-secondary">Register</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Settings</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Help</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-primary-dark uppercase tracking-wider mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Privacy Policy</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Terms of Service</Link></li>
                  <li><Link href="/" className="text-sm text-primary-light hover:text-secondary">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-neutral-light flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-primary-light hover:text-secondary" aria-label="Facebook">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-primary-light hover:text-secondary" aria-label="Twitter">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-primary-light hover:text-secondary" aria-label="Instagram">
                <i className="ri-instagram-line text-xl"></i>
              </a>
            </div>
            <p className="text-sm text-primary-light">&copy; {new Date().getFullYear()} BookNook. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}