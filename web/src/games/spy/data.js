// Direct port of js/data-spy.js — content unchanged.
// Word pairs per theme. Each pair = { main, spy }.
// The Spy gets `spy`, everyone else gets `main`. Words in a pair are related
// but distinct, so the Spy can bluff without knowing the real word.
export const SPY_THEMES = {
  "Profession": [
    { main: "Doctor", spy: "Nurse" },
    { main: "Chef", spy: "Waiter" },
    { main: "Teacher", spy: "Principal" },
    { main: "Police Officer", spy: "Security Guard" },
    { main: "Pilot", spy: "Flight Attendant" },
    { main: "Firefighter", spy: "Paramedic" },
    { main: "Photographer", spy: "Videographer" },
    { main: "Lawyer", spy: "Judge" },
    { main: "Architect", spy: "Engineer" },
    { main: "Farmer", spy: "Gardener" }
  ],
  "Food": [
    { main: "Pizza", spy: "Pasta" },
    { main: "Burger", spy: "Hot Dog" },
    { main: "Sushi", spy: "Ramen" },
    { main: "Taco", spy: "Burrito" },
    { main: "Pancake", spy: "Waffle" },
    { main: "Fried Rice", spy: "Noodles" },
    { main: "Sandwich", spy: "Wrap" },
    { main: "Donut", spy: "Cupcake" },
    { main: "Ice Cream", spy: "Frozen Yogurt" },
    { main: "Dumpling", spy: "Spring Roll" }
  ],
  "Vegetables": [
    { main: "Carrot", spy: "Sweet Potato" },
    { main: "Broccoli", spy: "Cauliflower" },
    { main: "Spinach", spy: "Lettuce" },
    { main: "Potato", spy: "Yam" },
    { main: "Onion", spy: "Garlic" },
    { main: "Cucumber", spy: "Zucchini" },
    { main: "Bell Pepper", spy: "Chili Pepper" },
    { main: "Corn", spy: "Peas" },
    { main: "Cabbage", spy: "Kale" },
    { main: "Eggplant", spy: "Squash" }
  ],
  "Fruit": [
    { main: "Apple", spy: "Pear" },
    { main: "Banana", spy: "Plantain" },
    { main: "Mango", spy: "Papaya" },
    { main: "Orange", spy: "Tangerine" },
    { main: "Strawberry", spy: "Raspberry" },
    { main: "Watermelon", spy: "Cantaloupe" },
    { main: "Grapes", spy: "Cherries" },
    { main: "Pineapple", spy: "Coconut" },
    { main: "Lemon", spy: "Lime" },
    { main: "Peach", spy: "Nectarine" }
  ],
  "Animals": [
    { main: "Lion", spy: "Tiger" },
    { main: "Dog", spy: "Wolf" },
    { main: "Cat", spy: "Leopard" },
    { main: "Elephant", spy: "Rhino" },
    { main: "Dolphin", spy: "Shark" },
    { main: "Eagle", spy: "Hawk" },
    { main: "Horse", spy: "Zebra" },
    { main: "Rabbit", spy: "Hare" },
    { main: "Penguin", spy: "Seal" },
    { main: "Monkey", spy: "Gorilla" }
  ],
  "Famous Places in the Philippines": [
    { main: "Boracay", spy: "Palawan" },
    { main: "Chocolate Hills", spy: "Banaue Rice Terraces" },
    { main: "Mayon Volcano", spy: "Taal Volcano" },
    { main: "Intramuros", spy: "Fort Santiago" },
    { main: "Rizal Park", spy: "Manila Bay" },
    { main: "Vigan", spy: "Sagada" },
    { main: "Siargao", spy: "Bohol" },
    { main: "Mall of Asia", spy: "SM North EDSA" },
    { main: "Divisoria", spy: "Quiapo" },
    { main: "Baguio", spy: "Tagaytay" }
  ],

  // ---- Specific subthemes derived from Quiz Night's broader categories ----
  "SpongeBob Characters": [
    { main: "SpongeBob SquarePants", spy: "Patrick Star" },
    { main: "Squidward Tentacles", spy: "Squilliam Fancyson" },
    { main: "Mr. Krabs", spy: "Plankton" },
    { main: "Sandy Cheeks", spy: "Pearl Krabs" },
    { main: "Gary the Snail", spy: "Mrs. Puff" },
    { main: "Mermaid Man", spy: "Barnacle Boy" }
  ],
  "Marvel Heroes": [
    { main: "Iron Man", spy: "Captain America" },
    { main: "Spider-Man", spy: "Daredevil" },
    { main: "Thor", spy: "Hulk" },
    { main: "Black Panther", spy: "Black Widow" },
    { main: "Doctor Strange", spy: "Scarlet Witch" },
    { main: "Wolverine", spy: "Deadpool" }
  ],
  "Marvel Villains": [
    { main: "Thanos", spy: "Ultron" },
    { main: "Loki", spy: "Green Goblin" },
    { main: "Magneto", spy: "Doctor Doom" },
    { main: "Venom", spy: "Carnage" },
    { main: "Red Skull", spy: "Baron Zemo" },
    { main: "Killmonger", spy: "Kingpin" }
  ],
  "MCU Movies": [
    { main: "Iron Man", spy: "The Incredible Hulk" },
    { main: "Black Panther", spy: "Doctor Strange" },
    { main: "Thor: Ragnarok", spy: "Guardians of the Galaxy" },
    { main: "Avengers: Infinity War", spy: "Avengers: Endgame" },
    { main: "Captain America: Civil War", spy: "Captain America: The Winter Soldier" },
    { main: "Spider-Man: Homecoming", spy: "Spider-Man: Far From Home" }
  ],
  "Marvel Locations": [
    { main: "Wakanda", spy: "Asgard" },
    { main: "Sokovia", spy: "Knowhere" },
    { main: "Titan", spy: "Xandar" },
    { main: "Sanctum Sanctorum", spy: "Avengers Tower" },
    { main: "Hydra Base", spy: "S.H.I.E.L.D. Headquarters" },
    { main: "Xavier's School for Gifted Youngsters", spy: "Genosha" }
  ],
  "Marvel Superpowers": [
    { main: "Super Strength", spy: "Super Speed" },
    { main: "Flight", spy: "Teleportation" },
    { main: "Telepathy", spy: "Telekinesis" },
    { main: "Invisibility", spy: "Shape-shifting" },
    { main: "Healing Factor", spy: "Immortality" },
    { main: "Energy Blasts", spy: "Force Fields" }
  ],
  "Dragon Ball Characters": [
    { main: "Goku", spy: "Vegeta" },
    { main: "Piccolo", spy: "Gohan" },
    { main: "Frieza", spy: "Cell" },
    { main: "Bulma", spy: "Chi-Chi" },
    { main: "Trunks", spy: "Goten" },
    { main: "Master Roshi", spy: "Krillin" }
  ],
  "Naruto Characters": [
    { main: "Naruto Uzumaki", spy: "Sasuke Uchiha" },
    { main: "Sakura Haruno", spy: "Hinata Hyuga" },
    { main: "Kakashi Hatake", spy: "Might Guy" },
    { main: "Itachi Uchiha", spy: "Madara Uchiha" },
    { main: "Jiraiya", spy: "Orochimaru" },
    { main: "Gaara", spy: "Rock Lee" }
  ],
  "One Piece Characters": [
    { main: "Monkey D. Luffy", spy: "Roronoa Zoro" },
    { main: "Nami", spy: "Nico Robin" },
    { main: "Sanji", spy: "Usopp" },
    { main: "Trafalgar Law", spy: "Portgas D. Ace" },
    { main: "Shanks", spy: "Blackbeard" },
    { main: "Chopper", spy: "Franky" }
  ],
  "Demon Slayer Characters": [
    { main: "Tanjiro Kamado", spy: "Nezuko Kamado" },
    { main: "Zenitsu Agatsuma", spy: "Inosuke Hashibira" },
    { main: "Giyu Tomioka", spy: "Shinobu Kocho" },
    { main: "Rengoku", spy: "Tengen Uzui" },
    { main: "Muzan Kibutsuji", spy: "Akaza" },
    { main: "Kanao Tsuyuri", spy: "Mitsuri Kanroji" }
  ],
  "Jujutsu Kaisen Characters": [
    { main: "Yuji Itadori", spy: "Megumi Fushiguro" },
    { main: "Nobara Kugisaki", spy: "Maki Zenin" },
    { main: "Satoru Gojo", spy: "Suguru Geto" },
    { main: "Sukuna", spy: "Mahito" },
    { main: "Nanami Kento", spy: "Choso" },
    { main: "Yuta Okkotsu", spy: "Toge Inumaki" }
  ],
  "Anime Locations": [
    { main: "Konohagakure", spy: "Sunagakure" },
    { main: "Wano Country", spy: "Alabasta" },
    { main: "Namek", spy: "Planet Vegeta" },
    { main: "Whole Cake Island", spy: "Dressrosa" },
    { main: "Karakura Town", spy: "Soul Society" },
    { main: "Tokyo", spy: "Kyoto" }
  ],
  "Anime Powers": [
    { main: "Chakra", spy: "Ki Energy" },
    { main: "Curse Energy", spy: "Nen" },
    { main: "Devil Fruit Powers", spy: "Quirks" },
    { main: "Sharingan", spy: "Byakugan" },
    { main: "Domain Expansion", spy: "Bankai" },
    { main: "Titan Shifting", spy: "Breathing Techniques" }
  ],
  "Disney Movies": [
    { main: "The Lion King", spy: "Aladdin" },
    { main: "Frozen", spy: "Moana" },
    { main: "Beauty and the Beast", spy: "The Little Mermaid" },
    { main: "Tangled", spy: "Encanto" },
    { main: "Zootopia", spy: "Wreck-It Ralph" },
    { main: "Mulan", spy: "Pocahontas" }
  ],
  "Pixar Characters": [
    { main: "Woody", spy: "Buzz Lightyear" },
    { main: "Nemo", spy: "Dory" },
    { main: "Lightning McQueen", spy: "Mater" },
    { main: "Sulley", spy: "Mike Wazowski" },
    { main: "Remy", spy: "Linguini" },
    { main: "Joy", spy: "Sadness" }
  ],
  "Netflix Shows": [
    { main: "Stranger Things", spy: "Wednesday" },
    { main: "Money Heist", spy: "Squid Game" },
    { main: "The Witcher", spy: "Bridgerton" },
    { main: "Cobra Kai", spy: "Outer Banks" },
    { main: "You", spy: "Dahmer" },
    { main: "Ozark", spy: "Narcos" }
  ],
  "Sitcom Characters": [
    { main: "Ross Geller", spy: "Chandler Bing" },
    { main: "Michael Scott", spy: "Dwight Schrute" },
    { main: "Sheldon Cooper", spy: "Leonard Hofstadter" },
    { main: "Barney Stinson", spy: "Ted Mosby" },
    { main: "Homer Simpson", spy: "Peter Griffin" },
    { main: "Jerry Seinfeld", spy: "George Costanza" }
  ],
  "Famous Movie Characters": [
    { main: "James Bond", spy: "Jason Bourne" },
    { main: "Batman", spy: "Superman" },
    { main: "Harry Potter", spy: "Percy Jackson" },
    { main: "Indiana Jones", spy: "Lara Croft" },
    { main: "Darth Vader", spy: "Voldemort" },
    { main: "Rocky Balboa", spy: "Ip Man" }
  ],
  "Video Game Characters": [
    { main: "Mario", spy: "Luigi" },
    { main: "Sonic the Hedgehog", spy: "Shadow the Hedgehog" },
    { main: "Master Chief", spy: "Kratos" },
    { main: "Link", spy: "Zelda" },
    { main: "Lara Croft", spy: "Nathan Drake" },
    { main: "Pikachu", spy: "Charizard" }
  ],
  "OPM Artists": [
    { main: "Freddie Aguilar", spy: "Rico J. Puno" },
    { main: "Regine Velasquez", spy: "Sarah Geronimo" },
    { main: "Eraserheads", spy: "Rivermaya" },
    { main: "Gary Valenciano", spy: "Martin Nievera" },
    { main: "Moira Dela Torre", spy: "Ben&Ben" },
    { main: "SB19", spy: "BINI" }
  ],
  "K-Pop Groups": [
    { main: "BTS", spy: "EXO" },
    { main: "BLACKPINK", spy: "TWICE" },
    { main: "Stray Kids", spy: "SEVENTEEN" },
    { main: "NewJeans", spy: "IVE" },
    { main: "Red Velvet", spy: "Girls' Generation" },
    { main: "NCT", spy: "ATEEZ" }
  ],
  "International Singers": [
    { main: "Taylor Swift", spy: "Ariana Grande" },
    { main: "Ed Sheeran", spy: "Justin Bieber" },
    { main: "Beyoncé", spy: "Rihanna" },
    { main: "Bruno Mars", spy: "The Weeknd" },
    { main: "Adele", spy: "Sam Smith" },
    { main: "Shakira", spy: "Selena Gomez" }
  ],
  "Rock Bands": [
    { main: "The Beatles", spy: "The Rolling Stones" },
    { main: "Queen", spy: "Led Zeppelin" },
    { main: "Nirvana", spy: "Pearl Jam" },
    { main: "Guns N' Roses", spy: "Metallica" },
    { main: "Coldplay", spy: "Imagine Dragons" },
    { main: "Linkin Park", spy: "Green Day" }
  ],
  "Song Titles": [
    { main: "Shape of You", spy: "Blinding Lights" },
    { main: "Bohemian Rhapsody", spy: "Hotel California" },
    { main: "Anak", spy: "Ang Huling El Bimbo" },
    { main: "Despacito", spy: "Gangnam Style" },
    { main: "Dynamite", spy: "Butter" },
    { main: "Someone Like You", spy: "Rolling in the Deep" }
  ],
  "Musical Instruments": [
    { main: "Guitar", spy: "Bass Guitar" },
    { main: "Piano", spy: "Keyboard" },
    { main: "Violin", spy: "Cello" },
    { main: "Drums", spy: "Cajon" },
    { main: "Flute", spy: "Clarinet" },
    { main: "Trumpet", spy: "Saxophone" }
  ],
  "Basketball Players": [
    { main: "LeBron James", spy: "Kobe Bryant" },
    { main: "Michael Jordan", spy: "Magic Johnson" },
    { main: "Stephen Curry", spy: "Klay Thompson" },
    { main: "Kevin Durant", spy: "James Harden" },
    { main: "Giannis Antetokounmpo", spy: "Nikola Jokic" },
    { main: "June Mar Fajardo", spy: "Kiefer Ravena" }
  ],
  "NBA Teams": [
    { main: "Los Angeles Lakers", spy: "Boston Celtics" },
    { main: "Golden State Warriors", spy: "Miami Heat" },
    { main: "Chicago Bulls", spy: "New York Knicks" },
    { main: "Brooklyn Nets", spy: "Philadelphia 76ers" },
    { main: "Milwaukee Bucks", spy: "Denver Nuggets" },
    { main: "San Antonio Spurs", spy: "Dallas Mavericks" }
  ],
  "Football Players": [
    { main: "Lionel Messi", spy: "Cristiano Ronaldo" },
    { main: "Neymar Jr.", spy: "Kylian Mbappé" },
    { main: "Pelé", spy: "Diego Maradona" },
    { main: "Kevin De Bruyne", spy: "Erling Haaland" },
    { main: "David Beckham", spy: "Zinedine Zidane" },
    { main: "Luka Modrić", spy: "Karim Benzema" }
  ],
  "Football Teams": [
    { main: "Real Madrid", spy: "FC Barcelona" },
    { main: "Manchester United", spy: "Manchester City" },
    { main: "Liverpool FC", spy: "Chelsea FC" },
    { main: "Bayern Munich", spy: "Borussia Dortmund" },
    { main: "Juventus", spy: "AC Milan" },
    { main: "Paris Saint-Germain", spy: "Arsenal" }
  ],
  "Olympic Sports": [
    { main: "Swimming", spy: "Diving" },
    { main: "Track and Field", spy: "Marathon" },
    { main: "Gymnastics", spy: "Figure Skating" },
    { main: "Weightlifting", spy: "Wrestling" },
    { main: "Volleyball", spy: "Badminton" },
    { main: "Archery", spy: "Fencing" }
  ],
  "Sports Equipment": [
    { main: "Basketball", spy: "Volleyball" },
    { main: "Tennis Racket", spy: "Badminton Racket" },
    { main: "Soccer Ball", spy: "Rugby Ball" },
    { main: "Baseball Bat", spy: "Cricket Bat" },
    { main: "Boxing Gloves", spy: "Shin Guards" },
    { main: "Golf Club", spy: "Hockey Stick" }
  ],
  "College Courses": [
    { main: "BS Computer Science", spy: "BS Information Technology" },
    { main: "BS Nursing", spy: "BS Medical Technology" },
    { main: "BS Civil Engineering", spy: "BS Electrical Engineering" },
    { main: "BS Architecture", spy: "BS Interior Design" },
    { main: "BS Business Administration", spy: "BS Accountancy" },
    { main: "BS Education", spy: "BS Psychology" }
  ],
  "Computer Science Terms": [
    { main: "Algorithm", spy: "Flowchart" },
    { main: "Variable", spy: "Constant" },
    { main: "Compiler", spy: "Interpreter" },
    { main: "Array", spy: "Linked List" },
    { main: "Frontend", spy: "Backend" },
    { main: "Bug", spy: "Glitch" }
  ],
  "Engineering Terms": [
    { main: "Blueprint", spy: "Schematic" },
    { main: "Voltage", spy: "Current" },
    { main: "Torque", spy: "Horsepower" },
    { main: "Load", spy: "Stress" },
    { main: "Prototype", spy: "Model" },
    { main: "Circuit", spy: "Wiring" }
  ],
  "Business Terms": [
    { main: "Revenue", spy: "Profit" },
    { main: "Supply", spy: "Demand" },
    { main: "Asset", spy: "Liability" },
    { main: "Merger", spy: "Acquisition" },
    { main: "Stakeholder", spy: "Shareholder" },
    { main: "Startup", spy: "Franchise" }
  ],
  "Medical Terms": [
    { main: "Diagnosis", spy: "Prognosis" },
    { main: "Symptom", spy: "Syndrome" },
    { main: "Vaccine", spy: "Antibiotic" },
    { main: "Surgery", spy: "Therapy" },
    { main: "Fracture", spy: "Sprain" },
    { main: "Virus", spy: "Bacteria" }
  ],
  "Education Terms": [
    { main: "Curriculum", spy: "Syllabus" },
    { main: "Lecture", spy: "Seminar" },
    { main: "Quiz", spy: "Exam" },
    { main: "Scholarship", spy: "Grant" },
    { main: "Thesis", spy: "Dissertation" },
    { main: "Tutor", spy: "Mentor" }
  ],
  "Architecture Terms": [
    { main: "Blueprint", spy: "Floor Plan" },
    { main: "Column", spy: "Beam" },
    { main: "Facade", spy: "Foundation" },
    { main: "Skyscraper", spy: "Bungalow" },
    { main: "Dome", spy: "Arch" },
    { main: "Minimalist", spy: "Modernist" }
  ],
  "Philippine Provinces": [
    { main: "Cebu", spy: "Bohol" },
    { main: "Batangas", spy: "Cavite" },
    { main: "Pampanga", spy: "Bulacan" },
    { main: "Palawan", spy: "Bataan" },
    { main: "Ilocos Norte", spy: "Ilocos Sur" },
    { main: "Davao del Sur", spy: "Davao del Norte" }
  ],
  "Philippine Cities": [
    { main: "Manila", spy: "Quezon City" },
    { main: "Cebu City", spy: "Davao City" },
    { main: "Baguio", spy: "Tagaytay" },
    { main: "Iloilo City", spy: "Bacolod" },
    { main: "Makati", spy: "Taguig" },
    { main: "Zamboanga City", spy: "Cagayan de Oro" }
  ],
  "Filipino Celebrities": [
    { main: "Vice Ganda", spy: "Ai-Ai delas Alas" },
    { main: "Coco Martin", spy: "Piolo Pascual" },
    { main: "Kathryn Bernardo", spy: "Daniel Padilla" },
    { main: "Sarah Geronimo", spy: "Regine Velasquez" },
    { main: "Manny Pacquiao", spy: "Nonito Donaire" },
    { main: "Anne Curtis", spy: "Toni Gonzaga" }
  ],
  "Filipino Food": [
    { main: "Adobo", spy: "Sinigang" },
    { main: "Lechon", spy: "Crispy Pata" },
    { main: "Pancit", spy: "Sisig" },
    { main: "Halo-halo", spy: "Turon" },
    { main: "Tapsilog", spy: "Longsilog" },
    { main: "Kare-Kare", spy: "Bulalo" }
  ],
  "Philippine Historical Figures": [
    { main: "José Rizal", spy: "Andrés Bonifacio" },
    { main: "Emilio Aguinaldo", spy: "Apolinario Mabini" },
    { main: "Lapu-Lapu", spy: "Rajah Humabon" },
    { main: "Gabriela Silang", spy: "Melchora Aquino" },
    { main: "Ninoy Aquino", spy: "Ferdinand Marcos Sr." },
    { main: "Corazon Aquino", spy: "Fidel V. Ramos" }
  ],
  "World Capitals": [
    { main: "Tokyo", spy: "Seoul" },
    { main: "Paris", spy: "Rome" },
    { main: "London", spy: "Berlin" },
    { main: "Washington, D.C.", spy: "Ottawa" },
    { main: "Beijing", spy: "Bangkok" },
    { main: "Cairo", spy: "Nairobi" }
  ],
  "Planets of the Solar System": [
    { main: "Mercury", spy: "Venus" },
    { main: "Earth", spy: "Mars" },
    { main: "Jupiter", spy: "Saturn" },
    { main: "Uranus", spy: "Neptune" },
    { main: "Pluto", spy: "Ceres" },
    { main: "Sun", spy: "Moon" }
  ],
  "World Currencies": [
    { main: "US Dollar", spy: "British Pound" },
    { main: "Japanese Yen", spy: "Chinese Yuan" },
    { main: "Euro", spy: "Swiss Franc" },
    { main: "Philippine Peso", spy: "Indonesian Rupiah" },
    { main: "Indian Rupee", spy: "Thai Baht" },
    { main: "South Korean Won", spy: "Singapore Dollar" }
  ],
  "Ancient Civilizations": [
    { main: "Ancient Egypt", spy: "Ancient Greece" },
    { main: "Ancient Rome", spy: "Ancient China" },
    { main: "Maya Civilization", spy: "Aztec Civilization" },
    { main: "Inca Civilization", spy: "Mesopotamia" },
    { main: "Indus Valley Civilization", spy: "Ancient Persia" },
    { main: "Phoenicia", spy: "Ancient Carthage" }
  ],
  "Tech Companies": [
    { main: "Apple", spy: "Samsung" },
    { main: "Google", spy: "Microsoft" },
    { main: "Amazon", spy: "Alibaba" },
    { main: "Meta (Facebook)", spy: "X (Twitter)" },
    { main: "Netflix", spy: "YouTube" },
    { main: "Tesla", spy: "SpaceX" }
  ],
  "International Dishes": [
    { main: "Sushi", spy: "Kimchi" },
    { main: "Pizza", spy: "Paella" },
    { main: "Tacos", spy: "Burritos" },
    { main: "Curry", spy: "Pad Thai" },
    { main: "Croissant", spy: "Pretzel" },
    { main: "Dim Sum", spy: "Ramen" }
  ],
  "Famous Scientists": [
    { main: "Albert Einstein", spy: "Isaac Newton" },
    { main: "Marie Curie", spy: "Nikola Tesla" },
    { main: "Charles Darwin", spy: "Gregor Mendel" },
    { main: "Stephen Hawking", spy: "Carl Sagan" },
    { main: "Galileo Galilei", spy: "Nicolaus Copernicus" },
    { main: "Alexander Graham Bell", spy: "Thomas Edison" }
  ],
  "E-Commerce Platforms": [
    { main: "Shopee", spy: "Lazada" },
    { main: "Amazon", spy: "eBay" },
    { main: "Alibaba", spy: "AliExpress" },
    { main: "Zalora", spy: "Shein" },
    { main: "Facebook Marketplace", spy: "Carousell" },
    { main: "Etsy", spy: "Shopify" }
  ]
};

export const SPY_THEME_ICONS = {
  "Profession": "💼",
  "Food": "🍕",
  "Vegetables": "🥦",
  "Fruit": "🍉",
  "Animals": "🦁",
  "Famous Places in the Philippines": "🏝️",
  "SpongeBob Characters": "🧽",
  "Marvel Heroes": "🦸",
  "Marvel Villains": "🦹",
  "MCU Movies": "🎬",
  "Marvel Locations": "🗺️",
  "Marvel Superpowers": "⚡",
  "Dragon Ball Characters": "🐉",
  "Naruto Characters": "🍥",
  "One Piece Characters": "🏴‍☠️",
  "Demon Slayer Characters": "⚔️",
  "Jujutsu Kaisen Characters": "🔮",
  "Anime Locations": "⛩️",
  "Anime Powers": "💥",
  "Disney Movies": "🏰",
  "Pixar Characters": "🚗",
  "Netflix Shows": "📺",
  "Sitcom Characters": "😂",
  "Famous Movie Characters": "🎥",
  "Video Game Characters": "🎮",
  "OPM Artists": "🎤",
  "K-Pop Groups": "🎶",
  "International Singers": "🌟",
  "Rock Bands": "🎸",
  "Song Titles": "🎵",
  "Musical Instruments": "🎹",
  "Basketball Players": "🏀",
  "NBA Teams": "🏆",
  "Football Players": "⚽",
  "Football Teams": "🥅",
  "Olympic Sports": "🥇",
  "Sports Equipment": "🎽",
  "College Courses": "🎓",
  "Computer Science Terms": "💻",
  "Engineering Terms": "⚙️",
  "Business Terms": "📊",
  "Medical Terms": "🩺",
  "Education Terms": "📚",
  "Architecture Terms": "📐",
  "Philippine Provinces": "🗾",
  "Philippine Cities": "🏙️",
  "Filipino Celebrities": "🌟",
  "Filipino Food": "🍚",
  "Philippine Historical Figures": "🎖️",
  "World Capitals": "🌐",
  "Planets of the Solar System": "🪐",
  "World Currencies": "💵",
  "Ancient Civilizations": "🏛️",
  "Tech Companies": "🖥️",
  "International Dishes": "🍜",
  "Famous Scientists": "🔬",
  "E-Commerce Platforms": "🛒"
};

// Groups themes for the theme-selection screen. Any theme not listed here
// automatically falls into a "More Themes" group, so new themes can be
// added to SPY_THEMES above without touching this map.
export const SPY_THEME_GROUPS = {
  "Classics": ["Profession", "Food", "Vegetables", "Fruit", "Animals"],
  "Pop Culture": [
    "SpongeBob Characters", "Marvel Heroes", "Marvel Villains", "MCU Movies", "Marvel Locations", "Marvel Superpowers",
    "Dragon Ball Characters", "Naruto Characters", "One Piece Characters", "Demon Slayer Characters", "Jujutsu Kaisen Characters", "Anime Locations", "Anime Powers",
    "Disney Movies", "Pixar Characters", "Netflix Shows", "Sitcom Characters", "Famous Movie Characters", "Video Game Characters"
  ],
  "Music": ["OPM Artists", "K-Pop Groups", "International Singers", "Rock Bands", "Song Titles", "Musical Instruments"],
  "Sports": ["Basketball Players", "NBA Teams", "Football Players", "Football Teams", "Olympic Sports", "Sports Equipment"],
  "Academic": ["College Courses", "Computer Science Terms", "Engineering Terms", "Business Terms", "Medical Terms", "Education Terms", "Architecture Terms"],
  "Philippines": ["Famous Places in the Philippines", "Philippine Provinces", "Philippine Cities", "Filipino Celebrities", "Filipino Food", "Philippine Historical Figures"],
  "General Knowledge": ["World Capitals", "Planets of the Solar System", "World Currencies", "Ancient Civilizations", "Tech Companies", "International Dishes", "Famous Scientists", "E-Commerce Platforms"]
};
