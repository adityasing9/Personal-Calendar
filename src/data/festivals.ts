import { Festival } from '../types';

export const INITIAL_FESTIVALS: Festival[] = [
  // 2026 Festivals
  {
    id: 'fest-2026-makar-sankranti',
    name: 'Makar Sankranti / Maghe Sankranti',
    date: '2026-01-14',
    calendarType: 'both',
    region: 'India & Nepal',
    description: 'Transition of the Sun into Makara rashi (Capricorn). Celebrated with til laddu, ghee, chaku, and khichdi.',
    isHoliday: true
  },
  {
    id: 'fest-2026-vasant-panchami',
    name: 'Vasant Panchami / Saraswati Puja',
    date: '2026-01-23',
    calendarType: 'both',
    region: 'India & Nepal',
    description: 'Worship of Goddess Saraswati, patron of wisdom, learning, music, and arts. Marks the advent of spring.',
    isHoliday: true
  },
  {
    id: 'fest-2026-maha-shivaratri',
    name: 'Maha Shivaratri',
    date: '2026-02-15',
    calendarType: 'both',
    region: 'India & Nepal (Pashupatinath)',
    description: 'The Great Night of Shiva. Major celebration with fasting, night vigils, and pilgrimage to Shiva shrines.',
    isHoliday: true
  },
  {
    id: 'fest-2026-holi',
    name: 'Holi / Fagu Purnima',
    date: '2026-03-04',
    calendarType: 'both',
    region: 'India & Nepal (Hills & Terai)',
    description: 'Festival of colors, love, and spring victory of good over evil. Celebrated with gulal and music.',
    isHoliday: true
  },
  {
    id: 'fest-2026-nepali-new-year',
    name: 'Nepali New Year (Nawa Barsha 2083 BS)',
    date: '2026-04-14',
    calendarType: 'nepali',
    region: 'Nepal',
    description: 'Baisakh 1, 2083 Bikram Sambat. New Year celebrations, Bisket Jatra in Bhaktapur.',
    isHoliday: true
  },
  {
    id: 'fest-2026-ram-navami',
    name: 'Ram Navami',
    date: '2026-04-26',
    calendarType: 'both',
    region: 'India & Nepal (Janakpur)',
    description: 'Celebration of the birth of Lord Rama, the seventh avatar of Vishnu.',
    isHoliday: true
  },
  {
    id: 'fest-2026-buddha-jayanti',
    name: 'Buddha Jayanti / Vesak',
    date: '2026-05-31',
    calendarType: 'both',
    region: 'Nepal (Lumbini, Swayambhu) & India',
    description: 'Celebration of the birth, enlightenment, and parinirvana of Gautama Buddha.',
    isHoliday: true
  },
  {
    id: 'fest-2026-raksha-bandhan',
    name: 'Raksha Bandhan / Janai Purnima / Rakhi',
    date: '2026-08-28',
    calendarType: 'both',
    region: 'India & Nepal',
    description: 'Sacred thread renewal and bond of protection between brothers and sisters. Kwati feast in Nepal.',
    isHoliday: true
  },
  {
    id: 'fest-2026-gai-jatra',
    name: 'Gai Jatra',
    date: '2026-08-29',
    calendarType: 'nepali',
    region: 'Nepal (Kathmandu Valley)',
    description: 'Procession of cows commemorating deceased relatives, accompanied by satire and humor.',
    isHoliday: true
  },
  {
    id: 'fest-2026-krishna-janmashtami',
    name: 'Krishna Janmashtami',
    date: '2026-09-04',
    calendarType: 'both',
    region: 'India & Nepal (Patan Krishna Mandir)',
    description: 'Celebration of the birth of Lord Krishna with midnight puja and Dahi Handi.',
    isHoliday: true
  },
  {
    id: 'fest-2026-teej',
    name: 'Haritalika Teej',
    date: '2026-09-14',
    calendarType: 'nepali',
    region: 'Nepal & Northern India',
    description: 'Women festival of fasting, dancing in red saris, and worship of Lord Shiva and Parvati.',
    isHoliday: true
  },
  {
    id: 'fest-2026-ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    date: '2026-09-14',
    calendarType: 'indian',
    region: 'India',
    description: 'Celebration of the arrival of Lord Ganesha, remover of obstacles.',
    isHoliday: true
  },
  {
    id: 'fest-2026-ghatasthapana',
    name: 'Dashain: Ghatasthapana',
    date: '2026-10-11',
    calendarType: 'nepali',
    region: 'Nepal',
    description: 'First day of Dashain. Sowing of Jamara (sacred barley sprouts) in prayer rooms.',
    isHoliday: true
  },
  {
    id: 'fest-2026-maha-saptami-phulpati',
    name: 'Dashain: Phulpati / Maha Saptami',
    date: '2026-10-17',
    calendarType: 'both',
    region: 'Nepal & India',
    description: 'Bringing sacred flowers and plants into the royal courtyard. Durga Puja begins.',
    isHoliday: true
  },
  {
    id: 'fest-2026-maha-ashtami',
    name: 'Dashain: Maha Ashtami / Kalaratri',
    date: '2026-10-18',
    calendarType: 'both',
    region: 'Nepal & India',
    description: 'Worship of Goddess Durga in her fierce manifestations. Sacred offerings and feasting.',
    isHoliday: true
  },
  {
    id: 'fest-2026-maha-navami',
    name: 'Dashain: Maha Navami',
    date: '2026-10-19',
    calendarType: 'both',
    region: 'Nepal & India',
    description: 'Vishwakarma and equipment puja, Taleju Bhawani temple opened to public.',
    isHoliday: true
  },
  {
    id: 'fest-2026-vijaya-dashami',
    name: 'Dashain: Vijaya Dashami / Dussehra',
    date: '2026-10-20',
    calendarType: 'both',
    region: 'Nepal & India',
    description: 'Tika and Jamara received from elders with blessings. Victory of Durga over Mahishasura and Rama over Ravana.',
    isHoliday: true
  },
  {
    id: 'fest-2026-kojagrat-purnima',
    name: 'Dashain: Kojagrat Purnima',
    date: '2026-10-25',
    calendarType: 'nepali',
    region: 'Nepal',
    description: 'Concluding night of Dashain. Night vigil dedicated to Goddess Mahalakshmi.',
    isHoliday: false
  },
  {
    id: 'fest-2026-tihar-kaag-tihar',
    name: 'Tihar: Kaag Tihar (Crow Day)',
    date: '2026-11-07',
    calendarType: 'nepali',
    region: 'Nepal',
    description: 'First day of Tihar / Yamapanchak. Worship and feeding of crows as messengers of Yama.',
    isHoliday: false
  },
  {
    id: 'fest-2026-tihar-kukur-tihar',
    name: 'Tihar: Kukur Tihar (Dog Day)',
    date: '2026-11-08',
    calendarType: 'nepali',
    region: 'Nepal',
    description: 'Worship of dogs with marigold garlands and treats for their loyalty and guardianship.',
    isHoliday: true
  },
  {
    id: 'fest-2026-laxmi-puja-diwali',
    name: 'Diwali / Deepavali & Laxmi Puja',
    date: '2026-11-09',
    calendarType: 'both',
    region: 'India & Nepal',
    description: 'Festival of Lights. Lighting of diyas, worship of Goddess Lakshmi, Rangoli, and sweets.',
    isHoliday: true
  },
  {
    id: 'fest-2026-govardhan-mha-puja',
    name: 'Govardhan Puja / Mha Puja (Nepal Sambat 1147)',
    date: '2026-11-10',
    calendarType: 'both',
    region: 'India & Nepal (Newar Community)',
    description: 'Worship of Govardhan hill and cows. Newar community worships the inner self (Mha Puja) and marks Nepal Sambat.',
    isHoliday: true
  },
  {
    id: 'fest-2026-bhai-tika-bhai-dooj',
    name: 'Bhai Tika / Bhai Dooj',
    date: '2026-11-11',
    calendarType: 'both',
    region: 'India & Nepal',
    description: 'Sisters pray for brothers long life, applying seven-colored tika and garlanding with Sayapatri (marigold).',
    isHoliday: true
  },
  {
    id: 'fest-2026-chhath-puja',
    name: 'Chhath Puja',
    date: '2026-11-15',
    calendarType: 'both',
    region: 'Nepal (Terai) & India (Bihar/UP)',
    description: 'Veneration of Surya and Chhathi Maiya at riverbanks during sunrise and sunset.',
    isHoliday: true
  },
  {
    id: 'fest-2026-christmas',
    name: 'Christmas',
    date: '2026-12-25',
    calendarType: 'both',
    region: 'Worldwide',
    description: 'Celebration of the nativity of Jesus Christ.',
    isHoliday: true
  }
];

export function getFestivalsForDate(dateStr: string, festivals: Festival[] = INITIAL_FESTIVALS): Festival[] {
  return festivals.filter(f => f.date === dateStr);
}

export function getUpcomingFestivals(fromDateStr: string, limit = 5, festivals: Festival[] = INITIAL_FESTIVALS): Festival[] {
  return festivals
    .filter(f => f.date >= fromDateStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}
