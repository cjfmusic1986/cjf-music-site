// Add your own authorized, publicly reachable MP3 URLs here.
// The player stays disabled until at least one track is configured.


const tracks = [
  {
    title: "97' CJF",
    artist: "CJF1986",
    src: "beats/97' CJF.mp3"
  },
  {
    title: "DENZEL IN TRAINING DAY",
    artist: "CJF1986",
    src: "beats/DENZEL IN TRAINING DAY.mp3"
  },
  {
    title: "Martin Scorsese Movie",
    artist: "CJF1986",
    src: "beats/Martin Scorsese Movie.mp3"
  },
  {
    title: "Better Way",
    artist: "CJF1986",
    src: "beats/Better Way.mp3"
  }
];



(() => {
  const $ = id => document.getElementById(id);
  const audio = $('cjf-audio');
  const play = $('cjf-play');
  const album = $('cjf-play-album');
  const list = $('cjf-tracklist');
  const seek = $('cjf-seek');
  const fmt = n => Number.isFinite(n) ? `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}` : '0:00';
  let index = 0;
  const available = tracks.filter(t => t.title && t.src);
  if (!available.length) { list.textContent = 'Tracks will appear here when MP3 files are added.'; return; }
  play.disabled = album.disabled = false;
  function draw() {
    list.replaceChildren();
    available.forEach((t, i) => {
      const btn = document.createElement('button');
      btn.className = 'cjf-track' + (i === index ? ' active' : '');
      const number = document.createElement('span'); number.className = 'cjf-track-index'; number.textContent = i + 1;
      const name = document.createElement('span'); name.className = 'cjf-track-name'; name.textContent = t.title;
      const icon = document.createElement('span'); icon.textContent = i === index && !audio.paused ? '♫' : '▶';
      btn.append(number, name, icon);
      btn.addEventListener('click', () => load(i, true));
      list.append(btn);
    });
  }
  async function start() { try { await audio.play(); } catch (err) { console.warn('Playback blocked or audio unavailable', err); } }
  function load(i, autoplay = false) {
    index = (i + available.length) % available.length;
    const t = available[index];
    audio.src = t.src;
    $('cjf-player-title').textContent = t.title;
    $('cjf-player-art').src = t.cover || 'images/CJF Music Logo.png';
    $('cjf-elapsed').textContent = $('cjf-duration').textContent = '0:00';
    seek.value = 0; draw();
    if (autoplay) start();
  }
  play.addEventListener('click', () => audio.paused ? start() : audio.pause());
  album.addEventListener('click', () => load(0, true));
  $('cjf-next').addEventListener('click', () => load(index + 1, true));
  $('cjf-prev').addEventListener('click', () => audio.currentTime > 3 ? audio.currentTime = 0 : load(index - 1, true));
  audio.addEventListener('play', () => { play.textContent = '⏸'; play.setAttribute('aria-label','Pause'); draw(); });
  audio.addEventListener('pause', () => { play.textContent = '▶'; play.setAttribute('aria-label','Play'); draw(); });
  audio.addEventListener('loadedmetadata', () => $('cjf-duration').textContent = fmt(audio.duration));
  audio.addEventListener('timeupdate', () => { $('cjf-elapsed').textContent = fmt(audio.currentTime); if (Number.isFinite(audio.duration) && audio.duration > 0) seek.value = audio.currentTime / audio.duration * 100; });
  seek.addEventListener('input', () => { if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = audio.duration * Number(seek.value) / 100; });
  $('cjf-volume').addEventListener('input', e => audio.volume = Number(e.target.value) / 100);
  audio.addEventListener('ended', () => load(index + 1, true));
  audio.addEventListener('error', () => console.warn('Audio could not be loaded:', audio.currentSrc));
  audio.volume = .8; load(0);
})();
