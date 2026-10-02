/* ASTRO — lore database */
window.LORE = (function () {
  const SIGNS = [
    { name: 'Aries', glyph: '\u2648', dates: 'Mar 21 – Apr 19', element: 'Fire', mode: 'Cardinal', ruler: 'Mars', color: '#ff4d4d', animal: 'The Ram',
      keywords: ['Bold', 'Driven', 'Impatient'], best: ['Leo', 'Sagittarius', 'Gemini'],
      sun: 'Your core self is a spark: direct, courageous, and happiest when starting something new. You lead by doing, and you learn by charging in first.',
      moon: 'Emotionally you run hot and fast. You need action and independence to feel safe, and your feelings flare up and cool off quickly.',
      rising: 'You come across as energetic, frank, and ready to go. People sense your confidence before you say a word.',
      sunU: 'You were born with the factory setting "START FIGHT." You have opened 47 projects and finished zero, and honestly? Iconic.',
      moonU: 'Your feelings are a microwave burrito: lava in the middle, frozen at the edges, done in 90 seconds.',
      risingU: 'You walk into rooms like you are about to return something without a receipt. Everyone moves.' },
    { name: 'Taurus', glyph: '\u2649', dates: 'Apr 20 – May 20', element: 'Earth', mode: 'Fixed', ruler: 'Venus', color: '#5fd068', animal: 'The Bull',
      keywords: ['Steady', 'Sensual', 'Stubborn'], best: ['Virgo', 'Capricorn', 'Cancer'],
      sun: 'Your core self is grounded and loyal. You build slowly and well, value comfort and beauty, and once you commit, you are immovable.',
      moon: 'You need security, routine, and physical comfort to feel okay. Good food, soft fabrics, and reliable people restore you.',
      rising: 'You come across as calm, warm, and unhurried. People find your presence reassuring and a little magnetic.',
      sunU: 'You have the energy of a very expensive couch that refuses to be moved. Bribe-able exclusively with bread.',
      moonU: 'Emotional support system: one (1) blanket, three (3) snacks, and zero (0) plans to change anything ever.',
      risingU: 'You look like you smell like a candle called "Cashmere Nap." You do. We checked.' },
    { name: 'Gemini', glyph: '\u264A', dates: 'May 21 – Jun 20', element: 'Air', mode: 'Mutable', ruler: 'Mercury', color: '#ffd93d', animal: 'The Twins',
      keywords: ['Curious', 'Witty', 'Restless'], best: ['Libra', 'Aquarius', 'Aries'],
      sun: 'Your core self is curious and quick. You collect ideas, people, and stories, and you thrive on conversation and variety.',
      moon: 'You process feelings by talking and thinking them through. Mental stimulation soothes you; boredom unsettles you.',
      rising: 'You come across as chatty, bright, and youthful. People see you as easy to talk to and fun to be around.',
      sunU: 'You have 84 browser tabs open in your soul and one of them is playing music and you cannot find which.',
      moonU: 'You feel feelings in group-chat format. Each emotion has a different typing bubble.',
      risingU: 'You introduce yourself and somehow end up knowing the barista\u2019s whole divorce. Twice.' },
    { name: 'Cancer', glyph: '\u264B', dates: 'Jun 21 – Jul 22', element: 'Water', mode: 'Cardinal', ruler: 'Moon', color: '#a0c4ff', animal: 'The Crab',
      keywords: ['Nurturing', 'Intuitive', 'Protective'], best: ['Scorpio', 'Pisces', 'Taurus'],
      sun: 'Your core self is caring and deeply feeling. Home, family, and memory matter to you, and you protect your people fiercely.',
      moon: 'The Moon is at home here: your emotions are deep, tidal, and intuitive. You need closeness and a safe nest to recharge.',
      rising: 'You come across as gentle, approachable, and a bit reserved at first. People feel looked after around you.',
      sunU: 'You are a mom to everyone including your houseplants, your coworkers, and a raccoon you saw one time.',
      moonU: 'You cried at a commercial for insurance. It was about a dog. It was a good dog. You are still not okay.',
      risingU: 'Hard shell, soft middle, will absolutely pinch you if you insult their grandma\u2019s casserole.' },
    { name: 'Leo', glyph: '\u264C', dates: 'Jul 23 – Aug 22', element: 'Fire', mode: 'Fixed', ruler: 'Sun', color: '#ffa63d', animal: 'The Lion',
      keywords: ['Radiant', 'Generous', 'Proud'], best: ['Aries', 'Sagittarius', 'Libra'],
      sun: 'The Sun is at home here: your core self is warm, creative, and expressive. You shine brightest when you lead with heart.',
      moon: 'You need to feel appreciated and seen. Play, creativity, and affection fill your emotional tank.',
      rising: 'You come across as confident, stylish, and warm. You light up a room and people notice when you arrive.',
      sunU: 'Main character syndrome, but make it legitimately correct. The spotlight follows you to the bathroom.',
      moonU: 'If nobody says "great job" today you will simply perish like a houseplant in a closet.',
      risingU: 'Your hair has its own publicist. You have never once entered a room quietly. Not even a dark one.' },
    { name: 'Virgo', glyph: '\u264D', dates: 'Aug 23 – Sep 22', element: 'Earth', mode: 'Mutable', ruler: 'Mercury', color: '#9ad17a', animal: 'The Maiden',
      keywords: ['Precise', 'Helpful', 'Analytical'], best: ['Taurus', 'Capricorn', 'Cancer'],
      sun: 'Your core self is thoughtful and skillful. You notice details others miss and find meaning in being useful and doing things well.',
      moon: 'You calm yourself through order and problem-solving. A tidy space and a clear plan settle your nerves.',
      rising: 'You come across as composed, observant, and capable. People trust you to have it handled.',
      sunU: 'You have a spreadsheet for your spreadsheets. You alphabetized this horoscope while reading it.',
      moonU: 'Coping mechanism: aggressively reorganizing the junk drawer at 1 a.m. while whispering "fine. FINE."',
      risingU: 'You look like you would gently correct a typo in a ransom note. Because you would.' },
    { name: 'Libra', glyph: '\u264E', dates: 'Sep 23 – Oct 22', element: 'Air', mode: 'Cardinal', ruler: 'Venus', color: '#ff9ecf', animal: 'The Scales',
      keywords: ['Harmonious', 'Charming', 'Fair'], best: ['Gemini', 'Aquarius', 'Leo'],
      sun: 'Your core self seeks balance, beauty, and connection. You see every side and shine in partnership and diplomacy.',
      moon: 'You need harmony to feel at peace. Conflict rattles you, and beautiful surroundings and good company soothe you.',
      rising: 'You come across as gracious, attractive, and easygoing. People find you pleasant and fair-minded.',
      sunU: 'It took you 40 minutes to pick a restaurant and you still said "I\u2019m fine with whatever." You were not.',
      moonU: 'You will avoid a confrontation so hard you accidentally move to another state.',
      risingU: 'You are so pretty it\u2019s honestly a public safety concern. Also, you owe four people a text.' },
    { name: 'Scorpio', glyph: '\u264F', dates: 'Oct 23 – Nov 21', element: 'Water', mode: 'Fixed', ruler: 'Pluto & Mars', color: '#b14dff', animal: 'The Scorpion',
      keywords: ['Intense', 'Loyal', 'Perceptive'], best: ['Cancer', 'Pisces', 'Virgo'],
      sun: 'Your core self is deep, private, and powerful. You seek truth, transformation, and bonds that go all the way down.',
      moon: 'Your emotions run intensely but privately. You need trust and loyalty, and you feel everything at full volume.',
      rising: 'You come across as magnetic, mysterious, and a little intimidating. People sense you see right through them.',
      sunU: 'You remember what someone said to you in 2011. Word for word. With timestamps. Lovingly.',
      moonU: 'Your feelings live in a locked basement. The basement has a basement. Don\u2019t go in the basement.',
      risingU: 'You make eye contact like you know the password to their email. You might.' },
    { name: 'Sagittarius', glyph: '\u2650', dates: 'Nov 22 – Dec 21', element: 'Fire', mode: 'Mutable', ruler: 'Jupiter', color: '#ff7b3d', animal: 'The Archer',
      keywords: ['Adventurous', 'Optimistic', 'Blunt'], best: ['Aries', 'Leo', 'Aquarius'],
      sun: 'Your core self is free-spirited and philosophical. You chase meaning, travel, and big ideas, and you lift others with your optimism.',
      moon: 'You need freedom and room to roam. Adventure, laughter, and learning keep your spirits high.',
      rising: 'You come across as cheerful, open, and honest to a fault. People find you fun and refreshingly unfiltered.',
      sunU: 'You booked a one-way flight during a conversation about whether to get pizza. You are now in Portugal.',
      moonU: 'You handle sadness by announcing a new life philosophy every Tuesday.',
      risingU: 'You say the quiet part loud, then the loud part louder, then you leave for a hike.' },
    { name: 'Capricorn', glyph: '\u2651', dates: 'Dec 22 – Jan 19', element: 'Earth', mode: 'Cardinal', ruler: 'Saturn', color: '#a3a3c2', animal: 'The Sea-Goat',
      keywords: ['Ambitious', 'Disciplined', 'Wise'], best: ['Taurus', 'Virgo', 'Pisces'],
      sun: 'Your core self is patient and ambitious. You play the long game, respect hard work, and quietly climb to the top.',
      moon: 'You feel safest when you are in control and making progress. You may hide your feelings until you have a plan for them.',
      rising: 'You come across as mature, composed, and serious, with a dry wit people discover later.',
      sunU: 'You were born 45 years old and are aging backwards. At 80 you will finally go to a rave.',
      moonU: 'You scheduled your breakdown for Thursday at 3:15. It has an agenda. It started on time.',
      risingU: 'You look like you have a LinkedIn premium account and a secret, extremely unhinged meme folder.' },
    { name: 'Aquarius', glyph: '\u2652', dates: 'Jan 20 – Feb 18', element: 'Air', mode: 'Fixed', ruler: 'Saturn & Uranus', color: '#3dd6ff', animal: 'The Water Bearer',
      keywords: ['Original', 'Humanitarian', 'Detached'], best: ['Gemini', 'Libra', 'Sagittarius'],
      sun: 'Your core self is inventive and independent. You think ahead of your time and care about the collective and the future.',
      moon: 'You process emotions through the mind and need plenty of personal space. Friendship and freedom matter deeply to you.',
      rising: 'You come across as unique, friendly, and a little unconventional. People remember you as one of a kind.',
      sunU: 'You are an alien on a research mission and your report on humans is titled "Why Though."',
      moonU: 'You have feelings! You just prefer to discuss them as a hypothetical case study about "a friend."',
      risingU: 'Your outfit looks like it was assembled by a futurist raccoon. It works. Nobody knows how.' },
    { name: 'Pisces', glyph: '\u2653', dates: 'Feb 19 – Mar 20', element: 'Water', mode: 'Mutable', ruler: 'Neptune & Jupiter', color: '#7b9cff', animal: 'The Fish',
      keywords: ['Dreamy', 'Compassionate', 'Artistic'], best: ['Cancer', 'Scorpio', 'Capricorn'],
      sun: 'Your core self is imaginative and empathetic. You feel the world deeply and express it through art, kindness, and intuition.',
      moon: 'Your emotions are oceanic and absorbent. You need quiet, creativity, and time alone to wash off other people\u2019s moods.',
      rising: 'You come across as gentle, dreamy, and kind. People open up to you without quite knowing why.',
      sunU: 'You are 30% water, 70% daydream about a cottage you will never buy. Lovely, though.',
      moonU: 'You absorbed a stranger\u2019s bad mood on the bus and now you are grieving for them. Their name is Gary.',
      risingU: 'You look like you just woke up from a nap inside a painting. Your shoe is untied. Spiritually.' }
  ];

  const ELEMENTS = {
    Fire: { icon: '\uD83D\uDD25', color: '#ff6b3d', desc: 'Passion, courage, and spark.' },
    Earth: { icon: '\uD83C\uDF31', color: '#6fcf5f', desc: 'Stability, senses, and building.' },
    Air: { icon: '\uD83C\uDF2C\uFE0F', color: '#ffe066', desc: 'Ideas, talk, and connection.' },
    Water: { icon: '\uD83C\uDF0A', color: '#5aa9ff', desc: 'Feeling, intuition, and depth.' }
  };

  const BODIES = {
    sun: { name: 'Sun', glyph: '\u2609', role: 'Who you are', blurb: 'Your core identity, ego, and life force.' },
    moon: { name: 'Moon', glyph: '\u263D', role: 'What you feel', blurb: 'Your emotions, needs, and inner world.' },
    asc: { name: 'Rising', glyph: 'AC', role: 'How you appear', blurb: 'Your first impression, style, and outer mask.' },
    mercury: { name: 'Mercury', glyph: '\u263F', role: 'How you think', blurb: 'Communication, learning, and the way your mind works.' },
    venus: { name: 'Venus', glyph: '\u2640', role: 'How you love', blurb: 'Love, beauty, money, and what you find attractive.' },
    mars: { name: 'Mars', glyph: '\u2642', role: 'How you fight', blurb: 'Drive, anger, ambition, and how you take action.' },
    jupiter: { name: 'Jupiter', glyph: '\u2643', role: 'Where you grow', blurb: 'Luck, growth, and where life feels generous.' },
    saturn: { name: 'Saturn', glyph: '\u2644', role: 'Where you work', blurb: 'Discipline, limits, and lessons that build mastery.' },
    uranus: { name: 'Uranus', glyph: '\u2645', role: 'Where you rebel', blurb: 'Change, surprise, and originality (generational).' },
    neptune: { name: 'Neptune', glyph: '\u2646', role: 'Where you dream', blurb: 'Dreams, ideals, and illusion (generational).' },
    pluto: { name: 'Pluto', glyph: '\u2647', role: 'Where you transform', blurb: 'Power, depth, and rebirth (generational).' },
    mc: { name: 'Midheaven', glyph: 'MC', role: 'Your path', blurb: 'Career, reputation, and public direction.' }
  };

  const HOUSES = [
    { n: 1, topic: 'self & appearance', s: 'puts the spotlight on you: your body, your image, and how you show up.', u: 'is in your 1st house, which means you are the problem today. Affectionately.' },
    { n: 2, topic: 'money & values', s: 'turns your attention to money, possessions, and what you truly value.', u: 'is rummaging through your wallet like a raccoon in a dumpster. Hide the card.' },
    { n: 3, topic: 'communication', s: 'stirs up conversations, messages, short trips, and siblings or neighbors.', u: 'has hacked your group chats. Every text you send today is being read aloud by a goose.' },
    { n: 4, topic: 'home & family', s: 'draws you toward home, family, and your private emotional foundations.', u: 'is in your house. Literally. Check the pantry. It ate the good cereal.' },
    { n: 5, topic: 'fun & romance', s: 'lights up creativity, romance, play, and anything that brings you joy.', u: 'wants you to flirt with danger, and by danger we mean a stranger\u2019s golden retriever.' },
    { n: 6, topic: 'work & health', s: 'focuses on daily routines, work tasks, and taking care of your health.', u: 'has been assigned to your daily routine as an unpaid intern. It is already on its phone.' },
    { n: 7, topic: 'partnerships', s: 'highlights partnerships, one-on-one relationships, and agreements.', u: 'is in your relationship sector, so somebody is about to say "we need to talk" about a dishwasher.' },
    { n: 8, topic: 'intimacy & shared resources', s: 'stirs deep feelings, shared money, trust, and emotional honesty.', u: 'is going through your secrets drawer. Yes, that one. With the weird receipts.' },
    { n: 9, topic: 'travel & wisdom', s: 'expands your horizons through travel, learning, and big-picture beliefs.', u: 'is making you want to drop everything and become a mysterious traveling cheese merchant.' },
    { n: 10, topic: 'career & reputation', s: 'raises your public profile and puts career goals in focus.', u: 'is standing on your desk at work shouting your name. Professionally. Kind of.' },
    { n: 11, topic: 'friends & community', s: 'brings friends, groups, networks, and hopes for the future into view.', u: 'has added you to a group chat named "\uD83D\uDC80\uD83D\uDC80 plans \uD83D\uDC80\uD83D\uDC80". There are no plans. Only skulls.' },
    { n: 12, topic: 'rest & the subconscious', s: 'asks you to slow down, rest, reflect, and listen to your inner voice.', u: 'is in your 12th house of secrets and naps. Cancel everything. Become a burrito.' }
  ];

  const PHASES = {
    s: ['A New Moon favors fresh starts. Plant an intention quietly.', 'A waxing crescent rewards small first steps. Build momentum.', 'The First Quarter Moon brings a decision point. Push through friction.', 'A waxing gibbous Moon is for refining. Polish, adjust, prepare.', 'A Full Moon brings things to light. Emotions and results peak.', 'A waning gibbous Moon favors sharing what you learned and giving thanks.', 'The Last Quarter Moon asks you to release what is not working.', 'A waning crescent Moon is for rest. Wrap up and recharge before the next cycle.'],
    u: ['New Moon: the sky is a blank Word doc and you are about to type "asdfghjkl."', 'Waxing crescent: the Moon is doing a little smirk. Be suspicious of it.', 'First Quarter: half Moon, half effort. Honestly relatable.', 'Waxing gibbous: the Moon is almost full and so is your sink. Coincidence? Yes.', 'FULL MOON. Lock the doors. Hide the scissors. Your cousin is texting in all caps.', 'Waning gibbous: the Moon is in its villain-recovery arc. Respect the healing.', 'Last Quarter: time to dump something. A habit, a person, a drawer of mystery cables.', 'Waning crescent: the Moon is a toenail clipping in the sky and it needs you to rest.']
  };

  const ADVICE_S = [
    'Lead with patience; the right answer arrives when you stop forcing it.',
    'A short, honest conversation clears more fog than a long one.',
    'Take one practical step toward a goal you have been circling.',
    'Protect your energy by saying no to one thing that drains you.',
    'Notice what you are grateful for; it will point to what to build next.',
    'Your instincts are reliable today. Trust the first quiet yes.',
    'Reach out to someone you have been meaning to check on.',
    'Organize one small corner of your life and feel the shift.',
    'Rest is productive. Recharging now sets up a stronger week.',
    'Say what you need clearly; people cannot meet needs they cannot see.',
    'A creative outlet will help you process what words cannot.',
    'Review your finances before making a non-essential purchase.',
    'Move your body for twenty minutes and let your mind reset.',
    'Let go of being right in favor of being understood.',
    'Something you started earlier is ready for a second look.',
    'Kindness toward yourself makes everything else easier today.'
  ];
  const CHAOS_U = [
    'Do not trust anyone named Kyle today. Even if your name is Kyle.',
    'A pigeon will make eye contact with you. Do not break first.',
    'You will think of the perfect comeback in the shower in 2029.',
    'The universe has put your phone on 1% and your life on airplane mode.',
    'Mercury is not retrograde, it just doesn\u2019t like you specifically.',
    'Today you will open the fridge seven times expecting new food. It will not appear.',
    'An ex is thinking about you. Unfortunately it is because of a smell.',
    'Your lucky move today is pretending to be on a phone call.',
    'The stars recommend leaving the group chat dramatically and coming back in 4 minutes.',
    'You will step on one (1) single wet spot in fresh socks. It is canon.',
    'A stranger will compliment you and you will say "you too" when they said "nice shoes."',
    'Avoid ladders, ladders avoid you. It\u2019s mutual.',
    'Someone at work has been pronouncing your name wrong for months. Today you let it go forever.',
    'The cosmos says: eat the cereal for dinner. Soup it up. Be free.',
    'Your Wi-Fi password is your destiny. Change it to something confident.',
    'Jupiter is giving you luck, but in coupon form. It expired yesterday.',
    'A song will get stuck in your head and it will be a car insurance jingle.',
    'You will say "lol" in a serious email. Commit to the bit.',
    'Your plants can sense fear. Water them with confidence.',
    'Saturn is watching. Saturn is taking notes. Saturn has a clipboard.',
    'Today is a great day to reply-all. (It is not. Do not.)',
    'You are the main character, but the show is a cooking competition and you forgot the eggs.',
    'Expect a sign from the universe. It will be a literal sign. It will say "Wet Floor."',
    'Text your mom. She knows. She always knows.',
    'Your energy today is "seven raccoons in a trench coat applying for a mortgage."',
    'The Moon wants you to howl, softly, in a parking garage. For acoustics.',
    'A spider in your home is paying no rent. Address this.',
    'Your aura is beige with a chance of sparkle.',
    'Do not buy the thing. Okay, buy the thing. No, wait—',
    'Something lost will be found. It is a single AirPod. It is not yours.'
  ];
  const DONT_U = ['microwave fish at work', 'start a podcast', 'trust a bagel', 'reply "k"', 'cut your own bangs', 'google your symptoms', 'look directly at your screen time', 'name a sourdough starter', 'buy a kayak on impulse', 'challenge a goose', 'say "per my last email"', 'open the junk drawer', 'text "u up"', 'learn the bagpipes', 'assemble IKEA furniture in anger'];
  const LUCKY_ITEM_U = ['a rubber duck', 'one (1) suspicious grape', 'expired coupon', 'the left sock', 'a rotisserie chicken', 'a haunted spoon', 'a tiny traffic cone', 'emotional support pickle', 'the TV remote (found)', 'a rock that looks like Ohio', 'glitter (permanent)', 'your nemesis\u2019s pen'];
  const LUCKY_ITEM_S = ['a journal', 'a green plant', 'fresh water', 'a handwritten note', 'a favorite song', 'a warm drink', 'a short walk', 'a clean desk', 'a candle', 'a good book', 'a stone or crystal', 'a photo of loved ones'];
  const COLORS = [['Crimson', '#dc2b45'], ['Gold', '#ffcc33'], ['Teal', '#2ec4b6'], ['Violet', '#9b5de5'], ['Silver', '#c0c6d0'], ['Emerald', '#2bb673'], ['Coral', '#ff7f6b'], ['Midnight', '#2b2d6b'], ['Rose', '#ff8fb3'], ['Sky', '#6ec6ff'], ['Amber', '#ffad33'], ['Lavender', '#c7a6ff']];
  const COLORS_U = [['Haunted Beige', '#cdb891'], ['Screaming Lime', '#9dff00'], ['Hot Dog Water', '#d7a27a'], ['Gas Station Sushi', '#ff9e9e'], ['Feral Pink', '#ff2fa8'], ['Mystery Goo', '#61d48a'], ['Unpaid Invoice', '#e14b4b'], ['Microwave Glow', '#fff27a']];
  const MOODS_S = ['Focused', 'Reflective', 'Hopeful', 'Grounded', 'Inspired', 'Calm', 'Curious', 'Determined'];
  const MOODS_U = ['Feral', 'Gremlin Mode', 'Crispy', 'Haunted', 'Unhinged (Certified)', 'Goblin Chic', 'Spicy Potato', 'Sleep-Deprived Wizard'];

  const LOADING = ['Consulting the stars...', 'Bribing Mercury...', 'Untangling the cosmos...', 'Polishing crystal ball...', 'Reading the moon\u2019s diary...', 'Asking Saturn nicely...'];
  const LOADING_U = ['Licking the crystal ball...', 'Yelling at Mercury...', 'Shaking the Moon for coins...', 'Summoning a cosmic raccoon...', 'Microwaving the stars...', 'Arguing with Pluto (not a planet, ok)...'];

  return { SIGNS, ELEMENTS, BODIES, HOUSES, PHASES, ADVICE_S, CHAOS_U, DONT_U, LUCKY_ITEM_U, LUCKY_ITEM_S, COLORS, COLORS_U, MOODS_S, MOODS_U, LOADING, LOADING_U };
})();
