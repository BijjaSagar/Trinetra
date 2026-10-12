import 'package:dio/dio.dart';

import 'api_config.dart';
import 'api_exception.dart';
import 'json_parse.dart';
import 'models.dart';

class ApiClient {
  ApiClient(this._dio, {required this.config});

  final Dio _dio;
  final ApiConfig config;

  Future<DeviceRegistration> registerDevice({
    required String apnsToken,
    required String environment,
    required String language,
  }) {
    return _send(
      () => _dio.post(
        '/devices',
        data: {
          'apnsToken': apnsToken,
          'environment': environment,
          'language': language,
        },
        options: _options(language),
      ),
      DeviceRegistration.fromJson,
    );
  }

  Future<DigestResponse> latestDigest(String language) {
    return _send(
      () => _dio.get(
        '/digest/latest',
        queryParameters: {'lang': language},
        options: _options(language),
      ),
      DigestResponse.fromJson,
    );
  }

  /// Pull-to-refresh only. The contract has no query and no body.
  /// `Accept-Language` asks for the open language. The caller refetches
  /// `GET /digest/latest` if the returned copy is in another language.
  Future<DigestResponse> refresh(String language) {
    return _send(
      () => _dio.post(
        '/refresh',
        options: _options(
          language,
          receiveTimeout: const Duration(seconds: 60),
        ),
      ),
      DigestResponse.fromJson,
    );
  }

  Future<HistoryResponse> history({
    required String language,
    int days = 30,
  }) {
    return _send(
      () => _dio.get(
        '/signals/history',
        queryParameters: {'days': days, 'lang': language},
        options: _options(language),
      ),
      HistoryResponse.fromJson,
    );
  }

  Future<HealthResponse> health(String language) {
    return _send(
      () => _dio.get('/health', options: _options(language)),
      HealthResponse.fromJson,
    );
  }

  Future<PlaybookResponse> playbooks(String language) {
    return _send(
      () => _dio.get(
        '/playbooks',
        queryParameters: {'lang': language},
        options: _options(language),
      ),
      PlaybookResponse.fromJson,
    );
  }

  Options _options(String language, {Duration? receiveTimeout}) {
    return Options(
      headers: {'Accept-Language': language},
      receiveTimeout: receiveTimeout,
    );
  }

  Future<T> _send<T>(
    Future<Response<dynamic>> Function() request,
    T Function(Map<String, dynamic> json) parse,
  ) async {
    if (!config.isConfigured) {
      throw const ApiException(ApiFailure.notConfigured);
    }
    try {
      final response = await request();
      return parse(asJsonMap(response.data));
    } on ApiException {
      rethrow;
    } on DioException catch (error) {
      throw _fromDio(error);
    } on FormatException {
      throw const ApiException(ApiFailure.badResponse);
    }
  }

  ApiException _fromDio(DioException error) {
    final code = error.response?.statusCode;
    if (code == 401 || code == 403) {
      return ApiException(ApiFailure.unauthorized, statusCode: code);
    }
    if (code == 429) {
      return ApiException(ApiFailure.coolingDown, statusCode: code);
    }
    if (code != null && code >= 400) {
      return ApiException(ApiFailure.badResponse, statusCode: code);
    }
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return ApiException(ApiFailure.offline, statusCode: code);
      case DioExceptionType.badResponse:
        return ApiException(ApiFailure.badResponse, statusCode: code);
      case DioExceptionType.cancel:
      case DioExceptionType.badCertificate:
      case DioExceptionType.unknown:
      case DioExceptionType.transformTimeout:
        return ApiException(ApiFailure.unknown, statusCode: code);
    }
  }
}
