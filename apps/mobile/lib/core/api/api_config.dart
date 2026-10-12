import 'package:flutter/foundation.dart';

/// Build-time API settings. The key is never stored in source.
class ApiConfig {
  const ApiConfig({required this.baseUrl, required this.apiKey});

  final String baseUrl;
  final String apiKey;

  bool get isConfigured => baseUrl.isNotEmpty;

  /// Debug builds fall back to the local API. Release and profile do not.
  factory ApiConfig.fromEnvironment() {
    const definedBase = String.fromEnvironment('API_BASE_URL');
    const definedKey = String.fromEnvironment('API_KEY');
    final base = definedBase.isNotEmpty
        ? definedBase
        : (kDebugMode ? 'http://127.0.0.1:3000' : '');
    return ApiConfig(
      baseUrl: _trimSlash(base),
      apiKey: definedKey,
    );
  }

  /// Debug is sandbox. Profile and release are production.
  /// Override with `--dart-define=APNS_ENVIRONMENT=sandbox|production`.
  static String get apnsEnvironment {
    const override = String.fromEnvironment('APNS_ENVIRONMENT');
    if (override == 'sandbox' || override == 'production') {
      return override;
    }
    return kDebugMode ? 'sandbox' : 'production';
  }

  static String _trimSlash(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }
}
