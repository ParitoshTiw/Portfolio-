(() => {
  const menuButton = document.querySelector('.menu-button');
  const navLinks = document.querySelector('.nav-links');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('is-open', !open);
    });
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('is-open');
      });
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => observer.observe(item));
  }

  const blackHoleCanvas = document.querySelector('#black-hole-canvas');
  if (blackHoleCanvas && !reduceMotion) {
    const blackHoleContext = blackHoleCanvas.getContext('2d');
    const stars = [];
    const starCount = window.innerWidth < 800 ? 42 : 64;
    let blackHoleWidth = 0;
    let blackHoleHeight = 0;
    let blackHoleDpr = 1;
    let scrollProgress = 0;
    let smoothedProgress = 0;
    let lastBlackHoleFrame = 0;

    function makeStar() {
      return {
        angle: Math.random() * Math.PI * 2,
        distance: Math.random(),
        speed: Math.random() * 0.8 + 0.32,
        size: Math.random() * 1.35 + 0.24,
        brightness: Math.random() * 0.5 + 0.25,
        hue: Math.random() > 0.72 ? 205 : 42,
      };
    }

    function updateScrollProgress() {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    }

    function resizeBlackHole() {
      blackHoleDpr = Math.min(window.devicePixelRatio || 1, 1.25);
      blackHoleWidth = window.innerWidth;
      blackHoleHeight = window.innerHeight;
      blackHoleCanvas.width = blackHoleWidth * blackHoleDpr;
      blackHoleCanvas.height = blackHoleHeight * blackHoleDpr;
      blackHoleContext.setTransform(blackHoleDpr, 0, 0, blackHoleDpr, 0, 0);
      while (stars.length < starCount) stars.push(makeStar());
      updateScrollProgress();
    }

    function drawBlackHole(timestamp) {
      if (timestamp - lastBlackHoleFrame < 33) {
        window.requestAnimationFrame(drawBlackHole);
        return;
      }
      lastBlackHoleFrame = timestamp;
      const time = timestamp * 0.001;
      smoothedProgress += (scrollProgress - smoothedProgress) * 0.075;
      const intensity = Math.min(1, Math.max(0, (smoothedProgress - 0.008) / 0.77));
      const minSide = Math.min(blackHoleWidth, blackHoleHeight);
      const maxDistance = Math.hypot(blackHoleWidth, blackHoleHeight) * 0.7;
      const coreRadius = minSide * (0.065 + intensity * 0.35);
      const centerX = blackHoleWidth * (0.5 + Math.sin(time * 0.12) * 0.006);
      const centerY = blackHoleHeight * (0.52 - intensity * 0.05);

      blackHoleContext.clearRect(0, 0, blackHoleWidth, blackHoleHeight);
      if (intensity > 0.004) {
        const outerGlow = blackHoleContext.createRadialGradient(centerX, centerY, coreRadius * 0.55, centerX, centerY, coreRadius * 3.1);
        outerGlow.addColorStop(0, `rgba(255, 180, 66, ${intensity * 0.1})`);
        outerGlow.addColorStop(0.35, `rgba(178, 91, 34, ${intensity * 0.075})`);
        outerGlow.addColorStop(1, 'rgba(18, 9, 3, 0)');
        blackHoleContext.fillStyle = outerGlow;
        blackHoleContext.fillRect(0, 0, blackHoleWidth, blackHoleHeight);

        stars.forEach((star) => {
          const inwardTravel = (time * star.speed * (0.025 + intensity * 0.34)) % 1;
          const radialProgress = (star.distance - inwardTravel + 1) % 1;
          const distance = coreRadius * 1.2 + radialProgress * maxDistance;
          if (distance > maxDistance || distance < coreRadius * 1.24) return;
          const twist = intensity * (1 - radialProgress) * 3.8 + time * 0.009;
          const angle = star.angle + twist;
          const tailDistance = Math.min(distance + 8 + intensity * 62, maxDistance);
          const tailAngle = star.angle + intensity * (1 - radialProgress) * 3.6 + time * 0.007;
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance * 0.65;
          const tailX = centerX + Math.cos(tailAngle) * tailDistance;
          const tailY = centerY + Math.sin(tailAngle) * tailDistance * 0.65;
          blackHoleContext.beginPath();
          blackHoleContext.moveTo(tailX, tailY);
          blackHoleContext.lineTo(x, y);
          blackHoleContext.strokeStyle = `hsla(${star.hue}, 92%, 80%, ${star.brightness * intensity})`;
          blackHoleContext.lineWidth = star.size;
          blackHoleContext.stroke();
        });

        blackHoleContext.save();
        blackHoleContext.translate(centerX, centerY);
        blackHoleContext.rotate(-0.2 + time * 0.004);
        blackHoleContext.globalCompositeOperation = 'screen';
        for (let ring = 0; ring < 9; ring += 1) {
          const scale = 1.12 + ring * 0.11;
          blackHoleContext.beginPath();
          blackHoleContext.ellipse(0, 0, coreRadius * scale * 1.38, coreRadius * scale * (0.14 + ring * 0.002), 0, 0, Math.PI * 2);
          const heat = Math.max(48, 96 - ring * 5);
          blackHoleContext.strokeStyle = `hsla(${48 - ring * 1.8}, 100%, ${heat}%, ${intensity * (0.18 - ring * 0.011)})`;
          blackHoleContext.lineWidth = Math.max(1, 4 - ring * 0.26);
          blackHoleContext.stroke();
        }
        blackHoleContext.beginPath();
        blackHoleContext.ellipse(0, 0, coreRadius * 2.25, coreRadius * 0.3, 0, 0, Math.PI * 2);
        blackHoleContext.strokeStyle = `rgba(255, 246, 205, ${intensity * 0.8})`;
        blackHoleContext.lineWidth = 1.6 + intensity * 2;
        blackHoleContext.stroke();
        blackHoleContext.restore();

        const halo = blackHoleContext.createRadialGradient(centerX, centerY, coreRadius * 0.16, centerX, centerY, coreRadius * 1.9);
        halo.addColorStop(0, 'rgba(0, 0, 0, 1)');
        halo.addColorStop(0.48, 'rgba(0, 0, 0, 0.99)');
        halo.addColorStop(0.62, 'rgba(8, 4, 2, 0.98)');
        halo.addColorStop(0.72, `rgba(255, 167, 60, ${intensity * 0.2})`);
        halo.addColorStop(0.82, `rgba(153, 68, 25, ${intensity * 0.08})`);
        halo.addColorStop(1, 'rgba(20, 8, 2, 0)');
        blackHoleContext.fillStyle = halo;
        blackHoleContext.beginPath();
        blackHoleContext.arc(centerX, centerY, coreRadius * 1.9, 0, Math.PI * 2);
        blackHoleContext.fill();

        // The event horizon deliberately swallows the centre of the accretion disk.
        // Its pure black silhouette keeps the hole visible against the dark page.
        blackHoleContext.beginPath();
        blackHoleContext.arc(centerX, centerY, coreRadius * 1.08, 0, Math.PI * 2);
        blackHoleContext.fillStyle = '#000000';
        blackHoleContext.fill();

        blackHoleContext.save();
        blackHoleContext.translate(centerX, centerY);
        blackHoleContext.rotate(-0.2 + time * 0.004);
        blackHoleContext.globalCompositeOperation = 'lighter';
        blackHoleContext.beginPath();
        blackHoleContext.ellipse(0, -coreRadius * 0.47, coreRadius * 1.04, coreRadius * 0.16, 0, Math.PI * 1.08, Math.PI * 1.92);
        blackHoleContext.strokeStyle = `rgba(255, 232, 172, ${intensity * 0.53})`;
        blackHoleContext.lineWidth = 1.2 + intensity * 1.4;
        blackHoleContext.stroke();
        blackHoleContext.beginPath();
        blackHoleContext.ellipse(0, coreRadius * 0.47, coreRadius * 1.04, coreRadius * 0.16, 0, Math.PI * 0.08, Math.PI * 0.92);
        blackHoleContext.strokeStyle = `rgba(255, 175, 68, ${intensity * 0.43})`;
        blackHoleContext.stroke();
        blackHoleContext.restore();
      }
      window.requestAnimationFrame(drawBlackHole);
    }

    resizeBlackHole();
    window.addEventListener('resize', resizeBlackHole, { passive: true });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.requestAnimationFrame(drawBlackHole);
  }

  const canvas = document.querySelector('#particle-canvas');
  if (!canvas || reduceMotion) return;

  const context = canvas.getContext('2d');
  const particles = [];
  const maxParticles = window.innerWidth < 800 ? 16 : 26;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastParticleFrame = 0;
  let particleScrollProgress = 0;
  let particleVisibility = 1;

  function updateParticleScrollProgress() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    particleScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  }

  function makeParticle(startAbove = false) {
    return {
      x: Math.random() * width,
      y: startAbove ? -Math.random() * height : Math.random() * height,
      radius: Math.random() * 2.2 + 0.7,
      speed: Math.random() * 0.22 + 0.09,
      drift: (Math.random() - 0.5) * 0.08,
      opacity: Math.random() * 0.25 + 0.08,
      phase: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    while (particles.length < maxParticles) particles.push(makeParticle());
    updateParticleScrollProgress();
  }

  function draw(timestamp) {
    if (timestamp - lastParticleFrame < 33) {
      window.requestAnimationFrame(draw);
      return;
    }
    lastParticleFrame = timestamp;
    const targetVisibility = 1 - Math.min(Math.max((particleScrollProgress - 0.72) / 0.28, 0), 1);
    particleVisibility += (targetVisibility - particleVisibility) * 0.08;
    canvas.style.opacity = String(0.8 * particleVisibility);
    context.clearRect(0, 0, width, height);
    if (particleVisibility < 0.004) {
      window.requestAnimationFrame(draw);
      return;
    }
    particles.forEach((particle) => {
      particle.y += particle.speed;
      particle.x += particle.drift + Math.sin(timestamp * 0.00035 + particle.phase) * 0.04;
      if (particle.y - particle.radius > height || particle.x < -10 || particle.x > width + 10) {
        Object.assign(particle, makeParticle(true));
      }
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(204, 207, 214, ${particle.opacity * particleVisibility})`;
      context.fill();
    });
    window.requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', updateParticleScrollProgress, { passive: true });
  window.requestAnimationFrame(draw);
})();
