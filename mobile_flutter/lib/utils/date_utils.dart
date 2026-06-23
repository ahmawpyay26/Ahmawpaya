import 'package:intl/intl.dart';

class DateTimeUtils {
  // Format date to string
  static String formatDate(DateTime date, {String format = 'dd/MM/yyyy'}) {
    try {
      final formatter = DateFormat(format);
      return formatter.format(date);
    } catch (e) {
      return date.toString();
    }
  }

  // Format date and time
  static String formatDateTime(DateTime dateTime, {String format = 'dd/MM/yyyy HH:mm'}) {
    try {
      final formatter = DateFormat(format);
      return formatter.format(dateTime);
    } catch (e) {
      return dateTime.toString();
    }
  }

  // Format time only
  static String formatTime(DateTime dateTime, {String format = 'HH:mm'}) {
    try {
      final formatter = DateFormat(format);
      return formatter.format(dateTime);
    } catch (e) {
      return dateTime.toString();
    }
  }

  // Get relative time (e.g., "2 hours ago")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks week${weeks > 1 ? 's' : ''} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years year${years > 1 ? 's' : ''} ago';
    }
  }

  // Check if date is today
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  // Check if date is yesterday
  static bool isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year && date.month == yesterday.month && date.day == yesterday.day;
  }

  // Check if date is tomorrow
  static bool isTomorrow(DateTime date) {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return date.year == tomorrow.year && date.month == tomorrow.month && date.day == tomorrow.day;
  }

  // Get start of day
  static DateTime getStartOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  // Get end of day
  static DateTime getEndOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }

  // Get start of month
  static DateTime getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1);
  }

  // Get end of month
  static DateTime getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0, 23, 59, 59, 999);
  }

  // Parse date string
  static DateTime? parseDate(String dateString, {String format = 'dd/MM/yyyy'}) {
    try {
      final formatter = DateFormat(format);
      return formatter.parse(dateString);
    } catch (e) {
      return null;
    }
  }

  // Get days between two dates
  static int getDaysBetween(DateTime from, DateTime to) {
    from = DateTime(from.year, from.month, from.day);
    to = DateTime(to.year, to.month, to.day);
    return to.difference(from).inDays;
  }

  // Add days to date
  static DateTime addDays(DateTime date, int days) {
    return date.add(Duration(days: days));
  }

  // Subtract days from date
  static DateTime subtractDays(DateTime date, int days) {
    return date.subtract(Duration(days: days));
  }

  // Check if date is in the past
  static bool isPast(DateTime date) {
    return date.isBefore(DateTime.now());
  }

  // Check if date is in the future
  static bool isFuture(DateTime date) {
    return date.isAfter(DateTime.now());
  }

  // Get formatted date range
  static String formatDateRange(DateTime from, DateTime to) {
    final fromFormatted = formatDate(from);
    final toFormatted = formatDate(to);
    return '$fromFormatted - $toFormatted';
  }
}
