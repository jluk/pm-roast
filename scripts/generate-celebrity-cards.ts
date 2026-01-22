/**
 * Script to generate AI-stylized card images for celebrity cards
 * Run with: npx tsx scripts/generate-celebrity-cards.ts
 * Run specific cards: npx tsx scripts/generate-celebrity-cards.ts john-cena dwayne-johnson
 *
 * This transforms celebrity photos into Pokemon TCG-style card art.
 *
 * Requires GEMINI_API_KEY environment variable (loaded from .env.local)
 */

import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const genAI = new GoogleGenAI({ apiKey });

// Element colors for different card types
const ELEMENT_COLORS: Record<string, string> = {
  chaos: "fiery oranges, electric reds, chaotic purples, explosive energy",
  data: "cool blues, glowing cyans, data-stream greens, crystalline effects",
  strategy: "royal purples, deep magentas, cosmic indigos, mystical energy",
  shipping: "energetic greens, velocity yellows, motion blur effects, speed lines",
  politics: "golden yellows, diplomatic golds, influence auras, connection threads",
  vision: "ethereal whites, rainbow prismatic, dreamy pastels, visionary glows",
};

// Celebrity card definitions with creative scene-based prompts
const CELEBRITY_CARDS = [
  // === ENTERTAINMENT & COMEDY ===
  {
    id: "john-cena",
    name: "John Cena",
    sourceImage: "john-cena.jpg",
    outputImage: "john-cena-card.png",
    archetypeName: "Invisible Stakeholder",
    element: "chaos",
    creativeScene: `This person as a massive WWE champion who is literally fading in and out of visibility like a glitching video game character. They're in a corporate boardroom delivering a presentation, but half their body keeps disappearing. Confused executives look at an empty chair while a floating "You Can't See Me" hand gesture hovers in the air. Championship belts are stacked on the conference table. Their expression alternates between intimidating wrestler face and wholesome Make-A-Wish energy.`,
  },
  {
    id: "dwayne-johnson",
    name: "Dwayne Johnson",
    sourceImage: "dwayne-johnson.jpg",
    outputImage: "dwayne-johnson-card.png",
    archetypeName: "Hustle Culture CEO",
    element: "shipping",
    creativeScene: `This person as a titan emerging from a gym at 4am, sun barely rising, already drenched in sweat with a motivational Instagram post floating above their head. They're simultaneously cooking eggs, lifting weights, filming a movie scene, and promoting tequila - each arm doing something different like a Hindu deity of productivity. An alarm clock shows 3:59am. Their muscles have muscles. Eyebrow permanently raised in that signature questioning look.`,
  },
  {
    id: "joe-rogan",
    name: "Joe Rogan",
    sourceImage: "joe-rogan.png",
    outputImage: "joe-rogan-card.png",
    archetypeName: "DMT Product Manager",
    element: "chaos",
    creativeScene: `This person in a psychedelic podcast studio that spirals into infinite dimensions. They're interviewing an elk, an alien, and a mushroom simultaneously while a chimpanzee operates the soundboard. "Jamie pull that up" echoes through portals to other dimensions. Float tanks, kettlebells, and conspiracy charts orbit around them. Their bald head is glowing with DMT energy. Expression is that of someone who just discovered something mind-blowing for the 50th time today.`,
  },
  {
    id: "kevin-hart",
    name: "Kevin Hart",
    sourceImage: "kevin-hart.jpg",
    outputImage: "kevin-hart-card.png",
    archetypeName: "Vertical Scaler",
    element: "shipping",
    creativeScene: `This person standing on an increasingly tall stack of money, movie scripts, and comedy specials, trying to reach a "You must be this tall" sign that keeps moving higher. Despite being comically short, they're simultaneously filming 5 movies, doing standup, and posting workout videos. Energy drink cans and "HARD WORK" motivational posters explode around them. Their face shows pure determination mixed with that signature laugh-yelling expression.`,
  },
  {
    id: "ryan-reynolds",
    name: "Ryan Reynolds",
    sourceImage: "ryan-reynolds.jpg",
    outputImage: "ryan-reynolds-card.png",
    archetypeName: "Deadpool Marketer",
    element: "politics",
    creativeScene: `This person breaking the fourth wall of a trading card, literally leaning out of the frame to pitch Aviation Gin to the viewer while wearing a Deadpool mask pushed up on their head. They're writing self-aware sarcastic ad copy that somehow works. Behind them, Mint Mobile and Maximum Effort logos fight for attention. Their face shows that signature smirk of someone who knows the joke before everyone else.`,
  },
  {
    id: "gordon-ramsay",
    name: "Gordon Ramsay",
    sourceImage: "gordon-ramsay.jpg",
    outputImage: "gordon-ramsay-card.png",
    archetypeName: "Code Review Tyrant",
    element: "chaos",
    creativeScene: `This person in a kitchen made of computer servers, screaming at a junior developer's code like it's a raw piece of chicken. "IT'S RAW!" but about uncooked code. Flames literally shoot from their mouth. A lamb sauce search query has "404 not found." Terrified chefs/developers cower as Michelin stars and GitHub stars rain down chaotically. Their face is pure volcanic rage mixed with disbelief at incompetence.`,
  },
  {
    id: "snoop-dogg",
    name: "Snoop Dogg",
    sourceImage: "snoop-dogg.jpg",
    outputImage: "snoop-dogg-card.png",
    archetypeName: "Chill Pivot Master",
    element: "vision",
    creativeScene: `This person floating on a cloud shaped like a marijuana leaf, cooking with Martha Stewart while commentating the Olympics and playing a football video game. They're wearing a track suit that shifts between every career they've had. Gin and juice materialize around them. Their long braids flow like a river of chill energy. Expression is maximum relaxation - like nothing in the universe could possibly stress them out.`,
  },
  {
    id: "kim-kardashian",
    name: "Kim Kardashian",
    sourceImage: "kim-kardashian.jpg",
    outputImage: "kim-kardashian-card.png",
    archetypeName: "Influencer PM",
    element: "politics",
    creativeScene: `This person at the center of a social media solar system, with phones and cameras orbiting like planets. They're simultaneously running SKIMS, studying law books, and breaking the internet - each task handled by a clone. Contour makeup lines create a map of their empire. A Kris Jenner hologram manages things in the background. Their expression is camera-ready perfection with calculated vulnerability.`,
  },
  {
    id: "kanye-west",
    name: "Kanye West",
    sourceImage: "kanye-west.jpg",
    outputImage: "kanye-west-card.png",
    archetypeName: "Visionary Chaos Agent",
    element: "chaos",
    creativeScene: `This person standing on a floating Yeezy sneaker throne, half-genius half-disaster energy radiating outward. They're tweeting something unhinged with one hand while creating a masterpiece with the other. Grammy awards and controversy headlines swirl in a tornado around them. Their reflection shows multiple personalities. Expression oscillates between "I am a god" confidence and "why doesn't anyone understand me" frustration.`,
  },
  {
    id: "oprah-winfrey",
    name: "Oprah Winfrey",
    sourceImage: "oprah-winfrey.jpg",
    outputImage: "oprah-winfrey-card.png",
    archetypeName: "Enterprise Empath",
    element: "vision",
    creativeScene: `This person ascending from a talk show throne, pointing at the viewer with divine energy as cars, books, and "favorite things" materialize and shoot toward the audience. "YOU GET A CAR" echoes through dimensions. They're surrounded by emotional breakthrough energy and Oprah Book Club stickers. A Weight Watchers bread loaf floats nearby, looking delicious. Expression is warm but powerful - like a hug that could also run a media empire.`,
  },
  {
    id: "lebron-james",
    name: "LeBron James",
    sourceImage: "lebron-james.jpg",
    outputImage: "lebron-james-card.png",
    archetypeName: "GOAT Debater",
    element: "strategy",
    creativeScene: `This person sitting on a throne of championship trophies, but the throne keeps changing teams/cities. They're simultaneously playing basketball, running a production company, and arguing about their legacy on a holographic social media feed. A "GOAT debate" scoreboard floats nearby with endless statistics. LeBron stans and haters battle in the background like angels and demons. Expression is "I'm the best and I'll explain why in detail."`,
  },
  {
    id: "taylor-swift",
    name: "Taylor Swift",
    sourceImage: "taylor-swift.png",
    outputImage: "taylor-swift-card.png",
    archetypeName: "Version Control Queen",
    element: "strategy",
    creativeScene: `This person in a recording studio that's also a git repository, re-recording all of history and claiming it as "(Taylor's Version)". Easter eggs and hidden messages are literally hidden throughout the scene for fans to find. Ex-boyfriends are transformed into songs that float around like trapped spirits. Friendship bracelets spell out secret messages. Expression is sweet revenge satisfaction mixed with "I planned this all along."`,
  },
  {
    id: "mrbeast",
    name: "MrBeast",
    sourceImage: "mrbeast.jpg",
    outputImage: "mrbeast-card.png",
    archetypeName: "Viral Growth Hacker",
    element: "data",
    creativeScene: `This person standing in front of an absurdly expensive challenge setup - pyramids of cash, giant sets, and clickbait thumbnails come to life. They're giving away an entire island while A/B testing thumbnail expressions. The YouTube algorithm manifests as a golden deity they've mastered. Feastables chocolate bars rain from the sky. Expression is that signature surprised face perfected over 1000 thumbnails.`,
  },
  {
    id: "drake",
    name: "Drake",
    sourceImage: "drake.jpg",
    outputImage: "drake-card.png",
    archetypeName: "Soft Launch Specialist",
    element: "politics",
    creativeScene: `This person as a sad boy king on a throne made of platinum records, texting an ex at 2am while a Grammy and a ghostwriter float nearby. They're caught between Degrassi wheelchair Jimmy and rap mogul Drake - both versions visible like a double exposure. Toronto skyline glows behind them. Expression shifts between emotional vulnerability and "I'm too successful to care" - somehow both at once.`,
  },
  {
    id: "guy-fieri",
    name: "Guy Fieri",
    sourceImage: "guy-fieri.png",
    outputImage: "guy-fieri-card.png",
    archetypeName: "Flavortown Mayor",
    element: "shipping",
    creativeScene: `This person driving a flaming convertible into a dimension called FLAVORTOWN, which is an actual magical city made of food. Their frosted tips are literally flames. Donkey sauce flows like rivers. Every restaurant has "WINNER" on it. They're taking a bite of something and doing the head-back, eyes-closed flavor appreciation. Sunglasses on backwards of course. Expression is pure joy - like they discovered fire but it's food.`,
  },
  {
    id: "conor-mcgregor",
    name: "Conor McGregor",
    sourceImage: "conor-mcgregor.jpg",
    outputImage: "conor-mcgregor-card.png",
    archetypeName: "Trash Talk PM",
    element: "chaos",
    creativeScene: `This person at a press conference that's become a full brawl, throwing chairs and whiskey bottles while giving a motivational speech about self-belief. Proper Twelve whiskey rains down. Their suit is somehow still immaculate amid the chaos. A "Who da fook is that guy" speech bubble echoes infinitely. Expression is pure Irish menace mixed with showman charisma - like they're selling a fight and the whiskey simultaneously.`,
  },
  {
    id: "will-smith",
    name: "Will Smith",
    sourceImage: "will-smith.jpg",
    outputImage: "will-smith-card.png",
    archetypeName: "Reputation Crasher",
    element: "chaos",
    creativeScene: `This person as the Fresh Prince throne glitching between beloved icon and PR disaster. An Oscar statue is crying. Two versions of them exist - the "welcome to Miami" fun guy and the serious dramatic actor - having an argument. A hand is mid-slap, frozen in time, while YouTube Rewind burns in the background. Expression is complex - somewhere between "I am legend" and "oh no what did I do."`,
  },
  {
    id: "shaquille-oneal",
    name: "Shaquille O'Neal",
    sourceImage: "shaquille-oneal.jpg",
    outputImage: "shaquille-oneal-card.png",
    archetypeName: "Portfolio Dunker",
    element: "politics",
    creativeScene: `This person as a giant businessman-athlete hybrid, literally dunking on a basketball hoop made of stock tickers while doing commercials for 47 different brands simultaneously. Papa John's, The General, Icy Hot, Gold Bond - all their mascots orbit around. A free throw brick bounces off the rim eternally. Inside the NBA desk floats nearby with Charles Barkley looking annoyed. Expression is lovable goofball meets shrewd investor.`,
  },
  {
    id: "martha-stewart",
    name: "Martha Stewart",
    sourceImage: "martha-stewart.jpg",
    outputImage: "martha-stewart-card.png",
    archetypeName: "Comeback Homemaker",
    element: "strategy",
    creativeScene: `This person in a perfect kitchen that's also a prison cell that's also a cannabis grow room - all aesthetically perfect. They're making the most beautiful craft project ever while Snoop Dogg passes them ingredients. A tasteful ankle monitor has been bedazzled. "Good things" float around like a lifestyle brand halo. Expression is serene domestic perfection with a hint of "I've seen things and emerged stronger."`,
  },
  {
    id: "arnold-schwarzenegger",
    name: "Arnold Schwarzenegger",
    sourceImage: "arnold-schwarzenegger.jpg",
    outputImage: "arnold-schwarzenegger-card.png",
    archetypeName: "Terminator Pivot",
    element: "shipping",
    creativeScene: `This person as a time-traveling career transformer - half Terminator robot, half Governor, half bodybuilder, all Austrian. They're simultaneously lifting weights, signing legislation, and saying "I'll be back" to multiple careers. A timeline shows bodybuilding → acting → politics → elder statesman. The accent is somehow visible as a speech bubble effect. Expression is determined confidence - like nothing is impossible if you just do it.`,
  },
  {
    id: "tom-brady",
    name: "Tom Brady",
    sourceImage: "tom-brady.jpg",
    outputImage: "tom-brady-card.png",
    archetypeName: "GOAT Optimizer",
    element: "data",
    creativeScene: `This person as a perfectly optimized football cyborg, drinking mysterious TB12 electrolytes while deflating everything around them (not just footballs). Seven Super Bowl rings orbit like infinity stones. They're retiring and un-retiring simultaneously - a revolving door of retirement announcements. Avocado ice cream floats nearby. No tomatoes allowed. Expression is robotic competitive perfection - like they've solved aging but forgot to solve retirement.`,
  },
  {
    id: "beyonce",
    name: "Beyoncé",
    sourceImage: "beyonce.jpg",
    outputImage: "beyonce-card.png",
    archetypeName: "Queen Bee PM",
    element: "vision",
    creativeScene: `This person as an actual queen bee deity, commanding a swarm of dedicated fans (the Beyhive) who attack any critics. They're dropping a surprise album from the clouds with zero marketing, and the world stops. Multiple Grammy awards float in a halo formation. Everything is mysterious and perfect and revealed only when they decide. Expression is serene power - like they know they're the best but don't need to say it.`,
  },
  {
    id: "post-malone",
    name: "Post Malone",
    sourceImage: "post-malone.jpg",
    outputImage: "post-malone-card.png",
    archetypeName: "Face Tattoo CEO",
    element: "chaos",
    creativeScene: `This person looking like they live behind a gas station but sitting on a throne of platinum records. Face tattoos glow with musical power. They're playing beer pong with record executives and winning. Somehow both disheveled and a multi-millionaire - the disconnect is the point. Cigarette smoke forms musical notes. Expression is "I shouldn't be this successful looking like this but here we are" energy.`,
  },
  {
    id: "dj-khaled",
    name: "DJ Khaled",
    sourceImage: "dj-khaled.jpg",
    outputImage: "dj-khaled-card.png",
    archetypeName: "Hype Man PM",
    element: "politics",
    creativeScene: `This person yelling their own name while standing on a pile of "major keys to success." They're in a recording studio doing nothing but yelling "ANOTHER ONE" and "WE THE BEST" while other artists do the actual work. Jet ski in the background. Suffering is illegal in their presence. Every surface has motivational quotes. Expression is maximum hype - like existence itself is the greatest blessing.`,
  },
  {
    id: "ellen-degeneres",
    name: "Ellen DeGeneres",
    sourceImage: "ellen-degeneres.jpg",
    outputImage: "ellen-degeneres-card.png",
    archetypeName: "Nice Brand Crisis",
    element: "politics",
    creativeScene: `This person dancing through a talk show set where "BE KIND" signs are cracking and falling. Former employees peek from behind curtains with knowing looks. They're scaring celebrities while a workplace investigation folder glows ominously nearby. The gap between the brand and the backstage reality is literally visible as a crack in the set. Expression is that TV smile that doesn't quite reach the eyes.`,
  },
  {
    id: "conan-obrien",
    name: "Conan O'Brien",
    sourceImage: "conan-obrien.jpg",
    outputImage: "conan-obrien-card.png",
    archetypeName: "Late Night Pivot",
    element: "vision",
    creativeScene: `This person as an extremely tall, extremely pale comedy phoenix rising from the ashes of The Tonight Show. NBC burns in the background while their podcast empire emerges. They're doing the string dance while interviewing world leaders. Self-deprecation energy is weaponized and hilarious. That signature hair is its own character. Expression is "I lost everything and somehow became cooler" energy.`,
  },
  {
    id: "steve-harvey",
    name: "Steve Harvey",
    sourceImage: "steve-harvey.jpg",
    outputImage: "steve-harvey-card.png",
    archetypeName: "Reaction Meme King",
    element: "chaos",
    creativeScene: `This person's face frozen in that iconic confused/shocked expression, which has become a reaction meme that's taken over the universe. They're holding the wrong Miss Universe envelope while their face shows every stage of grief. "Survey says" buzzer sounds everywhere. Their suit is immaculate but the situation is chaos. Expression is that signature meme face - pure "how did this happen" energy.`,
  },
  {
    id: "jimmy-fallon",
    name: "Jimmy Fallon",
    sourceImage: "jimmy-fallon.jpg",
    outputImage: "jimmy-fallon-card.png",
    archetypeName: "Slap Desk Laugher",
    element: "politics",
    creativeScene: `This person laughing hysterically at something that isn't funny, slapping a desk that's been destroyed from years of slapping. They're playing a silly game with a celebrity who clearly doesn't want to be there. Breaking character energy from SNL days lingers. Every guest is "the best." Their laugh has become sentient and fills the room. Expression is maximum fake-but-committed enthusiasm.`,
  },
  {
    id: "serena-williams",
    name: "Serena Williams",
    sourceImage: "serena-williams.jpg",
    outputImage: "serena-williams-card.png",
    archetypeName: "GOAT Investor",
    element: "strategy",
    creativeScene: `This person serving tennis balls that transform into successful startup investments. 23 Grand Slam trophies form steps to a VC throne. They're simultaneously dominating tennis and the investment world, with portfolio companies orbiting like planets. A catsuit with a VC logo shimmers. Doubters are crushed beneath championship sneakers. Expression is "I dominated sports, why not finance?" confidence.`,
  },
  {
    id: "bad-bunny",
    name: "Bad Bunny",
    sourceImage: "bad-bunny.jpg",
    outputImage: "bad-bunny-card.png",
    archetypeName: "Reggaeton Renegade",
    element: "vision",
    creativeScene: `This person at the center of a global music explosion, wearing nail polish and a designer outfit while traditional gender norms shatter around them. They're making the whole world learn Spanish just to sing along. A fan's phone is mid-throw into the ocean. WWE championship belt worn casually. Expression is "I do what I want and you love it" confidence.`,
  },
  {
    id: "billie-eilish",
    name: "Billie Eilish",
    sourceImage: "billie-eilish.jpg",
    outputImage: "billie-eilish-card.png",
    archetypeName: "Whisper Pop CEO",
    element: "vision",
    creativeScene: `This person in a bedroom recording studio that somehow produces Grammy-winning albums. They're whispering into a microphone while brother Finneas does producer magic in the background. Baggy clothes form a protective shield. Everything is slightly ASMR. Teen angst has been monetized perfectly. Expression is "I'm sad but make it fashion" - detached coolness with artistic depth.`,
  },
  {
    id: "lizzo",
    name: "Lizzo",
    sourceImage: "lizzo.png",
    outputImage: "lizzo-card.png",
    archetypeName: "Self-Love Brand",
    element: "chaos",
    creativeScene: `This person playing James Madison's crystal flute while twerking on a historical monument. Body positivity energy radiates outward, transforming everything it touches. They're 100% that... powerful force of nature. Classical flute training meets modern confidence anthem. A lawsuit document floats ominously but doesn't stop the performance. Expression is maximum confidence and joy.`,
  },
  {
    id: "logan-paul",
    name: "Logan Paul",
    sourceImage: "logan-paul.jpg",
    outputImage: "logan-paul-card.png",
    archetypeName: "Controversy Cockroach",
    element: "chaos",
    creativeScene: `This person rising from career death multiple times like a phoenix made of Prime energy drink. A forest (representing their worst moment) burns behind them but they've somehow emerged with a WWE contract and a beverage empire. Every scandal that should have ended them becomes a stepping stone. Expression is "I can't be canceled" confidence mixed with redemption arc energy.`,
  },
  {
    id: "jake-paul",
    name: "Jake Paul",
    sourceImage: "jake-paul.jpg",
    outputImage: "jake-paul-card.png",
    archetypeName: "Chaos Boxing PM",
    element: "chaos",
    creativeScene: `This person boxing retired athletes and celebrities, acting like it's real boxing. "It's Everyday Bro" plays ominously in the background as a curse they can't escape. Their boxing gloves have cash registers in them. Real boxers watch in confused disgust from the sidelines. Expression is maximum annoying confidence - like they know they're trolling everyone and loving it.`,
  },
  {
    id: "pewdiepie",
    name: "PewDiePie",
    sourceImage: "pewdiepie.jpg",
    outputImage: "pewdiepie-card.png",
    archetypeName: "OG Content King",
    element: "shipping",
    creativeScene: `This person on a throne made of 111 million subscriber counts, holding the original YouTube crown. They're retired in Japan, looking peaceful while YouTube burns behind them. A brofist emerges from the screen. T-Series exists as a rival that was defeated. Controversies float past but they've somehow transcended them all. Expression is "I won and then I left" peace.`,
  },
  {
    id: "david-beckham",
    name: "David Beckham",
    sourceImage: "david-beckham.jpg",
    outputImage: "david-beckham-card.png",
    archetypeName: "Pretty Boy Mogul",
    element: "politics",
    creativeScene: `This person bending a soccer ball that curves into various business ventures - fashion, fragrances, Inter Miami. Messi stands beside them like a recruited legendary Pokemon. Victoria manages communications in the background. They're impossibly handsome while looking at beehives (their new hobby). Expression is smoldering but slightly confused, like someone who knows they're beautiful but isn't sure why that makes people give them money.`,
  },
  {
    id: "bear-grylls",
    name: "Bear Grylls",
    sourceImage: "bear-grylls.jpg",
    outputImage: "bear-grylls-card.png",
    archetypeName: "Pee Drinking PM",
    element: "chaos",
    creativeScene: `This person drinking their own filtered urine while a five-star hotel is clearly visible just off-camera. They're crawling through mud and eating bugs for content while the production crew eats craft services nearby. Celebrity victims of their show look traumatized in the background. Expression is survivalist intensity while being fully aware of the irony.`,
  },
  {
    id: "james-corden",
    name: "James Corden",
    sourceImage: "james-corden.jpg",
    outputImage: "james-corden-card.png",
    archetypeName: "Carpool Karaoke PM",
    element: "politics",
    creativeScene: `This person driving a car full of reluctant A-list celebrities forced to sing. A restaurant has a "BANNED" sign with their photo. They're being aggressively charming while everyone slightly recoils. Carpool Karaoke generates infinite content while requiring minimal effort. The UK is relieved they left for America. Expression is maximum British charm offensive.`,
  },
  {
    id: "dr-phil",
    name: "Dr. Phil",
    sourceImage: "dr-phil.jpg",
    outputImage: "dr-phil-card.png",
    archetypeName: "Exploitation Expert",
    element: "data",
    creativeScene: `This person on a daytime TV throne, sending troubled teens to "the ranch" while the ranch dissolves into controversy. "Cash me outside" girl hovers as their greatest creation and shame simultaneously. That bald head and mustache are iconic but the ethics are questionable. Expression is stern pseudo-psychology - like a therapist who's actually just good at TV.`,
  },
  {
    id: "gwyneth-paltrow",
    name: "Gwyneth Paltrow",
    sourceImage: "gwyneth-paltrow.jpg",
    outputImage: "gwyneth-paltrow-card.png",
    archetypeName: "Jade Egg Queen",
    element: "vision",
    creativeScene: `This person floating in a wellness dimension where candles smell like her and jade eggs have healing powers. GOOP products orbit around defying FDA recommendations. They're consciously uncoupling from reality while winning lawsuits looking unbothered. Everything is expensive and vaguely pseudoscientific but beautifully packaged. Expression is serene wealthy enlightenment.`,
  },
  {
    id: "matthew-mcconaughey",
    name: "Matthew McConaughey",
    sourceImage: "matthew-mcconaughey.jpg",
    outputImage: "matthew-mcconaughey-card.png",
    archetypeName: "Alright Alright PM",
    element: "vision",
    creativeScene: `This person driving a Lincoln through existential philosophy, becoming one with the road and the universe. "Alright alright alright" echoes through dimensions. They're shirtless but profound. The McConaissance is complete - rom-com guy transformed into serious actor transformed into car commercial philosopher. Expression is chill wisdom - like they understand something about time that we don't.`,
  },
  {
    id: "neil-degrasse-tyson",
    name: "Neil deGrasse Tyson",
    sourceImage: "neil-degrasse-tyson.jpg",
    outputImage: "neil-degrasse-tyson-card.png",
    archetypeName: "Actually Astronomer",
    element: "data",
    creativeScene: `This person ruining everyone's enjoyment of sci-fi movies by pointing out scientific inaccuracies. "Well actually" energy radiates in waves. They're explaining why something popular is wrong while a crowd slowly backs away. The Cosmos is beautiful behind them but their Twitter takes are not. Expression is smug corrector - like being right is more important than being liked.`,
  },
  {
    id: "bill-nye",
    name: "Bill Nye",
    sourceImage: "bill-nye.jpg",
    outputImage: "bill-nye-card.png",
    archetypeName: "Science Guy PM",
    element: "data",
    creativeScene: `This person in a bow tie leading an army of 90s kids who grew up to fight climate deniers. "BILL BILL BILL BILL" chants echo through time. They're still doing science demonstrations but now they're angry about it. Nostalgic theme song plays while they debate senators. Expression is "I used to be fun but now I'm just frustrated that people won't listen to science."`,
  },
  {
    id: "gary-vaynerchuk",
    name: "Gary Vaynerchuk",
    sourceImage: "gary-vaynerchuk.jpg",
    outputImage: "gary-vaynerchuk-card.png",
    archetypeName: "Hustle Bro Supreme",
    element: "chaos",
    creativeScene: `This person screaming motivational content into 47 phones simultaneously while VeeFriends NFTs float around. "DOCUMENT DON'T CREATE" echoes everywhere. They're selling hustle to people who are already exhausted. Wine bottles from the origin story transform into NFTs. Expression is maximum hustle intensity - like they'll outwork you at being motivational.`,
  },
  {
    id: "floyd-mayweather",
    name: "Floyd Mayweather",
    sourceImage: "floyd-mayweather.jpg",
    outputImage: "floyd-mayweather-card.png",
    archetypeName: "Money PM",
    element: "data",
    creativeScene: `This person surrounded by stacks of cash, counting money while avoiding reading. 50-0 record displayed prominently. They're fighting YouTubers for paychecks now and somehow still winning. Exhibition match money printer goes brrrr. Expression is "I can't read but I can count higher than you" confidence.`,
  },
  {
    id: "adele",
    name: "Adele",
    sourceImage: "adele.jpg",
    outputImage: "adele-card.png",
    archetypeName: "Heartbreak Hits PM",
    element: "vision",
    creativeScene: `This person on a stage made of tears and platinum records, emotionally devastating millions with every album. Every ex-boyfriend transformed into a hit song floats nearby. Their voice is visible as pure emotional waves. Vegas residency postponed but demand only increased. Expression is beautiful sadness - like they channel pain into art and profit.`,
  },
  {
    id: "donald-trump",
    name: "Donald Trump",
    sourceImage: "donald-trump.jpg",
    outputImage: "donald-trump-card.png",
    archetypeName: "Chaos CEO",
    element: "chaos",
    creativeScene: `This person on a golden escalator descending into presidency while Twitter birds explode around them. Tiny hands make big gestures. Everything is tremendous and everyone else is a loser. The Apprentice boardroom merges with the Oval Office. Hair defies physics. Expression is that signature "I alone can fix it" confidence while everything burns.`,
  },
  {
    id: "ed-sheeran",
    name: "Ed Sheeran",
    sourceImage: "ed-sheeran.jpg",
    outputImage: "ed-sheeran-card.png",
    archetypeName: "Ginger Hitmaker",
    element: "shipping",
    creativeScene: `This person looking like a regular guy from the UK but sitting on a mountain of streaming revenue. Every wedding first dance song they've ever written orbits around. They're fighting copyright lawsuits while somehow still making the same song hit. Loop pedal magic creates infinite revenue. Expression is "I know I look like I should be asking for bus money but I'm actually a billionaire."`,
  },
  {
    id: "jennifer-lopez",
    name: "Jennifer Lopez",
    sourceImage: "jennifer-lopez.jpg",
    outputImage: "jennifer-lopez-card.png",
    archetypeName: "Jenny From Block",
    element: "shipping",
    creativeScene: `This person ageless and eternal, doing a Super Bowl halftime show while running multiple careers. "Still Jenny from the block" but the block is now a $400M empire. Ben Affleck returns like a 20-year-delayed sequel. They refuse to age like a normal human. Expression is triple-threat energy - acting, singing, dancing, and not aging.`,
  },
  {
    id: "johnny-depp",
    name: "Johnny Depp",
    sourceImage: "johnny-depp.jpg",
    outputImage: "johnny-depp-card.png",
    archetypeName: "Pirates Pensioner",
    element: "chaos",
    creativeScene: `This person as Jack Sparrow but in a courtroom, somehow winning a defamation case through pure meme energy. Trial testimony becomes the greatest content of the year. They're painting, playing guitar, and being a pirate simultaneously while legal drama swirls. Expression is "I've made some choices but I'm still Johnny Depp" resilience.`,
  },
];

// Get MIME type from filename
function getImageMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'webp': return 'image/webp';
    default: return 'image/jpeg';
  }
}

async function generateCelebrityCard(card: typeof CELEBRITY_CARDS[0]): Promise<void> {
  console.log(`\nGenerating card for: ${card.name} (${card.archetypeName})...`);

  const inputPath = path.join(process.cwd(), "public", "famous", "celebrities", card.sourceImage);
  const outputPath = path.join(process.cwd(), "public", "famous", "celebrities", "generated", card.outputImage);

  // Read the source image
  if (!fs.existsSync(inputPath)) {
    console.error(`  Error: Source image not found: ${inputPath}`);
    return;
  }

  const imageBuffer = fs.readFileSync(inputPath);
  const base64Image = imageBuffer.toString("base64");
  const mimeType = getImageMimeType(card.sourceImage);

  const elementColors = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.vision;

  // Create the personalized prompt - internet humor, meme energy, Pokemon TCG style
  const prompt = `Create a HILARIOUS Pokemon trading card illustration of THIS EXACT PERSON as "${card.archetypeName}".

CRITICAL - NO TEXT IN IMAGE:
- NEVER generate ANY text, words, letters, numbers, labels, signs, or writing of any kind
- This includes: names, titles, speech bubbles, captions, watermarks, logos with text
- AI-generated text always looks wrong - avoid it completely
- The image should be PURELY visual with no readable characters

CRITICAL - PRESERVE THE PERSON'S LIKENESS:
- This is THE MOST IMPORTANT requirement - the output MUST look like this specific person
- Copy their EXACT face: same eyes, nose, mouth, face shape, skin tone, hair color, hairstyle
- The person in the output should be IMMEDIATELY RECOGNIZABLE as the person in the input photo
- Study every facial detail in the input and replicate it faithfully
- If they have glasses, facial hair, distinctive features - KEEP THEM
- Think caricature energy - exaggerate the situation for humor but preserve their identity
- Fans should IMMEDIATELY know who this is

THE HILARIOUS SCENE:
${card.creativeScene}

HUMOR & VIBE (Internet meme energy):
- FUNNY expressions - smug confidence, existential dread, manic energy, "this is fine" vibes
- Internet humor and meme relevance - the kind of image people would share
- Absurd but relatable situations that make people laugh
- Props and environment should be comedic and imaginative
- The humor comes from "that's definitely [this person] in this ridiculous situation"

ART STYLE (POKEMON TCG - CRITICAL):
- Classic 90s/2000s Pokemon trading card illustration style
- Hand-painted watercolor aesthetic with vibrant saturated colors
- Dynamic energy effects, magical auras, elemental powers
- Colors: ${elementColors}
- Premium collectible card quality - like a legendary rare Pokemon card
- Ken Sugimori inspired artwork - nostalgic and iconic

COMPOSITION:
- Person prominently featured, face clearly visible and LARGE
- Face should take up at least 30-40% of the image
- Upper body or head/shoulders framing preferred
- Front-facing or 3/4 view (never profile or from behind)
- LANDSCAPE 16:9 aspect ratio
- Room for comedic props and scene elements

ABSOLUTELY DO NOT:
- Create abstract art, surreal nightmare imagery, or body horror
- Distort the face beyond recognition or make it monstrous
- Make the person look ugly, scary, or disturbing
- Obscure, shrink, or hide the face
- Generate ANY text, words, letters, numbers, signs, labels, speech bubbles, or writing (AI text always looks wrong)
- Create photorealistic renders
- Make the person unidentifiable`;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["Text", "Image"],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        const anyPart = part as { inlineData?: { mimeType: string; data: string } };
        if (anyPart.inlineData) {
          const outputBuffer = Buffer.from(anyPart.inlineData.data, "base64");
          fs.writeFileSync(outputPath, outputBuffer);
          console.log(`  ✓ Saved: ${outputPath}`);
          return;
        }
      }
    }

    console.log(`  ⚠ Warning: No image generated for ${card.name}`);
  } catch (error) {
    console.error(`  ✗ Error generating ${card.name}:`, error);
  }
}

async function main() {
  // Check for command line arguments to filter specific cards
  const args = process.argv.slice(2);
  const filterIds = args.length > 0 ? args : null;

  const cardsToGenerate = filterIds
    ? CELEBRITY_CARDS.filter(card => filterIds.includes(card.id))
    : CELEBRITY_CARDS;

  if (cardsToGenerate.length === 0) {
    console.error("No matching cards found for:", filterIds);
    console.log("Available card IDs:", CELEBRITY_CARDS.map(c => c.id).join(", "));
    process.exit(1);
  }

  console.log("=== Celebrity Card Image Generator ===");
  console.log(`Generating ${cardsToGenerate.length} personalized card images...\n`);
  if (filterIds) {
    console.log("Filtering to:", filterIds.join(", "));
  }

  // Ensure output directory exists
  const outputDir = path.join(process.cwd(), "public", "famous", "celebrities", "generated");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
  }

  // Generate images sequentially to avoid rate limits
  for (const card of cardsToGenerate) {
    await generateCelebrityCard(card);
    // Delay between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log("\n=== Generation Complete ===");
  console.log("\nNext steps:");
  console.log("1. Review generated images in /public/famous/celebrities/generated/");
  console.log("2. The celebrity-cards.ts already references these image paths");
}

main().catch(console.error);
