import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_en.dart';
import 'app_localizations_mr.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'generated/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('en'),
    Locale('mr'),
  ];

  /// No description provided for @appName.
  ///
  /// In en, this message translates to:
  /// **'Trinetra'**
  String get appName;

  /// Exact product tagline. Keep this English string in every language.
  ///
  /// In en, this message translates to:
  /// **'Be ready before the storm.'**
  String get tagline;

  /// Shown under the tagline only when the app language is Marathi.
  ///
  /// In en, this message translates to:
  /// **'संकटाआधी, तयारी.'**
  String get marathiLine;

  /// No description provided for @logoLabel.
  ///
  /// In en, this message translates to:
  /// **'Trinetra logo'**
  String get logoLabel;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navReport.
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get navReport;

  /// No description provided for @navPlaybook.
  ///
  /// In en, this message translates to:
  /// **'Playbook'**
  String get navPlaybook;

  /// No description provided for @navSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get navSettings;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading'**
  String get loading;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Try again'**
  String get retry;

  /// No description provided for @pullToRefresh.
  ///
  /// In en, this message translates to:
  /// **'Pull to refresh'**
  String get pullToRefresh;

  /// No description provided for @staleBanner.
  ///
  /// In en, this message translates to:
  /// **'Some figures are older than usual. The last good value is still shown.'**
  String get staleBanner;

  /// No description provided for @staleFigure.
  ///
  /// In en, this message translates to:
  /// **'Older figure'**
  String get staleFigure;

  /// No description provided for @showingSaved.
  ///
  /// In en, this message translates to:
  /// **'Showing the saved digest while we check.'**
  String get showingSaved;

  /// No description provided for @emptyHeadline.
  ///
  /// In en, this message translates to:
  /// **'No digest yet'**
  String get emptyHeadline;

  /// No description provided for @emptyBody.
  ///
  /// In en, this message translates to:
  /// **'Pull down to fetch today\'s signals.'**
  String get emptyBody;

  /// No description provided for @errorTitle.
  ///
  /// In en, this message translates to:
  /// **'Could not refresh'**
  String get errorTitle;

  /// No description provided for @errorOffline.
  ///
  /// In en, this message translates to:
  /// **'Saved figures are still on screen.'**
  String get errorOffline;

  /// No description provided for @errorNoData.
  ///
  /// In en, this message translates to:
  /// **'Nothing saved yet. Check the connection and try again.'**
  String get errorNoData;

  /// No description provided for @errorUnauthorized.
  ///
  /// In en, this message translates to:
  /// **'The API key was rejected.'**
  String get errorUnauthorized;

  /// No description provided for @errorNotConfigured.
  ///
  /// In en, this message translates to:
  /// **'The API address is not set for this build.'**
  String get errorNotConfigured;

  /// No description provided for @refreshCoolingDown.
  ///
  /// In en, this message translates to:
  /// **'Refresh is cooling down. Showing the last digest.'**
  String get refreshCoolingDown;

  /// No description provided for @asOf.
  ///
  /// In en, this message translates to:
  /// **'As of {time}'**
  String asOf(String time);

  /// No description provided for @change7d.
  ///
  /// In en, this message translates to:
  /// **'{change} in 7 days'**
  String change7d(String change);

  /// No description provided for @no7dChange.
  ///
  /// In en, this message translates to:
  /// **'No 7-day figure'**
  String get no7dChange;

  /// No description provided for @noValue.
  ///
  /// In en, this message translates to:
  /// **'No figure'**
  String get noValue;

  /// No description provided for @signalNormal.
  ///
  /// In en, this message translates to:
  /// **'Normal'**
  String get signalNormal;

  /// No description provided for @signalWatch.
  ///
  /// In en, this message translates to:
  /// **'Watch'**
  String get signalWatch;

  /// No description provided for @signalStockUp.
  ///
  /// In en, this message translates to:
  /// **'Stock up'**
  String get signalStockUp;

  /// No description provided for @signalUnknown.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get signalUnknown;

  /// No description provided for @signalSemantics.
  ///
  /// In en, this message translates to:
  /// **'Signal: {label}'**
  String signalSemantics(String label);

  /// No description provided for @reasonTitle.
  ///
  /// In en, this message translates to:
  /// **'Why this signal'**
  String get reasonTitle;

  /// No description provided for @reasonNormal.
  ///
  /// In en, this message translates to:
  /// **'Within the usual range. Nothing to do.'**
  String get reasonNormal;

  /// No description provided for @reasonWatch.
  ///
  /// In en, this message translates to:
  /// **'Worth a look. No rush.'**
  String get reasonWatch;

  /// No description provided for @reasonStockUp.
  ///
  /// In en, this message translates to:
  /// **'A short buffer is worth having. A 2 to 4 week supply is enough.'**
  String get reasonStockUp;

  /// No description provided for @reasonUnknown.
  ///
  /// In en, this message translates to:
  /// **'The signal is not recognised. The figure is still shown.'**
  String get reasonUnknown;

  /// No description provided for @sourceLink.
  ///
  /// In en, this message translates to:
  /// **'Source'**
  String get sourceLink;

  /// No description provided for @sourceSemantics.
  ///
  /// In en, this message translates to:
  /// **'Open source for {name}'**
  String sourceSemantics(String name);

  /// Exact disclaimer. Keep this English string in every language.
  ///
  /// In en, this message translates to:
  /// **'Trinetra shares information and signals, not investment advice.'**
  String get disclaimer;

  /// No description provided for @reportTitle.
  ///
  /// In en, this message translates to:
  /// **'30-day report'**
  String get reportTitle;

  /// No description provided for @reportEmpty.
  ///
  /// In en, this message translates to:
  /// **'No 30-day history yet.'**
  String get reportEmpty;

  /// No description provided for @chartTooShort.
  ///
  /// In en, this message translates to:
  /// **'Not enough days for a chart yet.'**
  String get chartTooShort;

  /// No description provided for @chartSemantics.
  ///
  /// In en, this message translates to:
  /// **'{name}. 30-day chart. Latest {value}. Signal {level}.'**
  String chartSemantics(String name, String value, String level);

  /// No description provided for @whatMoved.
  ///
  /// In en, this message translates to:
  /// **'What moved'**
  String get whatMoved;

  /// No description provided for @worthBuffer.
  ///
  /// In en, this message translates to:
  /// **'Worth a 2 to 4 week buffer'**
  String get worthBuffer;

  /// No description provided for @notWorthIt.
  ///
  /// In en, this message translates to:
  /// **'Not worth it'**
  String get notWorthIt;

  /// No description provided for @playbookEmpty.
  ///
  /// In en, this message translates to:
  /// **'The playbook is not available yet.'**
  String get playbookEmpty;

  /// No description provided for @stepSemantics.
  ///
  /// In en, this message translates to:
  /// **'Step {index} of {total}'**
  String stepSemantics(int index, int total);

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @languageEnglish.
  ///
  /// In en, this message translates to:
  /// **'English'**
  String get languageEnglish;

  /// No description provided for @languageMarathi.
  ///
  /// In en, this message translates to:
  /// **'मराठी'**
  String get languageMarathi;

  /// No description provided for @alerts.
  ///
  /// In en, this message translates to:
  /// **'Alerts'**
  String get alerts;

  /// No description provided for @alertMorning.
  ///
  /// In en, this message translates to:
  /// **'Morning digest'**
  String get alertMorning;

  /// No description provided for @alertMorningHint.
  ///
  /// In en, this message translates to:
  /// **'Hides the morning alert while the app is open. One summary is sent around 7:30.'**
  String get alertMorningHint;

  /// No description provided for @alertStockUp.
  ///
  /// In en, this message translates to:
  /// **'New stock-up signal'**
  String get alertStockUp;

  /// No description provided for @alertStockUpHint.
  ///
  /// In en, this message translates to:
  /// **'Hides an extra stock-up alert while the app is open. At most one a day.'**
  String get alertStockUpHint;

  /// No description provided for @alertSystemNote.
  ///
  /// In en, this message translates to:
  /// **'To stop alerts when the app is closed, use iOS Settings.'**
  String get alertSystemNote;

  /// No description provided for @dataHealth.
  ///
  /// In en, this message translates to:
  /// **'Data health'**
  String get dataHealth;

  /// No description provided for @healthOk.
  ///
  /// In en, this message translates to:
  /// **'Sources look fine'**
  String get healthOk;

  /// No description provided for @healthAttention.
  ///
  /// In en, this message translates to:
  /// **'A source needs attention'**
  String get healthAttention;

  /// No description provided for @healthUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Data health is unavailable.'**
  String get healthUnavailable;

  /// No description provided for @sourceFresh.
  ///
  /// In en, this message translates to:
  /// **'Fresh'**
  String get sourceFresh;

  /// No description provided for @sourceStale.
  ///
  /// In en, this message translates to:
  /// **'Stale'**
  String get sourceStale;

  /// No description provided for @lastSuccess.
  ///
  /// In en, this message translates to:
  /// **'Last success {time}'**
  String lastSuccess(String time);

  /// No description provided for @noLastSuccess.
  ///
  /// In en, this message translates to:
  /// **'No successful fetch yet'**
  String get noLastSuccess;

  /// No description provided for @lastError.
  ///
  /// In en, this message translates to:
  /// **'Last error'**
  String get lastError;

  /// No description provided for @about.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get about;

  /// No description provided for @versionLabel.
  ///
  /// In en, this message translates to:
  /// **'Version {version}'**
  String versionLabel(String version);

  /// No description provided for @aboutBody.
  ///
  /// In en, this message translates to:
  /// **'Personal signals for one person in Solapur. Information only.'**
  String get aboutBody;

  /// No description provided for @indicatorPetrol.
  ///
  /// In en, this message translates to:
  /// **'Petrol'**
  String get indicatorPetrol;

  /// No description provided for @indicatorDiesel.
  ///
  /// In en, this message translates to:
  /// **'Diesel'**
  String get indicatorDiesel;

  /// No description provided for @indicatorCrude.
  ///
  /// In en, this message translates to:
  /// **'Crude oil'**
  String get indicatorCrude;

  /// No description provided for @indicatorRupee.
  ///
  /// In en, this message translates to:
  /// **'Rupee'**
  String get indicatorRupee;

  /// No description provided for @indicatorEdibleOil.
  ///
  /// In en, this message translates to:
  /// **'Cooking oil'**
  String get indicatorEdibleOil;

  /// No description provided for @indicatorFood.
  ///
  /// In en, this message translates to:
  /// **'Food prices'**
  String get indicatorFood;

  /// No description provided for @indicatorGold.
  ///
  /// In en, this message translates to:
  /// **'Gold'**
  String get indicatorGold;

  /// No description provided for @indicatorSilver.
  ///
  /// In en, this message translates to:
  /// **'Silver'**
  String get indicatorSilver;

  /// No description provided for @indicatorUjani.
  ///
  /// In en, this message translates to:
  /// **'Ujani dam'**
  String get indicatorUjani;

  /// No description provided for @indicatorReservoirs.
  ///
  /// In en, this message translates to:
  /// **'Reservoirs'**
  String get indicatorReservoirs;

  /// No description provided for @indicatorWater.
  ///
  /// In en, this message translates to:
  /// **'Solapur water'**
  String get indicatorWater;

  /// No description provided for @indicatorBrent.
  ///
  /// In en, this message translates to:
  /// **'Brent crude'**
  String get indicatorBrent;

  /// No description provided for @indicatorIndianBasket.
  ///
  /// In en, this message translates to:
  /// **'Indian basket'**
  String get indicatorIndianBasket;

  /// No description provided for @indicatorPetrolSolapur.
  ///
  /// In en, this message translates to:
  /// **'Petrol, Solapur'**
  String get indicatorPetrolSolapur;

  /// No description provided for @indicatorDieselSolapur.
  ///
  /// In en, this message translates to:
  /// **'Diesel, Solapur'**
  String get indicatorDieselSolapur;

  /// No description provided for @indicatorOnion.
  ///
  /// In en, this message translates to:
  /// **'Onion'**
  String get indicatorOnion;

  /// No description provided for @indicatorTomato.
  ///
  /// In en, this message translates to:
  /// **'Tomato'**
  String get indicatorTomato;

  /// No description provided for @indicatorWheat.
  ///
  /// In en, this message translates to:
  /// **'Wheat'**
  String get indicatorWheat;

  /// No description provided for @indicatorTur.
  ///
  /// In en, this message translates to:
  /// **'Tur dal'**
  String get indicatorTur;

  /// No description provided for @indicatorGoldUsd.
  ///
  /// In en, this message translates to:
  /// **'Gold, USD'**
  String get indicatorGoldUsd;

  /// No description provided for @indicatorSilverUsd.
  ///
  /// In en, this message translates to:
  /// **'Silver, USD'**
  String get indicatorSilverUsd;

  /// No description provided for @sourceMetalsUsd.
  ///
  /// In en, this message translates to:
  /// **'Metals, USD'**
  String get sourceMetalsUsd;

  /// No description provided for @sourceFuelSolapur.
  ///
  /// In en, this message translates to:
  /// **'Solapur fuel'**
  String get sourceFuelSolapur;

  /// No description provided for @sourceNews.
  ///
  /// In en, this message translates to:
  /// **'News'**
  String get sourceNews;

  /// No description provided for @reasonInsufficientHistory.
  ///
  /// In en, this message translates to:
  /// **'Not enough recent days to judge this yet.'**
  String get reasonInsufficientHistory;

  /// No description provided for @reasonWithinThreshold.
  ///
  /// In en, this message translates to:
  /// **'Within the usual range. Nothing to do.'**
  String get reasonWithinThreshold;

  /// No description provided for @reasonCrude5.
  ///
  /// In en, this message translates to:
  /// **'Crude is up more than 5% in 7 days. A retail hike is more likely. Keep the tank reasonably full.'**
  String get reasonCrude5;

  /// No description provided for @reasonCrude10.
  ///
  /// In en, this message translates to:
  /// **'Crude is up more than 10% in 7 days. Transport costs may rise over 1 to 3 weeks. A 2 to 4 week buffer is enough.'**
  String get reasonCrude10;

  /// No description provided for @reasonRetailHike.
  ///
  /// In en, this message translates to:
  /// **'A retail fuel hike showed up. Fill the vehicle tank. Do not store fuel at home.'**
  String get reasonRetailHike;

  /// No description provided for @reasonFuelUnchanged.
  ///
  /// In en, this message translates to:
  /// **'The pump price has not changed.'**
  String get reasonFuelUnchanged;

  /// No description provided for @reasonPetrolChanged.
  ///
  /// In en, this message translates to:
  /// **'The Solapur petrol price changed. Fill the vehicle tank. Do not store fuel at home.'**
  String get reasonPetrolChanged;

  /// No description provided for @reasonDieselChanged.
  ///
  /// In en, this message translates to:
  /// **'The Solapur diesel price changed. Transport costs may follow. Do not store fuel at home.'**
  String get reasonDieselChanged;

  /// No description provided for @reasonInrWeaker.
  ///
  /// In en, this message translates to:
  /// **'The rupee is weaker by more than 2% over 30 days. Imported goods can cost more.'**
  String get reasonInrWeaker;

  /// No description provided for @reasonFaoDutyCut.
  ///
  /// In en, this message translates to:
  /// **'Import duty on cooking oil was cut. No need to stock.'**
  String get reasonFaoDutyCut;

  /// No description provided for @reasonFaoFalling.
  ///
  /// In en, this message translates to:
  /// **'The cooking-oil index is falling. No need to stock.'**
  String get reasonFaoFalling;

  /// No description provided for @reasonFaoUp.
  ///
  /// In en, this message translates to:
  /// **'The cooking-oil index is up more than 3% this month, with no duty cut. A 4 week supply is enough.'**
  String get reasonFaoUp;

  /// No description provided for @reasonUjaniCut.
  ///
  /// In en, this message translates to:
  /// **'A water supply cut was reported. Fill drinking-water containers and check tanker days.'**
  String get reasonUjaniCut;

  /// No description provided for @reasonUjani25.
  ///
  /// In en, this message translates to:
  /// **'Ujani is below 25% of live storage. Fill drinking-water containers and plan for tanker days.'**
  String get reasonUjani25;

  /// No description provided for @reasonUjani40.
  ///
  /// In en, this message translates to:
  /// **'Ujani is below 40% of live storage in October. Store drinking water and check supply days.'**
  String get reasonUjani40;

  /// No description provided for @reasonMetal3.
  ///
  /// In en, this message translates to:
  /// **'The rupee price is up more than 3% in 7 days. No rush. If you need some, spread it over several weeks.'**
  String get reasonMetal3;

  /// No description provided for @reasonReservoirsInfo.
  ///
  /// In en, this message translates to:
  /// **'National reservoir level, for context.'**
  String get reasonReservoirsInfo;

  /// No description provided for @reasonFoodInfo.
  ///
  /// In en, this message translates to:
  /// **'A Solapur food price, for context.'**
  String get reasonFoodInfo;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['en', 'mr'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'en':
      return AppLocalizationsEn();
    case 'mr':
      return AppLocalizationsMr();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
