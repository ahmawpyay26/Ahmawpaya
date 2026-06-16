import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import PublicOrder from "./pages/PublicOrder";
import TrackOrder from "./pages/TrackOrder";
import StaffLogin from "./pages/StaffLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminZones from "./pages/admin/AdminZones";
import AdminLogin from "./pages/AdminLogin";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLoyalty from "./pages/admin/AdminLoyalty";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffDeliveries from "./pages/staff/StaffDeliveries";
import StaffTruckStock from "./pages/staff/StaffTruckStock";
import StaffOrders from "./pages/staff/StaffOrders";
import StaffExpenses from "./pages/staff/StaffExpenses";
import StaffExpenseEdit from "./pages/staff/StaffExpenseEdit";
import StaffInvoices from "./pages/staff/StaffInvoices";
import StaffInvoiceEdit from "./pages/staff/StaffInvoiceEdit";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminWaterQuality from "./pages/admin/AdminWaterQuality";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { StaffLayout } from "./components/StaffLayout";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/order" component={PublicOrder} />
      <Route path="/track" component={TrackOrder} />
      <Route path="/staff-login" component={StaffLogin} />
      
      {/* Admin login */}
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/inventory" component={AdminInventory} />
      <Route path="/admin/invoices" component={AdminInvoices} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/staff" component={AdminStaff} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/zones" component={AdminZones} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/loyalty" component={AdminLoyalty} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route path="/admin/water-quality" component={AdminWaterQuality} />
      <Route path="/admin/expense-approvals" component={lazy(() => import("./pages/admin/AdminExpenseApprovals")) as any} />
      
      {/* Staff routes */}
      <Route path="/staff">
        <StaffLayout><StaffDashboard /></StaffLayout>
      </Route>
      <Route path="/staff/orders">
        <StaffLayout><StaffOrders /></StaffLayout>
      </Route>
      <Route path="/staff/invoices">
        <StaffLayout><StaffInvoices /></StaffLayout>
      </Route>
      <Route path="/staff/invoices/:id/edit">
        <StaffLayout><StaffInvoiceEdit /></StaffLayout>
      </Route>
      <Route path="/staff/expenses">
        <StaffLayout><StaffExpenses /></StaffLayout>
      </Route>
      <Route path="/staff/expenses/:id/edit">
        <StaffLayout><StaffExpenseEdit /></StaffLayout>
      </Route>
      <Route path="/staff/deliveries">
        <StaffLayout><StaffDeliveries /></StaffLayout>
      </Route>
      <Route path="/staff/truck-stock">
        <StaffLayout><StaffTruckStock /></StaffLayout>
      </Route>
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <OfflineIndicator />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
