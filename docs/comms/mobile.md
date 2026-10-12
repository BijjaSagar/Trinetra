# Mobile comms

- status: done
- owner: mobile
- updated: 2026-10-12

## Screens

Built in `apps/mobile`:

- Splash: logo, name, tagline `Be ready before the storm.`
- Home: headline, one card per indicator, signal chip (colour + word), value, 7-day change, as-of in IST, pull-to-refresh, cached digest, stale banner, footer tagline
- Report: 30-day `fl_chart` lines, reason, source link, exact disclaimer
- Playbook: worth-a-buffer list, not-worth-it list, crisis cards and steps from the API
- Settings: language en/mr, local alert toggles, GET /health, About with version and tagline

The Marathi line `संकटाआधी, तयारी.` is under the tagline on splash, the home footer, and Settings About only when the app language is Marathi.

Features were built in this tree after `lib/core` and the shell, because they share l10n, models, and theme. No separate `mobile-<feature>.md` files.

## Contract

Coded to `docs/api-contract.md` (read before finish, along with `docs/comms/backend.md`). Base URL from `--dart-define=API_BASE_URL` (debug default `http://127.0.0.1:3000`). API key from `--dart-define=API_KEY`, sent as `X-API-Key` on every request. No real key in the repo.

Every request also sends `Accept-Language` for the open language.

## Push

MethodChannel `in.rhtechnology.trinetra/push` in `AppDelegate.swift`. No third-party APNs package: the channel is the path in the brief, and an APNs-only package was not adopted because it was not verified on pub.dev.

- Debug entitlement `aps-environment` = development, Dart environment `sandbox`
- Profile and release entitlement = production, Dart environment `production` (`kDebugMode` is false for both)
- Optional override: `--dart-define=APNS_ENVIRONMENT=sandbox|production`
- Background mode: remote notifications
- Foreground banner: `flutter_local_notifications` 22.3.2. The API payload keys are `digest_date` and `kind` (`digest`, `stock_up`, `stale`). `digest` follows the morning toggle, `stock_up` follows the stock-up toggle, and `stale` always shows. A missing `kind` follows the morning toggle.
- Tap opens Home
- Token is posted to `POST /devices` on launch and again when the language changes

A local `flutter run --profile` uses the production push entitlement, so it needs a production provisioning profile. Debug runs stay on sandbox.

## Cache

`shared_preferences`. The last digest is read synchronously after prefs load in `main`, so Home can paint it on the first frame, then `GET /digest/latest` replaces it. History and playbooks are cached the same way. Empty, error, and stale states are designed.

## Quality

Flutter 3.44.2 (stable) is installed. `flutter analyze`: no issues. `flutter test`: 14 passed.

Covered: signal chip always has a word (English and Marathi), stale banner when `digest.stale` or a signal is stale, tagline exact match, Marathi line hidden in English, disclaimer exact on the report banner.

## Marathi review

No Marathi is hardcoded in Dart or in playbook content. Playbook lists and steps come from `GET /playbooks`. UI chrome is in `lib/core/l10n/app_mr.arb`. Please review every REVIEW line. SAME_AS_EN is intentional (tagline, disclaimer, and the Marathi line itself, which is also the English-file source string and is only shown when the language is Marathi).

- `logoLabel` (REVIEW): त्रिनेत्र लोगो
- `navHome` (REVIEW): मुख्य
- `navReport` (REVIEW): अहवाल
- `navPlaybook` (REVIEW): कृती
- `navSettings` (REVIEW): सेटिंग्ज
- `loading` (REVIEW): लोड होत आहे
- `retry` (REVIEW): पुन्हा प्रयत्न करा
- `pullToRefresh` (REVIEW): रिफ्रेशसाठी खाली ओढा
- `staleBanner` (REVIEW): काही आकडे जुन्या आहेत. शेवटची बरोबर किंमत दाखवली आहे.
- `staleFigure` (REVIEW): जुना आकडा
- `showingSaved` (REVIEW): तपासणी होईपर्यंत जतन केलेला गोषवारा दाखवत आहोत.
- `emptyHeadline` (REVIEW): अजून गोषवारा नाही
- `emptyBody` (REVIEW): आजचे संकेत आणण्यासाठी खाली ओढा.
- `errorTitle` (REVIEW): रिफ्रेश होऊ शकले नाही
- `errorOffline` (REVIEW): जतन केलेले आकडे पडद्यावर आहेत.
- `errorNoData` (REVIEW): अजून काही जतन नाही. कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.
- `errorUnauthorized` (REVIEW): API की स्वीकारली गेली नाही.
- `errorNotConfigured` (REVIEW): या बिल्डसाठी API पत्ता सेट नाही.
- `refreshCoolingDown` (REVIEW): रिफ्रेश थांबला आहे. शेवटचा गोषवारा दाखवत आहोत.
- `asOf` (REVIEW): {time} पर्यंत
- `change7d` (REVIEW): ७ दिवसांत {change}
- `no7dChange` (REVIEW): ७ दिवसांचा आकडा नाही
- `noValue` (REVIEW): आकडा नाही
- `signalNormal` (REVIEW): सामान्य
- `signalWatch` (REVIEW): लक्ष
- `signalStockUp` (REVIEW): साठा करा
- `signalUnknown` (REVIEW): अज्ञात
- `signalSemantics` (REVIEW): संकेत: {label}
- `reasonTitle` (REVIEW): हा संकेत का
- `reasonNormal` (REVIEW): नेहमीच्या मर्यादेत आहे. काही करायची गरज नाही.
- `reasonWatch` (REVIEW): एकदा पाहा. घाई नाही.
- `reasonStockUp` (REVIEW): थोडा साठा ठेवणे योग्य आहे. २ ते ४ आठवडे पुरे.
- `reasonUnknown` (REVIEW): हा संकेत ओळखला गेला नाही. आकडा तरी दाखवला आहे.
- `sourceLink` (REVIEW): स्रोत
- `sourceSemantics` (REVIEW): {name} चा स्रोत उघडा
- `reportTitle` (REVIEW): ३० दिवसांचा अहवाल
- `reportEmpty` (REVIEW): ३० दिवसांची माहिती अजून नाही.
- `chartTooShort` (REVIEW): आलेखासाठी दिवस अपुरे आहेत.
- `chartSemantics` (REVIEW): {name}. ३० दिवसांचा आलेख. शेवटचा आकडा {value}. संकेत {level}.
- `whatMoved` (REVIEW): काय बदलले
- `worthBuffer` (REVIEW): २ ते ४ आठवड्यांचा साठा योग्य
- `notWorthIt` (REVIEW): साठा करू नये
- `playbookEmpty` (REVIEW): कृती सूची अजून उपलब्ध नाही.
- `stepSemantics` (REVIEW): पायरी {index}, एकूण {total}
- `language` (REVIEW): भाषा
- `alerts` (REVIEW): सूचना
- `alertMorning` (REVIEW): सकाळचा गोषवारा
- `alertMorningHint` (REVIEW): अॅप उघडे असताना सकाळची सूचना लपवते. गोषवारा सुमारे ७:३० वाजता येतो.
- `alertStockUp` (REVIEW): नवीन साठा संकेत
- `alertStockUpHint` (REVIEW): अॅप उघडे असताना अतिरिक्त साठा सूचना लपवते. दिवसातून जास्तीत जास्त एक.
- `alertSystemNote` (REVIEW): अॅप बंद असताना सूचना थांबवण्यासाठी iOS सेटिंग्ज वापरा.
- `dataHealth` (REVIEW): डेटा स्थिती
- `healthOk` (REVIEW): स्रोत ठीक आहेत
- `healthAttention` (REVIEW): एका स्रोताकडे लक्ष द्या
- `healthUnavailable` (REVIEW): डेटा स्थिती उपलब्ध नाही.
- `sourceFresh` (REVIEW): ताजे
- `sourceStale` (REVIEW): जुने
- `lastSuccess` (REVIEW): शेवटचे यश {time}
- `noLastSuccess` (REVIEW): अजून यशस्वी माहिती नाही
- `lastError` (REVIEW): शेवटची चूक
- `about` (REVIEW): माहिती
- `versionLabel` (REVIEW): आवृत्ती {version}
- `aboutBody` (REVIEW): सोलापूरमधील एका व्यक्तीसाठी वैयक्तिक संकेत. फक्त माहिती.
- `indicatorPetrol` (REVIEW): पेट्रोल
- `indicatorDiesel` (REVIEW): डिझेल
- `indicatorCrude` (REVIEW): कच्चे तेल
- `indicatorRupee` (REVIEW): रुपया
- `indicatorEdibleOil` (REVIEW): खाद्य तेल
- `indicatorFood` (REVIEW): अन्नभाव
- `indicatorGold` (REVIEW): सोने
- `indicatorSilver` (REVIEW): चांदी
- `indicatorUjani` (REVIEW): उजनी धरण
- `indicatorReservoirs` (REVIEW): जलाशय
- `indicatorWater` (REVIEW): सोलापूर पाणी
- `indicatorBrent` (REVIEW): ब्रेंट क्रूड
- `indicatorIndianBasket` (REVIEW): भारतीय बास्केट
- `indicatorPetrolSolapur` (REVIEW): सोलापूर पेट्रोल
- `indicatorDieselSolapur` (REVIEW): सोलापूर डिझेल
- `indicatorOnion` (REVIEW): कांदा
- `indicatorTomato` (REVIEW): टोमॅटो
- `indicatorWheat` (REVIEW): गहू
- `indicatorTur` (REVIEW): तूर डाळ
- `indicatorGoldUsd` (REVIEW): सोने, डॉलर
- `indicatorSilverUsd` (REVIEW): चांदी, डॉलर
- `sourceMetalsUsd` (REVIEW): धातू, डॉलर
- `sourceFuelSolapur` (REVIEW): सोलापूर इंधन
- `sourceNews` (REVIEW): बातम्या
- `reasonInsufficientHistory` (REVIEW): निर्णयासाठी पुरेसे दिवस नाहीत.
- `reasonWithinThreshold` (REVIEW): नेहमीच्या मर्यादेत आहे. काही करायची गरज नाही.
- `reasonCrude5` (REVIEW): कच्चे तेल ७ दिवसांत ५% पेक्षा जास्त वाढले. किंमत वाढण्याची शक्यता आहे. गाडीची टाकी योग्य ठेवा.
- `reasonCrude10` (REVIEW): कच्चे तेल ७ दिवसांत १०% पेक्षा जास्त वाढले. वाहतूक खर्च १ ते ३ आठवड्यात वाढू शकतो. २ ते ४ आठवड्यांचा साठा पुरे.
- `reasonRetailHike` (REVIEW): इंधनाची किंमत वाढली. गाडीची टाकी भरा. घरी इंधन साठवू नका.
- `reasonFuelUnchanged` (REVIEW): पंपची किंमत बदलली नाही.
- `reasonPetrolChanged` (REVIEW): सोलापूरची पेट्रोल किंमत बदलली. गाडीची टाकी भरा. घरी इंधन साठवू नका.
- `reasonDieselChanged` (REVIEW): सोलापूरची डिझेल किंमत बदलली. वाहतूक खर्च वाढू शकतो. घरी इंधन साठवू नका.
- `reasonInrWeaker` (REVIEW): रुपया ३० दिवसांत २% पेक्षा जास्त कमकुवत झाला. आयात वस्तू महाग होऊ शकतात.
- `reasonFaoDutyCut` (REVIEW): खाद्य तेलावर आयात शुल्क कमी झाले. साठा करण्याची गरज नाही.
- `reasonFaoFalling` (REVIEW): खाद्य तेलाचा निर्देशांक कमी होत आहे. साठा करण्याची गरज नाही.
- `reasonFaoUp` (REVIEW): खाद्य तेलाचा निर्देशांक या महिन्यात ३% पेक्षा जास्त वाढला, आणि शुल्क कमी नाही. ४ आठवड्यांचा साठा पुरे.
- `reasonUjaniCut` (REVIEW): पाणीपुरवठा कमी झाल्याचे कळले. पिण्याच्या पाण्याची भांडी भरा आणि टँकरचे दिवस तपासा.
- `reasonUjani25` (REVIEW): उजनी जिवंत साठ्याच्या २५% खाली आहे. पिण्याच्या पाण्याची भांडी भरा आणि टँकरची योजना करा.
- `reasonUjani40` (REVIEW): ऑक्टोबरमध्ये उजनी ४०% खाली आहे. पिण्याचे पाणी साठवा आणि पुरवठ्याचे दिवस तपासा.
- `reasonMetal3` (REVIEW): रुपयाची किंमत ७ दिवसांत ३% पेक्षा जास्त वाढली. घाई नाही. गरज असल्यास काही आठवड्यांत वाटून घ्या.
- `reasonReservoirsInfo` (REVIEW): राष्ट्रीय जलाशयांची पातळी, फक्त माहितीसाठी.
- `reasonFoodInfo` (REVIEW): सोलापूरचा अन्नभाव, फक्त माहितीसाठी.

Intentionally identical in English and Marathi:

- `appName`: Trinetra
- `tagline`: Be ready before the storm.
- `marathiLine`: संकटाआधी, तयारी.
- `disclaimer`: Trinetra shares information and signals, not investment advice.
- `languageEnglish`: English
- `languageMarathi`: मराठी

## Gaps versus the backend contract

Checked `apps/api/src/app.ts` and `apps/api/src/push/apns.ts` after the backend finished.

- Language is already honored. `GET /digest/latest`, `GET /playbooks`, and `POST /refresh` resolve `?lang=` first, then `Accept-Language`, and pass that language into the payload. The client already sends `Accept-Language` on those calls and `?lang=` on the GETs, so it was left as-is. `GET /signals/history` accepts `lang` and `Accept-Language` but the series has no translated text, so the parsed language is unused. `GET /health` has no language. Neither is a client bug.
- `POST /refresh` still has no required query. The app does not send `lang` on that call. `Accept-Language` is enough, and a language mismatch still reloads `GET /digest/latest?lang=`.
- Push custom keys are `digest_date` and `kind` (`digest`, `stock_up`, `stale`). Foreground banners follow the toggles above. Toggles still do not stop a push delivered while the app is closed. That remains iOS Settings, because `POST /devices` has no alert-preference fields.
- History points may have `level: null`. The chart still draws. A chip is shown from the current signal when one exists.
- Known `reasonCode` values are turned into short sentences on the device, because the contract sends a code, not a sentence. A string in `details.reason` (or `explanation`, `summary`, `note`) wins when the API sends one.
- Indicator names follow the keys in the API domain (`petrol_solapur`, `brent_usd`, `ujani_pct`, and the rest). Unknown keys are shown in a readable form of the key.
- `429` is treated as a cooling-down refresh. The contract describes rate limits but does not list 429 in the error table.
- Profile builds use the production APNs entitlement. Debug stays sandbox.
