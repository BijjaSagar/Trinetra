double? asDouble(Object? value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value.trim());
  return null;
}

bool asBool(Object? value) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  if (value is String) {
    final text = value.trim().toLowerCase();
    return text == 'true' || text == '1';
  }
  return false;
}

String? asString(Object? value) {
  if (value == null) return null;
  if (value is String) {
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
  }
  return value.toString();
}

Map<String, dynamic>? asMap(Object? value) {
  if (value is Map) {
    return value.map((key, item) => MapEntry(key.toString(), item));
  }
  return null;
}

List<String> asStringList(Object? value) {
  if (value is! List) return const [];
  final result = <String>[];
  for (final item in value) {
    final text = asString(item);
    if (text != null) result.add(text);
  }
  return result;
}

Map<String, dynamic> asJsonMap(Object? value) {
  final map = asMap(value);
  if (map == null) {
    throw const FormatException('Expected a JSON object');
  }
  return map;
}
