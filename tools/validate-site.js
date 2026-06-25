const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full, filter, out);
    else if (!filter || filter(full)) out.push(full);
  }
  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function existsTarget(fromFile, href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || /^(https?:|mailto:|tel:|javascript:)/i.test(clean)) return true;
  const base = path.dirname(fromFile);
  const target = clean.startsWith('/') ? path.resolve(ROOT, clean.slice(1)) : path.resolve(base, clean);
  if (!target.startsWith(ROOT)) return false;
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory() && fs.existsSync(path.join(target, 'index.html'))) return true;
  if (fs.existsSync(`${target}.html`)) return true;
  return false;
}

const htmlFiles = walk(ROOT, (file) => file.endsWith('.html') && !file.includes(`${path.sep}CONTENT${path.sep}`));
const contentFiles = walk(path.join(ROOT, 'CONTENT'), (file) => path.basename(file) === 'content.txt');
const errors = [];
const warnings = [];

const contentMap = {
  'CONTENT/ABOUT/ABOUTB2/content.txt': ['about/history/index.html'],
  'CONTENT/ABOUT/BOARD/content.txt': ['about/board/index.html', 'pages/about/board.html'],
  'CONTENT/ABOUT/GETINVOLVED/content.txt': ['about/partners/index.html'],
  'CONTENT/ABOUT/LEADERSHIP/content.txt': ['about/leadership/index.html', 'pages/about/leadership.html'],
  'CONTENT/ABOUT/RSP/content.txt': ['about/strategic-plan/index.html', 'pages/about/strategic-plan.html'],
  'CONTENT/ANNUAL SYMPOSIUM/content.txt': ['annual-symposium/index.html'],
  'CONTENT/CONFERENCECENTER/CENTEROVERVIEW/content.txt': ['conference/overview/index.html'],
  'CONTENT/CONFERENCECENTER/FACILITIES/content.txt': ['conference/spaces/index.html'],
  'CONTENT/CONFERENCECENTER/INQUIRYFORM/content.txt': ['conference/inquiry/index.html'],
  'CONTENT/EDUCATION/EDUCATIONBROADERIMPACTS/content.txt': ['education/impact/index.html'],
  'CONTENT/EDUCATION/GROUPRESERVATION/content.txt': ['education/group-reservation/index.html'],
  'CONTENT/EDUCATION/K12/content.txt': ['education/k12/index.html'],
  'CONTENT/EDUCATION/REU/content.txt': ['education/reu/index.html'],
  'CONTENT/EDUCATION/UNIVERSITYPROGRAMS/content.txt': ['education/university/index.html'],
  'CONTENT/MEDIA/CONTACT/content.txt': ['media/contact/index.html', 'contact/index.html'],
  'CONTENT/MEDIA/PRESS/content.txt': ['media/press/index.html'],
  'CONTENT/MEDIA/SOCIALMEDIA/content.txt': ['media/social/index.html'],
  'CONTENT/MEDIA/SPOTLIGHT/content.txt': ['media/spotlight/index.html'],
  'CONTENT/RESEARCH/B2ECOSYSTEMS/content.txt': ['research/systems/index.html', 'research/rainforest/index.html', 'research/ocean/index.html', 'research/leo/index.html', 'research/desert/index.html', 'research/mangroves/index.html', 'research/savanna/index.html'],
  'CONTENT/RESEARCH/NEWSYSTEMSDATA/content.txt': ['research/data/index.html'],
  'CONTENT/RESEARCH/PUBLICATIONS/content.txt': ['research/publications/index.html'],
  'CONTENT/RESEARCH/RESEARCHDIRECTORY/content.txt': ['research/directory/index.html', 'directory/index.html'],
  'CONTENT/RESEARCH/REU/content.txt': ['research/reu/index.html'],
  'CONTENT/RESEARCH/RI/content.txt': ['research/index.html'],
  'CONTENT/RESEARCH/RSP/content.txt': ['research/strategic-plan/index.html'],
  'CONTENT/RESEARCH/SAB/content.txt': ['research/sab/index.html'],
  'CONTENT/RESEARCH/SYSTEMSDATA/content.txt': ['research/legacy-systems-data/index.html'],
  'CONTENT/RESEARCH/USERFACILITYINFORMATION/content.txt': ['research/user-facility/index.html'],
  'CONTENT/VISIT/VISIT/content.txt': ['visit/index.html', 'visit/tours/index.html', 'visit/app/index.html', 'visit/accessibility/index.html'],
};

for (const file of contentFiles.map(rel)) {
  const targets = contentMap[file];
  if (!targets) errors.push(`No mapping documented for ${file}`);
  else targets.forEach((target) => {
    if (!fs.existsSync(path.join(ROOT, target))) errors.push(`${file} maps to missing ${target}`);
  });
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)];
  for (const [, refValue] of refs) {
    if (refValue.includes('${')) continue;
    if (/^(https?:|mailto:|tel:|#)/i.test(refValue)) continue;
    if (!existsTarget(file, refValue)) errors.push(`${rel(file)} has unresolved reference ${refValue}`);
  }
  const artifact = html.match(/google\.com\/url|youtube\.com\/results|grounding-api|vertexaisearch|search_query/i);
  if (artifact) errors.push(`${rel(file)} contains search/Google artifact: ${artifact[0]}`);
  const visibleFilename = html.match(/<figcaption>[^<]*\.(?:jpe?g|png|webp|gif)[^<]*<\/figcaption>|>(?:[^<]*Image_\d[^<]*|[^<]*\.(?:jpe?g|png|webp|gif)[^<]*)<\/(?:p|h2|h3|span|figcaption)>/i);
  if (visibleFilename) errors.push(`${rel(file)} appears to expose a raw image filename as visible text`);
  if (/media\/social\/index\.html$/.test(rel(file))) {
    if (!/class="social-logo"/.test(html)) errors.push('media/social/index.html is missing constrained social-logo images');
    if (/style=["'][^"']*(width|height)\s*:\s*(?:[2-9]\d{2,}|\d{4,})px/i.test(html)) errors.push('media/social/index.html contains oversized inline logo dimensions');
  }
}

const mustUseImages = {
  'conference/spaces/index.html': 'CONTENT/CONFERENCECENTER/FACILITIES/IMAGES/',
  'media/social/index.html': 'CONTENT/MEDIA/SOCIALMEDIA/IMAGES/',
  'about/leadership/index.html': 'CONTENT/ABOUT/LEADERSHIP/IMAGES/',
  'research/directory/index.html': 'CONTENT/RESEARCH/RESEARCHDIRECTORY/IMAGES/',
  'research/data/index.html': 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/',
  'research/leo/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/leo',
  'research/rainforest/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/B2_rainforest',
  'research/ocean/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean',
  'research/desert/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/desert',
  'research/mangroves/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/mangroves',
  'research/savanna/index.html': 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Savanna',
};

for (const [page, needle] of Object.entries(mustUseImages)) {
  const full = path.join(ROOT, page);
  if (!fs.existsSync(full)) errors.push(`Missing important page ${page}`);
  else if (!fs.readFileSync(full, 'utf8').includes(needle)) errors.push(`${page} does not use expected matching image folder/pattern`);
}

const representative = [
  'visit/index.html',
  'visit/tours/index.html',
  'research/data/index.html',
  'research/leo/index.html',
  'research/publications/index.html',
  'conference/spaces/index.html',
  'media/social/index.html',
  'media/spotlight/index.html',
  'about/leadership/index.html',
  'research/directory/index.html',
  'conference/inquiry/index.html',
];

for (const page of representative) {
  const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
  if (!/(internal-hero|abt-hero|edu-hero)/.test(html)) errors.push(`${page} is missing internal hero`);
  if (!/(internal-hero-media|visual-band|profile-grid|social-grid|publication-tools|cta-band|card-grid)/.test(html)) {
    warnings.push(`${page} may need richer visual structure`);
  }
}

const spotlight = path.join(ROOT, 'media/spotlight/index.html');
if (fs.existsSync(spotlight)) {
  const html = fs.readFileSync(spotlight, 'utf8');
  const youtubeLinks = [...html.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/g)];
  const previewIds = [...html.matchAll(/https:\/\/img\.youtube\.com\/vi\/([A-Za-z0-9_-]+)\/hqdefault\.jpg/g)].map((match) => match[1]);
  const expectedIds = [...new Set(youtubeLinks.map((match) => match[1]))];
  expectedIds.forEach((id) => {
    if (!previewIds.includes(id)) errors.push(`media/spotlight/index.html is missing a YouTube preview for ${id}`);
  });
  if (!/youtube-preview[\s\S]*?<h2>[\s\S]*?<p>[\s\S]*?media-action/.test(html)) {
    errors.push('media/spotlight/index.html does not preserve preview/title/text/button ordering');
  }
}

if (warnings.length) console.log(`Warnings:\n${warnings.map((item) => `- ${item}`).join('\n')}`);
if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue(s):\n${errors.map((item) => `- ${item}`).join('\n')}`);
  process.exit(1);
}

console.log(`Validation passed: ${htmlFiles.length} HTML files, ${contentFiles.length} content files, local references and key image usage checked.`);
