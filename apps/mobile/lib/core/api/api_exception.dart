enum ApiFailure {
  offline,
  unauthorized,
  coolingDown,
  notConfigured,
  badResponse,
  unknown,
}

class ApiException implements Exception {
  const ApiException(this.failure, {this.statusCode});

  final ApiFailure failure;
  final int? statusCode;

  @override
  String toString() => 'ApiException($failure, statusCode: $statusCode)';
}
