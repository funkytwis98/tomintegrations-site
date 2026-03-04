"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };

type Junction = {
  x: number;
  y: number;
  phase: number;
  speed: number;
};

class Signal {
  path: Point[];
  total: number;
  dist: number;
  speed: number;
  trail: number;
  alive: boolean;
  done: boolean;
  fadeOut: number;
  nodeGlow: number;
  endX: number;
  endY: number;

  constructor(
    private width: number,
    private height: number,
    private step: number
  ) {
    this.path = [];
    this.total = 0;
    this.dist = 0;
    this.speed = 0;
    this.trail = 0;
    this.alive = true;
    this.done = false;
    this.fadeOut = 0;
    this.nodeGlow = 0;
    this.endX = 0;
    this.endY = 0;
    this.init();
  }

  private snap(v: number) {
    return Math.round(v / this.step) * this.step;
  }

  private buildPath(x1: number, y1: number, x2: number, y2: number): Point[] {
    const pts = [{ x: x1, y: y1 }];
    if (Math.random() > 0.5) {
      pts.push({ x: x2, y: y1 });
    } else {
      pts.push({ x: x1, y: y2 });
    }
    pts.push({ x: x2, y: y2 });
    return pts;
  }

  private pathLength() {
    let len = 0;
    for (let i = 1; i < this.path.length; i++) {
      const dx = this.path[i].x - this.path[i - 1].x;
      const dy = this.path[i].y - this.path[i - 1].y;
      len += Math.abs(dx) + Math.abs(dy);
    }
    return len;
  }

  init() {
    const margin = this.step * 2;
    const side = Math.floor(Math.random() * 4);
    let sx = 0;
    let sy = 0;
    let ex = 0;
    let ey = 0;

    if (side === 0) {
      sx = this.snap(margin + Math.random() * (this.width - margin * 2));
      sy = this.snap(margin);
    } else if (side === 1) {
      sx = this.snap(this.width - margin);
      sy = this.snap(margin + Math.random() * (this.height - margin * 2));
    } else if (side === 2) {
      sx = this.snap(margin + Math.random() * (this.width - margin * 2));
      sy = this.snap(this.height - margin);
    } else {
      sx = this.snap(margin);
      sy = this.snap(margin + Math.random() * (this.height - margin * 2));
    }

    ex = this.snap(margin + Math.random() * (this.width - margin * 2));
    ey = this.snap(margin + Math.random() * (this.height - margin * 2));

    this.path = this.buildPath(sx, sy, ex, ey);
    this.total = this.pathLength();
    this.dist = 0;
    this.speed = 55 + Math.random() * 80;
    this.trail = 90 + Math.random() * 80;
    this.alive = true;
    this.done = false;
    this.fadeOut = 0;
    this.nodeGlow = 0;
    this.endX = ex;
    this.endY = ey;
  }

  private posAt(d: number): Point {
    let remaining = d;
    for (let i = 1; i < this.path.length; i++) {
      const dx = this.path[i].x - this.path[i - 1].x;
      const dy = this.path[i].y - this.path[i - 1].y;
      const seg = Math.abs(dx) + Math.abs(dy);
      if (remaining <= seg) {
        const t = remaining / seg;
        return { x: this.path[i - 1].x + dx * t, y: this.path[i - 1].y + dy * t };
      }
      remaining -= seg;
    }
    return { ...this.path[this.path.length - 1] };
  }

  update(dt: number) {
    if (this.done) {
      this.fadeOut += dt / 900;
      this.nodeGlow = Math.max(0, 1 - this.fadeOut * 1.2);
      if (this.fadeOut >= 1) {
        this.alive = false;
      }
      return;
    }

    this.dist += this.speed * (dt / 1000);
    if (this.dist >= this.total) {
      this.dist = this.total;
      this.done = true;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    gold: (a: number) => string,
    goldDim: (a: number) => string,
    goldHot: (a: number) => string
  ) {
    const head = this.posAt(this.dist);
    const tailDist = Math.max(0, this.dist - this.trail);
    const fade = this.done ? Math.max(0, 1 - this.fadeOut * 1.4) : 1;

    let drawn = 0;
    for (let i = 1; i < this.path.length; i++) {
      const dx = this.path[i].x - this.path[i - 1].x;
      const dy = this.path[i].y - this.path[i - 1].y;
      const segLen = Math.abs(dx) + Math.abs(dy);
      const segStart = drawn;
      const segEnd = drawn + segLen;

      const litFrom = Math.max(tailDist, segStart);
      const litTo = Math.min(this.dist, segEnd);

      if (litFrom < litTo) {
        const t0 = (litFrom - segStart) / segLen;
        const t1 = (litTo - segStart) / segLen;
        const px0 = this.path[i - 1].x + dx * t0;
        const py0 = this.path[i - 1].y + dy * t0;
        const px1 = this.path[i - 1].x + dx * t1;
        const py1 = this.path[i - 1].y + dy * t1;

        ctx.save();
        ctx.strokeStyle = gold(0.55 * fade);
        ctx.lineWidth = 1.5;
        ctx.shadowColor = goldHot(0.7);
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px1, py1);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = goldDim(0.12 * fade);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(this.path[i - 1].x, this.path[i - 1].y);
        ctx.lineTo(this.path[i].x, this.path[i].y);
        ctx.stroke();
      }

      drawn += segLen;
    }

    if (!this.done) {
      ctx.save();
      ctx.shadowColor = goldHot(1);
      ctx.shadowBlur = 18;
      ctx.fillStyle = goldHot(1);
      ctx.beginPath();
      ctx.arc(head.x, head.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.done && this.nodeGlow > 0) {
      const g = this.nodeGlow;
      const r = 6 + (1 - g) * 14;
      const grad = ctx.createRadialGradient(this.endX, this.endY, 0, this.endX, this.endY, r);
      grad.addColorStop(0, goldHot(0.9 * g));
      grad.addColorStop(0.4, gold(0.4 * g));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(this.endX, this.endY, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.endX, this.endY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = goldHot(g);
      ctx.fill();
    }
  }
}

export default function HeroBackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const cnv: HTMLCanvasElement = canvas;
    const c: CanvasRenderingContext2D = context;

    const STEP = 48;
    const MAX_SIGNALS = 14;
    const SPAWN_INTERVAL = 420;

    const GOLD = { r: 212, g: 160, b: 40 };
    const GOLD_DIM = { r: 140, g: 95, b: 15 };
    const GOLD_HOT = { r: 255, g: 220, b: 100 };

    const gold = (a: number) => `rgba(${GOLD.r},${GOLD.g},${GOLD.b},${a})`;
    const goldDim = (a: number) => `rgba(${GOLD_DIM.r},${GOLD_DIM.g},${GOLD_DIM.b},${a})`;
    const goldHot = (a: number) => `rgba(${GOLD_HOT.r},${GOLD_HOT.g},${GOLD_HOT.b},${a})`;
    const snap = (v: number) => Math.round(v / STEP) * STEP;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let junctions: Junction[] = [];
    let signals: Signal[] = [];
    let spawnTimer = 0;
    let last: number | null = null;
    let raf = 0;
    let reducedMotion = false;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function buildJunctions() {
      junctions = [];
      const count = Math.floor((width * height) / (STEP * STEP * 9));
      for (let i = 0; i < count; i++) {
        junctions.push({
          x: snap(STEP + Math.random() * (width - STEP * 2)),
          y: snap(STEP + Math.random() * (height - STEP * 2)),
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.0008,
        });
      }
    }

    function drawBaseGrid() {
      c.strokeStyle = "rgba(120, 85, 10, 0.07)";
      c.lineWidth = 0.5;
      c.beginPath();
      for (let x = STEP; x < width; x += STEP) {
        c.moveTo(x, 0);
        c.lineTo(x, height);
      }
      for (let y = STEP; y < height; y += STEP) {
        c.moveTo(0, y);
        c.lineTo(width, y);
      }
      c.stroke();
    }

    function drawJunctions() {
      for (const j of junctions) {
        j.phase += j.speed * 16;
        const glow = 0.3 + 0.3 * Math.sin(j.phase);
        c.beginPath();
        c.arc(j.x, j.y, 1.5, 0, Math.PI * 2);
        c.fillStyle = gold(glow);
        c.fill();
      }
    }

    function drawBackdrop() {
      c.fillStyle = "#060401";
      c.fillRect(0, 0, width, height);

      const bloom = c.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.65);
      bloom.addColorStop(0, "rgba(35, 22, 2, 0.7)");
      bloom.addColorStop(1, "rgba(6, 4, 1, 0)");
      c.fillStyle = bloom;
      c.fillRect(0, 0, width, height);

      drawBaseGrid();
      drawJunctions();

      const vig = c.createRadialGradient(width / 2, height / 2, height * 0.15, width / 2, height / 2, height * 0.85);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.75)");
      c.fillStyle = vig;
      c.fillRect(0, 0, width, height);
    }

    function drawStatic() {
      drawBackdrop();
    }

    function frame(now: number) {
      if (!last) {
        last = now;
      }
      const dt = Math.min(now - last, 50);
      last = now;

      drawBackdrop();

      spawnTimer += dt;
      if (spawnTimer >= SPAWN_INTERVAL && signals.length < MAX_SIGNALS) {
        signals.push(new Signal(width, height, STEP));
        spawnTimer = 0;
      }

      signals = signals.filter((s) => s.alive);
      for (const s of signals) {
        s.update(dt);
        s.draw(c, gold, goldDim, goldHot);
      }

      raf = window.requestAnimationFrame(frame);
    }

    function initSize() {
      const parent = cnv.parentElement;
      const rect = parent?.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect?.width ?? window.innerWidth));
      height = Math.max(1, Math.floor(rect?.height ?? window.innerHeight));
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      cnv.width = Math.floor(width * dpr);
      cnv.height = Math.floor(height * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);

      signals = [];
      spawnTimer = 0;
      last = null;
      buildJunctions();
    }

    function start() {
      window.cancelAnimationFrame(raf);
      initSize();
      if (reducedMotion) {
        drawStatic();
        return;
      }
      raf = window.requestAnimationFrame(frame);
    }

    function onResize() {
      start();
    }

    function onMotionChange() {
      reducedMotion = media.matches;
      start();
    }

    reducedMotion = media.matches;
    start();

    window.addEventListener("resize", onResize);
    media.addEventListener("change", onMotionChange);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      media.removeEventListener("change", onMotionChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
