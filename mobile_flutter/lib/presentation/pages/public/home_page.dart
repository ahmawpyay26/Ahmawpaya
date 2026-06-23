import 'package:flutter/material.dart';

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ah-Maw-Pyay'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Water Delivery & Factory Management',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                context.go('/order');
              },
              child: const Text('Place Order'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                context.go('/login');
              },
              child: const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}

// Extension for context navigation
extension GoRouterExtension on BuildContext {
  void go(String location) {
    // Navigation will be handled by GoRouter
  }
}
