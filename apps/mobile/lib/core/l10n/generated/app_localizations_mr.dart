// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Marathi (`mr`).
class AppLocalizationsMr extends AppLocalizations {
  AppLocalizationsMr([String locale = 'mr']) : super(locale);

  @override
  String get appName => 'Trinetra';

  @override
  String get tagline => 'Be ready before the storm.';

  @override
  String get marathiLine => 'संकटाआधी, तयारी.';

  @override
  String get logoLabel => 'त्रिनेत्र लोगो';

  @override
  String get navHome => 'मुख्य';

  @override
  String get navReport => 'अहवाल';

  @override
  String get navPlaybook => 'कृती';

  @override
  String get navSettings => 'सेटिंग्ज';

  @override
  String get loading => 'लोड होत आहे';

  @override
  String get retry => 'पुन्हा प्रयत्न करा';

  @override
  String get pullToRefresh => 'रिफ्रेशसाठी खाली ओढा';

  @override
  String get staleBanner =>
      'काही आकडे जुन्या आहेत. शेवटची बरोबर किंमत दाखवली आहे.';

  @override
  String get staleFigure => 'जुना आकडा';

  @override
  String get showingSaved => 'तपासणी होईपर्यंत जतन केलेला गोषवारा दाखवत आहोत.';

  @override
  String get emptyHeadline => 'अजून गोषवारा नाही';

  @override
  String get emptyBody => 'आजचे संकेत आणण्यासाठी खाली ओढा.';

  @override
  String get errorTitle => 'रिफ्रेश होऊ शकले नाही';

  @override
  String get errorOffline => 'जतन केलेले आकडे पडद्यावर आहेत.';

  @override
  String get errorNoData =>
      'अजून काही जतन नाही. कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.';

  @override
  String get errorUnauthorized => 'API की स्वीकारली गेली नाही.';

  @override
  String get errorNotConfigured => 'या बिल्डसाठी API पत्ता सेट नाही.';

  @override
  String get refreshCoolingDown =>
      'रिफ्रेश थांबला आहे. शेवटचा गोषवारा दाखवत आहोत.';

  @override
  String asOf(String time) {
    return '$time पर्यंत';
  }

  @override
  String change7d(String change) {
    return '७ दिवसांत $change';
  }

  @override
  String get no7dChange => '७ दिवसांचा आकडा नाही';

  @override
  String get noValue => 'आकडा नाही';

  @override
  String get signalNormal => 'सामान्य';

  @override
  String get signalWatch => 'लक्ष';

  @override
  String get signalStockUp => 'साठा करा';

  @override
  String get signalUnknown => 'अज्ञात';

  @override
  String signalSemantics(String label) {
    return 'संकेत: $label';
  }

  @override
  String get reasonTitle => 'हा संकेत का';

  @override
  String get reasonNormal => 'नेहमीच्या मर्यादेत आहे. काही करायची गरज नाही.';

  @override
  String get reasonWatch => 'एकदा पाहा. घाई नाही.';

  @override
  String get reasonStockUp => 'थोडा साठा ठेवणे योग्य आहे. २ ते ४ आठवडे पुरे.';

  @override
  String get reasonUnknown => 'हा संकेत ओळखला गेला नाही. आकडा तरी दाखवला आहे.';

  @override
  String get sourceLink => 'स्रोत';

  @override
  String sourceSemantics(String name) {
    return '$name चा स्रोत उघडा';
  }

  @override
  String get disclaimer =>
      'Trinetra shares information and signals, not investment advice.';

  @override
  String get reportTitle => '३० दिवसांचा अहवाल';

  @override
  String get reportEmpty => '३० दिवसांची माहिती अजून नाही.';

  @override
  String get chartTooShort => 'आलेखासाठी दिवस अपुरे आहेत.';

  @override
  String chartSemantics(String name, String value, String level) {
    return '$name. ३० दिवसांचा आलेख. शेवटचा आकडा $value. संकेत $level.';
  }

  @override
  String get whatMoved => 'काय बदलले';

  @override
  String get worthBuffer => '२ ते ४ आठवड्यांचा साठा योग्य';

  @override
  String get notWorthIt => 'साठा करू नये';

  @override
  String get playbookEmpty => 'कृती सूची अजून उपलब्ध नाही.';

  @override
  String stepSemantics(int index, int total) {
    return 'पायरी $index, एकूण $total';
  }

  @override
  String get language => 'भाषा';

  @override
  String get languageEnglish => 'English';

  @override
  String get languageMarathi => 'मराठी';

  @override
  String get alerts => 'सूचना';

  @override
  String get alertMorning => 'सकाळचा गोषवारा';

  @override
  String get alertMorningHint =>
      'अॅप उघडे असताना सकाळची सूचना लपवते. गोषवारा सुमारे ७:३० वाजता येतो.';

  @override
  String get alertStockUp => 'नवीन साठा संकेत';

  @override
  String get alertStockUpHint =>
      'अॅप उघडे असताना अतिरिक्त साठा सूचना लपवते. दिवसातून जास्तीत जास्त एक.';

  @override
  String get alertSystemNote =>
      'अॅप बंद असताना सूचना थांबवण्यासाठी iOS सेटिंग्ज वापरा.';

  @override
  String get dataHealth => 'डेटा स्थिती';

  @override
  String get healthOk => 'स्रोत ठीक आहेत';

  @override
  String get healthAttention => 'एका स्रोताकडे लक्ष द्या';

  @override
  String get healthUnavailable => 'डेटा स्थिती उपलब्ध नाही.';

  @override
  String get sourceFresh => 'ताजे';

  @override
  String get sourceStale => 'जुने';

  @override
  String lastSuccess(String time) {
    return 'शेवटचे यश $time';
  }

  @override
  String get noLastSuccess => 'अजून यशस्वी माहिती नाही';

  @override
  String get lastError => 'शेवटची चूक';

  @override
  String get about => 'माहिती';

  @override
  String versionLabel(String version) {
    return 'आवृत्ती $version';
  }

  @override
  String get aboutBody =>
      'सोलापूरमधील एका व्यक्तीसाठी वैयक्तिक संकेत. फक्त माहिती.';

  @override
  String get indicatorPetrol => 'पेट्रोल';

  @override
  String get indicatorDiesel => 'डिझेल';

  @override
  String get indicatorCrude => 'कच्चे तेल';

  @override
  String get indicatorRupee => 'रुपया';

  @override
  String get indicatorEdibleOil => 'खाद्य तेल';

  @override
  String get indicatorFood => 'अन्नभाव';

  @override
  String get indicatorGold => 'सोने';

  @override
  String get indicatorSilver => 'चांदी';

  @override
  String get indicatorUjani => 'उजनी धरण';

  @override
  String get indicatorReservoirs => 'जलाशय';

  @override
  String get indicatorWater => 'सोलापूर पाणी';

  @override
  String get indicatorBrent => 'ब्रेंट क्रूड';

  @override
  String get indicatorIndianBasket => 'भारतीय बास्केट';

  @override
  String get indicatorPetrolSolapur => 'सोलापूर पेट्रोल';

  @override
  String get indicatorDieselSolapur => 'सोलापूर डिझेल';

  @override
  String get indicatorOnion => 'कांदा';

  @override
  String get indicatorTomato => 'टोमॅटो';

  @override
  String get indicatorWheat => 'गहू';

  @override
  String get indicatorTur => 'तूर डाळ';

  @override
  String get indicatorGoldUsd => 'सोने, डॉलर';

  @override
  String get indicatorSilverUsd => 'चांदी, डॉलर';

  @override
  String get sourceMetalsUsd => 'धातू, डॉलर';

  @override
  String get sourceFuelSolapur => 'सोलापूर इंधन';

  @override
  String get sourceNews => 'बातम्या';

  @override
  String get reasonInsufficientHistory => 'निर्णयासाठी पुरेसे दिवस नाहीत.';

  @override
  String get reasonWithinThreshold =>
      'नेहमीच्या मर्यादेत आहे. काही करायची गरज नाही.';

  @override
  String get reasonCrude5 =>
      'कच्चे तेल ७ दिवसांत ५% पेक्षा जास्त वाढले. किंमत वाढण्याची शक्यता आहे. गाडीची टाकी योग्य ठेवा.';

  @override
  String get reasonCrude10 =>
      'कच्चे तेल ७ दिवसांत १०% पेक्षा जास्त वाढले. वाहतूक खर्च १ ते ३ आठवड्यात वाढू शकतो. २ ते ४ आठवड्यांचा साठा पुरे.';

  @override
  String get reasonRetailHike =>
      'इंधनाची किंमत वाढली. गाडीची टाकी भरा. घरी इंधन साठवू नका.';

  @override
  String get reasonFuelUnchanged => 'पंपची किंमत बदलली नाही.';

  @override
  String get reasonPetrolChanged =>
      'सोलापूरची पेट्रोल किंमत बदलली. गाडीची टाकी भरा. घरी इंधन साठवू नका.';

  @override
  String get reasonDieselChanged =>
      'सोलापूरची डिझेल किंमत बदलली. वाहतूक खर्च वाढू शकतो. घरी इंधन साठवू नका.';

  @override
  String get reasonInrWeaker =>
      'रुपया ३० दिवसांत २% पेक्षा जास्त कमकुवत झाला. आयात वस्तू महाग होऊ शकतात.';

  @override
  String get reasonFaoDutyCut =>
      'खाद्य तेलावर आयात शुल्क कमी झाले. साठा करण्याची गरज नाही.';

  @override
  String get reasonFaoFalling =>
      'खाद्य तेलाचा निर्देशांक कमी होत आहे. साठा करण्याची गरज नाही.';

  @override
  String get reasonFaoUp =>
      'खाद्य तेलाचा निर्देशांक या महिन्यात ३% पेक्षा जास्त वाढला, आणि शुल्क कमी नाही. ४ आठवड्यांचा साठा पुरे.';

  @override
  String get reasonUjaniCut =>
      'पाणीपुरवठा कमी झाल्याचे कळले. पिण्याच्या पाण्याची भांडी भरा आणि टँकरचे दिवस तपासा.';

  @override
  String get reasonUjani25 =>
      'उजनी जिवंत साठ्याच्या २५% खाली आहे. पिण्याच्या पाण्याची भांडी भरा आणि टँकरची योजना करा.';

  @override
  String get reasonUjani40 =>
      'ऑक्टोबरमध्ये उजनी ४०% खाली आहे. पिण्याचे पाणी साठवा आणि पुरवठ्याचे दिवस तपासा.';

  @override
  String get reasonMetal3 =>
      'रुपयाची किंमत ७ दिवसांत ३% पेक्षा जास्त वाढली. घाई नाही. गरज असल्यास काही आठवड्यांत वाटून घ्या.';

  @override
  String get reasonReservoirsInfo =>
      'राष्ट्रीय जलाशयांची पातळी, फक्त माहितीसाठी.';

  @override
  String get reasonFoodInfo => 'सोलापूरचा अन्नभाव, फक्त माहितीसाठी.';
}
