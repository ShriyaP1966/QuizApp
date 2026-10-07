/* Question bank.
   Each entry: [question, options, indexOfCorrectOption, hint, explanation]
   Options are shuffled at quiz time; the correct answer is tracked by its text. */
(function (root) {
  const BANK = {
    'General Knowledge': {
      Easy: [
        ['How many days are in a leap year?', ['365', '366', '364', '367'], 1,
          'It is exactly one more than a normal year.', 'A leap year adds 29 February, giving 366 days.'],
        ['Which colour do you get by mixing blue and yellow paint?', ['Green', 'Purple', 'Orange', 'Brown'], 0,
          'Think of the colour of grass.', 'Blue and yellow are subtractive primaries that combine to green.'],
        ['How many continents are there in the most common convention?', ['5', '6', '7', '8'], 2,
          'Asia, Africa, Europe, Oceania, Antarctica and two Americas.', 'The most widely used model counts seven continents.'],
        ['How many strings does a standard guitar have?', ['4', '5', '6', '7'], 2,
          'A bass guitar has fewer; a standard guitar has one more than five.', 'A standard guitar is tuned E-A-D-G-B-E: six strings.'],
        ['What is the largest mammal in the world?', ['African elephant', 'Blue whale', 'Giraffe', 'Hippopotamus'], 1,
          'It lives in the ocean.', 'The blue whale can exceed 25 metres in length.'],
        ['Which language has the most native speakers worldwide?', ['English', 'Spanish', 'Mandarin Chinese', 'Hindi'], 2,
          'It is spoken mainly in China.', 'Mandarin Chinese has the most native speakers of any language.']
      ],
      Medium: [
        ['Which country has a national flag that is neither rectangular nor square?', ['Nepal', 'Bhutan', 'Switzerland', 'Vatican City'], 0,
          'It is a Himalayan country, and its flag is two stacked pennants.', 'Nepal’s flag is the only non-quadrilateral national flag.'],
        ['Who painted “The Starry Night”?', ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Salvador Dalí'], 1,
          'A Dutch post-impressionist painter.', 'Van Gogh painted it in 1889 while staying in Saint-Rémy-de-Provence.'],
        ['What is the currency of Japan?', ['Yuan', 'Won', 'Yen', 'Ringgit'], 2,
          'Its symbol is ¥.', 'The Japanese yen (JPY) is the national currency.'],
        ['In which year were the first modern Summer Olympic Games held, in Athens?', ['1896', '1900', '1912', '1924'], 0,
          'It was in the final decade of the 19th century.', 'The first modern Olympics took place in Athens in 1896.'],
        ['Which instrument has 88 keys on a standard full-size model?', ['Organ', 'Piano', 'Accordion', 'Harp'], 1,
          'It has black and white keys and hammers inside.', 'A standard piano has 52 white and 36 black keys.'],
        ['What is the hardest naturally occurring substance?', ['Quartz', 'Diamond', 'Topaz', 'Steel'], 1,
          'It is a form of pure carbon.', 'Diamond tops the Mohs hardness scale at 10.']
      ],
      Hard: [
        ['Who wrote “One Hundred Years of Solitude”?', ['Jorge Luis Borges', 'Pablo Neruda', 'Gabriel García Márquez', 'Mario Vargas Llosa'], 2,
          'A Colombian Nobel laureate associated with magical realism.', 'García Márquez published it in 1967 and won the Nobel Prize in 1982.'],
        ['Which is the smallest country in the world by area?', ['Monaco', 'San Marino', 'Vatican City', 'Liechtenstein'], 2,
          'It sits inside Rome.', 'Vatican City covers about 0.44 km².'],
        ['Who composed “The Four Seasons”?', ['Johann Sebastian Bach', 'Antonio Vivaldi', 'George Frideric Handel', 'Wolfgang Amadeus Mozart'], 1,
          'He was a Baroque composer from Venice.', 'Vivaldi composed the four violin concertos around 1720.'],
        ['Which Japanese poetic form has three lines in a 5-7-5 syllable pattern?', ['Haiku', 'Sonnet', 'Limerick', 'Ode'], 0,
          'It is famous for its brevity and nature imagery.', 'The haiku is a short Japanese form built on a 5-7-5 pattern.'],
        ['Which Nobel Prize category was added in 1968 by the Bank of Sweden?', ['Literature', 'Peace', 'Economic Sciences', 'Physiology or Medicine'], 2,
          'It is about markets and money.', 'The Prize in Economic Sciences was first awarded in 1969.'],
        ['Who painted “Guernica”?', ['Salvador Dalí', 'Pablo Picasso', 'Joan Miró', 'Francisco Goya'], 1,
          'It depicts the 1937 bombing of a Basque town during the Spanish Civil War.', 'Picasso painted Guernica in 1937.']
      ]
    },

    'Science': {
      Easy: [
        ['Which planet is known as the Red Planet?', ['Venus', 'Mars', 'Jupiter', 'Mercury'], 1,
          'Iron oxide on its surface gives it the colour. It is the fourth planet from the Sun.', 'Mars looks red because of iron oxide (rust) in its soil.'],
        ['Which gas do plants absorb from the air for photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 2,
          'Humans breathe it out.', 'Plants use carbon dioxide, water and light to make glucose and oxygen.'],
        ['How many legs does an insect have?', ['4', '6', '8', '10'], 1,
          'Spiders have eight; insects have fewer.', 'Insects have three body segments and six legs.'],
        ['Which organ pumps blood around the human body?', ['Lungs', 'Liver', 'Heart', 'Kidney'], 2,
          'It beats around 100,000 times a day.', 'The heart is a muscular pump that circulates blood.'],
        ['At what temperature in °C does pure water freeze at standard pressure?', ['-10', '0', '10', '32'], 1,
          '32 is the Fahrenheit answer, not the Celsius one.', 'Water freezes at 0 °C (32 °F).'],
        ['What is the closest star to Earth?', ['Sirius', 'Alpha Centauri', 'The Sun', 'Polaris'], 2,
          'You see it every day.', 'The Sun is about 150 million km away.']
      ],
      Medium: [
        ['What is the chemical symbol for gold?', ['Go', 'Gd', 'Au', 'Ag'], 2,
          'It comes from the Latin word “aurum”.', 'Au is from Latin aurum; Ag (silver) is argentum.'],
        ['Which planet has the most prominent ring system?', ['Jupiter', 'Saturn', 'Mars', 'Earth'], 1,
          'It is the sixth planet from the Sun.', 'Saturn’s rings are made mostly of ice particles.'],
        ['Which organelle is known as the powerhouse of the cell?', ['Nucleus', 'Ribosome', 'Mitochondrion', 'Golgi apparatus'], 2,
          'It produces most of the cell’s ATP.', 'Mitochondria generate ATP through cellular respiration.'],
        ['Which force keeps the planets in orbit around the Sun?', ['Magnetism', 'Friction', 'Gravity', 'Nuclear force'], 2,
          'Newton connected it to a falling apple.', 'The Sun’s gravity holds the planets in their orbits.'],
        ['What is the most abundant gas in Earth’s atmosphere?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'], 1,
          'It makes up roughly 78% of air.', 'Nitrogen is about 78% of the atmosphere; oxygen about 21%.'],
        ['Which subatomic particles carry a negative electric charge?', ['Protons', 'Neutrons', 'Electrons', 'Photons'], 2,
          'They orbit the nucleus.', 'Electrons are negative, protons positive, neutrons neutral.']
      ],
      Hard: [
        ['Approximately how fast does light travel in a vacuum?', ['3,000 km/s', '30,000 km/s', '300,000 km/s', '3,000,000 km/s'], 2,
          'About 3 × 10⁸ metres per second.', 'The speed of light is roughly 299,792 km/s.'],
        ['Which element has the atomic number 26?', ['Copper', 'Iron', 'Nickel', 'Cobalt'], 1,
          'Its symbol is Fe.', 'Iron (Fe) has 26 protons.'],
        ['What kind of chemical bond involves atoms sharing pairs of electrons?', ['Ionic', 'Covalent', 'Metallic', 'Hydrogen'], 1,
          'Water molecules contain this type of bond between H and O.', 'Covalent bonds form by sharing electron pairs.'],
        ['What is the SI unit of electrical resistance?', ['Volt', 'Ampere', 'Ohm', 'Watt'], 2,
          'It is named after Georg Simon, and written Ω.', 'The ohm (Ω) is defined as one volt per ampere.'],
        ['Which molecule carries genetic instructions from DNA to the ribosome for protein synthesis?', ['tRNA', 'mRNA', 'rRNA', 'ATP'], 1,
          'The “m” stands for “messenger”.', 'Messenger RNA (mRNA) is the template that ribosomes read.'],
        ['What is the approximate age of the universe?', ['4.5 billion years', '13.8 billion years', '46 billion years', '100 billion years'], 1,
          'Measured from the Big Bang using the cosmic microwave background.', 'Current estimates put the universe at about 13.8 billion years old.']
      ]
    },

    'Technology': {
      Easy: [
        ['What does “HTML” stand for?', ['HyperText Markup Language', 'High Transfer Machine Language', 'HyperTool Multi Language', 'Home Text Markup Level'], 0,
          'It is a markup language for the web.', 'HTML = HyperText Markup Language.'],
        ['Which input type provides built-in validation for email addresses in modern browsers?', ['text', 'email', 'mail', 'address'], 1,
          'The type name is the thing you are validating.', 'type="email" validates the format and shows a suitable keyboard on mobile.'],
        ['Which attribute gives an informative image a text alternative for screen readers?', ['role', 'title', 'alt', 'aria-label'], 2,
          'It is the standard attribute on the <img> element.', 'The alt attribute describes an image’s content.'],
        ['What does CPU stand for?', ['Central Processing Unit', 'Computer Personal Unit', 'Core Program Utility', 'Central Program Usage'], 0,
          'It is the “brain” of a computer.', 'CPU = Central Processing Unit.'],
        ['Which HTML element is semantically correct for wrapping the main navigation links of a page?', ['<nav>', '<menu>', '<navigation>', '<links>'], 0,
          'The element name is a short form of “navigation”.', 'The <nav> element marks a section of navigation links.'],
        ['Which language runs in the browser to add interactivity to web pages?', ['JavaScript', 'SQL', 'Markdown', 'YAML'], 0,
          'It is not related to coffee, despite the name.', 'JavaScript is the scripting language of the web.']
      ],
      Medium: [
        ['What is the effect of the CSS declaration “box-sizing: border-box”?', ['Padding and border are included in the element’s width and height', 'Padding is excluded from width but border is included', 'Only the border is included in the width', 'It resets all default browser margins'], 0,
          'The name tells you what box is being measured.', 'With border-box, width and height include padding and border.'],
        ['Which selector matches elements with class “btn” that are direct children of a div?', ['div .btn', 'div > .btn', '.btn > div', 'div .btn:first-child'], 1,
          'One specific combinator means “direct child”.', 'The > combinator selects direct children only.'],
        ['Which meta tag enables responsive scaling on mobile devices?', ['<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="mobile" content="yes">', '<meta charset="utf-8">', '<meta http-equiv="X-UA-Compatible" content="IE=edge">'], 0,
          'Look for the one that mentions width and scale.', 'The viewport meta tag controls how the page scales on small screens.'],
        ['In CSS Grid, which declaration gives a fixed 200px first column and a second column that takes the remaining space?', ['grid-template-columns: 200px 1fr;', 'grid-template-columns: 200px auto;', 'grid-template-columns: 1fr 200px;', 'grid-template-columns: repeat(2, 1fr);'], 0,
          'The fr unit means “fraction of free space”.', '200px then 1fr fixes the first column and lets the second stretch.'],
        ['What does the HTTP status code 404 mean?', ['Server error', 'Not Found', 'Forbidden', 'Moved Permanently'], 1,
          'The requested resource could not be located.', '404 Not Found: the server cannot find the requested resource.'],
        ['Which Git command creates a local copy of a remote repository?', ['git fork', 'git clone', 'git copy', 'git pull'], 1,
          'It downloads the whole repository and its history.', 'git clone copies a remote repository to your machine.']
      ],
      Hard: [
        ['What does the CSS declaration “contain: layout;” do?', ['Isolates layout so changes inside don’t affect layout outside the element', 'Prevents any painting of the element', 'Makes the element a fixed-position container', 'Forces hardware acceleration'], 0,
          'It is a performance hint about layout calculations.', 'contain: layout lets the browser skip re-laying out the rest of the page.'],
        ['Which declaration does NOT, on its own, create a new stacking context?', ['transform: translateZ(0)', 'opacity: 0.9', 'position: relative (with z-index: auto)', 'position: fixed'], 2,
          'Without a z-index value, this positioning keyword does not isolate the element.', 'A relatively positioned element with z-index auto does not form a stacking context.'],
        ['What does “typeof null” return in JavaScript?', ['"null"', '"undefined"', '"object"', '"number"'], 2,
          'This is a well-known quirk from the first version of the language.', 'typeof null === "object" is a long-standing historical bug.'],
        ['Which HTTP method is idempotent and typically used to fully replace a resource?', ['GET', 'POST', 'PUT', 'DELETE'], 2,
          'Sending it twice leaves the server in the same state as sending it once.', 'PUT replaces the target resource with the request payload.'],
        ['What is the time complexity of binary search on a sorted array of n elements?', ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], 1,
          'Each step halves the search space.', 'Binary search halves the range each step: O(log n).'],
        ['What does aria-live="polite" do on an element?', ['Hides it from assistive technology', 'Announces updates when the user is idle', 'Interrupts the user immediately with updates', 'Makes the element focusable'], 1,
          'The opposite of “assertive”.', 'A polite live region waits for a pause before announcing changes.']
      ]
    },

    'Mathematics': {
      Easy: [
        ['What is 7 × 8?', ['54', '56', '58', '64'], 1,
          'It is just below 7 × 9 = 63 by seven.', '7 × 8 = 56.'],
        ['What is 15% of 200?', ['15', '20', '30', '35'], 2,
          '10% of 200 is 20; add half of that.', '0.15 × 200 = 30.'],
        ['What is the square root of 81?', ['7', '8', '9', '10'], 2,
          'It is the number that multiplied by itself gives 81.', '9 × 9 = 81.'],
        ['How many sides does a hexagon have?', ['5', '6', '7', '8'], 1,
          '“Hex” means six.', 'A hexagon has six sides.'],
        ['What is 100 ÷ 4?', ['20', '24', '25', '40'], 2,
          'Think of quarters of a dollar.', '100 ÷ 4 = 25.'],
        ['Which of these numbers is prime?', ['21', '27', '29', '33'], 2,
          'The other three are all multiples of 3.', '29 has no divisors other than 1 and itself.']
      ],
      Medium: [
        ['What is the sum of the interior angles of a triangle?', ['90°', '180°', '270°', '360°'], 1,
          'Two right angles added together.', 'Any triangle’s interior angles sum to 180°.'],
        ['Solve for x: 3x + 5 = 20', ['3', '4', '5', '15'], 2,
          'Subtract 5 from both sides first.', '3x = 15, so x = 5.'],
        ['What is the area of a circle with radius 3?', ['6π', '9π', '3π', '18π'], 1,
          'Area = πr².', 'π × 3² = 9π.'],
        ['What is 2¹⁰ (2 to the power of 10)?', ['512', '1000', '1024', '2048'], 2,
          'It is the number of bytes in a kibibyte.', '2¹⁰ = 1024.'],
        ['What is the next number in the sequence 2, 4, 8, 16, …?', ['24', '30', '32', '64'], 2,
          'Each term is double the previous one.', 'The sequence doubles each time, so the next is 32.'],
        ['Which Roman numeral represents 40?', ['XL', 'LX', 'XXXX', 'VL'], 0,
          'It is 10 placed before 50.', 'XL = 50 − 10 = 40.']
      ],
      Hard: [
        ['What is the derivative of x³ with respect to x?', ['x²', '3x²', '3x', 'x³/3'], 1,
          'Bring the exponent down and subtract one from it.', 'By the power rule, d/dx x³ = 3x².'],
        ['What is 5! (5 factorial)?', ['25', '60', '120', '720'], 2,
          '5 × 4 × 3 × 2 × 1.', '5! = 120.'],
        ['What is log₁₀(1000)?', ['2', '3', '10', '100'], 1,
          'How many times do you multiply 10 by itself to get 1000?', '10³ = 1000, so log₁₀(1000) = 3.'],
        ['What is the sum of all integers from 1 to 100?', ['4950', '5000', '5050', '5100'], 2,
          'Pair 1 with 100, 2 with 99, and so on.', 'n(n+1)/2 = 100 × 101 / 2 = 5050.'],
        ['What are the solutions of x² − 5x + 6 = 0?', ['1 and 6', '2 and 3', '−2 and −3', '−1 and 6'], 1,
          'Find two numbers that multiply to 6 and add to 5.', 'x² − 5x + 6 = (x − 2)(x − 3).'],
        ['What is sin(90°)?', ['0', '0.5', '1', '−1'], 2,
          'It is the maximum value of the sine function.', 'sin(90°) = 1.']
      ]
    },

    'History': {
      Easy: [
        ['Who was the first President of the United States?', ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], 1,
          'He is on the one-dollar bill.', 'George Washington served from 1789 to 1797.'],
        ['Which ancient civilisation built the pyramids of Giza?', ['Romans', 'Greeks', 'Egyptians', 'Mayans'], 2,
          'They lived along the Nile.', 'The Great Pyramid was built by the ancient Egyptians around 2560 BCE.'],
        ['In which year did World War II end?', ['1918', '1939', '1945', '1950'], 2,
          'The middle of the 1940s.', 'WWII ended in 1945.'],
        ['Which explorer reached the Americas in 1492 on a voyage sponsored by Spain?', ['Vasco da Gama', 'Christopher Columbus', 'Ferdinand Magellan', 'James Cook'], 1,
          '“In fourteen hundred ninety-two…”', 'Columbus landed in the Bahamas in October 1492.'],
        ['Which wall fell in 1989, symbolising the end of the division of Germany?', ['Great Wall', 'Hadrian’s Wall', 'Berlin Wall', 'Western Wall'], 2,
          'It split a German capital city in two.', 'The Berlin Wall fell on 9 November 1989.'],
        ['Who led India’s non-violent campaign for independence from British rule?', ['Mahatma Gandhi', 'Subhas Chandra Bose', 'Bhagat Singh', 'Jawaharlal Nehru'], 0,
          'He is known as the Father of the Nation.', 'Gandhi led campaigns such as the Salt March of 1930.']
      ],
      Medium: [
        ['In which year did the French Revolution begin?', ['1689', '1776', '1789', '1815'], 2,
          'The Bastille was stormed that year.', 'The French Revolution began in 1789.'],
        ['Who was the first person to walk on the Moon?', ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard'], 2,
          'Apollo 11, 1969.', 'Neil Armstrong stepped onto the Moon on 20 July 1969.'],
        ['Which treaty formally ended World War I between the Allies and Germany?', ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of Vienna', 'Treaty of Tordesillas'], 0,
          'It was signed in a palace near Paris in 1919.', 'The Treaty of Versailles was signed on 28 June 1919.'],
        ['In which country did the Industrial Revolution begin?', ['France', 'Germany', 'Great Britain', 'United States'], 2,
          'Textiles and steam engines in the late 1700s.', 'The Industrial Revolution began in Great Britain in the 18th century.'],
        ['Who was Prime Minister of the United Kingdom from 1940 to 1945?', ['Neville Chamberlain', 'Winston Churchill', 'Clement Attlee', 'Margaret Thatcher'], 1,
          'He gave the “we shall fight on the beaches” speech.', 'Churchill led Britain through most of World War II.'],
        ['Which ancient wonder stood in the Egyptian city of Alexandria?', ['Hanging Gardens', 'Lighthouse (Pharos)', 'Colossus', 'Temple of Artemis'], 1,
          'It guided ships into the harbour.', 'The Lighthouse of Alexandria was one of the Seven Wonders of the Ancient World.']
      ],
      Hard: [
        ['In which year was the Magna Carta sealed by King John?', ['1066', '1215', '1348', '1415'], 1,
          'Early 13th century.', 'King John agreed to the Magna Carta at Runnymede in 1215.'],
        ['Which Mughal emperor commissioned the Taj Mahal?', ['Akbar', 'Babur', 'Shah Jahan', 'Aurangzeb'], 2,
          'He built it in memory of his wife Mumtaz Mahal.', 'Shah Jahan commissioned it in 1632.'],
        ['Who won the Battle of Hastings in 1066?', ['Harold Godwinson', 'William of Normandy', 'Canute', 'Alfred the Great'], 1,
          'He is also known as “the Conqueror”.', 'William of Normandy defeated King Harold and became King of England.'],
        ['In which year did the Soviet Union dissolve?', ['1985', '1989', '1991', '1999'], 2,
          'It was the first year of the 1990s.', 'The USSR was formally dissolved in December 1991.'],
        ['Who became the first emperor of a unified China in 221 BCE?', ['Qin Shi Huang', 'Liu Bang', 'Kublai Khan', 'Sun Yat-sen'], 0,
          'His dynasty gave China its name in many languages.', 'Qin Shi Huang unified China and founded the Qin dynasty.'],
        ['Which 1648 peace agreements ended the Thirty Years’ War?', ['Peace of Westphalia', 'Congress of Vienna', 'Treaty of Utrecht', 'Peace of Augsburg'], 0,
          'It is named after a region of Germany.', 'The Peace of Westphalia is often seen as the start of the modern state system.']
      ]
    },

    'Geography': {
      Easy: [
        ['What is the capital city of France?', ['Lyon', 'Marseille', 'Paris', 'Nice'], 2,
          'The Eiffel Tower is there.', 'Paris is the capital of France.'],
        ['Which is the largest ocean on Earth?', ['Atlantic', 'Indian', 'Arctic', 'Pacific'], 3,
          'Its name means “peaceful”.', 'The Pacific covers about a third of the planet’s surface.'],
        ['On which continent is Egypt located?', ['Asia', 'Africa', 'Europe', 'South America'], 1,
          'The Nile flows north through this continent.', 'Egypt is in north-eastern Africa.'],
        ['Which is the largest hot desert in the world?', ['Gobi', 'Kalahari', 'Sahara', 'Arabian'], 2,
          'It covers much of North Africa.', 'The Sahara covers roughly 9 million km².'],
        ['What is the capital city of Japan?', ['Osaka', 'Kyoto', 'Tokyo', 'Nagoya'], 2,
          'It has been the capital since 1868.', 'Tokyo is Japan’s capital.'],
        ['Which mountain has the highest peak above sea level?', ['K2', 'Mount Everest', 'Kangchenjunga', 'Mont Blanc'], 1,
          'It is on the border of Nepal and Tibet.', 'Everest reaches 8,849 m above sea level.']
      ],
      Medium: [
        ['What is the capital of Australia?', ['Sydney', 'Melbourne', 'Canberra', 'Perth'], 2,
          'It is not the largest city; it was purpose-built as a compromise.', 'Canberra was chosen as a compromise between Sydney and Melbourne.'],
        ['Which river flows through the city of Cairo?', ['Tigris', 'Nile', 'Congo', 'Niger'], 1,
          'It is among the longest rivers in the world.', 'Cairo sits on the banks of the Nile.'],
        ['Marrakech is a major city in which country?', ['Tunisia', 'Algeria', 'Morocco', 'Libya'], 2,
          'It lies at the foot of the Atlas Mountains.', 'Marrakech is in western Morocco.'],
        ['Which is the largest country in the world by area?', ['Canada', 'China', 'United States', 'Russia'], 3,
          'It spans eleven time zones.', 'Russia covers over 17 million km².'],
        ['Which strait separates Europe from Africa at the western end of the Mediterranean?', ['Bosphorus', 'Strait of Gibraltar', 'Strait of Hormuz', 'Dardanelles'], 1,
          'It is named after a famous rock.', 'The Strait of Gibraltar is only about 14 km wide at its narrowest.'],
        ['What is the capital of Canada?', ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], 2,
          'It is not the largest city, and sits on the border of Ontario and Quebec.', 'Ottawa is Canada’s capital.']
      ],
      Hard: [
        ['What is the capital of Kazakhstan?', ['Almaty', 'Astana', 'Tashkent', 'Bishkek'], 1,
          'It was called Nur-Sultan from 2019 to 2022.', 'Astana became the capital in 1997.'],
        ['Which is the deepest known ocean trench?', ['Puerto Rico Trench', 'Java Trench', 'Mariana Trench', 'Tonga Trench'], 2,
          'It is in the western Pacific, near Guam.', 'The Challenger Deep in the Mariana Trench is about 10,900 m deep.'],
        ['Addis Ababa is the capital of which country?', ['Kenya', 'Ethiopia', 'Nigeria', 'Sudan'], 1,
          'It lies in the Horn of Africa.', 'Addis Ababa is Ethiopia’s capital and the seat of the African Union.'],
        ['Lake Titicaca lies on the border of Peru and which other country?', ['Chile', 'Ecuador', 'Bolivia', 'Argentina'], 2,
          'It is a landlocked Andean country.', 'Lake Titicaca is shared by Peru and Bolivia.'],
        ['Which is the largest island in the world that is not a continent?', ['Borneo', 'Madagascar', 'Greenland', 'New Guinea'], 2,
          'It is mostly covered by ice.', 'Greenland is the largest island by area.'],
        ['Which country has the most time zones, counting its overseas territories?', ['Russia', 'United States', 'France', 'China'], 2,
          'Overseas territories in the Pacific, Indian and Atlantic oceans count.', 'France has the most time zones thanks to its overseas territories.']
      ]
    }
  };

  const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
  const list = [];
  Object.keys(BANK).forEach(function (category) {
    DIFFICULTIES.forEach(function (difficulty) {
      (BANK[category][difficulty] || []).forEach(function (row, i) {
        list.push({
          id: category + '|' + difficulty + '|' + i,
          category: category,
          difficulty: difficulty,
          question: row[0],
          options: row[1].slice(),
          answer: row[1][row[2]],
          hint: row[3],
          explanation: row[4]
        });
      });
    });
  });

  if (typeof module === 'object' && module.exports) module.exports = list;
  else root.QUIZ_QUESTIONS = list;
})(typeof self !== 'undefined' ? self : this);
