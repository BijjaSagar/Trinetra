import type { PlaybookRecord } from "../db/types.js";

export const WORTH_BUFFER = {
  en: [
    "Cooking oil",
    "Pulses",
    "Rice or flour",
    "Salt and sugar",
    "Essential medicines",
    "Drinking water storage",
  ],
  mr: [
    "खाद्यतेल",
    "कडधान्य",
    "तांदूळ किंवा पीठ",
    "मीठ आणि साखर",
    "आवश्यक औषधे",
    "पिण्याच्या पाण्याची साठवण",
  ],
};

export const NOT_WORTH_IT = {
  en: [
    "Bulk buying perishables",
    "Storing petrol at home. It is a fire hazard and there are legal limits. Fill the vehicle tank instead.",
    "Taking more than a 2 to 4 week buffer",
  ],
  mr: [
    "नाशवंत वस्तू मोठ्या प्रमाणात घेणे",
    "घरी पेट्रोल साठवणे. ते आगीचा धोका आहे आणि कायदेशीर मर्यादा आहेत. गाडीची टाकी भरा.",
    "२ ते ४ आठवड्यांपेक्षा जास्त साठा",
  ],
};

/** Marathi strings are a first draft and need human review. */
export const PLAYBOOKS: PlaybookRecord[] = [
  {
    topic: "fuel_hike",
    titleEn: "Fuel hike",
    titleMr: "इंधनाच्या दरात वाढ",
    stepsEn: [
      "Fill the vehicle tank on your normal schedule. Do not store petrol at home.",
      "Keep a 2 to 4 week buffer of pulses, rice or flour, and cooking oil.",
      "Combine trips while prices settle.",
      "Read the source link in the report before changing plans.",
      "Wait for the next morning digest before adding more.",
    ],
    stepsMr: [
      "गाडीची टाकी नेहमीच्या वेळी भरा. घरी पेट्रोल साठवू नका.",
      "कडधान्य, तांदूळ किंवा पीठ, आणि खाद्यतेल यांचा २ ते ४ आठवड्यांचा साठा ठेवा.",
      "प्रवास एकत्र करा.",
      "योजना बदलण्यापूर्वी अहवालातील स्रोत पाहा.",
      "आणखी साठा वाढवण्यापूर्वी दुसऱ्या दिवशीचा अहवाल पाहा.",
    ],
  },
  {
    topic: "food_spike",
    titleEn: "Food price spike",
    titleMr: "अन्नधान्याच्या दरात वाढ",
    stepsEn: [
      "Buy a 2 to 4 week supply of the items that rose, not more.",
      "Skip bulk perishables. They spoil and do not help.",
      "Keep salt, sugar, and pulses in the buffer.",
      "Check the as-of date so you are not reacting to an old number.",
      "When the signal returns to normal, use what you have and pause.",
    ],
    stepsMr: [
      "जे पदार्थ महागले त्यांचा २ ते ४ आठवड्यांचा साठा घ्या, त्यापेक्षा जास्त नाही.",
      "नाशवंत वस्तू मोठ्या प्रमाणात घेऊ नका.",
      "मीठ, साखर आणि कडधान्य साठ्यात ठेवा.",
      "आकडा जुन्या तारखेचा नाही हे तपासा.",
      "संकेत सामान्य झाला की साठा वापरा आणि थांबा.",
    ],
  },
  {
    topic: "water_cut",
    titleEn: "Water cut",
    titleMr: "पाणीकपात",
    stepsEn: [
      "Store drinking water in clean, covered containers.",
      "Note the municipal supply days and plan around them.",
      "Keep a 2 to 4 week buffer of dry food.",
      "Use stored water for drinking first.",
      "Check the Ujani reading again each morning.",
    ],
    stepsMr: [
      "पिण्याचे पाणी स्वच्छ, झाकलेल्या भांड्यात साठवा.",
      "महापालिकेचे पुरवठा दिवस नोंदवा.",
      "सुका माल २ ते ४ आठवडे पुरेल एवढा ठेवा.",
      "साठवलेले पाणी आधी पिण्यासाठी वापरा.",
      "दर सकाळी उजनीचा आकडा पुन्हा पाहा.",
    ],
  },
  {
    topic: "gold_volatility",
    titleEn: "Gold and silver movement",
    titleMr: "सोने आणि चांदीची हालचाल",
    stepsEn: [
      "This is information about what changed. It is not an instruction.",
      "See which driver moved: the global dollar price, the rupee, or duty and GST news.",
      "If a purchase was already planned, spread it over several weeks.",
      "A single day's move is not a reason to change a plan.",
      "Read the report disclaimer before you decide.",
    ],
    stepsMr: [
      "हे काय बदलले याची माहिती आहे. हा आदेश नाही.",
      "कोणता घटक हलला ते पाहा: जागतिक डॉलर दर, रुपया, किंवा शुल्क आणि GST बातम्या.",
      "योजना आधीच केली असेल तर ती अनेक आठवड्यांत टप्प्याटप्प्याने करा.",
      "एका दिवसाच्या चढउतारावर योजना बदलू नका.",
      "निर्णयापूर्वी अहवालातील सूचना वाचा.",
    ],
  },
];
