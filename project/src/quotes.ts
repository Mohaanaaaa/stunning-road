const quotes = [
    "Road safety is a state of mind, accident is an absence of mind.",
    "Drive like your life depends on it—because it does.",
    "Travel is the only thing you buy that makes you richer.",
    "Don’t learn safety by accident.",
    "The journey is the reward, but safety is the key.",
    "Stop accidents before they stop you.",
    "Speed thrills but kills—stay safe on the road.",
    "Leave sooner, drive slower, live longer.",
    "Road safety starts with you—be aware, be alive.",
    "Travel far, travel wide, but always travel safe.",
    "The journey of a thousand miles begins with a single step, but safety is the road that leads us there.",
    "Traveling through nature reminds us that the road is as important as the destination; safety ensures we can enjoy both.",
    "Life is a journey, and the road is a reflection of our choices; let safety be our guide.",
    "In every road trip, the beauty of nature unfolds, but it’s our responsibility to drive safely to appreciate it fully.",
    "The open road is a canvas painted with the colors of nature; let’s drive safely to keep the masterpiece alive.",
    "Travel is not just about the destination; it’s about the safe journey through the wonders of nature that enrich our lives.",
    "Nature’s beauty is best experienced when we prioritize road safety, allowing us to explore without fear.",
    "Every mile traveled safely is a step closer to discovering the breathtaking landscapes that nature has to offer.",
    "Safety is the compass that guides us through the winding roads of adventure.",
    "As we travel through nature’s wonders, let us remember that safety is the key to unlocking its beauty.",
    "The road may be long, but with safety as our companion, every journey becomes a cherished memory.",
    "In the embrace of nature, let us drive with care, for every safe journey is a story waiting to be told.",
    "The beauty of the world unfolds before us, but it’s our responsibility to navigate it safely.",
    "Traveling is a privilege; let’s honor it by ensuring our roads are safe for all who wander.",
    "Nature invites us to explore, but it’s our duty to travel safely, preserving its wonders for generations to come.",
    "Every journey through nature is a reminder that safety is the foundation upon which great adventures are built.",
    "The road is a pathway to discovery, and safety is the guardian that allows us to explore its treasures.",
    "In the dance of travel and nature, let safety lead the way, ensuring every step is a joyful one.",
    "As we traverse the landscapes of our dreams, let us prioritize safety, for it is the bridge to unforgettable experiences.",
    "Nature’s beauty beckons us to explore, but it’s our commitment to safety that ensures we can return to tell the tale.",
    "With every mile traveled safely, we weave a tapestry of memories enriched by the wonders of the natural world.",
    "Let the spirit of adventure guide us, but let safety be the map that keeps us on the right path.",
    "In every journey, let safety be the wind beneath our wings, allowing us to soar through nature’s splendor.",
    "The road ahead is filled with possibilities, and safety is the guardian that ensures we can embrace them all.",
    "Traveling through nature is a privilege; let’s protect it by prioritizing safety on every journey.",
    "As we navigate the roads of life, let us remember that safety is the true companion of every adventure.",
    "Nature’s wonders await us, but it’s our commitment to safe travel that unlocks their beauty.",
    "Every safe journey is a testament to our respect for the road and the natural world around us.",
    "Let us drive with mindfulness, for the road is a reflection of our choices and safety is our guiding star.",
    "In the heart of nature, let safety be our constant companion, ensuring every adventure is a safe one.",
    "The beauty of the journey lies not just in the destination, but in the safe travels that lead us there.",
    "As we explore the great outdoors, let us remember that safety is the path to truly experiencing its wonders.",
    "Every road trip is a chance to connect with nature, and safety is the thread that weaves our experiences together.",
    "In the symphony of travel and nature, let safety be the melody that harmonizes our adventures.",
    "The road is a journey of discovery, and safety is the map that guides us through its twists and turns."
  ];
  
  export const getDailyQuote = () => {
    const today = new Date();
    const index = today.getDate() % quotes.length;
    return quotes[index];
  };
  
  export default quotes;
  