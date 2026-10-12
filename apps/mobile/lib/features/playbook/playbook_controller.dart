import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/api/api_exception.dart';
import '../../core/api/models.dart';
import '../../core/load_state.dart';
import '../../core/providers.dart';

class PlaybookController extends Notifier<LoadState<PlaybookResponse>> {
  int _ticket = 0;

  @override
  LoadState<PlaybookResponse> build() {
    final language = ref.watch(localeProvider).languageCode;
    final cached = ref.read(appCacheProvider).readPlaybook(language);
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

  Future<void> _fetch(String language, int ticket) async {
    try {
      final fresh = await ref.read(apiClientProvider).playbooks(language);
      if (!_current(ticket)) return;
      await ref.read(appCacheProvider).writePlaybook(language, fresh);
      if (!_current(ticket)) return;
      state = LoadState(data: fresh);
    } on ApiException catch (error) {
      if (!_current(ticket)) return;
      state = state.copyWith(loading: false, failure: error.failure);
    }
  }

  bool _current(int ticket) => ticket == _ticket && ref.mounted;
}

final playbookProvider =
    NotifierProvider<PlaybookController, LoadState<PlaybookResponse>>(
  PlaybookController.new,
);
