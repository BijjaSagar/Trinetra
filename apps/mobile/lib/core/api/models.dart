import 'json_parse.dart';

const String kTagline = 'Be ready before the storm.';

enum SignalLevel {
  normal,
  watch,
  stockUp,
  unknown;

  static SignalLevel parse(String? raw) {
    switch (raw) {
      case 'normal':
        return SignalLevel.normal;
      case 'watch':
        return SignalLevel.watch;
      case 'stock_up':
        return SignalLevel.stockUp;
      default:
        return SignalLevel.unknown;
    }
  }
}

class Digest {
  const Digest({
    required this.digestDate,
    required this.headline,
    required this.summary,
    required this.language,
    required this.pushSentAt,
    required this.stale,
  });

  final String digestDate;
  final String headline;
  final String summary;
  final String language;
  final String? pushSentAt;
  final bool stale;

  factory Digest.fromJson(Map<String, dynamic> json) {
    return Digest(
      digestDate: asString(json['digestDate']) ?? '',
      headline: asString(json['headline']) ?? '',
      summary: asString(json['summary']) ?? '',
      language: asString(json['language']) ?? 'en',
      pushSentAt: asString(json['pushSentAt']),
      stale: asBool(json['stale']),
    );
  }

  Map<String, dynamic> toJson() => {
        'digestDate': digestDate,
        'headline': headline,
        'summary': summary,
        'language': language,
        'pushSentAt': pushSentAt,
        'stale': stale,
      };
}

class Signal {
  const Signal({
    required this.indicatorKey,
    required this.level,
    required this.rawLevel,
    required this.reasonCode,
    required this.value,
    required this.unit,
    required this.change7dPct,
    required this.asOf,
    required this.sourceUrl,
    required this.stale,
    required this.details,
  });

  final String indicatorKey;
  final SignalLevel level;
  final String? rawLevel;
  final String reasonCode;
  final double? value;
  final String? unit;
  final double? change7dPct;
  final String? asOf;
  final String? sourceUrl;
  final bool stale;
  final Map<String, dynamic> details;

  factory Signal.fromJson(Map<String, dynamic> json) {
    final rawLevel = asString(json['level']);
    return Signal(
      indicatorKey: asString(json['indicatorKey']) ?? '',
      level: SignalLevel.parse(rawLevel),
      rawLevel: rawLevel,
      reasonCode: asString(json['reasonCode']) ?? '',
      value: asDouble(json['value']),
      unit: asString(json['unit']),
      change7dPct: asDouble(json['change7dPct']),
      asOf: asString(json['asOf']),
      sourceUrl: asString(json['sourceUrl']),
      stale: asBool(json['stale']),
      details: asMap(json['details']) ?? const {},
    );
  }

  Map<String, dynamic> toJson() => {
        'indicatorKey': indicatorKey,
        'level': rawLevel,
        'reasonCode': reasonCode,
        'value': value,
        'unit': unit,
        'change7dPct': change7dPct,
        'asOf': asOf,
        'sourceUrl': sourceUrl,
        'stale': stale,
        'details': details,
      };
}

class DigestResponse {
  const DigestResponse({
    required this.digest,
    required this.signals,
    required this.tagline,
  });

  final Digest? digest;
  final List<Signal> signals;
  final String tagline;

  bool get isStale =>
      (digest?.stale ?? false) || signals.any((signal) => signal.stale);

  factory DigestResponse.fromJson(Map<String, dynamic> json) {
    final digestJson = json['digest'];
    final signalsJson = json['signals'];
    return DigestResponse(
      digest: digestJson is Map
          ? Digest.fromJson(asMap(digestJson)!)
          : null,
      signals: signalsJson is List
          ? [
              for (final item in signalsJson)
                if (item is Map) Signal.fromJson(asMap(item)!),
            ]
          : const [],
      tagline: asString(json['tagline']) ?? kTagline,
    );
  }

  Map<String, dynamic> toJson() => {
        'digest': digest?.toJson(),
        'signals': [for (final signal in signals) signal.toJson()],
        'tagline': tagline,
      };
}

class HistoryPoint {
  const HistoryPoint({
    required this.asOf,
    required this.value,
    required this.unit,
    required this.level,
    required this.rawLevel,
  });

  final String asOf;
  final double? value;
  final String? unit;
  final SignalLevel? level;
  final String? rawLevel;

  factory HistoryPoint.fromJson(Map<String, dynamic> json) {
    final rawLevel = asString(json['level']);
    return HistoryPoint(
      asOf: asString(json['asOf']) ?? '',
      value: asDouble(json['value']),
      unit: asString(json['unit']),
      level: rawLevel == null ? null : SignalLevel.parse(rawLevel),
      rawLevel: rawLevel,
    );
  }

  Map<String, dynamic> toJson() => {
        'asOf': asOf,
        'value': value,
        'unit': unit,
        'level': rawLevel,
      };
}

class HistorySeries {
  const HistorySeries({required this.indicatorKey, required this.points});

  final String indicatorKey;
  final List<HistoryPoint> points;

  factory HistorySeries.fromJson(Map<String, dynamic> json) {
    final pointsJson = json['points'];
    return HistorySeries(
      indicatorKey: asString(json['indicatorKey']) ?? '',
      points: pointsJson is List
          ? [
              for (final item in pointsJson)
                if (item is Map) HistoryPoint.fromJson(asMap(item)!),
            ]
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'indicatorKey': indicatorKey,
        'points': [for (final point in points) point.toJson()],
      };
}

class HistoryResponse {
  const HistoryResponse({required this.days, required this.series});

  final int days;
  final List<HistorySeries> series;

  factory HistoryResponse.fromJson(Map<String, dynamic> json) {
    final seriesJson = json['series'];
    return HistoryResponse(
      days: asDouble(json['days'])?.round() ?? 30,
      series: seriesJson is List
          ? [
              for (final item in seriesJson)
                if (item is Map) HistorySeries.fromJson(asMap(item)!),
            ]
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'days': days,
        'series': [for (final item in series) item.toJson()],
      };
}

class HealthSource {
  const HealthSource({
    required this.key,
    required this.lastSuccessAt,
    required this.lastError,
    required this.stale,
  });

  final String key;
  final String? lastSuccessAt;
  final String? lastError;
  final bool stale;

  factory HealthSource.fromJson(Map<String, dynamic> json) {
    return HealthSource(
      key: asString(json['key']) ?? '',
      lastSuccessAt: asString(json['lastSuccessAt']),
      lastError: asString(json['lastError']),
      stale: asBool(json['stale']),
    );
  }

  Map<String, dynamic> toJson() => {
        'key': key,
        'lastSuccessAt': lastSuccessAt,
        'lastError': lastError,
        'stale': stale,
      };
}

class HealthResponse {
  const HealthResponse({required this.ok, required this.sources});

  final bool ok;
  final List<HealthSource> sources;

  factory HealthResponse.fromJson(Map<String, dynamic> json) {
    final sourcesJson = json['sources'];
    return HealthResponse(
      ok: asBool(json['ok']),
      sources: sourcesJson is List
          ? [
              for (final item in sourcesJson)
                if (item is Map) HealthSource.fromJson(asMap(item)!),
            ]
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'ok': ok,
        'sources': [for (final source in sources) source.toJson()],
      };
}

class PlaybookCard {
  const PlaybookCard({
    required this.topic,
    required this.title,
    required this.steps,
  });

  final String topic;
  final String title;
  final List<String> steps;

  factory PlaybookCard.fromJson(Map<String, dynamic> json) {
    return PlaybookCard(
      topic: asString(json['topic']) ?? '',
      title: asString(json['title']) ?? '',
      steps: asStringList(json['steps']),
    );
  }

  Map<String, dynamic> toJson() => {
        'topic': topic,
        'title': title,
        'steps': steps,
      };
}

class PlaybookResponse {
  const PlaybookResponse({
    required this.language,
    required this.worthBuffer,
    required this.notWorthIt,
    required this.disclaimer,
    required this.cards,
  });

  final String language;
  final List<String> worthBuffer;
  final List<String> notWorthIt;
  final String? disclaimer;
  final List<PlaybookCard> cards;

  bool get isEmpty =>
      worthBuffer.isEmpty && notWorthIt.isEmpty && cards.isEmpty;

  factory PlaybookResponse.fromJson(Map<String, dynamic> json) {
    final cardsJson = json['cards'];
    return PlaybookResponse(
      language: asString(json['language']) ?? 'en',
      worthBuffer: asStringList(json['worthBuffer']),
      notWorthIt: asStringList(json['notWorthIt']),
      disclaimer: asString(json['disclaimer']),
      cards: cardsJson is List
          ? [
              for (final item in cardsJson)
                if (item is Map) PlaybookCard.fromJson(asMap(item)!),
            ]
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'language': language,
        'worthBuffer': worthBuffer,
        'notWorthIt': notWorthIt,
        'disclaimer': disclaimer,
        'cards': [for (final card in cards) card.toJson()],
      };
}

class DeviceRegistration {
  const DeviceRegistration({required this.id, required this.lastSeenAt});

  final String id;
  final String? lastSeenAt;

  factory DeviceRegistration.fromJson(Map<String, dynamic> json) {
    return DeviceRegistration(
      id: asString(json['id']) ?? '',
      lastSeenAt: asString(json['lastSeenAt']),
    );
  }
}
