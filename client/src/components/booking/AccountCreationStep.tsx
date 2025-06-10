
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountCreationStepProps {
  wantAccount: boolean;
  setWantAccount: (want: boolean) => void;
  hasExistingAccount: boolean;
  setHasExistingAccount: (has: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  loginUsername: string;
  setLoginUsername: (username: string) => void;
  loginPassword: string;
  setLoginPassword: (password: string) => void;
  phone: string;
  formErrors: {[key: string]: string | undefined};
}

export function AccountCreationStep({
  wantAccount,
  setWantAccount,
  hasExistingAccount,
  setHasExistingAccount,
  password,
  setPassword,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  phone,
  formErrors
}: AccountCreationStepProps) {
  return (
    <div className="booking-step active">
      <h3 className="font-medium mb-3">Аккаунт для доступа к бронированию</h3>
      <p className="text-sm text-secondary mb-4">
        Вам необходимо создать новый аккаунт или войти в существующий для оформления бронирования. Это позволит вам отслеживать статус бронирований и общаться с сотрудниками.
      </p>
      {formErrors.accountRequired && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-md">
          {formErrors.accountRequired}
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          {/* Option 1: Create new account */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="create-account" 
              checked={wantAccount && !hasExistingAccount}
              onCheckedChange={(checked) => {
                setWantAccount(checked === true);
                if (checked === true) {
                  setHasExistingAccount(false);
                }
              }}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="create-account"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Создать новый аккаунт
              </Label>
              <p className="text-xs text-muted-foreground">
                Мы создадим для вас новый аккаунт с простым именем пользователя
              </p>
            </div>
          </div>
          
          {/* Option 2: Login with existing account */}
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="existing-account" 
              checked={hasExistingAccount}
              onCheckedChange={(checked) => {
                setHasExistingAccount(checked === true);
                if (checked === true) {
                  setWantAccount(false);
                }
              }}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="existing-account"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Войти в существующий аккаунт
              </Label>
              <p className="text-xs text-muted-foreground">
                Используйте данные существующего аккаунта для бронирования
              </p>
            </div>
          </div>
        </div>
        
        {/* Show create account form */}
        {wantAccount && !hasExistingAccount && (
          <div className="space-y-3 mt-3">
            <div>
              <Label className="mb-1">Информация об аккаунте</Label>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p>Ваш телефон <strong>{phone}</strong> будет использован как имя пользователя</p>
              </div>
            </div>
            <div>
              <Label className="mb-1">Пароль</Label>
              <Input 
                type="password" 
                placeholder="Введите пароль (минимум 6 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={formErrors.password ? "border-red-500" : ""}
              />
              {formErrors.password && <span className="text-red-500 text-sm">{formErrors.password}</span>}
            </div>
          </div>
        )}
        
        {/* Show existing account login form */}
        {hasExistingAccount && (
          <div className="space-y-3 mt-3">
            <div>
              <Label className="mb-1">Имя пользователя или телефон</Label>
              <Input 
                type="text" 
                placeholder="Введите имя пользователя или телефон"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className={formErrors.loginUsername ? "border-red-500" : ""}
              />
              {formErrors.loginUsername && <span className="text-red-500 text-sm">{formErrors.loginUsername}</span>}
            </div>
            <div>
              <Label className="mb-1">Пароль</Label>
              <Input 
                type="password" 
                placeholder="Введите пароль"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={formErrors.loginPassword ? "border-red-500" : ""}
              />
              {formErrors.loginPassword && <span className="text-red-500 text-sm">{formErrors.loginPassword}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}