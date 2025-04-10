import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { FileText, LogOut, User as UserIcon, Loader2 } from 'lucide-react'; // Add LogOut, UserIcon, Loader2
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { ModeToggle } from './mode-toggle';
import { Button } from '@/components/ui/button'; // Import Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"; // Import Avatar components

export const Navbar = () => {
  const { user, isLoading, logout } = useAuth(); // Get auth state and logout function
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to home after logout
  };

  // Helper to get initials for Avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '')).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2"> {/* Use Link */}
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-bold inline-block">
              DocuGen AI
            </span>
          </Link>
          {/* Add navigation links here if needed */}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4"> {/* Increased space */}
          <ModeToggle />

          {/* Conditional Auth UI */}
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" /> // Show loader while checking auth
          ) : user ? (
            // User is logged in - Show User Dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* Add AvatarImage if you store user profile picture URLs */}
                    {/* <AvatarImage src={user.profileImageUrl} alt={user.displayName} /> */}
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    {user.email && (
                       <p className="text-xs leading-none text-muted-foreground">
                         {user.email}
                       </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add other items like Profile, Settings if needed */}
                {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is not logged in - Show Login/Signup Buttons
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
