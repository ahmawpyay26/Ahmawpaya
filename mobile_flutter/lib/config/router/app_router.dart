import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../presentation/pages/auth/login_page.dart';
import '../../presentation/pages/auth/otp_page.dart';
import '../../presentation/pages/admin/admin_dashboard_page.dart';
import '../../presentation/pages/staff/staff_dashboard_page.dart';
import '../../presentation/pages/public/home_page.dart';
import '../../presentation/pages/public/order_page.dart';
import '../../presentation/pages/public/track_order_page.dart';
import '../../presentation/pages/not_found_page.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    errorBuilder: (context, state) => const NotFoundPage(),
    routes: [
      // Public routes
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/order',
        builder: (context, state) => const OrderPage(),
      ),
      GoRoute(
        path: '/track/:orderId',
        builder: (context, state) {
          final orderId = state.pathParameters['orderId']!;
          return TrackOrderPage(orderId: orderId);
        },
      ),

      // Auth routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/otp',
        builder: (context, state) => const OtpPage(),
      ),

      // Admin routes
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardPage(),
      ),

      // Staff routes
      GoRoute(
        path: '/staff',
        builder: (context, state) => const StaffDashboardPage(),
      ),
    ],
  );
});
