import { useEffect, useRef } from 'react';

type Point = {
  x: number;
  y: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  trailLengthDelta: number;
  isSpawning: boolean;
  isDying: boolean;
  isDead: boolean;
  create: (x: number, y: number, speed: number, direction: number) => Particle;
  getSpeed: () => number;
  setSpeed: (speed: number) => void;
  getHeading: () => number;
  setHeading: (heading: number) => void;
  update: () => void;
};

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const shootingStarIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const bgColor = 'rgb(40, 42, 58)';
    const startColor = 'rgb(255, 221, 157)';
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // let width = (canvas.width = window.innerWidth)
    // let height = (canvas.height = window.innerHeight)

    const parentElement = canvas.parentElement;
    if (!parentElement) return;

    const width = (canvas.width = parentElement.clientWidth);
    const height = (canvas.height = parentElement.clientHeight);

    let paused = false;

    // Helpers
    // Define an interface for the point returned by lineToAngle

    const lineToAngle = (
      x1: number,
      y1: number,
      length: number,
      radians: number
    ): Point => {
      const x2 = x1 + length * Math.cos(radians);
      const y2 = y1 + length * Math.sin(radians);
      return { x: x2, y: y2 };
    };

    const randomRange = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const degreesToRads = (degrees: number) => (degrees / 180) * Math.PI;

    const createParticle = (): Particle => {
      return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 0,
        opacity: 0,
        trailLengthDelta: 0,
        isSpawning: false,
        isDying: false,
        isDead: false,

        create(x: number, y: number, speed: number, direction: number) {
          const obj = Object.create(this) as Particle;
          obj.x = x;
          obj.y = y;
          obj.vx = Math.cos(direction) * speed;
          obj.vy = Math.sin(direction) * speed;
          obj.opacity = 0;
          obj.trailLengthDelta = 0;
          obj.isSpawning = false;
          obj.isDying = false;
          obj.isDead = false;
          return obj;
        },

        getSpeed() {
          return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        },

        setSpeed(speed) {
          const heading = this.getHeading();
          this.vx = Math.cos(heading) * speed;
          this.vy = Math.sin(heading) * speed;
        },

        getHeading() {
          return Math.atan2(this.vy, this.vx);
        },

        setHeading(heading) {
          const speed = this.getSpeed();
          this.vx = Math.cos(heading) * speed;
          this.vy = Math.sin(heading) * speed;
        },

        update() {
          this.x += this.vx;
          this.y += this.vy;
        },
      };
    };

    // Animation Settings
    const particle = createParticle();
    const stars: Particle[] = [];
    const shootingStars: Particle[] = [];
    const layers = [
      { speed: 0.015, scale: 0.2, count: 30 }, // smallest stars
      { speed: 0.03, scale: 0.5, count: 10 }, // medium stars
      { speed: 0.05, scale: 0.75, count: 5 }, // large stars
    ];
    const starsAngle = 145;
    const shootingStarSpeed = { min: 15, max: 20 };
    const shootingStarOpacityDelta = 0.01;
    const trailLengthDelta = 0.01;
    const shootingStarEmittingInterval = 2000;
    const shootingStarLifeTime = 500;
    const maxTrailLength = 300;
    const starBaseRadius = 2;
    const shootingStarRadius = 3;

    // Initialize stars
    for (let j = 0; j < layers.length; j++) {
      const layer = layers[j];
      for (let i = 0; i < layer.count; i++) {
        const star = particle.create(
          randomRange(0, width),
          randomRange(0, height),
          0,
          0
        );
        star.radius = starBaseRadius * layer.scale;
        star.setSpeed(layer.speed);
        star.setHeading(degreesToRads(starsAngle));
        stars.push(star);
      }
    }

    // Shooting Star Functions
    const createShootingStar = () => {
      const shootingStar = particle.create(
        randomRange(width / 2, width),
        randomRange(0, height / 2),
        0,
        0
      );
      shootingStar.setSpeed(
        randomRange(shootingStarSpeed.min, shootingStarSpeed.max)
      );
      shootingStar.setHeading(degreesToRads(starsAngle));
      shootingStar.radius = shootingStarRadius;
      shootingStar.opacity = 0;
      shootingStar.trailLengthDelta = 0;
      shootingStar.isSpawning = true;
      shootingStar.isDying = false;
      shootingStars.push(shootingStar);
    };

    const killShootingStar = (shootingStar: Particle) => {
      setTimeout(() => {
        shootingStar.isDying = true;
      }, shootingStarLifeTime);
    };

    // Drawing Functions
    const drawStar = (star: Particle) => {
      context.fillStyle = startColor;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    };

    const drawShootingStar = (p: Particle) => {
      const x = p.x;
      const y = p.y;
      const currentTrailLength = maxTrailLength * (p.trailLengthDelta ?? 0);
      const pos = lineToAngle(x, y, -currentTrailLength, p.getHeading());

      context.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      const starLength = 5;
      context.beginPath();
      context.moveTo(x - 1, y + 1);
      context.lineTo(x, y + starLength);
      context.lineTo(x + 1, y + 1);
      context.lineTo(x + starLength, y);
      context.lineTo(x + 1, y - 1);
      context.lineTo(x, y + 1);
      context.lineTo(x, y - starLength);
      context.lineTo(x - 1, y - 1);
      context.lineTo(x - starLength, y);
      context.lineTo(x - 1, y + 1);
      context.lineTo(x - starLength, y);
      context.closePath();
      context.fill();

      // Trail
      context.fillStyle = `rgba(255, 221, 157, ${p.opacity})`;
      context.beginPath();
      context.moveTo(x - 1, y - 1);
      context.lineTo(pos.x, pos.y);
      context.lineTo(x + 1, y + 1);
      context.closePath();
      context.fill();
    };

    // Animation Loop
    const update = () => {
      if (!paused) {
        context.clearRect(0, 0, width, height);
        context.fillStyle = bgColor;
        context.fillRect(0, 0, width, height);

        stars.forEach(star => {
          star.update();
          drawStar(star);

          if (star.x > width) star.x = 0;
          if (star.x < 0) star.x = width;
          if (star.y > height) star.y = 0;
          if (star.y < 0) star.y = height;
        });

        shootingStars.forEach((shootingStar, _index) => {
          if (shootingStar.isSpawning) {
            shootingStar.opacity += shootingStarOpacityDelta;
            if (shootingStar.opacity >= 1) {
              shootingStar.isSpawning = false;
              killShootingStar(shootingStar);
            }
          }

          if (shootingStar.isDying) {
            shootingStar.opacity -= shootingStarOpacityDelta;
            if (shootingStar.opacity <= 0) {
              shootingStar.isDead = true;
            }
          }

          shootingStar.trailLengthDelta += trailLengthDelta;
          shootingStar.update();

          if (shootingStar.opacity > 0) {
            drawShootingStar(shootingStar);
          }
        });

        // Remove dead shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          if (shootingStars[i].isDead) shootingStars.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(update);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(update);

    // Shooting star interval
    shootingStarIntervalRef.current = setInterval(() => {
      if (!paused) createShootingStar();
    }, shootingStarEmittingInterval);

    // Window event handlers
    const handleFocus = () => (paused = false);
    const handleBlur = () => (paused = true);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      if (shootingStarIntervalRef.current !== null) {
        clearInterval(shootingStarIntervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <canvas
      className='fixed top-0 left-0 fadein animation-duration-2000 animation-iteration-1 animation-ease-out'
      ref={canvasRef}
    />
  );
};

export default StarBackground;
