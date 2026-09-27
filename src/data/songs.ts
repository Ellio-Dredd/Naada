import { Song, StrumPattern } from '@/types';

export const STRUM_PATTERNS: Record<string, StrumPattern> = {
  baila_6_8: {
    id: 'baila_6_8',
    name: 'Baila 6/8',
    nameSi: 'බයිලා 6/8',
    timeSignature: '6/8',
    description: '↓ . ↑ ↓ ↑ . (Heavy accents on beats 1 & 4)',
    defaultBpm: 124,
    strokes: [
      { direction: 'down', accent: true }, // Beat 1
      { direction: 'rest' },
      { direction: 'up', accent: false },
      { direction: 'down', accent: true }, // Beat 4
      { direction: 'up', accent: false },
      { direction: 'rest' },
    ],
  },
  calypso_4_4: {
    id: 'calypso_4_4',
    name: 'Calypso 4/4',
    nameSi: 'කැලිප්සෝ 4/4',
    timeSignature: '4/4',
    description: '↓ . ↓ ↑ . ↑ ↓ ↑',
    defaultBpm: 108,
    strokes: [
      { direction: 'down', accent: true }, // 1
      { direction: 'rest' },               // &
      { direction: 'down', accent: false },// 2
      { direction: 'up', accent: true },   // &
      { direction: 'rest' },               // 3
      { direction: 'up', accent: false },  // &
      { direction: 'down', accent: true }, // 4
      { direction: 'up', accent: false },  // &
    ],
  },
  sarala_3_4: {
    id: 'sarala_3_4',
    name: 'Sarala Gee 3/4',
    nameSi: 'සරල ගී 3/4',
    timeSignature: '3/4',
    description: '↓ . ↓ . ↓ . (Gentle waltz strum)',
    defaultBpm: 88,
    strokes: [
      { direction: 'down', accent: true }, // 1
      { direction: 'rest' },
      { direction: 'down', accent: false },// 2
      { direction: 'rest' },
      { direction: 'down', accent: false },// 3
      { direction: 'rest' },
    ],
  },
  pop_4_4: {
    id: 'pop_4_4',
    name: 'Pop Ballad 4/4',
    nameSi: 'පොප් බැලඩ් 4/4',
    timeSignature: '4/4',
    description: '↓ . ↓ ↑ . ↑ ↓ .',
    defaultBpm: 92,
    strokes: [
      { direction: 'down', accent: true },
      { direction: 'rest' },
      { direction: 'down', accent: false },
      { direction: 'up', accent: false },
      { direction: 'rest' },
      { direction: 'up', accent: true },
      { direction: 'down', accent: false },
      { direction: 'rest' },
    ],
  },
};

export const SEED_SONGS: Song[] = [
  {
    id: 'gamen-liyumak',
    title_si: 'ගමෙන් ලියුමක්',
    title_en: 'Gamen Liyumak',
    artist: 'Clarence Wijewardena',
    key: 'G',
    tempo_bpm: 124,
    time_signature: '6/8',
    strum_pattern: 'baila_6_8',
    tags: ['Baila', 'Golden 70s', 'Clarence'],
    content_chordpro: `[Chorus]
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා
[G]ගමෙන් ලියුමක් ඇවිල්ලා මගේ නම [C]ලියලා
[D7]ගමේ සුවඳයි ඒ ලියුමේ [G]ගැවිලා

[Verse 1]
[G]අම්මා ලියලා තියෙන්නේ [C]සනීපෙන් දෝ [G]අහලා
[G]තාත්තා කුඹුරට ගිහින්ලු [D]උදේ පාන්දර [G]නැගිටලා
[Em]නංගී පාසල් යනවලු [Am]හොඳින් ඉගෙන [D]ගන්නවාලු
[D]මල්ලි එළදෙන බලාගන්න [G]පිට්ටනියට යනවාලු

[Verse 2]
[G]ගමේ වැවේ දිය පිරිලා [C]නෙළුම් මල් පි[G]පිලා
[G]අලුත් අවුරුදු එනවාලු [D]ගමට සතුට [G]ගෙනැල්ලා
[Em]මටත් ඉක්මනින්ම ගමට [Am]එන්න කියලා [D]ලියලා
[D]ගමේ අය මා එනතුරු [G]මඟ බලා හිඳිනවාලු`,
    content_singlish: `[Chorus]
[G]Gamen liyumak awilla mage nama [C]liyala
[D]Game suwandai e liyume [G]gawila
[G]Gamen liyumak awilla mage nama [C]liyala
[D7]Game suwandai e liyume [G]gawila

[Verse 1]
[G]Amma liyala thiyenne [C]saneependo [G]ahala
[G]Thaththa kumburata gihinlu [D]ude paandara [G]nagithala
[Em]Nangi paasal yanawalu [Am]hondin igena [D]gannawalu
[D]Malli eladena balaaganna [G]pittaniyata yanawalu

[Verse 2]
[G]Game wawe diya pirila [C]nelum mal pi[G]pila
[G]Aluth awurudu enawalu [D]gamata sathuta [G]genalla
[Em]Matath ikmaninma gamata [Am]enna kiyala [D]liyala
[D]Game aya ma enathuru [G]maga balaa hindinawalu`,
  },
  {
    id: 'ran-kuduwe',
    title_si: 'රන් කූඩුවේ',
    title_en: 'Ran Kuduwe',
    artist: 'Milton Mallawarachchi',
    key: 'C',
    tempo_bpm: 88,
    time_signature: '4/4',
    strum_pattern: 'pop_4_4',
    tags: ['Pop Ballad', 'Love', 'Milton'],
    content_chordpro: `[Chorus]
[C]රන් කූඩුවේ [Am]සිරකරලා
[F]තබා නෑ ඔබේ ආ[G]දරේ
[C]පෙම් චේතනා [Am]මල් පිපිලා
[F]සුවඳයි මගේ ජී[G]විතේ
[F]සදාකාලිකයි [G]මේ ප්‍රේ[C]මේ

[Verse 1]
[C]තරු එළියේ නිල් දිය මත [Em]දිලෙන්නේ
[F]ඔබේ දෙනෙතේ කැළුමයි [G]දැනෙන්නේ
[Am]සඳ පානේ සීතල [Em]සුළඟේ
[F]මුමුණන්නේ අපේ ආ[G]දරේ

[Verse 2]
[C]ජීවිතයේ දුක් කරදර [Em]මැකීලා
[F]සැනසුම ඔබ ගෙනාවා [G]සොයාලා
[Am]කිසිදාක වෙන්වී [Em]නොයා
[F]සිටිමු අපි සතුටින් [G]සදා`,
    content_singlish: `[Chorus]
[C]Ran kuduwe [Am]sirakarala
[F]Thaba na obe aa[G]dare
[C]Pem chethana [Am]mal pipila
[F]Suwandai mage jee[G]withe
[F]Sadakaalikai [G]me pre[C]me

[Verse 1]
[C]Tharu eliye nil diya matha [Em]dilenne
[F]Obe denethe kalumai [G]danenne
[Am]Sanda paane seethala [Em]sulange
[F]Mumunanne ape aa[G]dare

[Verse 2]
[C]Jeewithe duk karadara [Em]makeela
[F]Sanasuma oba genawa [G]soyala
[Am]Kisidaaka wenwee [Em]noya
[F]Sitimu api sathutin [G]sada`,
  },
  {
    id: 'mal-mitak-thiyanna',
    title_si: 'මල් මිටක් තියන්න',
    title_en: 'Mal Mitak Thiyanna',
    artist: 'Kasun Kalhara',
    key: 'Dm',
    tempo_bpm: 78,
    time_signature: '3/4',
    strum_pattern: 'sarala_3_4',
    tags: ['Sarala Gee', 'Acoustic', 'Kasun'],
    content_chordpro: `[Chorus]
[Dm]මල් මිටක් තියන්න [Gm]ඔබේ අතේ
[C]මට තහනම් නෑ [F]නොවේ
[Dm]එහෙත් මම දනිමි [Gm]සොඳුරියෙ
[Bb]ඔබ මගේ ලොව [A7]නොවේ
[Bb]ඔබ මගේ ලොව [A7]නො[Dm]වේ

[Verse 1]
[Dm]නෙතඟ කඳුලැලි [Gm]සඟවාගෙන
[C]සිනහවෙන් මට [F]සංග්‍රහ කර
[Bb]යන්න අවසර [Gm]දෙන්න සොඳුරියෙ
[A7]ඔබේ ලොවින් මට [Dm]යන්නට

[Verse 2]
[Dm]මගේ හදවත [Gm]ගැහෙන රාවය
[C]ඔබට නෑසෙන [F]තරම් ඈතයි
[Bb]නමුදු සිතුවිලි [Gm]ඔබේ නාමෙන්
[A7]මියෙන තුරා පව[Dm]තී`,
    content_singlish: `[Chorus]
[Dm]Mal mitak thiyanna [Gm]obe athe
[C]Mata thahanam na [F]nowe
[Dm]Eheth mama danimi [Gm]sonduriye
[Bb]Oba mage lowa [A7]nowe
[Bb]Oba mage lowa [A7]no[Dm]we

[Verse 1]
[Dm]Nethanga kanduleli [Gm]sangawaagena
[C]Sinahawen mata [F]sangraha kara
[Bb]Yanna awasara [Gm]denna sonduriye
[A7]Obe lowin mata [Dm]yannata

[Verse 2]
[Dm]Mage hadawatha [Gm]gahena raawaya
[C]Obata naasena [F]tharam aathai
[Bb]Namudu sithuwili [Gm]obe naamen
[A7]Miyena thuraa pawa[Dm]thee`,
  },
  {
    id: 'dawasak-pala-nathi',
    title_si: 'දවසක් පැල නැති හේනේ',
    title_en: 'Dawasak Pala Nathi Hene',
    artist: 'Gunadasa Kapuge',
    key: 'Am',
    tempo_bpm: 82,
    time_signature: '4/4',
    strum_pattern: 'sarala_3_4',
    tags: ['Classical', 'Acoustic', 'Kapuge'],
    content_chordpro: `[Chorus]
[Am]දවසක් පැල නැති හේනේ [G]අකාල මහ වැහි වැටුනා
[F]තුරුලේ හංගාගෙන මා [G]ඔබ තෙමුනා [Am]අම්මේ
[Am]පැල්පත සාදා දුන්නේ [G]අපට සෙවණ සලසන්නයි
[F]කඳුලින් දෙනෙතින් දුටුවේ [G]මගෙ ලොව දිනු[Am]මයි

[Verse 1]
[Am]කුසගින්නේ හඬනා විට [Em]බත් පත මා හට දුන්නේ
[F]ඔබ නොකා හිඳිමින් [G]මට සෙනෙහස දුන්නේ
[Am]අම්මේ ඔබ දෙවියෙක් සේ [Em]මා හද තුළ වැජඹෙන්නේ
[F]මේ භවයේ මතු භවයේ [G]ඔබ මගෙ අම්[Am]මා`,
    content_singlish: `[Chorus]
[Am]Dawasak pala nathi hene [G]akaala maha wahi watuna
[F]Thurule hangaagena ma [G]oba themuna [Am]amme
[Am]Palpatha saada dunne [G]apata sewana salasannai
[F]Kandulin denethin dutuwe [G]mage lowa dinu[Am]mai

[Verse 1]
[Am]Kusaginne handana wita [Em]bath patha ma hata dunne
[F]Oba nokaa hindimin [G]mata senehasa dunne
[Am]Amme oba dewiyek se [Em]ma hada thula wajambenne
[F]Me bhawaye mathu bhawaye [G]oba mage am[Am]ma`,
  },
];
