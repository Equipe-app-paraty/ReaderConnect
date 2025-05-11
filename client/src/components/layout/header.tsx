import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-serif font-bold text-primary-dark flex items-center">
            <i className="ri-book-open-line mr-2 text-secondary"></i>
            BookNook
          </Link>
        </div>
        
        {user && (
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative w-64">
              <Input 
                type="text" 
                placeholder="Search books, authors..." 
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-neutral focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-dark" />
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link href="/" className={`${location === '/' ? 'text-secondary' : 'text-primary-dark hover:text-secondary'} font-medium`}>Home</Link>
              <Link href="/" className="text-primary-dark hover:text-secondary font-medium">Discover</Link>
              <Link href="/" className="text-primary-dark hover:text-secondary font-medium">My Books</Link>
            </nav>
            
            <div className="flex items-center">
              <Link href="/" className="block w-8 h-8 rounded-full overflow-hidden">
                <Avatar>
                  <AvatarImage src={user.profilePicture} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        )}
        
        {user && (
          <button 
            className="md:hidden text-primary-dark focus:outline-none" 
            aria-label="Open menu"
            onClick={toggleMobileMenu}
          >
            <i className="ri-menu-line text-2xl"></i>
          </button>
        )}
      </div>
      
      {/* Mobile menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-3 space-y-3 bg-white border-t border-neutral-light animate-in fade-in">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search books, authors..." 
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-neutral focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-dark" />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={`${location === '/' ? 'text-secondary' : 'text-primary-dark hover:text-secondary'} font-medium py-1`}>Home</Link>
              <Link href="/" className="text-primary-dark hover:text-secondary font-medium py-1">Discover</Link>
              <Link href="/" className="text-primary-dark hover:text-secondary font-medium py-1">My Books</Link>
              <Link href="/" className="text-primary-dark hover:text-secondary font-medium py-1">Profile</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
