import 'package:flutter/material.dart';

class AdminDashboardPage extends StatelessWidget {
  const AdminDashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            const Card(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('Total Orders: 150'),
                    SizedBox(height: 8),
                    Text('Pending: 25'),
                    SizedBox(height: 8),
                    Text('Completed: 125'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // View reports
              },
              child: const Text('View Reports'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Manage users
              },
              child: const Text('Manage Users'),
            ),
          ],
        ),
      ),
    );
  }
}
