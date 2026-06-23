import 'package:flutter/material.dart';

// String extensions
extension StringExtension on String {
  // Capitalize first letter
  String get capitalize {
    if (isEmpty) return this;
    return this[0].toUpperCase() + substring(1);
  }

  // Check if string is email
  bool get isEmail {
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    return emailRegex.hasMatch(this);
  }

  // Check if string is numeric
  bool get isNumeric {
    return double.tryParse(this) != null;
  }

  // Check if string is empty or whitespace
  bool get isEmptyOrWhitespace {
    return isEmpty || trim().isEmpty;
  }

  // Truncate string
  String truncate(int length, {String ellipsis = '...'}) {
    if (this.length <= length) return this;
    return substring(0, length) + ellipsis;
  }

  // Reverse string
  String get reverse {
    return split('').reversed.join('');
  }

  // Remove all spaces
  String get removeSpaces {
    return replaceAll(' ', '');
  }

  // Replace multiple spaces with single space
  String get normalizeSpaces {
    return replaceAll(RegExp(r'\s+'), ' ').trim();
  }
}

// DateTime extensions
extension DateTimeExtension on DateTime {
  // Check if date is today
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  // Check if date is yesterday
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year && month == yesterday.month && day == yesterday.day;
  }

  // Check if date is tomorrow
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year && month == tomorrow.month && day == tomorrow.day;
  }

  // Get start of day
  DateTime get startOfDay {
    return DateTime(year, month, day);
  }

  // Get end of day
  DateTime get endOfDay {
    return DateTime(year, month, day, 23, 59, 59, 999);
  }

  // Get start of month
  DateTime get startOfMonth {
    return DateTime(year, month, 1);
  }

  // Get end of month
  DateTime get endOfMonth {
    return DateTime(year, month + 1, 0, 23, 59, 59, 999);
  }

  // Get days until date
  int get daysUntil {
    final now = DateTime.now();
    return difference(now).inDays;
  }

  // Get days since date
  int get daysSince {
    final now = DateTime.now();
    return now.difference(this).inDays;
  }
}

// List extensions
extension ListExtension<T> on List<T> {
  // Check if list is empty
  bool get isEmpty => length == 0;

  // Check if list is not empty
  bool get isNotEmpty => length > 0;

  // Get first element or null
  T? get firstOrNull => isEmpty ? null : first;

  // Get last element or null
  T? get lastOrNull => isEmpty ? null : last;

  // Remove duplicates
  List<T> get unique {
    return toSet().toList();
  }

  // Chunk list into smaller lists
  List<List<T>> chunk(int size) {
    final chunks = <List<T>>[];
    for (var i = 0; i < length; i += size) {
      chunks.add(sublist(i, i + size > length ? length : i + size));
    }
    return chunks;
  }

  // Flatten nested lists
  List<T> flatten() {
    final result = <T>[];
    for (final item in this) {
      if (item is List<T>) {
        result.addAll(item.flatten());
      } else {
        result.add(item);
      }
    }
    return result;
  }
}

// Map extensions
extension MapExtension<K, V> on Map<K, V> {
  // Check if map is empty
  bool get isEmpty => length == 0;

  // Check if map is not empty
  bool get isNotEmpty => length > 0;

  // Get value or default
  V? getOrDefault(K key, V defaultValue) {
    return containsKey(key) ? this[key] : defaultValue;
  }

  // Map keys
  Map<K2, V> mapKeys<K2>(K2 Function(K) transform) {
    final result = <K2, V>{};
    forEach((key, value) {
      result[transform(key)] = value;
    });
    return result;
  }

  // Map values
  Map<K, V2> mapValues<V2>(V2 Function(V) transform) {
    final result = <K, V2>{};
    forEach((key, value) {
      result[key] = transform(value);
    });
    return result;
  }
}

// BuildContext extensions
extension BuildContextExtension on BuildContext {
  // Get screen size
  Size get screenSize => MediaQuery.of(this).size;

  // Get screen width
  double get screenWidth => MediaQuery.of(this).size.width;

  // Get screen height
  double get screenHeight => MediaQuery.of(this).size.height;

  // Check if device is in landscape
  bool get isLandscape => MediaQuery.of(this).orientation == Orientation.landscape;

  // Check if device is in portrait
  bool get isPortrait => MediaQuery.of(this).orientation == Orientation.portrait;

  // Check if device is mobile
  bool get isMobile => screenWidth < 600;

  // Check if device is tablet
  bool get isTablet => screenWidth >= 600 && screenWidth < 1200;

  // Check if device is desktop
  bool get isDesktop => screenWidth >= 1200;

  // Get device padding
  EdgeInsets get devicePadding => MediaQuery.of(this).padding;

  // Get device view insets
  EdgeInsets get viewInsets => MediaQuery.of(this).viewInsets;

  // Show snackbar
  void showSnackBar(String message, {Duration duration = const Duration(seconds: 2)}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration,
      ),
    );
  }

  // Show error snackbar
  void showErrorSnackBar(String message, {Duration duration = const Duration(seconds: 2)}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: duration,
      ),
    );
  }

  // Show success snackbar
  void showSuccessSnackBar(String message, {Duration duration = const Duration(seconds: 2)}) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        duration: duration,
      ),
    );
  }

  // Push route
  Future<T?> pushRoute<T>(Widget page) {
    return Navigator.of(this).push<T>(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  // Pop route
  void popRoute<T>([T? result]) {
    Navigator.of(this).pop<T>(result);
  }
}

// Number extensions
extension NumberExtension on num {
  // Convert to currency string
  String toCurrency({String symbol = '\$'}) {
    return '$symbol${toStringAsFixed(2)}';
  }

  // Convert to percentage string
  String toPercentage({int decimalPlaces = 2}) {
    return '${toStringAsFixed(decimalPlaces)}%';
  }

  // Check if number is positive
  bool get isPositive => this > 0;

  // Check if number is negative
  bool get isNegative => this < 0;

  // Check if number is zero
  bool get isZero => this == 0;

  // Get absolute value
  num get absolute => this < 0 ? -this : this;
}
