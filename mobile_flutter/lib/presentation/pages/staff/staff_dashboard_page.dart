import 'package:flutter/material.dart';

class StaffDashboardPage extends StatelessWidget {
  const StaffDashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Staff Dashboard'),
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
                    Text('Assigned Orders: 10'),
                    SizedBox(height: 8),
                    Text('Completed Today: 5'),
                    SizedBox(height: 8),
                    Text('Pending: 5'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                // View assigned orders
              },
              child: const Text('View Orders'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Update status
              },
              child: const Text('Update Status'),
            ),
          ],
        ),
      ),
    );
  }
}
