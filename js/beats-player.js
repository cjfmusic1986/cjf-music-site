(() => {
  const cards = [...document.querySelectorAll('.album-grid .album')];
  const tracks = cards.map(card => ({
    title: card.querySelector('h3')?.textContent.trim() || 'Untitled',
    src: card.querySelector('audio source')?.getAttribute('src'),
    image: card.querySelector('img')?.getAttribute('src') || ''
  })).filter(t => t.src);
  if (!tracks.length) return;
  const audio = document.getElementById('cjf-audio');
  const title = document.getElementById('cjf-track-title');
  const cover = document.getElementById('cjf-track-cover');
  const toggle = document.getElementById('cjf-toggle');
  const seek = document.getElementById('cjf-seek');
  const elapsed = document.getElementById('cjf-elapsed');
  const duration = document.getElementById('cjf-duration');
  const volume = document.getElementById('cjf-volume');
  let index = 0;
  const format = n => Number.isFinite(n) ? `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}` : '0:00';
  const refresh = () => {
    title.textContent = tracks[index].title;
    cover.src = tracks[index].image;
    toggle.textContent = audio.paused ? '▶' : '❚❚';
    toggle.setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
    cards.forEach((card, i) => card.classList.toggle('cjf-active', i === index));
  };
  const play = async () => { try { await audio.play(); } catch(e) { console.warn('Audio playback failed', e); } };
  function select(i, autoplay = true) {
    index = (i + tracks.length) % tracks.length;
    audio.src = tracks[index].src;
    audio.load();
    seek.value = 0;
    elapsed.textContent = '0:00'; duration.textContent = '0:00';
    refresh();
    if (autoplay) play();
  }
  cards.forEach((card, i) => {
    const old = card.querySelector('audio');
    if (old) old.remove();
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'cjf-card-play';
    button.textContent = '▶ Listen';
    button.addEventListener('click', () => select(i));
    card.querySelector('h3')?.insertAdjacentElement('afterend', button);
  });
  toggle.addEventListener('click', () => audio.paused ? play() : audio.pause());
  document.getElementById('cjf-prev').addEventListener('click', () => audio.currentTime > 3 ? audio.currentTime = 0 : select(index-1));
  document.getElementById('cjf-next').addEventListener('click', () => select(index+1));
  audio.addEventListener('play', refresh);
  audio.addEventListener('pause', refresh);
  audio.addEventListener('ended', () => select(index+1));
  audio.addEventListener('loadedmetadata', () => duration.textContent = format(audio.duration));
  audio.addEventListener('timeupdate', () => {
    elapsed.textContent = format(audio.currentTime);
    seek.value = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration * 100 : 0;
  });
  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) audio.currentTime = Number(seek.value) / 100 * audio.duration;
  });
  volume.addEventListener('input', () => audio.volume = Number(volume.value) / 100);
  audio.volume = .8;
  select(0, false);
})();
