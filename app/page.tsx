'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Camera as CameraIcon,
  Check,
  Clock,
  Loader2,
  MapPin,
  ShoppingBag,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Asset Helpers & Exact Higgsfield Cutout URLs
// ---------------------------------------------------------------------------

const PNG_BASE =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_';

const imgUrl = (id: string, w: number) =>
  `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(
    `${PNG_BASE}${id}.png`
  )}&w=${w}&q=85`;

const CAMERA_ASSETS = {
  cam1: '20261123_063459_193f84da-199e-41b5-8799-928ad67fd4e7',
  cam2: '20261123_063501_0cebf6fd-58cd-4cff-83c8-ecaa026bc315',
  cam3: '20261123_063500_3aaf0fbc-be7e-4aaa-b9e3-c05576fca584',
  cam4: '20261123_063501_5bb9fba1-e90d-42a3-86de-f3781bf93890',
  cam5: '20261123_063500_febed648-3445-48b8-8a77-95ed640de074',
  cam6: '20261123_063459_46765ae9-cef1-4d57-be66-cf4874b98c88',
} as const;

const ACCESSORY_ASSETS = {
  a1: '20261123_063500_52268785-384c-458a-bba8-48e8e31dc1b7',
  a2: '20261123_063500_5da68034-0d53-430b-b2e7-125f951b8edd',
  a3: '20261123_063529_7e251229-2a86-4bf0-b1ce-a0c322b72a10',
  a4: '20261123_063528_42a9482e-5de3-463d-96c9-2a55aaa21c03',
  a5: '20261123_063528_3b261fd2-e255-4dad-8620-4a697efdf68d',
  a6: '20261123_063528_6371899e-449a-4370-a795-94acddce62ef',
  a7: '20261123_063529_160252d7-09c5-4e0f-99f4-8b7f443705d7',
  a8: '20261123_063528_8f1f255c-addc-4ec1-8c5e-4b04a91439ed',
} as const;

const PHOTO_ASSETS = {
  p1: '20261123_063528_7094557c-58c4-4ba4-9166-0336dd238901',
  p2: '20261123_063529_aa416f7c-8fd5-4a58-bd98-25614addbb3f',
  p3: '20261123_063555_769d745e-3f9e-4c8d-a6d9-95f7f2da27f5',
  p4: '20261123_063554_53d93f22-8b9c-4147-8f61-a53f9d8785ce',
} as const;

type AccessoryKey = keyof typeof ACCESSORY_ASSETS;
type PhotoKey = keyof typeof PHOTO_ASSETS;

interface CameraSpec {
  label: string;
  value: string;
}

interface CameraData {
  key: keyof typeof CAMERA_ASSETS;
  name: string;
  type: string;
  year: number;
  aperture: string;
  price: number;
  column: 0 | 1 | 2;
  scale: number;
  description: string;
  chips: [string, string, string];
  specs: CameraSpec[];
  condition: [string, string, string];
  shots: [PhotoKey, PhotoKey, PhotoKey];
  accessories: [AccessoryKey, number, number, number, number][];
}

interface ExtraCatalogRow {
  name: string;
  meta: string;
  price: number;
  status: 'In stock' | 'Reserved' | 'Sold out' | 'Waitlist';
  column: 0 | 1 | 2;
}

interface CartItem {
  id: string;
  cameraKey: keyof typeof CAMERA_ASSETS;
  name: string;
  kit: 'only' | 'shooter';
  warranty: boolean;
  price: number;
}

interface ToastState {
  id: number;
  message: string;
  thumb?: string;
}

interface LightboxState {
  photoKey: PhotoKey;
  cameraName: string;
  frameCode: string;
}

const CAMERAS: CameraData[] = [
  {
    key: 'cam1',
    name: 'Ranger 35',
    type: 'Rangefinder',
    year: 1966,
    aperture: 'f/2',
    price: 890,
    column: 0,
    scale: 1,
    description:
      'A pocketable 35mm rangefinder with a bright-frame finder and a whisper-quiet leaf shutter. The camera street photographers keep for life.',
    chips: ['Rangefinder', '35mm', 'Leaf shutter'],
    specs: [
      { label: 'Format', value: '35mm film' },
      { label: 'Lens', value: '50mm f/2, fixed' },
      { label: 'Shutter', value: 'Leaf · 1s – 1/500' },
      { label: 'Metering', value: 'Selenium, coupled' },
      { label: 'Weight', value: '520 g' },
      { label: 'Made', value: '1966' },
    ],
    condition: ['Grade A · excellent', 'Seals replaced', 'Shutter timed'],
    shots: ['p1', 'p4', 'p2'],
    accessories: [
      ['a1', -0.66, -0.12, -22, 0.2],
      ['a3', 0.66, 0.2, 0, 0.2],
      ['a4', -0.52, 0.44, 24, 0.22],
      ['a6', 0.6, -0.4, 0, 0.24],
    ],
  },
  {
    key: 'cam2',
    name: 'Okta 6×6',
    type: 'Twin-lens reflex',
    year: 1958,
    aperture: 'f/3.5',
    price: 1150,
    column: 2,
    scale: 1.42,
    description:
      'Look down into the ground glass and the world goes square. A medium format TLR with a sharp 75mm taking lens and a crank that feels like clockwork.',
    chips: ['Medium format', '120 film', 'Waist-level'],
    specs: [
      { label: 'Format', value: '6×6 cm on 120' },
      { label: 'Lens', value: '75mm f/3.5' },
      { label: 'Shutter', value: 'Leaf · 1s – 1/500' },
      { label: 'Finder', value: 'Waist-level, bright screen' },
      { label: 'Weight', value: '1,080 g' },
      { label: 'Made', value: '1958' },
    ],
    condition: ['Grade A · excellent', 'New focusing screen', 'Film counter checked'],
    shots: ['p3', 'p2', 'p1'],
    accessories: [
      ['a7', -0.6, -0.16, -14, 0.22],
      ['a5', 0.62, 0.06, 12, 0.24],
      ['a3', -0.46, 0.46, 0, 0.17],
      ['a8', 0.48, 0.48, 0, 0.17],
    ],
  },
  {
    key: 'cam3',
    name: 'Norda SLR',
    type: 'Single-lens reflex',
    year: 1974,
    aperture: 'f/1.8',
    price: 640,
    column: 1,
    scale: 1,
    description:
      'All-mechanical, built like a tank, with a split-prism finder that snaps into focus. The SLR we hand to every first-time film shooter.',
    chips: ['SLR', '35mm', 'Fully mechanical'],
    specs: [
      { label: 'Format', value: '35mm film' },
      { label: 'Lens', value: '50mm f/1.8' },
      { label: 'Shutter', value: 'Focal-plane · 1s – 1/1000' },
      { label: 'Metering', value: 'TTL match-needle' },
      { label: 'Weight', value: '740 g' },
      { label: 'Made', value: '1974' },
    ],
    condition: ['Grade A+ · near mint', 'Mirror foam new', 'Meter calibrated'],
    shots: ['p4', 'p1', 'p3'],
    accessories: [
      ['a2', -0.64, -0.22, 16, 0.2],
      ['a8', 0.62, 0.3, 0, 0.18],
      ['a4', 0.54, -0.44, -30, 0.22],
      ['a1', -0.56, 0.42, 38, 0.19],
    ],
  },
  {
    key: 'cam4',
    name: 'Pip 90',
    type: 'Compact',
    year: 1994,
    aperture: 'f/3.5',
    price: 280,
    column: 0,
    scale: 1,
    description:
      'A champagne point-and-shoot with a sharp little zoom and a flash that makes every night out look like 1996.',
    chips: ['Compact', 'Autofocus', 'Zoom'],
    specs: [
      { label: 'Format', value: '35mm film' },
      { label: 'Lens', value: '38–90mm f/3.5–7.8' },
      { label: 'Exposure', value: 'Programmed AE' },
      { label: 'Flash', value: 'Built-in, red-eye' },
      { label: 'Weight', value: '285 g' },
      { label: 'Made', value: '1994' },
    ],
    condition: ['Grade A · excellent', 'Clean LCD', 'Battery included'],
    shots: ['p2', 'p1', 'p3'],
    accessories: [
      ['a1', -0.64, 0.08, 10, 0.19],
      ['a2', 0.64, -0.2, -26, 0.19],
      ['a4', -0.44, -0.48, 70, 0.2],
      ['a3', 0.52, 0.46, 0, 0.17],
    ],
  },
  {
    key: 'cam5',
    name: 'Kino 8',
    type: 'Super 8 cine',
    year: 1971,
    aperture: 'f/1.8',
    price: 420,
    column: 1,
    scale: 1,
    description:
      'Home movies the way they should feel: grainy, golden and a little shaky. Power zoom, auto exposure and a viewfinder that hums.',
    chips: ['Super 8', 'Cine', 'Power zoom'],
    specs: [
      { label: 'Format', value: 'Super 8 cartridge' },
      { label: 'Lens', value: '8–40mm f/1.8 zoom' },
      { label: 'Speeds', value: '18 / 24 fps' },
      { label: 'Metering', value: 'Through-the-lens' },
      { label: 'Weight', value: '1,240 g' },
      { label: 'Made', value: '1971' },
    ],
    condition: ['Grade B+ · very good', 'Motor serviced', 'Zoom tested'],
    shots: ['p3', 'p4', 'p2'],
    accessories: [
      ['a6', -0.64, -0.2, 0, 0.24],
      ['a8', 0.62, 0.36, 0, 0.17],
      ['a4', 0.56, -0.46, 20, 0.22],
      ['a2', -0.52, 0.46, -40, 0.18],
    ],
  },
  {
    key: 'cam6',
    name: 'Falta 6×9',
    type: 'Folding',
    year: 1953,
    aperture: 'f/4.5',
    price: 560,
    column: 2,
    scale: 1.2,
    description:
      'Unfold the bellows and you are holding the biggest negative that still fits in a coat pocket: eight huge frames on every roll.',
    chips: ['Folding', '120 film', '6×9 negatives'],
    specs: [
      { label: 'Format', value: '6×9 cm on 120' },
      { label: 'Lens', value: '105mm f/4.5' },
      { label: 'Shutter', value: 'Leaf · 1s – 1/250' },
      { label: 'Focus', value: 'Scale, front cell' },
      { label: 'Weight', value: '690 g' },
      { label: 'Made', value: '1953' },
    ],
    condition: ['Grade A · excellent', 'Bellows light-tight', 'Shutter timed'],
    shots: ['p1', 'p3', 'p4'],
    accessories: [
      ['a7', 0.62, -0.24, 20, 0.22],
      ['a5', -0.64, 0.1, -15, 0.24],
      ['a6', 0.56, 0.44, 0, 0.22],
      ['a3', -0.46, -0.48, 0, 0.16],
    ],
  },
];

const EXTRA_CATALOG: ExtraCatalogRow[] = [
  { name: 'Tomo Half', meta: 'Half-frame · 1965', price: 310, status: 'Reserved', column: 0 },
  { name: 'Brio 35', meta: 'Compact · 1989', price: 160, status: 'In stock', column: 0 },
  { name: 'Velo 400', meta: 'Instant · 1978', price: 190, status: 'Sold out', column: 1 },
  {
    name: 'Luma 6×7',
    meta: 'Medium format SLR · 1982',
    price: 1690,
    status: 'Waitlist',
    column: 2,
  },
];

const CATALOG_COLUMNS = [
  { title: 'RANGEFINDER & COMPACT', col: 0 as const },
  { title: 'SLR & CINE', col: 1 as const },
  { title: 'MEDIUM FORMAT', col: 2 as const },
];

const F_STOPS = ['1.4', '2', '2.8', '4', '5.6', '8', '11', '16'];

function shooterKitExtra(price: number): number {
  return Math.round((price * 0.07 + 20) / 5) * 5;
}

function formatEur(n: number): string {
  return `${Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} €`;
}

function defaultVisitDate(): string {
  const d = new Date(Date.now() + 2 * 86400 * 1000);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// Main Landing Page Component
// ---------------------------------------------------------------------------

export default function ApertureRowPage() {
  // Header & navigation state
  const [scrolledHeader, setScrolledHeader] = useState(false);

  // Hero active camera & swap transition state
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayedIdx, setDisplayedIdx] = useState(0);
  const [swapPhase, setSwapPhase] = useState<'idle' | 'out' | 'prep' | 'in'>('idle');
  const [apertureDisplay, setApertureDisplay] = useState(CAMERAS[0].aperture);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hoveredActive, setHoveredActive] = useState(false);

  // Hero stage dimensions for React-positioned elements (index mark, mobile/desktop copy)
  const [stageDims, setStageDims] = useState({
    w: 1440,
    h: 900,
    cx: 864,
    cy: 2349,
    r: 2088,
    ri: 1845,
    iw: 446,
    ih: 300,
    mobile: false,
    heroHeight: 4500,
  });

  // Detail Drawer state
  const [drawerCam, setDrawerCam] = useState<CameraData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKit, setDrawerKit] = useState<'only' | 'shooter'>('only');
  const [drawerWarranty, setDrawerWarranty] = useState(false);
  const [displayedDrawerPrice, setDisplayedDrawerPrice] = useState(0);
  const [addBtnState, setAddBtnState] = useState<'idle' | 'added'>('idle');
  const [plateTilt, setPlateTilt] = useState({ rx: 0, ry: 0 });

  // Lightbox state
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  // Cart & UI feedback state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [flyingCam, setFlyingCam] = useState<{
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
    opacity: number;
  } | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // The Bench stats & iris state
  const [benchStatsStarted, setBenchStatsStarted] = useState(false);
  const [statCameras, setStatCameras] = useState(0);
  const [statChecks, setStatChecks] = useState(0);
  const [statWarranty, setStatWarranty] = useState(0);
  const [irisHover, setIrisHover] = useState(false);
  const [irisFStopLabel, setIrisFStopLabel] = useState('f/2.8');

  // Visit booking form state (populated on client mount to avoid SSR/client timezone mismatch)
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('14:00');
  const [visitSession, setVisitSession] = useState('Condition check · free');
  const [visitName, setVisitName] = useState('');
  const [visitStatus, setVisitStatus] = useState<'idle' | 'submitting' | 'booked'>('idle');
  const [bookingCode, setBookingCode] = useState('AR-4821');

  // ---------------------------------------------------------------------------
  // Refs for zero-React-render 120fps animations
  // ---------------------------------------------------------------------------
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const discCanvasRef = useRef<HTMLCanvasElement>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);
  const logoBladesRef = useRef<SVGGElement>(null);
  const cursorPillRef = useRef<HTMLDivElement>(null);
  const camWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const accRefs = useRef<(HTMLImageElement | null)[][]>(
    CAMERAS.map(() => [null, null, null, null])
  );
  const titleFontMeasureRef = useRef<HTMLHeadingElement>(null);
  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const drawerPlateImgRef = useRef<HTMLImageElement>(null);

  // Bench refs
  const benchRef = useRef<HTMLElement>(null);
  const irisContainerRef = useRef<HTMLDivElement>(null);
  const irisGlowRef = useRef<HTMLDivElement>(null);
  const irisBladeRefs = useRef<(SVGGElement | null)[]>([]);
  const irisHoverRef = useRef(false);
  const benchVisibleRef = useRef(false);
  const irisOpenRef = useRef(0.65);
  const irisLastDrawnRef = useRef(-1);

  // Mutable animation state inside RAF
  const geomRef = useRef({
    w: 1440,
    h: 900,
    cx: 864,
    cy: 2349,
    r: 2088,
    ri: 1845,
    iw: 446,
    ih: 300,
    delta: 0.366,
    seg: 720,
    heroTop: 0,
    heroBottom: 4500,
    mobile: false,
    displayFont: 'Barlow Condensed, sans-serif',
    labelFont: 'Barlow Semi Condensed, sans-serif',
  });

  const simRef = useRef({
    pos: 0,
    posS: 0,
    vel: 0,
    lastRot: 999,
    lastBlur: CAMERAS.map(() => -1),
    accS: CAMERAS.map((_, ci) => [ci === 0 ? 1 : 0, ci === 0 ? 1 : 0, ci === 0 ? 1 : 0, ci === 0 ? 1 : 0]),
    accV: CAMERAS.map(() => [0, 0, 0, 0]),
    activeIdx: 0,
    isTweening: false,
    tweenCancel: null as null | (() => void),
    isDragging: false,
    justDragged: false,
    wheelAcc: 0,
    wheelLockUntil: 0,
    snapTimer: null as number | null,
    hintDismissed: false,
    drawerOpen: false,
    lightboxOpen: false,
  });

  // Deterministic pseudo-random spin signs for accessories
  const accSigns = useMemo(
    () =>
      CAMERAS.map((_, ci) =>
        [0, 1, 2, 3].map((ai) => {
          const seed = ((ci + 1) * 31 + (ai + 1) * 17) % 10;
          return (seed % 2 === 0 ? 1 : -1) * (0.7 + (seed % 5) * 0.12);
        })
      ),
    []
  );

  // ---------------------------------------------------------------------------
  // Toast helper
  // ---------------------------------------------------------------------------
  const toastTimerRef = useRef<number | null>(null);
  const showToast = useCallback((message: string, thumb?: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, thumb });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3600);
  }, []);

  // ---------------------------------------------------------------------------
  // Smooth scroll tween helper (for nav links, snap, wheel, drag fling)
  // ---------------------------------------------------------------------------
  const tweenScrollTo = useCallback((targetY: number, duration = 760, easeFn = easeInOutCubic) => {
    if (simRef.current.tweenCancel) {
      simRef.current.tweenCancel();
    }
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (Math.abs(diff) < 1) {
      window.scrollTo(0, targetY);
      simRef.current.isTweening = false;
      return;
    }

    let cancelled = false;
    simRef.current.isTweening = true;
    simRef.current.tweenCancel = () => {
      cancelled = true;
      simRef.current.isTweening = false;
    };

    const startTime = performance.now();
    const step = (now: number) => {
      if (cancelled) return;
      const t = clamp((now - startTime) / duration, 0, 1);
      const eased = easeFn(t);
      window.scrollTo(0, startY + diff * eased);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        simRef.current.isTweening = false;
        simRef.current.tweenCancel = null;
      }
    };
    requestAnimationFrame(step);
  }, []);

  const spinToCamera = useCallback(
    (idx: number) => {
      const clamped = clamp(idx, 0, CAMERAS.length - 1);
      if (!simRef.current.hintDismissed) {
        simRef.current.hintDismissed = true;
        setHintDismissed(true);
      }
      const heroEl = heroRef.current;
      const heroTop = heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0;
      const { seg } = geomRef.current;
      tweenScrollTo(heroTop + clamped * seg, 760, easeInOutCubic);
    },
    [tweenScrollTo]
  );

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      tweenScrollTo(y, 820, easeInOutCubic);
    },
    [tweenScrollTo]
  );

  // ---------------------------------------------------------------------------
  // Canvas Drawing: Static Disc & Dynamic Visible Ring Arc
  // ---------------------------------------------------------------------------
  const drawDisc = useCallback(() => {
    const canvas = discCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h, cx, cy, r } = geomRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Visible angular span for the disc upper arc
    const dxMax = Math.max(cx + 80, w - cx + 80);
    const halfSpan = Math.asin(Math.min(1, dxMax / Math.max(1, r - h * 0.9))) + 0.14;
    const aStart = -Math.PI / 2 - halfSpan;
    const aEnd = -Math.PI / 2 + halfSpan;

    // 1. Base disc fill with radial gradient + top blue glow
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy - r * 0.25, r * 0.15, cx, cy, r);
    grad.addColorStop(0, '#111216');
    grad.addColorStop(1, '#15161a');
    ctx.fillStyle = grad;
    ctx.shadowColor = 'rgba(61,123,255,0.28)';
    ctx.shadowBlur = 120;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = -30;

    ctx.beginPath();
    ctx.arc(cx, cy, r, aStart, aEnd);
    ctx.lineTo(w + 100, h + 100);
    ctx.lineTo(-100, h + 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Machining grooves every 4.5px on the visible upper half
    const rMin = Math.max(120, r - h * 1.15);
    ctx.save();
    ctx.lineWidth = 1;
    let grooveIdx = 0;
    for (let gr = r - 18; gr >= rMin; gr -= 4.5) {
      const alpha = grooveIdx % 2 === 0 ? 0.028 : 0.018;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      const gHalf = Math.asin(Math.min(1, dxMax / gr)) + 0.06;
      ctx.beginPath();
      ctx.arc(cx, cy, gr, -Math.PI / 2 - gHalf, -Math.PI / 2 + gHalf);
      ctx.stroke();
      grooveIdx++;
    }
    ctx.restore();

    // 3. Fixed white light sweep at the top
    ctx.save();
    const sweepGrad = ctx.createRadialGradient(cx, cy - r, 0, cx, cy - r, w * 0.55);
    sweepGrad.addColorStop(0, 'rgba(255,255,255,0.09)');
    sweepGrad.addColorStop(0.45, 'rgba(255,255,255,0.03)');
    sweepGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sweepGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, aStart, aEnd);
    ctx.lineTo(w + 100, h + 100);
    ctx.lineTo(-100, h + 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4. Two rim hairlines
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.11)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, aStart, aEnd);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.arc(cx, cy, r - 17, aStart, aEnd);
    ctx.stroke();
    ctx.restore();
  }, []);

  const drawRing = useCallback((rot: number) => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h, cx, cy, r, displayFont, labelFont } = geomRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.ceil(w * dpr);
    const ch = Math.ceil(h * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const dxMax = Math.max(cx + 80, w - cx + 80);
    const rTextInner = r - 110;
    const halfSpan = Math.asin(Math.min(1, dxMax / Math.max(1, rTextInner))) + 0.08;
    const aStart = -Math.PI / 2 - halfSpan;
    const aEnd = -Math.PI / 2 + halfSpan;

    // 1. Knurled edge: radial line every 4.8px of arc, R-1 to R-14, #26282d
    const knurlStep = 4.8 / r;
    const kStart = Math.floor((aStart - rot) / knurlStep);
    const kEnd = Math.ceil((aEnd - rot) / knurlStep);
    ctx.strokeStyle = '#26282d';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let k = kStart; k <= kEnd; k++) {
      const a = k * knurlStep + rot;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ctx.moveTo(cx + (r - 1) * cos, cy + (r - 1) * sin);
      ctx.lineTo(cx + (r - 14) * cos, cy + (r - 14) * sin);
    }
    ctx.stroke();

    // 2. Tick scale: every 1° from R-20 to R-27, longer (to R-34) every 5°
    const degStep = Math.PI / 180;
    const dStart = Math.floor((aStart - rot) / degStep);
    const dEnd = Math.ceil((aEnd - rot) / degStep);

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let d = dStart; d <= dEnd; d++) {
      if (d % 5 === 0) continue;
      const a = d * degStep + rot;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ctx.moveTo(cx + (r - 20) * cos, cy + (r - 20) * sin);
      ctx.lineTo(cx + (r - 27) * cos, cy + (r - 27) * sin);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    for (let d = dStart; d <= dEnd; d++) {
      if (d % 5 !== 0) continue;
      const a = d * degStep + rot;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ctx.moveTo(cx + (r - 20) * cos, cy + (r - 20) * sin);
      ctx.lineTo(cx + (r - 34) * cos, cy + (r - 34) * sin);
    }
    ctx.stroke();

    // 3. Engraved rim text along radius R-58
    const rimRadius = r - 58;
    const rimFontSize = Math.max(13, w * 0.0125);
    const rimStr = 'APERTURE ROW · BERLIN · VINTAGE CAMERAS · SERVICED BY HAND · ';
    const tracking = rimFontSize * 0.42;

    ctx.save();
    ctx.font = `600 ${rimFontSize.toFixed(1)}px ${displayFont}`;
    ctx.fillStyle = 'rgba(255,255,255,0.24)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const avgAdvance = (rimFontSize * 0.56 + tracking) / rimRadius;
    const glyphStart = Math.floor((aStart - rot) / avgAdvance) - 2;
    const glyphEnd = Math.ceil((aEnd - rot) / avgAdvance) + 2;

    for (let gi = glyphStart; gi <= glyphEnd; gi++) {
      const a = gi * avgAdvance + rot;
      if (a < aStart - 0.04 || a > aEnd + 0.04) continue;
      const charIdx = ((gi % rimStr.length) + rimStr.length) % rimStr.length;
      const ch = rimStr[charIdx];
      if (ch === ' ') continue;
      const gx = cx + rimRadius * Math.cos(a);
      const gy = cy + rimRadius * Math.sin(a);
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // 4. Blue focus/aperture scale along R-96
    const scaleRadius = r - 96;
    const scaleFontSize = Math.max(11, w * 0.0095);
    const scaleTokens = [
      '∞',
      '10',
      '5',
      '3',
      '2',
      '1.5',
      '1 m',
      '·',
      '1.4',
      '2',
      '2.8',
      '4',
      '5.6',
      '8',
      '11',
      '16',
      '·',
    ];
    const tokenStep = (scaleFontSize * 3.8) / scaleRadius;
    const tStart = Math.floor((aStart - rot) / tokenStep) - 1;
    const tEnd = Math.ceil((aEnd - rot) / tokenStep) + 1;

    ctx.save();
    ctx.font = `600 ${scaleFontSize.toFixed(1)}px ${labelFont}`;
    ctx.fillStyle = 'rgba(122,164,255,0.34)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let ti = tStart; ti <= tEnd; ti++) {
      const a = ti * tokenStep + rot;
      if (a < aStart - 0.04 || a > aEnd + 0.04) continue;
      const tok = scaleTokens[((ti % scaleTokens.length) + scaleTokens.length) % scaleTokens.length];
      const tx = cx + scaleRadius * Math.cos(a);
      const ty = cy + scaleRadius * Math.sin(a);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(a + Math.PI / 2);
      ctx.fillText(tok, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }, []);

  // ---------------------------------------------------------------------------
  // Layout Geometry Calculation & Resize Handling
  // ---------------------------------------------------------------------------
  const updateGeometry = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 860;

    const r = mobile ? 1.5 * w : 1.45 * w;
    const cx = mobile ? 0.5 * w : 0.6 * w;
    const cy = mobile ? 0.5 * h + r : 0.29 * h + r;
    const ri = mobile ? r - 0.2 * h : r - 0.27 * h;
    const iw = mobile ? 0.74 * w : 0.31 * w;
    const ih = iw * 0.672;
    const delta = mobile ? (0.92 * w) / ri : (0.47 * w) / ri;
    const seg = 0.8 * h;
    const heroHeight = h + (CAMERAS.length - 1) * seg;

    // Cache heroTop without reading inside RAF
    const heroEl = heroRef.current;
    const heroTop = heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0;

    const rootStyles = getComputedStyle(document.documentElement);
    const bodyFont = titleFontMeasureRef.current
      ? getComputedStyle(titleFontMeasureRef.current).fontFamily
      : rootStyles.getPropertyValue('--font-display') || 'Barlow Condensed, sans-serif';

    geomRef.current = {
      w,
      h,
      cx,
      cy,
      r,
      ri,
      iw,
      ih,
      delta,
      seg,
      heroTop,
      heroBottom: heroTop + heroHeight,
      mobile,
      displayFont: bodyFont || 'Barlow Condensed, sans-serif',
      labelFont: bodyFont || 'Barlow Semi Condensed, sans-serif',
    };

    setStageDims({
      w,
      h,
      cx,
      cy,
      r,
      ri,
      iw,
      ih,
      mobile,
      heroHeight,
    });

    drawDisc();
    drawRing(simRef.current.lastRot === 999 ? -simRef.current.posS * delta : simRef.current.lastRot);
  }, [drawDisc, drawRing]);

  // Read heroTop live from the DOM so scroll math stays correct after layout
  // shifts (fonts/images loading change the cached heroTop and caused the page
  // to scroll to a blank position).
  const getHeroTop = useCallback(() => {
    const heroEl = heroRef.current;
    return heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0;
  }, []);

  // ---------------------------------------------------------------------------
  // Drawer Open Helper
  // ---------------------------------------------------------------------------
  const openDrawerForCamera = useCallback((cam: CameraData) => {
    setDrawerCam(cam);
    setDrawerKit('only');
    setDrawerWarranty(false);
    setAddBtnState('idle');
    setPlateTilt({ rx: 0, ry: 0 });
    setDisplayedDrawerPrice(cam.price);
    setDrawerOpen(true);
    setCartOpen(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Active Camera Swap Animation & Aperture Scramble
  // ---------------------------------------------------------------------------
  const scrambleTimerRef = useRef<number | null>(null);
  const swapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (activeIdx === displayedIdx && swapPhase === 'idle') return;

    // 1. Aperture scramble (~300ms)
    if (scrambleTimerRef.current) window.clearInterval(scrambleTimerRef.current);
    const targetAperture = CAMERAS[activeIdx].aperture;
    const glyphs = '0123456789./f';
    const startScramble = performance.now();
    scrambleTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startScramble;
      if (elapsed >= 300) {
        if (scrambleTimerRef.current) window.clearInterval(scrambleTimerRef.current);
        setApertureDisplay(targetAperture);
        return;
      }
      let out = 'f/';
      for (let i = 2; i < targetAperture.length; i++) {
        out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      setApertureDisplay(out);
    }, 36);

    // 2. Copy swap sequence
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    const swapRaf = requestAnimationFrame(() => {
      setSwapPhase('out');
    });
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayedIdx(activeIdx);
      setSwapPhase('prep');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSwapPhase('in');
        });
      });
    }, 300);

    return () => {
      cancelAnimationFrame(swapRaf);
      if (scrambleTimerRef.current) window.clearInterval(scrambleTimerRef.current);
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current);
    };
  }, [activeIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Main Initialization: Fonts, Geometry, Scroll/Wheel/Keyboard, 120fps Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const initRaf = requestAnimationFrame(() => {
      updateGeometry();
      const heroTop = getHeroTop();
      const initialPos = clamp(
        (window.scrollY - heroTop) / Math.max(1, geomRef.current.seg),
        0,
        CAMERAS.length - 1
      );
      simRef.current.pos = initialPos;
      simRef.current.posS = initialPos;
      const initIdx = Math.round(initialPos);
      simRef.current.activeIdx = initIdx;
      setActiveIdx(initIdx);
      setDisplayedIdx(initIdx);
      setApertureDisplay(CAMERAS[initIdx].aperture);
      setScrolledHeader(window.scrollY > 40);
      setVisitDate((prev) => prev || defaultVisitDate());
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateGeometry();
      });
    }

    const onResize = () => updateGeometry();
    window.addEventListener('resize', onResize);

    // Scroll listener
    const onScroll = () => {
      const sy = window.scrollY;
      setScrolledHeader(sy > 40);

      const heroTop = getHeroTop();
      const { seg } = geomRef.current;
      const p = clamp((sy - heroTop) / Math.max(1, seg), 0, CAMERAS.length - 1);
      simRef.current.pos = p;

      if (sy > heroTop + 12 && !simRef.current.hintDismissed) {
        simRef.current.hintDismissed = true;
        setHintDismissed(true);
      }

      // Keep hero geometry fresh for the RAF loop and snap calculations
      geomRef.current.heroTop = heroTop;
      geomRef.current.heroBottom =
        heroTop + geomRef.current.h + (CAMERAS.length - 1) * geomRef.current.seg;

      // Snap when scrolling stops for 170ms inside hero
      if (simRef.current.snapTimer) window.clearTimeout(simRef.current.snapTimer);
      if (
        !simRef.current.isDragging &&
        !simRef.current.isTweening &&
        sy > heroTop + 2 &&
        sy < heroTop + (CAMERAS.length - 1) * seg - 2
      ) {
        simRef.current.snapTimer = window.setTimeout(() => {
          if (simRef.current.isDragging || simRef.current.isTweening) return;
          const nearest = clamp(Math.round(simRef.current.pos), 0, CAMERAS.length - 1);
          const targetY = getHeroTop() + nearest * geomRef.current.seg;
          if (Math.abs(window.scrollY - targetY) > 2) {
            tweenScrollTo(targetY, 520, easeOutCubic);
          }
        }, 170);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Wheel listener: rotate the disc horizontally instead of scrolling the page vertically
    const onWheel = (e: WheelEvent) => {
      if (simRef.current.drawerOpen || simRef.current.lightboxOpen) return;
      const sy = window.scrollY;
      const heroTop = getHeroTop();
      const { seg } = geomRef.current;
      const maxHeroScroll = heroTop + (CAMERAS.length - 1) * seg;

      // Only intercept inside the pinned hero scroll range
      if (sy < heroTop - 4 || sy > maxHeroScroll + 4) return;

      // Never let the wheel scroll the page vertically — only rotate the disc horizontally
      e.preventDefault();

      const now = performance.now();
      if (now < simRef.current.wheelLockUntil) return;

      // Prefer horizontal wheel delta (shift+scroll), fall back to vertical delta
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;

      if (Math.sign(delta) !== Math.sign(simRef.current.wheelAcc) && simRef.current.wheelAcc !== 0) {
        simRef.current.wheelAcc = 0;
      }
      simRef.current.wheelAcc += delta;

      if (Math.abs(simRef.current.wheelAcc) > 24) {
        const dir = Math.sign(simRef.current.wheelAcc);
        const currentNearest = clamp(Math.round(simRef.current.pos), 0, CAMERAS.length - 1);
        const nextIdx = clamp(currentNearest + dir, 0, CAMERAS.length - 1);
        simRef.current.wheelAcc = 0;
        simRef.current.wheelLockUntil = now + 620;

        if (nextIdx !== currentNearest) {
          // Rotate the disc horizontally by updating pos — RAF loop draws the ring
          simRef.current.pos = nextIdx;
          simRef.current.posS = nextIdx;
          simRef.current.activeIdx = nextIdx;
          setActiveIdx(nextIdx);
          setDisplayedIdx(nextIdx);
          setApertureDisplay(CAMERAS[nextIdx].aperture);
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    // Keyboard controls
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (simRef.current.lightboxOpen) {
          setLightbox(null);
          return;
        }
        if (simRef.current.drawerOpen) {
          setDrawerOpen(false);
          return;
        }
        setCartOpen(false);
        return;
      }
      if (simRef.current.drawerOpen || simRef.current.lightboxOpen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

      const sy = window.scrollY;
      const heroTop = getHeroTop();
      const { heroBottom, h } = geomRef.current;
      if (sy > heroBottom - h * 0.4) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        spinToCamera(simRef.current.activeIdx + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        spinToCamera(simRef.current.activeIdx - 1);
      } else if (e.key === 'Enter' && sy >= heroTop - 40) {
        const cam = CAMERAS[simRef.current.activeIdx];
        if (cam) {
          openDrawerForCamera(cam);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Master 120fps Animation Loop (Hero + Bench Iris)
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const timeSec = now * 0.001;

      const sy = window.scrollY;
      const { cx, cy, ri, iw, delta, heroTop, heroBottom } = geomRef.current;

      // 1. Hero Loop (stops updating once scrolled past hero)
      if (sy <= heroBottom + 100) {
        const s = simRef.current;
        const prevPosS = s.posS;
        const alpha = 1 - Math.exp(-dt * 11);
        s.posS += (s.pos - s.posS) * alpha;
        if (Math.abs(s.pos - s.posS) < 0.00015) s.posS = s.pos;

        const vel = dt > 0 ? (s.posS - prevPosS) / dt : 0;
        s.vel = vel;

        const nearest = clamp(Math.round(s.posS), 0, CAMERAS.length - 1);
        if (nearest !== s.activeIdx) {
          s.activeIdx = nearest;
          setActiveIdx(nearest);
        }

        const rot = -s.posS * delta;
        if (Math.abs(rot - s.lastRot) > 0.00008) {
          drawRing(rot);
          s.lastRot = rot;
          if (logoBladesRef.current) {
            const logoDeg = (rot * 180) / Math.PI * 3;
            logoBladesRef.current.style.transform = `rotate(${logoDeg.toFixed(2)}deg)`;
          }
        }

        // Update cameras & accessories directly via DOM refs
        const blurQuant = Math.round(Math.min(7, Math.abs(vel) * 2.6) * 2) / 2;
        for (let i = 0; i < CAMERAS.length; i++) {
          const wrap = camWrapRefs.current[i];
          if (!wrap) continue;

          const d = i - s.posS;
          if (Math.abs(d) > 1.9) {
            if (wrap.style.display !== 'none') wrap.style.display = 'none';
            continue;
          }
          if (wrap.style.display === 'none') wrap.style.display = 'block';

          const theta = -Math.PI / 2 + d * delta;
          const x = cx + ri * Math.cos(theta);
          const y = cy + ri * Math.sin(theta);
          const rotDeg = (theta + Math.PI / 2) * (180 / Math.PI);
          const op = Math.max(0, 1 - Math.min(0.62, Math.abs(d) * 0.5));

          wrap.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${rotDeg.toFixed(2)}deg)`;
          wrap.style.opacity = op.toFixed(3);
          wrap.style.zIndex = Math.abs(d) < 0.5 ? '18' : '12';

          if (s.lastBlur[i] !== blurQuant) {
            s.lastBlur[i] = blurQuant;
            wrap.style.filter = blurQuant > 0 ? `blur(${blurQuant}px)` : '';
          }

          // Update 4 accessories for camera i
          const accTarget = Math.max(0, 1 - Math.abs(d) * 1.15);
          const camAccs = CAMERAS[i].accessories;
          for (let ai = 0; ai < camAccs.length; ai++) {
            const accEl = accRefs.current[i]?.[ai];
            if (!accEl) continue;

            const stiffness = 90 - ai * 12;
            const damping = 13;
            let sv = s.accS[i][ai];
            let vv = s.accV[i][ai];
            const force = (accTarget - sv) * stiffness - vv * damping;
            vv += force * dt;
            sv += vv * dt;
            s.accS[i][ai] = sv;
            s.accV[i][ai] = vv;

            const [, ax, ay, baseRot, size] = camAccs[ai];
            const spread = 1 + (1 - sv) * 0.9;
            const swayX = Math.sin(timeSec * (0.9 + ai * 0.25) + i * 2.1 + ai) * 3.5 * sv;
            const swayY = Math.cos(timeSec * (0.8 + ai * 0.2) + i * 1.3 + ai * 1.7) * 3.5 * sv;
            const px = ax * iw * spread + swayX;
            const py = ay * iw * spread + swayY;
            const spin = baseRot + (1 - sv) * 80 * accSigns[i][ai];
            const accOp = clamp(sv * 1.4, 0, 1);

            accEl.style.width = `${(size * iw).toFixed(1)}px`;
            accEl.style.opacity = accOp.toFixed(3);
            accEl.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) translate(-50%, -50%) rotate(${spin.toFixed(2)}deg)`;
          }
        }
      }

      // 2. Bench 9-Blade Aperture Iris (updates ONLY when visible and changing)
      if (benchVisibleRef.current && benchRef.current) {
        const rect = benchRef.current.getBoundingClientRect();
        const vh = geomRef.current.h || window.innerHeight;
        // Progress 0..1 through the bench section
        const progress = clamp((vh - rect.top) / (rect.height + vh * 0.4), 0, 1);
        const scrollOpen = clamp(0.18 + Math.sin(progress * Math.PI) * 0.72, 0.14, 0.92);
        const targetOpen = irisHoverRef.current ? 1 : scrollOpen;

        irisOpenRef.current += (targetOpen - irisOpenRef.current) * (1 - Math.exp(-dt * 10));
        if (Math.abs(targetOpen - irisOpenRef.current) < 0.0008) {
          irisOpenRef.current = targetOpen;
        }

        if (Math.abs(irisOpenRef.current - irisLastDrawnRef.current) > 0.0005) {
          const open = irisOpenRef.current;
          irisLastDrawnRef.current = open;
          const IR = 136;
          const ro = 14 + open * (IR - 30);
          const twist = (1 - open) * 34;

          for (let k = 0; k < 9; k++) {
            const blade = irisBladeRefs.current[k];
            if (!blade) continue;
            const outerA = (k / 9) * 360 + twist;
            const innerA = -twist * 1.6;
            blade.setAttribute(
              'transform',
              `translate(200, 200) rotate(${outerA.toFixed(2)}) translate(0, ${(-ro).toFixed(
                2
              )}) rotate(${innerA.toFixed(2)})`
            );
          }

          if (irisGlowRef.current) {
            const glowScale = 0.72 + open * 0.42;
            const glowOp = 0.25 + open * 0.45;
            irisGlowRef.current.style.transform = `scale(${glowScale.toFixed(3)})`;
            irisGlowRef.current.style.opacity = glowOp.toFixed(3);
          }

          // Update readout f-stop label smoothly when discrete step changes
          const fIdx = Math.round((1 - open) * (F_STOPS.length - 1));
          const nextStop = `f/${F_STOPS[clamp(fIdx, 0, F_STOPS.length - 1)]}`;
          setIrisFStopLabel((prev) => (prev === nextStop ? prev : nextStop));
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      if (simRef.current.snapTimer) window.clearTimeout(simRef.current.snapTimer);
    };
  }, [accSigns, drawRing, getHeroTop, openDrawerForCamera, spinToCamera, tweenScrollTo, updateGeometry]);

  // ---------------------------------------------------------------------------
  // IntersectionObservers: Reveals + Bench Visibility & Stat Count-Up
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll('.ar-reveal'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    const benchEl = benchRef.current;
    let benchIo: IntersectionObserver | null = null;
    if (benchEl) {
      benchIo = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          benchVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            setBenchStatsStarted(true);
          }
        },
        { threshold: 0.06 }
      );
      benchIo.observe(benchEl);
    }

    return () => {
      io.disconnect();
      benchIo?.disconnect();
    };
  }, []);

  // Count-up stats over 1.6s when Bench scrolls into view
  useEffect(() => {
    if (!benchStatsStarted) return;
    const duration = 1600;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setStatCameras(Math.round(1240 * e));
      setStatChecks(Math.round(48 * e));
      setStatWarranty(Math.round(12 * e));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [benchStatsStarted]);

  // ---------------------------------------------------------------------------
  // Hero Pointer Drag & Fling
  // ---------------------------------------------------------------------------
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startPos: 0,
    hasMoved: false,
    samples: [] as { t: number; p: number }[],
  });

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[data-copy-col]')) return;

    if (simRef.current.tweenCancel) simRef.current.tweenCancel();
    simRef.current.isDragging = true;
    simRef.current.justDragged = false;

    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPos: simRef.current.pos,
      hasMoved: false,
      samples: [{ t: performance.now(), p: simRef.current.pos }],
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Move cursor pill if hovering active camera
    if (cursorPillRef.current) {
      cursorPillRef.current.style.transform = `translate3d(${e.clientX + 18}px, ${e.clientY + 18}px, 0)`;
    }

    const d = dragStateRef.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.hasMoved && Math.hypot(dx, dy) > 6) {
      d.hasMoved = true;
      simRef.current.justDragged = true;
      if (!simRef.current.hintDismissed) {
        simRef.current.hintDismissed = true;
        setHintDismissed(true);
      }
    }

    if (d.hasMoved) {
      const { ri, delta } = geomRef.current;
      const newPos = clamp(d.startPos - dx / (ri * delta), 0, CAMERAS.length - 1);
      simRef.current.pos = newPos;
      // Rotate the disc horizontally — do not scroll the page vertically

      const now = performance.now();
      d.samples.push({ t: now, p: newPos });
      if (d.samples.length > 6) d.samples.shift();
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragStateRef.current;
    if (!d.active) return;
    d.active = false;
    simRef.current.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore if not captured
    }

    if (d.hasMoved) {
      let velPos = 0;
      const now = performance.now();
      const valid = d.samples.filter((s) => now - s.t < 140);
      if (valid.length >= 2) {
        const first = valid[0];
        const last = valid[valid.length - 1];
        const dtSec = Math.max(0.016, (last.t - first.t) / 1000);
        velPos = (last.p - first.p) / dtSec;
      }
      const fling = clamp(velPos * 0.22, -1.2, 1.2);
      const targetIdx = clamp(Math.round(simRef.current.pos + fling), 0, CAMERAS.length - 1);
      // Snap to camera by rotating the disc horizontally — no vertical page scroll
      simRef.current.pos = targetIdx;
      simRef.current.posS = targetIdx;
      simRef.current.activeIdx = targetIdx;
      setActiveIdx(targetIdx);
      setDisplayedIdx(targetIdx);
      setApertureDisplay(CAMERAS[targetIdx].aperture);
      window.setTimeout(() => {
        simRef.current.justDragged = false;
      }, 60);
    }
  };

  // ---------------------------------------------------------------------------
  // Drawer Actions & Animated Price Counter
  // ---------------------------------------------------------------------------
  useEffect(() => {
    simRef.current.drawerOpen = drawerOpen;
  }, [drawerOpen]);

  useEffect(() => {
    simRef.current.lightboxOpen = Boolean(lightbox);
  }, [lightbox]);

  const targetDrawerPrice = useMemo(() => {
    if (!drawerCam) return 0;
    const kitAdd = drawerKit === 'shooter' ? shooterKitExtra(drawerCam.price) : 0;
    const warAdd = drawerWarranty ? 39 : 0;
    return drawerCam.price + kitAdd + warAdd;
  }, [drawerCam, drawerKit, drawerWarranty]);

  const priceFromRef = useRef(0);
  useEffect(() => {
    if (!drawerCam) return;
    const startVal = priceFromRef.current || targetDrawerPrice;
    const endVal = targetDrawerPrice;
    priceFromRef.current = endVal;
    if (startVal === endVal) {
      setDisplayedDrawerPrice(endVal);
      return;
    }

    const duration = 450;
    const startTime = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = clamp((now - startTime) / duration, 0, 1);
      const eased = easeOutCubic(t);
      setDisplayedDrawerPrice(Math.round(startVal + (endVal - startVal) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetDrawerPrice, drawerCam]);

  // Close cart dropdown on outside click
  useEffect(() => {
    if (!cartOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(t) &&
        cartBtnRef.current &&
        !cartBtnRef.current.contains(t)
      ) {
        setCartOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [cartOpen]);

  // Add to cart sequence (flash + arc fly + badge bump + green button + close + white toast)
  const handleAddToCart = () => {
    if (!drawerCam || addBtnState === 'added') return;

    const cam = drawerCam;
    const finalPrice = targetDrawerPrice;
    const kit = drawerKit;
    const warranty = drawerWarranty;
    const thumb = imgUrl(CAMERA_ASSETS[cam.key], 200);

    // 1. White camera flash
    setFlashKey((k) => k + 1);

    // 2. Flying camera along parabolic arc to cart badge (900ms)
    const startEl = drawerPlateImgRef.current;
    const endEl = cartBtnRef.current;
    if (startEl && endEl) {
      const sr = startEl.getBoundingClientRect();
      const er = endEl.getBoundingClientRect();
      const sx = sr.left + sr.width / 2;
      const sy = sr.top + sr.height / 2;
      const ex = er.left + er.width / 2;
      const ey = er.top + er.height / 2;
      const cx = (sx + ex) / 2 - 40;
      const cy = Math.min(sy, ey) - 130;

      const flyStart = performance.now();
      const flyDur = 900;
      const flyStep = (now: number) => {
        const t = clamp((now - flyStart) / flyDur, 0, 1);
        const e = easeInOutCubic(t);
        const inv = 1 - e;
        const x = inv * inv * sx + 2 * inv * e * cx + e * e * ex;
        const y = inv * inv * sy + 2 * inv * e * cy + e * e * ey;
        const w = sr.width * (1 - e * 0.84);
        const h = sr.height * (1 - e * 0.84);
        const opacity = t > 0.82 ? 1 - (t - 0.82) / 0.18 : 1;

        setFlyingCam({ src: thumb, x, y, w, h, opacity });
        if (t < 1) {
          requestAnimationFrame(flyStep);
        } else {
          setFlyingCam(null);
        }
      };
      requestAnimationFrame(flyStep);
    }

    // 3. Update cart & bump badge
    setCart((prev) => [
      ...prev,
      {
        id: `${cam.key}-${Date.now()}`,
        cameraKey: cam.key,
        name: cam.name,
        kit,
        warranty,
        price: finalPrice,
      },
    ]);
    setCartBump(false);
    requestAnimationFrame(() => setCartBump(true));

    // 4. Button turns green
    setAddBtnState('added');

    // 5. Close drawer & show white toast
    const summaryParts = [kit === 'shooter' ? 'shooter kit' : 'camera only'];
    if (warranty) summaryParts.push('24m warranty');
    window.setTimeout(() => {
      setDrawerOpen(false);
      showToast(`${cam.name} · ${summaryParts.join(' + ')} added to cart`, thumb);
    }, 520);
  };

  // ---------------------------------------------------------------------------
  // Visit Form Submit
  // ---------------------------------------------------------------------------
  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (visitStatus !== 'idle') return;
    setVisitStatus('submitting');
    const code = `AR-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingCode(code);

    window.setTimeout(() => {
      setVisitStatus('booked');
      window.setTimeout(() => {
        setVisitStatus('idle');
        setVisitName('');
      }, 6000);
    }, 1100);
  };

  // ---------------------------------------------------------------------------
  // Derived Display Variables
  // ---------------------------------------------------------------------------
  const shownCam = CAMERAS[displayedIdx];
  const progressFraction = (activeIdx + 1) / CAMERAS.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] selection:bg-[#3d7bff] selection:text-white">
      {/* Static Fixed SVG Grain Overlay */}
      <svg className="ar-grain" aria-hidden="true">
        <filter id="ar-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#ar-noise)" />
      </svg>

      {/* Camera Flash Overlay */}
      {flashKey > 0 && (
        <div
          key={flashKey}
          className="fixed inset-0 z-[120] bg-white pointer-events-none flash-active"
          aria-hidden="true"
        />
      )}

      {/* Flying Camera Clone */}
      {flyingCam && (
        <img
          src={flyingCam.src}
          alt=""
          referrerPolicy="no-referrer"
          className="fixed z-[115] pointer-events-none object-contain"
          style={{
            left: flyingCam.x,
            top: flyingCam.y,
            width: flyingCam.w,
            height: flyingCam.h,
            opacity: flyingCam.opacity,
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.65))',
          }}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* HEADER                                                              */}
      {/* ------------------------------------------------------------------- */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300"
        style={{
          height: scrolledHeader ? 70 : 84,
          paddingInline: 'max(20px, 3.6vw)',
          backgroundColor: scrolledHeader ? 'rgba(11,12,14,0.72)' : 'transparent',
          backdropFilter: scrolledHeader ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolledHeader ? 'blur(14px)' : 'none',
          borderBottom: scrolledHeader ? '1px solid var(--line)' : '1px solid transparent',
        }}
      >
        {/* Brand */}
        <button
          type="button"
          onClick={() => tweenScrollTo(0, 760, easeInOutCubic)}
          className="flex items-center gap-3 text-left shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff] rounded-md"
        >
          <span className="w-10 h-10 rounded-full bg-[#3d7bff] flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(61,123,255,0.35)]">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <g ref={logoBladesRef} style={{ transformOrigin: '12px 12px' }}>
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <line
                    key={deg}
                    x1="12"
                    y1="4.5"
                    x2="18.2"
                    y2="11.2"
                    stroke="#eef0f3"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    transform={`rotate(${deg} 12 12)`}
                  />
                ))}
              </g>
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span
              className="font-display font-semibold text-[23px] text-[var(--ink)] whitespace-nowrap"
              style={{ letterSpacing: '0.08em' }}
            >
              APERTURE ROW
            </span>
            <span
              className="font-label font-medium text-[10.5px] text-[var(--mute)] mt-[3px] whitespace-nowrap"
              style={{ letterSpacing: '0.24em' }}
            >
              VINTAGE CAMERAS · BERLIN
            </span>
          </span>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { label: 'THE BENCH', id: 'bench' },
            { label: 'CATALOG', id: 'catalog' },
            { label: 'VISIT', id: 'visit' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="relative py-1.5 font-label font-semibold text-[13px] text-[var(--ink)]/85 hover:text-[var(--ink)] transition-colors whitespace-nowrap shrink-0 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff] rounded"
              style={{ letterSpacing: '0.2em' }}
            >
              {item.label}
              <span className="absolute left-0 right-0 bottom-0 h-[1.5px] bg-[#3d7bff] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
          ))}
        </nav>

        {/* Right Actions: Cart Pill + Book a Session */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="relative">
            <button
              ref={cartBtnRef}
              type="button"
              onClick={() => setCartOpen((o) => !o)}
              className={`h-10 px-3.5 rounded-full border border-[var(--line)] bg-[#121317]/75 hover:border-white/25 transition-colors flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff] ${
                cartBump ? 'cart-bump' : ''
              }`}
              onAnimationEnd={() => setCartBump(false)}
              aria-label="Open cart"
            >
              <span
                className="font-label font-semibold text-[12px] text-[var(--ink)]"
                style={{ letterSpacing: '0.18em' }}
              >
                CART
              </span>
              <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#3d7bff] text-white font-label font-semibold text-[12px] flex items-center justify-center tabular-nums">
                {cart.length}
              </span>
            </button>

            {/* Cart Dropdown */}
            {cartOpen && (
              <div
                ref={cartDropdownRef}
                className="absolute right-0 mt-3 w-[min(370px,90vw)] rounded-2xl bg-[#121317] border border-[var(--line)] shadow-[0_24px_64px_rgba(0,0,0,0.75)] overflow-hidden z-[60]"
              >
                <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
                  <span
                    className="font-label font-semibold text-[12px] text-[var(--blue2)]"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    BAG · {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    className="text-[var(--mute)] hover:text-white p-1 cursor-pointer"
                    aria-label="Close bag"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="px-5 py-9 text-center">
                    <ShoppingBag className="w-6 h-6 text-[var(--mute)] mx-auto mb-3 opacity-60" />
                    <p className="text-[14px] text-[var(--mute)] leading-relaxed">
                      Your bag is empty. Spin the ring or pick a camera from the shelf.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-[var(--line)]">
                      {cart.map((item) => (
                        <div key={item.id} className="px-5 py-3.5 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#0b0c0e] border border-[var(--line)] flex items-center justify-center shrink-0 overflow-hidden p-1">
                            <img
                              src={imgUrl(CAMERA_ASSETS[item.cameraKey], 200)}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-semibold text-[19px] leading-none tracking-wide text-[var(--ink)] truncate">
                              {item.name}
                            </p>
                            <p className="text-[12px] text-[var(--mute)] mt-1 truncate">
                              {item.kit === 'shooter' ? 'Shooter kit' : 'Camera only'}
                              {item.warranty ? ' · 24m warranty' : ''}
                            </p>
                          </div>
                          <span className="font-display font-semibold text-[19px] tabular-nums text-[var(--ink)] shrink-0">
                            {formatEur(item.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setCart((prev) => prev.filter((c) => c.id !== item.id))
                            }
                            className="p-1.5 text-[var(--mute)] hover:text-white transition-colors cursor-pointer shrink-0"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-4 border-t border-[var(--line)] bg-[#0e0f13]">
                      <div className="flex items-baseline justify-between mb-3.5">
                        <span
                          className="font-label font-semibold text-[12px] text-[var(--mute)]"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          TOTAL
                        </span>
                        <span className="font-display font-semibold text-[28px] leading-none tabular-nums text-[var(--ink)]">
                          {formatEur(cartTotal)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCartOpen(false);
                          showToast('Demo store — checkout is switched off');
                        }}
                        className="w-full h-11 rounded-full bg-[#3d7bff] hover:bg-[#528bff] transition-colors font-label font-semibold text-[13px] text-white cursor-pointer"
                        style={{ letterSpacing: '0.18em' }}
                      >
                        CHECKOUT
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => scrollToSection('visit')}
            className="hidden sm:inline-flex h-10 px-5 rounded-full bg-[#3d7bff] hover:bg-[#528bff] transition-colors items-center font-label font-semibold text-[12px] text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ letterSpacing: '0.18em' }}
          >
            BOOK A SESSION
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* HERO: PINNED TOP-DOWN ROTATING LENS RING                            */}
      {/* ------------------------------------------------------------------- */}
      <section
        id="hero"
        ref={heroRef}
        className="relative w-full"
        style={{ height: stageDims.heroHeight }}
      >
        <div
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={handleStagePointerUp}
          className="sticky top-0 w-full h-screen overflow-hidden select-none touch-pan-y cursor-grab active:cursor-grabbing"
        >
          {/* Disc Canvas (Static, drawn on resize) */}
          <canvas
            ref={discCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Ring Canvas (Redrawn only when rotation changes, visible arc only) */}
          <canvas
            ref={ringCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Fixed Blue Index Mark + Scrambled Aperture Readout */}
          <div
            className="absolute pointer-events-none z-20 flex flex-col items-center -translate-x-1/2"
            style={{
              left: stageDims.cx,
              top: Math.max(82, stageDims.cy - stageDims.r - 44),
            }}
          >
            <div
              className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-[#3d7bff] drop-shadow-[0_0_10px_rgba(61,123,255,0.75)]"
              aria-hidden="true"
            />
            <span
              className="mt-1.5 font-label font-semibold text-[13px] text-[var(--blue2)] tabular-nums"
              style={{ letterSpacing: '0.18em' }}
            >
              {apertureDisplay}
            </span>
          </div>

          {/* 6 Vintage Cameras + Scattered Accessories on the Ring */}
          {CAMERAS.map((cam, i) => {
            const isActive = i === activeIdx;
            return (
              <div
                key={cam.key}
                ref={(el) => {
                  camWrapRefs.current[i] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (simRef.current.justDragged) return;
                  if (i === simRef.current.activeIdx) {
                    openDrawerForCamera(cam);
                  } else {
                    spinToCamera(i);
                  }
                }}
                onMouseEnter={() => {
                  if (isActive) setHoveredActive(true);
                }}
                onMouseLeave={() => {
                  if (isActive) setHoveredActive(false);
                }}
                className="absolute top-0 left-0 cursor-pointer will-change-transform"
                style={{
                  width: stageDims.iw,
                  height: stageDims.ih,
                }}
              >
                {/* Scattered Accessories */}
                {cam.accessories.map(([accKey], ai) => (
                  <img
                    key={`${cam.key}-${accKey}-${ai}`}
                    ref={(el) => {
                      if (!accRefs.current[i]) accRefs.current[i] = [null, null, null, null];
                      accRefs.current[i][ai] = el;
                    }}
                    src={imgUrl(ACCESSORY_ASSETS[accKey], 300)}
                    alt=""
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="absolute left-1/2 top-1/2 pointer-events-none object-contain will-change-transform"
                    style={{
                      filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.68))',
                    }}
                  />
                ))}

                {/* Camera Cutout */}
                <div
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
                  style={{
                    transform:
                      isActive && hoveredActive
                        ? `scale(${(cam.scale * 1.035).toFixed(3)})`
                        : `scale(${cam.scale})`,
                    transitionTimingFunction: 'var(--out)',
                  }}
                >
                  <img
                    src={imgUrl(CAMERA_ASSETS[cam.key], 1000)}
                    alt={`${cam.name} — ${cam.type}`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none"
                    style={{
                      filter: 'drop-shadow(0 24px 26px rgba(0,0,0,0.75))',
                    }}
                  />
                </div>

                {/* Viewfinder Reticle on Active Hover */}
                {isActive && (
                  <div
                    className={`absolute inset-4 pointer-events-none transition-all duration-300 ${
                      hoveredActive ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}
                    style={{ transitionTimingFunction: 'var(--spring)' }}
                    aria-hidden="true"
                  >
                    <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[#7aa4ff]" />
                    <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[#7aa4ff]" />
                    <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[#7aa4ff]" />
                    <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[#7aa4ff]" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#7aa4ff]/70 flex items-center justify-center">
                      <span className="w-4 h-[1px] bg-[#7aa4ff]/80" />
                      <span className="h-4 w-[1px] bg-[#7aa4ff]/80 absolute" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Left Shade over the ring, under the copy */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: stageDims.mobile
                ? 'linear-gradient(180deg, rgba(11,12,14,0.92) 0%, rgba(11,12,14,0.72) 38%, rgba(11,12,14,0) 64%)'
                : 'linear-gradient(90deg, rgba(11,12,14,0.92) 0%, rgba(11,12,14,0.7) 24%, rgba(11,12,14,0) 46%)',
            }}
            aria-hidden="true"
          />

          {/* Copy Column */}
          <div
            data-copy-col
            className="absolute z-30"
            style={
              stageDims.mobile
                ? {
                    left: 20,
                    right: 20,
                    top: 88,
                    width: 'auto',
                  }
                : {
                    left: 'max(20px, 5vw)',
                    top: '24vh',
                    width: 'min(36vw, 520px)',
                  }
            }
          >
            {/* Index Row */}
            <div className="flex items-center gap-3.5 mb-3">
              <span
                className="font-label font-semibold text-[13px] text-[var(--blue2)] tabular-nums"
                style={{ letterSpacing: '0.22em' }}
              >
                0{activeIdx + 1}
              </span>
              <div className="w-[72px] h-[1.5px] bg-white/15 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#3d7bff] transition-transform duration-500 origin-left"
                  style={{
                    width: '100%',
                    transform: `scaleX(${progressFraction.toFixed(4)})`,
                    transitionTimingFunction: 'var(--out)',
                  }}
                />
              </div>
              <span
                className="font-label font-semibold text-[13px] text-[var(--blue2)] tabular-nums"
                style={{ letterSpacing: '0.22em' }}
              >
                0{CAMERAS.length}
              </span>
            </div>

            {/* Title inside overflow-hidden mask */}
            <div className="overflow-hidden">
              <h1
                ref={titleFontMeasureRef}
                className="font-display font-semibold text-[var(--ink)] m-0"
                style={{
                  fontSize: stageDims.mobile
                    ? 'clamp(40px, 11vw, 56px)'
                    : 'clamp(56px, 7.4vw, 124px)',
                  lineHeight: 0.88,
                  transform:
                    swapPhase === 'out'
                      ? 'translateY(-108%)'
                      : swapPhase === 'prep'
                      ? 'translateY(108%)'
                      : 'translateY(0%)',
                  transition:
                    swapPhase === 'prep' ? 'none' : 'transform 0.6s var(--io)',
                }}
              >
                {shownCam.name}
              </h1>
            </div>

            {/* Sub */}
            <p
              className="font-label font-semibold text-[13px] text-[var(--blue2)] mt-3 mb-0"
              style={{
                letterSpacing: '0.24em',
                opacity: swapPhase === 'out' || swapPhase === 'prep' ? 0 : 1,
                filter: swapPhase === 'out' || swapPhase === 'prep' ? 'blur(6px)' : 'blur(0px)',
                transform:
                  swapPhase === 'out' || swapPhase === 'prep'
                    ? 'translateY(10px)'
                    : 'translateY(0px)',
                transition:
                  swapPhase === 'prep'
                    ? 'none'
                    : 'opacity 0.35s var(--out) 0ms, filter 0.35s var(--out) 0ms, transform 0.35s var(--out) 0ms',
              }}
            >
              {shownCam.type} · {shownCam.year}
            </p>

            {/* Description */}
            <p
              className="text-[14px] sm:text-[15.5px] leading-[1.58] text-[#c3c7cf] mt-3.5 max-w-[40ch]"
              style={{
                opacity: swapPhase === 'out' || swapPhase === 'prep' ? 0 : 1,
                filter: swapPhase === 'out' || swapPhase === 'prep' ? 'blur(6px)' : 'blur(0px)',
                transform:
                  swapPhase === 'out' || swapPhase === 'prep'
                    ? 'translateY(10px)'
                    : 'translateY(0px)',
                transition:
                  swapPhase === 'prep'
                    ? 'none'
                    : 'opacity 0.38s var(--out) 70ms, filter 0.38s var(--out) 70ms, transform 0.38s var(--out) 70ms',
              }}
            >
              {shownCam.description}
            </p>

            {/* Outlined Chips (32px tall) */}
            <div
              className="hidden sm:flex flex-wrap items-center gap-2 mt-4"
              style={{
                opacity: swapPhase === 'out' || swapPhase === 'prep' ? 0 : 1,
                filter: swapPhase === 'out' || swapPhase === 'prep' ? 'blur(6px)' : 'blur(0px)',
                transform:
                  swapPhase === 'out' || swapPhase === 'prep'
                    ? 'translateY(10px)'
                    : 'translateY(0px)',
                transition:
                  swapPhase === 'prep'
                    ? 'none'
                    : 'opacity 0.38s var(--out) 140ms, filter 0.38s var(--out) 140ms, transform 0.38s var(--out) 140ms',
              }}
            >
              {shownCam.chips.map((chip) => (
                <span
                  key={chip}
                  className="h-8 px-3.5 rounded-full border border-[var(--line)] inline-flex items-center font-label font-medium text-[12px] text-[#c3c7cf]"
                  style={{ letterSpacing: '0.14em' }}
                >
                  {chip}
                </span>
              ))}
            </div>

            {/* Buy Row */}
            <div
              className="flex items-center gap-5 mt-5 sm:mt-6"
              style={{
                opacity: swapPhase === 'out' || swapPhase === 'prep' ? 0 : 1,
                filter: swapPhase === 'out' || swapPhase === 'prep' ? 'blur(6px)' : 'blur(0px)',
                transform:
                  swapPhase === 'out' || swapPhase === 'prep'
                    ? 'translateY(10px)'
                    : 'translateY(0px)',
                transition:
                  swapPhase === 'prep'
                    ? 'none'
                    : 'opacity 0.38s var(--out) 210ms, filter 0.38s var(--out) 210ms, transform 0.38s var(--out) 210ms',
              }}
            >
              <span className="font-display font-semibold text-[32px] sm:text-[38px] leading-none text-[var(--ink)] tabular-nums">
                {formatEur(shownCam.price)}
              </span>
              <button
                type="button"
                onClick={() => openDrawerForCamera(shownCam)}
                className="h-11 px-5 rounded-full bg-[#3d7bff] hover:bg-[#528bff] transition-colors inline-flex items-center gap-2 font-label font-semibold text-[13px] text-white cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{ letterSpacing: '0.16em' }}
              >
                <span>VIEW &amp; BUY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right-Edge Dot Pager */}
          <div
            className="absolute right-[max(16px,2.2vw)] top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5"
            aria-label="Camera ring pagination"
          >
            {CAMERAS.map((c, idx) => {
              const active = idx === activeIdx;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => spinToCamera(idx)}
                  aria-label={`Select ${c.name}`}
                  className="p-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff] rounded-full"
                >
                  <span
                    className="block rounded-full transition-all duration-300"
                    style={{
                      width: 6,
                      height: active ? 28 : 6,
                      backgroundColor: active ? 'var(--blue)' : 'rgba(255,255,255,0.26)',
                      transitionTimingFunction: 'var(--spring)',
                    }}
                  />
                </button>
              );
            })}
          </div>

          {/* Bottom-Center Interaction Hint */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-opacity duration-500 whitespace-nowrap ${
              hintDismissed ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <span
              className="font-label font-medium text-[11.5px] text-[var(--mute)]"
              style={{ letterSpacing: '0.24em' }}
            >
              ⟷ SCROLL OR DRAG TO TURN THE RING
            </span>
          </div>

          {/* Cursor Pill on Active Camera Hover */}
          <div
            ref={cursorPillRef}
            className={`hidden md:flex fixed top-0 left-0 z-40 pointer-events-none h-8 px-3.5 rounded-full bg-[#3d7bff] text-white items-center gap-2 shadow-[0_8px_24px_rgba(61,123,255,0.45)] transition-opacity duration-150 ${
              hoveredActive && !drawerOpen ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          >
            <span className="w-2 h-2 rounded-full bg-white rec-dot" />
            <span
              className="font-label font-semibold text-[11.5px] whitespace-nowrap"
              style={{ letterSpacing: '0.18em' }}
            >
              VIEW DETAILS
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 1: THE BENCH (9-Blade Aperture Iris + Count-Up Stats)       */}
      {/* ------------------------------------------------------------------- */}
      <section
        id="bench"
        ref={benchRef}
        className="ar-reveal relative min-h-screen flex items-center py-24 md:py-32 px-[max(20px,5vw)] border-t border-[var(--line)]"
      >
        <div className="max-w-[1320px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6">
            <span
              className="font-label font-semibold text-[12.5px] text-[var(--blue2)] block mb-4"
              style={{ letterSpacing: '0.26em' }}
            >
              THE BENCH
            </span>
            <h2
              className="font-display font-semibold text-[var(--ink)] m-0"
              style={{
                fontSize: 'clamp(52px, 6.6vw, 112px)',
                lineHeight: 0.9,
              }}
            >
              OPENED.
              <br />
              CLEANED.
              <br />
              CALIBRATED.
            </h2>
            <p className="mt-7 text-[16px] leading-[1.68] text-[#b4b9c2] max-w-[46ch]">
              No camera leaves our bench untouched. Every shutter is timed on an optical rig, every
              rangefinder prism collimated, and every light seal cut by hand in Kreuzberg before a
              body ever reaches the shelf.
            </p>

            {/* Count-Up Stats */}
            <div className="mt-12 pt-8 border-t border-[var(--line)] grid grid-cols-3 gap-6 max-w-[520px]">
              <div>
                <div className="font-display font-semibold text-[40px] sm:text-[52px] leading-none text-[var(--ink)] tabular-nums">
                  {statCameras.toLocaleString('en-US')}
                </div>
                <div
                  className="font-label font-medium text-[11.5px] text-[var(--mute)] mt-2"
                  style={{ letterSpacing: '0.18em' }}
                >
                  CAMERAS SERVICED
                </div>
              </div>
              <div>
                <div className="font-display font-semibold text-[40px] sm:text-[52px] leading-none text-[var(--ink)] tabular-nums">
                  {statChecks}
                </div>
                <div
                  className="font-label font-medium text-[11.5px] text-[var(--mute)] mt-2"
                  style={{ letterSpacing: '0.18em' }}
                >
                  POINT CHECK
                </div>
              </div>
              <div>
                <div className="font-display font-semibold text-[40px] sm:text-[52px] leading-none text-[var(--ink)] tabular-nums">
                  {statWarranty}
                </div>
                <div
                  className="font-label font-medium text-[11.5px] text-[var(--mute)] mt-2"
                  style={{ letterSpacing: '0.18em' }}
                >
                  MONTH WARRANTY
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 9-Blade SVG Aperture Iris */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div
              ref={irisContainerRef}
              onMouseEnter={() => {
                irisHoverRef.current = true;
                setIrisHover(true);
              }}
              onMouseLeave={() => {
                irisHoverRef.current = false;
                setIrisHover(false);
              }}
              className="relative w-[min(420px,84vw)] aspect-square flex items-center justify-center cursor-pointer"
            >
              {/* Blue radial glow behind iris */}
              <div
                ref={irisGlowRef}
                className="absolute inset-8 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(61,123,255,0.48) 0%, rgba(61,123,255,0.12) 48%, rgba(11,12,14,0) 74%)',
                }}
                aria-hidden="true"
              />

              <svg
                viewBox="0 0 400 400"
                className="relative w-full h-full overflow-visible"
                role="img"
                aria-label="Interactive 9-blade camera aperture iris"
              >
                <defs>
                  <radialGradient id="iris-blue-core" cx="50%" cy="50%" r="55%">
                    <stop offset="0%" stopColor="#9fbcff" />
                    <stop offset="55%" stopColor="#3d7bff" />
                    <stop offset="100%" stopColor="#0a1430" />
                  </radialGradient>
                  <linearGradient id="blade-grad-a" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#262932" />
                    <stop offset="100%" stopColor="#121419" />
                  </linearGradient>
                  <linearGradient id="blade-grad-b" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1e2129" />
                    <stop offset="100%" stopColor="#0e1014" />
                  </linearGradient>
                  <clipPath id="iris-inner-clip">
                    <circle cx="200" cy="200" r="136" />
                  </clipPath>
                </defs>

                {/* Outer knurled bezel */}
                <circle
                  cx="200"
                  cy="200"
                  r="192"
                  fill="#0e1014"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="1"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="172"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />

                {/* 48 Bezel Ticks */}
                {Array.from({ length: 48 }).map((_, idx) => {
                  const angle = (idx / 48) * Math.PI * 2;
                  const r1 = 178;
                  const r2 = idx % 6 === 0 ? 190 : 186;
                  return (
                    <line
                      key={idx}
                      x1={(200 + r1 * Math.cos(angle)).toFixed(2)}
                      y1={(200 + r1 * Math.sin(angle)).toFixed(2)}
                      x2={(200 + r2 * Math.cos(angle)).toFixed(2)}
                      y2={(200 + r2 * Math.sin(angle)).toFixed(2)}
                      stroke={idx % 6 === 0 ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.14)'}
                      strokeWidth={idx % 6 === 0 ? 1.4 : 1}
                    />
                  );
                })}

                {/* F-stop numerals around bezel */}
                {F_STOPS.map((stop, idx) => {
                  const angle = -Math.PI / 2 + (idx / F_STOPS.length) * Math.PI * 2;
                  const rad = 156;
                  const tx = (200 + rad * Math.cos(angle)).toFixed(2);
                  const ty = (200 + rad * Math.sin(angle)).toFixed(2);
                  return (
                    <text
                      key={stop}
                      x={tx}
                      y={ty}
                      fill="rgba(238,240,243,0.45)"
                      fontSize="10.5"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontFamily: 'var(--font-label), sans-serif',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {stop}
                    </text>
                  );
                })}

                {/* Blue lit center */}
                <circle cx="200" cy="200" r="136" fill="url(#iris-blue-core)" />

                {/* 9 Clipped Aperture Blades */}
                <g clipPath="url(#iris-inner-clip)">
                  {Array.from({ length: 9 }).map((_, k) => (
                    <g
                      key={k}
                      ref={(el) => {
                        irisBladeRefs.current[k] = el;
                      }}
                      transform={`translate(200, 200) rotate(${((k / 9) * 360 + 12).toFixed(2)}) translate(0, -82) rotate(-19)`}
                    >
                      <rect
                        x="-320"
                        y="-320"
                        width="640"
                        height="320"
                        fill={k % 2 === 0 ? 'url(#blade-grad-a)' : 'url(#blade-grad-b)'}
                      />
                      <line
                        x1="-320"
                        y1="0"
                        x2="320"
                        y2="0"
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="1.2"
                      />
                    </g>
                  ))}
                </g>

                {/* Inner ring bevel */}
                <circle
                  cx="200"
                  cy="200"
                  r="136"
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <p
              className="mt-5 font-label font-semibold text-[12.5px] text-[var(--blue2)] tabular-nums"
              style={{ letterSpacing: '0.24em' }}
            >
              {irisHover ? 'f/1.4 · WIDE OPEN' : `${irisFStopLabel} · HOVER TO OPEN`}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 2: THE CATALOG (3 Columns)                                  */}
      {/* ------------------------------------------------------------------- */}
      <section
        id="catalog"
        className="ar-reveal py-24 md:py-32 px-[max(20px,5vw)] border-t border-[var(--line)]"
      >
        <div className="max-w-[1320px] mx-auto">
          <span
            className="font-label font-semibold text-[12.5px] text-[var(--blue2)] block mb-4"
            style={{ letterSpacing: '0.26em' }}
          >
            THE CATALOG
          </span>
          <h2
            className="font-display font-semibold text-[var(--ink)] m-0 mb-14"
            style={{
              fontSize: 'clamp(50px, 6.2vw, 104px)',
              lineHeight: 0.9,
            }}
          >
            EVERYTHING
            <br />
            ON THE SHELF
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
            {CATALOG_COLUMNS.map((colDef) => {
              const colCameras = CAMERAS.filter((c) => c.column === colDef.col);
              const colExtras = EXTRA_CATALOG.filter((e) => e.column === colDef.col);
              return (
                <div key={colDef.title}>
                  <h3
                    className="font-label font-semibold text-[12.5px] text-[var(--mute)] pb-4 border-b border-[var(--line)] m-0"
                    style={{ letterSpacing: '0.24em' }}
                  >
                    {colDef.title}
                  </h3>

                  <div className="divide-y divide-[var(--line)]">
                    {colCameras.map((cam) => (
                      <button
                        key={cam.key}
                        type="button"
                        onClick={() => openDrawerForCamera(cam)}
                        className="w-full py-5 px-3 -mx-3 rounded-xl flex items-center gap-4 text-left group hover:bg-[#3d7bff]/[0.07] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff]"
                        style={{ transitionTimingFunction: 'var(--out)' }}
                      >
                        <div className="w-[74px] h-[74px] rounded-full bg-[#15171d] border border-[var(--line)] shrink-0 flex items-center justify-center overflow-visible">
                          <img
                            src={imgUrl(CAMERA_ASSETS[cam.key], 240)}
                            alt={cam.name}
                            referrerPolicy="no-referrer"
                            className="w-[84px] h-[84px] object-contain transition-transform duration-300 group-hover:scale-[1.18] group-hover:-rotate-[8deg]"
                            style={{
                              transitionTimingFunction: 'var(--spring)',
                              filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.6))',
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-2">
                          <div className="font-display font-semibold text-[26px] leading-none text-[var(--ink)]">
                            {cam.name}
                          </div>
                          <div className="text-[13px] text-[var(--mute)] mt-1.5">
                            {cam.type} · {cam.year}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-display font-semibold text-[24px] leading-none text-[var(--ink)] tabular-nums">
                            {formatEur(cam.price)}
                          </div>
                          <div
                            className="font-label font-semibold text-[11px] text-[var(--blue2)] mt-1.5"
                            style={{ letterSpacing: '0.16em' }}
                          >
                            IN STOCK
                          </div>
                        </div>
                      </button>
                    ))}

                    {colExtras.map((extra) => {
                      const isInStock = extra.status === 'In stock';
                      return (
                        <button
                          key={extra.name}
                          type="button"
                          onClick={() =>
                            showToast(`${extra.name} — we'll email you when it's back on the shelf`)
                          }
                          className="w-full py-5 px-3 -mx-3 rounded-xl flex items-center gap-4 text-left group hover:bg-[#3d7bff]/[0.07] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff]"
                          style={{ transitionTimingFunction: 'var(--out)' }}
                        >
                          <div className="w-[74px] h-[74px] rounded-full bg-[#121317] border border-[var(--line)] shrink-0 flex items-center justify-center text-[var(--mute)] transition-transform duration-300 group-hover:scale-[1.18] group-hover:-rotate-[8deg]">
                            <CameraIcon className="w-6 h-6 opacity-45" />
                          </div>

                          <div className="flex-1 min-w-0 transition-transform duration-300 group-hover:translate-x-2">
                            <div className="font-display font-semibold text-[26px] leading-none text-[var(--ink)]">
                              {extra.name}
                            </div>
                            <div className="text-[13px] text-[var(--mute)] mt-1.5">{extra.meta}</div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-display font-semibold text-[24px] leading-none text-[var(--ink)] tabular-nums">
                              {formatEur(extra.price)}
                            </div>
                            <div
                              className={`font-label font-semibold text-[11px] mt-1.5 ${
                                isInStock ? 'text-[var(--blue2)]' : 'text-[#f5a623]'
                              }`}
                              style={{ letterSpacing: '0.16em' }}
                            >
                              {extra.status.toUpperCase()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION 3: VISIT (Berlin Shop + Booking Form)                       */}
      {/* ------------------------------------------------------------------- */}
      <section
        id="visit"
        className="ar-reveal py-24 md:py-32 px-[max(20px,5vw)] border-t border-[var(--line)]"
      >
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column */}
          <div className="lg:col-span-6">
            <span
              className="font-label font-semibold text-[12.5px] text-[var(--blue2)] block mb-4"
              style={{ letterSpacing: '0.26em' }}
            >
              VISIT
            </span>
            <h2
              className="font-display font-semibold text-[var(--ink)] m-0"
              style={{
                fontSize: 'clamp(52px, 6.4vw, 108px)',
                lineHeight: 0.9,
              }}
            >
              BRING YOUR
              <br />
              CAMERA IN.
            </h2>

            <div className="mt-10 space-y-6 text-[15.5px]">
              <div className="flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-[var(--blue2)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[var(--ink)] font-medium">Tuesday – Saturday</div>
                  <div className="text-[var(--mute)] mt-0.5">
                    11:00 – 19:00 · Sundays by appointment
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[var(--blue2)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[var(--ink)] font-medium">
                    Lichtstraße 12 · 10119 Berlin
                  </div>
                  <div className="text-[var(--mute)] mt-0.5">U8 Rosenthaler Platz · Backyard unit</div>
                </div>
              </div>
            </div>

            <p className="mt-8 pt-6 border-t border-[var(--line)] text-[14.5px] leading-[1.65] text-[var(--mute)] max-w-[44ch]">
              Bring any mechanical body or lens for a complimentary five-minute condition check at
              the counter—shutter speeds, light seals, and haze inspected while you wait.
            </p>
          </div>

          {/* Right Column: Form Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-[var(--card)] border border-[var(--line)] p-6 sm:p-9 overflow-hidden">
              <form onSubmit={handleVisitSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span
                      className="font-label font-semibold text-[11.5px] text-[var(--mute)] flex items-center gap-1.5 mb-2"
                      style={{ letterSpacing: '0.2em' }}
                    >
                      <Calendar className="w-3.5 h-3.5 text-[var(--blue2)]" />
                      DATE
                    </span>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[#0b0c0e] border border-[var(--line)] text-[15px] text-[var(--ink)] focus:outline-none focus:border-[#3d7bff] [color-scheme:dark]"
                    />
                  </label>

                  <label className="block">
                    <span
                      className="font-label font-semibold text-[11.5px] text-[var(--mute)] flex items-center gap-1.5 mb-2"
                      style={{ letterSpacing: '0.2em' }}
                    >
                      <Clock className="w-3.5 h-3.5 text-[var(--blue2)]" />
                      TIME
                    </span>
                    <select
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-[#0b0c0e] border border-[var(--line)] text-[15px] text-[var(--ink)] focus:outline-none focus:border-[#3d7bff]"
                    >
                      {['11:00', '12:30', '14:00', '15:30', '17:00', '18:00'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span
                    className="font-label font-semibold text-[11.5px] text-[var(--mute)] block mb-2"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    SESSION
                  </span>
                  <select
                    value={visitSession}
                    onChange={(e) => setVisitSession(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#0b0c0e] border border-[var(--line)] text-[15px] text-[var(--ink)] focus:outline-none focus:border-[#3d7bff]"
                  >
                    <option value="Condition check · free">Condition check · free</option>
                    <option value="Repair estimate">Repair estimate</option>
                    <option value="Film 101 workshop · 35 €">Film 101 workshop · 35 €</option>
                    <option value="Private viewing">Private viewing</option>
                  </select>
                </label>

                <label className="block">
                  <span
                    className="font-label font-semibold text-[11.5px] text-[var(--mute)] block mb-2"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    YOUR NAME
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Klara Richter"
                    value={visitName}
                    onChange={(e) => setVisitName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#0b0c0e] border border-[var(--line)] text-[15px] text-[var(--ink)] placeholder:text-white/25 focus:outline-none focus:border-[#3d7bff]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={visitStatus !== 'idle'}
                  className="w-full h-13 rounded-full bg-[#3d7bff] hover:bg-[#528bff] disabled:opacity-80 transition-colors flex items-center justify-center gap-2.5 font-label font-semibold text-[13.5px] text-white cursor-pointer"
                  style={{ letterSpacing: '0.2em' }}
                >
                  {visitStatus === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>BOOKING...</span>
                    </>
                  ) : (
                    <span>BOOK SESSION</span>
                  )}
                </button>
              </form>

              {/* Booking Confirmation Overlay */}
              {visitStatus === 'booked' && (
                <div className="absolute inset-0 bg-[#121317]/98 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-full bg-[#3d7bff]/15 border border-[#3d7bff] flex items-center justify-center mb-5">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                      <path
                        d="M7 16.5L13 22.5L25 10.5"
                        stroke="#7aa4ff"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="check-draw"
                      />
                    </svg>
                  </div>

                  <h3 className="font-display font-semibold text-[40px] leading-none text-[var(--ink)] m-0">
                    YOU&apos;RE BOOKED
                  </h3>
                  <p className="mt-3 text-[15px] text-[#c3c7cf]">
                    {visitSession} · {visitDate} at {visitTime}
                  </p>
                  <div
                    className="mt-5 px-4 py-1.5 rounded-full border border-[var(--line)] font-label font-semibold text-[13px] text-[var(--blue2)] tabular-nums"
                    style={{ letterSpacing: '0.22em' }}
                  >
                    {bookingCode}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------- */}
      {/* FOOTER                                                              */}
      {/* ------------------------------------------------------------------- */}
      <footer className="ar-reveal pt-16 pb-10 px-[max(20px,3.6vw)] border-t border-[var(--line)] overflow-hidden">
        <div
          className="font-display font-bold text-center select-none whitespace-nowrap leading-[0.84] tracking-[-0.015em]"
          style={{
            fontSize: '17.2vw',
            background:
              'linear-gradient(180deg, #eef0f3 10%, rgba(238,240,243,0.22) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          APERTURE ROW
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--mute)]">
          <span>© 2026 Aperture Row Berlin · Lichtstraße 12</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => scrollToSection('bench')}
              className="hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              The Bench
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('catalog')}
              className="hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('visit')}
              className="hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              Visit
            </button>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------- */}
      {/* DETAIL DRAWER                                                       */}
      {/* ------------------------------------------------------------------- */}
      {/* Scrim */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[70] bg-[rgba(6,7,9,0.62)] transition-opacity duration-500 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={drawerCam ? `${drawerCam.name} details` : 'Camera details'}
        className="fixed top-0 right-0 bottom-0 z-[80] bg-[#101114] border-l border-[var(--line)] flex flex-col overflow-hidden"
        style={{
          width: 'min(560px, 100vw)',
          maxWidth: '100vw',
          transform: drawerOpen ? 'translateX(0%)' : 'translateX(102%)',
          transition: 'transform 0.75s var(--io)',
        }}
      >
        {drawerCam && (
          <>
            {/* Drawer Header */}
            <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-[var(--line)] shrink-0">
              <span
                className="font-label font-semibold text-[12.5px] text-[var(--blue2)] tabular-nums"
                style={{ letterSpacing: '0.22em' }}
              >
                0{CAMERAS.findIndex((c) => c.key === drawerCam.key) + 1} / 0{CAMERAS.length} ·{' '}
                {drawerCam.type}
              </span>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] hover:border-white/30 transition-transform duration-300 hover:rotate-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff]"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8">
              {/* 290px Grooved Turntable Plate with 3D Tilt */}
              <div
                onPointerMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
                  const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
                  setPlateTilt({
                    ry: clamp(nx * 12, -12, 12),
                    rx: clamp(-ny * 10, -10, 10),
                  });
                }}
                onPointerLeave={() => setPlateTilt({ rx: 0, ry: 0 })}
                className="relative h-[290px] my-5 rounded-2xl flex items-center justify-center overflow-hidden border border-[var(--line)]"
                style={{
                  perspective: 900,
                  background:
                    'repeating-radial-gradient(circle at 50% 50%, #14161b 0px, #14161b 4px, #101216 4.5px, #101216 8px)',
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 45%, rgba(61,123,255,0.22) 0%, rgba(16,17,20,0.4) 68%)',
                  }}
                  aria-hidden="true"
                />
                <img
                  ref={drawerPlateImgRef}
                  src={imgUrl(CAMERA_ASSETS[drawerCam.key], 700)}
                  alt={drawerCam.name}
                  referrerPolicy="no-referrer"
                  className="relative z-10 max-h-[230px] max-w-[82%] object-contain pointer-events-none transition-transform duration-150"
                  style={{
                    transform: `rotateX(${plateTilt.rx.toFixed(2)}deg) rotateY(${plateTilt.ry.toFixed(
                      2
                    )}deg) scale(${drawerCam.scale > 1.2 ? 1.1 : 1})`,
                    filter: 'drop-shadow(0 24px 28px rgba(0,0,0,0.75))',
                  }}
                />
              </div>

              {/* Staggered Info Blocks */}
              <div
                className="transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '60ms',
                }}
              >
                <h2 className="font-display font-semibold text-[56px] leading-[0.9] text-[var(--ink)] m-0">
                  {drawerCam.name}
                </h2>
                <p className="mt-3 text-[15px] leading-[1.6] text-[#c3c7cf]">
                  {drawerCam.description}
                </p>
              </div>

              {/* SPECS */}
              <div
                className="mt-7 transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '120ms',
                }}
              >
                <div
                  className="font-label font-semibold text-[11.5px] text-[var(--mute)] mb-2.5"
                  style={{ letterSpacing: '0.22em' }}
                >
                  SPECS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 border-t border-[var(--line)]">
                  {drawerCam.specs.map((sp) => (
                    <div
                      key={sp.label}
                      className="py-2.5 border-b border-[var(--line)] flex items-baseline justify-between gap-3"
                    >
                      <span
                        className="font-label font-medium text-[11.5px] text-[var(--mute)]"
                        style={{ letterSpacing: '0.16em' }}
                      >
                        {sp.label}
                      </span>
                      <span className="text-[13.5px] text-[var(--ink)] text-right tabular-nums">
                        {sp.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONDITION */}
              <div
                className="mt-7 transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '180ms',
                }}
              >
                <div
                  className="font-label font-semibold text-[11.5px] text-[var(--mute)] mb-3"
                  style={{ letterSpacing: '0.22em' }}
                >
                  CONDITION
                </div>
                <div className="flex flex-wrap gap-2">
                  {drawerCam.condition.map((c) => (
                    <span
                      key={c}
                      className="h-8 px-3 rounded-full border border-[var(--line)] bg-[#14161b] inline-flex items-center gap-1.5 text-[12.5px] text-[#d7dbe2]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#3d7bff]" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* KIT */}
              <div
                className="mt-7 transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '240ms',
                }}
              >
                <div
                  className="font-label font-semibold text-[11.5px] text-[var(--mute)] mb-3"
                  style={{ letterSpacing: '0.22em' }}
                >
                  KIT
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDrawerKit('only')}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      drawerKit === 'only'
                        ? 'border-[#3d7bff] bg-[#3d7bff]/10'
                        : 'border-[var(--line)] bg-[#14161b] hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label font-semibold text-[12.5px] text-[var(--ink)] tracking-[0.14em]">
                        CAMERA ONLY
                      </span>
                      <span className="text-[12.5px] text-[var(--mute)] tabular-nums">+0 €</span>
                    </div>
                    <p className="text-[12.5px] text-[var(--mute)] mt-1.5 m-0">
                      Serviced, with cap &amp; strap
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDrawerKit('shooter')}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      drawerKit === 'shooter'
                        ? 'border-[#3d7bff] bg-[#3d7bff]/10'
                        : 'border-[var(--line)] bg-[#14161b] hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-label font-semibold text-[12.5px] text-[var(--ink)] tracking-[0.14em]">
                        SHOOTER KIT
                      </span>
                      <span className="text-[12.5px] text-[var(--blue2)] tabular-nums">
                        +{shooterKitExtra(drawerCam.price)} €
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[var(--mute)] mt-1.5 m-0">
                      + case, 3 rolls, cable
                    </p>
                  </button>
                </div>
              </div>

              {/* Extended Warranty Toggle */}
              <div
                className="mt-5 transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '300ms',
                }}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={drawerWarranty}
                  onClick={() => setDrawerWarranty((w) => !w)}
                  className="w-full p-4 rounded-xl border border-[var(--line)] bg-[#14161b] flex items-center justify-between gap-4 text-left cursor-pointer hover:border-white/25 transition-colors"
                >
                  <div>
                    <div className="text-[13.5px] font-medium text-[var(--ink)]">
                      Extended warranty · 24 months <span className="text-[var(--blue2)] ml-1">+39 €</span>
                    </div>
                    <div className="text-[12.5px] text-[var(--mute)] mt-0.5">
                      Free re-calibration in year two
                    </div>
                  </div>
                  <span
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                      drawerWarranty ? 'bg-[#3d7bff]' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                        drawerWarranty ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {/* SHOT ON THIS CAMERA */}
              <div
                className="mt-7 transition-all duration-500"
                style={{
                  opacity: drawerOpen ? 1 : 0,
                  transform: drawerOpen ? 'translateY(0)' : 'translateY(14px)',
                  transitionDelay: '360ms',
                }}
              >
                <div
                  className="font-label font-semibold text-[11.5px] text-[var(--mute)] mb-3"
                  style={{ letterSpacing: '0.22em' }}
                >
                  SHOT ON THIS CAMERA
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {drawerCam.shots.map((photoKey, idx) => (
                    <button
                      key={`${drawerCam.key}-${photoKey}-${idx}`}
                      type="button"
                      onClick={() =>
                        setLightbox({
                          photoKey,
                          cameraName: drawerCam.name,
                          frameCode: `▸ ${14 + idx}A`,
                        })
                      }
                      className="bg-[#060709] p-1.5 pb-4 border border-white/10 rounded-[4px] transition-transform duration-300 hover:-rotate-2 hover:scale-[1.04] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7bff]"
                      style={{ transitionTimingFunction: 'var(--spring)' }}
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-[#14161b]">
                        <img
                          src={imgUrl(PHOTO_ASSETS[photoKey], 500)}
                          alt={`Sample shot on ${drawerCam.name}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-[var(--line)] bg-[#101114] shrink-0">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full h-13 rounded-full transition-colors duration-300 flex items-center justify-center gap-2.5 font-label font-semibold text-[13.5px] text-white cursor-pointer tabular-nums ${
                  addBtnState === 'added'
                    ? 'bg-[#16a34a]'
                    : 'bg-[#3d7bff] hover:bg-[#528bff]'
                }`}
                style={{ letterSpacing: '0.18em' }}
              >
                {addBtnState === 'added' ? (
                  <>
                    <span>ADDED TO CART</span>
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <span>ADD TO CART · {formatEur(displayedDrawerPrice)}</span>
                )}
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* FILM PRINT LIGHTBOX                                                 */}
      {/* ------------------------------------------------------------------- */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-5 sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo shot on ${lightbox.cameraName}`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[460px] w-full bg-[#07080a] border border-white/15 p-3 pb-5 rounded-md shadow-[0_32px_80px_rgba(0,0,0,0.85)]"
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full border border-white/25 bg-black/60 text-white flex items-center justify-center hover:rotate-90 transition-transform duration-300 cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-[4/5] w-full overflow-hidden bg-[#121317]">
              <img
                src={imgUrl(PHOTO_ASSETS[lightbox.photoKey], 1200)}
                alt={`Shot on ${lightbox.cameraName}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3.5 px-1 flex items-center justify-between">
              <span
                className="font-label font-semibold text-[12.5px] text-[var(--ink)]"
                style={{ letterSpacing: '0.2em' }}
              >
                SHOT ON {lightbox.cameraName}
              </span>
              <span
                className="font-label font-semibold text-[12.5px] text-[#f5a623]"
                style={{ letterSpacing: '0.18em' }}
              >
                {lightbox.frameCode}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* WHITE BOTTOM TOAST                                                  */}
      {/* ------------------------------------------------------------------- */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110] bg-[#eef0f3] text-[#0b0c0e] rounded-full pl-2.5 pr-5 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.55)] flex items-center gap-3 max-w-[92vw]"
        >
          {toast.thumb ? (
            <img
              src={toast.thumb}
              alt=""
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-contain bg-[#0b0c0e]/10 p-0.5 shrink-0"
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#3d7bff] text-white flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="text-[13.5px] font-medium truncate">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
