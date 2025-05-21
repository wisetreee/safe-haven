import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User as UserType } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, CheckCircle, Home, Calendar, MessageCircle } from "lucide-react";
import { Link } from "wouter";

interface UserProfileModalProps {
  show: boolean;
  onClose: () => void;
}

export function UserProfileModal({ show, onClose }: UserProfileModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user data
  const { data: authData, isLoading } = useQuery<{user: UserType}>({
    queryKey: ['/api/auth/current-user'],
    retry: false,
    refetchOnWindowFocus: false
  });
  
  const currentUser = authData?.user;
  const isStaff = currentUser?.role === 'staff';

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/logout', 'POST');
    },
    onSuccess: () => {
      // Clear the user data from cache
      queryClient.setQueryData(['/api/auth/current-user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/current-user'] });
      
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ваш профиль</DialogTitle>
          <DialogDescription>
            {currentUser
              ? "Информация о вашем аккаунте"
              : "Вы не авторизованы в системе"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 ml-3 animate-pulse"></div>
            </div>
          ) : currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-lg">{currentUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isStaff ? "Сотрудник" : "Пользователь"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {currentUser.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Телефон:</span>
                    <span>{currentUser.phone}</span>
                  </div>
                )}
                {currentUser.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{currentUser.email}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Имя пользователя:</span>
                  <span>{currentUser.username}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Быстрые действия</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/booking-status" onClick={onClose}>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Мои бронирования
                    </Button>
                  </Link>
                  {isStaff && (
                    <Link href="/staff/dashboard" onClick={onClose}>
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Панель управления
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <User className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <h3 className="font-medium">Вы не авторизованы</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Войдите в систему или создайте аккаунт при бронировании, чтобы управлять вашими бронированиями.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Link href="/" onClick={onClose}>
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    Главная
                  </Button>
                </Link>
                <Link href="/booking-status" onClick={onClose}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Статус бронирования
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {currentUser ? (
            <Button 
              variant="destructive" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? "Выполняется выход..." : "Выйти из системы"}
            </Button>
          ) : (
            <Link href="/" onClick={onClose} className="w-full">
              <Button variant="default" className="w-full">
                Закрыть
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}