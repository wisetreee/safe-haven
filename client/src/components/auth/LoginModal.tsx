import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LoginRequest, LoginResponse } from "@/lib/types";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя или номер телефона"),
  password: z.string().min(1, "Введите пароль"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  show: boolean;
  onClose: () => void;
}

export function LoginModal({ show, onClose }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (loginData: LoginRequest) => {
      return apiRequest<LoginResponse>("/api/auth/login", "POST", loginData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/current-user"], data);
      toast({
        title: "Успешный вход",
        description: `Добро пожаловать, ${data.user.name}!`,
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      // Just use the error message directly (it should be properly formatted now)
      setError(error.message || "Ошибка входа. Проверьте учетные данные и попробуйте снова.");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Вход в аккаунт</DialogTitle>
          <DialogDescription>
            Введите ваше имя пользователя или номер телефона, а также пароль для входа в систему.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя пользователя или телефон</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите имя пользователя или номер телефона" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm font-medium text-destructive mt-2">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Вход..." : "Войти"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}