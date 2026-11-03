/* Axom Historical Atlas — অসম বুৰঞ্জী মানচিত্ৰ
   Interactive cartography of Assam's kingdoms, frontiers, capitals, and spots through time (350–1826 CE).
   Offline-first, vanilla ES6+, vector graphics via polygonClipping. */

(() => {
'use strict';

const S = window.SITE || {}, $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const url = p => p.split('/').map(encodeURIComponent).join('/');

const eraById = Object.fromEntries((S.eras || []).map(e => [e.id, e]));
const charById = Object.fromEntries((S.characters || []).map(c => [c.id, c]));
const sceneById = Object.fromEntries((S.scenes || []).map(s => [s.id, s]));
const realms = S.realms || [], places = S.places || [], placeById = Object.fromEntries(places.map(p => [p.id, p]));
const chars = [...(S.characters || [])].sort((a, b) => a.sort_year - b.sort_year);

for (const c of chars) { c.sheets = c.sheets || []; c.scenes = []; c.mainScenes = []; }
for (const s of S.scenes || []) for (const id of s.chars) { const c = charById[id]; if (c) { c.scenes.push(s.id); if (s.main.includes(id)) c.mainScenes.push(s.id); } }

const lvl = c => (c.av ? c.av[0] : 0);
const withSheets = c => lvl(c) >= 2;
const srcOf = idx => (idx || []).map(i => S.src[i]);

/* Dynastic styling palettes */
const HOUSES = [
  ['varman', 'Varman dynasty', ['Barman dynasty']],
  ['salastambha', 'Mlechchha (Salastambha) dynasty', ['Salastambha dynasty']],
  ['pala', 'Pala dynasty of Kamarupa', ['Pala dynasty', 'Kamarupa after the Palas']],
  ['kamata', 'Kamata & Khen kingdoms', ['Kamata and Khen kingdoms']],
  ['bhuyan', 'Baro-Bhuyans', ['Baro-Bhuyans']],
  ['koch', 'Koch Dynasty', ['Koch kingdom (undivided)', 'Koch Hajo kings']],
  ['ahom', 'Tai-Ahom Dynasty', ['Ahom kings', 'Ahom queens and royal family', 'Ahom officers and generals', 'Moamoria rebels']],
  ['chutia', 'Chutia Kingdom', ['Chutia kingdom']],
  ['dimasa', 'Dimasa (Kachari) Kingdom', ['Dimasa (Kachari) kingdom']],
  ['jaintia', 'Jaintia Kingdom', ['Jaintia and Manipur']],
  ['foreign', 'Outside powers (Mughal, Bengal, British)', ['Pala Empire of Bengal', 'Bengal and Delhi rulers', 'Mughal and Bengal commanders', 'Burmese and British figures', 'Contemporaries and visitors']]
];
const houseOfGroup = Object.fromEntries(HOUSES.flatMap(([k, , gs]) => gs.map(g => [g, k])));
const house = c => houseOfGroup[c.group || c.dynasty] || '';
const hc = k => k ? `hh h-${k}` : '';

/* Color mapping for polities */
const POLITY_COLORS = {
  'kamarupa': '#2563eb',
  'kamarupa-varman': '#2563eb',
  'kamarupa-salastambha': '#d97706',
  'kamarupa-pala': '#dc2626',
  'kamata': '#7c3aed',
  'khen-kamata': '#9333ea',
  'bengal-sultanate': '#b45309',
  'koch-kingdom': '#0d9488',
  'koch-hajo': '#0891b2',
  'koch-bihar': '#0284c7',
  'mughal-kamrup': '#4f46e5',
  'ahom-kingdom': '#e11d48',
  'chutia-kingdom': '#059669',
  'dimasa-kingdom': '#d97706',
  'jaintia-kingdom': '#8b5cf6'
};
const realmColor = r => POLITY_COLORS[r.id] || POLITY_COLORS[r.polity] || '#64748b';

/* Four Pīṭhas traditional provinces of Kāmarūpa */
const PITHA_COLORS = {
  ratna: '#0d9488',
  kama: '#c026d3',
  suvarna: '#ca8a04',
  saumara: '#4f46e5'
};
const PITHA_INFO = {
  ratna: {
    name: 'Ratnapīṭha',
    name_as: 'ৰত্নপীঠ',
    span: 'Karatoyā → Sankosh River',
    span_as: 'করতোয়া নদীৰ পৰা সোণকোষ নদীলৈ',
    zone: 'Western Gateway (North Bengal & Western Goalpara)',
    zone_as: 'পশ্চিম প্ৰান্ত (উত্তৰ বংগ, কোচবিহাৰ আৰু গোৱালপাৰা)',
    desc: 'The westernmost province of ancient Kāmarūpa, stretching from the sacred Karatoyā River to the Sankosh River. It guarded the realm’s frontiers against Aryavarta and Magadha, encompassing rich alluvial trade corridors and the ancient shrines of Jalpesh and Kamateswari.',
    desc_as: 'প্ৰাচীন কামৰূপৰ পশ্চিমতম প্ৰদেশ, পৱিত্ৰ করতোয়া নদীৰ পৰা সোণকোষ নদীলৈ বিস্তৃত। এই অঞ্চলে উত্তৰ ভাৰত আৰু মগধৰ সৈতে যোগাযোগ ৰক্ষা কৰিছিল।',
    center: [26.2, 89.2],
    sites: ['kamata', 'karatoya', 'kamatapur', 'cooch-behar', 'rangpur-bangladesh']
  },
  kama: {
    name: 'Kāmapīṭha',
    name_as: 'কামপীঠ',
    span: 'Sankosh → Rupahi (Bornadi) River',
    span_as: 'সোণকোষ নদীৰ পৰা ৰূপহী (বৰনদী)লৈ',
    zone: 'Imperial Heartland (Prāgjyotiṣpura & Nilachal)',
    zone_as: 'সাম্ৰাজ্যৰ হৃদয়ভূমি (প্ৰাগজ্যোতিষপুৰ আৰু নীলাচল)',
    desc: 'The central heartland and spiritual core of Kāmarūpa between the Sankosh and Bornadi rivers. Anchored by the royal citadel of Prāgjyotiṣpura and the tantric mother-shrine atop Nilachal Hill (Kāmākhyā), it served as the royal seat of Naraka, Bhagadatta, and the Varman dynasty.',
    desc_as: 'কামৰূপৰ কেন্দ্ৰীয় হৃদয়ভূমি আৰু ধৰ্মীয় প্ৰাণকেন্দ্ৰ। প্ৰাগজ্যোতিষপুৰ ৰাজধানী আৰু নীলাচলৰ কামাখ্যা ধাম ইয়াতেই অৱস্থিত। বৰ্মা বংশৰ ৰজাসকলৰ প্ৰধান শাসনকেন্দ্ৰ।',
    center: [26.18, 91.2],
    sites: ['pragjyotishpura', 'guwahati', 'nilachal', 'umachal', 'hajo', 'kamarupanagara']
  },
  suvarna: {
    name: 'Suvarṇapīṭha',
    name_as: 'স্বৰ্ণপীঠ',
    span: 'Rupahi (Bornadi) → Bharali River',
    span_as: 'ৰূপহী (বৰনদী)ৰ পৰা ভৰলী নদীলৈ',
    zone: 'Central Province (Darrang & Sonitpur / Haruppeśwara)',
    zone_as: 'মধ্য খণ্ড (দৰং আৰু শোণিতপুৰ / হৰুপ্পেশ্বৰ)',
    desc: 'The golden central province spanning between the Bornadi and Bharali rivers. Famed for alluvial gold deposits along the river sandbars, it hosted the imperial capital Haruppeśwara (Tezpur) during the Śālastambha dynasty, the naval base of Harjjaravarman, and the Mahabhairav temple.',
    desc_as: 'বৰনদীৰ পৰা ভৰলী নদীলৈ বিস্তৃত সোণালী শস্য-শ্যামলা মধ্যভূমি। শালস্তম্ভ বংশৰ ৰাজধানী হৰুপ্পেশ্বৰ (তেজপুৰ), নৌ-ঘাটি আৰু প্ৰাচীন মহাভৈৰৱ মন্দিৰ ইয়াতে অৱস্থিত আছিল।',
    center: [26.55, 92.4],
    sites: ['haruppeswara', 'durjaya', 'tezpur', 'parbatiya', 'biswanath', 'samdhara']
  },
  saumara: {
    name: 'Saumārapīṭha',
    name_as: 'সৌমাৰপীঠ',
    span: 'Bharali → Dikkaravasini (Dikrang / Sadiya)',
    span_as: 'ভৰলী নদীৰ পৰা দিক্কৰবাসিনী (দিক্ৰং/শদিয়া)লৈ',
    zone: 'Eastern Frontier (Upper Assam & Brahmakunda)',
    zone_as: 'পূব সীমান্ত (উজনি অসম, শদিয়া আৰু ব্ৰহ্মকুণ্ড)',
    desc: 'The easternmost province of Kāmarūpa extending from the Bharali River to the shrine of Dikkaravasini (Tamreswari Temple) and the foothills of Sadiya. Traditionally regarded as the sacred frontier sanctified by Paraśurāma, it later nurtured the medieval Chutia and Ahom realms.',
    desc_as: 'ভৰলী নদীৰ পৰা দিক্কৰবাসিনী (তাম্ৰেশ্বৰী মন্দিৰ) আৰু শদিয়ালৈকে বিস্তৃত প্ৰাচীন কামৰূপৰ পূব সীমান্ত। পৰশুৰাম কুণ্ডৰ দ্বাৰা পৱিত্ৰ এই ভূখণ্ড পিছলৈ চুতীয়া আৰু আহোম ৰাজ্যৰ উত্থানস্থল হৈ পৰে।',
    center: [27.05, 94.6],
    sites: ['dikkaravasini', 'sadiya', 'majuli', 'habung', 'charaideo']
  }
};

/* Chronological Geopolitical Milestones */
const MILESTONES = [
  {
    year: 350,
    label: '350 CE',
    title: 'Pushyavarman Founds Kāmarūpa',
    title_as: 'পুষ্যবৰ্মাই কামৰূপ ৰাজ্য প্ৰতিষ্ঠা কৰে',
    dynasty: 'Varman Dynasty (বৰ্মা বংশ)',
    capital: 'pragjyotishpura',
    headline: 'Pushyavarman establishes the Varman dynasty at Prāgjyotiṣpura; Kāmarūpa emerges as a sovereign power on Samudragupta’s Allahabad pillar inscription.',
    headline_as: 'পুষ্যবৰ্মাই প্ৰাগজ্যোতিষপুৰত বৰ্মা বংশ প্ৰতিষ্ঠা কৰে; সমুদ্ৰগুপ্তৰ এলাহাবাদ প্ৰশস্তিত কামৰূপ এখন সাৰ্বভৌম সীমান্ত ৰাজ্য হিচাপে উল্লেখিত।'
  },
  {
    year: 518,
    label: '518 CE',
    title: 'Bhutivarman & Davaka Unification',
    title_as: 'ভূতিবৰ্মা আৰু ডবকাৰ একত্ৰীকৰণ',
    dynasty: 'Varman Dynasty (বৰ্মা বংশ)',
    capital: 'pragjyotishpura',
    headline: 'Bhutivarman performs Ashvamedha sacrifices; Badaganga rock epigraph records expansion into Kapili Valley and land grants in Pundravardhana (North Bengal).',
    headline_as: 'ভূতিবৰ্মাই অশ্বমেধ যজ্ঞ কৰে; বডগংগা শিলালিপিয়ে কপিলা উপত্যকা আৰু উত্তৰ বংগৰ পুন্দ্ৰবৰ্ধনলৈকে ৰাজ্য সম্প্ৰসাৰণৰ সাক্ষ্য দিয়ে।'
  },
  {
    year: 643,
    label: '643 CE',
    title: 'Bhaskaravarman & Xuanzang’s Visit',
    title_as: 'ভাস্কৰবৰ্মা আৰু হিউৱেন চাঙৰ আগমন',
    dynasty: 'Varman Dynasty (বৰ্মা বংশ)',
    capital: 'pragjyotishpura',
    headline: 'Bhaskaravarman rules an empire stretching from the Karatoyā River to eastern frontiers; hosts Chinese master Xuanzang and attends Harsha’s grand Kanauj assemblies.',
    headline_as: 'ভাস্কৰবৰ্মাৰ সাম্ৰাজ্য করতোয়া নদীৰ পৰা পূব সীমান্তলৈ বিয়পে; চীনা পৰিব্ৰাজক হিউৱেন চাঙক আতিথ্য প্ৰদান আৰু হৰ্ষবৰ্ধনৰ কনৌজ সভাত অংশগ্ৰহণ।'
  },
  {
    year: 830,
    label: '830 CE',
    title: 'Harjjaravarman at Haruppeśwara',
    title_as: 'হৰ্জৰবৰ্মা আৰু হৰুপ্পেশ্বৰ ৰাজধানী',
    dynasty: 'Mlechchha / Śālastambha (শালস্তম্ভ বংশ)',
    capital: 'haruppeswara',
    headline: 'Capital shifts to Haruppeśwara (Tezpur) on the Brahmaputra; Harjjaravarman issues the 829/830 CE Tezpur rock inscription regulating royal naval transport.',
    headline_as: 'ব্ৰহ্মপুত্ৰৰ পাৰৰ হৰুপ্পেশ্বৰলৈ (তেজপুৰ) ৰাজধানী স্থানান্তৰ; ৮২৯/৮৩০ খ্ৰীষ্টাব্দৰ তেজপুৰ শিলালিপিৰ জৰিয়তে ৰাজকীয় নৌ-চলাচল নিয়ন্ত্ৰণ।'
  },
  {
    year: 1000,
    label: '1000 CE',
    title: 'Ratnapala & Fortified Durjayā',
    title_as: 'ৰত্নপাল আৰু দুৰ্জয়া দুৰ্গ-নগৰ',
    dynasty: 'Pāla Dynasty of Kāmarūpa (পাল বংশ)',
    capital: 'durjaya',
    headline: 'Ratnapala fortifies the impregnable river capital of Durjayā on the Brahmaputra; Bargaon copper plates celebrate thriving guilds, ramparts, and Vedic scholarship.',
    headline_as: 'ৰত্নপালে ব্ৰহ্মপুত্ৰৰ পাৰত দুৰ্জয় দুৰ্গ-নগৰী গঢ়ি তোলে; বৰগাঁও তাম্ৰশাসনে উন্নত নদী বাণিজ্য আৰু জ্ঞানচৰ্চাৰ বৰ্ণনা দিয়ে।'
  },
  {
    year: 1187,
    label: '1187 CE',
    title: 'Rise of Chutia & Regional Kingdoms',
    title_as: 'চুতীয়া আৰু আঞ্চলিক ৰাজ্যসমূহৰ উত্থান',
    dynasty: 'Chutia, Kamata & Dimasa',
    capital: 'sadiya',
    headline: 'With the decline of centralized Kāmarūpa, Birpal establishes the Chutia kingdom at Sadiya, while Dimasas flourish along Dhansiri and Kamata consolidates the west.',
    headline_as: 'কেন্দ্ৰীয় কামৰূপৰ অৱনতিৰ পিছত সদিয়াত চুতীয়া ৰাজ্যৰ উত্থান; ধানশিৰি উপত্যকাত ডিমাচা আৰু নামনিত কমতা ৰাজ্যৰ বিকাশ।'
  },
  {
    year: 1228,
    label: '1228 CE',
    title: 'Sukaphaa Founds Tai-Ahom Realm',
    title_as: 'চাওলুং চুকাফাৰ চৰাইদেউত আগমন',
    dynasty: 'Tai-Ahom Dynasty (আহোম ৰাজ্য)',
    capital: 'charaideo',
    headline: 'Chao Lung Sukaphaa crosses the Patkai range into Upper Assam; allies with Moran and Barahi leaders and founds the permanent Tai-Ahom seat at Charaideo.',
    headline_as: 'চাওলুং চুকাফাই পাটকাই পাহাৰ পাৰ হৈ উজনি অসমত প্ৰৱেশ কৰে; মৰাণ আৰু বৰাহীসকলৰ সৈতে মিত্ৰতাৰে চৰাইদেউত আহোম ৰাজ্যৰ ভেটি স্থাপন কৰে।'
  },
  {
    year: 1257,
    label: '1257 CE',
    title: 'Sandhya Founds Kamatapur',
    title_as: 'সন্ধ্যা ৰজাই কমতাপুৰ প্ৰতিষ্ঠা কৰে',
    dynasty: 'Kamata Kingdom (কমতা ৰাজ্য)',
    capital: 'kamatapur',
    headline: 'King Sandhya routs the Bengal Sultanate invasion under Malik Ikhtiyaruddin Yuzbak; transfers the western capital to Kamatapur and assumes the title Kamateshwar.',
    headline_as: 'সন্ধ্যা ৰজাই মালিক ইখতিয়াৰুদ্দিন য়ুজবকৰ আক্ৰমণ প্ৰতিহত কৰে; পশ্চিমৰ ৰাজধানী কমতাপুৰলৈ স্থানান্তৰ কৰি কমতেশ্বৰ উপাধি লয়।'
  },
  {
    year: 1515,
    label: '1515 CE',
    title: 'Viswa Singha Unites the Koch Realm',
    title_as: 'বিশ্বসিংহই কোচ ৰাজ্য একত্ৰিত কৰে',
    dynasty: 'Koch Dynasty (কোচ ৰাজ্য)',
    capital: 'cooch-behar',
    headline: 'Viswa Singha unites the Twelve Bhuyans and tribal chieftains between Karatoya and Barnadi; establishes the Koch dynasty with its capital at Chikna and Cooch Behar.',
    headline_as: 'বিশ্বসিংহই করতোয়া আৰু বৰনদীৰ মাজৰ বাৰভূঞা আৰু জনজাতীয় দলপতিসকলক একত্ৰিত কৰি চিকণা আৰু কোচবিহাৰত কোচ ৰাজবংশ প্ৰতিষ্ঠা কৰে।'
  },
  {
    year: 1523,
    label: '1523 CE',
    title: 'Annexation of Chutia Kingdom',
    title_as: 'আহোমৰ দ্বাৰা চুতীয়া ৰাজ্য অন্তৰ্ভুক্তি',
    dynasty: 'Ahom Empire (Suhungmung)',
    capital: 'sadiya',
    headline: 'Suhungmung (Dihingia Raja) defeats Dhirnarayan and annexes Sadiya; creates the office of Sadiya-Khowa Gohain to administer the northeastern frontier.',
    headline_as: 'স্বৰ্গদেউ চুহুংমুঙে সদিয়া দখল কৰি চুতীয়া ৰাজ্য আহোম সাম্ৰাজ্যৰ অন্তৰ্ভুক্ত কৰে; উত্তৰ-পূব সীমান্ত শাসনৰ বাবে সদিয়াখোৱা গোহাঁই পদ সৃষ্টি কৰে।'
  },
  {
    year: 1532,
    label: '1532 CE',
    title: 'Rout of Turbak & Advance to Karatoya',
    title_as: 'তুৰ্বকৰ পৰাজয় আৰু করতোয়ালৈ আহোমৰ অগ্ৰযাত্ৰা',
    dynasty: 'Ahom Empire (Suhungmung)',
    capital: 'bakata',
    headline: 'Ahom general Tonkham Borpatrogohain decisively smashes the Bengal Sultanate invasion under Turbak at Duimunisila; pursuit extends to the historic Karatoyā River.',
    headline_as: 'টংকাম বৰপাত্ৰগোহাঁয়ে দুইমুনিশিলাৰ নৌ-যুদ্ধত তুৰ্বকক নিধন কৰি বংগৰ সৈন্যক পৰাস্ত কৰে; ঐতিহাসিক করতোয়া নদীলৈকে সীমা বিস্তাৰ কৰে।'
  },
  {
    year: 1563,
    label: '1563 CE',
    title: 'Nara Narayan, Chilarai & Treaty of Majuli',
    title_as: 'নৰনাৰায়ণ, চিলাৰায় আৰু মাজুলীৰ সন্ধি',
    dynasty: 'Koch & Ahom Realms',
    capital: 'cooch-behar',
    headline: 'General Chilarai leads a sweeping expedition across Upper Assam, Cachar, Jaintia, and Sylhet; Treaty of Majuli demarcates territories with the Ahoms.',
    headline_as: 'মহাবীৰ চিলাৰায়ে উজনি অসম, কছাৰ, জয়ন্তীয়া আৰু শ্ৰীহট্টলৈকে দিগ্বিজয় কৰে; মাজুলীৰ সন্ধিৰ জৰিয়তে আহোমৰ সৈতে সীমা নিৰ্ধাৰণ কৰা হয়।'
  },
  {
    year: 1581,
    label: '1581 CE',
    title: 'Partition into Koch Bihar & Koch Hajo',
    title_as: 'কোচবিহাৰ আৰু কোচ হাজো বিভাজন',
    dynasty: 'Koch Bihar & Koch Hajo',
    capital: 'cooch-behar',
    headline: 'The Koch realm splits along the Sankosh River: Lakshmi Narayan rules Koch Bihar in the west, while Raghudev Narayan establishes Koch Hajo in the east.',
    headline_as: 'সোণকোষ নদীক সীমা কৰি কোচ ৰাজ্য দুভাগ হয়: পশ্চিমে লক্ষ্মীনাৰায়ণৰ কোচবিহাৰ আৰু পূবে ৰঘুদেৱ নাৰায়ণৰ কোচ হাজো।'
  },
  {
    year: 1639,
    label: '1639 CE',
    title: 'Treaty of Asurar Ali',
    title_as: 'অসুৰৰ আলিৰ ঐতিহাসিক সন্ধি',
    dynasty: 'Ahom & Mughal Frontiers',
    capital: 'garhgaon',
    headline: 'Momai Tamuli Borbarua and Allah Yar Khan conclude the Treaty of Asurar Ali; border fixed along Barnadi on north bank and Asuror Ali on south bank.',
    headline_as: 'মোমাই তামুলী বৰবৰুৱা আৰু আল্লা ইয়াৰ খাঁৰ মাজত অসুৰৰ আলিৰ সন্ধি স্বাক্ষৰিত; উত্তৰ পাৰে বৰনদী আৰু দক্ষিণ পাৰে অসুৰৰ আলিত সীমা স্থিৰ হয়।'
  },
  {
    year: 1671,
    label: '1671 CE',
    title: 'Battle of Saraighat',
    title_as: 'শৰাইঘাটৰ মহা নৌ-যুদ্ধ',
    dynasty: 'Ahom Empire (Lachit Borphukan)',
    capital: 'garhgaon',
    headline: 'Lachit Borphukan commands the Ahom naval fleet in a decisive victory over Raja Ram Singh’s Mughal imperial armada at Saraighat on the Brahmaputra; Guwahati secured.',
    headline_as: 'লাচিত বৰফুকনে ব্ৰহ্মপুত্ৰৰ বুকুত শৰাইঘাটৰ নৌ-যুদ্ধত মোগল সেনাপতি ৰাম সিংহৰ বিশাল সৈন্যবাহিনীক সম্পূৰ্ণৰূপে পৰাস্ত কৰি গুৱাহাটী মুক্ত কৰে।'
  },
  {
    year: 1682,
    label: '1682 CE',
    title: 'Battle of Itakhuli & Manas Frontier',
    title_as: 'ইটাখুলীৰ যুদ্ধ আৰু মানাহৰ স্থায়ী সীমা',
    dynasty: 'Ahom Empire (Gadadhar Singha)',
    capital: 'rangpur-ahom',
    headline: 'Gadadhar Singha’s forces crush the Mughal garrison at Itakhuli; Mughals expelled permanently beyond the Manas River, securing Assam’s western boundary until 1826.',
    headline_as: 'গদাধৰ সিংহৰ সেনাই ইটাখুলীৰ দুৰ্গত মোগলক চূড়ান্তভাৱে পৰাস্ত কৰে; মানাহ নদী স্থায়ী পশ্চিম সীমান্ত হিচাপে ১৮২৬ চনলৈকে অক্ষুণ্ণ থাকে।'
  },
  {
    year: 1826,
    label: '1826 CE',
    title: 'Treaty of Yandabo & Colonial Transition',
    title_as: 'ইয়াণ্ডাবু সন্ধি আৰু ঔপনিৱেশিক যুগ',
    dynasty: 'End of Ahom Sovereignty',
    capital: 'jorhat',
    headline: 'Following devastating Burmese invasions (Maanor Din) and the First Anglo-Burmese War, the Treaty of Yandabo cedes Assam to the British East India Company.',
    headline_as: 'মানৰ আক্ৰমণ আৰু প্ৰথম ইংগ-বাৰ্মী যুদ্ধৰ অন্তত ইয়াণ্ডাবু সন্ধিৰ জৰিয়তে অসম ব্ৰিটিছ ইষ্ট ইণ্ডিয়া কোম্পানীৰ অধীনলৈ যায়।'
  }
];

function getTimelineNarrative(y) {
  let best = MILESTONES[0];
  for (const m of MILESTONES) {
    if (m.year <= y) best = m;
    else break;
  }
  return best;
}

/* Bilingual text strings */
const STR = {
  en: {
    brand: 'Axom Historical Atlas',
    brandSub: 'অসম বুৰঞ্জী মানচিত্ৰ · 350–1826 CE',
    atlas: 'Historical Atlas',
    places: 'Historical Places',
    kings: 'Kings & Rulers',
    timeline: 'Timeline',
    about: 'About & Sources',
    searchPh: 'Search places, capitals, kingdoms, kings...',
    historicalOnly: 'Historical Only',
    modernOverlay: 'Modern Districts',
    hidePresentDay: 'Hide Present-Day Borders',
    showPresentDay: 'Show Modern District Overlay',
    kamarupaProvinces: 'Four Pīṭhas of Kāmarūpa',
    flyToProvince: '📍 Fly to Province on Map',
    provinceShrines: 'Sacred Shrines & Key Sites in this Pīṭha',
    layerRealms: 'Kingdoms',
    layerCapitals: 'Capitals',
    layerForts: 'Forts & Battles',
    layerSacred: 'Temples & Satras',
    layerRivers: 'Rivers',
    layerPithas: 'Four Pīṭhas',
    layerInscriptions: 'Inscriptions',
    dossier: 'Dossier',
    realmsTab: 'Realms & Frontiers',
    placesTab: 'Historical Places',
    inscrTab: 'Epigraphy',
    play: 'Play',
    pause: 'Pause',
    focusCapital: '📍 Focus Capital on Map',
    flyToPlace: '📍 Fly to Place',
    frontiers: 'Recorded Frontiers',
    westLimit: 'Western Limit',
    eastLimit: 'Eastern Limit',
    northLimit: 'Northern Limit',
    southLimit: 'Southern Limit',
    noLimitNamed: 'natural/historical frontier',
    pithasToggle: 'Show Four Pīṭhas of Kāmarūpa',
    pithaNote: 'The 4 traditional river-bounded provinces of ancient Kāmarūpa (Ratnapīṭha, Kāmapīṭha, Suvarṇapīṭha, Saumārapīṭha):',
    selectYearHint: 'Drag the timeline slider or click milestone chips to explore across time.',
    activeRuler: 'Active Reign',
    seatOfPower: 'Royal Seat of Power',
    centuryPlaces: 'Prominent Sites of this Century',
    inscriptionsLayerNote: 'Showing archaeological inscription findspots as secondary epigraphic references.',
    allPlaces: 'All Kinds',
    clickToFocus: 'Click to focus in dossier',
    close: 'Close',
    sources: 'Sources'
  },
  as: {
    brand: 'অসম বুৰঞ্জী মানচিত্ৰ',
    brandSub: 'ঐতিহাসিক ৰাজ্য আৰু সীমান্ত · ৩৫০–১৮২৬ খ্ৰী:',
    atlas: 'মানচিত্ৰ',
    places: 'ঐতিহাসিক ঠাই',
    kings: 'ৰজাসকল',
    timeline: 'সময়ৰেখা',
    about: 'আমাৰ বিষয়ে',
    searchPh: 'ঠাই, ৰাজধানী, ৰাজ্য বা ৰজা বিচাৰক...',
    historicalOnly: 'কেৱল ইতিহাস',
    modernOverlay: 'বৰ্তমানৰ জিলাসমূহ',
    hidePresentDay: 'বৰ্তমানৰ জিলা-সীমা লুকুৱাওক',
    showPresentDay: 'বৰ্তমানৰ জিলাৰ সীমা দেখুৱাওক',
    kamarupaProvinces: 'কামৰূপৰ চাৰি পীঠ',
    flyToProvince: '📍 মানচিত্ৰত পীঠ চাওক',
    provinceShrines: 'এই পীঠৰ প্ৰধান তীৰ্থ আৰু ঐতিহাসিক স্থানসমূহ',
    layerRealms: 'ৰাজ্যসমূহ',
    layerCapitals: 'ৰাজধানী',
    layerForts: 'দুৰ্গ আৰু ৰণক্ষেত্ৰ',
    layerSacred: 'মন্দিৰ আৰু সত্ৰ',
    layerRivers: 'নৈ-উপনৈ',
    layerPithas: 'চাৰি পীঠ',
    layerInscriptions: 'লিপিসমূহ',
    dossier: 'বিৱৰণ',
    realmsTab: 'ৰাজ্য আৰু সীমান্ত',
    placesTab: 'ঐতিহাসিক ঠাই',
    inscrTab: 'প্ৰাচীন লিপি',
    play: 'চলাওক',
    pause: 'ৰখাওক',
    focusCapital: '📍 মানচিত্ৰত ৰাজধানী চাওক',
    flyToPlace: '📍 মানচিত্ৰত স্থান চাওক',
    frontiers: 'নথিভুক্ত সীমান্ত',
    westLimit: 'পশ্চিম সীমা',
    eastLimit: 'পূব সীমা',
    northLimit: 'উত্তৰ সীমা',
    southLimit: 'দক্ষিণ সীমা',
    noLimitNamed: 'প্ৰাকৃতিক বা ঐতিহাসিক সীমা',
    pithasToggle: 'কামৰূপৰ চাৰি পীঠ দেখুৱাওক',
    pithaNote: 'কামৰূপৰ চাৰিটা ঐতিহাসিক নদী-সীমিত প্ৰশাসনিক ভাগ (ৰত্নপীঠ, কামপীঠ, স্বৰ্ণপীঠ, সৌমাৰপীঠ):',
    selectYearHint: 'সময়ৰেখাৰ স্লাইডাৰ টানি বা ঐতিহাসিক মাইলষ্টোনত ক্লিক কৰি ৰাজ্যবোৰ অন্বেষণ কৰক।',
    activeRuler: 'শাসনকাল',
    seatOfPower: 'ৰাজধানী',
    centuryPlaces: 'এই শতিকাৰ প্ৰধান স্থানসমূহ',
    inscriptionsLayerNote: 'প্ৰত্নতাত্ত্বিক শিলালিপি আৰু তাম্ৰশাসনৰ প্ৰাপ্তিস্থানসমূহ প্ৰদৰ্শন কৰা হৈছে।',
    allPlaces: 'সকলো ঠাই',
    clickToFocus: 'বিৱৰণ চাবলৈ ক্লিক কৰক',
    close: 'বন্ধ কৰক',
    sources: 'তথ্যসূত্ৰ'
  }
};

let lang = 'en';
try { lang = localStorage.getItem('lang') === 'as' ? 'as' : 'en'; } catch {}
const t = k => STR[lang]?.[k] ?? STR.en[k] ?? k;
const nm = c => (lang === 'as' && c?.name_as) ? c.name_as : (c?.name || '');

/* Global Map & Projection variables */
let mapGeo = null;
const W = 1200, lat0 = 23.6, lat1 = 28.8, lon0 = 87.5, lon1 = 97.8;
const kCos = Math.cos(26.2 * Math.PI / 180);
const H = Math.round(W * (lat1 - lat0) / ((lon1 - lon0) * kCos));
const X = lon => ((lon - lon0) / (lon1 - lon0) * W).toFixed(1);
const Y = lat => ((lat1 - lat) / (lat1 - lat0) * H).toFixed(1);
const unX = x => lon0 + (x / W) * (lon1 - lon0);
const unY = y => lat1 - (y / H) * (lat1 - lat0);

/* Polygon clipping helper functions */
const pc = window.polygonClipping;
const toPC = rg => {
  const c = rg.map(([la, lo]) => [lo, la]);
  if (c.length && (c[0][0] !== c[c.length - 1][0] || c[0][1] !== c[c.length - 1][1])) c.push(c[0]);
  return [c];
};
const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };
const fillHoles = mp => mp.map(poly => [poly[0]]);
const mpPath = mp => mp.map(poly => poly.map(rg => 'M' + rg.map(([lo, la]) => X(lo) + ' ' + Y(la)).join('L') + 'Z').join('')).join('');
const ringToPath = r => 'M' + r.map(([la, lo]) => X(lo) + ' ' + Y(la)).join('L') + 'Z';
const lineToPath = pts => 'M' + pts.map(([la, lo]) => X(lo) + ' ' + Y(la)).join('L');

const clipHP = (pts, axis, v, hi) => {
  const inside = p => hi ? p[axis] >= v : p[axis] <= v, out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) { const f = (v - a[axis]) / (b[axis] - a[axis]); out.push([a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])]); }
  }
  return out;
};
const clipBox = (ring, la0, la1, lo0, lo1) => [[0, la0, true], [0, la1, false], [1, lo0, true], [1, lo1, false]].reduce((r, [ax, v, hi]) => r.length ? clipHP(r, ax, v, hi) : r, ring);

function limitOf(spec) {
  if (!spec || !mapGeo) return null;
  if (spec.includes('>')) {
    const ps = spec.split('>').map(limitOf).filter(Boolean);
    return ps.length ? { chain: ps, name: ps.map(p => p.name).join(' › ') } : null;
  }
  const [kind, id] = spec.split(':'), A = mapGeo.a;
  if (kind === 'river' && A.rivers[id]) return { line: A.rivers[id].pts, name: A.rivers[id].name };
  if (kind === 'ridge' && A.ridges[id]) return { line: A.ridges[id], name: id === 'patkai' ? 'Patkai ridge' : id };
  if (kind === 'place' && placeById[id] && placeById[id].geo) return { lon: placeById[id].geo[1], lat: placeById[id].geo[0], name: placeById[id].name };
  if (kind === 'lon') return { lon: Number(id), name: `${id}°E` };
  if (kind === 'lat') return { lat: Number(id), name: `${id}°N` };
  return null;
}

function curveAt(l, ax, v) {
  if (l.chain) {
    const f = l.chain[0], k = ax === 0 ? 0 : 1;
    return f.line && v < Math.min(...f.line.map(p => p[k])) && l.chain[1] ? curveAt(l.chain[1], ax, v) : curveAt(f, ax, v);
  }
  if (ax === 1 && l.name === 'Brahmaputra' && v < 90.05) v = 90.05;
  if (!l.line) return ax === 0 ? l.lon : (l.lat ?? l.lon);
  const k = ax === 0 ? 0 : 1, o = 1 - k, hits = [], ln = ax === 1 && l.name === 'Brahmaputra' ? l.line.filter(p => p[0] >= 25.6) : l.line;
  for (let i = 0; i < ln.length - 1; i++) {
    const a = ln[i], b = ln[i + 1];
    if ((a[k] - v) * (b[k] - v) <= 0 && a[k] !== b[k]) hits.push(a[o] + (b[o] - a[o]) * (v - a[k]) / (b[k] - a[k]));
  }
  if (hits.length) return hits.reduce((s, x) => s + x, 0) / hits.length;
  return ln.reduce((best, p) => Math.abs(p[k] - v) < Math.abs(best[k] - v) ? p : best)[o];
}

const landCache = {};
function landFor(polity, plain) {
  const key = polity + (plain ? '+' : '');
  if (landCache[key]) return landCache[key];
  if (!mapGeo || !mapGeo.a) return [];
  const polys = Object.entries(mapGeo.a.districts)
    .filter(([id]) => !(['karbi-anglong', 'west-karbi-anglong'].includes(id) && polity !== 'dimasa-kingdom') && !(id === 'dima-hasao' && polity !== 'dimasa-kingdom') && !(['cachar', 'hailakandi', 'karimganj'].includes(id) && !['kamarupa', 'kamarupa-pithas', 'dimasa-kingdom'].includes(polity)))
    .flatMap(([, d]) => d.rings.map(toPC));
  if (plain) {
    (mapGeo.nb.countries.India || []).flatMap(rg => [clipBox(rg, 25.4, 27.0, 87.5, 89.95), clipBox(rg, 26.05, 27.0, 89.9, 90.2)]).filter(x => x.length > 2).forEach(rg => polys.push(toPC(rg)));
    (mapGeo.nb.countries.Bangladesh || []).map(rg => clipBox(rg, 24.0, 26.8, 87.5, 92.6)).filter(x => x.length > 2).forEach(rg => polys.push(toPC(rg)));
  }
  const good = polys.filter(pg => safe(() => pc.union(pg), null));
  return landCache[key] = safe(() => fillHoles(pc.union(...good)), []);
}

/* Cached shape computation */
function computeRealmShape(g) {
  if (g.mp) return g.mp;
  const { w, e, n, s } = g, west = [], east = [], south = [], north = [];
  for (let la = 22.6; la <= 29.1; la += 0.02) {
    west.push([w ? curveAt(w, 0, la) : e ? curveAt(e, 0, la) - 1.7 : lon0, la]);
    east.push([e ? curveAt(e, 0, la) : w ? curveAt(w, 0, la) + 1.7 : lon1, la]);
  }
  for (let lo = 87.6; lo <= 98.4; lo += 0.03) {
    south.push([lo, s ? curveAt(s, 1, lo) : g.plainDefault ? 24.75 : 22]);
    north.push([lo, n ? curveAt(n, 1, lo) : 30]);
  }
  const close = pts => [[...pts, pts[0]]];
  const region = close([...west, ...east.reverse()]), band = close([...south, ...north.reverse()]);
  return g.mp = safe(() => fillHoles(pc.intersection(landFor(g.r.polity, g.plain), region, band)), []);
}

const groupShapeCache = {};
function computeGroupShape(parts) {
  const key = parts.map(([g, r]) => r.id).join('|');
  return groupShapeCache[key] || (groupShapeCache[key] = safe(() => parts.length > 1 ? fillHoles(pc.union(...parts.map(([g]) => computeRealmShape(g)).filter(m => m.length))) : computeRealmShape(parts[0][0]), []));
}

/* Atlas Application State */
const atlasState = {
  year: 643,
  isPlaying: false,
  playTimer: null,
  hidePresentDay: true, // Antique pure historical view by default (hides modern 33 districts, state, and country borders)
  selectedPithaKey: null,
  layers: {
    realms: true,
    capitals: true,
    forts: true,
    sacred: true,
    cities: true,
    rivers: true,
    inscriptions: false
  },
  selectedPlaceId: null,
  selectedRealmId: null,
  selectedInscriptionId: null,
  drawerOpen: true,
  drawerTab: 'realms',
  viewBox: { x: 0, y: 0, w: W, h: H },
  isPanning: false,
  startPan: { x: 0, y: 0 },
  zoomLevel: 1
};

/* Place categorization */
function placeCategory(p) {
  const c = p.cat;
  if (c === 'Capital') return 'capital';
  if (c === 'Fort' || c === 'Battle site') return 'fort';
  if (c === 'Temple' || c === 'Monastery' || c === 'Pilgrim site') return 'sacred';
  if (c === 'City' || c === 'Town' || c === 'Settlement' || c === 'Village') return 'city';
  if (c === 'Inscription findspot') return 'inscr';
  return 'other';
}

/* Main View: Historical Atlas */
function viewMap(q) {
  const requestedYear = Number(q.get('y')) || (q.get('era') === 'kamarupa' ? 643 : atlasState.year || 643);
  atlasState.year = Math.min(1826, Math.max(350, requestedYear));
  if (q.get('modern') === '1') atlasState.hidePresentDay = false;
  if (q.get('pure') === '1') atlasState.hidePresentDay = true;
  if (q.get('inscr') === '1') atlasState.layers.inscriptions = true;
  if (q.get('pitha')) atlasState.selectedPithaKey = q.get('pitha');

  if (!mapGeo) {
    mapGeo = 'loading';
    Promise.all(['data/maps/boundaries.json', 'data/maps/assam.json', 'data/maps/neighbours.json'].map(f => fetch(f).then(r => r.json())))
      .then(([b, a, nb]) => {
        mapGeo = { b, a, nb };
        if (parseHash().parts[0] === 'map' || !parseHash().parts[0]) renderAtlas();
      })
      .catch(() => {
        mapGeo = 'fail';
        const root = $('atlasRoot');
        if (root) root.innerHTML = `<div class="empty">Unable to load map geographic boundaries. Please check internet connection.</div>`;
      });
  }

  setTimeout(() => {
    if (mapGeo && mapGeo !== 'loading' && mapGeo !== 'fail') renderAtlas();
  }, 10);

  return `<div class="atlas-root" id="atlasRoot">
    <!-- Top Bar: Era Jump Bar & Quick Controls -->
    <div class="atlas-topbar">
      <div class="atlas-era-tabs" role="tablist" aria-label="Historical Eras">
        <button type="button" class="era-tab ${atlasState.year <= 1100 ? 'active' : ''}" data-era-jump="643">
          <span class="era-tab-range">350–1100 CE</span>
          <span class="era-tab-title">Ancient Kāmarūpa</span>
        </button>
        <button type="button" class="era-tab ${atlasState.year > 1100 && atlasState.year <= 1500 ? 'active' : ''}" data-era-jump="1257">
          <span class="era-tab-range">1100–1500 CE</span>
          <span class="era-tab-title">Medieval Realms</span>
        </button>
        <button type="button" class="era-tab ${atlasState.year > 1500 && atlasState.year <= 1682 ? 'active' : ''}" data-era-jump="1671">
          <span class="era-tab-range">1500–1682 CE</span>
          <span class="era-tab-title">Ahom &amp; Koch Empires</span>
        </button>
        <button type="button" class="era-tab ${atlasState.year > 1682 ? 'active' : ''}" data-era-jump="1794">
          <span class="era-tab-range">1682–1826 CE</span>
          <span class="era-tab-title">Manas Frontier &amp; Beyond</span>
        </button>
      </div>

      <div class="atlas-layer-bar" id="atlasLayerBar">
        <button type="button" class="atlas-pill present-pill ${atlasState.hidePresentDay ? 'active' : ''}" id="togglePresentPill" title="${atlasState.hidePresentDay ? esc(t('showPresentDay')) : esc(t('hidePresentDay'))}">
          <span class="pill-dot present-dot"></span><span>${atlasState.hidePresentDay ? esc(t('historicalOnly')) : esc(t('modernOverlay'))}</span>
        </button>
        <button type="button" class="atlas-pill ${atlasState.layers.realms ? 'active' : ''}" data-layer="realms">
          <span class="pill-dot realm-dot"></span><span>${esc(t('layerRealms'))}</span>
        </button>
        <button type="button" class="atlas-pill ${atlasState.layers.capitals ? 'active' : ''}" data-layer="capitals">
          <span class="pill-dot cap-dot"></span><span>${esc(t('layerCapitals'))}</span>
        </button>
        <button type="button" class="atlas-pill ${atlasState.layers.forts ? 'active' : ''}" data-layer="forts">
          <span class="pill-dot fort-dot"></span><span>${esc(t('layerForts'))}</span>
        </button>
        <button type="button" class="atlas-pill ${atlasState.layers.sacred ? 'active' : ''}" data-layer="sacred">
          <span class="pill-dot sacred-dot"></span><span>${esc(t('layerSacred'))}</span>
        </button>
        <button type="button" class="atlas-pill ${atlasState.layers.rivers ? 'active' : ''}" data-layer="rivers">
          <span class="pill-dot river-dot"></span><span>${esc(t('layerRivers'))}</span>
        </button>
        <button type="button" class="atlas-pill inscr-pill ${atlasState.layers.inscriptions ? 'active' : ''}" data-layer="inscriptions">
          <span class="pill-dot inscr-dot"></span><span>${esc(t('layerInscriptions'))}</span>
        </button>
      </div>
    </div>

    <!-- Main Viewport: Canvas & Slide-over Drawer -->
    <div class="atlas-viewport">
      <div class="atlas-canvas-box" id="atlasCanvasBox">
        <div class="atlas-hud">
          <div class="hud-zoom-group">
            <button type="button" id="mzin" title="Zoom In" aria-label="Zoom in">+</button>
            <button type="button" id="mzout" title="Zoom Out" aria-label="Zoom out">−</button>
            <button type="button" id="mzreset" title="Reset View" aria-label="Reset view">⟲</button>
          </div>
          <button type="button" class="hud-action-btn ${atlasState.hidePresentDay ? 'active' : ''}" id="hudPresentBtn" title="${atlasState.hidePresentDay ? 'Showing antique historical view (click to reveal modern districts)' : 'Showing modern district overlay (click to hide)'}">
            <span class="hud-btn-icon">${atlasState.hidePresentDay ? '🏛' : '🗺'}</span>
            <span class="hud-btn-label">${atlasState.hidePresentDay ? esc(t('historicalOnly')) : esc(t('modernOverlay'))}</span>
          </button>
          <button type="button" class="hud-drawer-btn ${atlasState.drawerOpen ? 'open' : ''}" id="hudDrawerBtn" aria-label="Toggle Dossier">
            <span class="hud-drawer-icon">❖</span>
            <span class="hud-drawer-text">${esc(t('dossier'))}</span>
          </button>
        </div>

        <div class="atlas-tooltip" id="atlasTooltip" hidden></div>

        <svg id="atlasSvg" class="atlas-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" tabindex="0">
          <defs>
            <radialGradient id="capitalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
              <stop offset="60%" stop-color="#f59e0b" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
            </radialGradient>
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>
          <g id="mbase"></g>
          <g id="mrivers"></g>
          <g id="mrealms"></g>
          <g id="mpithas"></g>
          <g id="mspots"></g>
          <g id="minscriptions"></g>
        </svg>
      </div>

      <aside class="atlas-drawer ${atlasState.drawerOpen ? 'open' : ''}" id="atlasDrawer">
        <div class="drawer-header">
          <div class="drawer-title-group">
            <span class="drawer-kicker" id="drawerKicker">GEOPOLITICAL DOSSIER</span>
            <h2 id="drawerTitle">Active Kingdoms</h2>
          </div>
          <button type="button" class="drawer-close-btn" id="drawerCloseBtn" aria-label="Close drawer">×</button>
        </div>

        <div class="drawer-tabs">
          <button type="button" class="dtab ${atlasState.drawerTab === 'realms' ? 'active' : ''}" data-dtab="realms">${esc(t('realmsTab'))}</button>
          <button type="button" class="dtab ${atlasState.drawerTab === 'places' ? 'active' : ''}" data-dtab="places">${esc(t('placesTab'))}</button>
          <button type="button" class="dtab ${atlasState.drawerTab === 'inscriptions' ? 'active' : ''}" data-dtab="inscriptions">${esc(t('inscrTab'))}</button>
        </div>

        <div class="drawer-content" id="drawerContent">
          <!-- Dynamic cards -->
        </div>
      </aside>
    </div>

    <!-- Cinema-Grade Bottom Timeline Deck -->
    <div class="atlas-deck" id="atlasDeck">
      <div class="deck-milestones-row" id="deckMilestonesRow">
        ${MILESTONES.map(m => `
          <button type="button" class="milestone-chip ${atlasState.year === m.year ? 'active' : ''}" data-year="${m.year}">
            <b class="chip-yr">${m.year}</b>
            <span class="chip-title">${esc(lang === 'as' ? m.title_as : m.title)}</span>
          </button>
        `).join('')}
      </div>

      <div class="deck-main-bar">
        <div class="deck-playback">
          <button type="button" class="deck-btn" id="deckStepBack" title="Step back 25 years">−25y</button>
          <button type="button" class="deck-btn deck-play-btn ${atlasState.isPlaying ? 'playing' : ''}" id="deckPlayBtn" title="Play / Pause">
            <span id="playIcon">${atlasState.isPlaying ? '❚❚' : '▶'}</span>
            <span id="playLabel">${esc(atlasState.isPlaying ? t('pause') : t('play'))}</span>
          </button>
          <button type="button" class="deck-btn" id="deckStepFwd" title="Step forward 25 years">+25y</button>
        </div>

        <div class="deck-year-box">
          <div class="deck-year-num" id="deckYearNum">${atlasState.year} CE</div>
          <div class="deck-dynasty-sub" id="deckDynastySub">Loading...</div>
        </div>

        <div class="deck-slider-wrap">
          <input type="range" class="deck-slider" id="deckSlider" min="350" max="1826" value="${atlasState.year}" step="1" aria-label="Timeline Year">
          <div class="deck-slider-ticks">
            <span>350</span>
            <span>643</span>
            <span>830</span>
            <span>1000</span>
            <span>1187</span>
            <span>1228</span>
            <span>1257</span>
            <span>1515</span>
            <span>1581</span>
            <span>1671</span>
            <span>1682</span>
            <span>1826</span>
          </div>
        </div>

        <div class="deck-headline-card">
          <span class="headline-tag">HISTORICAL MOMENT</span>
          <p class="headline-text" id="deckHeadlineText">Loading narrative...</p>
        </div>
      </div>
    </div>
  </div>`;
}

/* Render the full interactive atlas canvas and drawer */
function renderAtlas() {
  if (!mapGeo || mapGeo === 'loading' || mapGeo === 'fail') return;
  const svg = $('atlasSvg');
  if (!svg) return;

  const y = atlasState.year;

  // 1. Paint Base Terrain & Districts
  paintBaseGeography();

  // 2. Paint Rivers
  paintRivers();

  // 3. Paint Active Kingdoms (Realms) & Four Pīṭhas
  paintRealms(y);

  // 4. Paint Historical Spots & Places
  paintSpots(y);

  // 5. Paint Inscriptions (if enabled)
  paintInscriptions(y);

  // 6. Update Timeline Deck Controls & Dynamic Narrative
  updateTimelineDeck(y);

  // 7. Update Right-Side Drawer
  updateDrawer(y);

  // 8. Update URL hash query
  updateUrlQuery();
}

/* Base Districts, Neighboring Countries & Rivers */
function paintBaseGeography() {
  const mbase = $('mbase');
  if (!mbase) return;

  const b = mapGeo.b, a = mapGeo.a, nb = mapGeo.nb;
  const neighbours = Object.entries(nb.countries || {}).flatMap(([cname, rings]) => rings.map(r => `<path class="mcountry mcountry-${cname.toLowerCase()}" d="${ringToPath(r)}"><title>${esc(cname)}</title></path>`)).join('');
  const districts = Object.entries(a.districts || {}).flatMap(([did, d]) => d.rings.map(r => `<path class="mdist" data-did="${did}" d="${ringToPath(r)}"><title>${esc(d.name || did)}</title></path>`)).join('');
  const assamBorder = (b.assam?.rings || []).map(r => `<path class="mborder-assam" d="${ringToPath(r)}"/>`).join('');

  // Subtle natural valley base contour for pure antique historical view
  const valleyBase = (b.assam?.rings || []).map(r => `<path class="mvalley-fill" d="${ringToPath(r)}"/>`).join('');

  mbase.innerHTML = `
    <g class="mvalley-base">${valleyBase}</g>
    <g class="mcountries">${neighbours}</g>
    <g class="mdistricts">${districts}</g>
    <g class="massam-bounds">${assamBorder}</g>
  `;

  const svg = $('atlasSvg');
  if (svg) svg.classList.toggle('hide-present', !!atlasState.hidePresentDay);
  mbase.dataset.rendered = 'true';
}

function paintRivers() {
  const mrivers = $('mrivers');
  if (!mrivers || mrivers.dataset.rendered) return;

  const a = mapGeo.a;
  const paths = Object.entries(a.rivers || {}).map(([rid, r]) => {
    const isBrahmaputra = rid === 'brahmaputra';
    const isMajor = isBrahmaputra || ['teesta-karatoya', 'manas', 'sonkosh', 'subansiri', 'dikhou', 'kapili', 'bharali'].includes(rid);
    return `<path class="mrv ${isBrahmaputra ? 'mrv-brahmaputra' : isMajor ? 'mrv-major' : 'mrv-tributary'}" data-rid="${rid}" d="${lineToPath(r.pts)}"><title>${esc(r.name)}</title></path>`;
  }).join('');

  mrivers.innerHTML = paths;
  mrivers.dataset.rendered = 'true';
}

/* Paint Kingdom Polygons, Centered Dynastic Labels, and Frontier Limit Lines */
let geoCache = null;
function getGeoRealms() {
  if (geoCache) return geoCache;
  geoCache = realms.map(r => {
    const w = limitOf(r.w), e = limitOf(r.e), n = limitOf(r.n), s = limitOf(r.s);
    if (!w && !e && !n && !s) return null;
    const plain = (w ? curveAt(w, 0, 26) : 99) < 90.4 || (!w && e && curveAt(e, 0, 26) < 92);
    return { r, w, e, n, s, open: (!w || !e) && (w || e), plain, plainDefault: !s && plain, color: realmColor(r) };
  });
  return geoCache;
}

function paintRealms(y) {
  const container = $('mrealms');
  if (!container) return;

  if (!atlasState.layers.realms) {
    container.innerHTML = '';
    return;
  }

  // 1. ANCIENT KĀMARŪPA ERA (350–1100 CE): Direct Four Pīṭha provinces inside Kāmarūpa
  if (y <= 1100) {
    const geo = getGeoRealms();
    const pitRows = realms.map((r, i) => [geo[i], r]).filter(([g, r]) => g && r.id.startsWith('pitha-kakati-'));
    const kamarupaActive = realms.find(r => r.id.startsWith('kamarupa-') && r.start <= y && y <= (r.end ?? r.start));
    const narrative = getTimelineNarrative(y);
    const dynastyLabel = narrative.dynasty || (kamarupaActive ? kamarupaActive.name : 'Kāmarūpa Kingdom');

    // Compute shapes for each Pīṭha
    const pithaShapes = pitRows.map(([g, r]) => {
      const shp = computeRealmShape(g);
      const key = r.id.split('-').pop();
      return { g, r, key, shp, color: PITHA_COLORS[key] || '#64748b', info: PITHA_INFO[key] };
    }).filter(p => p.shp && p.shp.length);

    // Compute combined outer boundary of Kāmarūpa
    const unionParts = pithaShapes.map(p => p.shp);
    const combinedKamarupaShape = safe(() => fillHoles(pc.union(...unionParts)), []);

    const selectedKey = atlasState.selectedPithaKey;

    // SVG elements for Pīṭha provinces
    const provincesSvg = pithaShapes.map(({ key, shp, color, info }) => {
      const isSelected = selectedKey === key;
      const outerRing = shp.map(poly => poly[0]).sort((a, b) => b.length - a.length)[0];
      let lblSvg = '';
      if (outerRing && outerRing.length > 3) {
        const lons = outerRing.map(p => p[0]), lats = outerRing.map(p => p[1]);
        const cx = (Math.min(...lons) + Math.max(...lons)) / 2;
        const cy = (Math.min(...lats) + Math.max(...lats)) / 2;
        const pName = lang === 'as' ? info.name_as : info.name;
        const pSpan = lang === 'as' ? info.span_as : info.span;
        lblSvg = `<g class="mpitha-label-box" pointer-events="none">
          <text class="mpitha-lbl" x="${X(cx)}" y="${Y(cy) - 6}" text-anchor="middle" dominant-baseline="central">${esc(pName.toUpperCase())}</text>
          <text class="mpitha-lbl-sub" x="${X(cx)}" y="${Y(cy) + 9}" text-anchor="middle" dominant-baseline="central">${esc(pSpan)}</text>
        </g>`;
      }

      return `<g class="mpitha-group ${isSelected ? 'selected' : ''}" data-pitha="${key}" data-realm="kamarupa" style="--pc:${color}">
        <path class="mpitha-poly" fill-rule="evenodd" d="${mpPath(shp)}">
          <title>${esc(info.name)} · ${esc(t('kamarupaProvinces'))} (${esc(info.span)})</title>
        </path>
        ${lblSvg}
      </g>`;
    }).join('');

    // River Dividing Frontier Lines
    const a = mapGeo.a;
    const boundaryRivers = [
      { id: 'teesta-karatoya', label: 'Karatoyā River' },
      { id: 'sonkosh', label: 'Sankosh River' },
      { id: 'puthimari', label: 'Bornadi / Puthimari' },
      { id: 'bharali', label: 'Bharali River' },
      { id: 'dikrong', label: 'Dikkaravasini / Dikrang' }
    ];
    const riverLinesSvg = boundaryRivers.map(br => {
      const rData = a && a.rivers ? a.rivers[br.id] : null;
      if (!rData || !rData.pts) return '';
      return `<path class="mpitha-divide-line" d="${lineToPath(rData.pts)}"><title>${esc(br.label)}</title></path>`;
    }).join('');

    // Unified Outer Imperial Border
    const outerBorderSvg = combinedKamarupaShape.length ? `
      <path class="kamarupa-outer-border" fill="none" fill-rule="evenodd" d="${mpPath(combinedKamarupaShape)}" pointer-events="none"/>
    ` : '';

    // Imperial Crown Banner across northern frontier
    const crownBannerSvg = `
      <g class="kamarupa-crown-banner" transform="translate(490, 68)" pointer-events="none">
        <rect class="crown-banner-bg" x="-200" y="-14" width="400" height="28" rx="14"/>
        <text class="crown-banner-text" x="0" y="1" text-anchor="middle" dominant-baseline="central">
          👑 KĀMARŪPA KINGDOM · ${esc(dynastyLabel.toUpperCase())}
        </text>
      </g>
    `;

    container.innerHTML = `<g class="kamarupa-unified-realm">
      ${provincesSvg}
      ${riverLinesSvg}
      ${outerBorderSvg}
      ${crownBannerSvg}
    </g>`;
    return;
  }

  // 2. MEDIEVAL ERA (1100–1826 CE): Multiple kingdoms
  const geo = getGeoRealms();
  const act = geo.map((g, i) => [g, realms[i]]).filter(([g, r]) => r.start <= y && y <= (r.end ?? r.start));
  const drawn = act.filter(([g]) => g);

  // Group parts sharing the same kingdom name (north bank + south bank)
  const parts = [...drawn.reduce((m, [g, r]) => m.set(r.name, [...(m.get(r.name) || []), [g, r]]), new Map()).values()];

  container.innerHTML = parts.map(ps => {
    const g0 = ps[0][0], r0 = ps[0][1];
    const shp = computeGroupShape(ps);
    if (!shp || !shp.length) return '';

    // Calculate center for dynastic label
    let labelSvg = '';
    const outerRing = shp.map(poly => poly[0]).sort((a, b) => b.length - a.length)[0];
    if (outerRing && outerRing.length > 4) {
      const lons = outerRing.map(p => p[0]), lats = outerRing.map(p => p[1]);
      const cx = (Math.min(...lons) + Math.max(...lons)) / 2;
      const cy = (Math.min(...lats) + Math.max(...lats)) / 2;
      const shortName = r0.name.replace(/kingdom|empire|under the.*|period|the |from .*/gi, '').trim().toUpperCase();
      labelSvg = `<text class="mrealm-center-label" x="${X(cx)}" y="${Y(cy)}" text-anchor="middle" dominant-baseline="central">${esc(shortName)}</text>`;
    }

    const limitsSvg = ps.flatMap(([g]) => [g.w, g.e, g.n, g.s])
      .flatMap(l => l ? (l.chain || [l]) : [])
      .map(l => l.line ? `<path class="mrealm-limit-line" d="${lineToPath(l.line)}"/>` : '').join('');

    return `<g class="mrealm-group" data-realm="${r0.id}" style="--rc:${g0.color}">
      <path class="mreg ${g0.open ? 'open' : ''}" fill-rule="evenodd" d="${mpPath(shp)}">
        <title>${esc(r0.name)} (${r0.label || ''})</title>
      </path>
      ${limitsSvg}
      ${labelSvg}
    </g>`;
  }).join('');
}

/* Integrated Four Pīṭhas (Rendered inside paintRealms) */
function paintPithas(y) {
  const container = $('mpithas');
  if (container) container.innerHTML = '';
}

/* Spots & Places with Distinct Visual Hierarchy */
function paintSpots(y) {
  const container = $('mspots');
  if (!container) return;

  const pts = places.filter(p => p.geo && p.geo.length === 2);
  const narrative = getTimelineNarrative(y);
  const activeCapitalId = narrative.capital;

  const spotElements = pts.map(p => {
    const cat = placeCategory(p);
    // Check layer visibility
    if (cat === 'capital' && !atlasState.layers.capitals) return '';
    if (cat === 'fort' && !atlasState.layers.forts) return '';
    if (cat === 'sacred' && !atlasState.layers.sacred) return '';
    if (cat === 'city' && !atlasState.layers.cities) return '';
    if (cat === 'inscr') return ''; // handled in paintInscriptions
    if (cat === 'other') return '';

    const x = X(p.geo[1]), yPos = Y(p.geo[0]);
    const isActiveCapital = p.id === activeCapitalId;
    const isSelected = p.id === atlasState.selectedPlaceId;
    const displayName = lang === 'as' && p.name_as ? p.name_as : p.name;

    if (cat === 'capital') {
      return `<g class="mspot mspot-capital ${isActiveCapital ? 'active-capital' : ''} ${isSelected ? 'selected' : ''}" data-pid="${p.id}" transform="translate(${x},${yPos})">
        ${isActiveCapital ? `<circle class="mspot-beacon" r="22"/>` : ''}
        <circle class="mspot-pulse" r="14"/>
        <circle class="mspot-ring" r="8"/>
        <circle class="mspot-core" r="4.5"/>
        <text class="mspot-label mspot-label-cap" x="12" y="4">${esc(displayName)}</text>
      </g>`;
    } else if (cat === 'fort') {
      return `<g class="mspot mspot-war ${isSelected ? 'selected' : ''}" data-pid="${p.id}" transform="translate(${x},${yPos})">
        <polygon class="mspot-shield" points="0,-8 7,-3 5,6 0,9 -5,6 -7,-3"/>
        <circle class="mspot-core" r="2.2"/>
        <text class="mspot-label" x="11" y="3.5">${esc(displayName)}</text>
      </g>`;
    } else if (cat === 'sacred') {
      return `<g class="mspot mspot-faith ${isSelected ? 'selected' : ''}" data-pid="${p.id}" transform="translate(${x},${yPos})">
        <circle class="mspot-ring" r="6.5"/>
        <path class="mspot-dome" d="M -4,3 Q 0,-6 4,3 Z"/>
        <text class="mspot-label" x="10" y="3">${esc(displayName)}</text>
      </g>`;
    } else {
      return `<g class="mspot mspot-city ${isSelected ? 'selected' : ''}" data-pid="${p.id}" transform="translate(${x},${yPos})">
        <circle class="mspot-dot" r="4"/>
        <text class="mspot-label" x="8" y="3">${esc(displayName)}</text>
      </g>`;
    }
  }).join('');

  container.innerHTML = spotElements;
}

/* Secondary Inscriptions Layer (On-Demand) */
function paintInscriptions(y) {
  const container = $('minscriptions');
  if (!container) return;

  if (!atlasState.layers.inscriptions) {
    container.innerHTML = '';
    return;
  }

  const rawInscrs = window.INSCRIPTIONS_ATLAS?.records || [];
  const mapped = rawInscrs.filter(r => r.latitude && r.longitude && Number.isFinite(+r.latitude) && Number.isFinite(+r.longitude));

  container.innerHTML = mapped.map(r => {
    const x = X(+r.longitude), yPos = Y(+r.latitude);
    const isSelected = r.record_id === atlasState.selectedInscriptionId;
    return `<g class="mspot mspot-inscr ${isSelected ? 'selected' : ''}" data-inscr-id="${r.record_id}" transform="translate(${x},${yPos})">
      <rect class="mspot-diamond" x="-4" y="-4" width="8" height="8" transform="rotate(45)"/>
      <text class="mspot-label-small" x="9" y="3">${esc(r.inscription_name)}</text>
    </g>`;
  }).join('');
}

/* Update Bottom Timeline Deck */
function updateTimelineDeck(y) {
  const yearNum = $('deckYearNum'), dynastySub = $('deckDynastySub'), headline = $('deckHeadlineText'), slider = $('deckSlider');
  if (slider && Number(slider.value) !== y) slider.value = y;

  const narrative = getTimelineNarrative(y);
  if (yearNum) yearNum.textContent = lang === 'as' ? `${y} খ্ৰী:` : `${y} CE`;
  if (dynastySub) dynastySub.textContent = narrative.dynasty;
  if (headline) headline.textContent = lang === 'as' ? narrative.headline_as : narrative.headline;

  // Update milestone chip active state
  document.querySelectorAll('.milestone-chip').forEach(chip => {
    const my = Number(chip.dataset.year);
    chip.classList.toggle('active', my === narrative.year || (Math.abs(y - my) <= 15));
  });

  // Update era tabs active state
  document.querySelectorAll('.era-tab').forEach(tab => {
    const jump = Number(tab.dataset.eraJump);
    const isAncient = jump === 643 && y <= 1100;
    const isMed = jump === 1257 && y > 1100 && y <= 1500;
    const isImperial = jump === 1671 && y > 1500 && y <= 1682;
    const isManas = jump === 1794 && y > 1682;
    tab.classList.toggle('active', isAncient || isMed || isImperial || isManas);
  });
}

/* Update Right-Side Drawer Content */
function updateDrawer(y) {
  const content = $('drawerContent');
  if (!content) return;

  const tab = atlasState.drawerTab;
  if (tab === 'realms') {
    renderDrawerRealms(y, content);
  } else if (tab === 'places') {
    renderDrawerPlaces(y, content);
  } else if (tab === 'inscriptions') {
    renderDrawerInscriptions(y, content);
  }
}

function renderDrawerRealms(y, container) {
  const geo = getGeoRealms();
  const act = geo.map((g, i) => [g, realms[i]]).filter(([g, r]) => r.start <= y && y <= (r.end ?? r.start));
  const groups = [...act.reduce((m, [g, r]) => m.set(r.name, [...(m.get(r.name) || []), [g, r]]), new Map()).values()];

  const narrative = getTimelineNarrative(y);
  const capitalPlace = narrative.capital ? placeById[narrative.capital] : null;

  let html = `<div class="dossier-era-card">
    <div class="dossier-badge">${esc(narrative.dynasty)}</div>
    <h3>${esc(lang === 'as' ? narrative.title_as : narrative.title)}</h3>
    <p class="dossier-lede">${esc(lang === 'as' ? narrative.headline_as : narrative.headline)}</p>
    ${capitalPlace ? `
      <div class="dossier-capital-card">
        <div class="cap-header">
          <span class="cap-crown">👑</span>
          <div>
            <strong class="cap-name">${esc(lang === 'as' && capitalPlace.name_as ? capitalPlace.name_as : capitalPlace.name)}</strong>
            <span class="cap-type">${esc(t('seatOfPower'))}</span>
          </div>
        </div>
        <p class="cap-summary">${esc(capitalPlace.summary || capitalPlace.desc || '')}</p>
        <button type="button" class="dossier-btn-focus" data-fly-lat="${capitalPlace.geo[0]}" data-fly-lon="${capitalPlace.geo[1]}">
          ${esc(t('focusCapital'))}
        </button>
      </div>
    ` : ''}
  </div>`;

  // Integrated Four Pīṭhas of Kāmarūpa (350–1100 CE)
  if (y <= 1100) {
    const selectedKey = atlasState.selectedPithaKey || (narrative.capital === 'haruppeswara' || narrative.capital === 'durjaya' ? 'suvarna' : 'kama');
    const selectedInfo = PITHA_INFO[selectedKey] || PITHA_INFO.kama;

    html += `<div class="dossier-pitha-section">
      <div class="pitha-section-header">
        <h4>👑 ${esc(t('kamarupaProvinces'))}</h4>
      </div>
      <p class="pitha-intro">${esc(t('pithaNote'))}</p>
      <div class="pitha-quad-grid">
        ${Object.entries(PITHA_INFO).map(([k, p]) => {
          const isSel = k === selectedKey;
          return `<button type="button" class="pitha-card-interactive ${isSel ? 'selected' : ''}" data-pitha="${k}" style="--pc:${PITHA_COLORS[k]}">
            <span class="pitha-swatch"></span>
            <div>
              <strong>${esc(lang === 'as' ? p.name_as : p.name)}</strong>
              <small>${esc(lang === 'as' ? p.span_as : p.span)}</small>
            </div>
          </button>`;
        }).join('')}
      </div>

      <div class="pitha-detail-box" style="--pc:${PITHA_COLORS[selectedKey]}">
        <div class="pitha-detail-header">
          <h5>${esc(lang === 'as' ? selectedInfo.name_as : selectedInfo.name)} · ${esc(lang === 'as' ? selectedInfo.zone_as || selectedInfo.zone : selectedInfo.zone)}</h5>
          <span class="pitha-span-badge">${esc(lang === 'as' ? selectedInfo.span_as : selectedInfo.span)}</span>
        </div>
        <p class="pitha-detail-desc">${esc(lang === 'as' ? selectedInfo.desc_as || selectedInfo.desc : selectedInfo.desc)}</p>

        <div class="pitha-sites-group">
          <h6>${esc(t('provinceShrines'))}</h6>
          <div class="pitha-sites-list">
            ${(selectedInfo.sites || []).map(sid => {
              const p = placeById[sid] || Object.values(placeById).find(x => x.name.toLowerCase() === sid.toLowerCase());
              if (!p) return '';
              const pName = lang === 'as' && p.name_as ? p.name_as : p.name;
              return `<button type="button" class="pitha-site-chip" data-pid="${p.id}" title="${esc(p.summary || p.desc || '')}">📍 ${esc(pName)}</button>`;
            }).filter(Boolean).join('')}
          </div>
        </div>

        <button type="button" class="pitha-fly-btn" data-pitha="${selectedKey}">
          ${esc(t('flyToProvince'))}
        </button>
      </div>
    </div>`;
  }

  // Active Medieval Kingdom Cards (After 1100 CE)
  if (y > 1100 && groups.length) {
    html += `<div class="dossier-realms-list">
      <h4>${esc(t('layerRealms'))} (${groups.length})</h4>
      ${groups.map(parts => {
        const r0 = parts[0][1], g0 = parts[0][0];
        const color = g0 ? g0.color : realmColor(r0);
        const wLimit = parts.map(([g]) => g?.w?.name).filter(Boolean).join(' / ') || t('noLimitNamed');
        const eLimit = parts.map(([g]) => g?.e?.name).filter(Boolean).join(' / ') || t('noLimitNamed');
        const nLimit = parts.map(([g]) => g?.n?.name).filter(Boolean).join(' / ') || t('noLimitNamed');
        const sLimit = parts.map(([g]) => g?.s?.name).filter(Boolean).join(' / ') || t('noLimitNamed');

        return `<div class="realm-dossier-card" style="--rc:${color}">
          <div class="realm-dossier-head">
            <span class="realm-swatch"></span>
            <div>
              <strong>${esc(r0.name)}</strong>
              <span class="realm-dates">${esc(r0.label || `${r0.start}–${r0.end} CE`)}</span>
            </div>
          </div>
          <table class="frontiers-table">
            <tbody>
              <tr><td>${esc(t('westLimit'))}</td><td>${esc(wLimit)}</td></tr>
              <tr><td>${esc(t('eastLimit'))}</td><td>${esc(eLimit)}</td></tr>
              <tr><td>${esc(t('northLimit'))}</td><td>${esc(nLimit)}</td></tr>
              <tr><td>${esc(t('southLimit'))}</td><td>${esc(sLimit)}</td></tr>
            </tbody>
          </table>
        </div>`;
      }).join('')}
    </div>`;
  }

  container.innerHTML = html;

  // Bind Focus Capital Buttons
  container.querySelectorAll('[data-fly-lat]').forEach(btn => {
    btn.onclick = () => {
      flyTo(+btn.dataset.flyLat, +btn.dataset.flyLon, 4.5);
    };
  });

  // Bind Pīṭha Cards in Drawer
  container.querySelectorAll('.pitha-card-interactive').forEach(card => {
    card.onclick = () => {
      atlasState.selectedPithaKey = card.dataset.pitha;
      paintRealms(atlasState.year);
      updateDrawer(atlasState.year);
    };
  });

  // Bind Pīṭha Fly Button
  container.querySelectorAll('.pitha-fly-btn').forEach(btn => {
    btn.onclick = () => {
      const key = btn.dataset.pitha;
      const info = PITHA_INFO[key];
      if (info && info.center) {
        flyTo(info.center[0], info.center[1], 3.2);
      }
    };
  });

  // Bind Pīṭha Site Chips
  container.querySelectorAll('.pitha-site-chip').forEach(chip => {
    chip.onclick = () => {
      const pid = chip.dataset.pid;
      if (pid && placeById[pid]) {
        const p = placeById[pid];
        atlasState.selectedPlaceId = p.id;
        paintSpots(atlasState.year);
        flyTo(p.geo[0], p.geo[1], 4.2);
      }
    };
  });
}

function renderDrawerPlaces(y, container) {
  const pts = places.filter(p => p.geo && p.geo.length === 2);
  const capitals = pts.filter(p => placeCategory(p) === 'capital');
  const forts = pts.filter(p => placeCategory(p) === 'fort');
  const sacred = pts.filter(p => placeCategory(p) === 'sacred');
  const cities = pts.filter(p => placeCategory(p) === 'city');

  container.innerHTML = `
    <div class="drawer-search-wrap">
      <input type="search" id="drawerPlaceSearch" placeholder="Search historical places..." aria-label="Search places">
    </div>
    <div class="drawer-places-list" id="drawerPlacesList">
      <div class="place-group-sec">
        <h5>Royal Capitals (${capitals.length})</h5>
        <div class="place-cards-col">
          ${capitals.map(p => placeMiniCard(p)).join('')}
        </div>
      </div>
      <div class="place-group-sec">
        <h5>Fortresses &amp; Battlefields (${forts.length})</h5>
        <div class="place-cards-col">
          ${forts.map(p => placeMiniCard(p)).join('')}
        </div>
      </div>
      <div class="place-group-sec">
        <h5>Temples, Satras &amp; Shrines (${sacred.length})</h5>
        <div class="place-cards-col">
          ${sacred.map(p => placeMiniCard(p)).join('')}
        </div>
      </div>
      <div class="place-group-sec">
        <h5>Key Towns &amp; Ports (${cities.length})</h5>
        <div class="place-cards-col">
          ${cities.slice(0, 15).map(p => placeMiniCard(p)).join('')}
        </div>
      </div>
    </div>
  `;

  // Place click events
  container.querySelectorAll('[data-focus-place]').forEach(el => {
    el.onclick = () => {
      const p = placeById[el.dataset.focusPlace];
      if (p && p.geo) {
        atlasState.selectedPlaceId = p.id;
        paintSpots(atlasState.year);
        flyTo(p.geo[0], p.geo[1], 4.2);
      }
    };
  });

  // Filter input
  const search = $('drawerPlaceSearch');
  if (search) {
    search.oninput = e => {
      const q = e.target.value.toLowerCase().trim();
      container.querySelectorAll('.place-mini-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = !q || text.includes(q) ? '' : 'none';
      });
    };
  }
}

function placeMiniCard(p) {
  const cat = placeCategory(p);
  const icon = cat === 'capital' ? '👑' : cat === 'fort' ? '⚔' : cat === 'sacred' ? '🛕' : '📍';
  const name = lang === 'as' && p.name_as ? p.name_as : p.name;
  return `<div class="place-mini-card" data-focus-place="${p.id}">
    <span class="pm-icon">${icon}</span>
    <div class="pm-info">
      <strong>${esc(name)}</strong>
      <small>${esc(p.present || p.loc || p.cat)}</small>
    </div>
    <span class="pm-arrow">↗</span>
  </div>`;
}

function renderDrawerInscriptions(y, container) {
  const rawInscrs = window.INSCRIPTIONS_ATLAS?.records || [];
  container.innerHTML = `
    <div class="drawer-inscr-header">
      <label class="switch-label">
        <input type="checkbox" id="drawerInscrToggle" ${atlasState.layers.inscriptions ? 'checked' : ''}>
        <span>Show Inscriptions on Map</span>
      </label>
      <p class="inscr-hint">${esc(t('inscriptionsLayerNote'))}</p>
    </div>
    <div class="drawer-inscr-list">
      ${rawInscrs.slice(0, 30).map(r => `
        <div class="inscr-mini-card" data-inscr="${r.record_id}">
          <div class="inscr-meta">
            <span class="inscr-tag">${esc(r.record_id)}</span>
            <span class="inscr-date">${esc(r.date_display)}</span>
          </div>
          <strong>${esc(r.inscription_name)}</strong>
          <small>${esc(r.king_or_named_person || '')} · ${esc(r.present_place || r.findspot || '')}</small>
          <p>${esc(r.event_or_recorded_subject || '')}</p>
        </div>
      `).join('')}
    </div>
  `;

  const toggle = $('drawerInscrToggle');
  if (toggle) {
    toggle.onchange = e => {
      atlasState.layers.inscriptions = e.target.checked;
      document.querySelector('.atlas-pill.inscr-pill')?.classList.toggle('active', atlasState.layers.inscriptions);
      paintInscriptions(atlasState.year);
    };
  }

  container.querySelectorAll('[data-inscr]').forEach(card => {
    card.onclick = () => {
      const rec = rawInscrs.find(r => r.record_id === card.dataset.inscr);
      if (rec && rec.latitude && rec.longitude) {
        atlasState.selectedInscriptionId = rec.record_id;
        atlasState.layers.inscriptions = true;
        document.querySelector('.atlas-pill.inscr-pill')?.classList.add('active');
        paintInscriptions(atlasState.year);
        flyTo(+rec.latitude, +rec.longitude, 4.5);
      }
    };
  });
}

/* Smooth Fly-To Camera Animation */
let cameraAnim = null;
function flyTo(lat, lon, targetZoom = 3.5) {
  const svg = $('atlasSvg');
  if (!svg) return;

  const targetW = W / targetZoom, targetH = H / targetZoom;
  const cx = +X(lon), cy = +Y(lat);
  const targetX = Math.max(0, Math.min(W - targetW, cx - targetW / 2));
  const targetY = Math.max(0, Math.min(H - targetH, cy - targetH / 2));

  cancelAnimationFrame(cameraAnim);
  const startVB = { ...atlasState.viewBox };
  const startTime = performance.now();
  const duration = 650; // ms

  function step(time) {
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);

    const curX = startVB.x + (targetX - startVB.x) * ease;
    const curY = startVB.y + (targetY - startVB.y) * ease;
    const curW = startVB.w + (targetW - startVB.w) * ease;
    const curH = startVB.h + (targetH - startVB.h) * ease;

    atlasState.viewBox = { x: curX, y: curY, w: curW, h: curH };
    svg.setAttribute('viewBox', `${curX.toFixed(1)} ${curY.toFixed(1)} ${curW.toFixed(1)} ${curH.toFixed(1)}`);

    if (progress < 1) {
      cameraAnim = requestAnimationFrame(step);
    }
  }

  cameraAnim = requestAnimationFrame(step);
}

function resetView() {
  cancelAnimationFrame(cameraAnim);
  const svg = $('atlasSvg');
  if (!svg) return;

  const startTime = performance.now();
  const startVB = { ...atlasState.viewBox };
  const targetVB = { x: 0, y: 0, w: W, h: H };
  const duration = 500;

  function step(time) {
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);

    const curX = startVB.x + (targetVB.x - startVB.x) * ease;
    const curY = startVB.y + (targetVB.y - startVB.y) * ease;
    const curW = startVB.w + (targetVB.w - startVB.w) * ease;
    const curH = startVB.h + (targetVB.h - startVB.h) * ease;

    atlasState.viewBox = { x: curX, y: curY, w: curW, h: curH };
    svg.setAttribute('viewBox', `${curX.toFixed(1)} ${curY.toFixed(1)} ${curW.toFixed(1)} ${curH.toFixed(1)}`);

    if (progress < 1) {
      cameraAnim = requestAnimationFrame(step);
    }
  }

  cameraAnim = requestAnimationFrame(step);
}

/* Playback loop */
function togglePlayback() {
  atlasState.isPlaying = !atlasState.isPlaying;
  const btn = $('deckPlayBtn');
  const icon = $('playIcon');
  const label = $('playLabel');

  if (btn) btn.classList.toggle('playing', atlasState.isPlaying);
  if (icon) icon.textContent = atlasState.isPlaying ? '❚❚' : '▶';
  if (label) label.textContent = esc(atlasState.isPlaying ? t('pause') : t('play'));

  if (atlasState.isPlaying) {
    clearInterval(atlasState.playTimer);
    atlasState.playTimer = setInterval(() => {
      let nextYear = atlasState.year + 25;
      if (nextYear > 1826) nextYear = 350;
      setYear(nextYear);
    }, 1400);
  } else {
    clearInterval(atlasState.playTimer);
  }
}

function setYear(y) {
  atlasState.year = Math.min(1826, Math.max(350, y));
  renderAtlas();
}

function updateUrlQuery() {
  const q = { y: atlasState.year };
  if (!atlasState.hidePresentDay) q.modern = '1';
  if (atlasState.layers.inscriptions) q.inscr = '1';
  if (atlasState.selectedPithaKey) q.pitha = atlasState.selectedPithaKey;
  setQuery('/map', q);
}

function togglePresentDay() {
  atlasState.hidePresentDay = !atlasState.hidePresentDay;
  const svg = $('atlasSvg');
  if (svg) svg.classList.toggle('hide-present', atlasState.hidePresentDay);

  const pill = $('togglePresentPill');
  if (pill) {
    pill.classList.toggle('active', atlasState.hidePresentDay);
    pill.title = atlasState.hidePresentDay ? t('showPresentDay') : t('hidePresentDay');
    const labelSpan = pill.querySelector('span:last-child');
    if (labelSpan) labelSpan.textContent = atlasState.hidePresentDay ? t('historicalOnly') : t('modernOverlay');
  }

  const hudBtn = $('hudPresentBtn');
  if (hudBtn) {
    hudBtn.classList.toggle('active', atlasState.hidePresentDay);
    hudBtn.title = atlasState.hidePresentDay ? 'Showing antique historical view (click to reveal modern districts)' : 'Showing modern district overlay (click to hide)';
    const icon = hudBtn.querySelector('.hud-btn-icon');
    const label = hudBtn.querySelector('.hud-btn-label');
    if (icon) icon.textContent = atlasState.hidePresentDay ? '🏛' : '🗺';
    if (label) label.textContent = atlasState.hidePresentDay ? t('historicalOnly') : t('modernOverlay');
  }

  updateUrlQuery();
}

/* Global Event Listeners for Map, Deck, and Search */
document.addEventListener('click', e => {
  // 1. Milestone Chips
  const chip = e.target.closest('.milestone-chip');
  if (chip) {
    const yr = Number(chip.dataset.year);
    setYear(yr);
    return;
  }

  // 2. Era Jump Tabs
  const eraTab = e.target.closest('.era-tab');
  if (eraTab) {
    const jump = Number(eraTab.dataset.eraJump);
    setYear(jump);
    return;
  }

  // 3. Toggle Present Day Buttons
  if (e.target.closest('#togglePresentPill,#hudPresentBtn')) {
    togglePresentDay();
    return;
  }

  // 4. Layer Bar Pills
  const pill = e.target.closest('.atlas-pill');
  if (pill) {
    const layer = pill.dataset.layer;
    if (layer) {
      atlasState.layers[layer] = !atlasState.layers[layer];
      pill.classList.toggle('active', atlasState.layers[layer]);
      if (layer === 'realms') paintRealms(atlasState.year);
      else if (layer === 'inscriptions') { paintInscriptions(atlasState.year); updateDrawer(atlasState.year); }
      else paintSpots(atlasState.year);
    }
    return;
  }

  // 5. Drawer Toggle Buttons
  if (e.target.closest('#hudDrawerBtn,#drawerCloseBtn')) {
    atlasState.drawerOpen = !atlasState.drawerOpen;
    const drawer = $('atlasDrawer'), btn = $('hudDrawerBtn');
    if (drawer) drawer.classList.toggle('open', atlasState.drawerOpen);
    if (btn) btn.classList.toggle('open', atlasState.drawerOpen);
    return;
  }

  // 6. Drawer Tabs
  const dtab = e.target.closest('.dtab');
  if (dtab) {
    atlasState.drawerTab = dtab.dataset.dtab;
    document.querySelectorAll('.dtab').forEach(b => b.classList.toggle('active', b === dtab));
    updateDrawer(atlasState.year);
    return;
  }

  // 7. Timeline Play / Pause
  if (e.target.closest('#deckPlayBtn')) {
    togglePlayback();
    return;
  }

  // 8. Step Buttons
  if (e.target.closest('#deckStepBack')) {
    setYear(atlasState.year - 25);
    return;
  }
  if (e.target.closest('#deckStepFwd')) {
    setYear(atlasState.year + 25);
    return;
  }

  // 9. Zoom buttons
  if (e.target.closest('#mzin')) {
    const curW = atlasState.viewBox.w, curH = atlasState.viewBox.h;
    const newW = curW / 1.3, newH = curH / 1.3;
    const curX = atlasState.viewBox.x + (curW - newW) / 2;
    const curY = atlasState.viewBox.y + (curH - newH) / 2;
    atlasState.viewBox = { x: curX, y: curY, w: newW, h: newH };
    $('atlasSvg')?.setAttribute('viewBox', `${curX.toFixed(1)} ${curY.toFixed(1)} ${newW.toFixed(1)} ${newH.toFixed(1)}`);
    return;
  }
  if (e.target.closest('#mzout')) {
    const curW = atlasState.viewBox.w, curH = atlasState.viewBox.h;
    const newW = Math.min(W, curW * 1.3), newH = Math.min(H, curH * 1.3);
    const curX = Math.max(0, atlasState.viewBox.x - (newW - curW) / 2);
    const curY = Math.max(0, atlasState.viewBox.y - (newH - curH) / 2);
    atlasState.viewBox = { x: curX, y: curY, w: newW, h: newH };
    $('atlasSvg')?.setAttribute('viewBox', `${curX.toFixed(1)} ${curY.toFixed(1)} ${newW.toFixed(1)} ${newH.toFixed(1)}`);
    return;
  }
  if (e.target.closest('#mzreset')) {
    resetView();
    return;
  }

  // 10. Spot Click
  const spot = e.target.closest('.mspot');
  if (spot) {
    const pid = spot.dataset.pid;
    if (pid && placeById[pid]) {
      const p = placeById[pid];
      atlasState.selectedPlaceId = p.id;
      paintSpots(atlasState.year);
      atlasState.drawerOpen = true;
      atlasState.drawerTab = 'places';
      document.querySelectorAll('.dtab').forEach(b => b.classList.toggle('active', b.dataset.dtab === 'places'));
      $('atlasDrawer')?.classList.add('open');
      $('hudDrawerBtn')?.classList.add('open');
      updateDrawer(atlasState.year);
      flyTo(p.geo[0], p.geo[1], 4.2);
    }
    return;
  }

  // 11. Pīṭha Click on Map
  const pithaGrp = e.target.closest('.mpitha-group');
  if (pithaGrp) {
    const key = pithaGrp.dataset.pitha;
    atlasState.selectedPithaKey = key;
    atlasState.drawerOpen = true;
    atlasState.drawerTab = 'realms';
    document.querySelectorAll('.dtab').forEach(b => b.classList.toggle('active', b.dataset.dtab === 'realms'));
    $('atlasDrawer')?.classList.add('open');
    $('hudDrawerBtn')?.classList.add('open');
    paintRealms(atlasState.year);
    updateDrawer(atlasState.year);
    return;
  }

  // 12. Medieval Realm Click
  const realmGrp = e.target.closest('.mrealm-group');
  if (realmGrp) {
    atlasState.drawerOpen = true;
    atlasState.drawerTab = 'realms';
    document.querySelectorAll('.dtab').forEach(b => b.classList.toggle('active', b.dataset.dtab === 'realms'));
    $('atlasDrawer')?.classList.add('open');
    $('hudDrawerBtn')?.classList.add('open');
    updateDrawer(atlasState.year);
    return;
  }
});

// Slider Input Listener
document.addEventListener('input', e => {
  if (e.target.id === 'deckSlider') {
    setYear(Number(e.target.value));
  }
});

// Mouse Wheel Zoom on Canvas
document.addEventListener('wheel', e => {
  const svg = e.target.closest('#atlasSvg');
  if (!svg) return;
  e.preventDefault();

  const rect = svg.getBoundingClientRect();
  const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
  const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;

  const curW = atlasState.viewBox.w, curH = atlasState.viewBox.h;
  const newW = Math.max(120, Math.min(W * 1.5, curW / zoomFactor));
  const newH = Math.max(70, Math.min(H * 1.5, curH / zoomFactor));

  // Focus on mouse cursor
  const mouseSvgX = atlasState.viewBox.x + (mouseX / rect.width) * curW;
  const mouseSvgY = atlasState.viewBox.y + (mouseY / rect.height) * curH;

  const newX = mouseSvgX - (mouseX / rect.width) * newW;
  const newY = mouseSvgY - (mouseY / rect.height) * newH;

  atlasState.viewBox = { x: newX, y: newY, w: newW, h: newH };
  svg.setAttribute('viewBox', `${newX.toFixed(1)} ${newY.toFixed(1)} ${newW.toFixed(1)} ${newH.toFixed(1)}`);
}, { passive: false });

// Pan Dragging
let isDragging = false, dragStart = { x: 0, y: 0 };
document.addEventListener('mousedown', e => {
  const svg = e.target.closest('#atlasSvg');
  if (!svg || e.button !== 0) return;
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  svg.classList.add('panning');
});
document.addEventListener('mousemove', e => {
  // 1. Tooltip positioning
  const spot = e.target.closest('.mspot');
  const tip = $('atlasTooltip');
  if (spot && tip) {
    const pid = spot.dataset.pid;
    const p = pid ? placeById[pid] : null;
    if (p) {
      const cat = placeCategory(p);
      const icon = cat === 'capital' ? '👑' : cat === 'fort' ? '⚔' : cat === 'sacred' ? '🛕' : '📍';
      tip.hidden = false;
      tip.style.left = `${e.clientX + 14}px`;
      tip.style.top = `${e.clientY + 14}px`;
      tip.innerHTML = `
        <div class="tip-badge">${icon} ${esc(p.cat)}</div>
        <strong>${esc(lang === 'as' && p.name_as ? p.name_as : p.name)}</strong>
        ${!atlasState.hidePresentDay && p.present ? `<small class="tip-sub">${esc(p.present)}</small>` : ''}
        <p class="tip-desc">${esc(p.summary || p.desc || '')}</p>
        <span class="tip-action">${esc(t('clickToFocus'))}</span>
      `;
      return;
    }
  } else if (tip) {
    const pithaGrp = e.target.closest('.mpitha-group');
    if (pithaGrp) {
      const key = pithaGrp.dataset.pitha;
      const info = PITHA_INFO[key];
      if (info) {
        tip.hidden = false;
        tip.style.left = `${e.clientX + 14}px`;
        tip.style.top = `${e.clientY + 14}px`;
        tip.innerHTML = `
          <div class="tip-badge" style="background:${PITHA_COLORS[key]}25; color:${PITHA_COLORS[key]}">👑 ${esc(t('kamarupaProvinces'))}</div>
          <strong style="color:${PITHA_COLORS[key]}">${esc(lang === 'as' ? info.name_as : info.name)}</strong>
          <small class="tip-sub">${esc(lang === 'as' ? info.span_as : info.span)}</small>
          <p class="tip-desc">${esc(lang === 'as' ? info.zone_as || info.zone : info.zone)}</p>
          <span class="tip-action">${esc(t('clickToFocus'))}</span>
        `;
        return;
      }
    }
    tip.hidden = true;
  }

  // 2. Pan Move
  if (!isDragging) return;
  const svg = $('atlasSvg');
  if (!svg) return;

  const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
  dragStart = { x: e.clientX, y: e.clientY };

  const rect = svg.getBoundingClientRect();
  const scaleX = atlasState.viewBox.w / rect.width, scaleY = atlasState.viewBox.h / rect.height;

  atlasState.viewBox.x -= dx * scaleX;
  atlasState.viewBox.y -= dy * scaleY;
  svg.setAttribute('viewBox', `${atlasState.viewBox.x.toFixed(1)} ${atlasState.viewBox.y.toFixed(1)} ${atlasState.viewBox.w.toFixed(1)} ${atlasState.viewBox.h.toFixed(1)}`);
});
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    $('atlasSvg')?.classList.remove('panning');
  }
});

// Touch pan & pinch zoom
let touchStartDist = 0;
document.addEventListener('touchstart', e => {
  const svg = e.target.closest('#atlasSvg');
  if (!svg) return;
  if (e.touches.length === 1) {
    isDragging = true;
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  }
});
document.addEventListener('touchmove', e => {
  const svg = $('atlasSvg');
  if (!svg) return;
  if (isDragging && e.touches.length === 1) {
    const dx = e.touches[0].clientX - dragStart.x, dy = e.touches[0].clientY - dragStart.y;
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    const rect = svg.getBoundingClientRect();
    const scaleX = atlasState.viewBox.w / rect.width, scaleY = atlasState.viewBox.h / rect.height;
    atlasState.viewBox.x -= dx * scaleX;
    atlasState.viewBox.y -= dy * scaleY;
    svg.setAttribute('viewBox', `${atlasState.viewBox.x.toFixed(1)} ${atlasState.viewBox.y.toFixed(1)} ${atlasState.viewBox.w.toFixed(1)} ${atlasState.viewBox.h.toFixed(1)}`);
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    const factor = dist / (touchStartDist || dist);
    touchStartDist = dist;
    const curW = atlasState.viewBox.w, curH = atlasState.viewBox.h;
    const newW = curW / factor, newH = curH / factor;
    atlasState.viewBox.x += (curW - newW) / 2;
    atlasState.viewBox.y += (curH - newH) / 2;
    atlasState.viewBox.w = newW;
    atlasState.viewBox.h = newH;
    svg.setAttribute('viewBox', `${atlasState.viewBox.x.toFixed(1)} ${atlasState.viewBox.y.toFixed(1)} ${newW.toFixed(1)} ${newH.toFixed(1)}`);
  }
}, { passive: false });
document.addEventListener('touchend', () => { isDragging = false; touchStartDist = 0; });

/* Universal Search Engine (Header) */
const sForm = $('searchForm'), sIn = $('hq'), sSugg = $('searchSuggestions');
if (sIn && sIn.addEventListener && sSugg) {
  sIn.addEventListener('input', () => {
    const q = sIn.value.trim().toLowerCase();
    if (!q) { sSugg.hidden = true; sSugg.innerHTML = ''; return; }

    const matchedPlaces = places.filter(p => (p.name + ' ' + (p.name_as || '') + ' ' + (p.present || '') + ' ' + p.cat).toLowerCase().includes(q)).slice(0, 6);
    const matchedRealms = realms.filter(r => (r.name + ' ' + r.polity).toLowerCase().includes(q)).slice(0, 4);
    const matchedChars = chars.filter(c => (c.name + ' ' + (c.name_as || '') + ' ' + c.role).toLowerCase().includes(q)).slice(0, 4);

    if (!matchedPlaces.length && !matchedRealms.length && !matchedChars.length) {
      sSugg.hidden = false;
      sSugg.innerHTML = `<div class="sugg-empty">No results matching "${esc(q)}"</div>`;
      return;
    }

    let html = '';
    if (matchedPlaces.length) {
      html += `<div class="sugg-group"><div class="sugg-header">PLACES &amp; CAPITALS</div>` +
        matchedPlaces.map(p => `
          <button type="button" class="sugg-item" data-pick-place="${p.id}">
            <span class="sugg-icon">📍</span>
            <div><strong>${esc(p.name)}</strong> <small>${esc(p.cat || '')} · ${esc(p.present || '')}</small></div>
          </button>
        `).join('') + `</div>`;
    }
    if (matchedRealms.length) {
      html += `<div class="sugg-group"><div class="sugg-header">KINGDOMS &amp; REALMS</div>` +
        matchedRealms.map(r => `
          <button type="button" class="sugg-item" data-pick-realm="${r.id}" data-realm-yr="${r.start}">
            <span class="sugg-icon">🏰</span>
            <div><strong>${esc(r.name)}</strong> <small>${esc(r.label || '')}</small></div>
          </button>
        `).join('') + `</div>`;
    }
    if (matchedChars.length) {
      html += `<div class="sugg-group"><div class="sugg-header">RULERS &amp; FIGURES</div>` +
        matchedChars.map(c => `
          <button type="button" class="sugg-item" data-pick-char="${c.id}" data-char-yr="${c.reign_start || c.sort_year}">
            <span class="sugg-icon">👑</span>
            <div><strong>${esc(c.name)}</strong> <small>${esc(c.role || '')}</small></div>
          </button>
        `).join('') + `</div>`;
    }

    sSugg.hidden = false;
    sSugg.innerHTML = html;
  });

  sSugg.addEventListener('click', e => {
    const pBtn = e.target.closest('[data-pick-place]');
    if (pBtn) {
      const p = placeById[pBtn.dataset.pickPlace];
      sSugg.hidden = true;
      sIn.value = '';
      if (p && p.geo) {
        atlasState.selectedPlaceId = p.id;
        paintSpots(atlasState.year);
        flyTo(p.geo[0], p.geo[1], 4.5);
      }
      return;
    }

    const rBtn = e.target.closest('[data-pick-realm]');
    if (rBtn) {
      const yr = Number(rBtn.dataset.realmYr);
      sSugg.hidden = true;
      sIn.value = '';
      if (yr) setYear(yr);
      return;
    }

    const cBtn = e.target.closest('[data-pick-char]');
    if (cBtn) {
      const yr = Number(cBtn.dataset.charYr);
      sSugg.hidden = true;
      sIn.value = '';
      if (yr) setYear(yr);
      return;
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.atlas-search-box')) sSugg.hidden = true;
  });
}

/* Secondary Views: Kings, Timeline, Characters, Scenes, About, Licence */
function viewKings(dynId) {
  const dynasties = [...new Set(chars.map(c => c.group || c.dynasty).filter(Boolean))];
  const activeDyn = dynId || dynasties[0];
  const list = chars.filter(c => (c.group || c.dynasty) === activeDyn);

  return `<div class="content-view-container">
    <div class="content-header">
      <h1>${esc(t('kings'))}</h1>
      <p class="content-sub">Dynasties and sovereign rulers of Assam from Pushyavarman to Purandar Singha.</p>
      <div class="dynasty-pills">
        ${dynasties.map(d => `<a href="#/kings/${encodeURIComponent(d)}" class="dyn-pill ${d === activeDyn ? 'active' : ''}">${esc(d)}</a>`).join('')}
      </div>
    </div>
    <div class="rulers-grid">
      ${list.map(c => `
        <div class="ruler-card ${hc(house(c))}">
          <div class="ruler-card-head">
            <span class="ruler-swatch"></span>
            <div>
              <h3><a href="#/c/${c.id}">${esc(nm(c))}</a></h3>
              <span class="ruler-dates">${esc(c.label || '')}</span>
            </div>
          </div>
          <p class="ruler-role">${esc(c.role || '')}</p>
          <p class="ruler-summary">${esc(c.summary || '')}</p>
          ${c.reign_start ? `<button type="button" class="ruler-map-jump" onclick="location.hash='#/map?y=${c.reign_start}'">📍 View on Map (${c.reign_start} CE)</button>` : ''}
        </div>
      `).join('')}
    </div>
  </div>`;
}

function viewTimeline() {
  return `<div class="content-view-container">
    <div class="content-header">
      <h1>${esc(t('timeline'))}</h1>
      <p class="content-sub">Pivotal geopolitical epochs, treaties, and turning points in Assam's history.</p>
    </div>
    <div class="timeline-vertical-list">
      ${MILESTONES.map(m => `
        <div class="timeline-epoch-card">
          <div class="epoch-badge-col">
            <span class="epoch-year-badge">${m.year} CE</span>
            <div class="epoch-line"></div>
          </div>
          <div class="epoch-content-col">
            <span class="epoch-dynasty">${esc(m.dynasty)}</span>
            <h2>${esc(lang === 'as' ? m.title_as : m.title)}</h2>
            <p>${esc(lang === 'as' ? m.headline_as : m.headline)}</p>
            <button type="button" class="epoch-explore-btn" onclick="location.hash='#/map?y=${m.year}'">Explore ${m.year} CE in Historical Atlas ↗</button>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

function viewAbout() {
  return `<div class="content-view-container">
    <div class="content-header">
      <h1>${esc(t('about'))}</h1>
      <p class="content-sub">Cartographic methods, primary sources, and credits.</p>
    </div>
    <div class="prose-content">
      <h2>Axom Historical Atlas</h2>
      <p>The Axom Historical Atlas is a specialized open-source interactive cartographic platform dedicated to visualizing the evolution of Assam's kingdoms, frontiers, capitals, and historical landscapes across 1,500 years (350–1826 CE).</p>
      
      <h2>Geographical Reconstruction</h2>
      <p>Kingdom territories are derived from natural boundary rivers and mountain chains documented in royal epigraphs, Persian chronicles (Akbarnama, Baharistan-i-Ghaibi, Fathiya-i-Ibriyyah), the Ahom Buranjis, and British frontier surveys. Shaded polygons are intersected with the physical topography of the Brahmaputra Valley.</p>

      <h2>The Four Pīṭhas of Ancient Kāmarūpa</h2>
      <p>In classical texts (Kalika Purana, Yogini Tantra, Hara-Gauri Samvada), the ancient kingdom of Kāmarūpa is divided into four sacred river-bounded provinces: Ratnapīṭha (Karatoyā to Sankosh), Kāmapīṭha (Sankosh to Rupahi/Bornadi), Suvarṇapīṭha (Bornadi to Bharali), and Saumārapīṭha (Bharali to Dikkaravasini). These are seamlessly integrated into the Kāmarūpa kingdom layer.</p>

      <h2>Primary Sources &amp; Literature</h2>
      <ul>
        <li>Dr. M. M. Sharma, <em>Inscriptions of Ancient Assam</em>, Gauhati University, 1978.</li>
        <li>Sir Edward Gait, <em>A History of Assam</em>, 1906.</li>
        <li>Dr. S. K. Bhuyan, <em>Anglo-Assamese Relations</em> and <em>Tungkhungia Buranji</em>.</li>
        <li>B. K. Kakati, <em>The Mother Goddess Kamakhya</em>.</li>
        <li>D. C. Sircar, <em>The Śākta Pīṭhas</em>.</li>
      </ul>
    </div>
  </div>`;
}

function viewLicence() {
  return `<div class="content-view-container">
    <div class="content-header">
      <h1>Licence and Credits</h1>
    </div>
    <div class="prose-content">
      <p>Research, texts, and cartographic boundaries are published under Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0). Code is published under PolyForm Noncommercial 1.0.0.</p>
    </div>
  </div>`;
}

/* Router */
function setNav(active) {
  const nav = $('nav');
  if (nav) {
    nav.innerHTML = [
      ['map', t('atlas')],
      ['timeline', t('timeline')],
      ['kings', t('kings')],
      ['about', t('about')]
    ].map(([p, label]) => `<a href="#/${p}" class="nav-item ${active === p ? 'active' : ''}">${esc(label)}</a>`).join('');
  }

  if ($('brandName')) $('brandName').textContent = t('brand');
  if ($('brandSub')) $('brandSub').textContent = t('brandSub');
  if ($('langBtn')) $('langBtn').textContent = lang === 'as' ? 'English' : 'অসমীয়া';
  if (sIn) sIn.placeholder = t('searchPh');
  if (document.documentElement) document.documentElement.lang = lang === 'as' ? 'as' : 'en';
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '') || 'map';
  const [path, queryStr] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(queryStr || '');
  return { parts, q };
}

function setQuery(path, params) {
  const q = new URLSearchParams(params).toString();
  const hash = '#' + path + (q ? '?' + q : '');
  if (location.hash !== hash) {
    history.replaceState(null, '', hash);
  }
}

function route(keepScroll) {
  const { parts, q } = parseHash();
  const top = parts[0] || 'map';
  let html = '', active = top, title = t('brand');

  if (top === 'kings') {
    html = viewKings(parts[1]);
    title = `${t('kings')} · ${t('brand')}`;
  } else if (top === 'timeline') {
    html = viewTimeline();
    title = `${t('timeline')} · ${t('brand')}`;
  } else if (top === 'about') {
    html = viewAbout();
    title = `${t('about')} · ${t('brand')}`;
  } else if (top === 'licence') {
    html = viewLicence();
    title = `Licence · ${t('brand')}`;
  } else {
    // Default to Historical Atlas
    active = 'map';
    html = viewMap(q);
    title = `${t('atlas')} · ${t('brand')}`;
  }

  document.body.classList.toggle('mappage', active === 'map');
  setNav(active);
  $('main').innerHTML = html;
  document.title = title;

  if (active !== 'map' && keepScroll !== true) window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => route());

const langBtn = $('langBtn');
if (langBtn) {
  langBtn.onclick = () => {
    lang = lang === 'as' ? 'en' : 'as';
    try { localStorage.setItem('lang', lang); } catch {}
    route(true);
  };
}

// Initial invocation
route();

})();
