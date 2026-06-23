import 'package:flutter/material.dart';

class TrackOrderPage extends StatelessWidget {
  final String orderId;

  const TrackOrderPage({
    Key? key,
    required this.orderId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Track Order'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text('Order ID: $orderId'),
            const SizedBox(height: 24),
            const Text('Status: In Progress'),
            const SizedBox(height: 16),
            const LinearProgressIndicator(value: 0.5),
            const SizedBox(height: 24),
            const Text('Estimated Delivery: 2 hours'),
          ],
        ),
      ),
    );
  }
}
