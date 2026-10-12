import '../api/json_parse.dart';
import '../api/models.dart';
import '../l10n/generated/app_localizations.dart';

const _indicatorOrder = <String>[
  'brent_usd',
  'indian_basket_usd',
  'crude',
  'crude_oil',
  'brent',
  'petrol_solapur',
  'diesel_solapur',
  'petrol',
  'diesel',
  'usd_inr',
  'fao_veg_oil_index',
  'edible_oil',
  'onion_solapur_rs_kg',
  'tomato_solapur_rs_kg',
  'wheat_solapur_rs_kg',
  'tur_solapur_rs_kg',
  'food',
  'gold_inr_10g',
  'silver_inr_kg',
  'gold_usd_oz',
  'silver_usd_oz',
  'gold',
  'silver',
  'ujani_pct',
  'ujani',
  'cwc_national_pct',
  'reservoirs',
];

int indicatorRank(String key) {
  final index = _indicatorOrder.indexOf(key);
  return index == -1 ? _indicatorOrder.length : index;
}

List<T> sortByIndicator<T>(List<T> items, String Function(T item) keyOf) {
  final copy = [...items];
  copy.sort((a, b) {
    final rank = indicatorRank(keyOf(a)).compareTo(indicatorRank(keyOf(b)));
    if (rank != 0) return rank;
    return keyOf(a).compareTo(keyOf(b));
  });
  return copy;
}

String indicatorLabel(String key, AppLocalizations l10n) {
  switch (key) {
    case 'brent_usd':
    case 'eia_brent':
      return l10n.indicatorBrent;
    case 'indian_basket_usd':
    case 'ppac_indian_basket':
      return l10n.indicatorIndianBasket;
    case 'petrol_solapur':
    case 'petrol':
      return l10n.indicatorPetrolSolapur;
    case 'diesel_solapur':
    case 'diesel':
      return l10n.indicatorDieselSolapur;
    case 'crude':
    case 'crude_oil':
    case 'brent':
    case 'indian_basket':
      return l10n.indicatorCrude;
    case 'usd_inr':
    case 'usdinr':
    case 'rbi_usd_inr':
      return l10n.indicatorRupee;
    case 'fao_veg_oil_index':
    case 'edible_oil':
    case 'fao_vegetable_oil':
    case 'fao_veg_oil':
      return l10n.indicatorEdibleOil;
    case 'food':
    case 'food_prices':
    case 'food_dca':
      return l10n.indicatorFood;
    case 'onion_solapur_rs_kg':
      return l10n.indicatorOnion;
    case 'tomato_solapur_rs_kg':
      return l10n.indicatorTomato;
    case 'wheat_solapur_rs_kg':
      return l10n.indicatorWheat;
    case 'tur_solapur_rs_kg':
      return l10n.indicatorTur;
    case 'gold_inr_10g':
    case 'gold':
    case 'ibja_gold':
      return l10n.indicatorGold;
    case 'silver_inr_kg':
    case 'silver':
    case 'ibja_silver':
      return l10n.indicatorSilver;
    case 'gold_usd_oz':
      return l10n.indicatorGoldUsd;
    case 'silver_usd_oz':
      return l10n.indicatorSilverUsd;
    case 'metals_usd':
      return l10n.sourceMetalsUsd;
    case 'ujani_pct':
    case 'ujani':
    case 'ujani_dam':
      return l10n.indicatorUjani;
    case 'cwc_national_pct':
    case 'reservoirs':
    case 'national_reservoirs':
    case 'cwc':
      return l10n.indicatorReservoirs;
    case 'water':
    case 'solapur_water':
      return l10n.indicatorWater;
    case 'fuel_solapur':
      return l10n.sourceFuelSolapur;
    case 'news':
      return l10n.sourceNews;
    default:
      return humanizeKey(key);
  }
}

String signalLabel(Signal signal, AppLocalizations l10n) {
  switch (signal.level) {
    case SignalLevel.normal:
      return l10n.signalNormal;
    case SignalLevel.watch:
      return l10n.signalWatch;
    case SignalLevel.stockUp:
      return l10n.signalStockUp;
    case SignalLevel.unknown:
      final raw = signal.rawLevel;
      if (raw != null && raw.isNotEmpty) return humanizeKey(raw);
      return l10n.signalUnknown;
  }
}

String signalLabelForLevel(SignalLevel level, AppLocalizations l10n) {
  switch (level) {
    case SignalLevel.normal:
      return l10n.signalNormal;
    case SignalLevel.watch:
      return l10n.signalWatch;
    case SignalLevel.stockUp:
      return l10n.signalStockUp;
    case SignalLevel.unknown:
      return l10n.signalUnknown;
  }
}

String reasonText(Signal signal, AppLocalizations l10n) {
  final fromDetails = _detailSentence(signal.details);
  if (fromDetails != null) return fromDetails;
  final mapped = _reasonForCode(signal.reasonCode, l10n);
  if (mapped != null) return mapped;
  switch (signal.level) {
    case SignalLevel.normal:
      return l10n.reasonNormal;
    case SignalLevel.watch:
      return l10n.reasonWatch;
    case SignalLevel.stockUp:
      return l10n.reasonStockUp;
    case SignalLevel.unknown:
      return l10n.reasonUnknown;
  }
}

/// Human-readable detail rows, skipping the sentence already used as the reason.
List<MapEntry<String, String>> detailRows(Map<String, dynamic> details) {
  const hidden = {'reason', 'explanation', 'summary', 'note'};
  final rows = <MapEntry<String, String>>[];
  void collect(Map<String, dynamic> source, String prefix) {
    for (final entry in source.entries) {
      if (prefix.isEmpty && hidden.contains(entry.key)) continue;
      final value = entry.value;
      if (value == null) continue;
      final nested = asMap(value);
      if (nested != null) {
        final next = prefix.isEmpty
            ? humanizeKey(entry.key)
            : '$prefix, ${humanizeKey(entry.key)}';
        collect(nested, next);
        continue;
      }
      if (value is List) continue;
      final text = value.toString().trim();
      if (text.isEmpty) continue;
      final label = prefix.isEmpty
          ? humanizeKey(entry.key)
          : '$prefix, ${humanizeKey(entry.key)}';
      rows.add(MapEntry(label, text));
    }
  }

  collect(details, '');
  return rows;
}

String? _reasonForCode(String code, AppLocalizations l10n) {
  switch (code) {
    case 'insufficient_history':
      return l10n.reasonInsufficientHistory;
    case 'within_threshold':
      return l10n.reasonWithinThreshold;
    case 'crude_up_gt_5_7d':
      return l10n.reasonCrude5;
    case 'crude_up_gt_10_7d':
      return l10n.reasonCrude10;
    case 'retail_hike_announced':
      return l10n.reasonRetailHike;
    case 'fuel_unchanged':
      return l10n.reasonFuelUnchanged;
    case 'petrol_price_changed':
      return l10n.reasonPetrolChanged;
    case 'diesel_price_changed':
      return l10n.reasonDieselChanged;
    case 'inr_weaker_gt_2_30d':
      return l10n.reasonInrWeaker;
    case 'fao_duty_cut':
      return l10n.reasonFaoDutyCut;
    case 'fao_index_falling':
      return l10n.reasonFaoFalling;
    case 'fao_up_gt_3_month_no_duty_cut':
      return l10n.reasonFaoUp;
    case 'ujani_supply_cut':
      return l10n.reasonUjaniCut;
    case 'ujani_below_25':
      return l10n.reasonUjani25;
    case 'ujani_below_40_october':
      return l10n.reasonUjani40;
    case 'metal_up_gt_3_7d':
      return l10n.reasonMetal3;
    case 'cwc_informational':
      return l10n.reasonReservoirsInfo;
    case 'food_informational':
      return l10n.reasonFoodInfo;
    default:
      return null;
  }
}

String? _detailSentence(Map<String, dynamic> details) {
  for (final key in ['reason', 'explanation', 'summary', 'note']) {
    final value = details[key];
    if (value is String && value.trim().isNotEmpty) return value.trim();
  }
  return null;
}

String humanizeKey(String key) {
  final spaced = key
      .replaceAllMapped(RegExp(r'([a-z])([A-Z])'), (match) {
        return '${match.group(1)} ${match.group(2)}';
      })
      .replaceAll('_', ' ')
      .trim();
  if (spaced.isEmpty) return key;
  return spaced[0].toUpperCase() + spaced.substring(1);
}
