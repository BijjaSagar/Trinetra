import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_exception.dart';
import '../../core/api/models.dart';
import '../../core/load_state.dart';
import '../../core/providers.dart';
import '../playbook/playbook_controller.dart';
import '../report/report_controller.dart';

class HomeController extends Notifier<LoadState<DigestResponse>> {
  int _ticket = 0;

  @override
  LoadState<DigestResponse> build() {
    final language = ref.watch(localeProvider).languageCode;
    final cached = ref.read(appCacheProvider).readDigest(language);
    final ticket = ++_ticket;
    Future<void>(() => _fetch(language, ticket));
    if (cached != null) {
      return LoadState(data: cached, loading: true, fromCache: true);
    }
    return const LoadState(loading: true);
  }

  Future<void> reload() {
    final language = ref.read(localeProvider).languageCode;
    final ticket = ++_ticket;
    state = state.copyWith(loading: true, clearFailure: true);
    return _fetch(language, ticket);
  }

  /// Pull-to-refresh is the only caller of POST /refresh.
  Future<void> pullToRefresh() async {
    final language = ref.read(localeProvider).languageCode;
    final ticket = ++_ticket;
    state = state.copyWith(loading: true, clearFailure: true);
    try {
      var fresh = await ref.read(apiClientProvider).refresh(language);
      if (!_current(ticket)) return;
      final returned = fresh.digest?.language;
      if (returned != null && returned.isNotEmpty && returned != language) {
        fresh = await ref.read(apiClientProvider).latestDigest(language);
        if (!_current(ticket)) return;
      }
      await ref.read(appCacheProvider).writeDigest(language, fresh);
      if (!_current(ticket)) return;
      state = LoadState(data: fresh);
      ref.invalidate(historyProvider);
      ref.invalidate(playbookProvider);
    } on ApiException catch (error) {
      if (!_current(ticket)) return;
      state = state.copyWith(loading: false, failure: error.failure);
    }
  }

  Future<void> _fetch(String language, int ticket) async {
    try {
      final fresh = await ref.read(apiClientProvider).latestDigest(language);
      if (!_current(ticket)) return;
      await ref.read(appCacheProvider).writeDigest(language, fresh);
      if (!_current(ticket)) return;
      state = LoadState(data: fresh);
    } on ApiException catch (error) {
      if (!_current(ticket)) return;
      state = state.copyWith(loading: false, failure: error.failure);
    }
  }

  bool _current(int ticket) => ticket == _ticket && ref.mounted;
}

final homeProvider =
    NotifierProvider<HomeController, LoadState<DigestResponse>>(
  HomeController.new,
);
