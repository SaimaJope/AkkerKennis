/* AkkerBooster — shared events dataset.
 *
 * Single source of truth for both the Events list page (Events.dc.html) and the
 * Event detail page (Event.dc.html). Each event card links to
 *   Event.dc.html?id=<id>
 * and the detail page looks the event up by that id.
 *
 * To add or edit an event, change this file only — both pages update together.
 * WhatsApp links use the wa.me format; replace the numbers with the real group
 * invite links (https://chat.whatsapp.com/...) when the client provides them.
 */
(function () {
  'use strict';

  window.AK_EVENTS = [
    {
      id: 'soil-health-workshop-groningen',
      title: 'Soil Health Workshop',
      type: 'Workshop',
      date: '18 July 2026',
      time: '10:00 – 15:30',
      location: 'Oldambt, Groningen',
      region: 'Groningen',
      regionId: 'groningen',
      organiser: 'Lotte Meijer',
      organiserRole: 'Soil adviser · AkkerBooster',
      organiserInitials: 'LM',
      host: 'AkkerBooster Soil Working Group',
      capacity: '25 farmers',
      cost: 'Free for members',
      whatsappUrl: 'https://wa.me/31612345678',
      summary: 'A practical day on soil structure, organic matter and cover crops, with hands-on field checks on northern clay soils.',
      tags: ['#soilhealth', '#covercrops', '#clay'],
      description: [
        'A hands-on workshop for arable farmers who want to read their own soils with more confidence. We start indoors with a short session on soil structure and organic matter, then spend most of the day in the field doing spade diagnostics and comparing managed and unmanaged plots side by side.',
        'The focus is northern clay soils and what actually moves the needle on structure over a few seasons — rotation, cover crop choice, traffic and tillage decisions. Bring your own field questions; we keep plenty of time for them.',
      ],
      agenda: [
        'Spade diagnostics: assessing structure, rooting and compaction in the field',
        'Cover crop selection for clay — species, mixes and termination timing',
        'Reading organic matter and aggregate stability without lab kit',
        'Open clinic: bring a soil problem from your own farm',
      ],
    },
    {
      id: 'field-day-flevoland',
      title: 'Field Day — Precision & Irrigation',
      type: 'Field day',
      date: '29 August 2026',
      time: '09:30 – 16:00',
      location: 'Noordoostpolder, Flevoland',
      region: 'Flevoland',
      regionId: 'flevoland',
      organiser: 'Mark de Jong',
      organiserRole: 'Arable farmer · Flevoland',
      organiserInitials: 'MJ',
      host: 'Flevoland Growers Cooperative',
      capacity: '40 farmers',
      cost: 'Free for members',
      whatsappUrl: 'https://wa.me/31612345679',
      summary: 'On-farm demonstrations of precision seeding, irrigation timing and potato crop monitoring in a dry growing season.',
      tags: ['#precision', '#irrigation', '#potatoes'],
      description: [
        'A full day of on-farm demonstrations hosted on a working potato and onion farm in the Noordoostpolder. Machines will be running, so you see precision seeding, variable-rate application and irrigation scheduling in real field conditions rather than on a slide.',
        'With dry Aprils and Mays becoming the norm, a large part of the day is given to scheduling the first irrigation pass without wasting water early, and to crop-monitoring tools that flag stress before it shows from the tramlines.',
      ],
      agenda: [
        'Live demo: variable-rate seeding driven by soil-scan zones',
        'Irrigation scheduling — soil moisture sensing and decision rules',
        'Potato crop monitoring with multispectral imagery',
        'Q&A with the host farm and equipment suppliers',
      ],
    },
    {
      id: 'members-expedition-zeeland',
      title: 'Annual Members Expedition',
      type: 'Expedition',
      date: '11–12 September 2026',
      time: 'Two days · overnight',
      location: 'Zeeland & West-Brabant',
      region: 'Zeeland',
      regionId: 'zeeland',
      organiser: 'Eva Vermeer',
      organiserRole: 'Community lead · AkkerBooster',
      organiserInitials: 'EV',
      host: 'AkkerBooster',
      capacity: '30 members',
      cost: '€95 members (incl. overnight)',
      whatsappUrl: 'https://wa.me/31612345680',
      summary: 'A two-day member visit to growers trialling salt-tolerant rotations, strip cropping and cooperative storage models.',
      tags: ['#expedition', '#striptillage', '#cooperative'],
      description: [
        'The expedition is our flagship member event: two days on the road visiting farms that are trying something genuinely different. This year we head to the southwest to see how growers are adapting to salinisation, with stops at farms running salt-tolerant rotations and strip cropping at field scale.',
        'Evenings are for the part members value most — long conversations over dinner with the hosts and each other. Travel between farms is arranged together; an overnight stay is included.',
      ],
      agenda: [
        'Day 1 — salt-tolerant rotations and variety trials on coastal clay',
        'Day 1 evening — shared dinner and grower roundtable',
        'Day 2 — strip cropping and mechanical weeding at field scale',
        'Day 2 — cooperative storage and marketing models',
      ],
    },
    {
      id: 'potato-storage-meetup-drenthe',
      title: 'Potato Storage Meetup',
      type: 'Meetup',
      date: '3 October 2026',
      time: '13:00 – 17:00',
      location: 'Emmen, Drenthe',
      region: 'Drenthe',
      regionId: 'drenthe',
      organiser: 'Jan Dekker',
      organiserRole: 'Arable farmer · Drenthe',
      organiserInitials: 'JD',
      host: 'Drenthe Storage Working Group',
      capacity: '20 farmers',
      cost: 'Free for members',
      whatsappUrl: 'https://wa.me/31612345681',
      summary: 'Peer exchange on ventilation, sprout control, energy use and quality monitoring before the main storage season.',
      tags: ['#storage', '#potatoes', '#energy'],
      description: [
        'An informal afternoon meetup for growers storing potatoes, held just before the main storage season gets going. It is a peer exchange rather than a lecture: a few short grower contributions, then open discussion around the issues people are facing this year.',
        'Expect practical talk on ventilation strategy, sprout-suppression options after the loss of older chemistry, energy use and cost, and how members monitor quality through the season.',
      ],
      agenda: [
        'Ventilation strategy and condensation control',
        'Sprout suppression — what members are using now',
        'Energy use, tariffs and simple efficiency wins',
        'Quality monitoring through the storage season',
      ],
    },
  ];
})();
