import 'package:intl/intl.dart';

const Duration _istOffset = Duration(hours: 5, minutes: 30);

/// Formats an ISO timestamp in Asia/Kolkata, labelled IST.
String formatIst(String? iso, String languageCode) {
  if (iso == null || iso.isEmpty) return '';
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return iso;
  final ist = parsed.toUtc().add(_istOffset);
  final pattern = DateFormat('d MMM, h:mm a');
  try {
    return '${DateFormat('d MMM, h:mm a', languageCode).format(ist)} IST';
  } on Object {
    return '${pattern.format(ist)} IST';
  }
}

String formatDigestDate(String? isoOrDate, String languageCode) {
  if (isoOrDate == null || isoOrDate.isEmpty) return '';
  final parsed = DateTime.tryParse(isoOrDate);
  if (parsed == null) return isoOrDate;
  final ist = parsed.toUtc().add(_istOffset);
  try {
    return DateFormat('EEEE, d MMM', languageCode).format(ist);
  } on Object {
    return DateFormat('EEEE, d MMM').format(ist);
  }
}

String formatNumber(double value) {
  final fixed = value.toStringAsFixed(2);
  if (fixed.endsWith('00')) return value.toStringAsFixed(0);
  if (fixed.endsWith('0')) return value.toStringAsFixed(1);
  return fixed;
}

String? formatChange(double? pct) {
  if (pct == null) return null;
  final number = formatNumber(pct.abs());
  if (pct > 0) return '+$number%';
  if (pct < 0) return '−$number%';
  return '$number%';
}

String formatValue(double? value, String? unit) {
  if (value == null) return '';
  final number = formatNumber(value);
  if (unit == null || unit.isEmpty) return number;
  return '$number $unit';
}
