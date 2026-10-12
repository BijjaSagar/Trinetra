import 'package:flutter/services.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../api/api_client.dart';
import '../api/api_config.dart';
import '../api/api_exception.dart';
import '../cache/app_cache.dart';

/// Whether a foreground banner should appear.
///
/// `digest` follows the morning toggle. `stock_up` follows the stock-up
/// toggle. `stale` always shows. A missing kind follows the morning toggle.
bool allowsForegroundPush(String? kind, AlertSettings alerts) {
  switch (kind) {
    case 'stock_up':
      return alerts.stockUp;
    case 'stale':
      return true;
    case 'digest':
    default:
      return alerts.morningDigest;
  }
}

/// APNs token bridge. Registration stays in AppDelegate; this class only
/// receives the token and shows a foreground banner.
class PushService {
  PushService({
    required this.api,
    required this.cache,
    required this.languageCode,
    required this.onOpenHome,
  });

  static const channelName = 'in.rhtechnology.trinetra/push';

  final ApiClient api;
  final AppCache cache;
  final String Function() languageCode;
  final VoidCallback onOpenHome;

  final MethodChannel _channel = const MethodChannel(channelName);
  final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  String? _token;
  var _started = false;

  Future<void> start() async {
    if (_started) return;
    _started = true;
    _channel.setMethodCallHandler(_onCall);
    await _initLocalNotifications();
    try {
      await _channel.invokeMethod<void>('register');
    } on PlatformException {
      // No token on the simulator, or the person declined permission.
    } on MissingPluginException {
      // Widget tests and hosts without the iOS channel.
    }
  }

  void dispose() {
    _channel.setMethodCallHandler(null);
  }

  Future<void> registerDevice() async {
    final token = _token;
    if (token == null || token.isEmpty) return;
    final language = languageCode();
    if (language != 'en' && language != 'mr') return;
    try {
      await api.registerDevice(
        apnsToken: token,
        environment: ApiConfig.apnsEnvironment,
        language: language,
      );
    } on ApiException {
      // The next launch sends the token again.
    }
  }

  Future<void> _onCall(MethodCall call) async {
    switch (call.method) {
      case 'onToken':
        final token = call.arguments;
        if (token is String && token.isNotEmpty) {
          _token = token;
          await registerDevice();
        }
      case 'onForeground':
        final args = call.arguments;
        if (args is Map) {
          await _showForeground(
            title: _string(args['title']) ?? 'Trinetra',
            body: _string(args['body']) ?? '',
            kind: _string(args['kind']),
          );
        }
      case 'onOpened':
        onOpenHome();
    }
  }

  Future<void> _initLocalNotifications() async {
    const settings = InitializationSettings(
      iOS: DarwinInitializationSettings(
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      ),
    );
    await _notifications.initialize(
      settings: settings,
      onDidReceiveNotificationResponse: (_) => onOpenHome(),
    );
    final launch = await _notifications.getNotificationAppLaunchDetails();
    if (launch?.didNotificationLaunchApp ?? false) {
      onOpenHome();
    }
  }

  Future<void> _showForeground({
    required String title,
    required String body,
    required String? kind,
  }) async {
    if (!allowsForegroundPush(kind, cache.readAlerts())) return;
    await _notifications.show(
      id: 1,
      title: title,
      body: body,
      notificationDetails: const NotificationDetails(
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBanner: true,
          presentList: true,
          presentSound: true,
        ),
      ),
      payload: 'home',
    );
  }

  String? _string(Object? value) {
    if (value is String && value.isNotEmpty) return value;
    return null;
  }
}
