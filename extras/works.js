/* Other work: the cards on the Extras mat (index.html) and the long-scroll page (extras/view.html) both read this list.
   card: extras/<id>/card.webp (296 × 386 @2x, exported from the Figma Extras mat with its text hidden) is the card's face;
         ink / bg are the card's text and fallback colours; module is the small label above the title.
   The long scroll is extras/<id>/00.webp, 01.webp … — `pages` strips, each `strip` [width, height] px (exported @2x),
   the last one `last` px tall; `page` is the colour behind it on the long-scroll page.
   video: a film that plays over its poster in the scroll; box is the poster's [x, y, w, h] on the 1x artboard. */
window.WORKS = [
  { id:'work-1', title:'Netflix Store', module:'Design Management 1', desc:'A store inside Netflix that turns the shows you watch into the clothes you wear.',
    card:true, ink:'#E6DCD8', bg:'#010101', page:'#141414', pages:13, strip:[2880,4080], last:3202,
    video:{ src:'ad.mp4', box:[120,23793,1200,675] } },
  { id:'work-2', title:'VIDA 31', module:'Design Management 2', desc:'A tobacco-free paan brand from Nagpur. 31 flavours, one tradition.',
    card:true, ink:'#FBF4E6', bg:'#C82127', page:'#FBF4E6', pages:13, strip:[2080,4080], last:2388 },
  { id:'work-3', title:'Aquaveda', desc:'A sparkling-water brand built in one hour with Adobe Firefly. Runner-up at Adobe Next Campus Days.',
    card:true, ink:'#FFFFFF', bg:'#061A3A', page:'#061A3A', pages:7, strip:[2880,4080], last:2852 },
  { id:'work-4', title:'Knots of Indus', module:'Open elective', desc:'Learning bandhani from master artisans and retelling it for Gen-Z, from shirt to stall.',
    card:true, ink:'#141414', bg:'#EEF0F7', page:'#FBFAF7', pages:8, strip:[2344,4080], last:1764 },
];
