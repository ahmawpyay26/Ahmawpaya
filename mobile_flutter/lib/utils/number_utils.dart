import 'package:intl/intl.dart';
import 'dart:math' as math;

class NumberUtils {
  // Format currency
  static String formatCurrency(double amount, {String symbol = '\$', int decimalPlaces = 2}) {
    final formatter = NumberFormat.currency(
      symbol: symbol,
      decimalDigits: decimalPlaces,
    );
    return formatter.format(amount);
  }

  // Format number with thousand separators
  static String formatNumber(double number, {int decimalPlaces = 2}) {
    final formatter = NumberFormat('#,##0.##');
    return formatter.format(number);
  }

  // Format percentage
  static String formatPercentage(double percentage, {int decimalPlaces = 2}) {
    return '${percentage.toStringAsFixed(decimalPlaces)}%';
  }

  // Format large numbers (e.g., 1.2K, 1.5M)
  static String formatCompactNumber(double number) {
    if (number >= 1000000) {
      return '${(number / 1000000).toStringAsFixed(1)}M';
    } else if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(1)}K';
    } else {
      return number.toStringAsFixed(0);
    }
  }

  // Parse currency string to double
  static double? parseCurrency(String value) {
    try {
      // Remove common currency symbols and spaces
      final cleaned = value
          .replaceAll(RegExp(r'[^\d.,]'), '')
          .replaceAll(',', '');
      return double.parse(cleaned);
    } catch (e) {
      return null;
    }
  }

  // Format phone number
  static String formatPhoneNumber(String phoneNumber) {
    final cleaned = phoneNumber.replaceAll(RegExp(r'[^\d]'), '');
    
    if (cleaned.length == 10) {
      return '(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}';
    } else if (cleaned.length == 11) {
      return '+${cleaned.substring(0, 1)} (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}';
    }
    
    return phoneNumber;
  }

  // Format file size
  static String formatFileSize(int bytes) {
    if (bytes <= 0) return '0 B';
    
    const suffixes = ['B', 'KB', 'MB', 'GB', 'TB'];
    final i = (logBase(bytes.toDouble(), 1024.0)).floor();
    final d = bytes.toDouble() / pow(1024.0, i);
    
    return '${d.toStringAsFixed(2)} ${suffixes[i]}';
  }

  // Calculate percentage change
  static double calculatePercentageChange(double oldValue, double newValue) {
    if (oldValue == 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  }

  // Round to nearest
  static double roundToNearest(double value, double nearest) {
    return (value / nearest).round() * nearest;
  }

  // Clamp value between min and max
  static double clamp(double value, double min, double max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  // Generate random number between min and max
  static int randomInt(int min, int max) {
    return min + (max - min + 1);
  }

  // Helper functions
  static double logBase(double x, double base) {
    return (math.log(x) / math.log(base));
  }

  static double pow(double base, int exponent) {
    double result = 1.0;
    for (int i = 0; i < exponent; i++) {
      result *= base;
    }
    return result;
  }
}
