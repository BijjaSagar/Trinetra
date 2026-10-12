import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'api/api_client.dart';
import 'api/api_config.dart';
import 'cache/app_cache.dart';
import 'push/push_service.dart';

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw StateError('SharedPreferences is overridden in main()');
});

final apiConfigProvider = Provider<ApiConfig>(
  (ref) => ApiConfig.fromEnvironment(),
);

final dioProvider = Provider<Dio>((ref) {
  final config = ref.watch(apiConfigProvider);
  return Dio(
    BaseOptions(
      baseUrl: config.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
    ),
  );
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    ref.watch(dioProvider),
    config: ref.watch(apiConfigProvider),
  );
});

final appCacheProvider = Provider<AppCache>((ref) {
  return AppCache(ref.watch(sharedPreferencesProvider));
});

class LocaleController extends Notifier<Locale> {
  @override
  Locale build() => Locale(ref.read(appCacheProvider).readLanguage());

  Future<void> setLanguage(String code) async {
    if (code != 'en' && code != 'mr') return;
    if (code == state.languageCode) return;
    await ref.read(appCacheProvider).writeLanguage(code);
    state = Locale(code);
  }
}

final localeProvider = NotifierProvider<LocaleController, Locale>(
  LocaleController.new,
);

class ShellTab extends Notifier<int> {
  @override
  int build() => 0;

  void select(int index) => state = index;

  void openHome() => state = 0;
}

final shellTabProvider = NotifierProvider<ShellTab, int>(ShellTab.new);

final pushServiceProvider = Provider<PushService>((ref) {
  final service = PushService(
    api: ref.watch(apiClientProvider),
    cache: ref.watch(appCacheProvider),
    languageCode: () => ref.read(localeProvider).languageCode,
    onOpenHome: () => ref.read(shellTabProvider.notifier).openHome(),
  );
  ref.listen(localeProvider, (previous, next) {
    if (previous?.languageCode != next.languageCode) {
      service.registerDevice();
    }
  });
  ref.onDispose(service.dispose);
  return service;
});
