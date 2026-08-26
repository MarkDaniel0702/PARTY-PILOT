// Direct port of js/data-quiz.js — content unchanged.
// Built-in quiz question bank (works fully offline).
// Structure: QUIZ_THEMES[themeName] = { icon, categories: [{ name, questions: {100:{q,a},200:{...},300:{...},400:{...},500:{...}} }] }
export const QUIZ_THEMES = {
  "Cartoons": {
    icon: "📼",
    categories: [
      {
        name: "Disney Channel",
        questions: {
          100: [
            { q: "Which Disney Channel show follows twin brothers running a hotel suite in New York City?", a: "The Suite Life of Zack & Cody" },
            { q: "Which Disney Channel show stars Miley Cyrus as a girl living a double life as a famous pop star?", a: "Hannah Montana" },
            { q: "Which Disney Channel show stars Raven Baxter, a teenager with the psychic ability to see glimpses of the future?", a: "That's So Raven" }
          ],
          200: [
            { q: "In 'Wizards of Waverly Place', what is the last name of the wizard family?", a: "Russo" },
            { q: "In 'The Suite Life of Zack & Cody', what is the name of the hotel where the twins live?", a: "The Tipton Hotel" },
            { q: "Which Disney Channel show follows aspiring pop star Sonny Munroe joining a sketch comedy show called 'So Random!'?", a: "Sonny with a Chance" }
          ],
          300: [
            { q: "Which Disney Channel Original Movie franchise centers on basketball player Troy Bolton?", a: "High School Musical" },
            { q: "What is the name of the high school in the 'High School Musical' film series?", a: "East High School" },
            { q: "Which actress played Gabriella Montez, Troy Bolton's love interest, in the 'High School Musical' trilogy?", a: "Vanessa Hudgens" }
          ],
          400: [
            { q: "In 'Hannah Montana', what is the name of Miley's best friend, played by Emily Osment?", a: "Lilly Truscott" },
            { q: "What is the name of Hannah Montana's father and manager, played by Billy Ray Cyrus?", a: "Robby Ray Stewart" },
            { q: "In 'Wizards of Waverly Place', what is the name of Alex's older brother who ultimately becomes the family wizard?", a: "Justin Russo" }
          ],
          500: [
            { q: "What was the first-ever Disney Channel Original Movie, released in 1997?", a: "Under Wraps" },
            { q: "In what year did Disney Channel transition from a premium subscription channel to a widely available, ad-supported basic cable channel?", a: "1997" },
            { q: "Which actress starred in the title roles of the Disney Channel Original Movie 'Cadet Kelly', playing a spoiled teen sent to military school?", a: "Hilary Duff" }
          ]
        }
      },
      {
        name: "Cartoon Network",
        questions: {
          100: [
            { q: "What is the name of the boy genius with a secret lab hidden in his family's house?", a: "Dexter (Dexter's Laboratory)" },
            { q: "Which Cartoon Network show follows a boy named Mac and his imaginary friend, a red gumball-shaped creature named Bloo?", a: "Foster's Home for Imaginary Friends" },
            { q: "Which Cartoon Network series stars a boy named Gumball, a blue cat, living in the town of Elmore?", a: "The Amazing World of Gumball" }
          ],
          200: [
            { q: "In 'Adventure Time', what is the name of Finn's shape-shifting dog best friend?", a: "Jake" },
            { q: "What is the name of the fictional post-apocalyptic land where 'Adventure Time' takes place?", a: "The Land of Ooo" },
            { q: "In 'Teen Titans', what is the name of the team's half-human, half-demon empath member?", a: "Raven" }
          ],
          300: [
            { q: "Which Cartoon Network series follows super-powered sisters defending the city of Townsville?", a: "The Powerpuff Girls" },
            { q: "What are the names of the three Powerpuff Girls?", a: "Blossom, Bubbles, and Buttercup" },
            { q: "Which Cartoon Network scientist created the Powerpuff Girls using sugar, spice, and everything nice, plus an accidental extra ingredient?", a: "Professor Utonium" }
          ],
          400: [
            { q: "In 'Ben 10', what is the name of the alien-transforming watch device Ben Tennyson wears?", a: "The Omnitrix" },
            { q: "In 'Ben 10', what is the name of Ben Tennyson's cousin who accompanies him on his adventures?", a: "Gwen Tennyson" },
            { q: "Which Cartoon Network series follows Billy, Mandy, and the Grim Reaper after the two kids win a bet against Death?", a: "The Grim Adventures of Billy & Mandy" }
          ],
          500: [
            { q: "In what year did Cartoon Network first launch as a television channel in the United States?", a: "1992" },
            { q: "Which media company originally launched Cartoon Network in 1992, using its library of MGM and Hanna-Barbera cartoons?", a: "Turner Broadcasting System" },
            { q: "In what year did Cartoon Network launch its late-night programming block, Adult Swim?", a: "2001" }
          ]
        }
      },
      {
        name: "Nickelodeon",
        questions: {
          100: [
            { q: "Who lives in a pineapple under the sea?", a: "SpongeBob SquarePants" },
            { q: "Which Nickelodeon animated series follows a mischievous baby named Tommy Pickles and his friends?", a: "Rugrats" },
            { q: "Which Nickelodeon show stars a talking dog named Blue whose paw prints lead to clues in each episode?", a: "Blue's Clues" }
          ],
          200: [
            { q: "In 'Hey Arnold!', what unusual shape is Arnold's head often compared to?", a: "A football" },
            { q: "In 'Hey Arnold!', what is the name of the city where the show is set?", a: "Hillwood" },
            { q: "Which Nickelodeon series follows a boy named Timmy Turner who is granted two magical fairies as godparents?", a: "The Fairly OddParents" }
          ],
          300: [
            { q: "In Nickelodeon's 'Avatar: The Last Airbender', the four nations are named after which four elements?", a: "Water, Earth, Fire, and Air" },
            { q: "In 'Avatar: The Last Airbender', what is the name of the young Avatar who must master all four elements?", a: "Aang" },
            { q: "Which Nickelodeon series, a sequel to 'Avatar: The Last Airbender', follows Avatar Korra?", a: "The Legend of Korra" }
          ],
          400: [
            { q: "In 'Rugrats', what is the name of Tommy Pickles' baby brother introduced later in the series?", a: "Dil Pickles" },
            { q: "In 'Rugrats', what is the name of the doll that Angelica Pickles treats as her only confidant and best friend?", a: "Cynthia" },
            { q: "In 'Invader Zim', what is the name of Zim's malfunctioning robot servant/sidekick?", a: "GIR" }
          ],
          500: [
            { q: "In 'SpongeBob SquarePants', what is the full name of Plankton's supercomputer wife?", a: "Karen Plankton" },
            { q: "In 'SpongeBob SquarePants', what is the full name of the Krusty Krab's owner, Mr. Krabs?", a: "Eugene H. Krabs" },
            { q: "In 'SpongeBob SquarePants', what is the name of the boating school SpongeBob repeatedly fails to graduate from?", a: "Mrs. Puff's Boating School" }
          ]
        }
      }
    ]
  },
  "World Geography": {
    icon: "🌍",
    categories: [
      {
        name: "Countries",
        questions: {
          100: [
            { q: "Which country is also a continent?", a: "Australia" },
            { q: "What is the largest country in the world by land area?", a: "Russia" },
            { q: "Which country has the largest population in the world, as of the mid-2020s?", a: "India" }
          ],
          200: [
            { q: "Which African country was formerly known as Abyssinia and is famous for never being colonized?", a: "Ethiopia" },
            { q: "Which country is known as the 'Land of the Rising Sun'?", a: "Japan" },
            { q: "Which South American country is home to the largest share of the Amazon Rainforest?", a: "Brazil" }
          ],
          300: [
            { q: "Which is the only country that borders both France and Spain?", a: "Andorra" },
            { q: "Which transcontinental country has its largest city, Istanbul, split between Europe and Asia by the Bosphorus Strait?", a: "Turkey" },
            { q: "Which country completely surrounds San Marino, one of the smallest nations in the world?", a: "Italy" }
          ],
          400: [
            { q: "Which is the only country in the world with a non-rectangular national flag?", a: "Nepal" },
            { q: "Which country's English name contains all five vowels (a, e, i, o, u) exactly once?", a: "Mozambique" },
            { q: "Which landlocked country is completely surrounded by South Africa?", a: "Lesotho" }
          ],
          500: [
            { q: "Which African country has three capital cities: Pretoria, Cape Town, and Bloemfontein?", a: "South Africa" },
            { q: "Which country has the world's shortest coastline of any coastal nation, at just over 4 kilometers?", a: "Monaco" },
            { q: "Which country is widely cited as the only nation named after a real historical woman, its patron saint?", a: "Saint Lucia" }
          ]
        }
      },
      {
        name: "Capitals",
        questions: {
          100: [
            { q: "What is the capital of Japan?", a: "Tokyo" },
            { q: "What is the capital of France?", a: "Paris" },
            { q: "What is the capital of the United States?", a: "Washington, D.C." }
          ],
          200: [
            { q: "What is the capital of Canada?", a: "Ottawa" },
            { q: "What is the capital of Australia?", a: "Canberra" },
            { q: "What is the capital of Egypt?", a: "Cairo" }
          ],
          300: [
            { q: "What is the capital of Kazakhstan?", a: "Astana" },
            { q: "What is the capital of Turkey (not its largest city, Istanbul)?", a: "Ankara" },
            { q: "What is the capital of South Korea?", a: "Seoul" }
          ],
          400: [
            { q: "What is the official capital of Sri Lanka (distinct from its largest city, Colombo)?", a: "Sri Jayawardenepura Kotte" },
            { q: "What is the seat of government of Bolivia, though Sucre is the country's official constitutional capital?", a: "La Paz" },
            { q: "What is the capital of Myanmar (Burma), a purpose-built city that replaced Yangon in 2006?", a: "Naypyidaw" }
          ],
          500: [
            { q: "Which tiny Pacific island nation has no official capital city, with Yaren District serving as its de facto seat of government?", a: "Nauru" },
            { q: "Ngerulmud, one of the world's least-populated national capitals, is the capital of which Pacific island nation?", a: "Palau" },
            { q: "What is the capital of Ivory Coast (Côte d'Ivoire), though Abidjan is the country's largest city and economic hub?", a: "Yamoussoukro" }
          ]
        }
      },
      {
        name: "Landmarks",
        questions: {
          100: [
            { q: "The Eiffel Tower is located in which city?", a: "Paris" },
            { q: "The Statue of Liberty stands in the harbor of which U.S. city?", a: "New York City" },
            { q: "The Great Wall is located in which country?", a: "China" }
          ],
          200: [
            { q: "Machu Picchu, the ancient Inca citadel, is located in which country?", a: "Peru" },
            { q: "The Colosseum, an ancient Roman amphitheater, is located in which city?", a: "Rome" },
            { q: "Stonehenge, the prehistoric stone circle, is located in which country?", a: "England (United Kingdom)" }
          ],
          300: [
            { q: "The Great Sphinx of Giza is most closely associated with which pharaoh?", a: "Khafre" },
            { q: "The Taj Mahal, built by Mughal emperor Shah Jahan, is located in which country?", a: "India" },
            { q: "Which mountain range contains Mount Everest, the world's tallest peak?", a: "The Himalayas" }
          ],
          400: [
            { q: "The ancient city of Petra, carved into rose-colored rock, is located in which country?", a: "Jordan" },
            { q: "The ancient Maya ruins of Chichén Itzá, home to the pyramid El Castillo, are located in which country?", a: "Mexico" },
            { q: "Which UNESCO-listed salt flat, the largest in the world, is located in Bolivia?", a: "Salar de Uyuni" }
          ],
          500: [
            { q: "Which UNESCO World Heritage Site in Cambodia is the largest religious monument in the world by land area?", a: "Angkor Wat" },
            { q: "The Moai statues, massive stone figures carved by the Rapa Nui people, are found on which remote island?", a: "Easter Island" },
            { q: "Which ancient Mesopotamian ziggurat, located in modern-day Iraq, was dedicated to the moon god Nanna?", a: "The Great Ziggurat of Ur" }
          ]
        }
      }
    ]
  },
  "Science": {
    icon: "🔬",
    categories: [
      {
        name: "Space",
        questions: {
          100: [
            { q: "Which planet is known as the Red Planet?", a: "Mars" },
            { q: "What is the closest star to Earth?", a: "The Sun" },
            { q: "Which planet is the largest in our solar system?", a: "Jupiter" }
          ],
          200: [
            { q: "What is the name of the galaxy that contains our solar system?", a: "The Milky Way" },
            { q: "What is the name of the natural satellite that orbits Earth?", a: "The Moon" },
            { q: "Which space agency landed the first humans on the Moon in 1969?", a: "NASA" }
          ],
          300: [
            { q: "What is the term for the boundary around a black hole beyond which nothing can escape?", a: "The event horizon" },
            { q: "What is the term for a star's explosive death, resulting in a brief, extremely bright burst of light?", a: "A supernova" },
            { q: "What is the name of the force that keeps planets in orbit around the Sun?", a: "Gravity" }
          ],
          400: [
            { q: "What is the name of the visible surface layer of the Sun?", a: "The photosphere" },
            { q: "What is the term for a dying star that expands into a huge, cool, luminous star before shedding its outer layers?", a: "A red giant" },
            { q: "What is the name given to the leftover thermal radiation from the Big Bang, discovered accidentally in 1965?", a: "The Cosmic Microwave Background" }
          ],
          500: [
            { q: "What is the term for a collapsed star composed almost entirely of tightly packed neutrons?", a: "A neutron star" },
            { q: "What is the term for the theoretical point of infinite density at the center of a black hole?", a: "The singularity" },
            { q: "What is the name of the mass threshold, roughly 1.4 solar masses, above which a white dwarf star will collapse into a neutron star or trigger a supernova?", a: "The Chandrasekhar limit" }
          ]
        }
      },
      {
        name: "Human Body",
        questions: {
          100: [
            { q: "What is the largest organ in the human body?", a: "The skin" },
            { q: "How many bones are in the adult human body?", a: "206" },
            { q: "What is the main organ responsible for pumping blood throughout the human body?", a: "The heart" }
          ],
          200: [
            { q: "How many chambers does the human heart have?", a: "Four" },
            { q: "What is the largest internal organ in the human body?", a: "The liver" },
            { q: "How many pairs of ribs does the human body typically have?", a: "Twelve (12 pairs)" }
          ],
          300: [
            { q: "What is the name of the longest bone in the human body?", a: "The femur (thigh bone)" },
            { q: "What part of the brain is responsible for coordinating balance and muscle movement?", a: "The cerebellum" },
            { q: "What is the medical term for the human voice box, containing the vocal cords?", a: "The larynx" }
          ],
          400: [
            { q: "What is the name of the small brain gland often called the 'master gland' because it controls other hormone glands?", a: "The pituitary gland" },
            { q: "What is the name of the small, almond-shaped brain structure that plays a key role in processing fear and emotion?", a: "The amygdala" },
            { q: "What is the name of the fluid-filled sac that surrounds and cushions the heart?", a: "The pericardium" }
          ],
          500: [
            { q: "What is the only bone in the human body that is not connected to another bone?", a: "The hyoid bone" },
            { q: "What is the name of the tiny stirrup-shaped bone in the middle ear, the smallest bone in the human body?", a: "The stapes" },
            { q: "What is the medical term for the bundle of nerves at the base of the spine, resembling a horse's tail?", a: "The cauda equina" }
          ]
        }
      },
      {
        name: "Inventions",
        questions: {
          100: [
            { q: "Who is credited with inventing the telephone?", a: "Alexander Graham Bell" },
            { q: "Who is credited with inventing the first commercially practical light bulb?", a: "Thomas Edison" },
            { q: "Who is credited with inventing the airplane, alongside his brother, in 1903?", a: "The Wright brothers (Orville and Wilbur Wright)" }
          ],
          200: [
            { q: "In which decade did Tim Berners-Lee invent the World Wide Web?", a: "The 1980s (1989)" },
            { q: "Which Scottish inventor's improvements to the steam engine helped power the Industrial Revolution?", a: "James Watt" },
            { q: "Who is credited with developing the first successful vaccine, for smallpox, in 1796?", a: "Edward Jenner" }
          ],
          300: [
            { q: "Which company released the influential Macintosh graphical-interface computer in 1984?", a: "Apple" },
            { q: "Which two Stanford PhD students founded Google in 1998, based on their PageRank search algorithm?", a: "Larry Page and Sergey Brin" },
            { q: "Who is credited with inventing the first practical typewriter, patented in 1868?", a: "Christopher Latham Sholes" }
          ],
          400: [
            { q: "Who is credited with inventing the printing press with movable type in Europe, around 1440?", a: "Johannes Gutenberg" },
            { q: "Who is credited with inventing dynamite in 1867, later founding the Nobel Prize with his fortune?", a: "Alfred Nobel" },
            { q: "Which British engineer designed 'Stephenson's Rocket', pioneering railway locomotive transport in the 1820s?", a: "George Stephenson" }
          ],
          500: [
            { q: "Which Serbian-American inventor is best known for his contributions to the modern alternating current (AC) electricity system?", a: "Nikola Tesla" },
            { q: "Which German engineer is credited with building the first working automobile powered by an internal combustion engine, patented in 1886?", a: "Karl Benz" },
            { q: "Which American engineer, working at Motorola, is credited with inventing the handheld mobile phone and making the first cellular call in 1973?", a: "Martin Cooper" }
          ]
        }
      }
    ]
  },
  "Movies & TV": {
    icon: "🎬",
    categories: [
      {
        name: "Blockbusters",
        questions: {
          100: [
            { q: "Which 1997 film about a doomed ocean liner was the first to gross over $1 billion worldwide?", a: "Titanic" },
            { q: "Which 2019 Marvel film became the highest-grossing film of all time (unadjusted for inflation), until 'Avatar' reclaimed the title?", a: "Avengers: Endgame" },
            { q: "Which 1975 Steven Spielberg film about a great white shark is often considered the first summer blockbuster?", a: "Jaws" }
          ],
          200: [
            { q: "In the Marvel Cinematic Universe, what is the name of Tony Stark's AI assistant?", a: "J.A.R.V.I.S." },
            { q: "Which actor plays Iron Man / Tony Stark in the Marvel Cinematic Universe?", a: "Robert Downey Jr." },
            { q: "Which 1993 Steven Spielberg film brought dinosaurs to life using groundbreaking CGI, based on a Michael Crichton novel?", a: "Jurassic Park" }
          ],
          300: [
            { q: "Which director is known for 'Jaws', 'E.T.', and 'Jurassic Park'?", a: "Steven Spielberg" },
            { q: "Which director is known for the 'Dark Knight' trilogy, 'Inception', and 'Oppenheimer'?", a: "Christopher Nolan" },
            { q: "Which 1977 George Lucas film launched the 'Star Wars' franchise?", a: "Star Wars (Episode IV: A New Hope)" }
          ],
          400: [
            { q: "Which 2009 James Cameron film became the highest-grossing film of all time, surpassing 'Titanic'?", a: "Avatar" },
            { q: "Which director wrote and directed both 'Titanic' and 'Avatar', two of the highest-grossing films of all time?", a: "James Cameron" },
            { q: "Which 2008 Christopher Nolan film, featuring Heath Ledger's Oscar-winning performance as the Joker, became a landmark for the superhero genre?", a: "The Dark Knight" }
          ],
          500: [
            { q: "Which 1941 film, directed by and starring Orson Welles, is frequently cited by critics as the greatest film ever made?", a: "Citizen Kane" },
            { q: "Which 1927 film became the first movie to win the Academy Award for Best Picture?", a: "Wings" },
            { q: "Which 1915 D. W. Griffith film, though a landmark in film technique, is widely condemned today for its racist depiction of the Ku Klux Klan?", a: "The Birth of a Nation" }
          ]
        }
      },
      {
        name: "Animated Films",
        questions: {
          100: [
            { q: "In 'Frozen', what is the name of Elsa and Anna's talking snowman?", a: "Olaf" },
            { q: "In Disney's 'Toy Story', what type of toy is Woody?", a: "A cowboy (pull-string doll)" },
            { q: "What is the name of the clownfish who searches for his son in the Pixar film 'Finding Nemo'?", a: "Marlin" }
          ],
          200: [
            { q: "Which Pixar film follows an old man who ties balloons to his house to fly to South America?", a: "Up" },
            { q: "Which Pixar film follows a rat named Remy who dreams of becoming a chef in Paris?", a: "Ratatouille" },
            { q: "In Disney's 'Aladdin', what is the name of the wish-granting genie originally voiced by Robin Williams?", a: "Genie" }
          ],
          300: [
            { q: "What is the name of the kingdom ruled by Simba's family in Disney's 'The Lion King'?", a: "The Pride Lands" },
            { q: "What is the name of Simba's wise mandrill friend who serves as an advisor in 'The Lion King'?", a: "Rafiki" },
            { q: "In Pixar's 'Inside Out', what is the name of the primary emotion voiced by Amy Poehler who leads Riley's mind?", a: "Joy" }
          ],
          400: [
            { q: "Which 1995 film was the first feature-length movie created entirely with computer-generated imagery (CGI)?", a: "Toy Story" },
            { q: "Which 1937 Disney film was the first full-length animated feature film in movie history?", a: "Snow White and the Seven Dwarfs" },
            { q: "Which animation studio, co-founded by John Lasseter and Ed Catmull, produced 'Toy Story' in partnership with Disney?", a: "Pixar" }
          ],
          500: [
            { q: "Which Japanese animated film, directed by Hayao Miyazaki, won the Academy Award for Best Animated Feature in 2003?", a: "Spirited Away" },
            { q: "Which 1940 Disney film, a collection of animated segments set to classical music, was a box-office failure on release but is now considered a landmark of animation?", a: "Fantasia" },
            { q: "Which stop-motion animated film, directed by Henry Selick and produced by Tim Burton, is set in both Halloween Town and Christmas Town?", a: "The Nightmare Before Christmas" }
          ]
        }
      },
      {
        name: "TV Classics",
        questions: {
          100: [
            { q: "'Friends' is set primarily in which U.S. city?", a: "New York City" },
            { q: "In 'The Simpsons', what is the name of the fictional town where the Simpson family lives?", a: "Springfield" },
            { q: "Which long-running animated sitcom follows the Griffin family in the town of Quahog, Rhode Island?", a: "Family Guy" }
          ],
          200: [
            { q: "In 'Breaking Bad', what is the name of Walter White's criminal alter ego?", a: "Heisenberg" },
            { q: "In 'The Office' (US), what type of company does Dunder Mifflin sell?", a: "Paper" },
            { q: "Which medical drama, set at Seattle Grace Hospital, follows surgeon Meredith Grey?", a: "Grey's Anatomy" }
          ],
          300: [
            { q: "Which HBO fantasy series was based on George R. R. Martin's 'A Song of Ice and Fire' novels?", a: "Game of Thrones" },
            { q: "Which sitcom, set around a group of friends including Sheldon, Leonard, and Penny, focuses on the lives of scientists in Pasadena?", a: "The Big Bang Theory" },
            { q: "Which crime drama anthology series, created by David Simon, is set in Baltimore and often cited as one of the greatest TV shows ever made?", a: "The Wire" }
          ],
          400: [
            { q: "Which sitcom, premiering in 1989, was famously described by its creators as 'a show about nothing'?", a: "Seinfeld" },
            { q: "Which 1970s sitcom, a spin-off of 'All in the Family', was one of the first American shows to feature a Black family in a starring role?", a: "The Jeffersons" },
            { q: "Which anthology horror/sci-fi series, created by Rod Serling, debuted in 1959 and became famous for its twist endings?", a: "The Twilight Zone" }
          ],
          500: [
            { q: "Which 1960s TV series featured one of American television's first scripted interracial kisses, between Captain Kirk and Lieutenant Uhura?", a: "Star Trek (The Original Series)" },
            { q: "Which 1969-1974 British sketch comedy series, featuring John Cleese and Eric Idle, revolutionized sketch comedy with its surreal humor?", a: "Monty Python's Flying Circus" },
            { q: "Which 1951 sitcom, starring Lucille Ball, pioneered filming before a live studio audience using a three-camera setup, a technique still standard today?", a: "I Love Lucy" }
          ]
        }
      }
    ]
  },
  "Marvel": {
    icon: "🦸",
    categories: [
      {
        name: "Marvel Movies",
        questions: {
          100: [
            { q: "Which 2002 film starring Tobey Maguire was the first major blockbuster movie based on Spider-Man?", a: "Spider-Man (2002)" },
            { q: "Which actor played Professor X in the 2000 film 'X-Men'?", a: "Patrick Stewart" },
            { q: "Which actress played Storm in the original 'X-Men' film trilogy (2000-2006)?", a: "Halle Berry" }
          ],
          200: [
            { q: "Which actor played Wolverine in the X-Men film franchise for 17 years, from 2000 to 2017?", a: "Hugh Jackman" },
            { q: "Which actress played Jean Grey in the original 'X-Men' film trilogy?", a: "Famke Janssen" },
            { q: "Which actor starred as the vampire hunter in the 'Blade' film trilogy (1998-2004)?", a: "Wesley Snipes" }
          ],
          300: [
            { q: "Which 2002 Spider-Man villain, played by Willem Dafoe, is the alter ego of Norman Osborn?", a: "The Green Goblin" },
            { q: "Which actor played Doctor Octopus in 'Spider-Man 2' (2004)?", a: "Alfred Molina" },
            { q: "Which director, known for horror films like 'Evil Dead', helmed the original 2002-2007 'Spider-Man' trilogy starring Tobey Maguire?", a: "Sam Raimi" }
          ],
          400: [
            { q: "In the 2000 film 'X-Men', which actress played the shape-shifting mutant Mystique?", a: "Rebecca Romijn" },
            { q: "Which actor played the supervillain Magneto in the original 'X-Men' film trilogy?", a: "Ian McKellen" },
            { q: "Which actor portrayed Bruce Banner in Ang Lee's 2003 film 'Hulk'?", a: "Eric Bana" }
          ],
          500: [
            { q: "Which 1998 film, starring Wesley Snipes as a vampire hunter, is considered one of the first Marvel Comics film adaptations to succeed commercially?", a: "Blade" },
            { q: "Which actor played Captain America in two 1979 made-for-television movies, an early live-action adaptation of the Marvel hero?", a: "Reb Brown" },
            { q: "Which 1990 Marvel film adaptation, directed by Albert Pyun, had its intended U.S. theatrical release cancelled and went straight to video instead?", a: "Captain America (1990 film)" }
          ]
        }
      },
      {
        name: "MCU",
        questions: {
          100: [
            { q: "What is the first film in the Marvel Cinematic Universe, released in 2008?", a: "Iron Man" },
            { q: "Which actor plays Captain America / Steve Rogers in the MCU?", a: "Chris Evans" },
            { q: "Which actor plays Thor in the Marvel Cinematic Universe?", a: "Chris Hemsworth" }
          ],
          200: [
            { q: "Which 2012 film brought together Iron Man, Captain America, Thor, Hulk, Black Widow, and Hawkeye for the first time?", a: "The Avengers" },
            { q: "Which 2018 MCU film introduced Black Panther as the lead character in his own solo film?", a: "Black Panther" },
            { q: "Which villain, played by Tom Hiddleston, is Thor's adoptive brother and the primary antagonist of 'The Avengers' (2012)?", a: "Loki" }
          ],
          300: [
            { q: "In 'Avengers: Infinity War' and 'Endgame', what are the powerful artifacts Thanos collects to wipe out half of all life called?", a: "The Infinity Stones" },
            { q: "Which actor plays Thanos in the Marvel Cinematic Universe?", a: "Josh Brolin" },
            { q: "What is the name of the plan in 'Avengers: Endgame' in which the surviving heroes travel back in time to retrieve the Infinity Stones?", a: "The Time Heist" }
          ],
          400: [
            { q: "Which actress plays Captain Marvel (Carol Danvers) in the MCU?", a: "Brie Larson" },
            { q: "Which 2021 MCU film, directed by Chloé Zhao, follows a group of ancient alien beings who have secretly protected Earth?", a: "Eternals" },
            { q: "Which actress plays Wanda Maximoff / the Scarlet Witch in the MCU?", a: "Elizabeth Olsen" }
          ],
          500: [
            { q: "What is the official name of the overarching MCU story arc spanning Phases 1 through 3, culminating in 'Avengers: Endgame'?", a: "The Infinity Saga" },
            { q: "What is the official title Marvel Studios gave to the MCU story arc that follows Phases 4 through 6, after the Infinity Saga?", a: "The Multiverse Saga" },
            { q: "Which musician, playing a cosmic character named Eros (Starfox), appeared in the mid-credits scene of 'Eternals' (2021)?", a: "Harry Styles" }
          ]
        }
      },
      {
        name: "Marvel Characters",
        questions: {
          100: [
            { q: "What is the real name of Iron Man?", a: "Tony Stark" },
            { q: "What is the real name of Spider-Man?", a: "Peter Parker" },
            { q: "What is the real name of Captain America?", a: "Steve Rogers" }
          ],
          200: [
            { q: "What is the name of Thor's magical hammer?", a: "Mjolnir" },
            { q: "What is the name of the shield Captain America carries into battle?", a: "The Vibranium Shield" },
            { q: "What color is the Hulk's skin when Bruce Banner transforms in anger?", a: "Green" }
          ],
          300: [
            { q: "What is the name of the villain Thanos's home planet?", a: "Titan" },
            { q: "What is the name of the fictional African nation ruled by the Black Panther?", a: "Wakanda" },
            { q: "What is the name of Doctor Strange's magical cloak that has a mind of its own?", a: "The Cloak of Levitation" }
          ],
          400: [
            { q: "What is the real name of Black Panther, king of Wakanda?", a: "T'Challa" },
            { q: "What is the real name of the mutant leader of the X-Men, Professor X?", a: "Charles Xavier" },
            { q: "What is the real name of the villain Magneto, leader of the Brotherhood of Mutants?", a: "Erik Lehnsherr" }
          ],
          500: [
            { q: "In Marvel Comics, what is the true given name of the mutant anti-hero known as Deadpool?", a: "Wade Wilson" },
            { q: "In Marvel Comics, what is the real name of the villain Doctor Doom, ruler of Latveria?", a: "Victor von Doom" },
            { q: "In Marvel Comics, what is the birth name of the Green Goblin's son, who also becomes a version of the Goblin?", a: "Harry Osborn" }
          ]
        }
      },
      {
        name: "Marvel Comics",
        questions: {
          100: [
            { q: "Which legendary comic book writer co-created Spider-Man, the X-Men, and the Avengers, and made cameo appearances in many Marvel films?", a: "Stan Lee" },
            { q: "Which comic book publisher is home to characters like Spider-Man, the X-Men, and the Avengers?", a: "Marvel Comics" },
            { q: "Which artist co-created the Fantastic Four, the Hulk, and the X-Men alongside Stan Lee, known for his dynamic panel layouts?", a: "Jack Kirby" }
          ],
          200: [
            { q: "In what year did Marvel Comics publish 'Amazing Fantasy #15', the first appearance of Spider-Man?", a: "1962" },
            { q: "In what year did Marvel Comics publish 'Fantastic Four #1', the first appearance of Marvel's first superhero team?", a: "1961" },
            { q: "Which 1963 comic introduced the Avengers as a team for the first time?", a: "The Avengers #1" }
          ],
          300: [
            { q: "Which artist and writer co-created Spider-Man alongside Stan Lee?", a: "Steve Ditko" },
            { q: "Which writer-artist, known for his gritty 1980s run on 'Daredevil', later co-created 'The Dark Knight Returns' for DC Comics?", a: "Frank Miller" },
            { q: "What is the name of the fictional Marvel Comics neighborhood that serves as Daredevil's home turf, based on a real Manhattan neighborhood?", a: "Hell's Kitchen" }
          ],
          400: [
            { q: "Which 1963 Marvel Comics title introduced the X-Men, a team of mutant superheroes led by Professor X?", a: "The X-Men #1 (Uncanny X-Men)" },
            { q: "In what year did Marvel Comics publish 'Iron Man #1' as a standalone ongoing series, following his 1963 debut in 'Tales of Suspense'?", a: "1968" },
            { q: "Which 1981 'Uncanny X-Men' storyline is famous for introducing a dystopian alternate future ruled by Sentinels?", a: "Days of Future Past" }
          ],
          500: [
            { q: "In what year was Marvel Comics founded, originally under the name 'Timely Comics'?", a: "1939" },
            { q: "What was the title of the first comic book published by Marvel's predecessor, Timely Comics, in 1939, featuring the debut of the Human Torch and Namor?", a: "Marvel Comics #1" },
            { q: "Who founded Timely Comics in 1939, the company that would later become Marvel Comics?", a: "Martin Goodman" }
          ]
        }
      }
    ]
  },
  "Anime": {
    icon: "🍜",
    categories: [
      {
        name: "Popular Anime",
        questions: {
          100: [
            { q: "Which anime follows a young ninja named Naruto Uzumaki who dreams of becoming Hokage?", a: "Naruto" },
            { q: "Which anime follows a boy named Tanjiro Kamado who becomes a demon slayer to save his sister?", a: "Demon Slayer (Kimetsu no Yaiba)" },
            { q: "Which anime and manga franchise features Pikachu and a trainer named Ash Ketchum?", a: "Pokémon" }
          ],
          200: [
            { q: "Which anime and manga series follows Monkey D. Luffy as he searches for the ultimate treasure known as the 'One Piece'?", a: "One Piece" },
            { q: "Which anime series follows Izuku Midoriya as he trains to become a hero despite being born without a superpower called a 'Quirk'?", a: "My Hero Academia" },
            { q: "Which classic anime follows Usagi Tsukino, a schoolgirl who transforms into a magical guardian to fight evil?", a: "Sailor Moon" }
          ],
          300: [
            { q: "Which anime features high school student Light Yagami, who obtains a supernatural notebook that can kill anyone whose name is written in it?", a: "Death Note" },
            { q: "Which anime, adapted from a manga by Hiromu Arakawa, follows brothers Edward and Alphonse Elric attempting alchemy to bring back their mother?", a: "Fullmetal Alchemist" },
            { q: "Which anime series, set in a virtual reality MMORPG that traps its players, stars a swordsman named Kirito trying to clear the game to escape?", a: "Sword Art Online" }
          ],
          400: [
            { q: "Which 2013 anime, based on a manga by Hajime Isayama, is set in a world where humanity lives inside walled cities to protect against giant humanoid creatures?", a: "Attack on Titan" },
            { q: "Which 1998 anime, created by Shinichirō Watanabe, follows a crew of bounty hunters traveling aboard a spaceship in a jazz-influenced sci-fi setting?", a: "Cowboy Bebop" },
            { q: "Which anime series, first airing in 1995 and created by Hideaki Anno, follows teenage pilots battling mysterious beings called Angels?", a: "Neon Genesis Evangelion" }
          ],
          500: [
            { q: "Which long-running anime franchise, created by Akira Toriyama, follows Goku through martial arts battles with escalating power levels?", a: "Dragon Ball" },
            { q: "Which manga artist created 'JoJo's Bizarre Adventure', a long-running series known for its dramatic poses and 'Stand' powers, first serialized in 1987?", a: "Hirohiko Araki" },
            { q: "Which anime series, created by Yoshihiro Togashi and adapted into a popular 2011 remake, follows young Gon Freecss as he searches for his father while taking the Hunter Exam?", a: "Hunter x Hunter" }
          ]
        }
      },
      {
        name: "Anime Characters",
        questions: {
          100: [
            { q: "What is the name of the main character in 'Naruto' who wants to become the leader of his village?", a: "Naruto Uzumaki" },
            { q: "What is the name of the schoolgirl protagonist of 'Sailor Moon' who transforms into a magical guardian?", a: "Usagi Tsukino (Sailor Moon)" },
            { q: "What is the name of the pirate captain protagonist of 'One Piece' who wants to become the Pirate King?", a: "Monkey D. Luffy" }
          ],
          200: [
            { q: "In 'My Hero Academia', what is the nickname of the protagonist Izuku Midoriya?", a: "Deku" },
            { q: "In 'Demon Slayer', what is the name of Tanjiro Kamado's younger sister who is turned into a demon?", a: "Nezuko Kamado" },
            { q: "In 'Dragon Ball Z', what is the name of Goku's eldest son, a half-Saiyan known for his own transformation into a Super Saiyan?", a: "Gohan" }
          ],
          300: [
            { q: "In 'Fullmetal Alchemist', what did the Elric brothers Edward and Alphonse each lose while trying to resurrect their mother?", a: "Edward lost an arm and a leg; Alphonse lost his entire body" },
            { q: "In 'One Piece', what is the name of the three-sword-style swordsman who serves as Luffy's first mate?", a: "Roronoa Zoro" },
            { q: "In 'Naruto', what is the name of Naruto's rival and teammate, an Uchiha clan survivor obsessed with avenging his family?", a: "Sasuke Uchiha" }
          ],
          400: [
            { q: "In 'Death Note', what is the name of the shinigami (death god) who drops his notebook into the human world?", a: "Ryuk" },
            { q: "In 'Attack on Titan', what is the name of the protagonist who vows to destroy every Titan after his mother is eaten?", a: "Eren Yeager" },
            { q: "In 'Hunter x Hunter', what is the name of Gon Freecss's best friend, a former assassin from the Zoldyck family?", a: "Killua Zoldyck" }
          ],
          500: [
            { q: "In 'Cowboy Bebop', what is the name of the bounty hunter protagonist who pilots the ship Bebop?", a: "Spike Spiegel" },
            { q: "In 'Neon Genesis Evangelion', what is the name of the mysterious, blue-haired pilot of Evangelion Unit-00?", a: "Rei Ayanami" },
            { q: "In 'JoJo's Bizarre Adventure', what is the real name of the vampiric antagonist who seeks the power of the Stone Mask in Part 1?", a: "Dio Brando" }
          ]
        }
      },
      {
        name: "Anime Movies",
        questions: {
          100: [
            { q: "Which Studio Ghibli film follows a girl named Chihiro who becomes trapped in a magical spirit world?", a: "Spirited Away" },
            { q: "Which 2004 Studio Ghibli film follows a girl named Sophie who is cursed to live in an old woman's body, and features a magical walking castle?", a: "Howl's Moving Castle" },
            { q: "Which Studio Ghibli film follows a young witch named Kiki who starts a delivery service using her flying broom?", a: "Kiki's Delivery Service" }
          ],
          200: [
            { q: "Which Studio Ghibli film features a giant, friendly forest creature named Totoro?", a: "My Neighbor Totoro" },
            { q: "Which Studio Ghibli film follows a red-haired goldfish princess who wants to become human after befriending a young boy named Sosuke?", a: "Ponyo" },
            { q: "Which 2019 Makoto Shinkai anime film follows a boy who moves to Tokyo and discovers a girl who can control the weather?", a: "Weathering with You" }
          ],
          300: [
            { q: "Which 2016 anime film by Makoto Shinkai follows two teenagers who mysteriously swap bodies?", a: "Your Name (Kimi no Na wa)" },
            { q: "Which 1997 Studio Ghibli film follows San, a girl raised by wolves, amid a conflict between forest gods and industrial humans?", a: "Princess Mononoke" },
            { q: "Which 1988 Studio Ghibli war drama, directed by Isao Takahata, follows two siblings trying to survive during the firebombing of Japan in World War II?", a: "Grave of the Fireflies" }
          ],
          400: [
            { q: "Which Studio Ghibli co-founder directed 'Spirited Away', 'Princess Mononoke', and 'My Neighbor Totoro'?", a: "Hayao Miyazaki" },
            { q: "Which longtime composer, known for scoring nearly every Hayao Miyazaki film including 'Spirited Away' and 'Princess Mononoke', is Studio Ghibli's signature musical collaborator?", a: "Joe Hisaishi" },
            { q: "Which 2013 Hayao Miyazaki film is a fictionalized biography of Jiro Horikoshi, designer of the Mitsubishi Zero fighter plane?", a: "The Wind Rises" }
          ],
          500: [
            { q: "Which 1988 anime film, directed by Katsuhiro Otomo and based on his own manga, is a landmark of cyberpunk animation set in 'Neo-Tokyo'?", a: "Akira" },
            { q: "Which 1995 Mamoru Oshii film, a landmark of cyberpunk cinema following cyborg cop Motoko Kusanagi, heavily influenced 'The Matrix'?", a: "Ghost in the Shell" },
            { q: "Which 1997 Satoshi Kon film, his directorial debut, is a psychological thriller about a pop idol stalked after leaving her music career?", a: "Perfect Blue" }
          ]
        }
      },
      {
        name: "Anime Quotes",
        questions: {
          100: [
            { q: "Which catchphrase does Naruto Uzumaki often shout, roughly meaning 'believe it'?", a: "'Dattebayo!'" },
            { q: "What does Luffy repeatedly declare he will become, in his famous catchphrase from 'One Piece'?", a: "'The Pirate King' (King of the Pirates)" },
            { q: "What is the classic catchphrase Pikachu is known for saying, effectively its own name repeated, in the 'Pokémon' anime?", a: "'Pika Pika!'" }
          ],
          200: [
            { q: "In 'My Hero Academia', All Might reassures others with the catchphrase: 'Because I am ___.'", a: "'Because I am here!'" },
            { q: "What does Goku shout as the name of his signature energy-beam attack in the 'Dragon Ball' franchise?", a: "'Kamehameha!'" },
            { q: "In 'One Piece', what does Luffy shout as he stretches his arm back before punching, a signature attack name meaning 'Rubber Gun'?", a: "'Gomu Gomu no Pistol'" }
          ],
          300: [
            { q: "In 'Attack on Titan', what rallying cry do Survey Corps soldiers shout, meaning 'dedicate your heart'?", a: "'Shinzo wo sasageyo!'" },
            { q: "In 'My Hero Academia', what motto, meaning 'go beyond your limit', does All Might live by and pass on to Izuku Midoriya?", a: "'Plus Ultra'" },
            { q: "In 'Naruto', which teacher of Team 7 is famous for the line 'those who break the rules are scum, but those who abandon their comrades are worse than scum'?", a: "Kakashi Hatake" }
          ],
          400: [
            { q: "In 'Fullmetal Alchemist', what is the fundamental law the Elric brothers violate, often summarized as 'you cannot gain something without sacrificing something of equal value'?", a: "Equivalent Exchange" },
            { q: "In 'Attack on Titan', what famous anime-original line does Mikasa tell Eren, describing the world as both harsh and beautiful?", a: "'The world is cruel, but also very beautiful.'" },
            { q: "In 'Cowboy Bebop', what phrase does Spike Spiegel repeatedly use to describe his laid-back philosophy toward fate and the past?", a: "'Whatever happens, happens'" }
          ],
          500: [
            { q: "In 'Death Note', what does Light Yagami famously declare about his role in the world, reflecting his god complex?", a: "'I am the god of the new world.'" },
            { q: "In 'Neon Genesis Evangelion', what mantra does Shinji Ikari repeat to himself throughout the series to fight off his fear and self-doubt?", a: "'I mustn't run away'" },
            { q: "What line, spoken by multiple characters throughout 'Cowboy Bebop' including its finale, refers to the weight of one's past choices?", a: "'You're gonna carry that weight.'" }
          ]
        }
      },
      {
        name: "Anime Trivia",
        questions: {
          100: [
            { q: "What Japanese word is used worldwide to describe hand-drawn or computer-animated shows and films originating from Japan?", a: "Anime" },
            { q: "What is the Japanese honorific suffix '-san' commonly used for, when addressing characters in anime?", a: "A general term of respect (like 'Mr./Ms.')" },
            { q: "What term describes fans dressing up as their favorite anime and video game characters, often at conventions?", a: "Cosplay" }
          ],
          200: [
            { q: "What is the source medium that most anime series are originally adapted from?", a: "Manga (Japanese comics)" },
            { q: "What term describes a genre of Japanese fiction and anime aimed primarily at teenage boys, exemplified by titles like 'Naruto' and 'One Piece'?", a: "Shōnen" },
            { q: "What Japanese term describes fan-made, self-published works, including unofficial manga and anime-inspired comics?", a: "Dōjinshi" }
          ],
          300: [
            { q: "Which Japanese studio, founded in 1985 by Hayao Miyazaki and Isao Takahata, is famous for films like 'Spirited Away' and 'Princess Mononoke'?", a: "Studio Ghibli" },
            { q: "Which Japanese animation studio, founded in 1948 and one of the oldest and largest in the country, has produced 'Dragon Ball', 'Sailor Moon', and 'One Piece'?", a: "Toei Animation" },
            { q: "Which anime studio, founded in 2012 by former Production I.G. staff, produced the first three seasons of 'Attack on Titan' before the series moved to another studio?", a: "WIT Studio" }
          ],
          400: [
            { q: "Which anime and manga series holds the Guinness World Record for most copies published for a comic series by a single author, with over 500 million copies?", a: "One Piece" },
            { q: "Which studio animated the final season of 'Attack on Titan', taking over from WIT Studio starting in 2020?", a: "MAPPA" },
            { q: "What is the title of the longest-running anime television series in history, based on a manga by Machiko Hasegawa and airing continuously since 1969?", a: "Sazae-san" }
          ],
          500: [
            { q: "In what year did 'Astro Boy' (Tetsuwan Atom), created by Osamu Tezuka and considered one of the first popular TV anime, premiere in Japan?", a: "1963" },
            { q: "What is the title of the oldest surviving Japanese animated film, a 1917 short rediscovered in 2007?", a: "Namakura Gatana (The Dull Sword)" },
            { q: "Which pioneering Japanese manga artist, nicknamed the 'Godfather of Manga', created 'Astro Boy' and pioneered the limited-animation techniques that shaped the anime industry's visual style?", a: "Osamu Tezuka" }
          ]
        }
      }
    ]
  },
  "College Programs": {
    icon: "🎓",
    categories: [
      {
        name: "Computer Science",
        questions: {
          100: [
            { q: "What does 'CPU' stand for, the primary component that executes instructions in a computer?", a: "Central Processing Unit" },
            { q: "What does 'RAM' stand for, the type of computer memory used for temporarily storing data the CPU is actively using?", a: "Random Access Memory" },
            { q: "What is the common term for a mistake in a computer program's code that causes it to behave incorrectly?", a: "A bug" }
          ],
          200: [
            { q: "What is the term for a step-by-step set of instructions used to solve a problem or perform a computation?", a: "An algorithm" },
            { q: "What is the general term for a named, reusable block of code that performs a specific task and can be called from elsewhere in a program?", a: "A function (or method)" },
            { q: "What term describes the process of finding and fixing errors in computer code?", a: "Debugging" }
          ],
          300: [
            { q: "In programming, what is the term for a repeated execution of a block of code, such as a 'for' or 'while' structure?", a: "A loop" },
            { q: "What term describes a programming structure that executes different blocks of code depending on whether a condition is true or false, such as an 'if-else' statement?", a: "A conditional statement" },
            { q: "What is the term for a function that calls itself in order to solve a problem by breaking it into smaller subproblems?", a: "Recursion" }
          ],
          400: [
            { q: "What data structure uses a Last-In-First-Out (LIFO) principle, commonly used for undo functions and call stacks?", a: "A stack" },
            { q: "What data structure uses a First-In-First-Out (FIFO) principle, commonly used in task scheduling and print job management?", a: "A queue" },
            { q: "What is the term for a hierarchical data structure made up of nodes, each with a set of children, commonly used in structures like a binary search tree?", a: "A tree" }
          ],
          500: [
            { q: "What is the term for measuring an algorithm's efficiency, expressed with notation such as O(n log n) or O(n²)?", a: "Big O notation" },
            { q: "What term describes a programming paradigm centered on objects that bundle data and behavior together, using concepts like classes, inheritance, and polymorphism?", a: "Object-oriented programming (OOP)" },
            { q: "What is the term for the classic optimization problem where the goal is to find the shortest possible route that visits a set of cities exactly once and returns to the origin?", a: "The Traveling Salesman Problem" }
          ]
        }
      },
      {
        name: "Information Technology",
        questions: {
          100: [
            { q: "What does 'IT' stand for in the context of computing and business?", a: "Information Technology" },
            { q: "What does 'PC' commonly stand for, referring to a computer designed for individual use?", a: "Personal Computer" },
            { q: "What is the common term for the physical components of a computer, such as the monitor, keyboard, and hard drive?", a: "Hardware" }
          ],
          200: [
            { q: "What term describes a network that connects computers within a limited area, such as a single building or campus?", a: "LAN (Local Area Network)" },
            { q: "What term describes a network that connects computers across a large geographic area, such as across cities or countries, exemplified by the internet itself?", a: "WAN (Wide Area Network)" },
            { q: "What is the common term for a secure network connection that lets remote users access a network as if directly connected, often used for remote work?", a: "A VPN (Virtual Private Network)" }
          ],
          300: [
            { q: "What does 'IP' stand for in 'IP address'?", a: "Internet Protocol" },
            { q: "What does 'HTTP' stand for, the protocol used for transmitting web pages over the internet?", a: "HyperText Transfer Protocol" },
            { q: "What is the term, abbreviated 'DHCP', for the protocol that automatically assigns IP addresses to devices on a network?", a: "Dynamic Host Configuration Protocol" }
          ],
          400: [
            { q: "What is the term for software or hardware that monitors and filters network traffic based on security rules?", a: "A firewall" },
            { q: "What term describes an attack where a system is flooded with excessive traffic to make it unavailable to legitimate users, abbreviated 'DDoS'?", a: "Distributed Denial-of-Service attack" },
            { q: "What term describes the practice of converting readable data into a coded format to prevent unauthorized access?", a: "Encryption" }
          ],
          500: [
            { q: "What networking system, abbreviated 'DNS', translates domain names like 'google.com' into IP addresses?", a: "Domain Name System" },
            { q: "What term describes a network architecture model with seven layers, from Physical to Application, used to standardize how systems communicate?", a: "The OSI Model (Open Systems Interconnection model)" },
            { q: "What is the term for the maximum amount of data that can be transmitted over a network connection in a given time, usually measured in bits per second?", a: "Bandwidth" }
          ]
        }
      },
      {
        name: "Engineering",
        questions: {
          100: [
            { q: "What is the general term for a professional who designs, builds, or maintains structures, machines, or systems?", a: "An engineer" },
            { q: "What is the general term for a detailed drawing or diagram used by engineers to plan and communicate a design?", a: "A blueprint (technical drawing)" },
            { q: "What is the general term for testing a small-scale, working version of a design before full production?", a: "A prototype" }
          ],
          200: [
            { q: "What branch of engineering focuses primarily on the design and construction of buildings, bridges, and roads?", a: "Civil engineering" },
            { q: "What branch of engineering focuses on the design of engines, machines, and mechanical systems?", a: "Mechanical engineering" },
            { q: "What branch of engineering applies principles of biology and medicine to design tools like prosthetics and medical devices?", a: "Biomedical engineering" }
          ],
          300: [
            { q: "What branch of engineering deals with the design and study of electrical systems, circuits, and electronics?", a: "Electrical engineering" },
            { q: "What branch of engineering focuses on designing and building aircraft and spacecraft?", a: "Aerospace engineering" },
            { q: "What branch of engineering applies chemistry, physics, and biology principles to design large-scale industrial processes?", a: "Chemical engineering" }
          ],
          400: [
            { q: "What unit of power is named after Scottish engineer James Watt?", a: "The watt" },
            { q: "What SI unit of force is named after English scientist Sir Isaac Newton?", a: "The newton" },
            { q: "What engineering term describes the internal force per unit area experienced by a material when subjected to an external load, typically measured in pascals?", a: "Stress" }
          ],
          500: [
            { q: "What is the term for the point at which a material permanently deforms under stress and will not return to its original shape?", a: "The yield point (yield strength)" },
            { q: "What term describes the maximum stress a material can withstand while being stretched or pulled before breaking?", a: "Tensile strength (ultimate tensile strength)" },
            { q: "What is the term for the branch of engineering mechanics dealing with how materials deform and fail under stress, foundational to designing safe structures?", a: "Mechanics of materials (strength of materials)" }
          ]
        }
      },
      {
        name: "Business",
        questions: {
          100: [
            { q: "What is the basic economic term for the money a company earns from selling goods or services, before expenses are subtracted?", a: "Revenue" },
            { q: "What is the basic accounting term for the total money a company owes to others, such as loans or unpaid bills?", a: "Liabilities (debt)" },
            { q: "What is the general term for a person who starts and runs a new business, taking on financial risk in hopes of profit?", a: "An entrepreneur" }
          ],
          200: [
            { q: "What four-letter abbreviation refers to a company's Chief Executive Officer, its top-ranking executive?", a: "CEO" },
            { q: "What four-letter abbreviation refers to a company's Chief Financial Officer, responsible for managing its finances?", a: "CFO" },
            { q: "What term describes the total value of a company's shares of stock, calculated by multiplying share price by number of outstanding shares?", a: "Market capitalization" }
          ],
          300: [
            { q: "What business analysis tool examines a company's Strengths, Weaknesses, Opportunities, and Threats?", a: "SWOT analysis" },
            { q: "What marketing concept refers to the combination of Product, Price, Place, and Promotion used to market a good or service?", a: "The Marketing Mix (the Four P's)" },
            { q: "What business term describes a detailed document outlining a company's goals, strategies, and financial projections, often used to attract investors?", a: "A business plan" }
          ],
          400: [
            { q: "What accounting term refers to the difference between a company's total revenue and total expenses?", a: "Net profit (net income)" },
            { q: "What financial statement summarizes a company's assets, liabilities, and shareholders' equity at a specific point in time?", a: "The balance sheet" },
            { q: "What term describes the minimum amount of sales a company must achieve to cover all its costs, resulting in neither profit nor loss?", a: "The break-even point" }
          ],
          500: [
            { q: "What economic principle states that as more units of a good are produced, the additional benefit gained from each extra unit tends to decrease?", a: "The law of diminishing marginal utility (diminishing returns)" },
            { q: "What economic term describes a market structure where a single company is the sole provider of a good or service, giving it significant pricing power?", a: "A monopoly" },
            { q: "What business strategy framework, popularized by Harvard's Michael Porter, describes the five competitive forces that shape industry competition?", a: "Porter's Five Forces" }
          ]
        }
      },
      {
        name: "Education",
        questions: {
          100: [
            { q: "What is the general term for the study of teaching methods and practices?", a: "Pedagogy" },
            { q: "What is the general term for a document outlining the topics, goals, and schedule of a specific course?", a: "A syllabus" },
            { q: "What is the general term for the official document verifying that a student has completed a specific level of education, such as high school?", a: "A diploma" }
          ],
          200: [
            { q: "In the Philippines' K-12 education system, how many years of Senior High School were added on top of the original 10-year basic education cycle?", a: "2 years (Grades 11 and 12)" },
            { q: "In the Philippine K-12 system, how many years of Kindergarten and elementary education precede Junior High School?", a: "7 years (Kindergarten plus Grades 1–6)" },
            { q: "What Philippine law, enacted in 2013, formally established the K-12 basic education program?", a: "The Enhanced Basic Education Act of 2013 (Republic Act No. 10533)" }
          ],
          300: [
            { q: "What term describes an assessment given at the end of an instructional period to measure what students have learned, such as a final exam?", a: "Summative assessment" },
            { q: "What term describes ongoing assessments given during instruction to monitor student learning and provide feedback, such as quizzes or class discussions?", a: "Formative assessment" },
            { q: "What term describes education tailored to accommodate students' individual learning needs, abilities, and styles within the same classroom?", a: "Differentiated instruction" }
          ],
          400: [
            { q: "Which educational psychologist is best known for his theory of cognitive development in children, involving stages like sensorimotor and concrete operational?", a: "Jean Piaget" },
            { q: "Which Russian psychologist developed the theory of the 'Zone of Proximal Development', emphasizing the role of social interaction in learning?", a: "Lev Vygotsky" },
            { q: "Which American psychologist is known for his hierarchy of needs, a theory often applied to student motivation in educational settings?", a: "Abraham Maslow" }
          ],
          500: [
            { q: "What term, from educational theorist Benjamin Bloom, refers to a hierarchical framework classifying learning objectives from 'remembering' to 'creating'?", a: "Bloom's Taxonomy" },
            { q: "Which American psychologist developed the theory of Multiple Intelligences, proposing that people have distinct types of intelligence such as linguistic and spatial?", a: "Howard Gardner" },
            { q: "What term, coined by Brazilian educator Paulo Freire in his influential 1968 work, refers to an educational approach that empowers students to critically examine oppressive social conditions?", a: "Critical pedagogy (from 'Pedagogy of the Oppressed')" }
          ]
        }
      },
      {
        name: "Nursing",
        questions: {
          100: [
            { q: "What instrument do nurses commonly use to listen to a patient's heartbeat and lungs?", a: "A stethoscope" },
            { q: "What is the common term for the medical professional who provides direct patient care, administers medications, and assists doctors in hospitals?", a: "A nurse" },
            { q: "What device do nurses commonly use to measure a patient's blood pressure?", a: "A sphygmomanometer (blood pressure cuff)" }
          ],
          200: [
            { q: "What term refers to a person's body temperature, pulse rate, respiratory rate, and blood pressure, routinely measured by nurses?", a: "Vital signs" },
            { q: "What is the standard unit used to measure a patient's body temperature in most countries, including the Philippines?", a: "Degrees Celsius" },
            { q: "What term describes the process of recording a patient's medical history, symptoms, and treatments in their file?", a: "Charting (documentation)" }
          ],
          300: [
            { q: "What is the abbreviation for the life-saving technique used when someone's heart stops, involving chest compressions and rescue breaths?", a: "CPR (Cardiopulmonary Resuscitation)" },
            { q: "What is the abbreviation for the routine daily tasks nurses help patients with, such as bathing, dressing, and eating?", a: "ADLs (Activities of Daily Living)" },
            { q: "What is the medical abbreviation for 'Intravenous', referring to medication or fluids administered directly into a vein?", a: "IV" }
          ],
          400: [
            { q: "What blood type is known as the 'universal donor' because it can be given to patients of any blood type in an emergency?", a: "O negative (O-)" },
            { q: "What blood type is known as the 'universal recipient' because a person with this type can receive blood from any donor type?", a: "AB positive (AB+)" },
            { q: "What term describes the standard set of precautions nurses use with all patients to prevent the spread of infection, including handwashing and wearing gloves?", a: "Standard precautions (universal precautions)" }
          ],
          500: [
            { q: "Which nursing theorist, known as the founder of modern nursing, is famous for her work during the Crimean War and for founding the first secular nursing school in 1860?", a: "Florence Nightingale" },
            { q: "Which nursing theorist developed the 'Theory of Human Caring', emphasizing the importance of compassionate, holistic caregiving in nursing practice?", a: "Jean Watson" },
            { q: "Who is known as the 'Mother of Philippine Nursing', having become the first Filipino superintendent of the Philippine General Hospital School of Nursing in the 1920s?", a: "Anastacia Giron-Tupas" }
          ]
        }
      },
      {
        name: "Architecture",
        questions: {
          100: [
            { q: "What is the term for a detailed drawing showing the layout of a building, viewed from above?", a: "A floor plan" },
            { q: "What is the general term for the front-facing side of a building, often the main design focus?", a: "The façade" },
            { q: "What is the general term for a professional who designs buildings and oversees their construction?", a: "An architect" }
          ],
          200: [
            { q: "What ancient Greek architectural order is characterized by simple, unadorned columns, the earliest and plainest of the three classical orders?", a: "The Doric order" },
            { q: "Which classical Greek architectural order is known for its scroll-like capitals, more ornate than the Doric order?", a: "The Ionic order" },
            { q: "Which classical Greek architectural order is the most ornate of the three, characterized by capitals decorated with acanthus leaves?", a: "The Corinthian order" }
          ],
          300: [
            { q: "Which architect designed New York's Guggenheim Museum and the earthquake-resistant house Fallingwater?", a: "Frank Lloyd Wright" },
            { q: "Which German-American architect, a pioneer of modernist glass-and-steel skyscrapers, led the Bauhaus school before emigrating to the United States?", a: "Ludwig Mies van der Rohe" },
            { q: "Which Swiss-French architect, a pioneer of modernist architecture, is known for the principle 'a house is a machine for living in' and designed Villa Savoye?", a: "Le Corbusier" }
          ],
          400: [
            { q: "What term describes a building's supporting framework of columns and beams that carries its structural load?", a: "The structural frame (skeleton)" },
            { q: "What architectural term describes a curved structure that spans an opening and supports weight above it, a hallmark of Roman architecture?", a: "An arch" },
            { q: "What term describes a building technique using a rigid frame of steel beams to support a skyscraper's weight, enabling glass curtain-wall exteriors?", a: "Steel-frame construction" }
          ],
          500: [
            { q: "Which Spanish architect, famous for the still-unfinished Sagrada Familia basilica in Barcelona, is renowned for his organic, nature-inspired Modernisme style?", a: "Antoni Gaudí" },
            { q: "Which Iraqi-British architect, known for her futuristic, curvilinear designs, became the first woman to win the Pritzker Architecture Prize individually, in 2004?", a: "Zaha Hadid" },
            { q: "Which Finnish-American architect designed the St. Louis Gateway Arch and the TWA Flight Center at JFK Airport?", a: "Eero Saarinen" }
          ]
        }
      },
      {
        name: "Communication",
        questions: {
          100: [
            { q: "What is the general term for the process of exchanging information or ideas between a sender and a receiver?", a: "Communication" },
            { q: "What term describes communication between two or more people through spoken words?", a: "Verbal communication" },
            { q: "What is the general term for the person who originates and sends a message in the communication process?", a: "The sender" }
          ],
          200: [
            { q: "What term describes communication that occurs without words, using gestures, facial expressions, and body language?", a: "Nonverbal communication" },
            { q: "What term describes communication conducted through written words, such as emails, letters, and text messages?", a: "Written communication" },
            { q: "What term describes the person who receives and interprets a message in the communication process?", a: "The receiver" }
          ],
          300: [
            { q: "In the basic communication model, what term refers to anything that interferes with or distorts the message between sender and receiver?", a: "Noise" },
            { q: "What term describes the response a receiver gives back to a sender, indicating how a message was understood, completing the communication loop?", a: "Feedback" },
            { q: "What term describes communication that flows between people at the same organizational level, such as coworkers in the same department?", a: "Lateral (horizontal) communication" }
          ],
          400: [
            { q: "What term describes mass communication industries such as newspapers, television, radio, and the internet, collectively?", a: "Mass media" },
            { q: "What term describes the various online platforms, like Facebook, Instagram, and Twitter/X, used for social interaction and content sharing?", a: "Social media" },
            { q: "What term describes communication that occurs between just two people, such as a face-to-face conversation or phone call?", a: "Interpersonal communication" }
          ],
          500: [
            { q: "Which Canadian media theorist coined the phrase 'the medium is the message', arguing that how information is delivered shapes its impact as much as its content?", a: "Marshall McLuhan" },
            { q: "Which American communication researchers developed 'Agenda-Setting Theory', arguing media doesn't tell people what to think but what to think about?", a: "Maxwell McCombs and Donald Shaw" },
            { q: "Which German philosopher and sociologist developed the concept of the 'public sphere', describing the space where private citizens gather to discuss public matters?", a: "Jürgen Habermas" }
          ]
        }
      }
    ]
  },
  "Music": {
    icon: "🎵",
    categories: [
      {
        name: "Pop",
        questions: {
          100: [
            { q: "Who is known as the 'King of Pop', famous for hits like 'Thriller' and 'Billie Jean'?", a: "Michael Jackson" },
            { q: "Which pop singer, nicknamed the 'Princess of Pop', rose to fame with '...Baby One More Time' in 1998?", a: "Britney Spears" },
            { q: "Which British pop singer had a massive global hit in 2017 with 'Shape of You'?", a: "Ed Sheeran" }
          ],
          200: [
            { q: "Which pop superstar released the 2022 album 'Midnights' and is known for narrative albums like 'Folklore' and '1989'?", a: "Taylor Swift" },
            { q: "Which pop singer's 2019 album 'Fine Line' included the hit song 'Watermelon Sugar'?", a: "Harry Styles" },
            { q: "Which pop singer's 2015 album '25' includes the hit single 'Hello'?", a: "Adele" }
          ],
          300: [
            { q: "Which Barbadian singer, known for hits like 'Umbrella' and 'Diamonds', also founded the Fenty Beauty cosmetics line?", a: "Rihanna" },
            { q: "Which pop singer, known for hits like 'Bad Romance' and 'Poker Face', famously wore a dress made of meat to the 2010 MTV VMAs?", a: "Lady Gaga" },
            { q: "Which pop singer's 2021 album '30' became one of the best-selling albums worldwide of the 2020s?", a: "Adele" }
          ],
          400: [
            { q: "Which 1982 album by Michael Jackson became the best-selling album of all time worldwide?", a: "Thriller" },
            { q: "Which pop singer's 2011 album 'Born This Way' debuted at number one on the Billboard 200, selling over a million copies in its first week?", a: "Lady Gaga" },
            { q: "Which 1997 charity single by Elton John, rewritten as a tribute to Princess Diana, became the best-selling physical single of all time?", a: "'Candle in the Wind 1997'" }
          ],
          500: [
            { q: "Which pop artist holds the record for the most Grammy Awards won by any artist in history, with over 32 wins as of the mid-2020s?", a: "Beyoncé" },
            { q: "Which pop singer holds the record among solo artists for the most Billboard Hot 100 number-one singles, with 19 chart-toppers?", a: "Mariah Carey" },
            { q: "Which pop girl group's 1996 debut single 'Wannabe' topped the charts in 22 countries and helped popularize the phrase 'Girl Power'?", a: "The Spice Girls" }
          ]
        }
      },
      {
        name: "Rock",
        questions: {
          100: [
            { q: "Which British rock band, formed in Liverpool in 1960, included John Lennon, Paul McCartney, George Harrison, and Ringo Starr?", a: "The Beatles" },
            { q: "Which American rock band, fronted by Mick Jagger and Keith Richards, is famous for hits like '(I Can't Get No) Satisfaction' and 'Paint It Black'?", a: "The Rolling Stones" },
            { q: "Which Irish rock band, fronted by Bono, is known for hits like 'With or Without You' and the album 'The Joshua Tree'?", a: "U2" }
          ],
          200: [
            { q: "Which rock band, fronted by Freddie Mercury, performed 'Bohemian Rhapsody' and 'We Will Rock You'?", a: "Queen" },
            { q: "Which American rock band, fronted by Steven Tyler, is known for hits like 'Dream On' and 'I Don't Want to Miss a Thing'?", a: "Aerosmith" },
            { q: "Which British rock band, formed in 1968, is known for 'Stairway to Heaven' and 'Whole Lotta Love'?", a: "Led Zeppelin" }
          ],
          300: [
            { q: "Which American rock band, fronted by Axl Rose and featuring guitarist Slash, released the iconic 1987 album 'Appetite for Destruction'?", a: "Guns N' Roses" },
            { q: "Which British rock band, associated with Roger Waters and David Gilmour, released the concept album 'The Dark Side of the Moon' in 1973?", a: "Pink Floyd" },
            { q: "Which American rock band, fronted by Eddie Vedder, emerged from the Seattle grunge scene with its 1991 debut album 'Ten'?", a: "Pearl Jam" }
          ],
          400: [
            { q: "Which grunge band, fronted by Kurt Cobain, released the influential 1991 album 'Nevermind', featuring 'Smells Like Teen Spirit'?", a: "Nirvana" },
            { q: "Which American singer released the operatic rock album 'Bat Out of Hell' in 1977, one of the best-selling albums in music history?", a: "Meat Loaf" },
            { q: "Which American rock band, led by guitarist Eddie Van Halen, released its self-titled debut album in 1978, featuring 'Runnin' with the Devil'?", a: "Van Halen" }
          ],
          500: [
            { q: "Which 1969 music festival in upstate New York became a defining moment for rock and counterculture, featuring Jimi Hendrix and The Who?", a: "Woodstock" },
            { q: "Which 1969 rock festival held on the Isle of Wight, England, featured a rare comeback performance by Bob Dylan?", a: "The Isle of Wight Festival" },
            { q: "Which British rock band's 1973 album 'The Dark Side of the Moon' spent a total of 741 weeks on the Billboard 200 album chart?", a: "Pink Floyd" }
          ]
        }
      },
      {
        name: "OPM",
        questions: {
          100: [
            { q: "Which 1978 song by Freddie Aguilar, about a mother's sacrifices, became one of the most successful OPM songs of all time internationally?", a: "'Anak'" },
            { q: "Which Filipino singer, often called the 'Concert King', is known for hits like 'Be My Lady' and 'Kahit Maputi Na Ang Buhok Ko'?", a: "Martin Nievera" },
            { q: "Which iconic Filipino rock band, fronted by Ely Buendia, is known for songs like 'Pare Ko' and 'Overdrive'?", a: "Eraserheads" }
          ],
          200: [
            { q: "Which Filipino rock band, formed in the late 1980s, is often called 'The Beatles of the Philippines' and is known for hits like 'Ang Huling El Bimbo'?", a: "Eraserheads" },
            { q: "Which Filipino singer-actress, dubbed the 'Megastar', has been a dominant figure in Philippine music and film since the late 1970s?", a: "Sharon Cuneta" },
            { q: "Which Filipino rock band, fronted by Chito Miranda, is known for hits like 'Kaleidoscope World' and 'Buloy'?", a: "Parokya ni Edgar" }
          ],
          300: [
            { q: "Which Filipino singer is popularly known as 'Asia's Songbird', famous for hits like 'Kailangan Kita' and 'In Love With You'?", a: "Regine Velasquez" },
            { q: "Which Filipino singer and actress originated the role of Kim in the West End and Broadway productions of 'Miss Saigon' and later voiced Disney princesses Jasmine and Mulan?", a: "Lea Salonga" },
            { q: "Which Filipino rock band, known for the hit 'Halik', helped popularize the Pinoy rock sound of the 1990s alongside the Eraserheads?", a: "Rivermaya" }
          ],
          400: [
            { q: "Which 1995 Eraserheads song, considered one of the greatest OPM songs of all time, tells a story using the metaphor of a magician's assistant?", a: "'Ang Huling El Bimbo'" },
            { q: "Who composed the music for the Philippine patriotic song 'Bayan Ko', which became an anthem of protest during the Martial Law era?", a: "Constancio de Guzman" },
            { q: "Which Filipino composer and pianist, named National Artist for Music in 2018 and famous for songs like 'Da Coconut Nut', is a celebrated figure in contemporary Philippine music?", a: "Ryan Cayabyab" }
          ],
          500: [
            { q: "Which Filipino composer and National Artist for Music wrote the iconic kundiman (Filipino love ballad) 'Sa Ugoy ng Duyan'?", a: "Lucio San Pedro" },
            { q: "Which Filipino composer, a pioneer of the kundiman art song later named National Artist for Music, composed 'Mutya ng Pasig' and 'Nasaan Ka Irog'?", a: "Nicanor Abelardo" },
            { q: "Which pioneering Filipino rock song, written by Mike Hanopol and performed by the Juan de la Cruz Band in 1973, is widely regarded as one of the first true 'Pinoy rock' anthems?", a: "'Ang Himig Natin'" }
          ]
        }
      },
      {
        name: "K-Pop",
        questions: {
          100: [
            { q: "Which South Korean boy band debuted in 2013 and became a global phenomenon with hits like 'Dynamite' and 'Butter'?", a: "BTS" },
            { q: "Which K-pop girl group, formed by JYP Entertainment, is known for hits like 'Cheer Up' and 'What Type of X'?", a: "TWICE" },
            { q: "Which K-pop boy group, debuting in 2012 under SM Entertainment, is known for hits like 'Growl' and 'Love Shot'?", a: "EXO" }
          ],
          200: [
            { q: "Which K-pop girl group, formed by YG Entertainment and known for 'Kill This Love' and 'DDU-DU DDU-DU', consists of Jisoo, Jennie, Rosé, and Lisa?", a: "BLACKPINK" },
            { q: "Which K-pop boy group, debuting in 2014 under JYP Entertainment, is known for hits like 'Just Right' and 'Hard Carry'?", a: "GOT7" },
            { q: "Which K-pop girl group, debuting in 2014 under SM Entertainment, is known for hits like 'Red Flavor' and 'Psycho'?", a: "Red Velvet" }
          ],
          300: [
            { q: "What is the official fandom name for BTS, referring to their dedicated global fanbase?", a: "ARMY" },
            { q: "What is the official fandom name for BLACKPINK, referring to their dedicated global fanbase?", a: "BLINK" },
            { q: "What is the official fandom name for TWICE, referring to their dedicated fanbase?", a: "ONCE" }
          ],
          400: [
            { q: "Which South Korean entertainment company, founded by Lee Soo-man in 1995, is one of the 'Big Three' K-pop agencies and manages groups like EXO and NCT?", a: "SM Entertainment" },
            { q: "Which South Korean entertainment company, founded by Park Jin-young (J.Y. Park) in 1997, is one of the 'Big Three' K-pop agencies and manages groups like TWICE and Stray Kids?", a: "JYP Entertainment" },
            { q: "Which South Korean entertainment company, founded by Yang Hyun-suk in 1996, is one of the 'Big Three' K-pop agencies and manages BLACKPINK?", a: "YG Entertainment" }
          ],
          500: [
            { q: "Which K-pop group became the first to top the Billboard Hot 100 chart with an all-Korean-language song, 'Life Goes On', in 2020?", a: "BTS" },
            { q: "Which Korean artist's 2012 song 'Gangnam Style' became the first video ever to reach one billion views on YouTube?", a: "PSY" },
            { q: "Which K-pop girl group, debuting in 2007 under SM Entertainment, is considered a pioneering 'second generation' K-pop act, known for hits like 'Gee' and 'Genie'?", a: "Girls' Generation (SNSD)" }
          ]
        }
      },
      {
        name: "International Music",
        questions: {
          100: [
            { q: "Which Canadian singer is known as 'The Weeknd', famous for hits like 'Blinding Lights' and 'Starboy'?", a: "Abel Tesfaye (The Weeknd)" },
            { q: "Which British singer, known for hits like 'Rolling in the Deep' and 'Someone Like You', is one of the best-selling international recording artists of the 21st century?", a: "Adele" },
            { q: "Which Puerto Rican artist, known as 'Bad Bunny', became one of the most-streamed musicians in the world in the early 2020s?", a: "Bad Bunny (Benito Antonio Martínez Ocasio)" }
          ],
          200: [
            { q: "Which Colombian singer, known for hits like 'Hips Don't Lie' and 'Waka Waka', is one of the best-selling Latin music artists of all time?", a: "Shakira" },
            { q: "Which Puerto Rican singer, known as the 'King of Latin Pop', is famous for hits like 'Livin' la Vida Loca'?", a: "Ricky Martin" },
            { q: "Which French DJ and producer, known for hits like 'Titanium' and 'Wake Me Up', is one of the most successful electronic dance music artists worldwide?", a: "David Guetta" }
          ],
          300: [
            { q: "Which 2017 song by Luis Fonsi featuring Daddy Yankee became one of the most-viewed videos on YouTube for several years?", a: "'Despacito'" },
            { q: "Which Italian tenor, known for crossover hits like 'Con te partirò (Time to Say Goodbye)' and 'The Prayer', is one of the best-selling classical crossover artists of all time?", a: "Andrea Bocelli" },
            { q: "Which Australian singer's 2000 hit 'Can't Get You Out of My Head' became a global chart-topping dance-pop anthem?", a: "Kylie Minogue" }
          ],
          400: [
            { q: "Which Swedish group, formed in 1972, is known for hits like 'Dancing Queen' and 'Mamma Mia', and remains one of the best-selling music acts of all time?", a: "ABBA" },
            { q: "Which German electronic music duo, formed in 1970 and regarded as pioneers of electronic and techno music, released the influential 1974 album 'Autobahn'?", a: "Kraftwerk" },
            { q: "Which Icelandic singer, known for her avant-garde style and albums like 'Homogenic' and 'Vespertine', is one of Iceland's most internationally acclaimed musical artists?", a: "Björk" }
          ],
          500: [
            { q: "Which French electronic duo, known for wearing robot helmets and producing hits like 'Get Lucky' and 'One More Time', disbanded in 2021 after 28 years together?", a: "Daft Punk" },
            { q: "Which German singer's 1983 song '99 Luftballons' became an international hit, later re-recorded in English as '99 Red Balloons'?", a: "Nena" },
            { q: "Which French chanson singer, known for 'Non, je ne regrette rien' and considered a national icon in France, died in 1963 shortly after recording that song?", a: "Édith Piaf" }
          ]
        }
      },
      {
        name: "Music History",
        questions: {
          100: [
            { q: "Which Austrian composer, a child prodigy, wrote famous classical works like 'The Magic Flute' and 'Eine kleine Nachtmusik'?", a: "Wolfgang Amadeus Mozart" },
            { q: "Which Italian Baroque composer wrote the famous set of violin concertos known as 'The Four Seasons'?", a: "Antonio Vivaldi" },
            { q: "Which German composer, born in 1685, is known as one of the greatest composers of the Baroque era, famous for the 'Brandenburg Concertos'?", a: "Johann Sebastian Bach" }
          ],
          200: [
            { q: "Which genre of African-American music, originating in the late 19th and early 20th century in the Southern United States, is considered a precursor to rock and roll and jazz?", a: "The Blues" },
            { q: "Which genre of music, originating in Jamaica in the late 1960s, was popularized worldwide by artists like Bob Marley?", a: "Reggae" },
            { q: "Which genre of electronic dance music originated in Chicago's nightclub scene in the early 1980s, taking its name from the club 'The Warehouse'?", a: "House music" }
          ],
          300: [
            { q: "Which British band's 1964 arrival in the United States sparked a cultural phenomenon known as the 'British Invasion'?", a: "The Beatles" },
            { q: "Which rock musician's 1971 death, following those of Jimi Hendrix and Janis Joplin, completed a tragic trio of rock star deaths within two years, all at age 27?", a: "Jim Morrison (of The Doors)" },
            { q: "Which genre of Jamaican music, predating reggae, was popularized in the 1960s by artists like Desmond Dekker and later revived by 2 Tone bands like The Specials?", a: "Ska" }
          ],
          400: [
            { q: "Which German composer continued composing major works, including his Ninth Symphony, even after becoming completely deaf?", a: "Ludwig van Beethoven" },
            { q: "Which Austrian composer's unfinished final work, a Requiem Mass, was completed by his students after his death in 1791?", a: "Wolfgang Amadeus Mozart" },
            { q: "Which Russian composer's '1812 Overture', composed to commemorate Russia's defense against Napoleon, is famous for its use of cannon fire in performance?", a: "Pyotr Ilyich Tchaikovsky" }
          ],
          500: [
            { q: "What technological format, introduced by Sony and Philips in 1982, largely replaced vinyl records and cassette tapes as the dominant music medium through the 1990s?", a: "The Compact Disc (CD)" },
            { q: "Which American inventor patented the phonograph in 1877, the first device capable of both recording and reproducing sound?", a: "Thomas Edison" },
            { q: "What digital audio compression format, developed by German engineers at the Fraunhofer Institute and standardized in 1993, became the dominant format for digital music in the late 1990s and 2000s?", a: "MP3" }
          ]
        }
      },
      {
        name: "Artists and Bands",
        questions: {
          100: [
            { q: "Which American singer, known as the 'Queen of Pop', is famous for hits like 'Like a Virgin' and 'Vogue'?", a: "Madonna" },
            { q: "Which American rapper, born Marshall Mathers III, is famous for albums like 'The Marshall Mathers LP' and 'The Eminem Show'?", a: "Eminem" },
            { q: "Which American singer, known as 'The Boss', is famous for songs like 'Born in the U.S.A.' and 'Dancing in the Dark'?", a: "Bruce Springsteen" }
          ],
          200: [
            { q: "Which American rapper and entrepreneur, born Shawn Carter, is married to Beyoncé?", a: "Jay-Z" },
            { q: "Which American rapper and actor, known for hits like 'In Da Club' and founding G-Unit, survived being shot nine times in 2000?", a: "50 Cent" },
            { q: "Which American singer, known as the 'Godfather of Soul', was famous for hits like 'I Got You (I Feel Good)' and his energetic stage performances?", a: "James Brown" }
          ],
          300: [
            { q: "Which American rock band, fronted by Anthony Kiedis and known for blending rock with funk and rap, released 'Californication' and 'Under the Bridge'?", a: "Red Hot Chili Peppers" },
            { q: "Which American rock band, fronted by Chris Cornell and part of the Seattle grunge scene, released the 1994 album 'Superunknown' featuring 'Black Hole Sun'?", a: "Soundgarden" },
            { q: "Which American singer-songwriter, known as 'The Piano Man', is famous for songs like 'Uptown Girl' and 'We Didn't Start the Fire'?", a: "Billy Joel" }
          ],
          400: [
            { q: "Which American band, led by former Nirvana drummer Dave Grohl, formed in 1994 and is known for hits like 'Everlong' and 'Learn to Fly'?", a: "Foo Fighters" },
            { q: "Which American rock band, fronted by Eddie Vedder, is considered one of the most influential grunge bands alongside Nirvana and Soundgarden?", a: "Pearl Jam" },
            { q: "Which British singer-songwriter, known for his falsetto and hits like 'Rocket Man' and 'Your Song', partnered with lyricist Bernie Taupin for decades?", a: "Elton John" }
          ],
          500: [
            { q: "Which Jamaican reggae musician, known for 'No Woman, No Cry' and 'Redemption Song', helped popularize reggae music worldwide before his death in 1981?", a: "Bob Marley" },
            { q: "Which American blues musician, known as the 'King of the Delta Blues', recorded only 29 songs before his death in 1938 at age 27, yet became hugely influential on rock music?", a: "Robert Johnson" },
            { q: "Which African-American composer, known as the 'Father of Gospel Music', wrote the classic hymn 'Take My Hand, Precious Lord' in 1932?", a: "Thomas A. Dorsey" }
          ]
        }
      }
    ]
  },
  "Video Games": {
    icon: "🎮",
    categories: [
      {
        name: "Classic Games",
        questions: {
          100: [
            { q: "Which 1985 Nintendo game, starring a plumber who must rescue Princess Peach, became one of the best-selling video games of all time?", a: "Super Mario Bros." },
            { q: "Which 1978 arcade shooter, in which players defend Earth from descending rows of aliens, is considered one of the founding games of the shoot 'em up genre?", a: "Space Invaders" },
            { q: "Which 1981 Nintendo arcade game features a carpenter climbing girders to rescue a woman from a giant ape, marking the first appearance of Mario?", a: "Donkey Kong" }
          ],
          200: [
            { q: "Which 1980 arcade game, created by Namco, features a yellow character eating dots while avoiding four colored ghosts?", a: "Pac-Man" },
            { q: "Which classic 1981 arcade game has players guide a frog across a busy road and river to reach home safely?", a: "Frogger" },
            { q: "Which 1979 Atari arcade game has players pilot a spaceship, shooting and breaking apart floating space rocks while avoiding collisions?", a: "Asteroids" }
          ],
          300: [
            { q: "Which puzzle video game, created by Russian designer Alexey Pajitnov in 1984, involves arranging falling geometric blocks?", a: "Tetris" },
            { q: "Which 1981 arcade game was introduced by Midway as a female counterpart to a hit game, without official approval from the original creators?", a: "Ms. Pac-Man" },
            { q: "Which 1981 Namco arcade game, a sequel to 'Galaxian', became one of the most iconic shoot 'em up games with its diving alien enemy formations?", a: "Galaga" }
          ],
          400: [
            { q: "Which 1991 Sega game introduced a blue hedgehog who could run at super speed, created as a rival mascot to Nintendo's Mario?", a: "Sonic the Hedgehog" },
            { q: "Which 1991 puzzle game by Compile, featuring a witch named Arle Nadja, is credited with popularizing the falling-block 'versus puzzle' subgenre?", a: "Puyo Puyo" },
            { q: "Which 1976 Atari arcade game, in which players use a paddle to break through a wall of bricks with a bouncing ball, was famously prototyped by Steve Wozniak and Steve Jobs?", a: "Breakout" }
          ],
          500: [
            { q: "Which 1972 game, developed by Atari and featuring two paddles hitting a ball back and forth, is considered one of the first commercially successful video games?", a: "Pong" },
            { q: "Which 1962 game, created by MIT students including Steve Russell and considered one of the first-ever digital video games, involved two spaceships dueling near a star?", a: "Spacewar!" },
            { q: "Which 1958 game, created by physicist William Higinbotham on an oscilloscope at Brookhaven National Laboratory, is considered by some historians to be one of the very first video games ever made?", a: "Tennis for Two" }
          ]
        }
      },
      {
        name: "Iconic Characters",
        questions: {
          100: [
            { q: "What is the name of the green-clad hero who rescues Princess Zelda in Nintendo's long-running fantasy franchise?", a: "Link" },
            { q: "What is the name of the mustachioed plumber who is Nintendo's most famous mascot, first appearing in 'Donkey Kong' in 1981?", a: "Mario" },
            { q: "What is the name of the blue hedgehog who serves as Sega's mascot and main rival to Nintendo's Mario?", a: "Sonic the Hedgehog" }
          ],
          200: [
            { q: "What is the name of Sonic the Hedgehog's main rival, a mad scientist who pilots various machines?", a: "Dr. Robotnik (Dr. Eggman)" },
            { q: "What is the name of Mario's younger, taller brother, dressed in green, who is a playable character in many Mario games?", a: "Luigi" },
            { q: "What is the name of the pink, round Nintendo character known for inhaling enemies to copy their abilities?", a: "Kirby" }
          ],
          300: [
            { q: "What is the name of the protagonist in the 'Half-Life' series, a silent theoretical physicist armed with a crowbar?", a: "Gordon Freeman" },
            { q: "What is the nickname commonly used for the relentless space marine protagonist of the 'Doom' series?", a: "The Doom Slayer (Doomguy)" },
            { q: "What is the name of the treasure-hunting archaeologist protagonist of the 'Tomb Raider' video game series?", a: "Lara Croft" }
          ],
          400: [
            { q: "In the 'Legend of Zelda' series, what is the name of the recurring antagonist, a pig-like sorcerer king who seeks the Triforce?", a: "Ganon (Ganondorf)" },
            { q: "In the 'Metal Gear' series, what is the codename of Solid Snake's antagonist and genetic 'brother', created from the same source DNA?", a: "Liquid Snake" },
            { q: "In 'Final Fantasy VII', what is the name of the silver-haired antagonist who kills the character Aerith and later became an iconic villain in gaming history?", a: "Sephiroth" }
          ],
          500: [
            { q: "What is the real name of the protagonist in 'Assassin's Creed II', a vigilante descended from a wealthy Florentine family?", a: "Ezio Auditore da Firenze" },
            { q: "What is the real name of the assassin protagonist in the original 2007 'Assassin's Creed', an ancestor of Ezio Auditore active during the Third Crusade?", a: "Altaïr Ibn-La'Ahad" },
            { q: "In the 1995 role-playing game 'Chrono Trigger', what is the true name of the amnesiac, katana-wielding frog warrior who joins the protagonist's party?", a: "Glenn (Frog)" }
          ]
        }
      },
      {
        name: "Game Franchises",
        questions: {
          100: [
            { q: "Which Nintendo franchise features colorful creatures that trainers catch, train, and battle, starting with 'Red and Blue' in 1996?", a: "Pokémon" },
            { q: "Which Nintendo franchise, starring a mustachioed plumber, began with the 1985 game 'Super Mario Bros.' and remains one of the best-selling video game series of all time?", a: "Super Mario" },
            { q: "Which Nintendo kart-racing franchise, featuring Mario and friends racing with power-up items like shells and bananas, began in 1992?", a: "Mario Kart" }
          ],
          200: [
            { q: "Which sandbox video game, created by Markus 'Notch' Persson and released in 2011, lets players build with cubic blocks in a procedurally generated world?", a: "Minecraft" },
            { q: "Which long-running life-simulation franchise by Electronic Arts, first released in 2000, lets players control virtual people building homes and lives?", a: "The Sims" },
            { q: "Which Nintendo franchise features open-ended life-simulation games where players manage a village of anthropomorphic animals, starting in 2001?", a: "Animal Crossing" }
          ],
          300: [
            { q: "Which battle royale game, released by Epic Games in 2017, became a cultural phenomenon known for its building mechanics and seasonal events?", a: "Fortnite" },
            { q: "Which multiplayer online battle arena game, developed by Riot Games and released in 2009, became one of the most-played PC games in the world and inspired the Netflix series 'Arcane'?", a: "League of Legends" },
            { q: "Which battle royale franchise, developed by Krafton and released in 2017 based on a mod for 'ARMA', helped popularize the battle royale genre alongside Fortnite?", a: "PUBG (PlayerUnknown's Battlegrounds)" }
          ],
          400: [
            { q: "Which long-running Japanese role-playing game franchise, first released in 1987 by Square, is known for numbered mainline entries and recurring creatures called Chocobos?", a: "Final Fantasy" },
            { q: "Which long-running stealth-action franchise, created by Hideo Kojima and first released in 1987, follows the soldier Solid Snake?", a: "Metal Gear" },
            { q: "Which Japanese role-playing game franchise, first released in 1986 by Enix, is known for its recurring 'Slime' enemies and composer Koichi Sugiyama's music?", a: "Dragon Quest" }
          ],
          500: [
            { q: "Which video game franchise, first released in 1997, is known for its open-world crime gameplay and has sold over 400 million copies across its series?", a: "Grand Theft Auto" },
            { q: "Which long-running Konami franchise, first released in 1986, follows vampire hunters from the Belmont clan battling Dracula, and helped define the 'Metroidvania' genre with its 1997 entry 'Symphony of the Night'?", a: "Castlevania" },
            { q: "Which Japanese role-playing game franchise, first released in 1992 for the Super Famicom and developed by Atlus, spawned the popular 'Persona' spin-off series?", a: "Shin Megami Tensei" }
          ]
        }
      }
    ]
  },
  "Sports": {
    icon: "🏆",
    categories: [
      {
        name: "Olympics",
        questions: {
          100: [
            { q: "In which country did the modern Olympic Games originate in ancient times?", a: "Greece" },
            { q: "How often are the Summer Olympic Games held, under normal circumstances?", a: "Every four years" },
            { q: "Which country hosted the 2016 Summer Olympics, the first Olympics held in South America?", a: "Brazil (Rio de Janeiro)" }
          ],
          200: [
            { q: "How many rings are on the Olympic flag, representing the five inhabited continents?", a: "Five" },
            { q: "What are the traditional Olympic medal colors awarded for first, second, and third place?", a: "Gold, silver, and bronze" },
            { q: "In which city were the first modern Olympic Games held in 1896?", a: "Athens, Greece" }
          ],
          300: [
            { q: "Which city hosted the 2020 Summer Olympics, which were postponed to 2021 due to the COVID-19 pandemic?", a: "Tokyo, Japan" },
            { q: "Which city became the first to host the Summer Olympics three times when it hosted the 2012 Games?", a: "London" },
            { q: "Which country hosted the 2008 Summer Olympics, marking the first time China hosted the Games?", a: "China (Beijing)" }
          ],
          400: [
            { q: "Which Jamaican sprinter holds the world records in both the 100m and 200m and won eight Olympic gold medals?", a: "Usain Bolt" },
            { q: "Which American gymnast became the most decorated American gymnast in history, winning the all-around gold medal at both the 2016 and 2020 Olympics?", a: "Simone Biles" },
            { q: "Which Ethiopian long-distance runner won gold medals in both the 5,000m and 10,000m at consecutive Olympics in 2004 and 2008?", a: "Kenenisa Bekele" }
          ],
          500: [
            { q: "Which American swimmer holds the record for the most Olympic medals of all time, with 28 total medals?", a: "Michael Phelps" },
            { q: "Which Soviet gymnast won 18 Olympic medals across the 1956, 1960, and 1964 Games, holding the record for most Olympic medals by a woman for decades?", a: "Larisa Latynina" },
            { q: "Which Finnish long-distance runner, nicknamed the 'Flying Finn', won nine Olympic gold medals in the 1920s?", a: "Paavo Nurmi" }
          ]
        }
      },
      {
        name: "Basketball",
        questions: {
          100: [
            { q: "How many players from each team are on the court at one time in a standard basketball game?", a: "Five" },
            { q: "How many points is a standard field goal worth in basketball when shot from inside the three-point line?", a: "Two points" },
            { q: "In what U.S. city was basketball invented by James Naismith in 1891?", a: "Springfield, Massachusetts" }
          ],
          200: [
            { q: "Which NBA player, nicknamed 'His Airness', won six NBA championships with the Chicago Bulls?", a: "Michael Jordan" },
            { q: "Which American basketball league, founded in 1946, is the premier professional men's basketball league in the United States?", a: "The NBA (National Basketball Association)" },
            { q: "Which basketball player, known as 'Magic', led the Los Angeles Lakers to five NBA championships in the 1980s?", a: "Magic Johnson (Earvin Johnson)" }
          ],
          300: [
            { q: "Which Philippine professional basketball league, founded in 1975, is the oldest active professional basketball league in Asia?", a: "PBA (Philippine Basketball Association)" },
            { q: "Which basketball player, nicknamed 'The Big Aristotle' and 'Shaq', won four NBA championships and is considered one of the most dominant centers in NBA history?", a: "Shaquille O'Neal" },
            { q: "Which international basketball competition, held every four years and organized by FIBA, is basketball's equivalent to soccer's World Cup?", a: "The FIBA Basketball World Cup" }
          ],
          400: [
            { q: "Which NBA player holds the record for most career points scored, surpassing Kareem Abdul-Jabbar in 2023?", a: "LeBron James" },
            { q: "Which basketball player set the NBA single-season record for most three-pointers made and is widely credited with revolutionizing the game with high-volume three-point shooting?", a: "Stephen Curry" },
            { q: "Which Filipino basketball legend, who led the Philippines to a bronze medal at the 1954 FIBA World Championship, was named FIBA's Asian Player of the Century in 2002?", a: "Carlos Loyzaga" }
          ],
          500: [
            { q: "Which basketball player scored 100 points in a single NBA game in 1962, a record that still stands?", a: "Wilt Chamberlain" },
            { q: "Which basketball player recorded the NBA's first officially recognized quadruple-double, in a game in October 1974?", a: "Nate Thurmond" },
            { q: "Which basketball player holds the NBA record for most career assists, a mark set largely during his years with the Utah Jazz?", a: "John Stockton" }
          ]
        }
      },
      {
        name: "Football (Soccer)",
        questions: {
          100: [
            { q: "How many players are on a standard soccer team on the field at one time, including the goalkeeper?", a: "Eleven" },
            { q: "What is the standard duration of a soccer match, not including stoppage time, split into two halves?", a: "90 minutes (two 45-minute halves)" },
            { q: "What is the term for the soccer rule that penalizes an attacking player for being nearer the opponent's goal line than the ball and second-to-last defender when the ball is played to them?", a: "Offside" }
          ],
          200: [
            { q: "Which country has won the most FIFA World Cup titles, with five championships?", a: "Brazil" },
            { q: "Which European country won the FIFA World Cup in 2018, defeating Croatia in the final?", a: "France" },
            { q: "Which Portuguese football superstar has won multiple Ballon d'Or awards and is famous for his rivalry with Lionel Messi?", a: "Cristiano Ronaldo" }
          ],
          300: [
            { q: "Which Argentine football star won the 2022 FIFA World Cup with Argentina and has won a record eight Ballon d'Or awards?", a: "Lionel Messi" },
            { q: "Which German football club has won the most Bundesliga titles and is one of the most successful clubs in European football?", a: "Bayern Munich" },
            { q: "Which Brazilian football legend, widely regarded as one of the greatest players of all time, won three FIFA World Cups with Brazil in 1958, 1962, and 1970?", a: "Pelé" }
          ],
          400: [
            { q: "Which international club competition, organized by UEFA, is Europe's top-tier club football tournament?", a: "The UEFA Champions League" },
            { q: "Which international soccer tournament, held every four years and contested by European national teams, is UEFA's equivalent to the World Cup?", a: "The UEFA European Championship (Euro)" },
            { q: "Which club competition is South America's equivalent to the UEFA Champions League, contested annually by top South American clubs?", a: "Copa Libertadores" }
          ],
          500: [
            { q: "Which country hosted and won the first-ever FIFA World Cup in 1930?", a: "Uruguay" },
            { q: "Which national team, coached by Rinus Michels in the 1970s, popularized the influential tactical system known as 'Total Football'?", a: "The Netherlands" },
            { q: "Which country's national team, known as the 'Golden Team' (Aranycsapat), famously ended England's unbeaten home record in 1953 with a 6-3 win at Wembley?", a: "Hungary" }
          ]
        }
      }
    ]
  },
  "Philippine Trivia": {
    icon: "🥭",
    categories: [
      {
        name: "Philippine History",
        questions: {
          100: [
            { q: "Who is the national hero of the Philippines, known for writing 'Noli Me Tángere' and 'El Filibusterismo'?", a: "José Rizal" },
            { q: "What is the name of the historic 1896 uprising against Spanish colonial rule in the Philippines, led by the Katipunan secret society?", a: "The Philippine Revolution" },
            { q: "Who was the Filipino revolutionary who founded the Katipunan, the secret society that sparked the Philippine Revolution?", a: "Andrés Bonifacio" }
          ],
          200: [
            { q: "In what year did the Philippines declare independence from Spain, an event now celebrated as Independence Day?", a: "1898" },
            { q: "In what year did the Philippines gain full independence from the United States, an event once celebrated as its Independence Day?", a: "1946" },
            { q: "Which walled district within Manila served as the seat of Spanish colonial government throughout most of the Spanish colonial period?", a: "Intramuros" }
          ],
          300: [
            { q: "Which Filipino revolutionary leader became the first President of the Philippines in 1899?", a: "Emilio Aguinaldo" },
            { q: "Which Philippine president led the country during Martial Law, declared in 1972, and was ousted by the 1986 People Power Revolution?", a: "Ferdinand Marcos Sr." },
            { q: "What is the collective name for the three Filipino priests — Mariano Gómez, José Burgos, and Jacinto Zamora — who were executed by Spanish colonial authorities in 1872?", a: "Gomburza" }
          ],
          400: [
            { q: "Which Portuguese explorer, sailing for Spain, arrived in the Philippines in 1521 and was later killed in the Battle of Mactan?", a: "Ferdinand Magellan" },
            { q: "Which Spanish explorer completed the first circumnavigation of the globe by leading Magellan's expedition to its conclusion after Magellan's death in the Philippines?", a: "Juan Sebastián Elcano" },
            { q: "Which 1899-1902 conflict was fought between Filipino revolutionaries and American forces after the United States annexed the Philippines following the Spanish-American War?", a: "The Philippine-American War" }
          ],
          500: [
            { q: "Who was the Filipino chieftain of Mactan who defeated and killed Ferdinand Magellan in 1521?", a: "Lapu-Lapu" },
            { q: "Which Filipino revolutionary, known as the 'Brains of the Katipunan' and a close associate of Andrés Bonifacio, wrote the 'Kartilya ng Katipunan'?", a: "Emilio Jacinto" },
            { q: "Which 1898 naval battle, fought in Manila Bay between the United States and Spain, resulted in a decisive American victory led by Commodore George Dewey?", a: "The Battle of Manila Bay" }
          ]
        }
      },
      {
        name: "Philippine Culture",
        questions: {
          100: [
            { q: "What is the national language of the Philippines, based largely on Tagalog?", a: "Filipino" },
            { q: "What is the name of the traditional Filipino formal dress for women, distinguished by its structured 'butterfly sleeves'?", a: "The Terno" },
            { q: "What are the light, brightly colored wooden boats with bamboo outriggers commonly used for fishing and travel between Philippine islands?", a: "Bangka (outrigger boat)" }
          ],
          200: [
            { q: "What bamboo dance, performed by stepping between clapping bamboo poles, is a well-known traditional Philippine folk dance?", a: "Tinikling" },
            { q: "What is the name of the traditional Filipino martial art that uses sticks, blades, and empty-hand techniques, also known as Arnis?", a: "Eskrima (Arnis)" },
            { q: "What is the term for a Philippine town or barrio festival, usually held annually to honor a patron saint, featuring parades, food, and celebrations?", a: "Fiesta" }
          ],
          300: [
            { q: "What is the term for a traditional Filipino community spirit of helping neighbors with work, such as building a house?", a: "Bayanihan" },
            { q: "What is the term for the Filipino value of reciprocal favors and social debt, often described as a deep sense of gratitude owed to another?", a: "Utang na loob" },
            { q: "What is the name of the pre-colonial Filipino writing system, an alphasyllabary used before the widespread adoption of the Latin alphabet under Spanish rule?", a: "Baybayin" }
          ],
          400: [
            { q: "The iconic Philippine jeepney was originally created after World War II by modifying which vehicles left behind by American soldiers?", a: "U.S. military jeeps" },
            { q: "What is the name of the traditional Filipino stringed instrument, shaped somewhat like a guitar, commonly used to accompany the Rondalla ensemble?", a: "The bandurria" },
            { q: "What Filipino courtship tradition involves a suitor singing romantic songs beneath a woman's window at night, often accompanied by a guitar?", a: "Harana" }
          ],
          500: [
            { q: "What UNESCO-recognized Philippine rice terraces, carved into the mountains over 2,000 years ago by the Ifugao people, are often called the 'Eighth Wonder of the World'?", a: "The Banaue Rice Terraces" },
            { q: "What is the name of the Ifugao chant tradition, recognized by UNESCO as a Masterpiece of Oral and Intangible Heritage, which narrates ancestral heroes during harvest and mourning rituals?", a: "Hudhud (the Hudhud chants)" },
            { q: "What is the name of one of the world's longest folk epics, originating from the Sulod people of Panay, chronicling the heroic adventures of the warrior Labaw Donggon?", a: "Hinilawod" }
          ]
        }
      },
      {
        name: "Philippine Facts",
        questions: {
          100: [
            { q: "What is the capital city of the Philippines?", a: "Manila" },
            { q: "What is the most widely spoken second language in the Philippines, used extensively in business, government, and education?", a: "English" },
            { q: "What is the largest island in the Philippine archipelago by land area, home to Manila?", a: "Luzon" }
          ],
          200: [
            { q: "Approximately how many islands make up the Philippine archipelago?", a: "About 7,641 islands" },
            { q: "What is the second-largest island in the Philippines, known for cities like Davao and Cagayan de Oro?", a: "Mindanao" },
            { q: "What is the collective name for the central island group of the Philippines, which includes Cebu, Bohol, and Panay?", a: "The Visayas" }
          ],
          300: [
            { q: "What is the official currency of the Philippines?", a: "The Philippine peso" },
            { q: "What is the name of the central bank of the Philippines, responsible for monetary policy and issuing currency?", a: "Bangko Sentral ng Pilipinas (BSP)" },
            { q: "The Philippines is one of the world's largest producers and exporters of which tropical crop, used to make oil, milk, and copra?", a: "Coconut" }
          ],
          400: [
            { q: "Which Philippine volcano, known for its near-perfect cone shape, is located in Albay province?", a: "Mayon Volcano" },
            { q: "What is the name of the Philippines' most active volcano, located in Batangas province and known for its small size and crater lake?", a: "Taal Volcano" },
            { q: "What is the highest mountain in the Philippines, located on the island of Mindanao?", a: "Mount Apo" }
          ],
          500: [
            { q: "What is the name of the deepest point in the Philippine Sea, one of the deepest points in all of Earth's oceans, located east of the Philippines?", a: "The Philippine Trench (the Emden Deep)" },
            { q: "What is the name of the underground river in Puerto Princesa, Palawan, recognized as one of the New7Wonders of Nature and a UNESCO World Heritage Site?", a: "The Puerto Princesa Subterranean River" },
            { q: "What is the name of the UNESCO World Heritage marine sanctuary off Palawan, a remote coral atoll famous for its rich biodiversity in the Sulu Sea?", a: "Tubbataha Reefs Natural Park" }
          ]
        }
      }
    ]
  },
  "World Trivia": {
    icon: "🌐",
    categories: [
      {
        name: "World Records",
        questions: {
          100: [
            { q: "What is the tallest mountain in the world, located in the Himalayas?", a: "Mount Everest" },
            { q: "What is the largest country in the world by land area?", a: "Russia" },
            { q: "What is the largest mammal in the world?", a: "The blue whale" }
          ],
          200: [
            { q: "What is the largest ocean on Earth by surface area?", a: "The Pacific Ocean" },
            { q: "What is the largest continent on Earth by both area and population?", a: "Asia" },
            { q: "What is the tallest living animal in the world?", a: "The giraffe" }
          ],
          300: [
            { q: "What is the longest river in the world, located in Africa?", a: "The Nile River" },
            { q: "What is the largest lake in the world by surface area?", a: "The Caspian Sea" },
            { q: "What is the deepest known point in the world's oceans, located in the Pacific?", a: "The Mariana Trench" }
          ],
          400: [
            { q: "What is the smallest country in the world by land area?", a: "Vatican City" },
            { q: "What is the coldest permanently inhabited place on Earth, located in Siberia, Russia?", a: "Oymyakon" },
            { q: "What is the largest desert in the world when both hot and cold deserts are considered?", a: "Antarctica" }
          ],
          500: [
            { q: "What is the largest hot desert in the world, covering much of North Africa?", a: "The Sahara Desert" },
            { q: "What is the longest mountain range in the world, running mostly along the ocean floor?", a: "The Mid-Ocean Ridge" },
            { q: "What is the most remote inhabited island in the world, located in the South Atlantic Ocean?", a: "Tristan da Cunha" }
          ]
        }
      },
      {
        name: "World Cultures",
        questions: {
          100: [
            { q: "In Japan, what is the traditional art of paper folding called?", a: "Origami" },
            { q: "What is the traditional draped garment worn by women in India?", a: "The sari (saree)" },
            { q: "What is the traditional knee-length garment worn by men in Scotland?", a: "The kilt" }
          ],
          200: [
            { q: "What is the traditional Indian greeting, performed by pressing one's palms together and slightly bowing?", a: "Namaste" },
            { q: "What Mexican holiday, held on November 1st and 2nd, honors and celebrates deceased loved ones?", a: "Día de los Muertos (Day of the Dead)" },
            { q: "What Hawaiian word is used as both a greeting and a farewell, and also means love?", a: "Aloha" }
          ],
          300: [
            { q: "Which country is credited as the birthplace of pizza, specifically the city of Naples?", a: "Italy" },
            { q: "Which country is considered the birthplace of yoga as a spiritual and physical practice?", a: "India" },
            { q: "What is the name of the traditional Maori greeting in New Zealand, involving pressing noses together?", a: "The hongi" }
          ],
          400: [
            { q: "What is the term for the traditional Japanese tea ceremony, emphasizing mindfulness and ritual?", a: "Chanoyu (the Way of Tea, Sado)" },
            { q: "What is the name of the traditional Japanese art of flower arranging?", a: "Ikebana" },
            { q: "What is the name of the traditional Indonesian and Malay dagger, considered a spiritual and cultural symbol?", a: "The kris (keris)" }
          ],
          500: [
            { q: "What is the name of the Jewish New Year celebration, typically occurring in September or October?", a: "Rosh Hashanah" },
            { q: "What is the term for the Aboriginal Australian belief system explaining the spiritual creation of the world?", a: "The Dreamtime (the Dreaming)" },
            { q: "What is the name of the traditional Bhutanese robe worn by men, tied at the waist with a belt?", a: "The gho" }
          ]
        }
      },
      {
        name: "World Events",
        questions: {
          100: [
            { q: "In what year did World War II end?", a: "1945" },
            { q: "In what year did World War I begin?", a: "1914" },
            { q: "In what year did the September 11 terrorist attacks occur in the United States?", a: "2001" }
          ],
          200: [
            { q: "What historic 1989 event, involving the destruction of a section of a Berlin barrier, symbolized the end of the Cold War divide?", a: "The Fall of the Berlin Wall" },
            { q: "In what year did the Soviet Union officially dissolve?", a: "1991" },
            { q: "Which city hosted the 2008 Summer Olympics, marking China's emergence on the world stage?", a: "Beijing" }
          ],
          300: [
            { q: "Which international organization, founded in 1945 to maintain global peace and security, currently has 193 member states?", a: "The United Nations" },
            { q: "Which political and economic union of European countries, formally established in 1993, uses a shared set of institutions and, for most members, a common currency?", a: "The European Union" },
            { q: "In what year did Hong Kong's sovereignty transfer from the United Kingdom back to China?", a: "1997" }
          ],
          400: [
            { q: "What global health crisis, caused by a novel coronavirus, was declared a pandemic by the WHO in March 2020?", a: "The COVID-19 pandemic" },
            { q: "In what year did the Rwandan genocide take place, resulting in the deaths of an estimated 800,000 people?", a: "1994" },
            { q: "What name is given to the wave of pro-democracy uprisings that swept across the Middle East and North Africa beginning in 2011?", a: "The Arab Spring" }
          ],
          500: [
            { q: "In what year did the Chernobyl nuclear disaster occur in present-day Ukraine, then part of the Soviet Union?", a: "1986" },
            { q: "In what year did the Cuban Missile Crisis bring the United States and the Soviet Union to the brink of nuclear war?", a: "1962" },
            { q: "What year was the Treaty of Tordesillas signed, dividing newly discovered lands outside Europe between Spain and Portugal?", a: "1494" }
          ]
        }
      }
    ]
  },
  "History": {
    icon: "📜",
    categories: [
      {
        name: "Ancient History",
        questions: {
          100: [
            { q: "Which ancient Egyptian structures, built as tombs for pharaohs, are among the Seven Wonders of the Ancient World?", a: "The Pyramids (of Giza)" },
            { q: "Which ancient civilization built the mountaintop citadel of Machu Picchu in present-day Peru?", a: "The Inca (Inca Empire)" },
            { q: "Which ancient civilization worshipped gods like Zeus and Athena and built the Parthenon?", a: "Ancient Greece (the Greeks)" }
          ],
          200: [
            { q: "Which ancient civilization built the Colosseum, a large amphitheater used for gladiator contests?", a: "The Roman Empire (Ancient Rome)" },
            { q: "Which ancient Mesoamerican civilization built the pyramid city of Chichen Itza in present-day Mexico?", a: "The Maya (Maya civilization)" },
            { q: "Which ancient civilization, centered in South Asia, built well-planned cities like Mohenjo-daro and Harappa?", a: "The Indus Valley Civilization (Harappan Civilization)" }
          ],
          300: [
            { q: "Which Chinese dynasty began construction of an early version of the Great Wall of China to protect against northern invasions?", a: "The Qin Dynasty" },
            { q: "Which ancient Egyptian queen, famous for her relationships with Julius Caesar and Mark Antony, was the last active ruler of the Ptolemaic Kingdom?", a: "Cleopatra (Cleopatra VII)" },
            { q: "Which ancient Greek city-state was known for its military discipline and warrior culture, exemplified by the Battle of Thermopylae?", a: "Sparta" }
          ],
          400: [
            { q: "Which Macedonian king created one of the largest empires of the ancient world by the age of 30, stretching from Greece to India?", a: "Alexander the Great" },
            { q: "Which Roman emperor built the defensive wall across northern Britain that bears his name?", a: "Hadrian (Hadrian's Wall)" },
            { q: "Which ancient wonder of the world was a giant bronze statue of the sun god Helios that stood at the harbor entrance of Rhodes?", a: "The Colossus of Rhodes" }
          ],
          500: [
            { q: "Which ancient Mesopotamian king created one of the earliest known written law codes, inscribed on a stone stele around 1754 BCE?", a: "Hammurabi" },
            { q: "Which ancient Persian king founded the Achaemenid Empire, the largest empire the ancient world had yet seen?", a: "Cyrus the Great" },
            { q: "What was the name of the renowned ancient Egyptian library, believed to be one of the largest and most significant libraries of the ancient world before its destruction?", a: "The Library of Alexandria" }
          ]
        }
      },
      {
        name: "Modern History",
        questions: {
          100: [
            { q: "Which U.S. president delivered the Gettysburg Address in 1863 during the American Civil War?", a: "Abraham Lincoln" },
            { q: "Which country was divided into East and West until its 1990 reunification?", a: "Germany" },
            { q: "In what year did the United States declare independence from Great Britain?", a: "1776" }
          ],
          200: [
            { q: "In what year did the Titanic sink after hitting an iceberg on its maiden voyage?", a: "1912" },
            { q: "Which country was the first in the world to grant women the right to vote nationally, in 1893?", a: "New Zealand" },
            { q: "Which empire, at its height in the early 20th century, was the largest empire in history by land area, covering about a quarter of the globe?", a: "The British Empire" }
          ],
          300: [
            { q: "Astronauts from which country were the first humans to walk on the Moon in 1969, aboard Apollo 11?", a: "The United States" },
            { q: "Which country launched Sputnik 1, the first artificial satellite, into orbit in 1957?", a: "The Soviet Union" },
            { q: "What 1994 trade agreement created a free trade zone between the United States, Canada, and Mexico?", a: "NAFTA (North American Free Trade Agreement)" }
          ],
          400: [
            { q: "Which Indian leader is famous for leading India to independence from British rule through nonviolent civil disobedience?", a: "Mahatma Gandhi" },
            { q: "Which Chinese Communist leader founded the People's Republic of China in 1949?", a: "Mao Zedong" },
            { q: "What South African system of institutionalized racial segregation officially ended in the early 1990s?", a: "Apartheid" }
          ],
          500: [
            { q: "Which 1919 treaty formally ended World War I and imposed heavy reparations on Germany?", a: "The Treaty of Versailles" },
            { q: "What was the name of the secret 1916 agreement between Britain and France that divided Ottoman territories in the Middle East into spheres of influence?", a: "The Sykes-Picot Agreement" },
            { q: "In what year was the Marshall Plan enacted to help rebuild Western European economies after World War II?", a: "1948" }
          ]
        }
      },
      {
        name: "Wars & Revolutions",
        questions: {
          100: [
            { q: "Which war, fought from 1861 to 1865, was fought between the northern and southern United States, largely over slavery?", a: "The American Civil War" },
            { q: "Which war, fought from 1939 to 1945, involved most of the world's nations divided into Allied and Axis powers?", a: "World War II" },
            { q: "Which war, fought between 1775 and 1783, resulted in the American colonies gaining independence from Great Britain?", a: "The American Revolutionary War" }
          ],
          200: [
            { q: "Which 1789 revolution led to the overthrow of the French monarchy and the eventual rise of Napoleon Bonaparte?", a: "The French Revolution" },
            { q: "Which war, fought from 1914 to 1918, was known at the time as 'the Great War'?", a: "World War I" },
            { q: "Which conflict, ending in 1949 with the Communist Party's victory, resulted in Mao Zedong taking control of mainland China?", a: "The Chinese Civil War" }
          ],
          300: [
            { q: "Which war, lasting from 1955 to 1975, was fought in Southeast Asia between North and South Vietnam, with heavy U.S. involvement?", a: "The Vietnam War" },
            { q: "Which war, fought between 1980 and 1988, was one of the longest conventional wars of the 20th century, fought between two Middle Eastern nations?", a: "The Iran-Iraq War" },
            { q: "Which 1991 conflict saw a U.S.-led coalition force Iraqi troops to withdraw from Kuwait?", a: "The Gulf War (Persian Gulf War)" }
          ],
          400: [
            { q: "Which 1917 revolution led to the overthrow of the Russian monarchy and the eventual rise of the Soviet Union?", a: "The Russian Revolution" },
            { q: "Which 1911 revolution overthrew China's last imperial dynasty, the Qing, and established a republic?", a: "The Xinhai Revolution" },
            { q: "Which revolution, led by Fidel Castro, overthrew the Cuban government of Fulgencio Batista in 1959?", a: "The Cuban Revolution" }
          ],
          500: [
            { q: "Which war, fought between 1950 and 1953, ended in an armistice that still technically leaves North and South Korea in a state of war?", a: "The Korean War" },
            { q: "Which war, fought from 1899 to 1902, saw the British Empire fight against two Boer republics in South Africa?", a: "The Second Boer War" },
            { q: "Which conflict, fought from 1936 to 1939 in Spain, became a proxy battleground for fascist and communist ideologies before World War II?", a: "The Spanish Civil War" }
          ]
        }
      }
    ]
  },
  "Technology": {
    icon: "💻",
    categories: [
      {
        name: "Computers & Internet",
        questions: {
          100: [
            { q: "What does 'WWW' stand for, the system that lets users navigate linked web pages?", a: "World Wide Web" },
            { q: "What does the 'URL' in a website address stand for?", a: "Uniform Resource Locator" },
            { q: "What is the common term for unwanted junk email sent out in bulk?", a: "Spam" }
          ],
          200: [
            { q: "What social media platform, launched in 2004 by Mark Zuckerberg, was originally created for Harvard students?", a: "Facebook" },
            { q: "What social media platform, known for short posts and rebranded to 'X' in 2023, was originally called Twitter?", a: "Twitter (X)" },
            { q: "What is the common short name for the wireless technology that lets devices connect to a network without cables?", a: "Wi-Fi" }
          ],
          300: [
            { q: "What term describes unwanted or malicious software designed to damage, disrupt, or gain unauthorized access to a computer system?", a: "Malware" },
            { q: "What term describes a network of infected computers controlled remotely to carry out cyberattacks, often without their owners' knowledge?", a: "A botnet" },
            { q: "What term describes tricking people into revealing sensitive information like passwords through fake emails or websites?", a: "Phishing" }
          ],
          400: [
            { q: "What is the term for storing and accessing data and programs over the internet instead of a computer's hard drive?", a: "Cloud computing" },
            { q: "What networking protocol suite, developed in the 1970s, forms the basic communication language of the internet?", a: "TCP/IP" },
            { q: "What decentralized ledger technology underlies cryptocurrencies like Bitcoin?", a: "Blockchain" }
          ],
          500: [
            { q: "What programming language, created by Brendan Eich in just 10 days in 1995, is the primary scripting language used to make websites interactive?", a: "JavaScript" },
            { q: "What was the name of the first computer worm to spread widely via the internet, released in 1988 and named after its creator?", a: "The Morris Worm" },
            { q: "Who is widely credited as the inventor of the World Wide Web while working at CERN in 1989?", a: "Tim Berners-Lee" }
          ]
        }
      },
      {
        name: "Gadgets",
        questions: {
          100: [
            { q: "Which company created the iPhone, first released in 2007?", a: "Apple" },
            { q: "Which company created the PlayStation gaming console?", a: "Sony" },
            { q: "What term describes a phone that combines mobile calling with computer-like features such as apps and internet browsing?", a: "A smartphone" }
          ],
          200: [
            { q: "What wearable device, popularized by companies like Fitbit and Apple, tracks steps, heart rate, and other health metrics?", a: "A fitness tracker (smartwatch)" },
            { q: "Which company created the Echo smart speaker featuring the voice assistant Alexa?", a: "Amazon" },
            { q: "What handheld gaming device, released by Nintendo in 2017, can be used both as a portable device and connected to a TV?", a: "The Nintendo Switch" }
          ],
          300: [
            { q: "What term describes glasses or headsets that overlay digital information onto the real world, as opposed to fully immersive virtual reality?", a: "Augmented reality (AR)" },
            { q: "What term describes a fully computer-generated, immersive environment experienced through a headset that blocks out the real world?", a: "Virtual reality (VR)" },
            { q: "What wireless technology, named after a 10th-century Scandinavian king, allows short-range data exchange between devices like headphones and phones?", a: "Bluetooth" }
          ],
          400: [
            { q: "Which company released the first mass-market e-reader, the Kindle, in 2007?", a: "Amazon" },
            { q: "Which company released the first commercially successful tablet computer, the iPad, in 2010?", a: "Apple" },
            { q: "What was the name of the first portable mobile phone, released by Motorola in 1983 and nicknamed 'the brick'?", a: "The Motorola DynaTAC 8000X" }
          ],
          500: [
            { q: "What was the name of the first commercially successful portable music player, released by Apple in 2001, which helped popularize digital music?", a: "The iPod" },
            { q: "What was the world's first commercially available smartphone, released by IBM in 1994, featuring a touchscreen and built-in apps?", a: "The IBM Simon (Simon Personal Communicator)" },
            { q: "Which company released the first mass-market portable computer, the Osborne 1, in 1981?", a: "Osborne Computer Corporation" }
          ]
        }
      },
      {
        name: "Tech Companies",
        questions: {
          100: [
            { q: "Which company, founded by Bill Gates and Paul Allen in 1975, created the Windows operating system?", a: "Microsoft" },
            { q: "Which company, founded by Mark Zuckerberg, owns Facebook, Instagram, and WhatsApp?", a: "Meta (Meta Platforms)" },
            { q: "Which company, founded by Jeff Bezos, is the world's largest online retailer?", a: "Amazon" }
          ],
          200: [
            { q: "Which search engine company, founded by Larry Page and Sergey Brin in 1998, is now part of the parent company Alphabet?", a: "Google" },
            { q: "Which company, founded in 1997, began as a DVD-by-mail rental service before becoming a global streaming giant?", a: "Netflix" },
            { q: "Which Chinese technology company owns the popular short-video app TikTok?", a: "ByteDance" }
          ],
          300: [
            { q: "Which electric car and clean energy company was founded and is led by Elon Musk?", a: "Tesla" },
            { q: "Which ride-hailing company, founded in 2009, pioneered the modern app-based rideshare industry?", a: "Uber" },
            { q: "Which company, founded by Jack Dorsey and others in 2006, created the microblogging platform now known as X?", a: "Twitter" }
          ],
          400: [
            { q: "Which South Korean company is the world's largest manufacturer of smartphones and semiconductors, alongside making TVs and appliances?", a: "Samsung" },
            { q: "Which Taiwanese company is the world's largest contract manufacturer of semiconductor chips, producing chips for companies like Apple and Nvidia?", a: "TSMC (Taiwan Semiconductor Manufacturing Company)" },
            { q: "Which Japanese company, founded in 1889 originally as a playing card maker, now produces the Nintendo Switch and other gaming consoles?", a: "Nintendo" }
          ],
          500: [
            { q: "Which company did Steve Jobs, Steve Wozniak, and Ronald Wayne co-found in a garage in 1976?", a: "Apple" },
            { q: "Which company did Larry Ellison co-found in 1977, which became one of the world's largest database software companies?", a: "Oracle" },
            { q: "What was the original name of the search engine project at Stanford that would later be renamed Google?", a: "BackRub" }
          ]
        }
      }
    ]
  },
  "Food": {
    icon: "🍽️",
    categories: [
      {
        name: "World Cuisine",
        questions: {
          100: [
            { q: "What Italian dish consists of a flat, round base topped with tomato sauce, cheese, and various toppings, then baked?", a: "Pizza" },
            { q: "What Mexican dish consists of a folded tortilla filled with meat, cheese, and other toppings?", a: "A taco" },
            { q: "What Indian dish consists of a spiced, simmered sauce, often made with meat, and eaten with rice or bread?", a: "Curry" }
          ],
          200: [
            { q: "What Japanese dish consists of vinegared rice combined with raw fish or other ingredients?", a: "Sushi" },
            { q: "What Thai noodle dish, stir-fried with eggs, tofu or shrimp, and peanuts, is one of the country's most famous exports?", a: "Pad Thai" },
            { q: "What Spanish rice dish, typically made with saffron and seafood or meat, originated in Valencia?", a: "Paella" }
          ],
          300: [
            { q: "What spicy Korean side dish, made from fermented vegetables (usually napa cabbage), is a staple of Korean cuisine?", a: "Kimchi" },
            { q: "What Hungarian dish is a rich stew made with meat and vegetables, heavily seasoned with paprika?", a: "Goulash" },
            { q: "What Middle Eastern dish consists of ground chickpeas blended with tahini, lemon, and garlic into a creamy dip?", a: "Hummus" }
          ],
          400: [
            { q: "What French cooking technique involves slowly cooking food in its own fat at a low temperature, often used for duck?", a: "Confit" },
            { q: "What Moroccan dish, and the cone-shaped clay pot it's cooked in, refers to a slow-cooked stew?", a: "Tagine" },
            { q: "What Japanese cooking technique involves deep-frying battered seafood or vegetables until light and crispy?", a: "Tempura" }
          ],
          500: [
            { q: "What is the name of the fermented soybean paste used as a base for miso soup in Japanese cuisine?", a: "Miso" },
            { q: "What is the name of the fermented, pungent Icelandic dish made from cured shark meat, considered a national delicacy?", a: "Hákarl" },
            { q: "What is the name of the traditional cheese-filled bread from the country of Georgia, shaped like a boat with an egg in the center?", a: "Khachapuri" }
          ]
        }
      },
      {
        name: "Filipino Food",
        questions: {
          100: [
            { q: "What popular Filipino dish is made by marinating meat in vinegar, soy sauce, and garlic, then stewing it?", a: "Adobo" },
            { q: "What popular Filipino sour soup is commonly flavored with tamarind and cooked with pork, shrimp, or fish?", a: "Sinigang" },
            { q: "What is the Filipino version of spring rolls, filled with vegetables and/or meat and then deep-fried?", a: "Lumpia" }
          ],
          200: [
            { q: "What is the name of the Filipino dish of stir-fried rice, often made using leftover rice from the previous day's meal?", a: "Sinangag (garlic fried rice)" },
            { q: "What Filipino dish consists of chicken or pork cooked in coconut milk with chili peppers, popular in the Bicol region?", a: "Bicol Express" },
            { q: "What popular Filipino dish, made from chopped and seasoned pig face and liver, is often served sizzling on a hot plate?", a: "Sisig" }
          ],
          300: [
            { q: "What Filipino noodle dish, brought by Chinese immigrants, is commonly served at birthday celebrations to symbolize long life?", a: "Pancit" },
            { q: "What Filipino stew, often made for special occasions, features beef or goat meat cooked in tomato sauce with liver spread, potatoes, and bell peppers?", a: "Kaldereta" },
            { q: "What Filipino dish consists of pork cooked until tender then deep-fried until crispy, usually served with a vinegar dipping sauce?", a: "Lechon Kawali" }
          ],
          400: [
            { q: "What Filipino dessert consists of layered shaved ice, evaporated milk, and sweetened fruits, beans, and jellies?", a: "Halo-halo" },
            { q: "What Filipino rice cake, made from glutinous rice and coconut milk, is wrapped in banana leaves and often eaten with sugar or mangoes?", a: "Suman" },
            { q: "What Filipino dish is a savory stew made from pork blood, vinegar, and spices?", a: "Dinuguan" }
          ],
          500: [
            { q: "What Visayan roasted pig dish, famous in Cebu, was once named the 'Best Dish in the World' by chef Anthony Bourdain?", a: "Lechon (Cebu lechon)" },
            { q: "What is the name of the traditional Filipino fermented fish or shrimp paste, used as a condiment in dishes like kare-kare?", a: "Bagoong" },
            { q: "What is the name of the traditional fermented rice wine made by the Cordilleran (Igorot) peoples of the Philippine highlands?", a: "Tapuy" }
          ]
        }
      },
      {
        name: "Desserts & Drinks",
        questions: {
          100: [
            { q: "What frozen dessert, typically made from dairy, sugar, and flavorings, is a popular treat worldwide?", a: "Ice cream" },
            { q: "What sweet, carbonated soft drink, invented in 1886 by pharmacist John Pemberton, is one of the world's best-selling beverages?", a: "Coca-Cola" },
            { q: "What warm beverage, made by brewing dried leaves in hot water, is one of the most widely consumed drinks in the world?", a: "Tea" }
          ],
          200: [
            { q: "What Italian coffee drink is made by forcing hot water through finely-ground coffee beans, forming a concentrated shot?", a: "Espresso" },
            { q: "What espresso-based Italian coffee drink, named after a religious order's brown robes, combines espresso with steamed milk and foam?", a: "Cappuccino" },
            { q: "What layered Italian dessert combines coffee-soaked ladyfinger biscuits with mascarpone cheese and cocoa powder?", a: "Tiramisu" }
          ],
          300: [
            { q: "What French dessert consists of a rich custard base topped with a layer of hardened caramelized sugar?", a: "Crème brûlée" },
            { q: "What French pastry consists of delicate almond meringue cookies sandwiched together with a filling like ganache or buttercream?", a: "Macarons" },
            { q: "What Spanish dessert consists of a rich caramel custard, similar to crème brûlée but topped with a soft caramel sauce instead of a hardened crust?", a: "Flan" }
          ],
          400: [
            { q: "What Mexican beverage, made from the fermented agave plant, is the base spirit for margaritas?", a: "Tequila" },
            { q: "What Japanese rice wine, brewed rather than distilled, is traditionally served warm or cold alongside sushi?", a: "Sake" },
            { q: "What Caribbean spirit, distilled from sugarcane byproducts like molasses, is the base for cocktails like the mojito and daiquiri?", a: "Rum" }
          ],
          500: [
            { q: "What is the term for the traditional Ethiopian coffee ceremony, an important social ritual involving roasting beans in front of guests?", a: "The Ethiopian coffee ceremony (Buna)" },
            { q: "What traditional Mexican fermented alcoholic beverage, made from the sap of the maguey (agave) plant, predates tequila and mezcal?", a: "Pulque" },
            { q: "What Scandinavian spiced, mulled wine is traditionally served during the Christmas season, especially in Sweden and Norway?", a: "Glögg" }
          ]
        }
      }
    ]
  },
  "Famous People": {
    icon: "🌟",
    categories: [
      {
        name: "Scientists",
        questions: {
          100: [
            { q: "Which physicist developed the theory of general relativity and famously came up with the equation E=mc²?", a: "Albert Einstein" },
            { q: "Which Serbian-American inventor is known for his contributions to the design of the modern alternating current (AC) electricity system?", a: "Nikola Tesla" },
            { q: "Which inventor is credited with developing the practical light bulb and phonograph, holding over 1,000 patents?", a: "Thomas Edison" }
          ],
          200: [
            { q: "Which British scientist proposed the theory of evolution by natural selection in his 1859 book 'On the Origin of Species'?", a: "Charles Darwin" },
            { q: "Which Scottish scientist discovered penicillin in 1928, revolutionizing the treatment of bacterial infections?", a: "Alexander Fleming" },
            { q: "Which Italian astronomer improved the telescope and made key observations supporting the heliocentric model of the solar system?", a: "Galileo Galilei" }
          ],
          300: [
            { q: "Which Polish-French scientist was the first person to win Nobel Prizes in two different scientific fields (Physics and Chemistry)?", a: "Marie Curie" },
            { q: "Which Austrian physicist is known for a famous thought experiment involving a cat that is simultaneously alive and dead?", a: "Erwin Schrödinger" },
            { q: "Which German physicist discovered X-rays in 1895, earning the first-ever Nobel Prize in Physics?", a: "Wilhelm Röntgen" }
          ],
          400: [
            { q: "Which English scientist formulated the laws of motion and universal gravitation, publishing them in his 1687 work 'Principia Mathematica'?", a: "Sir Isaac Newton" },
            { q: "Which French chemist and microbiologist developed the process of pasteurization and pioneered vaccines for rabies and anthrax?", a: "Louis Pasteur" },
            { q: "Which Scottish-born scientist invented and patented the telephone in 1876?", a: "Alexander Graham Bell" }
          ],
          500: [
            { q: "Which British theoretical physicist, known for his work on black holes and the book 'A Brief History of Time', lived most of his life with ALS (motor neurone disease)?", a: "Stephen Hawking" },
            { q: "Which Austrian monk is considered the father of modern genetics for his experiments on pea plant inheritance in the 1860s?", a: "Gregor Mendel" },
            { q: "Which reclusive English scientist is credited with discovering hydrogen and calculating the density of the Earth?", a: "Henry Cavendish" }
          ]
        }
      },
      {
        name: "Leaders & Politicians",
        questions: {
          100: [
            { q: "Who was the first President of the United States?", a: "George Washington" },
            { q: "Who was the first President of the Philippines, credited with proclaiming the country's independence from Spain in 1898?", a: "Emilio Aguinaldo" },
            { q: "Who is the current King of the United Kingdom, having ascended the throne in 2022 after the death of his mother?", a: "King Charles III" }
          ],
          200: [
            { q: "Which South African leader, imprisoned for 27 years for his anti-apartheid activism, became the country's first Black president in 1994?", a: "Nelson Mandela" },
            { q: "Who was the first Black President of the United States, serving two terms from 2009 to 2017?", a: "Barack Obama" },
            { q: "Who was the longest-reigning monarch in British history, reigning for over 70 years until her death in 2022?", a: "Queen Elizabeth II" }
          ],
          300: [
            { q: "Who was the Prime Minister of the United Kingdom during most of World War II, known for his defiant wartime speeches?", a: "Winston Churchill" },
            { q: "Who was the first Prime Minister of independent India, serving from 1947 to 1964?", a: "Jawaharlal Nehru" },
            { q: "Which French general and statesman led the Free French Forces during World War II and later became President of France?", a: "Charles de Gaulle" }
          ],
          400: [
            { q: "Which Filipino president, the 5th President of the Philippines, declared Martial Law in 1972 and ruled for over two decades?", a: "Ferdinand Marcos Sr." },
            { q: "Who was the Philippine senator assassinated at Manila International Airport in 1983, whose death helped spark the People Power Revolution?", a: "Benigno 'Ninoy' Aquino Jr." },
            { q: "Who served as the first Chancellor of a reunified Germany after leading West Germany through reunification in 1990?", a: "Helmut Kohl" }
          ],
          500: [
            { q: "Who was the first female Prime Minister of the United Kingdom, serving from 1979 to 1990 and nicknamed the 'Iron Lady'?", a: "Margaret Thatcher" },
            { q: "Who was the first female President of the Philippines, taking office after the 1986 People Power Revolution?", a: "Corazon Aquino" },
            { q: "Who was the President of Yugoslavia from 1953 until his death in 1980, known for maintaining independence from both NATO and the Soviet bloc?", a: "Josip Broz Tito" }
          ]
        }
      },
      {
        name: "Icons & Innovators",
        questions: {
          100: [
            { q: "Which entrepreneur co-founded Apple and is credited with revolutionizing personal computers, phones, and music players?", a: "Steve Jobs" },
            { q: "Which entrepreneur founded Amazon in 1994 and later founded the aerospace company Blue Origin?", a: "Jeff Bezos" },
            { q: "Which entrepreneur and engineer leads Tesla and SpaceX, and briefly became the world's richest person?", a: "Elon Musk" }
          ],
          200: [
            { q: "Which American civil rights leader delivered the famous 'I Have a Dream' speech in 1963?", a: "Martin Luther King Jr." },
            { q: "Which American entrepreneur co-founded Microsoft and has since become one of the world's leading philanthropists through his foundation?", a: "Bill Gates" },
            { q: "Which world-renowned primatologist is famous for her decades-long study of wild chimpanzees in Tanzania?", a: "Jane Goodall" }
          ],
          300: [
            { q: "Which Filipino boxer became the only eight-division world champion in boxing history and later served as a Philippine senator?", a: "Manny Pacquiao" },
            { q: "Which Brazilian football (soccer) player, widely regarded as one of the greatest of all time, won three FIFA World Cups?", a: "Pelé" },
            { q: "Which Argentine footballer led his country to World Cup victory in 2022 and is considered one of the greatest players in history?", a: "Lionel Messi" }
          ],
          400: [
            { q: "Which media mogul and philanthropist became the first Black woman billionaire, known for her long-running talk show?", a: "Oprah Winfrey" },
            { q: "Which American inventor and businessman is credited with mass-producing the automobile via the moving assembly line, founding a company bearing his name?", a: "Henry Ford" },
            { q: "Which American animator and entrepreneur founded the company known for creating Mickey Mouse and building the first Disneyland theme park?", a: "Walt Disney" }
          ],
          500: [
            { q: "Which women's rights activist and Pakistani education advocate survived a Taliban assassination attempt in 2012 and became the youngest-ever Nobel Prize laureate at age 17?", a: "Malala Yousafzai" },
            { q: "Which Kenyan environmental and political activist became the first African woman to win the Nobel Peace Prize, in 2004, for her work with the Green Belt Movement?", a: "Wangari Maathai" },
            { q: "Which Bangladeshi economist founded the Grameen Bank and pioneered the concept of microcredit, winning the Nobel Peace Prize in 2006?", a: "Muhammad Yunus" }
          ]
        }
      }
    ]
  },
  "E-Commerce": {
    icon: "🛒",
    categories: [
      {
        name: "E-Commerce Basics",
        questions: {
          100: [
            { q: "What does the term 'E-Commerce' refer to?", a: "Electronic Commerce — buying and selling goods or services online" },
            { q: "What abbreviation refers to buying and selling products through mobile devices like smartphones?", a: "M-Commerce (Mobile Commerce)" },
            { q: "What term describes an online business's digital storefront where customers browse and buy products?", a: "An online store (e-store)" }
          ],
          200: [
            { q: "What abbreviation describes an online business that sells directly to individual customers, like an online clothing store selling to shoppers?", a: "B2C (Business-to-Consumer)" },
            { q: "What abbreviation describes an online transaction between a business and a government agency, such as a company bidding on a government contract online?", a: "B2G (Business-to-Government)" },
            { q: "What term describes the percentage of website visitors who complete a desired action, like making a purchase?", a: "Conversion rate" }
          ],
          300: [
            { q: "What abbreviation describes an online transaction between two businesses, such as a supplier selling materials to a manufacturer?", a: "B2B (Business-to-Business)" },
            { q: "What term describes a business selling products directly to consumers, cutting out traditional retail middlemen?", a: "DTC / D2C (Direct-to-Consumer)" },
            { q: "What term describes the fee an online marketplace charges sellers for each item sold on its platform?", a: "A commission (seller fee)" }
          ],
          400: [
            { q: "What abbreviation describes an online transaction where individual consumers sell directly to other consumers, such as on Facebook Marketplace?", a: "C2C (Consumer-to-Consumer)" },
            { q: "What term describes software that lets businesses build and manage their own online stores, such as Shopify or WooCommerce?", a: "An E-Commerce platform" },
            { q: "What term describes a shopper adding items to an online cart but leaving the site without completing the purchase?", a: "Cart abandonment" }
          ],
          500: [
            { q: "What term describes a retail approach where a business sells to customers through multiple integrated channels at once, such as its website, app, and physical store?", a: "Omnichannel retailing" },
            { q: "What term describes the E-Commerce practice of adjusting product prices in real time based on demand, competition, or other market factors?", a: "Dynamic pricing" },
            { q: "What legal term describes the level of business presence in a state that requires an online retailer to collect that state's sales tax, even without a physical store there?", a: "Economic nexus" }
          ]
        }
      },
      {
        name: "Online Shopping",
        questions: {
          100: [
            { q: "What is the term for the virtual list where online shoppers place items before checking out?", a: "The shopping cart" },
            { q: "What is the term for the final step in online shopping where a customer confirms their order and payment?", a: "Checkout" },
            { q: "What is the term for a saved list of items an online shopper wants to buy later, without adding them to the cart?", a: "A wishlist" }
          ],
          200: [
            { q: "Which Southeast Asian E-Commerce app, recognizable by its orange branding, is one of the most popular online shopping platforms in the Philippines?", a: "Shopee" },
            { q: "Which American E-Commerce giant offers a membership program called Prime, providing free shipping and streaming perks?", a: "Amazon" },
            { q: "What term describes shipping offered at no extra cost to encourage customers to complete an online purchase?", a: "Free shipping" }
          ],
          300: [
            { q: "What term describes a code shoppers enter at checkout to receive a discount on their online order?", a: "A promo code (voucher code)" },
            { q: "What annual U.S. online shopping event, held the Monday after Thanksgiving, is known for major E-Commerce discounts?", a: "Cyber Monday" },
            { q: "What term describes the star ratings and written feedback shoppers leave on a product page to help build trust?", a: "Product reviews (ratings)" }
          ],
          400: [
            { q: "What term describes the E-Commerce practice of showing customers products similar to ones they've viewed or bought, to encourage more sales?", a: "Product recommendations" },
            { q: "What term describes technology that lets online shoppers preview how furniture or products would look in their own space using their phone camera?", a: "Augmented reality (AR) shopping" },
            { q: "What term describes a browser tool that automatically searches for and applies the best available discount codes at online checkout?", a: "A coupon extension" }
          ],
          500: [
            { q: "What annual online shopping event, held every November 11th and popularized by Alibaba, has become one of the world's largest single-day sales events?", a: "11.11 (Singles' Day sale)" },
            { q: "What annual mid-year online shopping festival, held on June 18th and led by JD.com, is one of China's largest E-Commerce sales events?", a: "618 (the Mid-Year Shopping Festival)" },
            { q: "What term describes the E-Commerce practice of using scarcity cues, like 'Only 2 left in stock,' to pressure shoppers into faster purchase decisions?", a: "Scarcity marketing (FOMO marketing)" }
          ]
        }
      },
      {
        name: "Digital Payments",
        questions: {
          100: [
            { q: "What is the general term for a mobile app that lets users store money digitally and pay for purchases using their phone?", a: "A digital wallet (e-wallet)" },
            { q: "What is the general term for a plastic card linked directly to a bank account, deducting funds immediately when used to pay?", a: "A debit card" },
            { q: "What is the general term for a card that lets users borrow money up to a limit to make purchases, paid back later?", a: "A credit card" }
          ],
          200: [
            { q: "Which popular Philippine mobile wallet app, often used for paying bills and online purchases, has a blue-colored logo?", a: "GCash" },
            { q: "Which American digital payment company, founded in 1998 and once part of eBay, is one of the most widely used online payment services worldwide?", a: "PayPal" },
            { q: "Which mobile payment service, built into iPhones, lets users pay by tapping their device at a contactless terminal?", a: "Apple Pay" }
          ],
          300: [
            { q: "What three-letter code do shoppers enter when paying online with a credit or debit card, usually found on the back of the card?", a: "CVV (Card Verification Value)" },
            { q: "What term describes the process by which a bank verifies that a customer has sufficient funds or credit before approving an online transaction?", a: "Authorization" },
            { q: "What term describes a company that processes credit and debit card transactions between merchants, banks, and card networks?", a: "A payment gateway (payment processor)" }
          ],
          400: [
            { q: "What technology allows contactless payments by tapping a card or phone near a payment terminal?", a: "NFC (Near-Field Communication)" },
            { q: "What term describes short-term financing that lets online shoppers split a purchase into smaller installment payments, often interest-free?", a: "BNPL (Buy Now, Pay Later)" },
            { q: "What security standard is widely used to protect sensitive payment card data during online transactions?", a: "PCI DSS (Payment Card Industry Data Security Standard)" }
          ],
          500: [
            { q: "What decentralized digital currency, created in 2009 by the pseudonymous Satoshi Nakamoto, is sometimes accepted as an alternative online payment method?", a: "Bitcoin" },
            { q: "What term describes a digital currency issued and regulated directly by a country's central bank, distinct from decentralized cryptocurrencies?", a: "CBDC (Central Bank Digital Currency)" },
            { q: "What Philippine instant payment system, launched by the central bank in 2018, enables real-time fund transfers between different banks and e-wallets?", a: "InstaPay" }
          ]
        }
      },
      {
        name: "E-Commerce Platforms",
        questions: {
          100: [
            { q: "Which American company, founded by Jeff Bezos in 1994, is the world's largest online marketplace and started out selling only books?", a: "Amazon" },
            { q: "Which Southeast Asian E-Commerce app, recognizable by its orange branding, is one of the region's most popular online shopping platforms?", a: "Shopee" },
            { q: "Which online marketplace, known for handmade, vintage, and craft goods, was founded in 2005?", a: "Etsy" }
          ],
          200: [
            { q: "Which E-Commerce platform, known for its blue branding and popular across the Philippines and Southeast Asia, was originally founded by Rocket Internet in 2012?", a: "Lazada" },
            { q: "Which Chinese E-Commerce company, launched in 2022 and known for ultra-low prices, rapidly expanded across global markets?", a: "Temu" },
            { q: "Which Japanese E-Commerce and internet company, founded in 1997, operates one of Japan's largest online shopping malls?", a: "Rakuten" }
          ],
          300: [
            { q: "Which Chinese E-Commerce company, founded by Jack Ma in 1999, operates platforms like Taobao and AliExpress?", a: "Alibaba" },
            { q: "Which Indian E-Commerce company, founded in 2007 and acquired by Walmart in 2018, is one of India's largest online marketplaces?", a: "Flipkart" },
            { q: "Which South Korean E-Commerce company, listed on the NYSE in 2021, is one of South Korea's largest online retail and delivery platforms?", a: "Coupang" }
          ],
          400: [
            { q: "Which online marketplace, founded in 1995, was one of the first major platforms to popularize consumer-to-consumer online auctions?", a: "eBay" },
            { q: "Which fast-fashion E-Commerce company, founded in China in 2008, became known for ultra-cheap trendy clothing and heavy social media marketing?", a: "Shein" },
            { q: "Which Dutch E-Commerce company is one of Europe's largest online marketplaces, particularly dominant in the Benelux region?", a: "Bol.com" }
          ],
          500: [
            { q: "Which Canadian company provides the software platform that lets businesses set up their own independent online stores, powering brands like Gymshark and Allbirds?", a: "Shopify" },
            { q: "Which Japanese technology conglomerate, founded by Masayoshi Son, has made major investments in E-Commerce and tech companies worldwide through its Vision Fund?", a: "SoftBank" },
            { q: "Which German E-Commerce company, spun off from Rocket Internet in 2008, is one of Europe's leading online fashion platforms?", a: "Zalando" }
          ]
        }
      },
      {
        name: "Online Business",
        questions: {
          100: [
            { q: "What term describes a business that operates entirely online without any physical retail store?", a: "An online store (online-only business)" },
            { q: "What term describes the total money a business earns from sales before subtracting any expenses?", a: "Revenue" },
            { q: "What term describes a unique code assigned to each product a business sells, used to track inventory?", a: "SKU (Stock Keeping Unit)" }
          ],
          200: [
            { q: "What term describes the service that brings an online order from the seller's warehouse to the customer's doorstep?", a: "Delivery (logistics / courier service)" },
            { q: "What term describes the process of storing, packing, and shipping inventory on behalf of an online seller, often outsourced to a third party?", a: "Fulfillment (order fulfillment)" },
            { q: "What term describes the number a customer uses to monitor their package's journey from warehouse to doorstep?", a: "A tracking number" }
          ],
          300: [
            { q: "What term describes online advertising strategies, such as social media ads and influencer marketing, used to promote products and drive sales?", a: "Digital marketing" },
            { q: "What term describes paying social media personalities to promote a brand's products to their followers?", a: "Influencer marketing" },
            { q: "What term describes online advertising where a business pays a fee each time someone clicks its ad?", a: "PPC (Pay-Per-Click) advertising" }
          ],
          400: [
            { q: "What term describes a customer's overall satisfaction throughout the process of browsing, purchasing, and receiving an online order?", a: "Customer experience (CX)" },
            { q: "What term describes the total revenue a business expects to earn from a single customer over the entire span of their relationship?", a: "Customer lifetime value (CLV)" },
            { q: "What term describes the percentage of customers who stop doing business with a company over a given period?", a: "Churn rate" }
          ],
          500: [
            { q: "What business model lets entrepreneurs sell products online without holding any inventory themselves, since the supplier ships directly to the customer?", a: "Dropshipping" },
            { q: "What term describes selling generic products under a company's own brand name as if they were uniquely manufactured for it?", a: "Private labeling (white labeling)" },
            { q: "What metric measures how much a business spends on marketing to acquire a single new customer?", a: "CAC (Customer Acquisition Cost)" }
          ]
        }
      }
    ]
  },
"Studio Ghibli": {
  icon: "🌳",
  categories: [
    {
      name: "Ghibli Movies",
      questions: {
        100: [
          { q: "Which 1988 Studio Ghibli film follows two sisters, Satsuki and Mei, who befriend a magical forest spirit while their mother recovers in the hospital?", a: "My Neighbor Totoro" },
          { q: "Which Studio Ghibli film follows a ten-year-old girl named Chihiro who must work in a spirit-world bathhouse to save her parents after they are turned into pigs?", a: "Spirited Away" },
          { q: "Which Studio Ghibli film follows a young witch named Kiki who moves to a new town and starts a delivery service using her flying broomstick?", a: "Kiki's Delivery Service" }
        ],
        200: [
          { q: "Which 1997 Studio Ghibli film follows a young woman named San, raised by wolves, amid a war between forest spirits and a growing industrial settlement?", a: "Princess Mononoke" },
          { q: "Which Studio Ghibli film follows Sophie, a young hat maker cursed to live in an old woman's body, who takes refuge in a wizard's magical walking castle?", a: "Howl's Moving Castle" },
          { q: "Which Studio Ghibli film follows a goldfish princess who wants to become human after befriending a five-year-old boy named Sosuke?", a: "Ponyo" }
        ],
        300: [
          { q: "Which 1988 Studio Ghibli film, originally released as a double feature with My Neighbor Totoro, follows two siblings struggling to survive in Japan during the final months of World War II?", a: "Grave of the Fireflies" },
          { q: "Which Studio Ghibli film follows Pazu and Sheeta as they search for a legendary floating island called Laputa?", a: "Castle in the Sky" },
          { q: "Which 2013 Studio Ghibli film is a fictionalized biography of aircraft designer Jiro Horikoshi, following his career through the years leading up to World War II?", a: "The Wind Rises" }
        ],
        400: [
          { q: "Which Studio Ghibli film, the only feature directed by Yoshifumi Kondo before his early death, follows an aspiring writer named Shizuku who is inspired by a cat figurine named the Baron?", a: "Whisper of the Heart" },
          { q: "Which 2013 Studio Ghibli film, based on the ancient Japanese folktale 'The Tale of the Bamboo Cutter,' was director Isao Takahata's final film and used a distinctive hand-drawn watercolor art style?", a: "The Tale of the Princess Kaguya" },
          { q: "Which 1994 Studio Ghibli film follows a community of shapeshifting tanuki (raccoon dogs) as they use their magical transformation powers to resist suburban development?", a: "Pom Poko" }
        ],
        500: [
          { q: "Which 1993 film was Studio Ghibli's first production made for television, directed by Tomomi Mochizuki and centered on a teenage love triangle?", a: "Ocean Waves" },
          { q: "Which 2020 Studio Ghibli film, directed by Goro Miyazaki, was the studio's first feature animated entirely in 3D computer graphics?", a: "Earwig and the Witch" },
          { q: "Which 1999 Studio Ghibli film, based on Hisaichi Ishii's yonkoma comic strip 'Nono-chan,' was the studio's first film animated entirely with digital ink-and-paint, presented in a stylized comic-strip art style?", a: "My Neighbors the Yamadas" }
        ]
      }
    },
    {
      name: "Characters",
      questions: {
        100: [
          { q: "What is the name of the young witch who moves to a new seaside town to complete her year of independent training, delivering packages by broomstick?", a: "Kiki" },
          { q: "What is the name of the ten-year-old girl who must work in a spirit-world bathhouse to save her parents in Spirited Away?", a: "Chihiro Ogino" },
          { q: "What are the names of the two sisters who move to the countryside and befriend the forest spirit Totoro?", a: "Satsuki and Mei Kusakabe" }
        ],
        200: [
          { q: "What is the name of the wandering wizard whose real name is revealed to be Howl Jenkins Pendragon, who lives inside a magical walking castle?", a: "Howl" },
          { q: "What is the name of the young woman raised by wolves who fights to protect the forest from humans in Princess Mononoke?", a: "San" },
          { q: "What is the name of the young prince who is cursed with a deadly infection after killing a demon boar at the start of Princess Mononoke?", a: "Ashitaka" }
        ],
        300: [
          { q: "What are the names of the two young protagonists who search for the legendary floating island of Laputa in Castle in the Sky?", a: "Pazu and Sheeta" },
          { q: "In Porco Rosso, what is the human name of the title character, a World War I flying ace cursed to have the face of a pig?", a: "Marco Pagot" },
          { q: "What is the name of the princess and protagonist who tries to make peace between her people and a spreading toxic jungle in Nausicaä of the Valley of the Wind?", a: "Nausicaä" }
        ],
        400: [
          { q: "What is the name of the aspiring young writer in Whisper of the Heart who is inspired to write a fantasy novel after meeting an antique cat figurine?", a: "Shizuku Tsukishima" },
          { q: "What is the name of the fictionalized aircraft designer, based on a real historical figure, who is the protagonist of The Wind Rises?", a: "Jiro Horikoshi" },
          { q: "What is the surname of Sophie, the young hat maker who is transformed into an old woman by a witch's curse in Howl's Moving Castle?", a: "Hatter (Sophie Hatter)" }
        ],
        500: [
          { q: "What is the name of the tiny 'Borrower' girl, a member of the Clock family, who lives secretly beneath the floorboards in The Secret World of Arrietty?", a: "Arrietty" },
          { q: "What name does the orphanage matron give to the title character of Earwig and the Witch, replacing the nickname 'Earwig,' before she is adopted by a witch?", a: "Erica Wigg" },
          { q: "What is the name of the grieving boy who follows a talking gray heron into a mysterious tower in The Boy and the Heron?", a: "Mahito Maki" }
        ]
      }
    },
    {
      name: "Creatures",
      questions: {
        100: [
          { q: "In My Neighbor Totoro, what is the English name for the small, round, soot-covered creatures that inhabit the dusty corners of old houses?", a: "Soot sprites (Susuwatari)" },
          { q: "In My Neighbor Totoro, what is the name of the enormous, multi-eyed bus-shaped creature that transports the Totoro through the night?", a: "The Catbus" },
          { q: "In Spirited Away, what is the name of the mostly silent, masked spirit who becomes obsessed with Chihiro and grows increasingly monstrous?", a: "No-Face (Kaonashi)" }
        ],
        200: [
          { q: "In Princess Mononoke, what is the name of the giant wolf god who raised San as her own daughter?", a: "Moro" },
          { q: "In Howl's Moving Castle, what is the name of the sarcastic fire demon who powers Howl's castle in exchange for a magical contract?", a: "Calcifer" },
          { q: "In Spirited Away, Haku is revealed to be the spirit of which body of water, after it was filled in and built over?", a: "The Kohaku River" }
        ],
        300: [
          { q: "In Princess Mononoke, the Forest Spirit (Shishigami) transforms into a towering, translucent giant at night after losing its head — what is this nighttime form commonly called?", a: "The Nightwalker" },
          { q: "In Ponyo, what is the name of Ponyo's father, a former human sorcerer who now lives beneath the sea?", a: "Fujimoto" },
          { q: "In Princess Mononoke, what is the name of the ancient, blind boar god who leads his clan into a doomed final charge against the humans of Irontown?", a: "Okkoto" }
        ],
        400: [
          { q: "In Nausicaä of the Valley of the Wind, what is the name for the giant, armored insect-like creatures that inhabit the toxic Sea of Corruption?", a: "Ohmu" },
          { q: "In Spirited Away, what animal does the witch Yubaba turn Chihiro's parents into after they greedily eat food meant for spirits?", a: "Pigs" },
          { q: "What is the full name of the debonair cat gentleman who runs the Cat Bureau and assists Haru in The Cat Returns?", a: "Baron Humbert von Gikkingen" }
        ],
        500: [
          { q: "What is the name of the demon boar, formerly a peaceful forest god, that curses Prince Ashitaka's arm at the very start of Princess Mononoke?", a: "Nago" },
          { q: "The large, gruff gray cat named Muta in The Cat Returns first appeared in an earlier Ghibli film, Whisper of the Heart, under what different name?", a: "Moon" },
          { q: "In Ponyo, what is the name of the sea goddess who serves as Ponyo's mother and grants Sosuke's wish?", a: "Granmamare" }
        ]
      }
    },
    {
      name: "Locations",
      questions: {
        100: [
          { q: "In Spirited Away, Chihiro ends up working to save her parents at what kind of large communal bathing establishment for spirits?", a: "A bathhouse" },
          { q: "My Neighbor Totoro takes place in the rural countryside of which country?", a: "Japan" },
          { q: "In My Neighbor Totoro, the Kusakabe family moves to the countryside so they can be closer to Mei and Satsuki's mother, who is recovering in what type of facility?", a: "A hospital" }
        ],
        200: [
          { q: "What is the name of the seaside, European-style town where Kiki settles to complete her year of witch training?", a: "Koriko" },
          { q: "What is the name of the legendary floating island, home to an ancient lost civilization, sought after in Castle in the Sky?", a: "Laputa" },
          { q: "What is the name of the small desert kingdom ruled by Princess Nausicaä, threatened by an expanding toxic jungle?", a: "The Valley of the Wind" }
        ],
        300: [
          { q: "What is the name of the walled, industrial settlement in Princess Mononoke where Lady Eboshi's people forge iron and weapons?", a: "Irontown" },
          { q: "What is the name of the magical realm, ruled by a feline royal family, that Haru is whisked away to in The Cat Returns?", a: "The Cat Kingdom" },
          { q: "What is the name of the school clubhouse that students fight to save from demolition ahead of the 1964 Tokyo Olympics in From Up on Poppy Hill?", a: "The Latin Quarter (Quartier Latin)" }
        ],
        400: [
          { q: "What is the proper Japanese name of Yubaba's bathhouse in Spirited Away, which literally translates to 'oil house'?", a: "Aburaya" },
          { q: "What real coastal town in Hiroshima Prefecture, now nicknamed 'Ponyo Town,' inspired the setting of Ponyo after Miyazaki stayed there for two months?", a: "Tomonoura" },
          { q: "Ocean Waves is set primarily in the protagonist's hometown, a real city in Shikoku — what is this city?", a: "Kochi" }
        ],
        500: [
          { q: "Which real medieval Swedish town, on the island of Gotland, did Miyazaki visit and later use as visual inspiration for Kiki's Delivery Service's city of Koriko, alongside Stockholm?", a: "Visby" },
          { q: "According to The Art of Spirited Away, which real hot spring resort in Matsuyama was confirmed as the visual basis for Yubaba's bathhouse, the Aburaya?", a: "Dogo Onsen" },
          { q: "What is the name of the fictional kingdom, based on Diana Wynne Jones' original novel, in which Howl's Moving Castle takes place?", a: "Ingary" }
        ]
      }
    },
    {
      name: "Music and Soundtracks",
      questions: {
        100: [
          { q: "Which composer, famous for his four-decade collaboration with Hayao Miyazaki, scored the music for My Neighbor Totoro, Spirited Away, and most other Ghibli films?", a: "Joe Hisaishi" },
          { q: "What is the English title of Spirited Away's emotional ending theme song, performed by Youmi Kimura?", a: "Always With Me" },
          { q: "What is the Japanese title of Kiki's Delivery Service's upbeat opening theme song, originally performed in 1975 by singer Yumi Matsutoya (then known as Yumi Arai)?", a: "Rouge no Dengon" }
        ],
        200: [
          { q: "Which classically trained countertenor performs the haunting Japanese vocal theme song for Princess Mononoke?", a: "Yoshikazu Mera" },
          { q: "Which real-world folk song, originally written and performed by John Denver, is covered in Japanese as the recurring musical theme of Whisper of the Heart?", a: "Take Me Home, Country Roads" },
          { q: "Which Japanese singer-songwriter wrote and performed 'Spinning Globe,' the theme song for The Boy and the Heron?", a: "Kenshi Yonezu" }
        ],
        300: [
          { q: "What is the title of Howl's Moving Castle's famous waltz-time instrumental theme, one of Joe Hisaishi's best-known compositions?", a: "Merry-Go-Round of Life" },
          { q: "What is the title of Castle in the Sky's soaring theme song, whose title translates to 'Carrying You'?", a: "Kimi wo Nosete" },
          { q: "What is the title of Ponyo's bouncy Japanese theme song, performed by young singer Nozomi Ohashi alongside Fujioka Fujimaki?", a: "Gake no Ue no Ponyo (On the Cliff by the Sea)" }
        ],
        400: [
          { q: "Which composer, not Joe Hisaishi, wrote the scores for both Whisper of the Heart and its spin-off The Cat Returns?", a: "Yuji Nomi" },
          { q: "Which composer, a frequent collaborator of director Isao Takahata, wrote the haunting score for Grave of the Fireflies?", a: "Michio Mamiya" },
          { q: "Which Okinawan-influenced band composed and performed the folk-inflected score for Pom Poko, blending traditional Japanese instruments with rock?", a: "Shang Shang Typhoon" }
        ],
        500: [
          { q: "Before becoming Hayao Miyazaki's primary composer starting with Nausicaä of the Valley of the Wind in 1984, Joe Hisaishi was known for composing music in which experimental genre, influenced by Steve Reich and Philip Glass?", a: "Minimalism (minimalist music)" },
          { q: "Youmi Kimura's song 'Always With Me' was originally written for a different, ultimately shelved Ghibli project — what was that project called?", a: "Rin the Chimney Painter" },
          { q: "What is the title of Joe Hisaishi's 1981 debut album, recorded with his experimental percussion-and-synthesizer ensemble years before he began scoring Studio Ghibli films?", a: "MKWAJU" }
        ]
      }
    }
  ]
},
"Harry Potter": {
  icon: "⚡",
  categories: [
    {
      name: "Characters",
      questions: {
        100: [
          { q: "What are the first and last names of Harry Potter's two closest friends throughout his years at Hogwarts?", a: "Ron Weasley and Hermione Granger" },
          { q: "What is the name of the half-giant gamekeeper who first tells eleven-year-old Harry that he is a wizard?", a: "Rubeus Hagrid" },
          { q: "What is the name of the Dark wizard who killed Harry's parents and is the central villain of the series?", a: "Lord Voldemort" }
        ],
        200: [
          { q: "What is the name of the Potions Master, later Headmaster, famously played by Alan Rickman in the films?", a: "Severus Snape" },
          { q: "What is the name of Harry's godfather, an escaped convict from Azkaban who can transform into a large black dog?", a: "Sirius Black" },
          { q: "What is the name of the strict Transfiguration professor and Head of Gryffindor House who can transform into a tabby cat?", a: "Minerva McGonagall" }
        ],
        300: [
          { q: "What are the surnames of Draco Malfoy's two large, dim-witted bodyguards at Hogwarts?", a: "Crabbe and Goyle" },
          { q: "What is Lord Voldemort's real full birth name, which forms the anagram 'I am Lord Voldemort'?", a: "Tom Marvolo Riddle" },
          { q: "What is the name of the dreamy, eccentric Ravenclaw student known for her unusual beliefs and her father's magazine, The Quibbler?", a: "Luna Lovegood" }
        ],
        400: [
          { q: "What is the name of Neville Longbottom's pet toad, which he is constantly losing throughout the early books?", a: "Trevor" },
          { q: "What is the name of the Divination professor who delivers the real prophecy about Harry and Voldemort, despite usually giving false predictions?", a: "Sybill Trelawney" },
          { q: "What is the name of the house-elf enslaved by the Malfoy family, whom Harry eventually frees using a sock?", a: "Dobby" }
        ],
        500: [
          { q: "What is the name of Sirius Black's younger brother, a former Death Eater who secretly betrayed Voldemort by trying to destroy one of his Horcruxes?", a: "Regulus Black (Regulus Arcturus Black)" },
          { q: "What is the name of Albus Dumbledore's estranged younger brother, who runs the Hog's Head Inn in Hogsmeade?", a: "Aberforth Dumbledore" },
          { q: "What is the name of the eccentric knight in a Hogwarts portrait who becomes the new guardian of Gryffindor Tower after the Fat Lady is attacked?", a: "Sir Cadogan" }
        ]
      }
    },
    {
      name: "Hogwarts",
      questions: {
        100: [
          { q: "What are the four houses that students are sorted into at Hogwarts School of Witchcraft and Wizardry?", a: "Gryffindor, Hufflepuff, Ravenclaw, and Slytherin" },
          { q: "What magical object is placed on a new student's head each year to sort them into their house?", a: "The Sorting Hat" },
          { q: "What is the name of the broomstick sport played at Hogwarts, in which players try to catch a small flying golden ball?", a: "Quidditch" }
        ],
        200: [
          { q: "Who is the headmaster of Hogwarts for most of the series, played in the films first by Richard Harris and later by Michael Gambon?", a: "Albus Dumbledore" },
          { q: "Which Hogwarts house, known for valuing courage and daring, is Harry Potter sorted into?", a: "Gryffindor" },
          { q: "What is the name of the scarlet steam train that carries students from London's Platform Nine and Three-Quarters to Hogwarts each year?", a: "The Hogwarts Express" }
        ],
        300: [
          { q: "What are the names of the four founders of Hogwarts, after whom each house is named?", a: "Godric Gryffindor, Helga Hufflepuff, Rowena Ravenclaw, and Salazar Slytherin" },
          { q: "What is the name of the hidden room at Hogwarts that only appears when someone truly needs it, famously used by Dumbledore's Army?", a: "The Room of Requirement" },
          { q: "What is the name of the caretaker of Hogwarts, whose beloved cat is named Mrs. Norris?", a: "Argus Filch" }
        ],
        400: [
          { q: "What is the name of the secret chamber built by Salazar Slytherin, said to house a monster that only his true heir can control?", a: "The Chamber of Secrets" },
          { q: "What Latin phrase, meaning 'never tickle a sleeping dragon,' appears on the Hogwarts coat of arms as its official motto?", a: "Draco dormiens nunquam titillandus" },
          { q: "What is the name of the ghost who haunts a second-floor girls' bathroom and is later revealed to be connected to the Chamber of Secrets?", a: "Moaning Myrtle" }
        ],
        500: [
          { q: "What is the name of the Ravenclaw house ghost, later revealed to be Rowena Ravenclaw's own daughter?", a: "The Grey Lady (Helena Ravenclaw)" },
          { q: "What is the name of the Hufflepuff house ghost, a jolly spirit in monk's robes?", a: "The Fat Friar" },
          { q: "What is the full name of the Gryffindor house ghost commonly known as Nearly Headless Nick?", a: "Sir Nicholas de Mimsy-Porpington" }
        ]
      }
    },
    {
      name: "Spells",
      questions: {
        100: [
          { q: "What spell disarms an opponent, causing their wand to fly out of their hand?", a: "Expelliarmus" },
          { q: "What spell conjures a magical guardian to fend off Dementors?", a: "Expecto Patronum" },
          { q: "What levitation spell does Hermione famously correct Ron's pronunciation of during their first Charms class?", a: "Wingardium Leviosa" }
        ],
        200: [
          { q: "What spell is commonly used to unlock doors?", a: "Alohomora" },
          { q: "What spell produces a small light from the tip of a wand?", a: "Lumos" },
          { q: "What spell summons an object toward the caster from a distance?", a: "Accio" }
        ],
        300: [
          { q: "What is the incantation for the curse that instantly kills its target, one of the three Unforgivable Curses?", a: "Avada Kedavra" },
          { q: "What spell fully immobilizes a target's body, often called the 'full body-bind curse'?", a: "Petrificus Totalus" },
          { q: "What charm is used to erase or alter a person's memories?", a: "Obliviate" }
        ],
        400: [
          { q: "What is the name of the dark curse invented by Severus Snape as a student, which causes deep slashing wounds and is found scrawled in his old Potions textbook?", a: "Sectumsempra" },
          { q: "What is the name of the Unforgivable Curse that gives the caster total control over another person's actions?", a: "The Imperius Curse" },
          { q: "What incantation conjures the skull-and-serpent Dark Mark into the sky above a scene the Death Eaters wish to mark?", a: "Morsmordre" }
        ],
        500: [
          { q: "What is the name of the complex charm that hides a secret, such as a location or a person's existence, entrusting it entirely to a single Secret-Keeper?", a: "The Fidelius Charm" },
          { q: "What is the name of the rare magical phenomenon that causes the losing wand in a duel between 'brother wands' to eject echoes of its own past spells in reverse order?", a: "Priori Incantatem" },
          { q: "What spell allows a witch or wizard to enter and read another person's mind or memories?", a: "Legilimens" }
        ]
      }
    },
    {
      name: "Magical Creatures",
      questions: {
        100: [
          { q: "What magical creature, part horse and part eagle, must be approached with a respectful bow before it can be safely ridden?", a: "A Hippogriff" },
          { q: "What loyal magical bird belonging to Dumbledore can carry heavy loads, heal with its tears, and is reborn from its own ashes?", a: "A Phoenix (Fawkes)" },
          { q: "What type of magical creature does Hagrid illegally hatch and briefly raise from an egg, naming it Norbert?", a: "A dragon (Norwegian Ridgeback)" }
        ],
        200: [
          { q: "What is the name of the enormous, ancient spider that Hagrid raised as a pet, later the leader of a colony of Acromantula in the Forbidden Forest?", a: "Aragog" },
          { q: "What ghostly, skeletal, horse-like creatures pull the Hogwarts carriages and are visible only to those who have witnessed death?", a: "Thestrals" },
          { q: "What small, mischievous blue creatures does Professor Lockhart disastrously release into his classroom in Chamber of Secrets?", a: "Cornish Pixies" }
        ],
        300: [
          { q: "What is the name of Hagrid's enormous half-brother, a giant sought out by Hagrid and Madame Maxime in Order of the Phoenix?", a: "Grawp" },
          { q: "What is the name of the large, black, dog-shaped omen of death from wizarding folklore, which Sirius Black's Animagus form is often mistaken for?", a: "The Grim" },
          { q: "What is the name of the house-elf who once served the Crouch family and later works in the Hogwarts kitchens?", a: "Winky" }
        ],
        400: [
          { q: "What is the name for the intelligent, half-human, half-horse beings who dwell in the Forbidden Forest, one of whom, Firenze, later teaches at Hogwarts?", a: "Centaurs" },
          { q: "What is the name of Lord Voldemort's giant venomous snake, later revealed to be one of his Horcruxes?", a: "Nagini" },
          { q: "What is the name of the enormous three-headed dog that Hagrid keeps to guard the trapdoor hiding the Philosopher's Stone?", a: "Fluffy" }
        ],
        500: [
          { q: "What are the small, humanoid water demons that Harry must fight off during the Second Task of the Triwizard Tournament?", a: "Grindylows" },
          { q: "What is the name for the dangerous, unpredictable magical creatures that Hagrid breeds by crossing several species together in Goblet of Fire?", a: "Blast-Ended Skrewts" },
          { q: "What magical breed of cat is Hermione's pet Crookshanks partly descended from, giving him unusual intelligence?", a: "A Kneazle" }
        ]
      }
    },
    {
      name: "Movies and Books",
      questions: {
        100: [
          { q: "Who is the British author who wrote the original Harry Potter novel series?", a: "J.K. Rowling" },
          { q: "How many main novels make up the core Harry Potter book series?", a: "Seven" },
          { q: "What is the UK title of the first Harry Potter book and film, in which Harry learns he is a wizard?", a: "Harry Potter and the Philosopher's Stone" }
        ],
        200: [
          { q: "Which actor plays Harry Potter in all eight films?", a: "Daniel Radcliffe" },
          { q: "What is the title of the seventh and final Harry Potter book, which was split into two films?", a: "Harry Potter and the Deathly Hallows" },
          { q: "Which actress plays Hermione Granger throughout the entire film series?", a: "Emma Watson" }
        ],
        300: [
          { q: "Which actor played Severus Snape in every Harry Potter film until his character's death in Deathly Hallows?", a: "Alan Rickman" },
          { q: "Which director helmed the first two Harry Potter films, Philosopher's Stone and Chamber of Secrets?", a: "Chris Columbus" },
          { q: "Which two actors played Albus Dumbledore across the film series, with the role recast after the first actor's death?", a: "Richard Harris and Michael Gambon" }
        ],
        400: [
          { q: "Which acclaimed director, known for dark and atmospheric filmmaking, directed Harry Potter and the Prisoner of Azkaban, the series' third film?", a: "Alfonso Cuarón" },
          { q: "Which Harry Potter book is the longest in the series by word count?", a: "Harry Potter and the Order of the Phoenix" },
          { q: "Which director helmed every Harry Potter film from Order of the Phoenix through both parts of Deathly Hallows?", a: "David Yates" }
        ],
        500: [
          { q: "In what year was the first Harry Potter book originally published in the United Kingdom?", a: "1997" },
          { q: "Which director, who worked on no other film in the franchise, directed Harry Potter and the Goblet of Fire, the fourth film?", a: "Mike Newell" },
          { q: "Which Harry Potter book is the shortest in the series by word count?", a: "Harry Potter and the Philosopher's Stone" }
        ]
      }
    }
  ]
},
"Sitcoms": {
  icon: "🛋️",
  categories: [
    {
      name: "Friends",
      questions: {
        100: [
          { q: "What is the name of the coffee shop where the six friends regularly hang out?", a: "Central Perk" },
          { q: "Which two Friends characters got married in Las Vegas after a drunken night out, then quickly got the marriage annulled?", a: "Ross and Rachel" },
          { q: "What is the name of Ross's pet monkey during the show's early seasons?", a: "Marcel" }
        ],
        200: [
          { q: "What is Ross Geller's profession?", a: "Paleontologist" },
          { q: "What is the nonsense job title the friends jokingly guess for Chandler when none of them can remember what he actually does for a living?", a: "Transponster" },
          { q: "What is the name of Phoebe Buffay's twin sister, also played by Lisa Kudrow?", a: "Ursula" }
        ],
        300: [
          { q: "What is the title of Joey's most famous acting role, a character on a soap opera?", a: "Dr. Drake Ramoray" },
          { q: "What is the name of Ross's second wife, whom he marries in London after saying the wrong name at the altar?", a: "Emily" },
          { q: "Whose rent-controlled apartment did Monica originally live in and illegally sublet, before eventually inheriting the lease?", a: "Her grandmother's (Nana's)" }
        ],
        400: [
          { q: "Chandler's estranged father performs as a drag queen in Las Vegas under what stage name?", a: "Helena Handbasket" },
          { q: "Who officiates Carol and Susan's wedding, a real-life activist and sister of a conservative U.S. congressman?", a: "Candace Gingrich" },
          { q: "What are the names of the triplets Phoebe gives birth to as a surrogate for her brother Frank Jr. and his wife Alice?", a: "Frank Jr. Jr., Leslie, and Chandler" }
        ],
        500: [
          { q: "What is the full name of Ross's first wife, who leaves him for a woman named Susan?", a: "Carol Willick" },
          { q: "What is the name of the upscale Manhattan restaurant where Monica becomes head chef during the show's final two seasons?", a: "Javu" },
          { q: "In later seasons, what are the apartment numbers of Monica and Rachel's apartment and Joey and Chandler's apartment across the hall?", a: "20 and 19" }
        ]
      }
    },
    {
      name: "The Office",
      questions: {
        100: [
          { q: "What paper company do the employees of the show work for?", a: "Dunder Mifflin" },
          { q: "Who is the bumbling regional manager of the Scranton branch for most of the series?", a: "Michael Scott" },
          { q: "What is the name of Jim Halpert's coworker, and eventual wife, who works as the office receptionist?", a: "Pam Beesly" }
        ],
        200: [
          { q: "What is the name of Dwight Schrute's family farm and bed-and-breakfast, where he raises beets?", a: "Schrute Farms" },
          { q: "What dessert does Jim frequently trap Dwight's stapler inside of, as a running prank?", a: "Jell-O (gelatin)" },
          { q: "What title does Dwight insist on being called, correcting anyone who shortens it to 'Assistant Regional Manager'?", a: "Assistant TO the Regional Manager" }
        ],
        300: [
          { q: "What is the name of the company Dunder Mifflin merges with partway through the series, becoming 'Dunder Mifflin Sabre'?", a: "Sabre" },
          { q: "After quitting Dunder Mifflin, what is the name of the rival paper company Michael starts with Pam and Ryan?", a: "Michael Scott Paper Company" },
          { q: "What is the name of Andy Bernard's college a cappella group, which he frequently brings up?", a: "Here Comes Treble" }
        ],
        400: [
          { q: "Which character, played by James Spader, is hired to interview for branch manager but instead becomes CEO of the parent company?", a: "Robert California" },
          { q: "Who briefly serves as regional manager immediately after Michael Scott leaves, before a basketball injury takes him out of the role?", a: "Deangelo Vickers" },
          { q: "After business school, what corporate title is Ryan Howard promoted to, taking over Jan Levinson's old position?", a: "Vice President of Northeast Sales" }
        ],
        500: [
          { q: "What is the name of the Pennsylvania Dutch folklore figure Dwight dresses up as every Christmas?", a: "Belsnickel" },
          { q: "What is the name of Dwight's cousin, who lives and works with him at the beet farm?", a: "Mose Schrute" },
          { q: "What is the name of the failed company website Ryan launches as VP, which later becomes central to the fraud that gets him fired?", a: "Dunder Mifflin Infinity" }
        ]
      }
    },
    {
      name: "How I Met Your Mother",
      questions: {
        100: [
          { q: "What is the name of the bar where the gang regularly hangs out?", a: "MacLaren's Pub" },
          { q: "What profession does Ted Mosby practice throughout the show, eventually becoming a professor of?", a: "Architect" },
          { q: "What color is the umbrella that becomes a recurring symbol tied to Ted meeting the Mother?", a: "Yellow" }
        ],
        200: [
          { q: "What is the name of Barney Stinson's book cataloging his many scams for picking up women?", a: "The Playbook" },
          { q: "What country is Robin Scherbatsky originally from, before moving to New York?", a: "Canada" },
          { q: "What is the full name of the Mother, eventually revealed on the show?", a: "Tracy McConnell" }
        ],
        300: [
          { q: "What catchphrase does Barney shout whenever something amazing or unexpected happens?", a: "'Legen— wait for it —dary!' (Legendary)" },
          { q: "What university did Ted, Marshall, and Lily all attend together?", a: "Wesleyan University" },
          { q: "What is the stage name of Robin's secret past as a 1990s Canadian teen pop star, revealed via a 'slap bet'?", a: "Robin Sparkles" }
        ],
        400: [
          { q: "What is the unusual official middle name Marshall and Lily give their son, at Barney's insistence?", a: "Waitforit (Marvin Waitforit Eriksen)" },
          { q: "What company does Barney work for throughout most of the series, whose actual business remains a running mystery?", a: "Goliath National Bank (GNB)" },
          { q: "The show's entire final season unfolds in real time around what single event?", a: "Barney and Robin's wedding weekend" }
        ],
        500: [
          { q: "How long does Barney and Robin's marriage ultimately last, as revealed in the series finale?", a: "Three years" },
          { q: "What happens to Tracy, the Mother, that explains why Ted is telling this whole story to his kids in the show's 'future' framing device?", a: "She dies, of an unspecified illness, years before the story is told" },
          { q: "What is Barney Stinson's full, formal first name, for which 'Barney' is a nickname?", a: "Barnabus" }
        ]
      }
    },
    {
      name: "Modern Family",
      questions: {
        100: [
          { q: "What is the name of the family patriarch, married to a much younger Colombian woman named Gloria?", a: "Jay Pritchett" },
          { q: "What is the name of Mitchell and Cameron's adopted daughter from Vietnam?", a: "Lily" },
          { q: "What is Phil Dunphy's profession?", a: "Real estate agent" }
        ],
        200: [
          { q: "What is the name of Gloria's son from her first marriage, whom Jay helps raise?", a: "Manny Delgado" },
          { q: "What are the names of Claire and Phil Dunphy's three children?", a: "Haley, Alex, and Luke" },
          { q: "What does Phil call his personal life philosophy and rulebook for being a cool, modern dad?", a: "Phil's-osophy" }
        ],
        300: [
          { q: "What is the name of Jay and Gloria's son, born partway through the series?", a: "Joe" },
          { q: "What is Mitchell Pritchett's profession?", a: "Lawyer" },
          { q: "What is the name of Mitchell and Cameron's second child, adopted near the end of the series?", a: "Rexford 'Rex' Jason Tucker-Pritchett" }
        ],
        400: [
          { q: "What is the name of the closet and home-organization business Jay Pritchett built from the ground up?", a: "Pritchett's Closets and Blinds" },
          { q: "What is the full given name of Jay and Gloria's son, Joe?", a: "Fulgencio Joseph Pritchett" },
          { q: "Which of Jay's children eventually takes over as head of his closet company?", a: "Claire" }
        ],
        500: [
          { q: "What Colombian city does Gloria repeatedly say she is from?", a: "Barranquilla" },
          { q: "What breed of dog is Stella, Jay and Gloria's beloved family pet?", a: "French Bulldog" },
          { q: "What fictional Missouri town does Cameron Tucker say he grew up in, on a farm?", a: "Grasshopper, Missouri" }
        ]
      }
    },
    {
      name: "Brooklyn Nine-Nine",
      questions: {
        100: [
          { q: "What is the name of Jake Peralta's stern, deadpan police captain?", a: "Raymond Holt (Captain Holt)" },
          { q: "What 1988 action movie is Jake Peralta endlessly obsessed with?", a: "Die Hard" },
          { q: "What is the number of the fictional NYPD precinct the show is named after and set in?", a: "The 99th Precinct" }
        ],
        200: [
          { q: "What rank does Terry Jeffords hold at the Nine-Nine?", a: "Sergeant" },
          { q: "What is the name of the dance troupe Gina Linetti is part of, which later kicks her out for missing rehearsals?", a: "Floorgasm" },
          { q: "What vehicle does Rosa Diaz famously ride to work?", a: "A motorcycle" }
        ],
        300: [
          { q: "What nickname do Jake and Amy give their son, referencing Jake's favorite movie hero, John McClane?", a: "Mac" },
          { q: "Which recurring character, an old friend of Jake's from the police academy, spent 12 years undercover infiltrating the mob and becomes seriously unhinged?", a: "Adrian Pimento" },
          { q: "What nickname does the squad give the obnoxious rival detective Keith Pembroke, who steals credit for their cases?", a: "The Vulture" }
        ],
        400: [
          { q: "What is the name of Captain Holt's husband, a professor and head of the Classics Department at Columbia University?", a: "Kevin Cozner" },
          { q: "What is the name of Charles Boyle's son, whom he and his wife Genevieve adopt from Latvia?", a: "Nikolaj" },
          { q: "What historic distinction did Raymond Holt hold within the NYPD before commanding the Nine-Nine?", a: "He was the NYPD's first openly gay Black police captain" }
        ],
        500: [
          { q: "In the series finale, what rank does Amy Santiago ultimately rise to, the highest position for a uniformed NYPD officer?", a: "Chief (of Department)" },
          { q: "What role is Captain Holt promoted to at the same time as Amy, overseeing a citywide police reform program?", a: "Deputy Commissioner of Police Reform" },
          { q: "What is the name of Charles Boyle's food-writer fiancée, whose engagement to him ends when he won't move to Canada with her?", a: "Vivian Ludley" }
        ]
      }
    }
  ]
},
"It's Always Sunny in Philadelphia": {
  icon: "🌞",
  categories: [
    {
      name: "Characters",
      questions: {
        100: [
          { q: "What is the name of the run-down bar in Philadelphia owned and operated by the show's five main characters?", a: "Paddy's Pub" },
          { q: "What are the first names of the image-obsessed twin siblings in 'the Gang,' played by Glenn Howerton and Kaitlin Olson?", a: "Dennis and Dee (Reynolds)" },
          { q: "Which member of the Gang is not very bright, easily manipulated, and revealed over the series to be functionally illiterate?", a: "Charlie (Kelly)" }
        ],
        200: [
          { q: "What nickname is commonly used for Deandra Reynolds, Dennis's twin sister?", a: "Sweet Dee" },
          { q: "What is the name of Dennis and Dee's boisterous, degenerate father, played by Danny DeVito?", a: "Frank Reynolds" },
          { q: "Which member of the Gang insists he's a master of martial arts and bodybuilding, despite little evidence of either?", a: "Mac" }
        ],
        300: [
          { q: "What is the name of Mac's father, a convicted criminal whose release from prison sets off major plot events across the series?", a: "Luther (McDonald)" },
          { q: "What nickname is given to Matthew Mara, a former high school classmate of the Gang who becomes a struggling street priest over the course of the show?", a: "Rickety Cricket" },
          { q: "Who is revealed to be Dennis and Dee's biological father, a man their mother Barbara had an affair with, rather than Frank?", a: "Bruce Mathis" }
        ],
        400: [
          { q: "What is the real name of the character known throughout the entire series only as 'the Waitress'?", a: "It's never revealed" },
          { q: "Which real-life spouse of a main cast member plays 'the Waitress'?", a: "Mary Elizabeth Ellis (Charlie Day's wife)" },
          { q: "What is Mac's full first name, for which 'Mac' is a nickname?", a: "Ronald (McDonald)" }
        ],
        500: [
          { q: "What is the name of Dennis and Dee's mother, whose decades-old affair is revealed to have produced the twins?", a: "Barbara (Reynolds)" },
          { q: "Dennis and Dee's biological father, Bruce Mathis, is ironically revealed to be what, despite their mother leaving him because she thought Frank was wealthier?", a: "A wealthy philanthropist" },
          { q: "In a later-season episode set partly in Ireland, who is revealed to be Charlie's actual biological father?", a: "Shelley Kelly" }
        ]
      }
    },
    {
      name: "Episodes",
      questions: {
        100: [
          { q: "What is the title of the fan-favorite episode centered on the elaborate musical Charlie writes and performs to propose to the Waitress?", a: "The Nightman Cometh" },
          { q: "What is the title of the two-part Season 4 episode in which Mac and Charlie fake their own deaths to escape Mac's dangerous father?", a: "Mac and Charlie Die" },
          { q: "What is the title of the episode in which the Gang plays their own brutal, homemade drinking game against each other?", a: "Chardee MacDennis: The Game of Games" }
        ],
        200: [
          { q: "What is the title of the episode in which Frank introduces 'Rum Ham' while the Gang vacations at the shore?", a: "The Gang Goes to the Jersey Shore" },
          { q: "What is the title of the episode in which Dee discovers a man online claiming to be her and Dennis's real father?", a: "Dennis and Dee Get a New Dad" },
          { q: "What is the title of the episode centered on Dennis's step-by-step method for manipulating women into relationships?", a: "The D.E.N.N.I.S. System" }
        ],
        300: [
          { q: "What is the title of the episode in which the Gang's lawyer reveals a novelty cat product being sold out of the bar?", a: "Paddy's Pub: Home of the Original Kitten Mittens" },
          { q: "What is the title of the episode in which Charlie finally meets his real biological father?", a: "The Gang's Still in Ireland" },
          { q: "What is the title of the emotional Season 13 finale in which Mac comes out to his father through an elaborate interpretive dance?", a: "Mac Finds His Pride" }
        ],
        400: [
          { q: "What is the title of the low-budget original pilot — later folded into a Season 1 episode of the same name — that got the show picked up by FX?", a: "Charlie Has Cancer" },
          { q: "What is the title of the episode in which the Gang tries to take credit for reversing climate change?", a: "The Gang Solves Global Warming" },
          { q: "What is the title of the episode in which the Gang checks into a literal suite numbered 'H666'?", a: "The Gang Goes to Hell" }
        ],
        500: [
          { q: "What is the title of the episode that permanently changed the show's title-card format so the episode title appears before the show's own title?", a: "The Gang Goes Jihad" },
          { q: "What is the title of the early episode explaining how Frank accidentally hurts someone while planning a news segment?", a: "Frank Sets Sweet Dee on Fire" },
          { q: "What is the title of the Season 11 premiere that serves as a sequel to the Gang's homemade drinking game episode?", a: "Chardee MacDennis 2: Electric Boogaloo" }
        ]
      }
    },
    {
      name: "Quotes",
      questions: {
        100: [
          { q: "Which member of the Gang delivers this boast about his own future greatness: 'I haven't even begun to peak. And when I do peak, you'll know. Because I'm gonna peak so hard that everybody in Philadelphia's gonna feel it'?", a: "Dennis" },
          { q: "Which character angrily responds to being told to get a job with: 'Why don't I strap on my job helmet and squeeze down into a job cannon and fire off into job land, where jobs grow on jobbies?!'?", a: "Charlie" },
          { q: "Which character introduces his wrestling persona with the line: 'I'm the Trash Man! I come out, I throw garbage all over the ring, and then I start eating garbage!'?", a: "Frank" }
        ],
        200: [
          { q: "Which character proudly announces a boozy new beach snack with the line, 'This is ham, soaked in rum. It's loaded with booze'?", a: "Frank" },
          { q: "Which character opens a passionate rant with, 'Well, first of all, through God, all things are possible, so jot that down'?", a: "Mac" },
          { q: "Which character finally snaps at the Gang's years of teasing with the line, 'I KNOW, A BIRD, I GET IT, I LOOK LIKE A BIRD!!'?", a: "Dee" }
        ],
        300: [
          { q: "Which character insists during an argument about his physique, 'I work out my core... I can do way more push-ups than you and that's like 16 different muscle groups'?", a: "Mac" },
          { q: "Which character declares his car 'a transporter of gods' before shouting 'THE GOLDEN GOD!!'?", a: "Dennis" },
          { q: "In describing the Gang's dynamic as 'looks, brains, and wild card,' which member does Mac name as the wild card?", a: "Charlie" }
        ],
        400: [
          { q: "Which character screams, 'I am untethered, and my rage knows no bounds!' during an unhinged meltdown over his car?", a: "Dennis" },
          { q: "In a bit about tax fraud, Dee insists she isn't scamming the government — only for what detail, printed right on her car, to undercut her?", a: "Her license plate, which reads 'SCAMMIN''" },
          { q: "During 'The Nightman Cometh' rehearsals, Frank keeps singing a lyric about paying a toll that sounds inappropriate, insisting to Charlie he's actually singing what word?", a: "Soul" }
        ],
        500: [
          { q: "Which character delivers this ad pitch: 'Hello, Charlie Kelly here, local business owner and cat enthusiast... Finally, there is an elegant, comfortable mitten for cats'?", a: "Charlie" },
          { q: "In 'The Gang Gets Extreme,' Dennis objects to the Gang's new anthem, insisting they aren't singing about being ordinary birds but rather about being what 'infinitely cooler' concept?", a: "Bird-men" },
          { q: "What is the title of the song Charlie sings while descending from the ceiling on a giant sun prop to propose to the Waitress in 'The Nightman Cometh'?", a: "Charlie's Ballad (also known as 'Marry Me')" }
        ]
      }
    },
    {
      name: "Running Gags",
      questions: {
        100: [
          { q: "What fictional soda brand appears repeatedly throughout the series, often as a background prop?", a: "Wolf Cola" },
          { q: "What disgusting-sounding meal does Charlie repeatedly claim to order at restaurants, consisting of milk-soaked steak and jelly beans?", a: "Milk steak" },
          { q: "What full-body costume does Mac wear as a self-appointed, unlicensed neighborhood superhero?", a: "The Green Man" }
        ],
        200: [
          { q: "What family repeatedly returns throughout the series as the Gang's odd, milk-obsessed rivals?", a: "The McPoyle family" },
          { q: "What is the origin of Cricket's 'Rickety' nickname, first earned back in high school before he ever became a priest?", a: "He wore leg braces" },
          { q: "What is the name of the viral scene in which Charlie, working a mailroom job, becomes frantically convinced a mysterious coworker is being ignored by the company?", a: "The 'Pepe Silvia' scene" }
        ],
        300: [
          { q: "What are the three rounds, or 'categories,' that make up the Gang's drinking game Chardee MacDennis?", a: "Mind, Body, and Spirit" },
          { q: "What single piece of furniture do Frank and Charlie share as their bed every night, despite Frank's actual wealth?", a: "A pull-out couch" },
          { q: "What entertainment career does Dee repeatedly and unsuccessfully pursue, despite crippling stage fright that makes her dry-heave on stage?", a: "Stand-up comedy" }
        ],
        400: [
          { q: "Wolf Cola begins the series as what kind of scheme for Frank, before growing into a full beverage empire?", a: "A fraudulent shell company / tax scam" },
          { q: "What does Frank frequently fake in order to win sympathy or a lawsuit payout?", a: "An injury or illness" },
          { q: "What term does the Gang use for any disgusting, demeaning chore around the bar — extermination, cleaning, hauling trash — that inevitably falls to one particular member?", a: "'Charlie work'" }
        ],
        500: [
          { q: "What comedic device does the show frequently use, in which a character narrates a flashback that visibly contradicts what viewers already know actually happened?", a: "An unreliable narrator flashback" },
          { q: "What alter ego does Frank adopt — a black turtleneck, a white wig, and a parody of Andy Warhol — to hype up Charlie's paintings to a buyer?", a: "Ongo Gablogian" },
          { q: "What business do the McPoyle brothers run later in the series, after selling their video rental store?", a: "A bowling alley" }
        ]
      }
    },
    {
      name: "Trivia",
      questions: {
        100: [
          { q: "What real-life city is the show set in and named after?", a: "Philadelphia" },
          { q: "What television network has aired the show for its entire run, later joined by its sister channel?", a: "FX (and FXX)" },
          { q: "Which three actors created the show and also write for it, starring as Dennis, Charlie, and Mac?", a: "Rob McElhenney, Glenn Howerton, and Charlie Day" }
        ],
        200: [
          { q: "Which legendary actor joined the cast as Frank Reynolds starting in Season 2, credited with helping save the show from cancellation?", a: "Danny DeVito" },
          { q: "What real-life relationship exists between Charlie Day and Mary Elizabeth Ellis, the actress who plays the Waitress?", a: "They are married" },
          { q: "In what year did It's Always Sunny in Philadelphia first premiere?", a: "2005" }
        ],
        300: [
          { q: "About how much did the original, unaired pilot cost to produce, shot on a camcorder with the creators' friends?", a: "About $200" },
          { q: "What was the show's original working title, before its concept shifted from Los Angeles actors to a Philadelphia bar?", a: "It's Always Sunny on TV" },
          { q: "What 1985 pop song by a-ha inspired that original working title?", a: "'The Sun Always Shines on T.V.'" }
        ],
        400: [
          { q: "What is the title of the show's instantly recognizable jazzy theme song?", a: "'Temptation Sensation'" },
          { q: "Who composed the show's theme song, 'Temptation Sensation'?", a: "Heinz Kiessling" },
          { q: "According to the creators, what blunt one-word title was also under consideration before settling on 'It's Always Sunny in Philadelphia'?", a: "'Jerks'" }
        ],
        500: [
          { q: "What is the official title of the show's very first broadcast episode, in which Charlie tries to prove to the Waitress that he isn't prejudiced?", a: "The Gang Gets Racist" },
          { q: "Which FX executive insisted the creators use 'Temptation Sensation' over their own preferred theme song choice?", a: "John Landgraf" },
          { q: "In the original, unaired pilot, what were the three lead characters' jobs, before the show's concept shifted to owning a bar?", a: "Aspiring actors living in Los Angeles" }
        ]
      }
    }
  ]
},
"Marvel Cinematic Universe": {
  icon: "🌀",
  categories: [
    {
      name: "MCU Movies",
      questions: {
        100: [
          { q: "Which 2008 film starring Robert Downey Jr. as Tony Stark launched the Marvel Cinematic Universe?", a: "Iron Man" },
          { q: "Which 2018 film ended with the villain Thanos snapping his fingers to erase half of all life in the universe?", a: "Avengers: Infinity War" },
          { q: "Which 2024 film paired Ryan Reynolds and Hugh Jackman and became the MCU's first R-rated theatrical release?", a: "Deadpool & Wolverine" }
        ],
        200: [
          { q: "Which 2025 film introduced Marvel's First Family to the MCU, set on a retro-futuristic alternate Earth?", a: "The Fantastic Four: First Steps" },
          { q: "Which 2019 film became the highest-grossing film in box-office history at the time of its release, surpassing 'Avatar'?", a: "Avengers: Endgame" },
          { q: "Which MCU film was the first to premiere simultaneously in theaters and on Disney+ via Premier Access, in 2021?", a: "Black Widow" }
        ],
        300: [
          { q: "Which directing duo, known for 'Captain America: The Winter Soldier' and 'Captain America: Civil War,' also directed both 'Avengers: Infinity War' and 'Avengers: Endgame'?", a: "The Russo Brothers (Anthony and Joe Russo)" },
          { q: "Which 2016 film introduced the Sokovia Accords, splitting the Avengers into two rival factions led by Iron Man and Captain America?", a: "Captain America: Civil War" },
          { q: "Which film served as the official launch of Phase Five in February 2023, directed by Peyton Reed?", a: "Ant-Man and the Wasp: Quantumania" }
        ],
        400: [
          { q: "Which 2025 film's marketing was updated after its release to rebrand it as 'The New Avengers,' reflecting a twist revealed in its ending?", a: "Thunderbolts*" },
          { q: "Which actor replaced Edward Norton in the role of Bruce Banner starting with 2012's 'The Avengers,' after Norton originated the role in 2008's 'The Incredible Hulk'?", a: "Mark Ruffalo" },
          { q: "Which MCU release, delayed multiple times, is scheduled for December 18, 2026 and unites the Avengers, Fantastic Four, and X-Men characters against Doctor Doom?", a: "Avengers: Doomsday" }
        ],
        500: [
          { q: "Which director became the first woman to helm a Marvel Studios film, co-directing 'Captain Marvel' (2019) with Ryan Fleck?", a: "Anna Boden" },
          { q: "Which composer, who scored 'The Avengers' (2012) and multiple Captain America films, also composed 'Avengers: Endgame'?", a: "Alan Silvestri" },
          { q: "Which MCU film was the first to be released after Disney's acquisition of 21st Century Fox's film assets officially closed in March 2019?", a: "Avengers: Endgame" }
        ]
      }
    },
    {
      name: "Heroes",
      questions: {
        100: [
          { q: "Which actor plays Steve Rogers/Captain America throughout the Infinity Saga?", a: "Chris Evans" },
          { q: "Which actress plays Natasha Romanoff/Black Widow across the MCU?", a: "Scarlett Johansson" },
          { q: "Which actor plays Thor across the MCU, from 2011's 'Thor' through 'Thor: Love and Thunder'?", a: "Chris Hemsworth" }
        ],
        200: [
          { q: "Which actor took over the role of Spider-Man/Peter Parker for the MCU, debuting in 'Captain America: Civil War'?", a: "Tom Holland" },
          { q: "Which actress plays Carol Danvers/Captain Marvel?", a: "Brie Larson" },
          { q: "Which actor plays Sam Wilson, who takes up the shield as the new Captain America after 'Avengers: Endgame'?", a: "Anthony Mackie" }
        ],
        300: [
          { q: "Which actor plays Shang-Chi, master of Kung Fu and leader of the Ten Rings organization, in his 2021 solo film?", a: "Simu Liu" },
          { q: "Which actress plays Kate Bishop, Clint Barton's protégé, who later joins the New Avengers team introduced in 'Thunderbolts*'?", a: "Hailee Steinfeld" },
          { q: "Which actress plays Yelena Belova, Natasha Romanoff's adoptive sister, who leads the New Avengers in 'Thunderbolts*'?", a: "Florence Pugh" }
        ],
        400: [
          { q: "Which actor was cast as Mr. Fantastic/Reed Richards in 'The Fantastic Four: First Steps' (2025)?", a: "Pedro Pascal" },
          { q: "Which actress plays Sue Storm/Invisible Woman opposite Pedro Pascal in 'The Fantastic Four: First Steps'?", a: "Vanessa Kirby" },
          { q: "Which actor plays Bob/Sentry, whose alter ego 'The Void' serves as the primary antagonist of 'Thunderbolts*'?", a: "Lewis Pullman" }
        ],
        500: [
          { q: "Which actress played the child version of Cassie Lang in 'Ant-Man' (2015) and 'Ant-Man and the Wasp' (2018), before Kathryn Newton took over the role as a teenager in 'Quantumania'?", a: "Abby Ryder Fortson" },
          { q: "Which actor plays Ben Grimm/The Thing in 'The Fantastic Four: First Steps'?", a: "Ebon Moss-Bachrach" },
          { q: "Which actor performed Rocket Raccoon's on-set movements as a physical stand-in throughout the Guardians of the Galaxy trilogy, even though Bradley Cooper voiced the character in post-production?", a: "Sean Gunn" }
        ]
      }
    },
    {
      name: "Villains",
      questions: {
        100: [
          { q: "Which purple-skinned Mad Titan serves as the primary antagonist of the Infinity Saga, seeking to collect all six Infinity Stones?", a: "Thanos" },
          { q: "Which actor plays Thanos across multiple MCU films via motion capture?", a: "Josh Brolin" },
          { q: "Which Asgardian god of mischief, Thor's adoptive brother, appears as an antagonist in several early MCU films?", a: "Loki" }
        ],
        200: [
          { q: "Which actor plays Erik Killmonger, T'Challa's cousin and rival for the throne of Wakanda, in 'Black Panther'?", a: "Michael B. Jordan" },
          { q: "Which robotic villain, voiced by James Spader, is created by Tony Stark and Bruce Banner and turns against the Avengers?", a: "Ultron" },
          { q: "Which actor plays Helmut Zemo, the Sokovian mastermind who manipulates the Avengers into fighting each other in 'Captain America: Civil War'?", a: "Daniel Brühl" }
        ],
        300: [
          { q: "Which cosmic, planet-devouring villain appears as the primary antagonist of 'The Fantastic Four: First Steps,' played by Ralph Ineson?", a: "Galactus" },
          { q: "Which actress plays Cassandra Nova, the villain revealed to have manipulated events in 'Deadpool & Wolverine'?", a: "Emma Corrin" },
          { q: "Which actor plays the High Evolutionary, the primary antagonist of 'Guardians of the Galaxy Vol. 3' who is responsible for creating Rocket?", a: "Chukwudi Iwuji" }
        ],
        400: [
          { q: "Which actor was cast as Kang the Conqueror and He Who Remains before being dropped from the MCU in 2024 following a domestic violence conviction?", a: "Jonathan Majors" },
          { q: "Which actor plays Doctor Doom in 'Avengers: Doomsday,' after previously playing Tony Stark/Iron Man earlier in the MCU?", a: "Robert Downey Jr." },
          { q: "Which actress plays Valentina Allegra de Fontaine, the scheming government operative who assembles the Thunderbolts and later takes credit for branding them the New Avengers?", a: "Julia Louis-Dreyfus" }
        ],
        500: [
          { q: "Which actor voices M.O.D.O.K., the antagonist of 'Ant-Man and the Wasp: Quantumania' who was formerly Darren Cross?", a: "Corey Stoll" },
          { q: "Which actress plays Shalla-Bal, the Silver Surfer and herald of Galactus, in 'The Fantastic Four: First Steps'?", a: "Julia Garner" },
          { q: "Which actress plays Ghost, real name Ava Starr, the antagonist of 'Ant-Man and the Wasp' (2018)?", a: "Hannah John-Kamen" }
        ]
      }
    },
    {
      name: "Infinity Saga",
      questions: {
        100: [
          { q: "Which 2019 film served as the direct sequel and climactic conclusion to 'Avengers: Infinity War,' closing out the Infinity Saga?", a: "Avengers: Endgame" },
          { q: "Which glowing, colorful gems—six in total—are the central objects sought throughout the Infinity Saga?", a: "The Infinity Stones" },
          { q: "Which 2012 film first assembled Iron Man, Captain America, Thor, Hulk, Black Widow, and Hawkeye as a team?", a: "The Avengers" }
        ],
        200: [
          { q: "How many total films make up the Infinity Saga, spanning 'Iron Man' (2008) through 'Avengers: Endgame' (2019)?", a: "23" },
          { q: "Which three phases of the MCU together make up the Infinity Saga?", a: "Phase One, Phase Two, and Phase Three" },
          { q: "Which 2011 film, set primarily during World War II, introduced Steve Rogers as Captain America?", a: "Captain America: The First Avenger" }
        ],
        300: [
          { q: "Which 2014 film introduced the Guardians of the Galaxy team and was Marvel Studios' first major film set primarily off Earth?", a: "Guardians of the Galaxy" },
          { q: "In 'Avengers: Endgame,' what term does the film use for the time-travel plan the surviving Avengers undertake to retrieve the Infinity Stones from the past?", a: "The Time Heist" },
          { q: "Which Infinity Stone is hidden inside the Tesseract throughout the early Captain America and Avengers films?", a: "The Space Stone" }
        ],
        400: [
          { q: "Which 2015 film introduced Vision, a synthetic being created from J.A.R.V.I.S.'s consciousness, Ultron's body, and the Mind Stone?", a: "Avengers: Age of Ultron" },
          { q: "Which Infinity Stone is embedded in Vision's forehead and forcibly removed by Thanos in 'Avengers: Infinity War,' killing him?", a: "The Mind Stone" },
          { q: "Which actress plays Gamora, Thanos's adoptive daughter, who is sacrificed on Vormir so he can obtain the Soul Stone in 'Avengers: Infinity War'?", a: "Zoe Saldaña" }
        ],
        500: [
          { q: "According to Doctor Strange in 'Avengers: Infinity War,' out of how many possible futures did he witness only a single one in which the Avengers ultimately defeat Thanos?", a: "14,000,605" },
          { q: "What term does Nick Fury use, in the MCU's very first post-credits scene at the end of 'Iron Man' (2008), to describe the program he invites Tony Stark to join?", a: "The Avenger Initiative" },
          { q: "Which actor originated the role of Red Skull in 'Captain America: The First Avenger' (2011), before the character was recast for his appearances on Vormir in 'Avengers: Infinity War' and 'Avengers: Endgame'?", a: "Hugo Weaving" }
        ]
      }
    },
    {
      name: "Multiverse Saga",
      questions: {
        100: [
          { q: "Which 2022 film sends Doctor Strange across the multiverse to protect America Chavez, kicking off the multiversal chaos of Phase Four?", a: "Doctor Strange in the Multiverse of Madness" },
          { q: "Which 2021 film brought Tobey Maguire's and Andrew Garfield's Spider-Man actors back on screen alongside Tom Holland for the first time?", a: "Spider-Man: No Way Home" },
          { q: "Which 2025 film reintroduced the Fantastic Four to the MCU, setting Phase Six in motion?", a: "The Fantastic Four: First Steps" }
        ],
        200: [
          { q: "Which three official phases make up the Multiverse Saga, as announced by Kevin Feige in 2022?", a: "Phase Four, Phase Five, and Phase Six" },
          { q: "Which 2023 film was originally intended to establish Kang the Conqueror as the Multiverse Saga's central villain, before recasting concerns changed Marvel's plans?", a: "Ant-Man and the Wasp: Quantumania" },
          { q: "Which two-part Avengers films are set to conclude the Multiverse Saga, released in 2026 and 2027 respectively?", a: "Avengers: Doomsday and Avengers: Secret Wars" }
        ],
        300: [
          { q: "Which 2022 film sees Wanda Maximoff, corrupted by the Darkhold's dark magic, become the story's primary antagonist as she hunts across the multiverse for a version of her children?", a: "Doctor Strange in the Multiverse of Madness" },
          { q: "Which 2024 film, starring Deadpool and Wolverine, is credited with formally bridging the 20th Century Fox X-Men film universe into the MCU's multiverse?", a: "Deadpool & Wolverine" },
          { q: "Which government-recruited antihero team rebrands itself as 'The New Avengers' by the end of 'Thunderbolts*' (2025)?", a: "The Thunderbolts" }
        ],
        400: [
          { q: "What was the original title of 'Avengers: Doomsday' before it was changed following Jonathan Majors's dismissal from the role of Kang?", a: "Avengers: The Kang Dynasty" },
          { q: "At which entertainment convention did Kevin Feige formally unveil the 'Multiverse Saga' branding along with the Phase Five and Phase Six film lineups, in July 2022?", a: "San Diego Comic-Con" },
          { q: "Which 2023 film marked James Gunn's final MCU directing credit before he departed to become co-CEO of DC Studios?", a: "Guardians of the Galaxy Vol. 3" }
        ],
        500: [
          { q: "Which actress reprised her 2003 'Daredevil'-franchise role as Elektra Natchios in a cameo during 'Deadpool & Wolverine' (2024)?", a: "Jennifer Garner" },
          { q: "In 'Deadpool & Wolverine,' Chris Evans's cameo tricks the audience into expecting a Captain America return, before revealing he's playing which character from the 2005 and 2007 'Fantastic Four' films?", a: "Johnny Storm/Human Torch" },
          { q: "Which actor's cameo as Blade in 'Deadpool & Wolverine' set a Guinness World Record for the longest career playing a single live-action Marvel character, over 25 years after his first appearance in the role?", a: "Wesley Snipes" }
        ]
      }
    }
  ]
},
"Star Wars": {
  icon: "🚀",
  categories: [
    {
      name: "Movies",
      questions: {
        100: [
          { q: "Which 1977 film, later retitled 'Star Wars: Episode IV – A New Hope,' began the Star Wars franchise?", a: "Star Wars (A New Hope)" },
          { q: "Which 1980 sequel revealed that Darth Vader is Luke Skywalker's father?", a: "The Empire Strikes Back" },
          { q: "Which 2015 film, directed by J.J. Abrams, revived the Skywalker saga with new leads Rey, Finn, and Poe?", a: "The Force Awakens" }
        ],
        200: [
          { q: "Which 1983 film concluded the original trilogy with the destruction of the second Death Star?", a: "Return of the Jedi" },
          { q: "Which 1999 film, the first prequel, introduced young Anakin Skywalker as a slave boy on Tatooine?", a: "The Phantom Menace" },
          { q: "Which 2019 film concluded the Skywalker saga as its ninth mainline episode?", a: "The Rise of Skywalker" }
        ],
        300: [
          { q: "Which 2002 prequel film depicts the start of the Clone Wars and the secret marriage of Anakin and Padmé?", a: "Attack of the Clones" },
          { q: "Which 2016 anthology film, a direct prequel to 'A New Hope,' follows a group of rebels stealing the Death Star plans?", a: "Rogue One: A Star Wars Story" },
          { q: "Which 2005 film depicts Anakin Skywalker's fall to the dark side and transformation into Darth Vader?", a: "Revenge of the Sith" }
        ],
        400: [
          { q: "Which 2018 anthology film serves as an origin story for a young Han Solo, including his first meeting with Chewbacca?", a: "Solo: A Star Wars Story" },
          { q: "Which director took over from George Lucas to direct 'The Empire Strikes Back' (1980)?", a: "Irvin Kershner" },
          { q: "Which film was the first in the saga to display 'Episode I' on screen as newly produced material, despite the numbering scheme having already existed for earlier films?", a: "The Phantom Menace" }
        ],
        500: [
          { q: "What was the fake working title used during the filming of 'Return of the Jedi' to throw off the press and public?", a: "Blue Harvest" },
          { q: "Which film was the first Star Wars movie to display an on-screen episode number in its original theatrical release, doing so in 1980 (unlike 'A New Hope,' whose 'Episode IV' text was added in a later re-release)?", a: "The Empire Strikes Back" },
          { q: "Which actor physically portrayed Darth Vader in the original trilogy, having his voice completely replaced in post-production by James Earl Jones?", a: "David Prowse" }
        ]
      }
    },
    {
      name: "Characters",
      questions: {
        100: [
          { q: "Which farm boy from Tatooine becomes a Jedi Knight and destroys the first Death Star?", a: "Luke Skywalker" },
          { q: "Which princess and general leads the Rebel Alliance and is later revealed to be Luke's twin sister?", a: "Leia Organa" },
          { q: "Which smuggler pilots the Millennium Falcon alongside his Wookiee co-pilot Chewbacca?", a: "Han Solo" }
        ],
        200: [
          { q: "Which golden protocol droid is fluent in over six million forms of communication?", a: "C-3PO" },
          { q: "Which small, green Jedi Master trains both Luke Skywalker and, decades earlier, Anakin Skywalker?", a: "Yoda" },
          { q: "Which scavenger from the desert planet Jakku becomes a central hero of the sequel trilogy?", a: "Rey" }
        ],
        300: [
          { q: "Which armored bounty hunter captures Han Solo in carbonite for Jabba the Hutt?", a: "Boba Fett" },
          { q: "Which Jedi Master serves as Obi-Wan Kenobi's own mentor before being killed by Darth Maul in 'The Phantom Menace'?", a: "Qui-Gon Jinn" },
          { q: "Which former stormtrooper defects from the First Order and befriends Rey and Poe Dameron?", a: "Finn" }
        ],
        400: [
          { q: "Which Sith Lord secretly rules the galaxy as both Darth Sidious and, publicly, Chancellor Palpatine?", a: "Emperor Palpatine (Darth Sidious)" },
          { q: "Which Mandalorian bounty hunter serves as the unaltered genetic template for the Republic's clone trooper army?", a: "Jango Fett" },
          { q: "Which cyborg alien general, commander of the droid army in 'Revenge of the Sith,' collects lightsabers taken from Jedi he has killed?", a: "General Grievous" }
        ],
        500: [
          { q: "Which actor played Grand Moff Tarkin in the original films and was digitally recreated for a new performance in 'Rogue One' after his death?", a: "Peter Cushing" },
          { q: "Which actress played Padmé Amidala's decoy handmaiden Sabé in 'The Phantom Menace,' before going on to greater fame in other film roles?", a: "Keira Knightley" },
          { q: "Which actor plays Tobias Beckett, Han Solo's mentor and fellow smuggler, in 'Solo: A Star Wars Story'?", a: "Woody Harrelson" }
        ]
      }
    },
    {
      name: "The Force & Jedi Order",
      questions: {
        100: [
          { q: "What mystical energy field, wielded by the Jedi and Sith alike, binds the Star Wars galaxy together?", a: "The Force" },
          { q: "What is the name of the blade of pure energy that serves as a Jedi Knight's signature weapon?", a: "The lightsaber" },
          { q: "What color is Luke Skywalker's second lightsaber, built by himself and used in 'Return of the Jedi'?", a: "Green" }
        ],
        200: [
          { q: "What is the name of the ancient order of dark-side Force-wielders who are the sworn enemies of the Jedi?", a: "The Sith" },
          { q: "What ancient rule limits the Sith to exactly two members at any time — a master and an apprentice?", a: "The Rule of Two" },
          { q: "What is the name of the technique that allows a Jedi to influence weak-minded individuals with a wave of the hand and a few suggestive words?", a: "The Jedi mind trick" }
        ],
        300: [
          { q: "Which Zabrak Sith Lord, Darth Sidious's on-screen apprentice, wields a double-bladed lightsaber in 'The Phantom Menace'?", a: "Darth Maul" },
          { q: "What is the name of the governing body of twelve Jedi Masters who oversee the Jedi Order from the Jedi Temple on Coruscant?", a: "The Jedi Council" },
          { q: "What is the name of the secret command that turns the clone troopers against their Jedi generals at the end of 'Revenge of the Sith'?", a: "Order 66" }
        ],
        400: [
          { q: "What is the name of the dark-side power, channeled through the hands, that Emperor Palpatine famously uses to strike down Mace Windu and torture Luke Skywalker?", a: "Force lightning" },
          { q: "Which future Sith Lord loses his right forearm to Count Dooku's lightsaber during their duel in 'Attack of the Clones'?", a: "Anakin Skywalker" },
          { q: "What term describes a former Jedi's spiritual essence retained after death, allowing figures like Obi-Wan Kenobi and Yoda to appear as translucent, communicative apparitions?", a: "A Force ghost" }
        ],
        500: [
          { q: "What is the name of the microscopic, symbiotic life-forms said to live within all living cells and allow Force-sensitives to communicate with the Force, as explained in 'The Phantom Menace'?", a: "Midichlorians" },
          { q: "According to the prophecy referenced throughout the prequel trilogy, what is Anakin Skywalker foretold to be regarding the Force?", a: "The Chosen One (prophesied to bring balance to the Force)" },
          { q: "In Yoda's famous warning about fear on Dagobah — 'Fear leads to anger, anger leads to hate' — what is the final link in that chain of emotions?", a: "Suffering" }
        ]
      }
    },
    {
      name: "Starships & Planets",
      questions: {
        100: [
          { q: "What is the name of Han Solo's iconic ship, said to have made 'the Kessel Run in less than twelve parsecs'?", a: "The Millennium Falcon" },
          { q: "What is the name of Luke Skywalker's desert home planet, known for its twin suns?", a: "Tatooine" },
          { q: "What massive, moon-sized Imperial battle station is capable of destroying entire planets?", a: "The Death Star" }
        ],
        200: [
          { q: "Which ice planet is home to the Rebel base at the start of 'The Empire Strikes Back'?", a: "Hoth" },
          { q: "What is the name of Yoda's swampy exile planet, where Luke trains as a Jedi in 'The Empire Strikes Back'?", a: "Dagobah" },
          { q: "What is the name of the small, single-pilot starfighter flown by Rebel and Resistance pilots against the Death Star and other Imperial targets?", a: "The X-wing" }
        ],
        300: [
          { q: "What is the name of the forest moon inhabited by the Ewoks, site of the climactic ground battle in 'Return of the Jedi'?", a: "Endor" },
          { q: "What is the name of Darth Vader's personal Star Destroyer flagship?", a: "The Executor" },
          { q: "What is the name of Rey's home desert planet, introduced in 'The Force Awakens,' where she survives by scavenging parts from crashed Star Destroyers?", a: "Jakku" }
        ],
        400: [
          { q: "What is the name of the planet where the Republic's clone trooper army is secretly created in 'Attack of the Clones'?", a: "Kamino" },
          { q: "What is the name of the prison-mining planet where Han, Chewbacca, and Lando pull off a dangerous spice heist in 'Solo: A Star Wars Story,' also referenced in the original film's 'Kessel Run' line?", a: "Kessel" },
          { q: "Which capital planet of the Galactic Republic, and later the Empire, is depicted as an entirely city-covered world?", a: "Coruscant" }
        ],
        500: [
          { q: "What is the name of the hidden Sith planet, shrouded by a permanent electrical storm, revealed as Emperor Palpatine's secret base and fleet in 'The Rise of Skywalker'?", a: "Exegol" },
          { q: "What is the name of the volcanic planet where Obi-Wan Kenobi and Anakin Skywalker have their climactic lightsaber duel at the end of 'Revenge of the Sith'?", a: "Mustafar" },
          { q: "What is the name of Padmé Amidala's water-covered home planet, whose capital city is Theed?", a: "Naboo" }
        ]
      }
    },
    {
      name: "Trivia & Behind-the-Scenes",
      questions: {
        100: [
          { q: "Which filmmaker created the Star Wars franchise, writing and directing the original 1977 film?", a: "George Lucas" },
          { q: "Which legendary composer wrote the iconic musical score for the Star Wars saga, including its famous main theme?", a: "John Williams" },
          { q: "In which desert country were the Tatooine scenes for multiple Star Wars films famously shot on location?", a: "Tunisia" }
        ],
        200: [
          { q: "What is the exact wording of Darth Vader's famous line revealing he is Luke's father, which is often misquoted as 'Luke, I am your father'?", a: "No, I am your father." },
          { q: "Which actor, standing over seven feet tall, physically performed as Chewbacca throughout the original and prequel trilogies?", a: "Peter Mayhew" },
          { q: "Which studio distributed the original Star Wars trilogy in theaters, before Lucasfilm was acquired by Disney in 2012?", a: "20th Century Fox" }
        ],
        300: [
          { q: "Which actor ad-libbed the famous response 'I know' instead of the scripted 'I love you too' during Han Solo's carbon-freezing scene in 'The Empire Strikes Back'?", a: "Harrison Ford" },
          { q: "How many competitive Academy Awards did the original 1977 'Star Wars' film win at the 50th Academy Awards ceremony?", a: "Six" },
          { q: "Which recycled stock scream, first recorded in 1951, was inserted by sound designer Ben Burtt into a scene of a falling stormtrooper and has since become a running in-joke throughout Hollywood?", a: "The Wilhelm scream" }
        ],
        400: [
          { q: "Which visual effects company did George Lucas found specifically to create the effects for the original 'Star Wars,' which went on to become an industry leader?", a: "Industrial Light & Magic (ILM)" },
          { q: "Which sound post-production company, also founded by George Lucas and based at Skywalker Ranch, handles the franchise's audio design?", a: "Skywalker Sound" },
          { q: "Which single line of Han Solo's dialogue toward Greedo in the Mos Eisley cantina was digitally altered in later re-releases, sparking the long-running 'Who shot first?' fan controversy?", a: "\"Han shot first\"" }
        ],
        500: [
          { q: "Which 1975 film held the record for highest-grossing movie of all time until the original 'Star Wars' overtook it in 1977?", a: "Jaws" },
          { q: "Which actor is the only person to receive a competitive Academy Award nomination for acting in a Star Wars film, nominated for Best Supporting Actor for playing Obi-Wan Kenobi in 'A New Hope'?", a: "Alec Guinness" },
          { q: "What trade did Harrison Ford work as, including for clients like Francis Ford Coppola, in the years before his acting career took off around the time of his 'Star Wars' casting?", a: "Carpenter" }
        ]
      }
    }
  ]
},
"Disney": {
  icon: "🏰",
  categories: [
    {
      name: "Disney Movies",
      questions: {
        100: [
          { q: "Which 1937 Disney film was the first full-length cel-animated feature film in movie history?", a: "Snow White and the Seven Dwarfs" },
          { q: "In 'Frozen,' what is the name of the kingdom ruled by sisters Elsa and Anna?", a: "Arendelle" },
          { q: "Which 1994 Disney film follows a lion cub named Simba who must reclaim his throne from his uncle?", a: "The Lion King" }
        ],
        200: [
          { q: "Which Disney film is set among the Polynesian islands and follows a chief's daughter who sets sail to save her people?", a: "Moana" },
          { q: "Which 1992 Disney film is set in the fictional city of Agrabah and features a genie who lives in a magic lamp?", a: "Aladdin" },
          { q: "Which Disney film became the first animated feature ever nominated for the Academy Award for Best Picture?", a: "Beauty and the Beast" }
        ],
        300: [
          { q: "Which 1989 Disney film, based on a Hans Christian Andersen tale, stars a mermaid princess named Ariel?", a: "The Little Mermaid" },
          { q: "Which 2010 Disney film retells the story of a long-haired princess locked in a tower?", a: "Tangled" },
          { q: "Which 1940 Disney film pairs classical music with animated segments, including 'The Sorcerer's Apprentice' starring Mickey Mouse?", a: "Fantasia" }
        ],
        400: [
          { q: "Which 1942 Disney film centers on a young deer who loses his mother to a hunter?", a: "Bambi" },
          { q: "Which 1959 Disney film was, at the time, the studio's most expensive animated film and was shot in widescreen Super Technirama 70?", a: "Sleeping Beauty" },
          { q: "Which 1940 Disney film features a wooden puppet who, along with his father, is swallowed by a whale named Monstro?", a: "Pinocchio" }
        ],
        500: [
          { q: "Which 1985 Disney animated film was the studio's first to receive a PG rating and became a notorious box-office flop?", a: "The Black Cauldron" },
          { q: "Which 1941 Disney film, made quickly and cheaply after 'Fantasia' underperformed, is one of the studio's shortest animated features at just over an hour?", a: "Dumbo" },
          { q: "Which 1990 Disney film was the studio's first traditionally animated theatrical sequel and the first feature completed entirely with the digital CAPS ink-and-paint system?", a: "The Rescuers Down Under" }
        ]
      }
    },
    {
      name: "Disney Characters",
      questions: {
        100: [
          { q: "What is the name of Aladdin's mischievous pet monkey?", a: "Abu" },
          { q: "What is the name of the living snowman built by Elsa's magic in 'Frozen'?", a: "Olaf" },
          { q: "What is the name of the fairy who accompanies Peter Pan?", a: "Tinker Bell" }
        ],
        200: [
          { q: "What is the name of Belle's father, an inventor, in 'Beauty and the Beast'?", a: "Maurice" },
          { q: "In 'The Little Mermaid,' what is the name of Ariel's crab friend and reluctant chaperone?", a: "Sebastian" },
          { q: "What is the name of Mulan's wisecracking dragon guardian, voiced by Eddie Murphy?", a: "Mushu" }
        ],
        300: [
          { q: "What is the name of Bambi's excitable rabbit friend?", a: "Thumper" },
          { q: "In 'Pinocchio,' what is the name of the cricket who serves as Pinocchio's conscience?", a: "Jiminy Cricket" },
          { q: "What is the name of Rapunzel's loyal pet chameleon in 'Tangled'?", a: "Pascal" }
        ],
        400: [
          { q: "In 'Sleeping Beauty,' what are the names of the three good fairies who raise Princess Aurora?", a: "Flora, Fauna, and Merryweather" },
          { q: "What is the name of the boy genius who is paired with the robot Baymax in 'Big Hero 6'?", a: "Hiro Hamada" },
          { q: "In 'The Hunchback of Notre Dame,' what are the names of Quasimodo's three gargoyle friends?", a: "Victor, Hugo, and Laverne" }
        ],
        500: [
          { q: "What is the name of the talking willow tree spirit who guides Pocahontas?", a: "Grandmother Willow" },
          { q: "In 'The Great Mouse Detective,' what is the name of Professor Ratigan's peg-legged bat henchman?", a: "Fidget" },
          { q: "What is the name of the elderly albatross who helps Bernard and Bianca fly to Devil's Bayou in 'The Rescuers'?", a: "Orville" }
        ]
      }
    },
    {
      name: "Villains",
      questions: {
        100: [
          { q: "Who is the villainous sea witch who tricks Ariel into a deal in 'The Little Mermaid'?", a: "Ursula" },
          { q: "Who is Simba's scheming uncle and the main villain of 'The Lion King'?", a: "Scar" },
          { q: "What is the title of the evil queen and witch who poisons Snow White with a cursed apple?", a: "The Evil Queen" }
        ],
        200: [
          { q: "Who is the power-hungry royal vizier in 'Aladdin' who seeks the genie's lamp?", a: "Jafar" },
          { q: "Who is the wicked fashion designer obsessed with making a coat from puppy fur in '101 Dalmatians'?", a: "Cruella de Vil" },
          { q: "Who is the horned, evil fairy who curses Princess Aurora in 'Sleeping Beauty'?", a: "Maleficent" }
        ],
        300: [
          { q: "Who is the vain, muscle-bound hunter who tries to kill the Beast in 'Beauty and the Beast'?", a: "Gaston" },
          { q: "In 'Hercules,' who is the fast-talking god of the underworld and the film's main villain?", a: "Hades" },
          { q: "In 'Tangled,' what does Mother Gothel keep Rapunzel captive in order to use?", a: "Her magical, youth-restoring hair" }
        ],
        400: [
          { q: "Who is the tyrannical stepmother who torments Cinderella?", a: "Lady Tremaine" },
          { q: "In 'Pocahontas,' who is the gold-obsessed governor leading the Virginia Company's expedition?", a: "Governor Ratcliffe" },
          { q: "What is the name of the corrupt judge who relentlessly pursues Quasimodo and Esmeralda in 'The Hunchback of Notre Dame'?", a: "Judge Claude Frollo" }
        ],
        500: [
          { q: "Who is the criminal mastermind rat, voiced by Vincent Price, who serves as the villain of 'The Great Mouse Detective'?", a: "Professor Ratigan" },
          { q: "Who is the mad, shape-shifting witch who challenges Merlin to a wizard's duel in 'The Sword in the Stone'?", a: "Madam Mim" },
          { q: "Who is the greedy, thumb-sucking lion who usurps the throne of England in 'Robin Hood' (1973)?", a: "Prince John" }
        ]
      }
    },
    {
      name: "Songs",
      questions: {
        100: [
          { q: "Which 'Frozen' song, sung by Elsa as she abandons her kingdom, won the Academy Award for Best Original Song?", a: "\"Let It Go\"" },
          { q: "Which song plays during Simba's presentation as a newborn cub at the opening of 'The Lion King'?", a: "\"Circle of Life\"" },
          { q: "Which song does Ariel sing while sitting on a rock, longing to be part of the human world?", a: "\"Part of Your World\"" }
        ],
        200: [
          { q: "Which duet do Aladdin and Jasmine sing while flying together on a magic carpet?", a: "\"A Whole New World\"" },
          { q: "Which song, performed by Sebastian the crab, celebrates undersea life in 'The Little Mermaid'?", a: "\"Under the Sea\"" },
          { q: "Which Elton John and Tim Rice song from 'The Lion King' won the Academy Award for Best Original Song?", a: "\"Can You Feel the Love Tonight\"" }
        ],
        300: [
          { q: "Which song plays as Belle and the Beast share their dance in the ballroom scene of 'Beauty and the Beast'?", a: "\"Beauty and the Beast\"" },
          { q: "Which 'Pocahontas' song, about respecting the natural world, won the Academy Award for Best Original Song?", a: "\"Colors of the Wind\"" },
          { q: "Which carefree, problem-free philosophy song do Timon and Pumbaa teach young Simba in 'The Lion King'?", a: "\"Hakuna Matata\"" }
        ],
        400: [
          { q: "Which song, sung by Jiminy Cricket in 'Pinocchio,' later became the Walt Disney Company's own signature theme song?", a: "\"When You Wish Upon a Star\"" },
          { q: "Which composer scored 'The Little Mermaid,' 'Beauty and the Beast,' and 'Aladdin,' frequently collaborating with lyricist Howard Ashman?", a: "Alan Menken" },
          { q: "Which tongue-twisting song from 'Mary Poppins' takes its title from one of the longest words ever used in a Disney song?", a: "\"Supercalifragilisticexpialidocious\"" }
        ],
        500: [
          { q: "Which song from 'Song of the South' (1946) became Disney's second-ever Academy Award-winning song?", a: "\"Zip-a-Dee-Doo-Dah\"" },
          { q: "Which song, written and performed by Phil Collins for 'Tarzan,' won the Academy Award for Best Original Song in 2000?", a: "\"You'll Be in My Heart\"" },
          { q: "Which orchestral piece by French composer Paul Dukas accompanies the famous 'Sorcerer's Apprentice' segment in 'Fantasia'?", a: "\"The Sorcerer's Apprentice\" (L'Apprenti sorcier)" }
        ]
      }
    },
    {
      name: "Pixar",
      questions: {
        100: [
          { q: "Which 1995 film was Pixar's first feature film and the first feature film made entirely with computer animation?", a: "Toy Story" },
          { q: "In 'Finding Nemo,' what type of fish is Nemo?", a: "A clownfish" },
          { q: "What is the name of the hopping desk lamp that serves as Pixar's mascot in its opening logo?", a: "Luxo Jr." }
        ],
        200: [
          { q: "In 'Up,' what is the name of the elderly widower who ties thousands of balloons to his house?", a: "Carl Fredricksen" },
          { q: "In 'Monsters, Inc.,' what is the name of the human toddler who accidentally enters the monster world?", a: "Boo" },
          { q: "In 'Ratatouille,' what is the name of the rat who dreams of becoming a Parisian chef?", a: "Remy" }
        ],
        300: [
          { q: "In 'The Incredibles,' what is the superhero family's surname?", a: "Parr" },
          { q: "In 'Inside Out,' name the five core emotions living inside Riley's mind.", a: "Joy, Sadness, Anger, Fear, and Disgust" },
          { q: "In 'Coco,' which Mexican holiday is central to the film's plot?", a: "Dia de los Muertos (Day of the Dead)" }
        ],
        400: [
          { q: "Which 2020 Pixar film follows two teenage elf brothers on a quest to spend one magical day with their late father?", a: "Onward" },
          { q: "What is the nickname of the Pizza Planet delivery truck that appears as a hidden reference in nearly every Pixar film, first introduced in 'Toy Story'?", a: "The Pizza Planet Truck" },
          { q: "Which recurring hidden number, a nod to a California Institute of the Arts classroom, appears in almost every Pixar film?", a: "A113" }
        ],
        500: [
          { q: "Which actor voiced a character in 22 consecutive Pixar films, from 'Toy Story' in 1995 through 'Onward' in 2020, earning him the nickname of the studio's good-luck charm?", a: "John Ratzenberger" },
          { q: "What is the name of the 1984 short film directed by John Lasseter at Lucasfilm's Computer Graphics Group, the team that would go on to become Pixar?", a: "\"The Adventures of Andre & Wally B.\"" },
          { q: "Which 1988 Pixar short film, about a wind-up toy fleeing a drooling baby, won Pixar's first Academy Award, for Best Animated Short Film?", a: "\"Tin Toy\"" }
        ]
      }
    }
  ]
},
"Lord of the Rings": {
  icon: "💍",
  categories: [
    {
      name: "Characters",
      questions: {
        100: [
          { q: "Which hobbit is chosen as the Ring-bearer to carry the One Ring to Mordor?", a: "Frodo Baggins" },
          { q: "Which wizard leads the Fellowship and famously battles a Balrog on the Bridge of Khazad-dum?", a: "Gandalf" },
          { q: "Who is the Ranger from the North who is revealed to be the rightful King of Gondor?", a: "Aragorn" }
        ],
        200: [
          { q: "What is the name of Frodo's loyal gardener and closest companion on the journey to Mordor?", a: "Samwise \"Sam\" Gamgee" },
          { q: "Who is the Elf archer from the Woodland Realm who joins the Fellowship?", a: "Legolas" },
          { q: "What is the name of the creature, once a hobbit-like being called Smeagol, who is obsessed with the Ring?", a: "Gollum" }
        ],
        300: [
          { q: "Who is the Dwarf warrior, son of Gloin, who joins the Fellowship and forms a friendship with Legolas?", a: "Gimli" },
          { q: "Which Man of Gondor, son of Denethor, is corrupted by the Ring's influence and tries to take it from Frodo?", a: "Boromir" },
          { q: "Who is the shieldmaiden of Rohan who disguises herself as a man to fight at the Battle of the Pelennor Fields?", a: "Eowyn" }
        ],
        400: [
          { q: "Which wizard betrays the White Council and allies with Sauron, ruling from the tower of Orthanc?", a: "Saruman" },
          { q: "Who is Elrond's daughter, an immortal Elf who gives up her immortality to marry Aragorn?", a: "Arwen" },
          { q: "What is the name of Theoden's treacherous advisor, secretly working for Saruman?", a: "Grima Wormtongue" }
        ],
        500: [
          { q: "Who is the ancient, giant tree-shepherd (an Ent) who leads the march on Isengard?", a: "Treebeard (Fangorn)" },
          { q: "What is the name of Aragorn's ancestor, the King of Gondor who cut the One Ring from Sauron's hand but failed to destroy it?", a: "Isildur" },
          { q: "What is the name of the giant spider that ambushes Frodo in the pass of Cirith Ungol?", a: "Shelob" }
        ]
      }
    },
    {
      name: "Middle-earth Locations",
      questions: {
        100: [
          { q: "What is the name of the peaceful, rural homeland of the hobbits?", a: "The Shire" },
          { q: "What is the name of the fiery mountain in Mordor where the One Ring must be destroyed?", a: "Mount Doom (Orodruin)" },
          { q: "What is the name of the hobbit-hole home of Bilbo and later Frodo Baggins?", a: "Bag End" }
        ],
        200: [
          { q: "What is the name of the hidden Elven refuge ruled by Elrond, where the Fellowship is formed?", a: "Rivendell (Imladris)" },
          { q: "What is the name of the ancient Dwarven kingdom and mines where the Fellowship encounters a Balrog?", a: "Moria (Khazad-dum)" },
          { q: "What is the name of the golden-roofed hall of the King of Rohan in Edoras?", a: "Meduseld" }
        ],
        300: [
          { q: "What is the name of Sauron's fortress realm, encircled by mountains?", a: "Mordor" },
          { q: "What is the name of the great fortress of Rohan, also called the Hornburg, where a major battle is fought in 'The Two Towers'?", a: "Helm's Deep" },
          { q: "What is the name of the Elven forest realm ruled by Galadriel and Celeborn?", a: "Lothlorien" }
        ],
        400: [
          { q: "What is the name of Saruman's fortress, home to the tower of Orthanc?", a: "Isengard" },
          { q: "What is the name of the white-walled capital of Gondor, where Denethor rules as Steward?", a: "Minas Tirith" },
          { q: "What is the name of the forest home of the Ents, where Merry and Pippin meet Treebeard?", a: "Fangorn Forest" }
        ],
        500: [
          { q: "What is the name of the ruined watchtower where Frodo is stabbed by the Witch-king with a Morgul blade?", a: "Weathertop (Amon Sul)" },
          { q: "What is the name of the eerie swamp the Fellowship crosses en route to Mordor, where Frodo sees dead faces glowing beneath the water?", a: "The Dead Marshes" },
          { q: "What is the name of the secret mountain path Aragorn takes to summon the Army of the Dead?", a: "The Paths of the Dead" }
        ]
      }
    },
    {
      name: "The Films",
      questions: {
        100: [
          { q: "Who directed 'The Lord of the Rings' film trilogy?", a: "Peter Jackson" },
          { q: "In which country were all three 'Lord of the Rings' films primarily filmed?", a: "New Zealand" },
          { q: "What is the title of the third and final film in the trilogy, released in 2003?", a: "The Return of the King" }
        ],
        200: [
          { q: "Which actor plays Aragorn in the film trilogy?", a: "Viggo Mortensen" },
          { q: "Which actor plays Gandalf across the trilogy?", a: "Ian McKellen" },
          { q: "Who composed the film trilogy's orchestral score?", a: "Howard Shore" }
        ],
        300: [
          { q: "Which actor performed the character of Gollum through motion-capture technology?", a: "Andy Serkis" },
          { q: "Which New Zealand-based visual effects company created the trilogy's digital effects and miniatures?", a: "Weta Digital / Weta Workshop" },
          { q: "How many Academy Awards did 'The Return of the King' win, sweeping every category it was nominated in?", a: "11" }
        ],
        400: [
          { q: "Which actor plays Gimli in the trilogy and also provides the voice of the Ent Treebeard?", a: "John Rhys-Davies" },
          { q: "What nickname did Weta Workshop coin for the trilogy's large-scale physical models, such as Minas Tirith and Orthanc?", a: "Bigatures (large-scale miniatures)" },
          { q: "Which actress plays the Elf queen Galadriel and delivers the trilogy's opening narration?", a: "Cate Blanchett" }
        ],
        500: [
          { q: "Approximately how much was the combined production budget for all three 'Lord of the Rings' films, which were shot simultaneously back-to-back?", a: "About $281 million (roughly $93-94 million per film)" },
          { q: "What is the name of the crowd-simulation software developed by Weta Digital for the trilogy's massive battle scenes, later used industry-wide?", a: "Massive" },
          { q: "Which studio produced and financed 'The Lord of the Rings' trilogy?", a: "New Line Cinema" }
        ]
      }
    },
    {
      name: "Quotes",
      questions: {
        100: [
          { q: "Which character shouts \"You shall not pass!\" while facing down the Balrog on the Bridge of Khazad-dum?", a: "Gandalf" },
          { q: "Which character obsessively refers to the One Ring as \"My precious\"?", a: "Gollum" },
          { q: "Which character warns the Council, \"One does not simply walk into Mordor\"?", a: "Boromir" }
        ],
        200: [
          { q: "\"I am no man!\" is declared by which character just before she slays the Witch-king of Angmar?", a: "Eowyn" },
          { q: "The poem containing the line \"Not all those who wander are lost\" describes which Ranger, later revealed to be the King of Gondor?", a: "Aragorn" },
          { q: "\"I can't carry it for you, but I can carry you!\" is said by which hobbit to Frodo on the slopes of Mount Doom?", a: "Sam (Samwise Gamgee)" }
        ],
        300: [
          { q: "\"Fool of a Took!\" is shouted by which wizard after Pippin causes a commotion in the Mines of Moria?", a: "Gandalf" },
          { q: "\"The world is changed. I feel it in the water. I feel it in the earth. I smell it in the air.\" Who delivers this opening narration of 'The Fellowship of the Ring'?", a: "Galadriel" },
          { q: "\"I would have followed you, my brother. My captain. My king.\" Which dying character speaks this line to Aragorn?", a: "Boromir" }
        ],
        400: [
          { q: "\"Even the smallest person can change the course of the future.\" Which character says this to Frodo beside her Mirror in Lothlorien?", a: "Galadriel" },
          { q: "\"Death! Death! Death!\" Which King of Rohan chants this before leading the charge at the Battle of the Pelennor Fields?", a: "Theoden" },
          { q: "\"I bid you stand, Men of the West!\" Which character delivers this rallying speech before the Black Gate of Mordor?", a: "Aragorn" }
        ],
        500: [
          { q: "\"So it begins.\" Which King quietly says this as the Battle of Helm's Deep erupts?", a: "Theoden" },
          { q: "\"There's some good in this world, Mr. Frodo, and it's worth fighting for.\" Which character says this to encourage Frodo before they enter Mordor?", a: "Sam (Samwise Gamgee)" },
          { q: "Responding to Frodo's regret that Bilbo didn't kill Gollum when he had the chance, which character says, \"Many that live deserve death. And some that die deserve life. Can you give it to them?\"", a: "Gandalf" }
        ]
      }
    },
    {
      name: "Trivia & Lore",
      questions: {
        100: [
          { q: "Who wrote the novel 'The Lord of the Rings,' originally published in the 1950s?", a: "J.R.R. Tolkien" },
          { q: "What object, forged by the Dark Lord Sauron, is the central focus of the entire story?", a: "The One Ring" },
          { q: "What is the name of the group formed to destroy the Ring, giving the first film its title?", a: "The Fellowship of the Ring" }
        ],
        200: [
          { q: "How many members make up the Fellowship of the Ring?", a: "Nine" },
          { q: "What nickname is given to Bilbo Baggins' 111th birthday party, the event that opens the story?", a: "His \"eleventy-first\" birthday party" },
          { q: "Which prequel trilogy, also directed by Peter Jackson, adapts Tolkien's earlier novel about Bilbo Baggins?", a: "The Hobbit trilogy" }
        ],
        300: [
          { q: "In the lore of the Rings of Power, how many Rings were given to the race of Men, who were later corrupted into the Ringwraiths?", a: "Nine" },
          { q: "In what language, devised by Sauron himself, is the One Ring's fiery inscription written?", a: "The Black Speech (of Mordor)" },
          { q: "What is the name of Bilbo's enchanted short sword, later given to Frodo, which glows blue whenever Orcs are near?", a: "Sting" }
        ],
        400: [
          { q: "What is the name of Aragorn's sword, reforged from the shards of Narsil?", a: "Anduril (Flame of the West)" },
          { q: "Who awoke the Balrog known as \"Durin's Bane\" by delving too greedily and too deep for mithril?", a: "The Dwarves of Moria" },
          { q: "What term describes the army of oath-breaking men whom Aragorn summons from the mountain to fight at his side?", a: "The Army of the Dead (Oathbreakers)" }
        ],
        500: [
          { q: "What high frame rate, controversial among audiences for its hyper-realistic look, was used to film 'The Hobbit' trilogy?", a: "48 frames per second" },
          { q: "Which actor portrays the dragon Smaug in 'The Hobbit' trilogy through voice and motion-capture performance?", a: "Benedict Cumberbatch" },
          { q: "What is the name of the record book, found by Gandalf in Balin's tomb in Moria, that chronicles the doomed final stand of Balin's dwarven colony?", a: "The Book of Mazarbul" }
        ]
      }
    }
  ]
},
"Filipino Culture": {
  icon: "🎊",
  categories: [
    {
      name: "Filipino Food",
      questions: {
        100: [
          { q: "What Filipino dish, considered by many to be the country's unofficial national dish, is made by braising meat in vinegar, soy sauce, and garlic?", a: "Adobo" },
          { q: "What term refers to a whole roasted pig, a centerpiece dish at Filipino fiestas and celebrations?", a: "Lechon" },
          { q: "What popular Filipino dessert is made of shaved ice, evaporated milk, and a mix of sweetened beans, fruits, and jellies?", a: "Halo-halo" }
        ],
        200: [
          { q: "What is the name of the fertilized duck egg eaten as a popular Filipino street food, typically boiled and eaten with salt or vinegar?", a: "Balut" },
          { q: "What sour Filipino soup is commonly flavored with tamarind and can be made with pork, shrimp, or fish?", a: "Sinigang" },
          { q: "What stir-fried noodle dish, one of the most common Filipino comfort foods, is often served at birthdays as a symbol of long life?", a: "Pancit (Pansit)" }
        ],
        300: [
          { q: "What Filipino stew gets its rich orange-brown color and nutty flavor from ground peanuts, and is traditionally made with oxtail?", a: "Kare-kare" },
          { q: "What fermented condiment made from tiny shrimp or fish is a staple flavoring and dipping sauce in Filipino cuisine?", a: "Bagoong" },
          { q: "What is the name of the Filipino fried spring roll, typically filled with ground pork and vegetables?", a: "Lumpia" }
        ],
        400: [
          { q: "What Filipino dish, whose name literally translates to 'blooded,' is a savory stew made from pork offal simmered in pig's blood and vinegar?", a: "Dinuguan" },
          { q: "Sisig, the sizzling dish of chopped pig's face, ears, and liver, was popularized in the 1970s by a vendor in Angeles City, Pampanga, known by what nickname?", a: "Aling Lucing (Lucia Cunanan)" },
          { q: "What sweet Filipino snack consists of a banana rolled in a spring roll wrapper, coated in caramelized brown sugar, and deep-fried?", a: "Turon" }
        ],
        500: [
          { q: "La Paz Batchoy, the noodle soup topped with pork organs, crushed chicharon, and egg, takes its name from a district of what Philippine city?", a: "Iloilo City" },
          { q: "What is the traditional Filipino term for eating with bare hands directly off banana leaves, a style often associated with military-style 'boodle fights'?", a: "Kamayan" },
          { q: "Before it referred to grilled pork face, the word 'sisig' first appeared in a 1732 Kapampangan dictionary describing what kind of dish?", a: "A sour salad or relish of unripe fruit, like green mango, fermented in vinegar" }
        ]
      }
    },
    {
      name: "Traditions",
      questions: {
        100: [
          { q: "What is the term for a Filipino town or barrio's annual celebration in honor of its patron saint, usually featuring food, parades, and festivities?", a: "Fiesta" },
          { q: "What holiday is famously celebrated in the Philippines starting as early as September, giving the country a reputation for having the world's longest festive season?", a: "Christmas" },
          { q: "What is the name of the series of dawn masses held on the nine days leading up to Christmas Day in the Philippines?", a: "Simbang Gabi" }
        ],
        200: [
          { q: "What Filipino tradition, often cited as a symbol of community spirit, traditionally involves neighbors banding together to help a family move their entire house to a new location?", a: "Bayanihan" },
          { q: "What Filipino gesture of respect involves taking an elder's hand and pressing it lightly to one's forehead?", a: "Mano po (pagmamano)" },
          { q: "What term refers to the gifts or souvenirs that Filipinos traditionally bring home for family and friends after traveling?", a: "Pasalubong" }
        ],
        300: [
          { q: "What is the Filipino term for All Saints'/All Souls' Day observances, typically involving visiting and cleaning the graves of deceased family members?", a: "Undas" },
          { q: "What traditional Filipino courtship practice involves a suitor singing romantic songs, often at night, outside the window of the woman he is courting?", a: "Harana" },
          { q: "What is the name of the traditional Filipino Christmas lantern, usually star-shaped and symbolizing the Star of Bethlehem, especially associated with San Fernando, Pampanga?", a: "Parol" }
        ],
        400: [
          { q: "What week-long Aklan festival, held every January in honor of the Santo Nino and often called the 'Mother of All Philippine Festivals,' features tribes dancing in soot-blackened body paint?", a: "Ati-Atihan Festival" },
          { q: "What Baguio City festival, held every February and named for the local term for 'blooming season,' celebrates the city's flowers?", a: "Panagbenga Festival" },
          { q: "What is the term for the continuous, often days-long chanting of the 'Pasyon,' the epic poem recounting the life and death of Jesus Christ, during Holy Week?", a: "Pabasa" }
        ],
        500: [
          { q: "What Cebu festival, held every third Sunday of January and one of the largest in the Philippines, honors the Santo Nino de Cebu with a dance mimicking the movement of a river current?", a: "Sinulog Festival" },
          { q: "In traditional Filipino Catholic weddings, what are the coins called that the groom gives the bride as a symbol of prosperity, a custom inherited from Spanish colonization?", a: "Arrhae (arras)" },
          { q: "What is the name of the traditional Filipino New Year's Eve feast, eaten together with family at midnight to welcome the new year?", a: "Media Noche" }
        ]
      }
    },
    {
      name: "Slang and Expressions",
      questions: {
        100: [
          { q: "What common Filipino expression, often tacked onto the end of a statement to signal it was a joke, means roughly 'just kidding'?", a: "Charot" },
          { q: "What Filipino phrase, reflecting a laid-back, fatalistic attitude, translates roughly to 'come what may' or 'leave it to fate'?", a: "Bahala na" },
          { q: "What Filipino/Taglish slang term refers to one's boyfriend or girlfriend?", a: "Jowa" }
        ],
        200: [
          { q: "What Filipino exclamation, a contraction of 'Jesus, Maria, Jose,' is used to express shock, frustration, or exasperation?", a: "Susmaryosep" },
          { q: "What Tagalog word describes the overwhelming urge to squeeze or pinch something, or someone, because it is unbearably cute?", a: "Gigil" },
          { q: "What Tagalog word, often called untranslatable into English, describes the fluttery, giddy feeling of romantic excitement?", a: "Kilig" }
        ],
        300: [
          { q: "What Filipino slang term means casual chit-chat or gossip among friends, as in 'let's catch up on some ___'?", a: "Chika" },
          { q: "What is the Filipino term for a small neighborhood convenience store, found on nearly every residential block?", a: "Sari-sari store" },
          { q: "In Filipino jeepney culture, what word do passengers shout to signal the driver to stop and let them off?", a: "Para" }
        ],
        400: [
          { q: "The Filipino slang term 'lodi,' meaning an admirable person or idol figure, is formed by applying what wordplay technique to the word 'idol'?", a: "Spelling it backwards (letter reversal)" },
          { q: "The slang term 'petmalu,' meaning something impressively cool or extreme, is a reversed form of what Tagalog word meaning 'cruel' or 'fierce'?", a: "Malupit" },
          { q: "What term describes the internet writing style, associated with the 'jejemon' subculture of the late 2000s, of texting with excessive capitalization and altered spelling?", a: "Jejemon-speak (Jejenese)" }
        ],
        500: [
          { q: "The Filipino wordplay style of reversing syllables or letters to coin new slang, as in 'lodi' and 'petmalu,' is known among linguists by what Tagalog term?", a: "Tadbalik" },
          { q: "The slang term 'werpa,' used to cheer someone on or wish them well, is a syllabic reversal of what English word?", a: "Power" },
          { q: "What Filipino term, especially associated with sari-sari stores, describes the practice of selling goods like cigarettes, shampoo, or coffee in small, single-use retail portions rather than whole packages?", a: "Tingi" }
        ]
      }
    },
    {
      name: "History and Heritage",
      questions: {
        100: [
          { q: "Who is the Philippine national hero executed by the Spanish colonial government in 1896, celebrated for novels including 'Noli Me Tangere'?", a: "Jose Rizal" },
          { q: "The Philippines was colonized by Spain for over 300 years, beginning with the 1521 expedition of which Portuguese explorer sailing under the Spanish flag?", a: "Ferdinand Magellan" },
          { q: "What is the name of the 1986 non-violent uprising that ousted President Ferdinand Marcos and installed Corazon Aquino as president?", a: "The EDSA People Power Revolution" }
        ],
        200: [
          { q: "What Filipino chieftain of Mactan Island defeated and killed Ferdinand Magellan in battle in 1521?", a: "Lapu-Lapu" },
          { q: "What secret revolutionary society, founded in 1892 and led by Andres Bonifacio, sought independence from Spain?", a: "Katipunan" },
          { q: "On what date, now celebrated as the country's Independence Day, did Emilio Aguinaldo declare Philippine independence from Spain in 1898?", a: "June 12, 1898" }
        ],
        300: [
          { q: "After Spain ceded the Philippines to the United States following the Spanish-American War, what conflict was fought from 1899 to 1902 as Filipino revolutionaries resisted American rule?", a: "The Philippine-American War" },
          { q: "The Philippines was occupied by which country's forces during World War II, from 1942 to 1945?", a: "Japan" },
          { q: "On what date did Jose Rizal face execution by firing squad at Bagumbayan, present-day Rizal Park?", a: "December 30, 1896" }
        ],
        400: [
          { q: "The Philippines gained full independence from the United States on July 4, 1946, but Independence Day was later moved by President Diosdado Macapagal in 1962 to commemorate what earlier date instead?", a: "June 12 (the 1898 declaration of independence)" },
          { q: "What is the name of the 1896 event in which Filipino revolutionaries tore up their community tax certificates, or cedulas, as a symbolic declaration of rebellion against Spain?", a: "The Cry of Pugad Lawin (also known as the Cry of Balintawak)" },
          { q: "What indigenous pre-colonial writing system, used by early Filipinos before Spanish colonization, is sometimes inaccurately called 'alibata' though scholars prefer its original name?", a: "Baybayin" }
        ],
        500: [
          { q: "What is the term for the system of forced, unpaid labor that Spanish colonizers required of Filipino men, typically 40 days a year, on public works projects?", a: "Polo y servicio" },
          { q: "Which Philippine president declared martial law in September 1972, ruling largely by decree until being ousted in 1986?", a: "Ferdinand Marcos Sr." },
          { q: "What transitional government, established in 1935 with Manuel L. Quezon as its first president, governed the Philippines in preparation for full independence from the United States?", a: "The Commonwealth of the Philippines" }
        ]
      }
    },
    {
      name: "Filipino Entertainment",
      questions: {
        100: [
          { q: "What long-running Philippine noontime variety show, which premiered in 1979, is often considered the longest-running noontime show in the country?", a: "Eat Bulaga!" },
          { q: "What Filipino singer-actress, known as the 'Megastar,' rose to fame as a teenage singing sensation in the late 1970s?", a: "Sharon Cuneta" },
          { q: "What is the name of the Filipino komiks-turned-superheroine character, created by Mars Ravelo, who gains her powers by swallowing a magic stone?", a: "Darna" }
        ],
        200: [
          { q: "What comedic actor, born Rodolfo Vera Quizon Sr., is popularly known as the 'Comedy King' of Philippine cinema?", a: "Dolphy" },
          { q: "What noontime variety show, a rival to Eat Bulaga, premiered on ABS-CBN in 2009 and has counted Vice Ganda among its hosts?", a: "It's Showtime" },
          { q: "Which Filipina actress became the first Miss Philippines to win the Miss Universe crown, in 1969?", a: "Gloria Diaz" }
        ],
        300: [
          { q: "The 2015 'Kalyeserye' segment of Eat Bulaga launched a massive viral love team phenomenon pairing Alden Richards with Maine Mendoza's character 'Yaya Dub,' known by what portmanteau?", a: "AlDub" },
          { q: "What action star and 2004 presidential candidate, known as 'FPJ' or 'Da King,' was one of the most popular actors in Philippine cinema history?", a: "Fernando Poe Jr." },
          { q: "What is the stage name of comedian and TV host Jose Marie Borja Viceral, a longtime host of 'It's Showtime'?", a: "Vice Ganda" }
        ],
        400: [
          { q: "In 2020, the Philippine Congress voted to deny the broadcast franchise renewal of what major television network, forcing it off free-to-air TV?", a: "ABS-CBN" },
          { q: "What long-running Philippine drama anthology series, airing since 1991, dramatizes real-life, viewer-submitted stories?", a: "Maalaala Mo Kaya" },
          { q: "Which Filipina actress, known as the 'Superstar,' rose to fame in the 1970s and later starred in the acclaimed film 'Himala'?", a: "Nora Aunor" }
        ],
        500: [
          { q: "What actor plays the lead role of Cardo Dalisay in 'Ang Probinsyano,' one of the highest-rated and longest-running Philippine teleseryes?", a: "Coco Martin" },
          { q: "Which Filipina became the third Filipina to win Miss Universe, taking the crown in 2015, 42 years after the previous Filipina win?", a: "Pia Wurtzbach" },
          { q: "What long-running noontime show, hosted for years by Willie Revillame before he departed to launch rival programs, became known for its game segments in the mid-2000s?", a: "Wowowee" }
        ]
      }
    }
  ]
},
"Internet and Social Media": {
  icon: "📱",
  categories: [
    {
      name: "Memes",
      questions: {
        100: [
          { q: "What term for a viral idea, image, or video that spreads across the internet through imitation and remixing was originally coined by biologist Richard Dawkins in his 1976 book 'The Selfish Gene'?", a: "Meme" },
          { q: "What internet prank tricks someone into clicking a link that leads to Rick Astley's music video for 'Never Gonna Give You Up'?", a: "Rickrolling" },
          { q: "What grumpy-faced cat, whose real name was Tardar Sauce, became a globally famous meme after photos of her went viral in 2012?", a: "Grumpy Cat" }
        ],
        200: [
          { q: "What 2012 South Korean pop song by Psy became the first YouTube video ever to reach one billion views, thanks to its viral horse-riding dance?", a: "'Gangnam Style'" },
          { q: "What meme features a Shiba Inu dog, often named Kabosu, captioned with broken-English phrases in colorful Comic Sans, and later inspired a cryptocurrency?", a: "Doge" },
          { q: "What dance-based meme, named after a Harlem dance move, involves a video that starts with one person dancing before cutting to a wild group dance, and went viral in early 2013?", a: "The Harlem Shake" }
        ],
        300: [
          { q: "What meme features a green cartoon frog character, originally created by artist Matt Furie for his comic 'Boy's Club,' before being widely appropriated online?", a: "Pepe the Frog" },
          { q: "What 2017 stock photo meme depicts a man walking with his girlfriend while turning to ogle another woman, used to represent shifting preference or disloyalty?", a: "Distracted Boyfriend" },
          { q: "What meme pairs a photo of a crying cat at a dinner table with a photo of two stern-looking women, used to depict someone getting scolded?", a: "Woman Yelling at a Cat" }
        ],
        400: [
          { q: "What is considered one of the earliest viral internet videos, a 1996 3D-animated GIF of a boogying baby that spread via early internet forums and email years before social media existed?", a: "The Dancing Baby (Baby Cha-Cha)" },
          { q: "What rainbow-trailed animated cat meme, set to a Japanese pop song, went viral on YouTube in April 2011?", a: "Nyan Cat" },
          { q: "What 2007 viral YouTube music video, featuring an unexpectedly deep-voiced singer named Tay Zonday, became one of early YouTube's most-parodied videos?", a: "'Chocolate Rain'" }
        ],
        500: [
          { q: "What term describes an image or meme, often deliberately degraded through repeated re-uploading, oversaturation, and excessive captions, that became its own ironic aesthetic movement in the mid-2010s?", a: "Deep-fried memes" },
          { q: "The 'Loss' meme, one of the internet's most endlessly reformatted running jokes, originated from a 2008 comic strip in what webcomic?", a: "Ctrl+Alt+Del" },
          { q: "What simple black-and-white line-drawn face with a mischievous grin was created by DeviantArt artist Carlos Ramirez in 2008 and became one of the defining images of the 'rage comic' era?", a: "Trollface" }
        ]
      }
    },
    {
      name: "Social Media Platforms",
      questions: {
        100: [
          { q: "What social media platform, founded by Mark Zuckerberg in 2004, was originally launched exclusively for Harvard students before expanding to the public?", a: "Facebook" },
          { q: "What video-sharing platform, founded in 2005 and later acquired by Google, is the world's most popular website for uploading and watching videos?", a: "YouTube" },
          { q: "What short-form video app, owned by the Chinese company ByteDance, merged with the app 'musical.ly' in 2018 and went on to become one of the most downloaded apps in the world?", a: "TikTok" }
        ],
        200: [
          { q: "What photo and video-sharing app, founded by Kevin Systrom and Mike Krieger in 2010, was acquired by Facebook in 2012 for about $1 billion?", a: "Instagram" },
          { q: "What microblogging platform, founded in 2006 by Jack Dorsey and others and known for its short posts, was rebranded to 'X' after Elon Musk's 2022 acquisition?", a: "Twitter" },
          { q: "What messaging and photo-sharing app, launched in 2011, popularized disappearing photo messages and later introduced 'Stories'?", a: "Snapchat" }
        ],
        300: [
          { q: "What social news and discussion platform, launched in 2005 and often called 'the front page of the internet,' organizes content into topic-based communities called subreddits?", a: "Reddit" },
          { q: "What social networking site, founded by Jonathan Abrams and launched in 2003, became hugely popular in the Philippines, at one point drawing nearly 40% of its global traffic from the country?", a: "Friendster" },
          { q: "What professional networking platform, founded in December 2002 and launched in May 2003, is widely used for job searching, recruiting, and business networking?", a: "LinkedIn" }
        ],
        400: [
          { q: "What short-form video app, known for its looping six-second clips, was launched by Twitter in early 2013 and shut down in January 2017?", a: "Vine" },
          { q: "What social networking site, co-founded by Tom Anderson and Chris DeWolfe, was the most-visited social networking site in the world before being overtaken by Facebook around 2008-2009?", a: "MySpace" },
          { q: "What live-streaming platform, officially launched in 2011 and focused primarily on video game streaming, was acquired by Amazon in 2014?", a: "Twitch" }
        ],
        500: [
          { q: "What social networking service, launched in 1997, is often cited by historians as the first true social network, featuring user profiles and friend lists years before Friendster or MySpace existed?", a: "SixDegrees.com" },
          { q: "What social networking site, launched by Google in 2004, became enormously popular in Brazil and India despite struggling to gain traction in the United States, before being shut down in 2014?", a: "Orkut" },
          { q: "What social news and bookmarking site, launched in 2004, dominated link-sharing online until a 2010 redesign triggered a mass user exodus to Reddit?", a: "Digg" }
        ]
      }
    },
    {
      name: "Viral Trends",
      questions: {
        100: [
          { q: "What ALS-awareness fundraising trend, which went viral in the summer of 2014, involved people filming themselves being doused with a bucket of ice water and challenging others to do the same or donate?", a: "The Ice Bucket Challenge" },
          { q: "What dance trend, tied to Drake's 2018 song 'In My Feelings,' had people filming themselves dancing next to a moving car?", a: "The 'In My Feelings' Challenge (Kiki Challenge)" },
          { q: "What term describes a video, photo, or trend that spreads rapidly across the internet and is shared by huge numbers of people in a short time?", a: "Going viral" }
        ],
        200: [
          { q: "What 2015 online debate involved millions of people arguing over whether a photo of a dress appeared blue and black or white and gold?", a: "'The Dress' (#TheDress)" },
          { q: "What 2014 social media trend encouraged women to post makeup-free selfies to raise awareness and funds for cancer research, raising millions of pounds in the UK within days?", a: "No Makeup Selfie" },
          { q: "What 2015 dance craze, choreographed to the Silento song 'Watch Me,' became a viral sensation performed in classrooms and living rooms worldwide?", a: "The Whip/Nae Nae" }
        ],
        300: [
          { q: "What 2016 viral trend involved groups of people freezing completely still in dramatic poses while a camera panned through the scene, often set to Rae Sremmurd's song 'Black Beatles'?", a: "The Mannequin Challenge" },
          { q: "What 2016 meme, originating from a Snapchat video, briefly made a teenager's white Vans sneakers world-famous alongside the catchphrase that named it?", a: "'Damn, Daniel'" },
          { q: "What 2019 event, originally created as a satirical Facebook event page, jokingly called on millions of people to storm a secretive U.S. Air Force base in Nevada?", a: "'Storm Area 51'" }
        ],
        400: [
          { q: "What early 2021 stock trading phenomenon, driven largely by retail investors coordinating on the Reddit forum r/WallStreetBets, caused massive volatility and short squeezes against hedge funds shorting GameStop?", a: "The GameStop short squeeze (the GameStop/GME saga)" },
          { q: "What weekly social media trend, built around a hashtag, involves users sharing old, nostalgic photos of themselves on Thursdays?", a: "Throwback Thursday (#TBT)" },
          { q: "What 2012 viral campaign by the nonprofit Invisible Children aimed to raise awareness of Ugandan warlord Joseph Kony, becoming one of the fastest-spreading viral videos in internet history at the time?", a: "'Kony 2012'" }
        ],
        500: [
          { q: "What 2004 viral video, predating YouTube's founding, featured a young man named Gary Brolsma lip-syncing and dancing in front of his webcam to the Romanian song 'Dragostea Din Tei'?", a: "Numa Numa (the 'Numa Numa Dance')" },
          { q: "What 2008 prank and protest campaign by the hacker collective Anonymous specifically targeted the Church of Scientology and helped push rickrolling into mainstream news coverage that same year?", a: "Project Chanology" },
          { q: "What 2002-2003 viral video, one of the internet's earliest viral sensations predating YouTube, showed a Canadian teenager swinging a golf-ball retriever like a lightsaber?", a: "The 'Star Wars Kid' video" }
        ]
      }
    },
    {
      name: "Internet Slang",
      questions: {
        100: [
          { q: "What common internet and text abbreviation stands for 'laughing out loud'?", a: "LOL" },
          { q: "What internet slang term describes something embarrassing or awkward, often used to react to secondhand-embarrassment videos or posts?", a: "Cringe" },
          { q: "What internet acronym, commonly used to end a message when someone won't be available for a while, stands for 'be right back'?", a: "BRB" }
        ],
        200: [
          { q: "What internet slang term, short for 'fear of missing out,' describes the anxious feeling that others are having rewarding experiences without you?", a: "FOMO" },
          { q: "What slang term for an obsessive, overly devoted super-fan of a celebrity originated from a 2000 Eminem song about an obsessive fan named Stan?", a: "Stan" },
          { q: "What slang term describes feeling bitter, irritated, or resentful, especially after losing or being embarrassed?", a: "Salty" }
        ],
        300: [
          { q: "What internet slang term, a blend of 'sympathize' and 'simpleton,' describes someone showing excessive, often desperate devotion toward a person they're attracted to?", a: "Simp" },
          { q: "What acronym, popular in online gaming and chat culture, stands for 'away from keyboard'?", a: "AFK" },
          { q: "What slang term, popularized by a 2014 Vine video of a woman describing her eyebrows, means that something is done perfectly or looks flawless?", a: "On fleek" }
        ],
        400: [
          { q: "What dismissive internet slang phrase, aimed at older generations or outdated attitudes, went viral in 2019 partly through TikTok and briefly drew accusations of ageism?", a: "'OK Boomer'" },
          { q: "What internet slang word, an exclamation with no fixed meaning used to express surprise, excitement, or approval, went viral around 2014 through Vine culture?", a: "Yeet" },
          { q: "On Twitter/X, what slang term describes a reply to a post receiving significantly more likes than the original post, generally implying the original post was poorly received?", a: "Getting 'ratioed' (the ratio)" }
        ],
        500: [
          { q: "What early internet and Usenet-era acronym, still used in chat and gaming today, stands for 'in real life,' distinguishing physical-world identity or events from online ones?", a: "IRL" },
          { q: "What term, originating in 1990s online chat culture from the word 'elite,' refers to skilled internet or gaming users and gave rise to a numeral-substitution writing style?", a: "Leet (1337 speak)" },
          { q: "What slang term for an intentionally provocative online post designed to provoke an angry reaction, giving rise to the phrase 'don't feed the ___,' dates back to Usenet and early internet forum culture of the 1990s?", a: "Troll (trolling)" }
        ]
      }
    },
    {
      name: "Content Creators",
      questions: {
        100: [
          { q: "Which YouTuber, known for elaborate stunt and giveaway videos, became the most-subscribed individual channel on YouTube after overtaking T-Series in 2024?", a: "MrBeast (Jimmy Donaldson)" },
          { q: "Which Swedish YouTuber, known for gaming commentary and 'Let's Play' videos, became the first individual creator to reach 100 million subscribers, in 2019?", a: "PewDiePie (Felix Kjellberg)" },
          { q: "What is the general term for someone who broadcasts themselves playing video games or other activities live over the internet, popularized by platforms like Twitch?", a: "A streamer" }
        ],
        200: [
          { q: "Which American YouTuber, known for prank and vlog content since the mid-2010s and later a professional boxer, has an older brother named Logan who is also a famous YouTuber?", a: "Jake Paul" },
          { q: "Which YouTuber is widely credited as one of the pioneers of the beauty and makeup tutorial genre, building a massive following starting in 2007 before launching her own cosmetics line?", a: "Michelle Phan" },
          { q: "What term describes a content creator who primarily posts unscripted, personal day-in-the-life videos, a genre popularized on YouTube in the 2000s and 2010s?", a: "A vlogger (video blogger)" }
        ],
        300: [
          { q: "Which American streamer, known for popularizing Fortnite content, broke Twitch's concurrent-viewership record in March 2018 during a stream featuring rapper Drake?", a: "Ninja (Tyler Blevins)" },
          { q: "Which British YouTuber, who began his channel in 2009 posting FIFA video game commentary and later co-founded the YouTube group 'The Sidemen,' transitioned into professional boxing in the late 2010s?", a: "KSI (Olajide 'JJ' Olatunji)" },
          { q: "What term, borrowed from Korean internet culture, describes a genre of online video in which a host eats a large quantity of food while interacting with viewers?", a: "Mukbang" }
        ],
        400: [
          { q: "Which YouTube channel, run by the duo Rhett McLaughlin and Charles 'Link' Neal, is known for its long-running daily talk and variety show that began on YouTube in 2012?", a: "Good Mythical Morning (Rhett & Link)" },
          { q: "Which Canadian YouTuber, known for long-form video essays on internet culture, conspiracy theories, and media criticism, hosts the channel 'Folding Ideas'?", a: "Dan Olson" },
          { q: "MrBeast's name originated from a nickname randomly assigned to him as a teenager by which video game console's system, which he later shortened from 'MrBeast6000'?", a: "Xbox" }
        ],
        500: [
          { q: "Which comedy YouTube duo, Ian Hecox and Anthony Padilla, was the first channel to reach 100,000 subscribers and held YouTube's 'most subscribed' title for over 500 consecutive days in the mid-2000s?", a: "Smosh" },
          { q: "Which YouTube comedy duo, Ethan and Hila Klein, won a landmark 2017 court ruling establishing that their reaction commentary videos qualified as fair use under U.S. copyright law?", a: "H3H3 Productions" },
          { q: "Which YouTuber, one of the platform's original breakout comedy stars with over 20 million subscribers, announced her retirement from YouTube in June 2020 after backlash over old videos resurfaced?", a: "Jenna Marbles (Jenna Mourey)" }
        ]
      }
    }
  ]
}
};

// Groups themes for the theme-selection screen. Any theme not listed here
// (e.g. a future addition) automatically falls into a "More Themes" group,
// so new themes can be added to QUIZ_THEMES above without touching this map.
export const QUIZ_THEME_GROUPS = {
  "Pop Culture": ["Cartoons", "Marvel", "Anime", "Movies & TV", "Video Games", "Studio Ghibli", "Sitcoms", "It's Always Sunny in Philadelphia", "Marvel Cinematic Universe", "Harry Potter", "Disney", "Star Wars", "Lord of the Rings"],
  "Music": ["Music"],
  "Academic & Local": ["College Programs", "Philippine Trivia", "E-Commerce", "Filipino Culture"],
  "General Knowledge": ["World Geography", "Science", "World Trivia", "History", "Technology", "Food", "Famous People", "Sports", "Internet and Social Media"]
};

// Quiz Night bonus tile events. Adding a new event here is enough to put it
// into rotation — no other code needs to change. `requiresOpponent: true`
// excludes an event from the draw when fewer than 2 teams are playing, so a
// solo board never rolls something it can't resolve.
export const QUIZ_BONUS_EVENTS = [
  { type: "points", icon: "⭐", name: "Bonus Points", desc: "A burst of good luck — free points, no question required." },
  { type: "double", icon: "✌️", name: "Double Points", desc: "This team's next correct answer is worth double points." },
  { type: "steal", icon: "🥷", name: "Steal", desc: "Take points from a rival team.", requiresOpponent: true },
  { type: "risk", icon: "🎲", name: "Risk It", desc: "Wager points on a coin flip — double or nothing.", requiresOpponent: true },
  { type: "freepass", icon: "🎟️", name: "Free Pass", desc: "Bank a one-time pass to claim credit for a missed question later." },
  { type: "lucky", icon: "🍀", name: "Lucky Draw", desc: "The fates decide — could be a windfall, could be nothing." }
];
