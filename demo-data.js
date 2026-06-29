/* AkkerBooster — temporary demo content for the Challenges board.
 *
 * These are sample posts ("fake posts") used to show the site as it functions
 * while the real database fills up. They are CLIENT-SIDE ONLY — nothing is read
 * from or written to Firestore for them. The Challenges list (Explore.dc.html)
 * merges them on top of any live posts, and the thread view (Thread.dc.html)
 * renders them (with a few sample replies) when the id starts with "demo-".
 *
 * To remove the demo content later: delete this file and the two
 * `demo-data.js` <script> tags in Explore.dc.html and Thread.dc.html.
 */
(function () {
  'use strict';
  if (window.AK_DEMO) return;

  var H = 3600000; // one hour in ms
  function ago(hours) { return Date.now() - hours * H; }
  function initials(name) {
    var p = String(name).trim().split(/\s+/);
    return ((p[0] ? p[0][0] : '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  }

  // Each row matches the shape AK.watchTopics() returns, plus the extra fields
  // the thread view needs (body / tried / crop / replies / reaction counts).
  var raw = [
    {
      id: 'demo-blackgrass',
      title: 'Reducing black-grass in winter wheat',
      summary: 'Black-grass pressure has crept up over three seasons despite stale seedbeds. Looking for rotation and stacking strategies that actually held it back.',
      body: 'Over the last three seasons black-grass has gone from the odd patch to whole headlands in our winter wheat, even with stale seedbeds and delayed drilling. Pre-em chemistry is clearly losing its grip on the worst fields.\n\nI want to hear from people who have genuinely turned the corner — what did the rotation look like, and how hard did you have to lean on spring cropping?',
      tried: 'Stale seedbeds, delayed drilling to mid-October, and a robust pre-em stack. It slowed it down but did not break the cycle.',
      crop: 'Winter wheat',
      category: 'Crop Protection', region: 'Groningen', regionId: 'groningen', type: 'Problem',
      tags: ['#winterwheat', '#weeds', '#blackgrass'], seekingProject: false,
      authorName: 'Piet Bakker', hoursAgo: 2, boosts: 45, issues: 12,
      replies: [
        { authorName: 'Anna de Wit', body: 'The thing that finally worked here was two spring crops in a row — spring barley then sugar beet. Drilling later in autumn alone never did it for us.', hoursAgo: 1, votes: 9 },
        { authorName: 'Joost Visser', body: 'Agree on spring cropping. Also worth being ruthless about cleaning the drill and combine between fields — we were moving seed around for years without realising.', hoursAgo: 1, votes: 6 },
      ],
    },
    {
      id: 'demo-irrigation',
      title: 'Irrigation strategy in dry springs',
      summary: 'With drier Aprils becoming normal, how are you scheduling the first irrigation pass without wasting water early?',
      body: 'The last few springs have been noticeably drier here in Flevoland and I keep second-guessing when to start irrigating. Go too early and it feels wasteful; too late and the crop checks.\n\nHow are you deciding the timing of that first pass — soil moisture sensors, gut feel, or something in between?',
      tried: 'A couple of cheap soil moisture probes and a lot of guesswork. Useful but I do not fully trust the readings yet.',
      crop: 'Seed potatoes',
      category: 'Water & Drainage', region: 'Flevoland', regionId: 'flevoland', type: 'Question',
      tags: ['#irrigation', '#drought', '#water'], seekingProject: false,
      authorName: 'Anna de Wit', hoursAgo: 5, boosts: 21, issues: 7,
      replies: [
        { authorName: 'Sanne Mulder', body: 'We hold off until the top 20cm is genuinely drying and the crop signals it. Starting on the calendar rather than the soil burned a lot of water for us in 2022.', hoursAgo: 3, votes: 5 },
      ],
    },
    {
      id: 'demo-vrseeding',
      title: 'Variable rate seeding in onions',
      summary: 'Trialled VR seeding based on soil-scan zones this year. Sharing the prescription map logic and what I would change next season.',
      body: 'This season I split a 14ha onion field into three management zones from a soil scan and drove a variable rate prescription off it — heavier seed rate on the lighter, more variable ground.\n\nEmergence was visibly more even and the headland counts back it up. Happy to share the zoning logic; I think a few farms doing this together could build a much better dataset.',
      tried: 'One field, three zones, prescription built in the FMS off an EM38 scan. Next year I would ground-truth the zones with more hand counts before drilling.',
      crop: 'Onions',
      category: 'Precision & Technology', region: 'Zeeland', regionId: 'zeeland', type: 'Method',
      tags: ['#onions', '#precision', '#variablerate'], seekingProject: true,
      authorName: 'Joost Visser', hoursAgo: 26, boosts: 32, issues: 3,
      replies: [
        { authorName: 'Piet Bakker', body: 'This is exactly the kind of thing worth turning into a proper trial across a few farms. Count me in if it becomes a topic.', hoursAgo: 20, votes: 8 },
        { authorName: 'Anna de Wit', body: 'Did the seed rate difference between zones actually pay once you costed the extra seed? Curious on the numbers.', hoursAgo: 18, votes: 3 },
      ],
    },
    {
      id: 'demo-fungicide',
      title: 'Best timing for fungicide in potatoes?',
      summary: 'Late blight risk models disagree this week. Curious how others weigh model output against what they actually see in the crop.',
      body: 'Two of the blight risk models I follow are giving me different advice this week — one says spray now, the other says wait two days. The weather is borderline and the canopy is closing fast.\n\nWhen the models disagree, what do you trust? And how much do you let what you actually see in the crop override the forecast?',
      tried: 'Following two risk models plus walking the crop every other day. Still find the timing call stressful in changeable weather.',
      crop: 'Ware potatoes',
      category: 'Crop Protection', region: 'Drenthe', regionId: 'drenthe', type: 'Question',
      tags: ['#potatoes', '#lateblight'], seekingProject: false,
      authorName: 'Sanne Mulder', hoursAgo: 3, boosts: 23, issues: 9,
      replies: [
        { authorName: 'Joost Visser', body: 'When they disagree I go with the shorter interval and protect the new growth — a missed spray in a closing canopy costs far more than one extra pass.', hoursAgo: 2, votes: 7 },
      ],
    },
    {
      id: 'demo-covercrops',
      title: 'Cover crops to improve soil structure',
      summary: 'Three years into a multi-species cover crop mix. Aggregate stability is clearly better — here are the species ratios that worked.',
      body: 'We are three years into a multi-species cover crop mix after winter wheat and the difference in soil structure is now obvious with a spade — better crumb, deeper rooting, water moving away faster after heavy rain.\n\nSharing the species ratios that worked for us on heavier ground, and a couple that did not establish well at all.',
      tried: 'Started with a cheap two-species mix, moved to a six-species blend. The legume + deep-rooting brassica combination did the most for structure.',
      crop: 'Cover crops',
      category: 'Soil & Tillage', region: 'Gelderland', regionId: 'gelderland', type: 'Method',
      tags: ['#covercrops', '#soilhealth', '#rotation'], seekingProject: false,
      authorName: 'Piet Bakker', hoursAgo: 8, boosts: 18, issues: 2,
      replies: [
        { authorName: 'Sanne Mulder', body: 'Which brassica did you use? We tried fodder radish and it ran to seed too fast in a mild autumn.', hoursAgo: 6, votes: 4 },
        { authorName: 'Anna de Wit', body: 'Great write-up. Did you measure anything beyond the spade test — infiltration, worm counts?', hoursAgo: 5, votes: 2 },
      ],
    },
    {
      id: 'demo-weedingrobots',
      title: 'Experiences with autonomous weeding robots',
      summary: 'Considering a shared purchase with two neighbouring farms. Looking for honest hours-per-hectare numbers and reliability in wet soil.',
      body: 'Two neighbouring farms and I are weighing up a shared autonomous weeder rather than each buying our own. On paper the economics work, but I have heard mixed things about reliability once the ground is wet.\n\nIf you run one: what are your real hours-per-hectare, how often does it get stuck or stop, and would you buy it again?',
      tried: 'Demo day on dry ground only — impressive but not representative of our season. Looking for in-season experience before we commit.',
      crop: 'Sugar beet',
      category: 'Machinery', region: 'Noord-Brabant', regionId: 'noordbrabant', type: 'Question',
      tags: ['#robots', '#weeds', '#machinery'], seekingProject: false,
      authorName: 'Anna de Wit', hoursAgo: 22, boosts: 27, issues: 4,
      replies: [
        { authorName: 'Joost Visser', body: 'Shared ownership is the right call for the price, but agree a clear booking schedule and a who-fixes-it agreement up front, or it gets tense fast in a busy week.', hoursAgo: 16, votes: 6 },
      ],
    },
    {
      id: 'demo-nleaching',
      title: 'Managing nitrogen leaching on sandy soils',
      summary: 'Split applications plus a catch crop brought our measured leaching down substantially. Sharing the full schedule and results.',
      body: 'On our sandy ground nitrogen leaching has always been a worry, both for the bill and the rules. Over two seasons we moved to more, smaller splits and a catch crop straight behind the cereal.\n\nMeasured residual N in autumn dropped substantially. Sharing the full application schedule and the numbers in case it helps anyone on similar soils.',
      tried: 'Three splits became five smaller ones, plus a fast-establishing catch crop. More passes, but the autumn soil samples speak for themselves.',
      crop: 'Winter wheat',
      category: 'Fertilisation & Nutrients', region: 'Noord-Brabant', regionId: 'noordbrabant', type: 'Method',
      tags: ['#nitrogen', '#sandysoil', '#catchcrop'], seekingProject: false,
      authorName: 'Joost Visser', hoursAgo: 50, boosts: 19, issues: 5,
      replies: [
        { authorName: 'Piet Bakker', body: 'The catch crop behind the cereal is doing a lot of the work here too. Cheapest insurance against leaching I have found.', hoursAgo: 40, votes: 5 },
      ],
    },
    {
      id: 'demo-droneblight',
      title: 'Detecting late blight early with drones',
      summary: 'Multispectral flights every five days flagged infection before it was visible from the tramlines. Walkthrough of the workflow and costs.',
      body: 'We flew a multispectral drone over the potatoes every five days this season. In two fields it flagged stressed, likely-infected zones a few days before anything was visible walking the tramlines.\n\nHere is the full workflow — flight settings, the index we used, how we ground-truthed the alerts — and an honest breakdown of what it cost per hectare.',
      tried: 'Weekly then five-day flights, NDVI plus a red-edge index. Early flights were too infrequent to be useful; tightening the interval made the difference.',
      crop: 'Seed potatoes',
      category: 'Precision & Technology', region: 'Friesland', regionId: 'friesland', type: 'Article',
      tags: ['#drones', '#lateblight', '#precision'], seekingProject: false,
      authorName: 'Sanne Mulder', hoursAgo: 12, boosts: 22, issues: 6,
      replies: [
        { authorName: 'Anna de Wit', body: 'Really useful, thank you. Did the early warning actually change your spray decisions, or mainly confirm what the risk model already told you?', hoursAgo: 9, votes: 4 },
        { authorName: 'Joost Visser', body: 'What was the per-hectare cost in the end once you factor in your time processing the imagery? That is usually the part people leave out.', hoursAgo: 7, votes: 3 },
      ],
    },
  ];

  // Expand each row into the full topic shape + canned reply docs (with ms times).
  var challenges = raw.map(function (c) {
    var createdAt = ago(c.hoursAgo);
    return {
      id: c.id,
      title: c.title,
      summary: c.summary,
      body: c.body,
      tried: c.tried,
      crop: c.crop,
      category: c.category,
      region: c.region,
      regionId: c.regionId,
      type: c.type,
      images: [],
      tags: c.tags,
      seekingProject: !!c.seekingProject,
      deleted: false,
      archived: false,
      authorUid: '',
      authorName: c.authorName,
      authorInitials: initials(c.authorName),
      createdAt: createdAt,
      isDemo: true,
      boosts: c.boosts,
      issues: c.issues,
      replies: c.replies.map(function (r, i) {
        return {
          id: c.id + '-r' + (i + 1),
          threadId: c.id,
          body: r.body,
          authorUid: '',
          authorName: r.authorName,
          authorInitials: initials(r.authorName),
          votes: [],
          voteCount: r.votes || 0,
          images: [],
          edited: false,
          originalBody: '',
          createdAt: ago(r.hoursAgo),
        };
      }),
    };
  });

  var byId = {};
  challenges.forEach(function (c) { byId[c.id] = c; });

  window.AK_DEMO = {
    isDemoId: function (id) { return typeof id === 'string' && id.indexOf('demo-') === 0; },
    challenges: challenges,
    byId: function (id) { return byId[id] || null; },
  };
})();
