import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../api/models.dart';

class AlertSettings {
  const AlertSettings({
    required this.morningDigest,
    required this.stockUp,
  });

  final bool morningDigest;
  final bool stockUp;

  static const defaults = AlertSettings(morningDigest: true, stockUp: true);
}

/// Last digest, history, and playbook, plus settings that stay on device.
class AppCache {
  AppCache(this._prefs);

  final SharedPreferences _prefs;

  static const _language = 'trinetra.language';
  static const _morning = 'trinetra.alert.morning';
  static const _stockUp = 'trinetra.alert.stockUp';

  String readLanguage() => _prefs.getString(_language) ?? 'en';

  Future<void> writeLanguage(String code) => _prefs.setString(_language, code);

  AlertSettings readAlerts() {
    return AlertSettings(
      morningDigest: _prefs.getBool(_morning) ?? true,
      stockUp: _prefs.getBool(_stockUp) ?? true,
    );
  }

  Future<void> writeAlerts(AlertSettings settings) async {
    await _prefs.setBool(_morning, settings.morningDigest);
    await _prefs.setBool(_stockUp, settings.stockUp);
  }

  DigestResponse? readDigest(String language) {
    return _read('trinetra.digest.$language', DigestResponse.fromJson);
  }

  Future<void> writeDigest(String language, DigestResponse value) {
    return _write('trinetra.digest.$language', value.toJson());
  }

  HistoryResponse? readHistory() {
    return _read('trinetra.history', HistoryResponse.fromJson);
  }

  Future<void> writeHistory(HistoryResponse value) {
    return _write('trinetra.history', value.toJson());
  }

  PlaybookResponse? readPlaybook(String language) {
    return _read('trinetra.playbook.$language', PlaybookResponse.fromJson);
  }

  Future<void> writePlaybook(String language, PlaybookResponse value) {
    return _write('trinetra.playbook.$language', value.toJson());
  }

  T? _read<T>(String key, T Function(Map<String, dynamic>) parse) {
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return parse(decoded.map((itemKey, value) => MapEntry('$itemKey', value)));
    } on Object {
      return null;
    }
  }

  Future<void> _write(String key, Map<String, dynamic> json) {
    return _prefs.setString(key, jsonEncode(json));
  }
}
