/* AkkerBooster — shared projects dataset.
 *
 * Single source of truth for both the Projects list page (Projects.dc.html) and
 * the Project detail page (Project.dc.html). Each project card links to
 *   Project.dc.html?id=<id>
 * and the detail page looks the project up by that id. The WhatsApp group link
 * lives on the detail page only — you join after opening the project.
 *
 * To add or edit a project, change this file only — both pages update together.
 * `status` is 'ongoing' or 'past'; the list page groups by it.
 * WhatsApp links use the wa.me format; replace with the real group invite link
 * (https://chat.whatsapp.com/...) when the client provides it.
 */
(function () {
  'use strict';

  window.AK_PROJECTS = [
    {
      id: 'vr-onion-seeding',
      status: 'ongoing',
      title: 'Variable Rate Onion Seeding Trial',
      manager: 'Sanne van Dijk',
      managerRole: 'Precision agronomist · Flevoland',
      managerInitials: 'SD',
      originator: 'Kees van Dijk',
      funder: 'Flevoland Growers Cooperative',
      region: 'Flevoland',
      timeline: '2026 growing season (ongoing)',
      participants: '5 farms',
      whatsappUrl: 'https://wa.me/31622345678',
      summary: 'Comparing standard and variable-rate onion seeding across soil-scan zones, with shared emergence counts and yield maps.',
      tags: ['#onions', '#precision', '#variablerate'],
      overview: [
        'This trial puts variable-rate onion seeding to a fair test across five member farms. Each farm splits fields into soil-scan zones and drills part at a flat rate and part at a prescription rate, so we can compare establishment and yield on the same soils in the same season.',
        'Everyone records emergence counts, the prescription map logic and harvest yield maps into a shared template. The aim is an honest, multi-farm answer on whether the prescription pays after seed cost — not a single-field anecdote.',
      ],
      milestones: [
        'Prescription maps built from soil scans — done',
        'Split-field drilling across all five farms — done',
        'Mid-season emergence and stand counts — in progress',
        'Harvest yield mapping and cost analysis — autumn 2026',
      ],
    },
    {
      id: 'soil-carbon-benchmark',
      status: 'ongoing',
      title: 'Soil Carbon Benchmark — Drenthe',
      manager: 'Pieter Smit',
      managerRole: 'Soil scientist · Drenthe',
      managerInitials: 'PS',
      originator: 'Jan Dekker',
      funder: 'Province of Drenthe & member farms',
      region: 'Drenthe',
      timeline: 'Three seasons · 2025–2028',
      participants: '12 farms',
      whatsappUrl: 'https://wa.me/31622345679',
      summary: 'A multi-farm benchmark tracking soil organic matter against cover-crop and cultivation practice over three seasons.',
      tags: ['#soilcarbon', '#benchmark', '#covercrops'],
      overview: [
        'A long-running benchmark that records soil organic matter alongside the practices that drive it — cover cropping, cultivation intensity, organic inputs and rotation — across twelve farms in Drenthe. Sampling follows a shared protocol so numbers can be compared fairly between farms and years.',
        'Rather than chase a single headline figure, the project builds a practice-to-outcome picture members can use to set realistic expectations for their own soils. Part-funded by the Province of Drenthe with member contributions.',
      ],
      milestones: [
        'Baseline sampling on all twelve farms — done',
        'Shared sampling and lab protocol agreed — done',
        'Year-one practice logging — in progress',
        'Interim comparison report — winter 2026',
      ],
    },
    {
      id: 'potato-storage-energy',
      status: 'past',
      title: 'Cooperative Potato Storage Energy Scan',
      manager: 'Anneke Bos',
      managerRole: 'Storage adviser · Groningen',
      managerInitials: 'AB',
      originator: 'Storage working group',
      funder: 'Member contribution & local energy fund',
      region: 'Groningen & Drenthe',
      timeline: 'Completed · 2025',
      participants: '6 stores',
      whatsappUrl: 'https://wa.me/31622345680',
      summary: 'A completed scan of fan settings, insulation and ventilation timing across six potato stores, producing shared energy checklists.',
      tags: ['#storage', '#energy', '#potatoes'],
      overview: [
        'A completed project that audited energy use across six cooperative and farm potato stores. The team logged fan settings, insulation condition and ventilation timing, then compared energy use per tonne stored to find where the easy savings were.',
        'The result is a set of shared energy-saving checklists now used by members ahead of each storage season, plus a short write-up of what changed at the worst-performing stores and how much it saved.',
      ],
      milestones: [
        'Energy audit of six stores — done',
        'Per-tonne benchmarking across stores — done',
        'Shared energy-saving checklist published — done',
        'Follow-up review one season on — done',
      ],
    },
    {
      id: 'aphid-monitoring-pilot',
      status: 'past',
      title: 'Biological Aphid Monitoring Pilot',
      manager: 'Ruben de Boer',
      managerRole: 'Crop protection adviser · Flevoland',
      managerInitials: 'RB',
      originator: 'Flevoland crop protection topic group',
      funder: 'Independent adviser network',
      region: 'Flevoland',
      timeline: 'Completed · 2025',
      participants: '4 farms',
      whatsappUrl: 'https://wa.me/31622345681',
      summary: 'A finished pilot weighing field scouting, trap counts and beneficial-insect observations before insecticide decisions in seed potatoes.',
      tags: ['#seedpotatoes', '#ipm', '#monitoring'],
      overview: [
        'A finished pilot testing whether structured monitoring could sharpen insecticide decisions in seed potatoes. Across four farms the team combined weekly field scouting, yellow-trap counts and observations of beneficial insects into a single decision sheet.',
        'The pilot showed where spray decisions could be delayed or skipped when beneficials were active, and produced a simple monitoring sheet members still use. It also flagged the labour cost of monitoring honestly, so farms can judge the trade-off.',
      ],
      milestones: [
        'Monitoring protocol agreed across four farms — done',
        'Weekly scouting and trap counts through the season — done',
        'Decision sheet linking counts to action — done',
        'Pilot review and member write-up — done',
      ],
    },
  ];
})();
