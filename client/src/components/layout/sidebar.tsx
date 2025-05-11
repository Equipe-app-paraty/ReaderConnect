import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  icon: string;
  name: string;
  path: string;
};

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  if (!user) return null;
  
  const navItems: NavItem[] = [
    { icon: "ri-home-4-line", name: "Dashboard", path: "/" },
    { icon: "ri-book-open-line", name: "Currently Reading", path: "/reading" },
    { icon: "ri-bookmark-line", name: "Want to Read", path: "/want-to-read" },
    { icon: "ri-check-double-line", name: "Completed", path: "/completed" },
    { icon: "ri-user-3-line", name: "Profile", path: "/profile" },
    { icon: "ri-settings-3-line", name: "Settings", path: "/settings" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className="hidden md:block w-64 pr-8">
      <div className="sticky top-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h2 className="font-medium text-primary-dark">{user.name}</h2>
            <p className="text-sm text-primary-light">@{user.username}</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <a className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
                location === item.path 
                  ? 'bg-neutral-light text-primary-dark font-medium' 
                  : 'text-primary-light hover:bg-neutral-lightest hover:text-primary-dark'
              }`}>
                <i className={`${item.icon} text-lg`}></i>
                <span>{item.name}</span>
              </a>
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-neutral-light">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-primary-light hover:bg-neutral-lightest hover:text-primary-dark w-full text-left"
          >
            <i className="ri-logout-box-line text-lg"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
