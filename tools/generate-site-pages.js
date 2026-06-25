const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'CONTENT');

function readContent(rel) {
  return fs.readFileSync(path.join(CONTENT, rel, 'content.txt'), 'utf8')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/â€™|â€˜/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”|â€/g, '-')
    .replace(/â€¦/g, '...')
    .replace(/Âµ/g, 'µ')
    .replace(/Â²/g, '2')
    .replace(/Ã©/g, 'e')
    .replace(/Ã¨/g, 'e')
    .replace(/Ã±/g, 'n')
    .replace(/Ã¡/g, 'a')
    .replace(/Ã¼/g, 'u')
    .replace(/Ã¶/g, 'o')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”/g, '-')
    .replace(/Â·/g, '-')
    .replace(/Âµ/g, 'µ')
    .replace(/Ã©/g, 'e')
    .replace(/Ã­/g, 'i')
    .replace(/Ã±/g, 'n')
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”/g, '-')
    .replace(/Â²/g, '2')
    .replace(/Â·/g, '-')
    .replace(/\u00e2\u20ac\u2122/g, "'")
    .replace(/\u00e2\u20ac\u0153|\u00e2\u20ac\u009d/g, '"')
    .replace(/\u00e2\u20ac\u201c|\u00e2\u20ac\u201d|\u00e2\u20ac\u0093|\u00e2\u20ac\u0094/g, '-')
    .replace(/\u00c2\u00b2/g, '2')
    .replace(/\u00c3\u00a9/g, 'e')
    .replace(/\u00c3\u00ad/g, 'i')
    .replace(/\u00c3\u00b1/g, 'n')
    .trim()
    .replace(/^Here is the clean, word-for-word copy from the main content of the page:\s*/i, '')
    .replace(/^Skip to search and filter.*$/gmi, '')
    .trim();
}

function listImages(rel) {
  const dir = path.join(CONTENT, rel, 'IMAGES');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => /\.(png|jpe?g|webp|gif)$/i.test(file))
    .map((file) => `CONTENT/${rel.replace(/\\/g, '/')}/IMAGES/${file}`);
}

function ensureDir(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
}

function writePage(file, html) {
  const full = path.join(ROOT, file);
  ensureDir(full);
  fs.writeFileSync(full, html, 'utf8');
}

function depthFor(file) {
  return path.dirname(file).split(/[\\/]/).filter((part) => part && part !== '.').length;
}

function rootPrefix(depth) {
  return depth === 0 ? './' : '../'.repeat(depth);
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sentence(text) {
  const lines = String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  while (lines.length > 1 && lines[0].length <= 90 && !/[.!?:)]$/.test(lines[0]) && /^[A-Z0-9]/.test(lines[0])) {
    lines.shift();
  }
  const clean = lines.join(' ')
    .replace(/\s+\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+)\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const match = clean.match(/^(.{80,220}?[.!?])\s/);
  return match ? match[1] : clean.slice(0, 220);
}

function linkAttrs(url) {
  if (/^https?:/i.test(url)) return ` href="${esc(url)}" target="_blank" rel="noopener"`;
  return ` href="${esc(url)}"`;
}

function linkify(text) {
  let raw = String(text);
  const standalone = raw.match(/^([^()\n]{1,120}?)\s+\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))\)$/);
  if (standalone) {
    const url = standalone[2];
    const label = /^mailto:/i.test(url)
      ? url.replace(/^mailto:/i, '')
      : /^tel:/i.test(url)
        ? url.replace(/^tel:/i, '')
        : cleanLinkLabel(standalone[1]);
    return `<a${linkAttrs(url)}>${esc(label)}</a>`;
  }

  const tokens = [];

  raw = raw.replace(/\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))\)/g, (all, url) => {
    const token = `@@B2LINK${tokens.length}@@`;
    const linkLabel = /^mailto:/i.test(url)
      ? url.replace(/^mailto:/i, '')
      : /^tel:/i.test(url)
        ? url.replace(/^tel:/i, '')
        : 'Open resource';
    tokens.push(`(<a${linkAttrs(url)}>${esc(linkLabel)}</a>)`);
    return token;
  });

  raw = raw.replace(/\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/gi, (mail) => {
    const token = `@@B2LINK${tokens.length}@@`;
    tokens.push(`<a href="mailto:${esc(mail)}">${esc(mail)}</a>`);
    return token;
  });

  raw = raw.replace(/\b(\d{3}-\d{3}-\d{4})\b/g, (phone) => {
    const token = `@@B2LINK${tokens.length}@@`;
    tokens.push(`<a href="tel:${phone}">${phone}</a>`);
    return token;
  });

  raw = raw.replace(/\bhttps?:\/\/[^\s)]+/g, (url) => {
    const token = `@@B2LINK${tokens.length}@@`;
    tokens.push(`<a${linkAttrs(url)}>Open link</a>`);
    return token;
  });

  let html = esc(raw);
  tokens.forEach((value, index) => {
    html = html.replace(`@@B2LINK${index}@@`, value);
  });
  return html;
}

function linkUrlsOnly(text) {
  return esc(text).replace(/\bhttps?:\/\/[^\s)]+/gi, (url) => {
    const clean = url.replace(/\[\[.*$/, '');
    return `<a class="pub-link"${linkAttrs(clean)}>DOI / source</a>`;
  });
}

function shortTitle(text, max = 78) {
  const first = text.split(/[.!?]/)[0].trim();
  if (first.length <= max) return first;
  const clipped = first.slice(0, max).replace(/\s+\S*$/, '').trim();
  return `${clipped}...`;
}

function cleanLinkLabel(label) {
  let clean = label.replace(/\s+/g, ' ').trim();
  if (/user facility research interest form/i.test(clean)) return 'User Facility Research Interest Form';
  if (/apply now/i.test(clean)) return 'Apply now';
  if (/survey for references/i.test(clean)) return 'Survey for References';
  if (/students can also apply on|etap\.nsf|etap/i.test(clean)) return 'NSF ETAP application';
  if (/letters? of recommendation|references fill out/i.test(clean)) return 'Recommendation survey';
  if (/qualtrics survey/i.test(clean)) return 'Application survey';
  if (/grant number|national science foundation/i.test(clean)) return 'NSF award';
  clean = clean.replace(/\s+Logo$/i, '');
  if (/https?:\/\//i.test(clean)) {
    clean = clean.replace(/\bhttps?:\/\/[^\s]+/gi, '').trim();
  }
  clean = clean.replace(/^(and|or|to)\s+/i, '');
  clean = clean.replace(/^[,.;:\s]+|[,.;:\s]+$/g, '');
  if (clean.length > 64) clean = shortTitle(clean, 64);
  if (!clean) return 'Open resource';
  return clean;
}

function isHeadingLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90) return false;
  if (/^["'“”â€œâ€]/.test(trimmed)) return false;
  if (/^(and|or|the|a|an|to|for|with)\b/i.test(trimmed)) return false;
  if (/[.!;:]$/.test(trimmed)) return false;
  if (/^\d/.test(trimmed)) return false;
  if (/\((https?:|mailto:|tel:)/.test(trimmed)) return false;
  return /[A-Z]/.test(trimmed);
}

function shouldSplitLines(group) {
  if (group.length <= 1) return false;
  return group.some((line) => (
    isHeadingLine(line)
    || /^[-*]\s+/.test(line)
    || /\((https?:|mailto:|tel:|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))/.test(line)
    || (/^[A-Z0-9]/.test(line) && line.length <= 120 && !/[.!?)]$/.test(line))
    || /^[A-Z][^.!?]{2,90}:$/.test(line)
  ));
}

function paragraphGroups(text) {
  return text
    .split(/\n\s*\n/)
    .map((group) => group.split('\n').map((line) => line.trim()).filter(Boolean))
    .filter((group) => group.length)
    .flatMap((group) => {
      if (shouldSplitLines(group)) {
        return group.map((line) => [line]);
      }
      return [group];
    });
}

function isListContextHeading(text) {
  return /numbers|biomes under glass|habitats|regions|sections|includes|options|links|resources|contacts|rooms|spaces|features/i.test(text);
}

function isKnownSectionHeading(text) {
  return /^(About Biosphere 2|History|Fast Facts|Name|Biomes under Glass|Mechanics of Biosphere 2|Research Initiatives|Tropical Rain Forest|Ocean|Landscape Evolution Observatory \(LEO\)|Coastal Fog Desert|Mangroves|Savanna|Citations|Habitat Lawn|Casitas|Conference Rooms|Event Lawn and Dining Spaces|Catering Options|Social Media|Follow Biosphere 2 on Social Media)$/i.test(text);
}

function renderArticle(text, opts = {}) {
  const groups = paragraphGroups(text);
  const html = [];
  const list = [];
  let lastHeadingText = '';
  let listMode = false;
  let paragraphCount = 0;

  function flushList() {
    if (!list.length) return;
    html.push(`<ul class="article-list">${list.map((item) => `<li>${linkify(item)}</li>`).join('')}</ul>`);
    list.length = 0;
  }

  groups.forEach((group, index) => {
    const line = group.join(' ');
    const mdHeading = line.match(/^(#{1,4})\s+(.+)$/);
    if (mdHeading) {
      flushList();
      const level = Math.min(mdHeading[1].length + 1, 3);
      lastHeadingText = mdHeading[2].replace(/\*\*/g, '');
      listMode = isListContextHeading(lastHeadingText);
      html.push(`<h${level}>${linkify(mdHeading[2].replace(/\*\*/g, ''))}</h${level}>`);
      return;
    }

    const boldOnly = line.match(/^\*\*(.+)\*\*$/);
    if (boldOnly) {
      flushList();
      lastHeadingText = boldOnly[1];
      listMode = isListContextHeading(lastHeadingText);
      html.push(`<h3>${linkify(boldOnly[1])}</h3>`);
      return;
    }

    if (listMode
      && /biomes under glass/i.test(lastHeadingText)
      && group.length === 1
      && !/^Mechanics of Biosphere 2$/i.test(line)
      && line.length <= 80
      && !/[.!?]$/.test(line)
      && !/\((https?:|mailto:|tel:)/.test(line)) {
      list.push(line);
      return;
    }

    if (group.length === 1 && isKnownSectionHeading(line)) {
      flushList();
      lastHeadingText = line;
      listMode = isListContextHeading(line);
      const level = /^(Name|Biomes under Glass)$/i.test(line) ? 3 : 2;
      html.push(`<h${level}>${linkify(line)}</h${level}>`);
      return;
    }

    if (group.length === 1 && /^[A-Z][^.!?]{2,90}:$/.test(line)) {
      flushList();
      lastHeadingText = line.replace(/:$/, '');
      listMode = true;
      html.push(`<h3>${linkify(lastHeadingText)}</h3>`);
      return;
    }

    if (listMode
      && group.length === 1
      && line.length <= 125
      && !/[.!?]$/.test(line)
      && !/\((https?:|mailto:|tel:)/.test(line)) {
      list.push(line);
      return;
    }

    const next = groups[index + 1] ? groups[index + 1].join(' ') : '';
    if (group.length === 1 && isHeadingLine(line) && next && !/\((https?:|mailto:|tel:|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))/.test(line)) {
      flushList();
      lastHeadingText = line;
      listMode = isListContextHeading(line);
      html.push(`<h2>${linkify(line)}</h2>`);
      return;
    }

    const parenthesizedLinkOnly = line.match(/^\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+)\)$/);
    if (parenthesizedLinkOnly) {
      flushList();
      const label = lastHeadingText ? cleanLinkLabel(lastHeadingText) : 'Open resource';
      html.push(`<p><a${linkAttrs(parenthesizedLinkOnly[1])}>${esc(label)}</a></p>`);
      return;
    }

    if (group.every((item) => /^[-*]\s+/.test(item))) {
      group.forEach((item) => list.push(item.replace(/^[-*]\s+/, '')));
      return;
    }

    flushList();
    listMode = false;
    paragraphCount += 1;
    html.push(`<p${paragraphCount === 1 && !opts.noLead ? ' class="article-lead"' : ''}>${linkify(line.replace(/\*\*/g, ''))}</p>`);
  });
  flushList();

  return `<div class="article-flow ${opts.wide ? 'wide' : ''}">${html.join('\n')}</div>`;
}

function extractLinks(text) {
  const links = [];
  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    const standalone = trimmed.match(/^([^()\n]{1,120}?)\s+\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))\)$/);
    if (standalone) {
      const label = cleanLinkLabel(standalone[1]);
      if (!links.some((link) => link.href === standalone[2])) links.push({ label, href: standalone[2] });
      return;
    }
    const re = /\((https?:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+|(?:\.{0,2}\/)?[A-Za-z0-9/_-]+(?:\.html|\/index\.html))\)/g;
    let match;
    while ((match = re.exec(trimmed))) {
      let label = 'Open resource';
      if (/sensorDB/i.test(trimmed)) label = 'SensorDB';
      else if (/data interest form/i.test(trimmed)) label = 'Data Interest Form';
      else if (/user facility research interest form/i.test(trimmed)) label = 'User Facility Research Interest Form';
      if (!links.some((link) => link.href === match[1])) links.push({ label, href: match[1] });
    }
  });
  return links;
}

function renderLinkGrid(links) {
  if (!links.length) return '';
  return `
    <section class="internal-section alt">
      <div class="internal-shell">
        <span class="section-label">Resources</span>
        <div class="page-nav-grid">
          ${links.map((link) => `
            <a class="link-card" ${linkAttrs(link.href)}>
              <h3>${esc(link.label)}</h3>
              <p>${/^mailto:/i.test(link.href) ? 'Send email' : /^tel:/i.test(link.href) ? 'Call directly' : 'Open resource'}</p>
            </a>
          `).join('')}
        </div>
      </div>
    </section>`;
}

function prettyImageName(src) {
  const clean = path.basename(src)
    .replace(/\.(jpe?g|png|gif)\.webp$/i, '')
    .replace(/\.(jpe?g|png|webp|gif)$/i, '')
    .replace(/\s*\(\d+\)/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (/energycomplex/i.test(clean)) return 'Energy Center complex';
  if (/^Image \d/i.test(clean)) return 'Conference facility view';
  if (/FacGal/i.test(clean)) return 'Casita lodging';
  return clean;
}

function directUrl(url) {
  const clean = String(url).replace(/\[\[.*$/, '').trim();
  if (/google\.com\/url/i.test(clean)) {
    try {
      const parsed = new URL(clean);
      const q = parsed.searchParams.get('q') || parsed.searchParams.get('url');
      if (q) return decodeURIComponent(q);
    } catch (error) {
      return clean;
    }
  }
  return clean;
}

function localImage(src, root, alt, className = '') {
  return `<img${className ? ` class="${className}"` : ''} src="${root}${src}" alt="${esc(alt)}" loading="lazy">`;
}

function youtubeId(url) {
  const match = String(url).match(/[?&]v=([^&]+)/i) || String(url).match(/youtu\.be\/([^?&/]+)/i) || String(url).match(/youtube\.com\/embed\/([^?&/]+)/i);
  return match ? match[1] : '';
}

function renderMediaCards(cards, className = 'card-grid', root = '') {
  return `
        <div class="${className}">
          ${cards.map((card) => {
            const id = youtubeId(card.href);
            const thumbnail = card.thumbnail ? `${root}${card.thumbnail}` : '';
            if (id) {
              const youtubeThumb = `https://img.youtube.com/vi/${esc(id)}/hqdefault.jpg`;
              return `
            <article class="media-card video-media-card">
              <a class="youtube-preview" data-youtube-preview="${youtubeThumb}" ${linkAttrs(card.href)} aria-label="${esc(`Open video: ${card.title}`)}">
                <img src="${youtubeThumb}" alt="${esc(`${card.title} video preview`)}" loading="lazy">
                <span class="youtube-play" aria-hidden="true"></span>
              </a>
              <div class="media-card-body">
                ${card.meta ? `<span class="card-eyebrow">${esc(card.meta)}</span>` : ''}
                <h2>${esc(card.title)}</h2>
                <p>${esc(card.text)}</p>
                <a class="btn-primary media-action" ${linkAttrs(card.href)}>Watch video</a>
              </div>
            </article>`;
            }
            return `
            <article class="media-card">
              ${thumbnail ? `<img class="media-thumb" src="${thumbnail}" alt="${esc(`${card.title} preview`)}" loading="lazy">` : ''}
              <div class="media-card-body">
                ${card.meta ? `<span class="card-eyebrow">${esc(card.meta)}</span>` : ''}
                <h2>${esc(card.title)}</h2>
                <p>${esc(card.text)}</p>
                <a class="btn-primary media-action" ${linkAttrs(card.href)}>Open story</a>
              </div>
            </article>`;
          }).join('')}
        </div>`;
}

function overviewPage({ file, title, eyebrow, description, cards }) {
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        <div class="card-grid">
          ${cards.map((card) => `
            <a class="link-card" href="${esc(card.href)}">
              <h2>${esc(card.title)}</h2>
              <p>${esc(card.text)}</p>
            </a>
          `).join('')}
        </div>
      </div>
    </section>`;
  writePage(file, pageShell({ file, title, eyebrow, description, heroImage: false, body, compact: true }));
}

function spotlightPage(file) {
  const text = readContent('MEDIA/SPOTLIGHT');
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const localThumbs = [
    'CONTENT/MEDIA/PRESS/IMAGES/LEO_life.png',
    'CONTENT/MEDIA/PRESS/IMAGES/90s.jpg',
    'CONTENT/MEDIA/PRESS/IMAGES/WEF.png',
    'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean.JPG.webp',
    'CONTENT/RESEARCH/RI/IMAGES/B2 front (3).JPG.webp',
    'CONTENT/ABOUT/ABOUTB2/IMAGES/B2_history.jpg.webp',
    'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/B2_rainforest_biome.jpg.webp',
  ];
  const youtubeUrls = [
    'https://www.youtube.com/watch?v=Vh4O04Bpovw',
    'https://www.youtube.com/watch?v=NIfPiBhE0hY',
    'https://www.youtube.com/watch?v=EY9Yr9R1hRU',
    'https://www.youtube.com/watch?v=bitZ7wP5-Dk',
    'https://www.youtube.com/watch?v=xfhLt2kuA5E',
    'https://www.youtube.com/watch?v=VLroU3PaO3g',
    'https://www.youtube.com/watch?v=yQm37KhIhEM',
    'https://www.youtube.com/watch?v=PiyDs8FivKI',
    'https://www.youtube.com/watch?v=a7B39MLVeIc',
  ];
  const descriptions = [
    'Yes Theory explores Biosphere 2',
    'Ozzy & Kelly Osbourne visit Biosphere 2 as part of the Ozzy and Jack World Detour series',
    'A breakthrough to save coral reefs could happen in the Arizona desert. KGUN 9 NEWS reports on Biosphere 2 research that seeks to replicate future ocean conditions to test coral survivability.',
    'MetroWeek Episode 164: Understanding Climate Change at Biosphere 2. Researchers use the facility to examine Earth-systems science in large scale.',
    "Craig goes to Biosphere 2--the largest closed system ever created--and learns about the science of recreating the Earth's ecosystems. How do we build a space colony? Can we re-create nature? Was Biosphere 2 a failure?",
    'Arizona Public Media (AZPM) visited Biosphere 2 to talk about the recent $30 million gift that has guaranteed that research at Biosphere 2 will continue for at least the next decade.',
    "NBC's Today show came to Arizona in late March to tape an update on Biosphere 2 and two of its original Biospherians, Jane Poynter and Tabor MacCallum. Poynter and MacCallum are now involved in a Tucson-based company, World View Enterprises, that was founded two years ago and is exploring space tourism.",
    'The popular game show Jeopardy! sent its Clue Crew to Biosphere 2. Find out what they discovered!',
    'Arizona Public Media features the Biosphere 2 Rainforest. A towering canopy of evergreen trees and a lush forest floor dripping with an almost continuous rainfall just north of Tucson.',
  ];
  const titles = [
    'Yes Theory explores Biosphere 2',
    'Ozzy & Kelly Osbourne visit Biosphere 2',
    'Biosphere 2 coral reef research on KGUN 9',
    'MetroWeek: Understanding Climate Change at Biosphere 2',
    'Biosphere 2 and space-colony science',
    'AZPM on the Biosphere 2 research gift',
    'NBC Today visits Biosphere 2',
    'Jeopardy! Clue Crew at Biosphere 2',
    'Arizona Public Media features the Biosphere 2 Rainforest',
  ];
  const cards = youtubeUrls.map((href, index) => ({
    title: titles[index],
    href: directUrl(href),
    text: descriptions[index] || 'Featured Biosphere 2 media coverage.',
    meta: 'Video',
    thumbnail: localThumbs[index % localThumbs.length],
  }));

  cards.splice(3, 0, {
    title: 'A breakthrough to save coral reefs could happen in the Arizona desert',
    href: 'https://www.kgun9.com/news/local-news/a-breakthrough-to-save-coral-reefs-could-happen-in-the-arizona-desert',
    text: 'KGUN 9 NEWS reports on Biosphere 2 research that seeks to replicate future ocean conditions to test coral survivability.',
    meta: 'Article',
    thumbnail: 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean.JPG.webp',
  });

  cards.push({
    title: 'Jane Poynter tells her story of living in Biosphere 2',
    href: 'https://www.youtube.com/watch?v=aGg0ATfoBgo',
    text: 'Jane Poynter tells her story of living two years and 20 minutes in Biosphere 2 -- an experience that provoked her to explore how we might sustain life in the harshest of environments.',
    meta: 'Video',
    thumbnail: 'CONTENT/ABOUT/ABOUTB2/IMAGES/B2_history.jpg.webp',
  });


  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        ${renderMediaCards(cards, 'card-grid', root)}
      </div>
    </section>`;

  writePage(file, pageShell({
    file,
    title: 'Media Spotlight',
    eyebrow: 'Media',
    description: 'Featured videos, broadcast segments, and public stories about Biosphere 2.',
    heroImage: false,
    body,
    compact: true,
  }));
}

function renderImageFeatures(images, root, title, options = {}) {
  const chosen = images.filter(Boolean).slice(0, options.limit || 4);
  if (!chosen.length) return '';
  return `
    <div class="image-feature-grid${options.expanded ? ' expanded' : ''}">
      ${chosen.map((src) => {
        const name = prettyImageName(src);
        return `<figure class="image-feature"><img src="${root}${src}" alt="${esc(`${title} image`)}" title="${esc(name)}" loading="lazy"></figure>`;
      }).join('')}
    </div>`;
}

function renderFeatureBand({ images = [], root, title, eyebrow = 'Inside the System', text = '' }) {
  const chosen = images.filter(Boolean).slice(0, 3);
  if (!chosen.length) return '';
  return `
    <section class="internal-section visual-band">
      <div class="internal-shell feature-band">
        <div class="feature-band-copy">
          <span class="section-label">${esc(eyebrow)}</span>
          <h2>${esc(title)}</h2>
          ${text ? `<p>${linkify(text)}</p>` : ''}
        </div>
        <div class="feature-band-media">
          ${chosen.map((src) => {
            const name = prettyImageName(src);
            return `<figure><img src="${root}${src}" alt="${esc(`${title} image`)}" title="${esc(name)}" loading="lazy"></figure>`;
          }).join('')}
        </div>
      </div>
    </section>`;
}

function renderImageTextSplit({ image, root, title, eyebrow = 'Featured Image', text = '', reverse = false }) {
  if (!image) return '';
  const name = prettyImageName(image);
  return `
    <section class="internal-section tight top-visual-section">
      <div class="internal-shell image-text-split${reverse ? ' reverse' : ''}">
        <figure class="top-featured-image">
          <img src="${root}${image}" alt="${esc(`${title} image`)}" title="${esc(name)}" loading="lazy">
        </figure>
        <div class="top-featured-copy">
          <span class="section-label">${esc(eyebrow)}</span>
          <h2>${esc(title)}</h2>
          ${text ? `<p>${linkify(text)}</p>` : ''}
        </div>
      </div>
    </section>`;
}

function pageShell({ file, title, eyebrow, description, heroImage, body, links = [], compact = false }) {
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const meta = sentence(description || title);
  const hero = heroImage || '';
  const publicationScript = body.includes('data-publication-tools') ? `
  <script>
    document.querySelectorAll('[data-publication-tools]').forEach((tools) => {
      const search = tools.querySelector('[data-publication-search]');
      const buttons = Array.from(tools.querySelectorAll('[data-pub-filter]'));
      const count = tools.querySelector('[data-publication-count]');
      const cards = Array.from(document.querySelectorAll('.publication-card'));
      let active = 'all';
      const apply = () => {
        const q = (search && search.value || '').trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const tags = card.dataset.pubTags || '';
          const matchesFilter = active === 'all' || tags.includes(active);
          const matchesSearch = !q || card.textContent.toLowerCase().includes(q);
          const show = matchesFilter && matchesSearch;
          card.hidden = !show;
          if (show) visible += 1;
        });
        if (count) count.textContent = visible + ' publication' + (visible === 1 ? '' : 's') + ' shown';
      };
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          active = button.dataset.pubFilter;
          buttons.forEach((item) => item.classList.toggle('active', item === button));
          apply();
        });
      });
      if (search) search.addEventListener('input', apply);
      apply();
    });
  </script>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | Biosphere 2</title>
  <meta name="description" content="${esc(meta)}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="${root}style.css">
</head>
<body class="internal-page">
  <div id="global-header"></div>
  <main>
    <header class="internal-hero${compact ? ' compact' : ''}">
      ${hero ? `<div class="internal-hero-media"><img src="${root}${hero}" alt="${esc(title)}" loading="eager"></div>` : ''}
      <div class="internal-hero-content">
        <div class="internal-kicker">${esc(eyebrow)}</div>
        <h1 class="internal-title">${esc(title)}</h1>
        ${description ? `<p class="internal-summary">${esc(description)}</p>` : ''}
      </div>
    </header>
    ${body}
    ${renderLinkGrid(links)}
  </main>
  <div id="global-footer"></div>
  <script src="${root}header.js"></script>
  <script>new B2Interface(${depth});</script>
  ${publicationScript}
</body>
</html>
`;
}

function contentPage({ file, title, eyebrow, contentRel, heroImage, description, related = [], pageImages = null, compact = false, bodyPrefix = '', showResourceBar = true, imageLimit = 4, expandedImages = false }) {
  const text = readContent(contentRel);
  const images = listImages(contentRel);
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const selectedHero = heroImage === false ? '' : (heroImage || images[0] || '');
  const featureImages = (pageImages || images).filter((src) => src && src !== selectedHero);
  const topImage = featureImages.length ? featureImages[0] : '';
  const galleryImages = featureImages.filter((src) => src !== topImage);
  const resourceLinks = extractLinks(text).slice(0, 8);
  const aside = related.length ? `
        <aside class="quick-card">
          <h2>Explore</h2>
          <ul>
            ${related.map((item) => `<li><a ${/^https?:|^mailto:|^tel:/i.test(item.href) ? linkAttrs(item.href) : `href="${item.href}"`}>${esc(item.label)}</a></li>`).join('')}
          </ul>
        </aside>` : '';
  const body = `
    ${renderImageTextSplit({
      image: topImage,
      root,
      title,
      eyebrow,
      text: sentence(text),
    })}
    <section class="internal-section tight">
      <div class="internal-shell content-layout${aside ? '' : ' no-aside'}">
        <div>
          ${showResourceBar && resourceLinks.length ? `<div class="resource-bar">${resourceLinks.map((link) => `<a${linkAttrs(link.href)}>${esc(link.label)}</a>`).join('')}</div>` : ''}
          ${bodyPrefix}
          ${renderArticle(text, { wide: /PUBLICATIONS|SAB/.test(contentRel) })}
          ${renderImageFeatures(galleryImages, root, title, { limit: imageLimit, expanded: expandedImages })}
        </div>
        ${aside}
      </div>
    </section>`;

  writePage(file, pageShell({
    file,
    title,
    eyebrow,
    description: description || sentence(text),
    heroImage: selectedHero,
    body,
    compact,
  }));
}

function parseDirectory(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const entries = [];
  let current = null;
  lines.forEach((line) => {
    const match = line.match(/^(.+?)\s+\((https?:\/\/[^)]+)\)$/);
    if (match) {
      if (current) entries.push(current);
      current = { name: match[1], url: match[2], roles: [], phone: '', email: '' };
      return;
    }
    if (!current) return;
    const mail = line.match(/^(.+?)\s+\(mailto:([^)]+)\)$/);
    const tel = line.match(/^(.+?)\s+\(tel:([^)]+)\)$/);
    if (mail) current.email = mail[2];
    else if (tel) current.phone = tel[2];
    else current.roles.push(line);
  });
  if (current) entries.push(current);
  return entries;
}

const imageMap = {
  'john adams': 'JA headshot_0.jpeg.webp',
  'dr. joaquin ruiz': 'Ruiz_Headshot.jpg.webp',
  'aaron bugaj': 'ABheadshot.jpg',
  'dr. katerina dontsova': 'Dontova_Katerina.jpg.webp',
  'dr. scott saleska': 'saleska_scott_0.jpg.webp',
  'dr. greg barron-gafford': 'Greg Barron-Gafford 2020.png.webp',
  'dr. diane thompson': 'DianeThompson-Headshot_012521-1 copy_0.jpg.webp',
  'dr. joost van haren': 'Joost_Headshot_Web.jpg.webp',
  'kai staats': 'Kai Headshot.jpg.webp',
  'jeff larsen': 'Jeff_Headshot_AI_122-MA5mhJVQugc.jpeg.webp',
  'dr. matej durcik': 'Matej17.JPG.webp',
  'wei-ren ng': 'Wei-Ren.jpg.webp',
  'matthew peterson': 'MPheadshot.jpg',
  'jason deleeuw': 'JDheadshot.jpg',
  'justin beslity': 'JBheadshot.png',
  'lia crocker': 'Lia Crocker.png.webp',
  'renee grambihler': 'Renee.jpg.webp',
  'clement lopez': 'CPheadshot.jpg',
};

function imageForPerson(name, rel) {
  const file = imageMap[name.toLowerCase()];
  if (!file) return '';
  const candidate = `CONTENT/${rel.replace(/\\/g, '/')}/IMAGES/${file}`;
  if (fs.existsSync(path.join(ROOT, candidate))) return candidate;
  const researchCandidate = `CONTENT/RESEARCH/RESEARCHDIRECTORY/IMAGES/${file}`;
  if (fs.existsSync(path.join(ROOT, researchCandidate))) return researchCandidate;
  return '';
}

function directoryPage({ file, title, eyebrow, contentRel, description }) {
  const text = readContent(contentRel);
  const entries = parseDirectory(text);
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const images = listImages(contentRel);
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        <div class="directory-intro">
          <div>
            <span class="section-label">Directory</span>
            <h2 class="section-heading">${esc(title)}</h2>
            <p>${esc(description)}</p>
          </div>
          <div class="directory-portrait-strip">
            ${entries.slice(0, 4).map((person) => {
              const img = imageForPerson(person.name, contentRel);
              return img ? `<img src="${root}${img}" alt="${esc(person.name)}" loading="lazy">` : '';
            }).join('')}
          </div>
        </div>
        <div class="profile-grid">
          ${entries.map((person) => {
            const img = imageForPerson(person.name, contentRel);
            return `
              <article class="profile-card">
                ${img ? `<img src="${root}${img}" alt="${esc(person.name)}" loading="lazy">` : ''}
                <div class="profile-card-body">
                  <h2>${esc(person.name)}</h2>
                  <p>${esc(person.roles.join(', '))}</p>
                  <div class="profile-meta">
                    ${person.phone ? `<a href="tel:${esc(person.phone)}">${esc(person.phone)}</a>` : ''}
                    ${person.email ? `<a href="mailto:${esc(person.email)}">${esc(person.email)}</a>` : ''}
                    <a href="${esc(person.url)}" target="_blank" rel="noopener">Full profile</a>
                  </div>
                </div>
              </article>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  writePage(file, pageShell({ file, title, eyebrow, description, heroImage: false, body, compact: true }));
}

function boardPage(file) {
  const text = readContent('ABOUT/BOARD');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean).slice(1);
  const cards = lines.map((line) => {
    const match = line.match(/^(.+?)(?:\s+\((https?:\/\/[^)]+)\))?(?:,\s*([^-\n]+))?\s+-\s+(.+)$/);
    if (!match) return '';
    const name = match[1];
    const url = match[2];
    const role = [match[3], match[4]].filter(Boolean).join(' - ');
    return `<article class="profile-card"><div class="profile-card-body"><h2>${esc(name)}</h2><p>${linkify(role)}</p>${url ? `<div class="profile-meta"><a href="${esc(url)}" target="_blank" rel="noopener">External profile</a></div>` : ''}</div></article>`;
  }).join('');
  const body = `<section class="internal-section"><div class="internal-shell"><span class="section-label">Governance</span><div class="profile-grid">${cards}</div></div></section>`;
  writePage(file, pageShell({
    file,
    title: 'Biosphere 2 Board',
    eyebrow: 'About',
    description: 'Board and advisory leadership supporting Biosphere 2 research, education, outreach, and public mission.',
    heroImage: false,
    body,
  }));
}

function publicationPage(file) {
  const text = readContent('RESEARCH/PUBLICATIONS');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const html = [];
  let currentSection = '';
  const sections = [];
  lines.forEach((line) => {
    if (/^#\s+/.test(line)) return;
    if (/^###\s+/.test(line)) {
      currentSection = line.replace(/^###\s+/, '');
      const id = `pub-${currentSection.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
      sections.push({ id, label: currentSection });
      html.push(`<h2 class="publication-section" id="${esc(id)}">${esc(currentSection)}</h2>`);
    } else if (/^\*\*.+\*\*$/.test(line)) {
      html.push(`<h3>${esc(line.replace(/\*\*/g, ''))}</h3>`);
    } else {
      const lower = `${currentSection} ${line}`.toLowerCase();
      const tags = [
        /landscape|leo|hillslope|basalt|hydrolog/.test(lower) ? 'leo' : '',
        /rainforest|forest|wald|canopy|drought/.test(lower) ? 'rainforest' : '',
        /ocean|coral|reef|mangrove|marine/.test(lower) ? 'ocean' : '',
        /agrivoltaic|photovoltaic|food|energy/.test(lower) ? 'agrivoltaics' : '',
        /dataset|hydroshare|figshare|zenodo|pangaea|repository/.test(lower) ? 'datasets' : '',
      ].filter(Boolean).join(' ');
      html.push(`<article class="publication-card" data-pub-section="${esc(currentSection)}" data-pub-tags="${esc(tags)}"><p>${linkUrlsOnly(line.replace(/\*\*/g, ''))}</p></article>`);
    }
  });
  const controls = `
    <div class="publication-tools" data-publication-tools>
      <label class="publication-search">
        <span>Search publications</span>
        <input type="search" data-publication-search placeholder="Search author, year, DOI, system">
      </label>
      <div class="publication-filters" aria-label="Publication filters">
        <button type="button" class="pub-filter active" data-pub-filter="all">All</button>
        <button type="button" class="pub-filter" data-pub-filter="leo">LEO</button>
        <button type="button" class="pub-filter" data-pub-filter="rainforest">Rainforest</button>
        <button type="button" class="pub-filter" data-pub-filter="ocean">Ocean / Mangroves</button>
        <button type="button" class="pub-filter" data-pub-filter="agrivoltaics">Agrivoltaics</button>
        <button type="button" class="pub-filter" data-pub-filter="datasets">Datasets</button>
      </div>
      <div class="publication-jump">
        ${sections.map((section) => `<a href="#${esc(section.id)}">${esc(section.label)}</a>`).join('')}
      </div>
      <p class="publication-count" data-publication-count></p>
    </div>`;
  const body = `<section class="internal-section"><div class="internal-shell"><div class="archive-intro"><div><span class="section-label">Research Archive</span><h2 class="section-heading">Searchable publications by system</h2><p>Browse Biosphere 2 publications by research area, year, author, DOI, and dataset source.</p></div><div class="archive-stat-grid"><div><strong>${sections.length}</strong><span>Sections</span></div><div><strong>1990s+</strong><span>Archive span</span></div><div><strong>DOI</strong><span>Source links</span></div></div></div>${controls}<div class="article-flow wide publication-list">${html.join('\n')}</div></div></section>`;
  writePage(file, pageShell({
    file,
    title: 'Publications',
    eyebrow: 'Research',
    description: 'A research publication archive for Biosphere 2 systems, the Landscape Evolution Observatory, rainforest, ocean, and related programs.',
    heroImage: 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/DataRepositories.png.webp',
    body,
    compact: false,
  }));
}

function extractBiomeSection(name) {
  const text = readContent('RESEARCH/B2ECOSYSTEMS');
  const headings = ['Tropical Rain Forest', 'Ocean', 'Landscape Evolution Observatory (LEO)', 'Coastal Fog Desert', 'Mangroves', 'Savanna', 'Citations'];
  const start = text.indexOf(name);
  const next = headings
    .filter((heading) => heading !== name)
    .map((heading) => text.indexOf(heading, start + name.length))
    .filter((index) => index > start)
    .sort((a, b) => a - b)[0] || text.length;
  return text.slice(start, next).trim();
}

function customPage(file, config, text, heroImage, pageImages = []) {
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const resourceLinks = extractLinks(text).slice(0, 8);
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        ${config.showResourceBar !== false && resourceLinks.length ? `<div class="resource-bar">${resourceLinks.map((link) => `<a${linkAttrs(link.href)}>${esc(link.label)}</a>`).join('')}</div>` : ''}
        ${renderArticle(text)}
      </div>
    </section>
    ${renderFeatureBand({
      images: pageImages,
      root,
      title: config.mediaTitle || config.title,
      eyebrow: config.mediaEyebrow || 'Field View',
      text: config.mediaText || '',
    })}`;
  writePage(file, pageShell({
    file,
    title: config.title,
    eyebrow: config.eyebrow,
    description: config.description || sentence(text),
    heroImage,
    body,
    compact: config.compact || false,
  }));
}

const visitHero = 'CONTENT/RESEARCH/RI/IMAGES/B2 front (3).JPG.webp';
const visitHistoryImage = 'CONTENT/ABOUT/ABOUTB2/IMAGES/B2_history.jpg.webp';
const visitConferenceImage = 'CONTENT/CONFERENCECENTER/CENTEROVERVIEW/IMAGES/Wedding on cafe patio (2).JPG.webp';

function visitPage(file, variant) {
  const text = readContent('VISIT/VISIT');
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const linkCards = [
    { title: 'Learn more about tour app', href: 'https://biosphere2.org/visit/biosphere-2-experience/tour-biosphere-2', text: 'The Biosphere 2 Experience app includes never-before-seen photos and videos that visualize the science and 30-year history.' },
    { title: 'Buy TICKETS Now and Save', href: 'http://115199.blackbaudhosting.com/115199/tickets?tab=3&txobjid=a0d697e9-f535-4000-806c-5594e5e3769a', text: 'The Biosphere 2 Experience will take approximately 1 hour 15 minutes to complete.' },
  ];
  const sourceCopy = {
    overview: [
      lines[0],
      'Visit Biosphere 2',
      'The Biosphere 2 Experience app includes never-before-seen photos and videos that visualize the science and 30-year history. Through science stories and interviews, you\'ll have the opportunity to learn more about our amazing, world-class research as you traverse around the exterior and through the human habitat and wilderness areas of Biosphere 2!',
      'The Biosphere 2 Experience will take approximately 1 hour 15 minutes to complete.',
      'Biosphere 2 is open every day (except Thanksgiving and Christmas) from 9 am-4 pm.',
    ].join('\n\n'),
    tours: [
      'Biosphere 2 is Open with a Great New Experience!',
      'Buy TICKETS Now and Save (http://115199.blackbaudhosting.com/115199/tickets?tab=3&txobjid=a0d697e9-f535-4000-806c-5594e5e3769a)',
      'The Biosphere 2 Experience will take approximately 1 hour 15 minutes to complete.',
      'Biosphere 2 is open every day (except Thanksgiving and Christmas) from 9 am-4 pm.',
    ].join('\n\n'),
    app: [
      'Learn more about tour app (https://biosphere2.org/visit/biosphere-2-experience/tour-biosphere-2)',
      'The Biosphere 2 Experience app includes never-before-seen photos and videos that visualize the science and 30-year history. Through science stories and interviews, you\'ll have the opportunity to learn more about our amazing, world-class research as you traverse around the exterior and through the human habitat and wilderness areas of Biosphere 2!',
    ].join('\n\n'),
    accessibility: [
      'Visit Biosphere 2',
      'The Biosphere 2 Experience will take approximately 1 hour 15 minutes to complete.',
      'Biosphere 2 is open every day (except Thanksgiving and Christmas) from 9 am-4 pm.',
      'For questions before your visit, contact Biosphere 2 at bio2-info@arizona.edu.',
    ].join('\n\n'),
  };
  const configs = {
    overview: {
      title: 'Visit Biosphere 2',
      description: 'Plan a visit to Biosphere 2 and explore the app-guided experience through the habitat, wilderness areas, and research stories.',
      hero: visitHero,
      related: [{ label: 'Tours', href: 'tours/index.html' }, { label: 'App Experience', href: 'app/index.html' }, { label: 'K-12 Field Trips', href: '../education/k12/index.html' }],
    },
    tours: {
      title: 'Tours & Tickets',
      description: 'Buy tickets and prepare for the Biosphere 2 Experience, an app-guided tour of the science and history of the facility.',
      hero: visitHistoryImage,
      related: [{ label: 'Tour App', href: '../app/index.html' }, { label: 'Plan Your Visit', href: '../index.html' }],
    },
    app: {
      title: 'The App Experience',
      description: 'The Biosphere 2 Experience app brings photos, videos, science stories, and interviews into the self-guided tour.',
      hero: visitHero,
      related: [{ label: 'Plan Your Visit', href: '../index.html' }, { label: 'Tickets', href: 'http://115199.blackbaudhosting.com/115199/tickets?tab=3&txobjid=a0d697e9-f535-4000-806c-5594e5e3769a' }],
    },
    accessibility: {
      title: 'Accessibility',
      description: 'Planning information for guests preparing to experience Biosphere 2.',
      hero: visitConferenceImage,
      related: [{ label: 'Plan Your Visit', href: '../index.html' }, { label: 'Tickets', href: 'http://115199.blackbaudhosting.com/115199/tickets?tab=3&txobjid=a0d697e9-f535-4000-806c-5594e5e3769a' }],
    },
  };
  const config = configs[variant];
  const aside = `
        <aside class="quick-card">
          <h2>Visit Links</h2>
          <ul>${config.related.map((item) => `<li><a ${/^https?:/i.test(item.href) ? linkAttrs(item.href) : `href="${item.href}"`}>${esc(item.label)}</a></li>`).join('')}</ul>
        </aside>`;
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell content-layout">
        <div>
          <div class="visit-action-grid">
            ${linkCards.map((card) => `<a class="link-card" ${linkAttrs(card.href)}><h2>${esc(card.title)}</h2><p>${esc(card.text)}</p></a>`).join('')}
          </div>
          ${renderArticle(sourceCopy[variant])}
        </div>
        ${aside}
      </div>
    </section>
    ${renderFeatureBand({
      images: [visitHero, visitHistoryImage, visitConferenceImage].filter((src) => src !== config.hero),
      root,
      title: 'Experience Biosphere 2',
      eyebrow: 'Visit',
      text: 'Through science stories and interviews, you\'ll have the opportunity to learn more about our amazing, world-class research as you traverse around the exterior and through the human habitat and wilderness areas of Biosphere 2!',
    })}`;
  writePage(file, pageShell({
    file,
    title: config.title,
    eyebrow: 'Visit',
    description: config.description,
    heroImage: config.hero,
    body,
  }));
}

function formPage({ file, title, eyebrow, description, formUrl, buttonLabel, related = [], visualImage = '', visualText = '' }) {
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        <div class="cta-band${visualImage ? ' with-media' : ''}">
          <div>
            <span class="section-label">${esc(eyebrow)}</span>
            <h2>${esc(title)}</h2>
            <p>${esc(description)}</p>
          </div>
          ${visualImage ? `<figure class="cta-visual">${localImage(visualImage, root, visualText || title)}<figcaption>${esc(visualText || title)}</figcaption></figure>` : ''}
          <div class="cta-actions">
            <a class="btn-primary" href="${esc(formUrl)}" target="_blank" rel="noopener">${esc(buttonLabel)}</a>
          </div>
        </div>
        ${related.length ? `
          <div class="card-grid compact-grid">
            ${related.map((item) => `
              <article class="content-card">
                <h2>${esc(item.label)}</h2>
                <p>${esc(item.text)}</p>
                <a class="text-link" href="${esc(item.href)}">${esc(item.cta || 'Explore page')}</a>
              </article>
            `).join('')}
          </div>` : ''}
      </div>
    </section>`;
  writePage(file, pageShell({
    file,
    title,
    eyebrow,
    description,
    heroImage: visualImage || false,
    body,
    compact: !visualImage,
  }));
}

function facilitiesPage(file) {
  const text = readContent('CONFERENCECENTER/FACILITIES');
  const images = listImages('CONFERENCECENTER/FACILITIES').filter((src) => !/kim headshot/i.test(src));
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const hero = images.find((src) => /facility_1/i.test(src)) || images[0];
  const featureImages = images.filter((src) => src !== hero);
  const openingImage = images.find((src) => /living room|kitchen/i.test(src)) || images.find((src) => /upgraded bedroom|FacGal|casita/i.test(src)) || featureImages[0];
  const galleryImages = featureImages.filter((src) => src !== openingImage);
  const body = `
    ${renderImageTextSplit({
      image: openingImage,
      root,
      title: 'Spaces, Casitas, and Event Settings',
      eyebrow: 'Conference Facilities',
      text: 'Our unique venues, conference rooms and unconventional meeting spaces bring your event ideas to life.',
      reverse: true,
    })}
    <section class="internal-section tight">
      <div class="internal-shell content-layout">
        <div>
          ${renderArticle(text)}
        </div>
        <aside class="quick-card">
          <h2>Plan an Event</h2>
          <ul>
            <li><a href="../inquiry/index.html">Reservation Inquiry</a></li>
            <li><a href="../overview/index.html">Conference Overview</a></li>
          </ul>
        </aside>
      </div>
    </section>
    <section class="internal-section alt">
      <div class="internal-shell">
        <span class="section-label">Facilities</span>
        <h2 class="section-heading">Spaces, Casitas, and Event Settings</h2>
        ${renderImageFeatures(galleryImages, root, 'Conference Facilities', { limit: galleryImages.length, expanded: true })}
      </div>
    </section>`;
  writePage(file, pageShell({
    file,
    title: 'Conference Facilities',
    eyebrow: 'Conference',
    description: sentence(text),
    heroImage: hero,
    body,
  }));
}

function socialPage(file) {
  const text = readContent('MEDIA/SOCIALMEDIA');
  const depth = depthFor(file);
  const root = rootPrefix(depth);
  const images = listImages('MEDIA/SOCIALMEDIA');
  const intro = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !/\(https?:\/\//i.test(line) && !/YouTube Logo/i.test(line))
    .join('\n\n');
  const logoFor = (pattern) => images.find((src) => pattern.test(src)) || '';
  const cards = [
    { platform: 'Facebook', href: 'https://www.facebook.com/Biosphere2', image: logoFor(/fb|facebook/i) },
    { platform: 'Instagram', href: 'https://www.instagram.com/biosphere2/', image: logoFor(/instagram/i) },
    { platform: 'Twitter', href: 'https://twitter.com/B2science', image: logoFor(/twitter/i) },
    { platform: 'TikTok', href: 'https://www.tiktok.com/@biosphere2?lang=en', image: logoFor(/tiktok/i) },
    { platform: 'YouTube', href: 'https://www.youtube.com/@Biosphere2', image: logoFor(/youtube/i) },
  ];
  const body = `
    <section class="internal-section tight">
      <div class="internal-shell">
        <div class="social-intro">
          ${renderArticle(intro)}
        </div>
        <div class="social-grid">
          ${cards.map((card) => `
            <a class="social-card" ${linkAttrs(card.href)}>
              ${card.image ? localImage(card.image, root, `${card.platform} logo`, 'social-logo') : ''}
              <span>${esc(card.platform)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>`;
  writePage(file, pageShell({
    file,
    title: 'Social Media',
    eyebrow: 'Media',
    description: 'Stay up to date on all things Biosphere 2 by following our social media pages.',
    heroImage: false,
    body,
    compact: true,
  }));
}

const commonAbout = [
  { label: 'History & Mission', href: '../history/index.html' },
  { label: 'Leadership', href: '../leadership/index.html' },
  { label: 'Strategic Plan', href: '../strategic-plan/index.html' },
  { label: 'Get Involved', href: '../partners/index.html' },
];

contentPage({ file: 'about/history/index.html', title: 'History & Mission', eyebrow: 'About', contentRel: 'ABOUT/ABOUTB2', related: commonAbout });
directoryPage({ file: 'about/leadership/index.html', title: 'Leadership Directory', eyebrow: 'About', contentRel: 'ABOUT/LEADERSHIP', description: 'Biosphere 2 leadership across operations, research systems, innovation, and public mission.' });
boardPage('about/board/index.html');
contentPage({ file: 'about/strategic-plan/index.html', title: 'Research Strategic Plan', eyebrow: 'About', contentRel: 'ABOUT/RSP', related: commonAbout, heroImage: 'CONTENT/ABOUT/RSP/IMAGES/5Pillars.png' });
contentPage({ file: 'about/partners/index.html', title: 'Get Involved', eyebrow: 'About', contentRel: 'ABOUT/GETINVOLVED', related: commonAbout, galleryLimit: 4 });

visitPage('visit/index.html', 'overview');
visitPage('visit/tours/index.html', 'tours');
visitPage('visit/app/index.html', 'app');
visitPage('visit/accessibility/index.html', 'accessibility');

contentPage({ file: 'research/index.html', title: 'Research Initiatives', eyebrow: 'Research', contentRel: 'RESEARCH/RI', related: [{ label: 'Systems & Biomes', href: 'systems/index.html' }, { label: 'Systems Data', href: 'data/index.html' }, { label: 'User Facility', href: 'user-facility/index.html' }] });
contentPage({ file: 'research/systems/index.html', title: 'Biosphere 2 Ecosystems', eyebrow: 'Research', contentRel: 'RESEARCH/B2ECOSYSTEMS', heroImage: 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/B2_rainforest_biome.jpg.webp', pageImages: ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean.JPG.webp', 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/leo.jpg.webp', 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/desert.jpg', 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/mangroves.jpeg', 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Savanna.jpg.webp'], related: [{ label: 'Rainforest', href: '../rainforest/index.html' }, { label: 'Ocean', href: '../ocean/index.html' }, { label: 'LEO', href: '../leo/index.html' }], imageLimit: 5, expandedImages: true });
customPage('research/rainforest/index.html', { title: 'Tropical Rainforest', eyebrow: 'Research', description: 'A controlled tropical rainforest for studying plant, water, gas, and climate interactions.', mediaText: 'Research in the rain forest focuses on the interaction between plants, gases in the air and water.' }, extractBiomeSection('Tropical Rain Forest'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/B2_rainforest_biome.jpg.webp', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/B2_rainforest_biome.jpg.webp', 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/B2_RF_Mountain.jpg.webp']);
customPage('research/ocean/index.html', { title: 'Ocean Reef Lab', eyebrow: 'Research', description: 'The world largest enclosed marine mesocosm dedicated to coral reef resilience research and education.', mediaText: 'The Biosphere 2 Marine Mesocosm is a complete ocean system originally designed to simulate a Caribbean reef.' }, extractBiomeSection('Ocean'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean.JPG.webp', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Ocean.JPG.webp', 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/3_Biomes_Ocean_Photo_Option 3.jpg.webp']);
customPage('research/leo/index.html', { title: 'Landscape Evolution Observatory', eyebrow: 'Research', description: 'A macrocosm experiment for controlled study of water, rock, microbes, plants, and evolving landscapes.', mediaText: 'Initial sensor, sampler, and soil-coring data are providing insights into the linkages between water flow, weathering, and biological community development.' }, extractBiomeSection('Landscape Evolution Observatory (LEO)'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/leo.jpg.webp', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/leo.jpg.webp', 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/SCADA.jpg', 'CONTENT/RESEARCH/NEWSYSTEMSDATA/IMAGES/DataRepositories.png.webp']);
customPage('research/desert/index.html', { title: 'Coastal Fog Desert', eyebrow: 'Research', mediaText: 'Current management practices are intended to favor arid-adapted species and discourage grasses with C4 photosynthetic pathways.' }, extractBiomeSection('Coastal Fog Desert'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/desert.jpg', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/desert.jpg']);
customPage('research/mangroves/index.html', { title: 'Mangroves', eyebrow: 'Research', mediaText: 'The Mangrove mesocosm is comprised of two major wetland types: marshes and forested swamps dominated by mangrove trees.' }, extractBiomeSection('Mangroves'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/mangroves.jpeg', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Mangrove2_scrubs.png', 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/mangroves.jpeg']);
customPage('research/savanna/index.html', { title: 'Savanna', eyebrow: 'Research', mediaText: 'The savanna biome was designed to provide a hydrological transition zone between the desert and rainforest mesocosms.' }, extractBiomeSection('Savanna'), 'CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Savanna.jpg.webp', ['CONTENT/RESEARCH/B2ECOSYSTEMS/IMAGES/Savanna.jpg.webp']);
customPage('research/agrivoltaics/index.html', { title: 'Agrivoltaics', eyebrow: 'Research', description: 'Food, water, and energy research using Biosphere 2 capabilities and user-facility collaborations.', compact: true, showResourceBar: false }, `Biosphere 2 supports food, water, and energy research as part of its mission to develop scalable resilience solutions.\n\nBiosphere 2 is a user facility actively accepting proposals for research. Researchers interested in collaboration or conducting work at the facility should review the user facility information and submit a research interest form.\n\nUser Facility Research Interest form (https://uarizona.co1.qualtrics.com/jfe/form/SV_3WdvvK9MVEVzlxs)`, false);
customPage('research/space/index.html', { title: 'Space Analogues', eyebrow: 'Research', description: 'Space-analogue research at Biosphere 2 builds on controlled-environment science and the Space Analog for the Moon and Mars.', compact: true, showResourceBar: false }, `Biosphere 2 began with the question of how enclosed systems might support long-duration human life beyond Earth. That legacy continues through research systems including the Space Analog for the Moon and Mars (SAM).\n\nThe work connects controlled environments, life-support thinking, food production, engineering, and Earth systems science. Researchers interested in using Biosphere 2 capabilities can begin with the user facility process.\n\nUser Facility Research Interest form (https://uarizona.co1.qualtrics.com/jfe/form/SV_3WdvvK9MVEVzlxs)`, false);
contentPage({ file: 'research/data/index.html', title: 'Live Systems Data', eyebrow: 'Research', contentRel: 'RESEARCH/NEWSYSTEMSDATA', related: [{ label: 'Publications', href: '../publications/index.html' }, { label: 'User Facility', href: '../user-facility/index.html' }], imageLimit: 5, expandedImages: true, showResourceBar: false });
publicationPage('research/publications/index.html');
directoryPage({ file: 'research/directory/index.html', title: 'Research Directory', eyebrow: 'Research', contentRel: 'RESEARCH/RESEARCHDIRECTORY', description: 'Scientists, research specialists, technologists, and staff supporting Biosphere 2 research systems.' });
contentPage({ file: 'research/user-facility/index.html', title: 'User Facility Information', eyebrow: 'Research', contentRel: 'RESEARCH/USERFACILITYINFORMATION', related: [{ label: 'Research Interest Form', href: 'https://uarizona.co1.qualtrics.com/jfe/form/SV_3WdvvK9MVEVzlxs' }, { label: 'Systems Data', href: '../data/index.html' }] });
contentPage({ file: 'research/sab/index.html', title: 'Science Advisory Board', eyebrow: 'Research', contentRel: 'RESEARCH/SAB', related: [{ label: 'Research Directory', href: '../directory/index.html' }, { label: 'Strategic Plan', href: '../../about/strategic-plan/index.html' }], compact: true });
contentPage({ file: 'research/rsp/index.html', title: 'Research Strategic Plan', eyebrow: 'Research', contentRel: 'RESEARCH/RSP', heroImage: 'CONTENT/RESEARCH/RSP/IMAGES/5Pillars.png' });
contentPage({ file: 'research/reu/index.html', title: 'Research REU Experience', eyebrow: 'Research', contentRel: 'RESEARCH/REU', related: [{ label: 'Education REU', href: '../../education/reu/index.html' }, { label: 'Research Directory', href: '../directory/index.html' }], showResourceBar: false });
contentPage({ file: 'research/legacy-systems-data/index.html', title: 'Systems Data Archive', eyebrow: 'Research', contentRel: 'RESEARCH/SYSTEMSDATA' });

contentPage({ file: 'education/k12/index.html', title: 'K-12 Education', eyebrow: 'Education', contentRel: 'EDUCATION/K12', related: [{ label: 'Group Reservation Form', href: 'https://uarizona.co1.qualtrics.com/jfe/form/SV_eVzHdvElm1iizGe' }, { label: 'REU Experience', href: '../reu/index.html' }] });
formPage({
  file: 'education/group-reservation/index.html',
  title: 'Group Reservation Form',
  eyebrow: 'Education',
  description: 'Start a group reservation request for Biosphere 2 educational visits through the official University of Arizona form.',
  formUrl: 'https://uarizona.co1.qualtrics.com/jfe/form/SV_eVzHdvElm1iizGe',
  buttonLabel: 'Open Reservation Form',
  related: [
    { label: 'K-12 Education', href: '../k12/index.html', text: 'Explore field-trip options, student programs, and classroom connections.', cta: 'View K-12 programs' },
    { label: 'Visit Biosphere 2', href: '../../visit/index.html', text: 'Plan a public visit, tour, or app-guided experience at Biosphere 2.', cta: 'Plan a visit' },
  ],
  visualImage: 'CONTENT/EDUCATION/K12/IMAGES/wide k12_.png.webp',
  visualText: 'Biosphere 2 education visits',
});
contentPage({ file: 'education/university/index.html', title: 'University Programs', eyebrow: 'Education', contentRel: 'EDUCATION/UNIVERSITYPROGRAMS', related: [{ label: 'REU Experience', href: '../reu/index.html' }, { label: 'Broader Impacts', href: '../impact/index.html' }] });
contentPage({ file: 'education/reu/index.html', title: 'REU Experience', eyebrow: 'Education', contentRel: 'EDUCATION/REU', related: [{ label: 'University Programs', href: '../university/index.html' }], showResourceBar: false });
contentPage({ file: 'education/impact/index.html', title: 'Education & Broader Impacts', eyebrow: 'Education', contentRel: 'EDUCATION/EDUCATIONBROADERIMPACTS', related: [{ label: 'K-12 Education', href: '../k12/index.html' }, { label: 'University Programs', href: '../university/index.html' }] });

contentPage({ file: 'conference/overview/index.html', title: 'Conference Center Overview', eyebrow: 'Conference', contentRel: 'CONFERENCECENTER/CENTEROVERVIEW', heroImage: 'CONTENT/CONFERENCECENTER/CENTEROVERVIEW/IMAGES/Wedding on cafe patio (2).JPG.webp', related: [{ label: 'Meeting Spaces', href: '../spaces/index.html' }, { label: 'Reservation Inquiry', href: 'https://uarizona.co1.qualtrics.com/jfe/form/SV_3NJiWwQXHTfWLga' }] });
facilitiesPage('conference/spaces/index.html');
formPage({
  file: 'conference/inquiry/index.html',
  title: 'Reservation Inquiry',
  eyebrow: 'Conference',
  description: 'Start a conference center reservation inquiry through the official University of Arizona form.',
  formUrl: 'https://uarizona.co1.qualtrics.com/jfe/form/SV_3NJiWwQXHTfWLga',
  buttonLabel: 'Open Inquiry Form',
  related: [
    { label: 'Conference Facilities', href: '../spaces/index.html', text: 'Review meeting rooms, gathering spaces, dining settings, and lodging options.', cta: 'View facilities' },
    { label: 'Conference Overview', href: '../overview/index.html', text: 'See how Biosphere 2 supports retreats, meetings, and special events.', cta: 'View overview' },
  ],
  visualImage: 'CONTENT/CONFERENCECENTER/FACILITIES/IMAGES/facility_1.jpg.webp',
  visualText: 'Conference facilities at Biosphere 2',
});

overviewPage({
  file: 'media/index.html',
  title: 'Media',
  eyebrow: 'Newsroom',
  description: 'Media contacts, press resources, social channels, and recent Biosphere 2 stories.',
  cards: [
    { title: 'Media Contact', href: 'contact/index.html', text: 'Filming inquiries, urgent media requests, and press kit access.' },
    { title: 'Press Archive', href: 'press/index.html', text: 'Recent articles, features, and coverage related to Biosphere 2.' },
    { title: 'Media Spotlight', href: 'spotlight/index.html', text: 'Highlighted stories and notable coverage from across the Biosphere 2 community.' },
    { title: 'Social Media', href: 'social/index.html', text: 'Official social channels for following Biosphere 2 updates.' },
  ],
});
contentPage({ file: 'media/contact/index.html', title: 'Media Contact', eyebrow: 'Media', contentRel: 'MEDIA/CONTACT', related: [{ label: 'Press Archive', href: '../press/index.html' }, { label: 'Social Media', href: '../social/index.html' }], showResourceBar: false });
contentPage({ file: 'media/press/index.html', title: 'Press Archive', eyebrow: 'Media', contentRel: 'MEDIA/PRESS', related: [{ label: 'Media Contact', href: '../contact/index.html' }, { label: 'Media Spotlight', href: '../spotlight/index.html' }], showResourceBar: false });
socialPage('media/social/index.html');
spotlightPage('media/spotlight/index.html');
contentPage({ file: 'contact/index.html', title: 'Contact Us', eyebrow: 'Connect', contentRel: 'MEDIA/CONTACT', related: [{ label: 'Media Contact', href: '../media/contact/index.html' }, { label: 'Visit', href: '../visit/index.html' }] });
contentPage({ file: 'annual-symposium/index.html', title: 'Annual Symposium', eyebrow: 'Calendar', contentRel: 'ANNUAL SYMPOSIUM', related: [{ label: 'Research Initiatives', href: '../research/index.html' }, { label: 'University Programs', href: '../education/university/index.html' }] });
directoryPage({ file: 'directory/index.html', title: 'Directory', eyebrow: 'Connect', contentRel: 'RESEARCH/RESEARCHDIRECTORY', description: 'A quick directory of Biosphere 2 personnel and research contacts.' });

directoryPage({ file: 'pages/about/leadership.html', title: 'Leadership Directory', eyebrow: 'About', contentRel: 'ABOUT/LEADERSHIP', description: 'Biosphere 2 leadership across operations, research systems, innovation, and public mission.' });
boardPage('pages/about/board.html');
contentPage({
  file: 'pages/about/strategic-plan.html',
  title: 'Research Strategic Plan',
  eyebrow: 'About',
  contentRel: 'ABOUT/RSP',
  heroImage: 'CONTENT/ABOUT/RSP/IMAGES/5Pillars.png',
  related: [
    { label: 'History & Mission', href: '../../about/history/index.html' },
    { label: 'Leadership', href: '../../about/leadership/index.html' },
    { label: 'Get Involved', href: '../../about/partners/index.html' },
  ],
});

console.log('Generated Biosphere 2 internal pages.');
