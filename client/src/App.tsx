import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import BottomNavBar from "@/components/layout/BottomNavBar";
import EmergencyButton from "@/components/layout/EmergencyButton";
import SafetyExitButton from "@/components/layout/SafetyExitButton";
import Home from "@/pages/home";
import Housing from "@/pages/housing";
import Bookings from "@/pages/bookings";
import Resources from "@/pages/resources";
import BookingStatus from "@/pages/booking-status";
import { Suspense, lazy } from "react";

// Lazy load staff dashboard to optimize loading
const StaffDashboard = lazy(() => import("@/pages/staff/dashboard"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Housing} />
      {/* <Route path="/housing" component={Housing} /> */}
      <Route path="/bookings" component={Bookings} />
      <Route path="/resources" component={Resources} />
      <Route path="/booking-status" component={BookingStatus} />
      <Route path="/staff/dashboard">
        <Suspense fallback={<div className="flex h-full items-center justify-center">Загрузка...</div>}>
          <StaffDashboard />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log(import.meta.env);
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <SafetyExitButton />
        <Header />
        <div className="flex-1 pt-4 pb-16 md:pb-0">
          <Router />
        </div>
        <BottomNavBar />
        {/* <EmergencyButton />*/}
        <Toaster />
      </div>
    </TooltipProvider>
  );
}

export default App;
