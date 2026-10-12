import 'api/api_exception.dart';

class LoadState<T> {
  const LoadState({
    this.data,
    this.failure,
    this.loading = false,
    this.fromCache = false,
  });

  final T? data;
  final ApiFailure? failure;
  final bool loading;
  final bool fromCache;

  LoadState<T> copyWith({
    T? data,
    ApiFailure? failure,
    bool clearFailure = false,
    bool? loading,
    bool? fromCache,
  }) {
    return LoadState<T>(
      data: data ?? this.data,
      failure: clearFailure ? failure : (failure ?? this.failure),
      loading: loading ?? this.loading,
      fromCache: fromCache ?? this.fromCache,
    );
  }
}
