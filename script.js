'use strict';

// ---------- playlist ----------
// Each song's youtubeId is a verified, real upload (checked before adding).
// Playback runs entirely through YouTube's own embedded player — see disclaimer in index.html.

// Two scenes, matched to the mood of each time-of-day rotation — barber-shop
// mornings, highway-trucker evenings and nights. No video: just a CSS
// background treatment (class on #bgScene) plus an ambient track that only
// loads once the listener opts into background music.
const SCENES = {
  barber: {
    ambient: 'assets/audio/ambience-chatter.mp3',
  },
  truck: {
    ambient: 'assets/audio/highway-ambience.mp3',
  },
};

// Real dashcam-style footage (not illustrated), cycled behind the truck
// scene. Lazy-loaded — see scheduleGifStart — so it never competes with
// the song being ready to play.
const TRUCK_GIFS = [
  'assets/gif/truck-1.gif',
  'assets/gif/truck-2.gif',
  'assets/gif/truck-3.gif',
  'assets/gif/truck-4.gif',
  'assets/gif/truck-5.gif',
  'assets/gif/truck-6.gif',
  'assets/gif/truck-7.gif',
  'assets/gif/truck-8.gif',
  'assets/gif/truck-9.gif',
  'assets/gif/truck-10.gif',
  'assets/gif/truck-11.gif',
];
const GIF_ROTATE_MS = 25000;

const ROTATIONS = {
  morning: {
    label: 'Morning Rotation',
    scene: 'barber',
    songs: [
      { title: 'Tu Cheez Badi Hai Mast Mast', film: 'Mohra (1994)', singers: 'Udit Narayan, Kavita Krishnamurthy', youtubeId: 'fT4vP4PnLxg' },
      { title: 'Didi Tera Devar Deewana', film: 'Hum Aapke Hain Koun (1994)', singers: 'Lata Mangeshkar, S.P. Balasubrahmanyam', youtubeId: 'ZqcDGvCM_w0' },
      { title: 'Kuch Kuch Hota Hai', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'bKZTnnFU9HA' },
      { title: 'Chura Ke Dil Mera', film: 'Main Khiladi Tu Anari (1994)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'Yqj1_V90KJo' },
      { title: 'Dhak Dhak Karne Laga', film: 'Beta (1992)', singers: 'Udit Narayan, Anuradha Paudwal', youtubeId: 'P7i0Z4yDKNM' },
      { title: 'Choli Ke Peeche', film: 'Khalnayak (1993)', singers: 'Alka Yagnik, Ila Arun', youtubeId: 'epYiGd853mQ' },
      { title: 'Radha Kaise Na Jale', film: 'Lagaan (2001)', singers: 'Asha Bhosle, Udit Narayan', youtubeId: 'BlYyNh0Yh08' },
      { title: 'Mehndi Laga Ke Rakhna', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: '-bNwqXvMuB8' },
      { title: 'Bole Chudiyan', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Udit Narayan, Alka Yagnik, Sonu Nigam', youtubeId: 'IBvg3WeqP1U' },
      { title: 'Say Shava Shava', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'ZTARlM0pCP4' },
      { title: 'Dilbar Dilbar', film: 'Sirf Tum (1999)', singers: 'Alka Yagnik', youtubeId: 'BJrHJoCqJKo' },
      { title: 'Kajra Re', film: 'Bunty Aur Babli (2005)', singers: 'Alisha Chinai, Shankar Mahadevan, Javed Ali', youtubeId: '4dsFQFCvVGU' },
      { title: 'Mera Piya Ghar Aaya', film: 'Yaarana (1995)', singers: 'Kavita Krishnamurthy', youtubeId: 'xVViRaALOLM' },
      { title: 'Ye Ladka Hai Allah', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'BE8_rNJOQ-0' },
      { title: 'Chunari Chunari', film: 'Biwi No.1 (1999)', singers: 'Abhijeet, Anuradha Sriram', youtubeId: 'hle-4VS9IR8' },
      { title: 'Sona Sona', film: 'Major Saab (1998)', singers: 'Sudesh Bhosle, Sonu Nigam, Jaspinder Narula', youtubeId: 'K8rNTJcdqLo' },
      { title: 'Le Gayi Le Gayi', film: 'Dil To Pagal Hai (1997)', singers: 'Asha Bhosle', youtubeId: 'dGZb1kv5zW0' },
      { title: 'Mohabbat Ho Gayee Hai', film: 'Baadshah (1999)', singers: 'Abhijeet, Alka Yagnik', youtubeId: 'WSYZBng52h4' },
      { title: 'Ishq Bina', film: 'Taal (1999)', singers: 'Sonu Nigam, Anuradha Sriram, Sujatha Mohan', youtubeId: 'zSCevtX7ud0' },
      { title: 'Taal Se Taal Mila', film: 'Taal (1999)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'OinGHNpnGtc' },
      { title: 'Yeh Kaali Kaali Aankhen', film: 'Baazigar (1993)', singers: 'Kumar Sanu', youtubeId: 'IhKXq5dhTag' },
      { title: 'Apun Bola', film: 'Josh (2000)', singers: 'Abhijeet, Hema Sardesai', youtubeId: 'kky-bGlcM04' },
      { title: 'Jaadu Teri Nazar', film: 'Darr (1993)', singers: 'Udit Narayan', youtubeId: 'n_oP9Onj0r0' },
      { title: 'Ankhiyon Se Goli Maare', film: 'Dulhe Raja (1998)', singers: 'Sonu Nigam, Jaspinder Narula', youtubeId: 'llfkNB3rRTc' },
      { title: 'Chandi Ki Daal Par Sone Ka Mor', film: 'Hello Brother (1999)', singers: 'Salman Khan, Alka Yagnik', youtubeId: 'xMtmHFEwLnI' },
      { title: 'Mangta Hai Kya', film: 'Rangeela (1995)', singers: 'Shwetha Shetty', youtubeId: 'ZchWVw2PhA4' },
      { title: 'Humma Humma', film: 'Bombay (1995)', singers: 'Remo Fernandes', youtubeId: '7Jojcy2siAo' },
      { title: 'Nimbooda Nimbooda', film: 'Hum Dil De Chuke Sanam (1999)', singers: 'Kavita Krishnamurthy', youtubeId: 'YLsIl0G0qlM' },
      { title: 'Dholi Taro Dhol Baaje', film: 'Hum Dil De Chuke Sanam (1999)', singers: 'Kavita Krishnamurthy, Vinod Rathod', youtubeId: 'QR90tJy7tsc' },
      { title: 'Ole Ole', film: 'Yeh Dillagi (1994)', singers: 'Abhijeet', youtubeId: 'hcCvSmjHwGY' },
      { title: 'Kisi Disco Mein Jaaye', film: 'Bade Miyan Chote Miyan (1998)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'J7xP4m5mpN4' },
      { title: 'Sexy Sexy Mujhe Log Bole', film: 'Khuddar (1994)', singers: 'Alisha Chinai', youtubeId: '2ukmYuCkWNI' },
      { title: 'Ghoonghat Ki Aad Se', film: 'Hum Hain Rahi Pyar Ke (1993)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'TRkLyJsoqIU' },
      { title: 'Wah Wah Ramji', film: 'Hum Aapke Hain Koun (1994)', singers: 'Lata Mangeshkar, S.P. Balasubrahmanyam', youtubeId: 'v67otk5uSvk' },
      { title: 'Joote De Do Paise Le Lo', film: 'Hum Aapke Hain Koun (1994)', singers: 'Lata Mangeshkar, S.P. Balasubrahmanyam', youtubeId: 'Plwbv_BzV5U' },
      { title: 'Kya Ada Kya Jalwe', film: 'Shastra (1996)', singers: 'Udit Narayan', youtubeId: 'u8oaz0N0qk0' },
      { title: 'Pardesi Pardesi Jana Nahi', film: 'Raja Hindustani (1996)', singers: 'Udit Narayan, Alka Yagnik, Sapna Awasthi', youtubeId: 'EbfJGsMWSgQ' },
      { title: 'Aati Kya Khandala', film: 'Ghulam (1998)', singers: 'Aamir Khan, Alka Yagnik', youtubeId: '2ZNVf2MvKBo' },
      { title: 'Bumbro Bumbro', film: 'Mission Kashmir (2000)', singers: 'Shankar Mahadevan, Jaspinder Narula, Sunidhi Chauhan', youtubeId: 'PquZBLuFmwA' },
      { title: 'Ladki Badi Anjani Hai', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'WlWlGlvN4L4' },
      { title: 'It\'s Time To Disco', film: 'Kal Ho Naa Ho (2003)', singers: 'Vasundhara Das, KK, Shaan', youtubeId: 'M03GOY5eINg' },
      { title: 'Pretty Woman', film: 'Kal Ho Naa Ho (2003)', singers: 'Shankar Mahadevan, Ravi Khote', youtubeId: '70QpN7DvaK4' },
      { title: 'Koi Na Koi Chahiye', film: 'Deewana (1992)', singers: 'Vinod Rathod', youtubeId: 'euZmH3dMDaE' },
      { title: 'Rangeela Re', film: 'Rangeela (1995)', singers: 'Asha Bhosle, Aditya Narayan', youtubeId: 'i65HIFzIfec' },
      { title: 'Chalo Ishq Ladaaye', film: 'Chalo Ishq Ladaaye (2002)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: '4bFsnGfmLJQ' },
      { title: 'Dola Re Dola', film: 'Devdas (2002)', singers: 'Kavita Krishnamurthy, Shreya Ghoshal, K.K.', youtubeId: 'iZ5UItyEpGE' },
      { title: 'Bunty Aur Babli', film: 'Bunty Aur Babli (2005)', singers: 'Sukhwinder Singh, Jaspinder Narula, Shankar Mahadevan', youtubeId: 'UuIplXLce0w' },
      { title: 'Ek Pal Ka Jeena', film: 'Kaho Naa... Pyaar Hai (2000)', singers: 'Lucky Ali', youtubeId: 'N667Te-bDGM' },
      { title: 'Sajanji Ghar Aaye', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Kumar Sanu, Alka Yagnik, Kavita Krishnamurthy', youtubeId: 'XWmon1qR6pM' },
      { title: 'Koi Kahe Kehta Rahe', film: 'Dil Chahta Hai (2001)', singers: 'Shankar Mahadevan, Shaan, KK', youtubeId: 'ctJI7pCbxAo' },
      { title: 'Chamma Chamma', film: 'China Gate (1998)', singers: 'Alka Yagnik, Shankar Mahadevan, Vinod Rathod', youtubeId: '1-r06KcdMvU' },
      { title: 'Dhoom Machale', film: 'Dhoom (2004)', singers: 'Sunidhi Chauhan', youtubeId: '2uUmHTgT65I' },
      { title: 'Tip Tip Barsa Pani', film: 'Mohra (1994)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: '9u-r5W4WVO4' },
      { title: 'Paas Woh Aane Lage', film: 'Main Khiladi Tu Anari (1994)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'Ki6QlVTzKkU' },
      { title: 'Ek Din Aap', film: 'Yes Boss (1997)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: '90Q5bMN6u2w' },
      { title: 'Sunta Hai Mera Khuda', film: 'Pukar (2000)', singers: 'Udit Narayan, Kavita Krishnamurthy', youtubeId: '3sULzt1AC3I' },
      { title: 'Mera Mulk Mera Desh', film: 'Diljale (1996)', singers: 'Kumar Sanu, Aditya Narayan', youtubeId: 'LA7l3yOZsB4' },
      { title: 'Sarkaye Lo Khatiya', film: 'Raja Babu (1994)', singers: 'Kumar Sanu, Poornima', youtubeId: 'Be_It32jfOQ' },
      { title: 'Kya Kool Hai Hum', film: 'Kya Kool Hain Hum (2005)', singers: 'Kunal Ganjawala, KK', youtubeId: 'equtam_94XI' },
      { title: 'Kehna Hi Kya', film: 'Bombay (1995)', singers: 'K.S. Chithra', youtubeId: 'MmEThwjuXu8' },
      { title: 'Aaja Mahiya', film: 'Fiza (2000)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'VGzsNUY840Q' },
      { title: 'Tere Pyar Mein Dil Deewana', film: 'Coolie No. 1 (1995)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'fm_p_8NAiK4' },
      { title: 'Husn Hai Suhana', film: 'Coolie No. 1 (1995)', singers: 'Chandana Dixit, Abhijeet', youtubeId: 'svZPpCAxTQM' },
      { title: 'Kya Majnu Kya Ranjha', film: 'Coolie No. 1 (1995)', singers: 'Sadhana Sargam, Kumar Sanu', youtubeId: 'Dx4NgvgV2Ik' },
      { title: 'Yunhi Kat Jaayega', film: 'Hum Hain Rahi Pyar Ke (1993)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'ui9UFX3KSQ0' },
      { title: 'Aaye Ho Meri Zindagi Mein', film: 'Raja Hindustani (1996)', singers: 'Udit Narayan', youtubeId: 'CbFjVMEZA5k' },
      { title: 'Pucho Zara Pucho', film: 'Raja Hindustani (1996)', singers: 'Alka Yagnik, Kumar Sanu', youtubeId: 'E4HtYArLiwc' },
      { title: 'Tere Ishq Mein Naachenge', film: 'Raja Hindustani (1996)', singers: 'Kumar Sanu, Alisha Chinai', youtubeId: 'sBrxR0J6Th0' },
      { title: 'Haan Mujhe Pyaar Hua Allah Miya', film: 'Judaai (1997)', singers: 'Alka Yagnik, Abhijeet', youtubeId: 'E154_cpP6tw' },
      { title: 'Pyaar Pyaar Karte Karte', film: 'Judaai (1997)', singers: 'Alka Yagnik, Abhijeet, Sapna Mukherjee', youtubeId: 'zkm9B_Dgr4M' },
      { title: 'Kitna Pyaara Tujhe Rabne Banaya', film: 'Raja Hindustani (1996)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'wV8njoRVefQ' },
      { title: 'Soni Soni', film: 'Mohabbatein (2000)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'OpLD97fG9Hw' },
      { title: 'Dekho Dekho Jaanam', film: 'Ishq (1997)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'OcD9cEPlW_M' },
      { title: 'Mr. Lova Lova', film: 'Ishq (1997)', singers: 'Udit Narayan, Abhijeet', youtubeId: 'UTFyDM_mR_c' },
      { title: 'It Happens Only In India', film: 'Pardesi Babu (1998)', singers: 'Anand Raj Anand', youtubeId: 'LyH2uYEM_7k' },
      { title: 'Apni To Nikal Padi', film: 'Vaastav (1999)', singers: 'Kumar Sanu, Atul Kale', youtubeId: 'fOnEAwLjG2Q' },
      { title: 'Ankh Milaoongi', film: 'Fiza (2000)', singers: 'Asha Bhosle', youtubeId: 'HU-mZYPhXfo' },
      { title: 'Teri Payaliya Shor Machaye', film: 'Deewana (1992)', singers: 'Kumar Sanu', youtubeId: 'QfqTQKTeUPg' },
      { title: 'Baazigar O Baazigar', film: 'Baazigar (1993)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'PUO7_Gi6ipg' },
      { title: 'Aa Jaana Aa Jaana', film: 'Coolie No. 1 (1995)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'qDeRNyjeNqw' },
      { title: 'Jeth Ki Dopahri Mein', film: 'Coolie No. 1 (1995)', singers: 'Poornima, Kumar Sanu', youtubeId: 'uWEzo27fsKA' },
      { title: 'Kitaben Bahut Si', film: 'Baazigar (1993)', singers: 'Asha Bhosle, Vinod Rathod', youtubeId: 'ogNBUvwT0hc' },
      { title: 'Aisi Deewangi Dekhi Nahi Kahin', film: 'Deewana (1992)', singers: 'Alka Yagnik, Vinod Rathod', youtubeId: 'e2MIkhaOsPE' },
      { title: 'Chhote Chhote Bhaiyon Ke', film: 'Hum Saath Saath Hain (1999)', singers: 'Kumar Sanu, Kavita Krishnamurthy, Udit Narayan', youtubeId: 'oW206FT_Qho' },
      { title: 'Ghar Aaja Pardesi', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Pamela Chopra, Manpreet Kaur', youtubeId: 'utwhUTxyOjQ' },
      { title: 'Channe Ke Khet Mein', film: 'Anjaam (1994)', singers: 'Poornima', youtubeId: 'ti3-y50DsMk' },
      { title: 'Sun Meri Banno', film: 'Anjaam (1994)', singers: 'Alka Yagnik', youtubeId: 'IyyRfSbG7No' },
      { title: 'Main Kolhapur Se Aayi Hoon', film: 'Anjaam (1994)', singers: 'Sadhana Sargam', youtubeId: '3KkUdeZkZp8' },
      { title: 'Aa Meri Life', film: 'Kahin Pyaar Na Ho Jaaye (2000)', singers: 'Kamal Khan, Suneeta Rao', youtubeId: 'N0yh5GoutV4' },
      { title: 'Zoom Boombura', film: 'Tum Bin (2001)', singers: 'Sonu Nigam', youtubeId: '2ypqr-QAPBA' },
      { title: 'Gale Mein Laal Taai', film: 'Hum Tumhare Hain Sanam (2002)', singers: 'Kumar Sanu, Bela Sulakhe', youtubeId: '_GDLlZ06Hc4' },
      { title: 'Kahe Chhed Mohe', film: 'Devdas (2002)', singers: 'Kavita Krishnamurthy', youtubeId: 'shVS2PkqRMI' },
      { title: 'Chalak Chalak', film: 'Devdas (2002)', singers: 'Shreya Ghoshal, Udit Narayan, Vinod Rathod', youtubeId: 'qHrEi5I4H7M' },
      { title: 'You Are My Soniya', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'DwUgoUhgzLo' },
      { title: 'Chand Sitare Phool Aur Khushboo', film: 'Kaho Naa... Pyaar Hai (2000)', singers: 'Kumar Sanu', youtubeId: 'a6SCEu_fEKM' },
      { title: 'Samdhi Samdhan', film: 'Hum Aapke Hain Koun (1994)', singers: 'Lata Mangeshkar, Kumar Sanu', youtubeId: 'fuqaEqvBy5s' },
      { title: 'Maiyya Yashoda', film: 'Hum Saath Saath Hain (1999)', singers: 'Anuradha Paudwal, Alka Yagnik', youtubeId: 'K38OA13ZBiY' },
      { title: 'Rukmani Rukmani', film: 'Roja (1992)', singers: 'Baba Sehgal, Shweta Shetty', youtubeId: 'Emgk6wnsXrk' },
      { title: 'Main Deewana Hoon', film: 'Yeh Dillagi (1994)', singers: 'Pankaj Udhas', youtubeId: 'eCnPtpQ0zuQ' },
      { title: 'Lagi Lagi Hai Yeh Dil Ki Lagi', film: 'Yeh Dillagi (1994)', singers: 'Abhijeet, Sadhana Sargam', youtubeId: 'xUU-cub6E10' },
    ],
  },
  afternoon: {
    label: 'Afternoon Rotation',
    scene: 'barber',
    songs: [
      { title: 'Tu Cheez Badi Hai Mast Mast', film: 'Mohra (1994)', singers: 'Udit Narayan, Kavita Krishnamurthy', youtubeId: 'DHWVkvhQB3U' },
      { title: 'Tip Tip Barsa Paani', film: 'Mohra (1994)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'HyKuXycQXkg' },
      { title: 'Chaiyya Chaiyya', film: 'Dil Se (1998)', singers: 'Sukhwinder Singh, Sapna Awasthi', youtubeId: 'APo73rlxWaE' },
      { title: 'Pehla Nasha', film: 'Jo Jeeta Wohi Sikandar (1992)', singers: 'Udit Narayan, Sadhana Sargam', youtubeId: 'SBfPs-PMGTA' },
      { title: 'Tujhe Dekha Toh', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Lata Mangeshkar, Kumar Sanu', youtubeId: 'cNV5hLSa9H8' },
      { title: 'Chalte Chalte', film: 'Chalte Chalte (2003)', singers: 'Abhijeet, Alka Yagnik', youtubeId: 'm3gs5_y6N9M' },
      { title: 'Ek Ladki Ko Dekha Toh Aisa Laga', film: '1942: A Love Story (1994)', singers: 'Kumar Sanu', youtubeId: 'fTauOK8J-U8' },
      { title: 'Tum Paas Aaye Yun Muskuraye', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'LxpcP6rCYBk' },
      { title: 'Koi Mil Gaya', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Kavita Krishnamurthy, Udit Narayan, Alka Yagnik', youtubeId: 'Jzd4bma3QNo' },
      { title: 'Tadap Tadap Ke', film: 'Hum Dil De Chuke Sanam (1999)', singers: 'K.K.', youtubeId: 'NV_XDwH606c' },
      { title: 'Nazar Ke Samne', film: 'Aashiqui (1990)', singers: 'Kumar Sanu, Anuradha Paudwal', youtubeId: 'Fw9au12q_1Y' },
    ],
  },
  evening: {
    label: 'Evening Rotation',
    scene: 'truck',
    songs: [
      { title: 'Chaiyya Chaiyya', film: 'Dil Se (1998)', singers: 'Sukhwinder Singh, Sapna Awasthi', youtubeId: '9MX-QejdVaQ' },
      { title: 'I Love My India', film: 'Pardes (1997)', singers: 'Hariharan, S.P. Balasubrahmanyam, Kavita Krishnamurthy', youtubeId: 'VHQ0w-9ITBI' },
      { title: 'Udja Kale Kawan', film: 'Gadar: Ek Prem Katha (2001)', singers: 'Udit Narayan', youtubeId: 'YJ70xDuUlt8' },
      { title: 'Main Nikla Gaddi Leke', film: 'Gadar: Ek Prem Katha (2001)', singers: 'Udit Narayan', youtubeId: 'IJNR_UVLDhs' },
      { title: 'Ye Jo Desh Hai Tera', film: 'Swades (2004)', singers: 'Udit Narayan', youtubeId: 'i7hVzQTCF-o' },
      { title: 'Yun Hi Chala Chal', film: 'Swades (2004)', singers: 'Udit Narayan, Kailash Kher', youtubeId: 'eEeX2QMlSlo' },
      { title: 'Panchhi Nadiya Pawan Ke', film: 'Refugee (2000)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'FVBgbuw6j14' },
      { title: 'Jiya Jale', film: 'Dil Se (1998)', singers: 'Lata Mangeshkar, Sukhwinder Singh', youtubeId: 'M-2nlaOQQSQ' },
      { title: 'Roja Jaaneman', film: 'Roja (1992)', singers: 'S.P. Balasubrahmanyam, K.S. Chithra', youtubeId: 'iDQ1qjCevZE' },
      { title: 'Dil Hai Chota Sa', film: 'Roja (1992)', singers: 'K.S. Chithra', youtubeId: 'P2s1Cl23oik' },
      { title: 'Bharat Humko Jaan Se Pyara Hai', film: 'Roja (1992)', singers: 'Hariharan', youtubeId: '7q5DUIgLs_4' },
      { title: 'Yeh Safar Bahut Hai Kathin', film: '1942: A Love Story (1994)', singers: 'Shibaji Chatterjee', youtubeId: 'O3CRcu0LMGQ' },
      { title: 'Yaara Seeli Seeli', film: 'Lekin... (1990)', singers: 'Lata Mangeshkar', youtubeId: 'OCEXAUUA5ss' },
      { title: 'Tanha Tanha', film: 'Rangeela (1995)', singers: 'Asha Bhosle', youtubeId: 'W1GNGlaFKYw' },
      { title: 'Jeeta Tha Jiske Liye', film: 'Dilwale (1994)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'fa5Yzxdh8e4' },
      { title: 'Woh Ladki Bahut Yaad Aati Hai', film: 'Qayamat (2003)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'B-gFmSHCTmk' },
      { title: 'Accha Sila Diya Tune Mere Pyar Ka', film: 'Bewafa Sanam (1995)', singers: 'Sonu Nigam, Anuradha Paudwal', youtubeId: 'G7AdjVDBLO8' },
      { title: 'Sab Kuch Bhula Diya', film: 'Hum Tumhare Hain Sanam (2002)', singers: 'Sonu Nigam, Sapna Awasthi', youtubeId: 'xKx_80QM2LU' },
      { title: 'Mubarak Ho Tumko Yeh Shaadi Tumhari', film: 'Haan Maine Bhi Pyaar Kiya (2002)', singers: 'Udit Narayan', youtubeId: 'BIX8Dfa05lQ' },
      { title: 'Dulhe Ka Sehra', film: 'Dhadkan (2000)', singers: 'Udit Narayan', youtubeId: 'iZAv9zDeFSc' },
      { title: 'Aisa Des Hai Mera', film: 'Veer-Zaara (2004)', singers: 'Udit Narayan, Sonu Nigam, Gurdas Maan, Sukhwinder Singh', youtubeId: 'wDheWYmNEhQ' },
      { title: 'Yeh Hum Aa Gaye Hain Kahan', film: 'Veer-Zaara (2004)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'ZmZOT9IbaaM' },
      { title: 'Chhod Aaye Hum Woh Galiyan', film: 'Maachis (1996)', singers: 'Hariharan', youtubeId: 'RraeHart9uY' },
      { title: 'Chappa Chappa Charkha Chale', film: 'Maachis (1996)', singers: 'Jaspinder Narula, Suresh Wadkar', youtubeId: 'HVa0owi2ZP4' },
      { title: 'Yaadein Yaad Aati Hai', film: 'Yaadein (2001)', singers: 'Hariharan', youtubeId: 'inXmWALwO8Q' },
      { title: 'Piya Haji Ali', film: 'Fiza (2000)', singers: 'A.R. Rahman, Murtuza and Qadir Ali Khan', youtubeId: 'c4uYjMpE1l8' },
      { title: 'Main Toh Raste Se Ja Raha Tha', film: 'Coolie No. 1 (1995)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'ekPjEpWKk74' },
      { title: 'Gaya Gaya Dil', film: 'Fiza (2000)', singers: 'Sonu Nigam', youtubeId: 'NJjN8ElKmpo' },
      { title: 'Na Leke Jao', film: 'Fiza (2000)', singers: 'Jaspinder Narula', youtubeId: 'W6mNLLOevZ4' },
      { title: 'Tu Fiza Hai', film: 'Fiza (2000)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'Lrkdg5JVG8M' },
      { title: 'Mere Dushman', film: 'Border (1997)', singers: 'Hariharan', youtubeId: 'Z8WsQl8kp2M' },
      { title: 'Sathiya Tune Kya Kiya', film: 'Love (1991)', singers: 'S.P. Balasubrahmanyam, K.S. Chithra', youtubeId: '9J_isuHe8bw' },
      { title: 'Dil Cheer Ke Dekh', film: 'Rang (1993)', singers: 'Kumar Sanu', youtubeId: '9f6GhUb-WdM' },
      { title: 'Kitna Haseen Chehra', film: 'Dilwale (1994)', singers: 'Kumar Sanu', youtubeId: 'cakb1SD-vXM' },
      { title: 'Saato Janam Main Tere', film: 'Dilwale (1994)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'f0oiheLlFW4' },
      { title: 'Mauka Milega Toh Hum Bata Denge', film: 'Dilwale (1994)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: '78CN-Fx7oNo' },
      { title: 'Hamen Jab Se Mohabbat', film: 'Border (1997)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'jor_SaUzuVI' },
      { title: 'Musafir Jaane Wale', film: 'Gadar: Ek Prem Katha (2001)', singers: 'Udit Narayan, Preeti Uttam', youtubeId: '9HDtZvtg0VI' },
      { title: 'Aan Milo Sajna', film: 'Gadar: Ek Prem Katha (2001)', singers: 'Ajoy Chakraborty, Parveen Sultana', youtubeId: 'Bx3izRX7bsk' },
      { title: 'Meri Mehbooba', film: 'Pardes (1997)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'WkfcHsPKwds' },
      { title: 'Nahin Hona Tha', film: 'Pardes (1997)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'TUXD7fG8AVo' },
      { title: 'Jahan Piya Wahan Main', film: 'Pardes (1997)', singers: 'K.S. Chithra, Shankar Mahadevan', youtubeId: '8ZBbCxbd3lw' },
      { title: 'Hum To Bhai Jaise Hain', film: 'Veer-Zaara (2004)', singers: 'Lata Mangeshkar', youtubeId: 'c_L5nSf91zs' },
      { title: 'Jaane Kyon', film: 'Veer-Zaara (2004)', singers: 'Lata Mangeshkar', youtubeId: 'LmMKyhuMyzk' },
      { title: 'Lodi', film: 'Veer-Zaara (2004)', singers: 'Udit Narayan, Lata Mangeshkar, Gurdas Maan', youtubeId: 'BQE3BPCeuQU' },
      { title: 'Main Yahaan Hoon', film: 'Veer-Zaara (2004)', singers: 'Udit Narayan', youtubeId: 'm6Y8xEfyXTs' },
      { title: 'Tum Paas Aa Rahe Ho', film: 'Veer-Zaara (2004)', singers: 'Jagjit Singh, Lata Mangeshkar', youtubeId: 'a71FdsMOKOQ' },
      { title: 'Ho Nahin Sakta', film: 'Diljale (1996)', singers: 'Udit Narayan', youtubeId: '4_a0ge-TPJs' },
      { title: 'Shaam Hai Dhuan Dhuan', film: 'Diljale (1996)', singers: 'Poornima, Ajay Devgn', youtubeId: 'DliA0vtoyhk' },
      { title: 'Jiske Aane Se', film: 'Diljale (1996)', singers: 'Kumar Sanu', youtubeId: 'Dp1tvWVNI-s' },
      { title: 'Milne Ki Tum Koshish Karna', film: 'Dil Ka Kya Kasoor (1994)', singers: 'Kumar Sanu, Asha Bhosle', youtubeId: '_f9kIjhuYMo' },
      { title: 'Mera Mulk Mera Desh (Sad)', film: 'Diljale (1996)', singers: 'Kavita Krishnamurthy', youtubeId: 'PSpcTFYMNGk' },
      { title: 'Mera Rang De Basanti Chola', film: 'The Legend of Bhagat Singh (2002)', singers: 'Sonu Nigam', youtubeId: 'esV069YrVh4' },
      { title: 'Sarfaroshi Ki Tamanna', film: 'The Legend of Bhagat Singh (2002)', singers: 'Hariharan, Sonu Nigam', youtubeId: 'MxWz46Fm_J8' },
      { title: 'Pagdi Sambhal Jatta', film: 'The Legend of Bhagat Singh (2002)', singers: 'Sukhwinder Singh', youtubeId: 'U_Pf1FHKnJM' },
      { title: 'Is Mitti Ka Karz Tha Mujhpe', film: 'China Gate (1998)', singers: 'Sonu Nigam', youtubeId: 'm7erYEj1n6E' },
      { title: 'Hum Yahan', film: 'Zakhm (1998)', singers: 'Kumar Sanu', youtubeId: 'KkhmoE-MG8U' },
      { title: 'Pardesi Maine Mohabbat Kar Li', film: 'Kahin Pyaar Na Ho Jaaye (2000)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'pRhOdXvQcK0' },
      { title: 'Kahin Pyaar Na Ho Jaaye', film: 'Kahin Pyaar Na Ho Jaaye (2000)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'HUBHg1Wwbis' },
      { title: 'Humko Toh Rehna Hai', film: 'China Gate (1998)', singers: 'Sonu Nigam, Sudesh Bhosle', youtubeId: 'GRMRB0romKs' },
      { title: 'Zamane Ke Dekhe Hai Rang Hazar', film: 'Sadak (1991)', singers: 'Anuradha Paudwal', youtubeId: 'lZvFfksoAao' },
      { title: 'Jab Jab Pyar Pe Phera Hua Hai', film: 'Sadak (1991)', singers: 'Kumar Sanu, Anuradha Paudwal', youtubeId: 'k6hlV0iUhRo' },
      { title: 'Mohabbat Ki Hai Tumhare Liye', film: 'Sadak (1991)', singers: 'Kumar Sanu, Anuradha Paudwal', youtubeId: 'XEgihe0g8bM' },
      { title: 'Baadalon Mein Chhup Raha Hai', film: 'Phir Teri Kahani Yaad Aayee (1993)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'AzN4PKgPg-4' },
      { title: 'Shaairana Si Hai Zindagi', film: 'Phir Teri Kahani Yaad Aayee (1993)', singers: 'Alka Yagnik', youtubeId: 'QDKkI7AyAXg' },
      { title: 'Ae Kaash Ke Hum', film: 'Kabhi Haan Kabhi Naa (1996)', singers: 'Kumar Sanu', youtubeId: 'Jtg2zyS_y_c' },
      { title: 'Kuchh Na Kaho', film: '1942: A Love Story (1994)', singers: 'Kumar Sanu, Lata Mangeshkar', youtubeId: 'Kidtrrn4aUM' },
      { title: 'Pyar Hua Chupke Se', film: '1942: A Love Story (1994)', singers: 'Kavita Krishnamurthy', youtubeId: 'V0FsE0b7Z-s' },
      { title: 'Rim Jhim Rim Jhim', film: '1942: A Love Story (1994)', singers: 'Kumar Sanu, Kavita Krishnamurthy', youtubeId: 'GRikmrj8VN4' },
      { title: 'Mera Dil Bhi Kitna Pagal Hai', film: 'Saajan (1991)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'RVQsBlI35vw' },
      { title: 'Dekha Hai Pehli Baar', film: 'Saajan (1991)', singers: 'S.P. Balasubrahmanyam, Alka Yagnik', youtubeId: 'bBjVLCAAM1A' },
      { title: 'Bahut Pyar Karte Hain', film: 'Saajan (1991)', singers: 'S.P. Balasubrahmanyam, Anuradha Paudwal', youtubeId: 'iupGwQqjgOk' },
      { title: 'Jiye To Jiye Kaise', film: 'Saajan (1991)', singers: 'Pankaj Udhas', youtubeId: 'XOxz0Hr3Hzo' },
      { title: 'Mere Khwabon Mein Jo Aaye', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Lata Mangeshkar', youtubeId: 's1LozokQjIg' },
      { title: 'Ruk Ja O Dil Deewane', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Udit Narayan', youtubeId: 'jBpRItrod-Q' },
      { title: 'Ho Gaya Hai Tujhko Toh Pyar Sajna', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'hw_HpTI_Wkw' },
      { title: 'Zara Sa Jhoom Loon Main', film: 'Dilwale Dulhania Le Jayenge (1995)', singers: 'Asha Bhosle, Abhijeet', youtubeId: '96YVQBjrtWE' },
      { title: 'Na Tum Jaano Na Hum', film: 'Kaho Naa... Pyaar Hai (2000)', singers: 'Lucky Ali', youtubeId: 'eSxo4l-epv8' },
      { title: 'Dil Ne Yeh Kaha Hai Dil Se', film: 'Dhadkan (2000)', singers: 'Alka Yagnik, Sonu Nigam', youtubeId: 'MvcNeQlqtes' },
      { title: 'Tum Dil Ki Dhadkan Mein', film: 'Dhadkan (2000)', singers: 'Abhijeet, Alka Yagnik', youtubeId: '3Z_x7vBqr6E' },
      { title: 'Dil To Pagal Hai', film: 'Dil To Pagal Hai (1997)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'lZ2PhyBF3GQ' },
      { title: 'Bholi Si Surat', film: 'Dil To Pagal Hai (1997)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'IsPOtygII-Q' },
      { title: 'Are Re Are', film: 'Dil To Pagal Hai (1997)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'OEpFiDKqH7E' },
      { title: 'Chand Chhupa Badal Mein', film: 'Hum Dil De Chuke Sanam (1999)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: '9a6UaCBEV6o' },
      { title: 'Albela Sajan', film: 'Hum Dil De Chuke Sanam (1999)', singers: 'Kavita Krishnamurthy, Vinod Rathod, Sujata Trivedi', youtubeId: 'MCXQXuKpgKE' },
      { title: 'Sochenge Tumhe Pyar Karke', film: 'Deewana (1992)', singers: 'Kumar Sanu', youtubeId: 'lFdSi01tpYM' },
      { title: 'Tumse Milke Dil Ka Jo Haal', film: 'Main Hoon Na (2004)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'mXkbWKr5ovU' },
      { title: 'Chale Jaise Hawaein', film: 'Main Hoon Na (2004)', singers: 'KK, Vasundhara Das', youtubeId: 'UJ-MT8ZnUxY' },
      { title: 'Sooraj Hua Maddham', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Sonu Nigam, Alka Yagnik', youtubeId: 'L0zKs8i7Nc8' },
      { title: 'Har Dil Jo Pyar Karega', film: 'Har Dil Jo Pyar Karega (2000)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'V0jFYD0PirU' },
      { title: 'Bin Tere Sanam', film: 'Yaara Dildara (1991)', singers: 'Udit Narayan, Kavita Krishnamurthy', youtubeId: 'POkRQw1VbcU' },
      { title: 'Aa Ab Laut Chalen', film: 'Aa Ab Laut Chalen (1999)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: '6B_4AKG-pDo' },
      { title: 'Yeh Raaste Hai Pyaar Ke', film: 'Yeh Raaste Hain Pyaar Ke (2001)', singers: 'Shaan, Jaspinder Narula', youtubeId: 'Qe-9Xqxes9o' },
      { title: 'Kahin Aag Lage', film: 'Taal (1999)', singers: 'Asha Bhosle', youtubeId: '-qlrEgMX7pE' },
      { title: 'Nahin Saamne', film: 'Taal (1999)', singers: 'Hariharan, Sukhwinder Singh', youtubeId: '0JlcMt3l3dY' },
      { title: 'Ramta Jogi', film: 'Taal (1999)', singers: 'Sukhwinder Singh, Alka Yagnik', youtubeId: 'onfy6y07ujQ' },
      { title: 'Suno Na', film: 'Jhankaar Beats (2003)', singers: 'Shaan', youtubeId: 'rEpfftr_Zgg' },
      { title: 'Aye Dil Laya Hai Bahaar', film: 'Kya Kehna (2000)', singers: 'Kavita Krishnamurthy, Hariharan', youtubeId: '3wGPjDTqJxI' },
      { title: 'Yeh Tara Woh Tara', film: 'Swades (2004)', singers: 'Udit Narayan', youtubeId: '9UzvpM3IwwY' },
    ],
  },
  night: {
    label: 'Late Night Rotation',
    scene: 'truck',
    songs: [
      { title: 'O Re Chhori', film: 'Lagaan (2001)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: '3PIKesjmQTs' },
      { title: 'Zara Zara', film: 'Rehnaa Hai Terre Dil Mein (2001)', singers: 'Bombay Jayashri', youtubeId: 'a71xD6RyOok' },
      { title: 'Maahi Ve', film: 'Kal Ho Naa Ho (2003)', singers: 'Sonu Nigam, Shreya Ghoshal, Vasundhara Das', youtubeId: '1BWdglekty0' },
      { title: 'Kal Ho Naa Ho', film: 'Kal Ho Naa Ho (2003)', singers: 'Sonu Nigam, Alka Yagnik, Shaan', youtubeId: 'g0eO74UmRBs' },
      { title: 'Satrangi Re', film: 'Dil Se (1998)', singers: 'Sonu Nigam, Kavita Krishnamurthy', youtubeId: 'OClXVLsI4jM' },
      { title: 'Dil Se Re', film: 'Dil Se (1998)', singers: 'A.R. Rahman', youtubeId: 'MYfaX0BH2AY' },
      { title: 'Ae Ajnabi', film: 'Dil Se (1998)', singers: 'Udit Narayan', youtubeId: 'TdUu05Svkl8' },
      { title: 'Neend Churayee Meri', film: 'Ishq (1997)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'gCcGXy_Mv8g' },
      { title: 'Woh Lamhe', film: 'Zeher (2005)', singers: 'KK', youtubeId: 'mX0_1yejIQI' },
      { title: 'Do Pal', film: 'Veer-Zaara (2004)', singers: 'Sonu Nigam, Lata Mangeshkar', youtubeId: 'HPsxxBhv9kc' },
      { title: 'Tere Liye', film: 'Veer-Zaara (2004)', singers: 'Lata Mangeshkar, Roop Kumar Rathod', youtubeId: 'jo6iAkSoraY' },
      { title: 'Kyun Hawa', film: 'Veer-Zaara (2004)', singers: 'Sonu Nigam, Lata Mangeshkar', youtubeId: 'rIx3YkMmX9Y' },
      { title: 'Piyu Bole', film: 'Parineeta (2005)', singers: 'Shreya Ghoshal, Sonu Nigam', youtubeId: 'ZAkr0KFFLLs' },
      { title: 'Tu Hi Re', film: 'Bombay (1995)', singers: 'K.S. Chithra, Hariharan', youtubeId: 'V9mN0qBgEzQ' },
      { title: 'Kabhi Toh Nazar Milao', film: 'Baazigar (1993)', singers: 'Asha Bhosle, Adnan Sami', youtubeId: '84k0Dk1xAdg' },
      { title: 'Tere Naam Humne Kiya Hai Zindagi', film: 'Tere Naam (2003)', singers: 'Udit Narayan', youtubeId: 'OMoU0Pfibc4' },
      { title: 'Ye Silsila Hai Pyar Ka', film: 'Silsila Hai Pyar Ka (1999)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'BImdJ6eqj_w' },
      { title: 'Yeh Dil Sun Raha Hai', film: 'Khamoshi: The Musical (1996)', singers: 'Kavita Krishnamurthy', youtubeId: '2gZmDKzsp_I' },
      { title: 'O Priya O Priya', film: 'Kahin Pyaar Na Ho Jaaye (2000)', singers: 'Kamal Khan, Kumar Sanu, Alka Yagnik', youtubeId: '5KPzQPOenMY' },
      { title: 'Saanwariya Re O Saanwariya', film: 'Kahin Pyaar Na Ho Jaaye (2000)', singers: 'Kamal Khan, Alka Yagnik', youtubeId: 'NnlleB27ks8' },
      { title: 'Chaha Hai Tujhko', film: 'Mann (1999)', singers: 'Udit Narayan, Anuradha Paudwal', youtubeId: 'SUnD-B1JQZk' },
      { title: 'Mann Ki Lagan', film: 'Paap (2003)', singers: 'Rahat Fateh Ali Khan', youtubeId: 'jUDP6LmgcCE' },
      { title: 'Tere Chehre Pe', film: 'Baazigar (1993)', singers: 'Kumar Sanu, Sapna Mukherjee', youtubeId: 'lFgIFO3h6QU' },
      { title: 'Kuch Tum Behko', film: 'Diljale (1996)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'u_ymhtNpC40' },
      { title: 'Ek Baat Main Apne Dil Mein', film: 'Diljale (1996)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'HEwJ04XMAV8' },
      { title: 'Gali Mein Aaj Chand Nikla', film: 'Zakhm (1998)', singers: 'Alka Yagnik', youtubeId: 'azEOf5PuqNA' },
      { title: 'Raat Saari Beqarari Mein', film: 'Zakhm (1998)', singers: 'Alka Yagnik', youtubeId: 'YmrZqZAG_a0' },
      { title: 'Pehli Pehli Baar Hai', film: 'Kya Yehi Pyaar Hai (2002)', singers: 'Alka Yagnik, Sonu Nigam', youtubeId: 'SAzDn1WbMYs' },
      { title: 'Chhoti Chhoti Raatein', film: 'Tum Bin (2001)', singers: 'Sonu Nigam, Anuradha Paudwal', youtubeId: '_NyhCA6BJsM' },
      { title: 'Koi Fariyaad', film: 'Tum Bin (2001)', singers: 'Jagjit Singh', youtubeId: '8MN2bxMiB9A' },
      { title: 'Tum Bin Jiya Jaye Kaise', film: 'Tum Bin (2001)', singers: 'K.S. Chithra, Nikhil-Vinay', youtubeId: '5MnAPQRxy-g' },
      { title: 'Tumhare Siva', film: 'Tum Bin (2001)', singers: 'Anuradha Paudwal, Udit Narayan', youtubeId: 'MAotiOc9wuM' },
      { title: 'Aapke Pyaar Mein Hum Sanwar Gaye', film: 'Raaz (2002)', singers: 'Alka Yagnik', youtubeId: 'L6bSHDaDLyc' },
      { title: 'Kitna Pyaara Hai', film: 'Raaz (2002)', singers: 'Alka Yagnik, Udit Narayan', youtubeId: 'fPgBPqdR7-c' },
      { title: 'Zindagi Mein Toh Sabhi Pyar Kiya Karte Hain', film: 'Bewafa Sanam (1995)', singers: 'Sonu Nigam', youtubeId: 'M-nM8f27zWs' },
      { title: 'Barson Ke Baad', film: 'Anjaam (1994)', singers: 'Alka Yagnik', youtubeId: 'UlvvyNBylBE' },
      { title: 'Khoye Khoye Din', film: 'Hum Tumhare Hain Sanam (2002)', singers: 'Sonu Nigam', youtubeId: '6AcenqWPiMw' },
      { title: 'Dil Tod Aaya', film: 'Hum Tumhare Hain Sanam (2002)', singers: 'Sonu Nigam', youtubeId: '25Afl0_bDos' },
      { title: 'Kitni Bechain Hoke Tumse Mili', film: 'Kasoor (2001)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: '0JCLpa-r4Lg' },
      { title: 'Zindagi Ban Gaye Ho Tum', film: 'Kasoor (2001)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'yKWnCagRWbA' },
      { title: 'Dil Ka Aalam', film: 'Aashiqui (1990)', singers: 'Kumar Sanu', youtubeId: 'BaAoZA0fup0' },
      { title: 'O Mere Sapno Ke Saudagar', film: 'Dil Hai Ke Manta Nahin (1991)', singers: 'Anuradha Paudwal', youtubeId: '03Aa_s5A3bY' },
      { title: 'Dil Tujhpe Aa Gaya', film: 'Dil Hai Ke Manta Nahin (1991)', singers: 'Anuradha Paudwal, Abhijeet', youtubeId: 'T4Gynle0iEI' },
      { title: 'Aashiq Banaya Aapne', film: 'Aashiq Banaya Aapne (2005)', singers: 'Himesh Reshammiya, Shreya Ghoshal', youtubeId: '0bAVd9jJE2Q' },
      { title: 'Maar Dala', film: 'Devdas (2002)', singers: 'Kavita Krishnamurthy', youtubeId: 'g8waHAV2lwM' },
      { title: 'Jaadu Hai Nasha Hai', film: 'Jism (2003)', singers: 'Shreya Ghoshal, Shaan', youtubeId: 'gTSL0Rv0am4' },
      { title: 'Pyaar Ki Kashti Mein', film: 'Kaho Naa... Pyaar Hai (2000)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 't_oh_NkPtn0' },
      { title: 'Yeh Dil Aashiqana', film: 'Yeh Dil Aashiqana (2002)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'ox2Mtg7QzSw' },
      { title: 'Tumhein Apna Banane Ki Kasam Khai Hai', film: 'Sadak (1991)', singers: 'Kumar Sanu, Anuradha Paudwal', youtubeId: 'tPNwGuu_rQ4' },
      { title: 'Hum Tere Bin Kahin Reh Nahi Paate', film: 'Sadak (1991)', singers: 'Manhar Udhas, Anuradha Paudwal', youtubeId: 'OxamnTFg3gw' },
      { title: 'Tere Dar Pe Sanam Hum Chale Aaye', film: 'Phir Teri Kahani Yaad Aayee (1993)', singers: 'Kumar Sanu, Sadhana Sargam', youtubeId: '05o4kCUY2Ys' },
      { title: 'Dil Deta Hai Ro Ro Duhaai', film: 'Phir Teri Kahani Yaad Aayee (1993)', singers: 'Pankaj Udhas', youtubeId: 'OCK6JtvEn24' },
      { title: 'Aanewala Kal Ek Sapna Hai', film: 'Phir Teri Kahani Yaad Aayee (1993)', singers: 'Kumar Sanu', youtubeId: 'TD5bugWnUWs' },
      { title: 'Wafa Na Raas Aayee Tujhe O Harjaee', film: 'Bewafa Sanam (1995)', singers: 'Nitin Mukesh', youtubeId: '0A2ue4lNMzo' },
      { title: 'Nahin Yeh Ho Nahin Sakta', film: 'Barsaat (1995)', singers: 'Kumar Sanu, Sadhana Sargam', youtubeId: 'NNxf_AKuL0M' },
      { title: 'Jo Haal Dil Ka', film: 'Sarfarosh (1999)', singers: 'Udit Narayan, Kumar Sanu, Alka Yagnik', youtubeId: 'Y9OnEE7FAcc' },
      { title: 'Hoshwalon Ko Khabar Kya', film: 'Sarfarosh (1999)', singers: 'Jagjit Singh', youtubeId: 'ag3ENMEV89o' },
      { title: 'Humko Sirf Tumse Pyaar Hai', film: 'Barsaat (1995)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'XORxoZS8FtA' },
      { title: 'Mujhe Raat Din Bas', film: 'Sangharsh (1999)', singers: 'Sonu Nigam', youtubeId: 'DqkG0fuPiO0' },
      { title: 'Ishq Samundar', film: 'Kaante (2002)', singers: 'Sunidhi Chauhan', youtubeId: 'zKyGZS6hPGY' },
      { title: 'Humko Humise Chura Lo', film: 'Mohabbatein (2000)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'zWPsjhBaRb0' },
      { title: 'Zinda Rehti Hain Mohabbatein', film: 'Mohabbatein (2000)', singers: 'Lata Mangeshkar', youtubeId: '1cWR8QVhJLE' },
      { title: 'Aankhein Khuli', film: 'Mohabbatein (2000)', singers: 'Lata Mangeshkar, Udit Narayan', youtubeId: 'eM8Mjuq4MwQ' },
      { title: 'O Humdum Suniyo Re', film: 'Saathiya (2002)', singers: 'KK, Shaan', youtubeId: '_9geEbZIAJM' },
      { title: 'Chupke Se', film: 'Saathiya (2002)', singers: 'Sadhana Sargam', youtubeId: 'JLXfTmF9DSI' },
      { title: 'Saathiya', film: 'Saathiya (2002)', singers: 'Sonu Nigam', youtubeId: 'eMA6GHTQ4WA' },
      { title: 'Aawara Bhanwre', film: 'Sapnay (1997)', singers: 'Hema Sardesai, Malaysia Vasudevan', youtubeId: 'rZqlitLKwhw' },
      { title: 'Kandhon Se Milte Hain Kandhe', film: 'Lakshya (2004)', singers: 'Sonu Nigam, Hariharan', youtubeId: 's_-tthrE0Hg' },
      { title: 'Silsila Yeh Chaahat Ka', film: 'Devdas (2002)', singers: 'Shreya Ghoshal, Udit Narayan', youtubeId: 'yWNzKpUVkN8' },
      { title: 'Bairi Piya', film: 'Devdas (2002)', singers: 'Udit Narayan, Shreya Ghoshal', youtubeId: 'c0udXSNMRhk' },
      { title: 'Chand Taare', film: 'Yes Boss (1997)', singers: 'Abhijeet, Alka Yagnik', youtubeId: 'DIAcdeG70IE' },
      { title: 'Maahi Ve (Kaante)', film: 'Kaante (2002)', singers: 'Richa Sharma, Sukhwinder Singh', youtubeId: '7OaW53bm7IU' },
      { title: 'Dheeme Dheeme', film: 'Zubeidaa (2001)', singers: 'Kavita Krishnamurthy', youtubeId: 'xNFNKQtBtdI' },
      { title: 'Meri Tarah Tum Bhi', film: 'Kya Yehi Pyaar Hai (2002)', singers: 'Alka Yagnik, Babul Supriyo', youtubeId: '8XEisjR49QY' },
      { title: 'Sajna Ve Sajna', film: 'Chameli (2003)', singers: 'Sunidhi Chauhan', youtubeId: 'yR5B-00peGQ' },
      { title: 'Allah Ke Bande', film: 'Waisa Bhi Hota Hai Part II (2003)', singers: 'Kailash Kher', youtubeId: 'KSwd2fYX9vg' },
      { title: 'Kuch To Hua Hai', film: 'Kal Ho Naa Ho (2003)', singers: 'Alka Yagnik, Shaan', youtubeId: 'NMsvr4txH_g' },
      { title: 'Mere Khayalon Ki Malika', film: 'Josh (2000)', singers: 'Abhijeet, Alka Yagnik', youtubeId: 'LtlZv_hd9fg' },
      { title: 'Zindagi Maut Na Ban Jaaye', film: 'Sarfarosh (1999)', singers: 'Sonu Nigam, Roop Kumar Rathod', youtubeId: '2liZ16dgBgg' },
      { title: 'Kabhi Khushi Kabhie Gham', film: 'Kabhi Khushi Kabhie Gham (2001)', singers: 'Lata Mangeshkar', youtubeId: '2wn3RHVpfxE' },
      { title: 'Yeh Raat Aur Yeh Doorie', film: 'Andaz Apna Apna (1994)', singers: 'Asha Bhosle, Kumar Sanu', youtubeId: 'BG8sPVJl3s0' },
      { title: 'Bahon Ke Darmiyan', film: 'Khamoshi: The Musical (1996)', singers: 'Alka Yagnik, Hariharan', youtubeId: 'kHYYfKAQdHA' },
      { title: 'Saanwariya Saanwariya', film: 'Swades (2004)', singers: 'Alka Yagnik', youtubeId: 'wsnGhJy6Ibc' },
      { title: 'Pal Pal Hai Bhaari', film: 'Swades (2004)', singers: 'A.R. Rahman', youtubeId: 'dRWr8OsVyjA' },
      { title: 'Kabhi Neem Neem', film: 'Yuva (2004)', singers: 'Madhushree', youtubeId: '2Dh-X9oCHIY' },
      { title: 'Tune Dil Mera Toda', film: 'Sanam Bewafa (1991)', singers: 'Lata Mangeshkar', youtubeId: 'nG85YFR3o6U' },
      { title: 'Waada Raha Sanam', film: 'Khiladi (1992)', singers: 'Alka Yagnik, Abhijeet', youtubeId: '9b0iydtDZLU' },
      { title: 'Kaun Main Haan Tum', film: 'Ajnabee (2001)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'FfKgX7Sf2qo' },
      { title: 'Aksar Is Duniya Mein', film: 'Dhadkan (2000)', singers: 'Alka Yagnik', youtubeId: '-u1YYyRmmsc' },
      { title: 'Hai Dil', film: 'Dil Ka Rishta (2003)', singers: 'Alka Yagnik, Kumar Sanu', youtubeId: 'BOEOSdwC7RA' },
      { title: 'Sajan Sajan', film: 'Dil Ka Rishta (2003)', singers: 'Jaspinder Narula', youtubeId: 's7qOjXlW7d4' },
      { title: 'Rind Posh Maal', film: 'Mission Kashmir (2000)', singers: 'Shankar Mahadevan', youtubeId: 'KnasuudnVIA' },
      { title: 'Nasha Yeh Pyar Ka Nasha Hai', film: 'Mann (1999)', singers: 'Udit Narayan', youtubeId: 'J6laWLcBqK4' },
      { title: 'Chhupana Bhi Nahin Aata', film: 'Baazigar (1993)', singers: 'Vinod Rathod', youtubeId: 'OsBqRHx2JAA' },
      { title: 'Mujhe Neend Na Aaye', film: 'Dil (1990)', singers: 'Anuradha Paudwal, Udit Narayan', youtubeId: 'rrZcR4GzWq8' },
      { title: 'Tumsa Koi Pyaara', film: 'Khuddar (1994)', singers: 'Kumar Sanu, Alka Yagnik', youtubeId: 'HubRXgH0Erc' },
      { title: 'Tera Dilbar', film: 'Yeh Dil (2003)', singers: 'Alka Yagnik, Sonu Nigam', youtubeId: '9iXu3dvdVbM' },
      { title: 'Jab Bhi Koi Haseena', film: 'Hera Pheri (2000)', singers: 'KK', youtubeId: 'kzdqSXwJXks' },
      { title: 'Tujhe Yaad Na Meri Aayee', film: 'Kuch Kuch Hota Hai (1998)', singers: 'Udit Narayan, Alka Yagnik', youtubeId: 'vzWWTX83C_Q' },
      { title: 'Kabhi Main Kahoon', film: 'Lamhe (1991)', singers: 'Vinod Rathod, Kavita Krishnamurthy', youtubeId: 'Mag04um99xg' },
    ],
  },
};

const SLOT_MINUTES = 4; // nominal per-song scheduling slot, used only to pick the live starting point
const SONG_VOLUME = 60; // 0-100, YouTube player's own scale
const AMBIENT_VOLUME = 0.4; // 0-1, HTMLMediaElement scale — audible under the song, not competing with it

function istParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return { hour: Number(parts.hour) % 24, minute: Number(parts.minute), second: Number(parts.second) };
}

function currentRotationKey(hour) {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// ---------- state ----------

let ytPlayer = null;
let ytReady = false;
let playerStarted = false;
let pendingPlay = false; // true if the listener hit play before the YouTube API had finished loading
let ambientOn = false;
let ambientLoadedScene = null;
let isMuted = false;
let currentRotationSongs = [];
let currentSongIndex = 0;
let currentScene = null;
let progressTimer = null;

const el = (id) => document.getElementById(id);
const trackArt = el('trackArt');
const trackTitle = el('trackTitle');
const trackMeta = el('trackMeta');
const rotationLabel = el('rotationLabel');
const playBtn = el('playBtn');
const playIcon = el('playIcon');
const pauseIcon = el('pauseIcon');
const prevBtn = el('prevBtn');
const nextBtn = el('nextBtn');
const muteBtn = el('muteBtn');
const volumeIcon = el('volumeIcon');
const mutedIcon = el('mutedIcon');
const progressFill = el('progressFill');
const ambientToggle = el('ambientToggle');
const ambientAudio = el('ambientAudio');
const shareBtn = el('shareBtn');
const bgScene = el('bgScene');
const bgGif = el('bgGif');
const clockEl = el('clock');

let gifRotationTimer = null;
let gifIndex = 0;

// ---------- scene (background treatment + ambient track) ----------

function setScene(sceneKey) {
  if (sceneKey === currentScene) return;
  currentScene = sceneKey;
  bgScene.className = `bg-scene scene-${sceneKey}`;

  if (sceneKey === 'truck') {
    scheduleGifStart();
  } else {
    stopGifRotation();
  }

  // Background music is opt-in — only re-point/re-fetch the ambient track
  // if the listener already turned it on.
  if (ambientOn) {
    loadAmbientForCurrentScene();
    ambientAudio.play().catch(() => {});
  }
}

function loadAmbientForCurrentScene() {
  if (ambientLoadedScene === currentScene) return;
  ambientLoadedScene = currentScene;
  ambientAudio.src = SCENES[currentScene].ambient;
  ambientAudio.volume = AMBIENT_VOLUME;
  ambientAudio.load();
}

// Background music tracks the song's play/pause state — pausing the song
// pauses the ambience too, and resuming the song brings it back, as long as
// the listener has opted into background music via ambientToggle.
function pauseAmbientIfOn() {
  if (ambientOn) ambientAudio.pause();
}

function resumeAmbientIfOn() {
  if (!ambientOn) return;
  loadAmbientForCurrentScene();
  ambientAudio.play().catch(() => {});
}

// ---------- background gif rotation (real footage, lazy) ----------

function showGif(src) {
  const img = new Image();
  img.onload = () => {
    if (currentScene !== 'truck') return; // scene may have changed while loading
    bgGif.classList.remove('loaded');
    bgGif.src = src;
    requestAnimationFrame(() => bgGif.classList.add('loaded'));
  };
  img.src = src;
}

function startTruckGifRotation() {
  showGif(TRUCK_GIFS[gifIndex]);
  clearInterval(gifRotationTimer);
  gifRotationTimer = setInterval(() => {
    gifIndex = (gifIndex + 1) % TRUCK_GIFS.length;
    showGif(TRUCK_GIFS[gifIndex]);
  }, GIF_ROTATE_MS);
}

function stopGifRotation() {
  clearInterval(gifRotationTimer);
  gifRotationTimer = null;
  bgGif.classList.remove('loaded');
}

// Song-ready is the priority — the (heavier) real-footage background only
// starts fetching once the browser is idle, or after a short fallback delay,
// so it never competes with the YouTube player becoming playable.
function scheduleGifStart() {
  if (gifRotationTimer) return;
  const start = () => { if (currentScene === 'truck') startTruckGifRotation(); };
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
  else setTimeout(start, 400);
}

// ---------- clock (IST — matches the rotation schedule) ----------

function updateClock() {
  const { hour, minute } = istParts();
  clockEl.textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// ---------- rotation / scheduling ----------

function pickLiveStart() {
  const { hour, minute, second } = istParts();
  const key = currentRotationKey(hour);
  const rotation = ROTATIONS[key];
  const minutesIntoDay = hour * 60 + minute;
  const slot = Math.floor(minutesIntoDay / SLOT_MINUTES);
  const index = slot % rotation.songs.length;
  const elapsedSeconds = (minutesIntoDay % SLOT_MINUTES) * 60 + second;
  return { key, rotation, index, elapsedSeconds };
}

function renderTrack(song) {
  trackArt.src = `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`;
  trackTitle.textContent = song.title;
  trackMeta.textContent = `${song.film} · ${song.singers}`;
}

// cueVideoById only stages a video (no autoplay) — used for the very first
// load, before the listener has pressed play. Once playback has actually
// started, loadVideoById is used instead everywhere: it loads AND plays in
// one call, avoiding the race of cueing a new video and then immediately
// calling playVideo() on top of it, which is what made skipping tracks feel
// laggy/inconsistent.
function loadSong(index, seekSeconds, autoplay) {
  currentSongIndex = index;
  const song = currentRotationSongs[index];
  renderTrack(song);
  if (!ytReady || !ytPlayer) return;
  const params = { videoId: song.youtubeId, startSeconds: seekSeconds || 0 };
  if (autoplay) {
    ytPlayer.loadVideoById(params);
  } else {
    ytPlayer.cueVideoById(params);
  }
}

function goToSong(delta) {
  const len = currentRotationSongs.length;
  const nextIndex = (currentSongIndex + delta + len) % len;
  loadSong(nextIndex, 0, playerStarted);
  if (playerStarted) setPlayingUI(true);
}

function advanceToNext() {
  goToSong(1);
}

function refreshRotationIfChanged() {
  const { key, rotation } = pickLiveStart();
  rotationLabel.textContent = rotation.label.toUpperCase();
  currentRotationSongs = rotation.songs;
  setScene(rotation.scene);
  return key;
}

// ---------- YouTube IFrame API ----------

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('ytPlayer', {
    height: '1', width: '1',
    playerVars: { autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: () => {
        ytReady = true;
        ytPlayer.setVolume(SONG_VOLUME);
        const { rotation, index, elapsedSeconds } = pickLiveStart();
        currentRotationSongs = rotation.songs;
        rotationLabel.textContent = rotation.label.toUpperCase();
        setScene(rotation.scene);
        if (pendingPlay) {
          // Listener already hit play while the API was still loading — honor
          // that click now instead of leaving it silently dropped.
          pendingPlay = false;
          playBtn.classList.remove('loading');
          playerStarted = true;
          loadSong(index, elapsedSeconds, true);
          setPlayingUI(true);
          startProgressLoop();
          resumeAmbientIfOn();
        } else {
          loadSong(index, elapsedSeconds);
        }
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.ENDED) advanceToNext();
      },
    },
  });
};

// ---------- transport ----------

function setPlayingUI(isPlaying) {
  playIcon.style.display = isPlaying ? 'none' : '';
  pauseIcon.style.display = isPlaying ? '' : 'none';
  playBtn.setAttribute('aria-label', isPlaying ? 'pause' : 'play');
}

function startProgressLoop() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
    const dur = ytPlayer.getDuration();
    const cur = ytPlayer.getCurrentTime();
    if (dur > 0) progressFill.style.width = `${Math.min(100, (cur / dur) * 100)}%`;
  }, 500);
}

// Song playback is the first priority — pausing/resuming the song also
// pauses/resumes background music (if the listener opted into it), so the
// two layers never drift out of sync.
playBtn.addEventListener('click', () => {
  if (!ytReady) {
    // API isn't ready yet — remember the intent and show a loading state
    // instead of silently dropping the click. onReady() will honor it.
    pendingPlay = !pendingPlay;
    playBtn.classList.toggle('loading', pendingPlay);
    return;
  }
  const state = ytPlayer.getPlayerState();
  const isPlaying = state === YT.PlayerState.PLAYING;

  if (isPlaying) {
    ytPlayer.pauseVideo();
    setPlayingUI(false);
    pauseAmbientIfOn();
  } else {
    playerStarted = true;
    ytPlayer.playVideo();
    setPlayingUI(true);
    startProgressLoop();
    resumeAmbientIfOn();
  }
});

prevBtn.addEventListener('click', () => {
  if (!ytReady) return;
  goToSong(-1);
});

nextBtn.addEventListener('click', () => {
  if (!ytReady) return;
  goToSong(1);
});

muteBtn.addEventListener('click', () => {
  if (!ytReady) return;
  isMuted = !isMuted;
  if (isMuted) ytPlayer.mute(); else ytPlayer.unMute();
  volumeIcon.style.display = isMuted ? 'none' : '';
  mutedIcon.style.display = isMuted ? '' : 'none';
  muteBtn.classList.toggle('active', isMuted);
  muteBtn.title = isMuted ? 'unmute' : 'mute';
});

// ---------- background music (ambient layer, loaded only on request) ----------

function updateAmbientButtonLabel() {
  ambientToggle.title = `background music: ${ambientOn ? 'on' : 'off'}`;
  ambientToggle.setAttribute('aria-label', ambientToggle.title);
  ambientToggle.classList.toggle('muted', !ambientOn);
}

ambientToggle.addEventListener('click', () => {
  ambientOn = !ambientOn;
  updateAmbientButtonLabel();
  if (ambientOn) {
    loadAmbientForCurrentScene();
    ambientAudio.play().catch(() => {});
  } else {
    ambientAudio.pause();
  }
});

// ---------- rotation change watcher ----------

setInterval(refreshRotationIfChanged, 60 * 1000);

// ---------- share card ----------

function drawShareCard(song) {
  const canvas = el('shareCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#1a1108');
  grad.addColorStop(1, '#0b0906');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(217,138,61,0.14)';
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.16, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#D98A3D';
  ctx.font = '600 34px "IBM Plex Mono", monospace';
  ctx.fillText('MERA RADIO', 64, 110);

  ctx.fillStyle = 'rgba(244,239,230,0.6)';
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillText('NOW PLAYING', 64, 400);

  ctx.fillStyle = '#F4EFE6';
  ctx.font = '600 56px "Archivo Narrow", sans-serif';
  wrapText(ctx, song.title, 64, 470, w - 128, 62);

  ctx.fillStyle = 'rgba(244,239,230,0.72)';
  ctx.font = '400 28px "Archivo Narrow", sans-serif';
  ctx.fillText(song.film, 64, 620);
  ctx.fillText(song.singers, 64, 660);

  ctx.strokeStyle = 'rgba(244,239,230,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, h - 120);
  ctx.lineTo(w - 64, h - 120);
  ctx.stroke();

  ctx.fillStyle = 'rgba(244,239,230,0.55)';
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillText('meraradio.app', 64, h - 70);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  words.forEach((word) => {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  });
  ctx.fillText(line, x, curY);
}

shareBtn.addEventListener('click', () => {
  const song = currentRotationSongs[currentSongIndex];
  if (!song) return;
  const canvas = drawShareCard(song);
  const originalIcon = shareBtn.textContent;
  const originalTitle = shareBtn.title;

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mera-radio-now-playing.png';
    a.click();
    URL.revokeObjectURL(url);
    shareBtn.textContent = '✓';
    shareBtn.title = 'saved';
    setTimeout(() => {
      shareBtn.textContent = originalIcon;
      shareBtn.title = originalTitle;
    }, 1400);
  }, 'image/png');
});

// ---------- init ----------

updateAmbientButtonLabel();
updateClock();
setInterval(updateClock, 15000);
