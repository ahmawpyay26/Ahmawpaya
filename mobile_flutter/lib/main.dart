import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/router/app_router.dart';
import 'config/theme/app_theme.dart';
import 'services/service_locator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize service locator
  await setupServiceLocator();
  
  runApp(
    const ProviderScope(
      child: AmawPyayApp(),
    ),
  );
}

class AmawPyayApp extends ConsumerWidget {
  const AmawPyayApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);
    final theme = AppTheme.light();

    return MaterialApp.router(
      title: 'Ah-Maw-Pyay',
      theme: theme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
