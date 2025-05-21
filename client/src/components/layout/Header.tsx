import { Home, LogIn, User } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LoginModal } from "@/components/auth/LoginModal";
import { UserProfileModal } from "@/components/auth/UserProfileModal";
import { User as UserType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Check for current user session - handle unauthorized errors by setting on401 in the default configuration
  const { data: authData, isLoading } = useQuery<{user: UserType}>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false
  });
  
  const currentUser: UserType | undefined = authData?.user;
  const isStaff = currentUser && currentUser.role === 'staff';

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
                <Home className="text-accent mr-2 h-6 w-6" />
                <h1 className="text-xl font-medium text-primary">Безопасный Дом</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : currentUser ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-accent/10 text-accent">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {isStaff ? "Сотрудник" : "Пользователь"}
                  </span>
                </div>
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowProfileModal(true)}
                >
                  <User className="h-4 w-4 mr-1" />
                  Профиль
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setShowLoginModal(true)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Войти в аккаунт
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Staff Login Modal */}
      <LoginModal 
        show={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />

      {/* User Profile Modal */}
      <UserProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}
