# Sources

Checked on 12 October 2026. A live number is stored only when the parser matches a format confirmed that day. Everything else fails the fetcher, keeps the last good reading, and is marked stale. `TRINETRA_USE_FIXTURES=1` is a local demo switch and must stay off on Railway.

## Verified and fetched live

| Key | What was confirmed | Source |
| --- | --- | --- |
| `brent_usd` | EIA Open Data API v2, route `petroleum/pri/spt`, series `RBRTE`, fields `period` and `value`. Needs `EIA_API_KEY`. The fixture value 89.75 is the Friday 28 Aug 2026 print on the EIA history page, not a live API call from this session. | https://api.eia.gov/v2/petroleum/pri/spt/data/ and https://www.eia.gov/dnav/pet/hist/rbrted.htm |
| `fao_veg_oil_index` | Official CSV, `Oils` column. Latest row in the file downloaded here: 2026-09, 198.6. The older `default-document-library` path returns 404. | https://www.fao.org/media/docs/worldfoodsituationlibraries/wfs-library/food_price_indices_data.csv?sfvrsn=523ebd2a_84&download=true |
| `gold_inr_10g` | IBJA homepage `lblDate` and `lblFineGold999`. On 12 Oct 2026 the page showed ₹14806 per gram, excluding 3% GST and making charges. The reading is that figure times 10, so 148060 INR/10g. | https://ibja.co/ |
| News headlines | Google News RSS item `title`, `link`, `pubDate`, and `source url`. Personal, non-commercial use only. The feed's own copyright says other use is prohibited. Headlines only, no article bodies. | `https://news.google.com/rss/search` |

## TODO(verify)

| Key | What is blocked |
| --- | --- |
| `indian_basket_usd` | PPAC page https://ppac.gov.in/prices/international-prices-of-crude-oil renders in the browser. No stable data URL was confirmed, so nothing is scraped. |
| `petrol_solapur`, `diesel_solapur` | PPAC retail prices are for Delhi, Mumbai, Chennai and Kolkata, not Solapur. https://ppac.gov.in/retail-selling-price-rsp-of-petrol-diesel-and-domestic-lpg/rsp-of-petrol-and-diesel-in-metro-cities-since-16-6-2017 |
| `usd_inr` | RBI reference-rate archive https://www.rbi.org.in/scripts/ReferenceRateArchive.aspx is a form. The homepage cites FBIL. No public JSON endpoint was confirmed. |
| `silver_inr_kg` | The IBJA homepage rate box has gold only. The 12 Oct 2026 daily PDF is not text-extractable here. |
| `gold_usd_oz`, `silver_usd_oz` | LBMA's prices host returned 403. No other terms-safe USD feed was confirmed. Drivers stay null until this exists. |
| `ujani_pct` | Maharashtra WRD https://wrd.maharashtra.gov.in/ did not match a confirmed Ujani percent line. `ujjaniscada.com` did not resolve. |
| `cwc_national_pct` | The weekly figure is inside a PDF. The bulletin index https://cwc.gov.in/reservoir-level-storage-bulletin does not include the percent. The fixture sentence is from the 7 Oct 2021 bulletin ("which is 82% of total live storage capacity"). |
| `onion_solapur_rs_kg`, `tomato_solapur_rs_kg`, `wheat_solapur_rs_kg`, `tur_solapur_rs_kg` | Department of Consumer Affairs monitors these commodities: https://consumeraffairs.gov.in/pages/price-monitoring-division . The Solapur centre series and the data.gov.in resource id were not confirmed. No signal thresholds were invented for them. They stay `normal` / `food_informational`. |

`cwc_national_pct` also has no threshold in the spec, so a real reading would be `normal` / `cwc_informational`.

Indian basket and FAO are monthly. A 7-day percent is stored only when a reading actually falls in the 7-day window, so a monthly series does not pretend to have a 7-day move.
