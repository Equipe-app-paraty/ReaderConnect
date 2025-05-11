import { Link, useLocation } from "wouter";

export default function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-light z-10 px-2 py-1">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/' ? 'text-secondary' : 'text-primary-light'}`}>
            <i className="ri-home-4-line text-xl"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center py-2 px-3 text-primary-light">
            <i className="ri-book-open-line text-xl"></i>
            <span className="text-xs mt-1">Reading</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center py-2 px-3 text-primary-light">
            <i className="ri-search-line text-xl"></i>
            <span className="text-xs mt-1">Discover</span>
          </a>
        </Link>
        <Link href="/">
          <a className="flex flex-col items-center py-2 px-3 text-primary-light">
            <i className="ri-user-3-line text-xl"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
