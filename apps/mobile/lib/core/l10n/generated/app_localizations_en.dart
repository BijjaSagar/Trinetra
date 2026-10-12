// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Trinetra';

  @override
  String get tagline => 'Be ready before the storm.';

  @override
  String get marathiLine => 'संकटाआधी, तयारी.';

  @override
  String get logoLabel => 'Trinetra logo';

  @override
  String get navHome => 'Home';

  @override
  String get navReport => 'Report';

  @override
  String get navPlaybook => 'Playbook';

  @override
  String get navSettings => 'Settings';

  @override
  String get loading => 'Loading';

  @override
  String get retry => 'Try again';

  @override
  String get pullToRefresh => 'Pull to refresh';

  @override
  String get staleBanner =>
      'Some figures are older than usual. The last good value is still shown.';

  @override
  String get staleFigure => 'Older figure';

  @override
  String get showingSaved => 'Showing the saved digest while we check.';

  @override
  String get emptyHeadline => 'No digest yet';

  @override
  String get emptyBody => 'Pull down to fetch today\'s signals.';

  @override
  String get errorTitle => 'Could not refresh';

  @override
  String get errorOffline => 'Saved figures are still on screen.';

  @override
  String get errorNoData =>
      'Nothing saved yet. Check the connection and try again.';

  @override
  String get errorUnauthorized => 'The API key was rejected.';

  @override
  String get errorNotConfigured => 'The API address is not set for this build.';

  @override
  String get refreshCoolingDown =>
      'Refresh is cooling down. Showing the last digest.';

  @override
  String asOf(String time) {
    return 'As of $time';
  }

  @override
  String change7d(String change) {
    return '$change in 7 days';
  }

  @override
  String get no7dChange => 'No 7-day figure';

  @override
  String get noValue => 'No figure';

  @override
  String get signalNormal => 'Normal';

  @override
  String get signalWatch => 'Watch';

  @override
  String get signalStockUp => 'Stock up';

  @override
  String get signalUnknown => 'Unknown';

  @override
  String signalSemantics(String label) {
    return 'Signal: $label';
  }

  @override
  String get reasonTitle => 'Why this signal';

  @override
  String get reasonNormal => 'Within the usual range. Nothing to do.';

  @override
  String get reasonWatch => 'Worth a look. No rush.';

  @override
  String get reasonStockUp =>
      'A short buffer is worth having. A 2 to 4 week supply is enough.';

  @override
  String get reasonUnknown =>
      'The signal is not recognised. The figure is still shown.';

  @override
  String get sourceLink => 'Source';

  @override
  String sourceSemantics(String name) {
    return 'Open source for $name';
  }

  @override
  String get disclaimer =>
      'Trinetra shares information and signals, not investment advice.';

  @override
  String get reportTitle => '30-day report';

  @override
  String get reportEmpty => 'No 30-day history yet.';

  @override
  String get chartTooShort => 'Not enough days for a chart yet.';

  @override
  String chartSemantics(String name, String value, String level) {
    return '$name. 30-day chart. Latest $value. Signal $level.';
  }

  @override
  String get whatMoved => 'What moved';

  @override
  String get worthBuffer => 'Worth a 2 to 4 week buffer';

  @override
  String get notWorthIt => 'Not worth it';

  @override
  String get playbookEmpty => 'The playbook is not available yet.';

  @override
  String stepSemantics(int index, int total) {
    return 'Step $index of $total';
  }

  @override
  String get language => 'Language';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageMarathi => 'मराठी';

  @override
  String get alerts => 'Alerts';

  @override
  String get alertMorning => 'Morning digest';

  @override
  String get alertMorningHint =>
      'Hides the morning alert while the app is open. One summary is sent around 7:30.';

  @override
  String get alertStockUp => 'New stock-up signal';

  @override
  String get alertStockUpHint =>
      'Hides an extra stock-up alert while the app is open. At most one a day.';

  @override
  String get alertSystemNote =>
      'To stop alerts when the app is closed, use iOS Settings.';

  @override
  String get dataHealth => 'Data health';

  @override
  String get healthOk => 'Sources look fine';

  @override
  String get healthAttention => 'A source needs attention';

  @override
  String get healthUnavailable => 'Data health is unavailable.';

  @override
  String get sourceFresh => 'Fresh';

  @override
  String get sourceStale => 'Stale';

  @override
  String lastSuccess(String time) {
    return 'Last success $time';
  }

  @override
  String get noLastSuccess => 'No successful fetch yet';

  @override
  String get lastError => 'Last error';

  @override
  String get about => 'About';

  @override
  String versionLabel(String version) {
    return 'Version $version';
  }

  @override
  String get aboutBody =>
      'Personal signals for one person in Solapur. Information only.';

  @override
  String get indicatorPetrol => 'Petrol';

  @override
  String get indicatorDiesel => 'Diesel';

  @override
  String get indicatorCrude => 'Crude oil';

  @override
  String get indicatorRupee => 'Rupee';

  @override
  String get indicatorEdibleOil => 'Cooking oil';

  @override
  String get indicatorFood => 'Food prices';

  @override
  String get indicatorGold => 'Gold';

  @override
  String get indicatorSilver => 'Silver';

  @override
  String get indicatorUjani => 'Ujani dam';

  @override
  String get indicatorReservoirs => 'Reservoirs';

  @override
  String get indicatorWater => 'Solapur water';

  @override
  String get indicatorBrent => 'Brent crude';

  @override
  String get indicatorIndianBasket => 'Indian basket';

  @override
  String get indicatorPetrolSolapur => 'Petrol, Solapur';

  @override
  String get indicatorDieselSolapur => 'Diesel, Solapur';

  @override
  String get indicatorOnion => 'Onion';

  @override
  String get indicatorTomato => 'Tomato';

  @override
  String get indicatorWheat => 'Wheat';

  @override
  String get indicatorTur => 'Tur dal';

  @override
  String get indicatorGoldUsd => 'Gold, USD';

  @override
  String get indicatorSilverUsd => 'Silver, USD';

  @override
  String get sourceMetalsUsd => 'Metals, USD';

  @override
  String get sourceFuelSolapur => 'Solapur fuel';

  @override
  String get sourceNews => 'News';

  @override
  String get reasonInsufficientHistory =>
      'Not enough recent days to judge this yet.';

  @override
  String get reasonWithinThreshold => 'Within the usual range. Nothing to do.';

  @override
  String get reasonCrude5 =>
      'Crude is up more than 5% in 7 days. A retail hike is more likely. Keep the tank reasonably full.';

  @override
  String get reasonCrude10 =>
      'Crude is up more than 10% in 7 days. Transport costs may rise over 1 to 3 weeks. A 2 to 4 week buffer is enough.';

  @override
  String get reasonRetailHike =>
      'A retail fuel hike showed up. Fill the vehicle tank. Do not store fuel at home.';

  @override
  String get reasonFuelUnchanged => 'The pump price has not changed.';

  @override
  String get reasonPetrolChanged =>
      'The Solapur petrol price changed. Fill the vehicle tank. Do not store fuel at home.';

  @override
  String get reasonDieselChanged =>
      'The Solapur diesel price changed. Transport costs may follow. Do not store fuel at home.';

  @override
  String get reasonInrWeaker =>
      'The rupee is weaker by more than 2% over 30 days. Imported goods can cost more.';

  @override
  String get reasonFaoDutyCut =>
      'Import duty on cooking oil was cut. No need to stock.';

  @override
  String get reasonFaoFalling =>
      'The cooking-oil index is falling. No need to stock.';

  @override
  String get reasonFaoUp =>
      'The cooking-oil index is up more than 3% this month, with no duty cut. A 4 week supply is enough.';

  @override
  String get reasonUjaniCut =>
      'A water supply cut was reported. Fill drinking-water containers and check tanker days.';

  @override
  String get reasonUjani25 =>
      'Ujani is below 25% of live storage. Fill drinking-water containers and plan for tanker days.';

  @override
  String get reasonUjani40 =>
      'Ujani is below 40% of live storage in October. Store drinking water and check supply days.';

  @override
  String get reasonMetal3 =>
      'The rupee price is up more than 3% in 7 days. No rush. If you need some, spread it over several weeks.';

  @override
  String get reasonReservoirsInfo => 'National reservoir level, for context.';

  @override
  String get reasonFoodInfo => 'A Solapur food price, for context.';
}
