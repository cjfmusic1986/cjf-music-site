
(() => {
  const cards = [...document.querySelectorAll('.album-grid .album')];

  const tracks = cards.map(card => ({
    title: card.querySelector('h3')?.textContent.trim() || 'Untitled',
    src: card.querySelector('audio source')?.getAttribute('src'),
    image: card.querySelector('img')?.getAttribute('src') || 'images/CJF Music Logo.png'
  })).filter(track => track.src);

  const audio = document.getElementById('cjf-audio');
  const title = document.getElementById('cjf-track-title');
  const cover = document.getElementById('cjf-track-cover');
  const toggle = document.getElementById('cjf-toggle');
  const prev = document.getElementById('cjf-prev');
  const next = document.getElementById('cjf-next');
  const seek = document.getElementById('cjf-seek');
  const elapsed = document.getElementById('cjf-elapsed');
  const duration = document.getElementById('cjf-duration');
  const volume = document.getElementById('cjf-volume');

  if (!audio || !title || !cover || !toggle ||
      !prev || !next || !seek || !elapsed ||
      !duration || !volume) {
    return;
  }

  const format = seconds => {
    if (!Number.isFinite(seconds)) return '0:00';

    return `${Math.floor(seconds / 60)}:${String(
      Math.floor(seconds % 60)
    ).padStart(2, '0')}`;
  };

  // Handle an empty Beats page.
  if (!tracks.length) {
    title.textContent = 'No beats available yet';
    cover.src = 'images/CJF Music Logo.png';

    toggle.textContent = '▶';
    toggle.disabled = true;
    prev.disabled = true;
    next.disabled = true;
    seek.disabled = true;

    elapsed.textContent = '0:00';
    duration.textContent = '0:00';

    return;
  }

  let index = 0;

  const refresh = () => {
    title.textContent = tracks[index].title;
    cover.src = tracks[index].image;

    toggle.textContent = audio.paused ? '▶' : '❚❚';
    toggle.setAttribute(
      'aria-label',
      audio.paused ? 'Play' : 'Pause'
    );

    cards.forEach((card, i) => {
      card.classList.toggle('cjf-active', i === index);
    });
  };

  const play = async () => {
    try {
      await audio.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  function select(i, autoplay = true) {
    index = (i + tracks.length) % tracks.length;

    audio.pause();
    audio.src = tracks[index].src;
    audio.load();

    seek.value = 0;
    elapsed.textContent = '0:00';
    duration.textContent = '0:00';

    refresh();

    if (autoplay) play();
  }

  // Connect each beat card to the bottom player.
  cards.forEach((card, i) => {
    const oldAudio = card.querySelector('audio');

    if (oldAudio) oldAudio.remove();

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cjf-card-play';
    button.textContent = '▶ Listen';

    button.addEventListener('click', () => select(i));

    card.querySelector('h3')?.insertAdjacentElement(
      'afterend',
      button
    );
  });

  // Bottom player controls.
  toggle.addEventListener('click', () => {
    if (audio.paused) {
      play();
    } else {
      audio.pause();
    }
  });

  prev.addEventListener('click', () => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      select(index - 1);
    }
  });

  next.addEventListener('click', () => {
    select(index + 1);
  });

  audio.addEventListener('play', refresh);
  audio.addEventListener('pause', refresh);

  audio.addEventListener('ended', () => {
    select(index + 1);
  });

  audio.addEventListener('loadedmetadata', () => {
    duration.textContent = format(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    elapsed.textContent = format(audio.currentTime);

    seek.value =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? (audio.currentTime / audio.duration) * 100
        : 0;
  });

  seek.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime =
        (Number(seek.value) / 100) * audio.duration;
    }
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
  });

  audio.volume = Number(volume.value) / 100;

  select(0, false);
})();
