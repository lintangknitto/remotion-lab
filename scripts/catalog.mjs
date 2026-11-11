/**
 * Single source of truth for families, genres and their asset slots.
 *
 *   node scripts/gen-packs.mjs     -> writes src/packs/** + registry
 *
 * Nothing here points at a file path: every entry is an asset *id* that must
 * exist in src/library/index.generated.json. That is what keeps one file on
 * disk able to serve many genres.
 *
 * Slot keys are a controlled vocabulary:
 *   music, ambience, impact, whoosh, transition, ui, glitch,
 *   texture, overlay, background, image, caption, font, clip, lottie
 */

const v916 = {aspect: '9:16', fps: 30, cutFrames: [4, 10], duration: [15, 30]};
const v916slow = {aspect: '9:16', fps: 30, cutFrames: [12, 40], duration: [20, 45]};
const wide = {aspect: '16:9', fps: 30, cutFrames: [20, 60], duration: [30, 90]};
const wideSlow = {aspect: '16:9', fps: 30, cutFrames: [60, 180], duration: [60, 150]};
const square = {aspect: '1:1', fps: 30, cutFrames: [10, 30], duration: [15, 30]};

export const FAMILIES = {
  'beat-edit': {
    label: 'Beat Edit',
    required: ['music', 'impact', 'texture'],
    shared: {
      impact: ['sfx.impact.heavy-01', 'sfx.impact.heavy-02'],
      whoosh: ['sfx.whoosh.fast-01', 'sfx.whoosh.slow-01'],
      texture: ['texture.noise.film-4k'],
      overlay: ['texture.vignette.soft-01'],
    },
    genres: {
      'jedag-jedug': {
        label: 'Jedag Jedug',
        defaults: v916,
        slots: {
          music: ['music.remix.punchy-01'],
          glitch: ['sfx.glitch.digital-01', 'sfx.glitch.digital-02'],
          transition: ['sfx.tape.stop-01', 'sfx.drop.sub-01'],
          texture: ['texture.vhs.scanline-01', 'texture.vhs.tracking-01'],
          overlay: ['image.flare.anamorphic-01'],
          ui: ['sfx.click.ui-01'],
        },
      },
      'black-flash': {
        label: 'Black Flash',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [6, 12], duration: [8, 15]},
        slots: {
          music: ['music.remix.punchy-01'],
          impact: ['sfx.impact.heavy-02', 'sfx.impact.metal-01'],
          overlay: ['texture.vignette.soft-01'],
        },
      },
      'velocity-edit': {
        label: 'Velocity Edit',
        defaults: v916slow,
        slots: {music: ['music.bed.uplift-01'], whoosh: ['sfx.whoosh.fast-01']},
        missing: ['clip footage 1080p60 (speed ramp butuh fps tinggi)'],
      },
      'loop-video': {
        label: 'Loop Video',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [0, 0], duration: [3, 8]},
        slots: {music: ['music.bed.lofi-01'], whoosh: ['sfx.swoosh.card-01']},
        missing: ['clip pendek yang seamless'],
      },
      'tribute-edit': {
        label: 'Tribute Edit',
        defaults: v916slow,
        slots: {
          music: ['music.bed.emotional-01'],
          texture: ['texture.noise.film-4k'],
          overlay: ['texture.vignette.soft-01'],
        },
        missing: ['foto/klip subjek'],
      },
    },
  },

  'vfx-edit': {
    label: 'VFX Edit',
    required: ['glitch', 'overlay'],
    shared: {
      glitch: ['sfx.glitch.digital-01'],
      overlay: ['texture.bokeh.soft-01', 'image.flare.anamorphic-01'],
      texture: ['texture.noise.digital-01'],
      whoosh: ['sfx.whoosh.fast-01'],
    },
    genres: {
      'fx-edit': {
        label: 'FX Edit',
        defaults: v916,
        slots: {
          glitch: ['sfx.glitch.digital-01', 'sfx.glitch.digital-02'],
          transition: ['sfx.tape.stop-01'],
        },
        missing: ['effect preset per klip (mask/clone) — butuh komponen baru'],
      },
      'transition-edit': {
        label: 'Transition Edit',
        defaults: v916,
        slots: {
          whoosh: ['sfx.whoosh.fast-01', 'sfx.swoosh.card-01'],
          overlay: ['image.lightleak.warm-01'],
        },
      },
      'clone-morph': {
        label: 'Clone / Morph',
        defaults: v916slow,
        slots: {whoosh: ['sfx.whoosh.slow-01'], texture: ['texture.dust.scratches-01']},
        missing: ['footage dua subjek identik'],
      },
    },
  },

  amv: {
    label: 'AMV / Anime Edit',
    required: ['music', 'clip', 'overlay'],
    shared: {
      overlay: ['image.flare.anamorphic-01', 'texture.bokeh.soft-01'],
      texture: ['texture.noise.film-4k'],
      whoosh: ['sfx.whoosh.fast-01', 'sfx.whoosh.slow-01'],
      impact: ['sfx.impact.metal-01'],
    },
    genres: {
      amv: {
        label: 'AMV',
        defaults: wide,
        slots: {music: ['music.bed.uplift-01'], clip: []},
        missing: ['klip anime (lisensi paling berisiko — catat sumber per file)'],
      },
      'anime-edit': {
        label: 'Anime Edit',
        defaults: v916,
        slots: {music: ['music.bed.emotional-01'], clip: []},
        missing: ['klip anime vertikal'],
      },
      'manga-edit': {
        label: 'Manga Edit',
        defaults: v916,
        slots: {music: ['music.bed.tension-01'], texture: ['texture.halftone.dots-01'], clip: []},
        missing: ['panel manga / scan'],
      },
    },
  },

  clipping: {
    label: 'Clipping',
    required: ['caption', 'ui'],
    shared: {
      ui: ['sfx.click.ui-02'],
      whoosh: ['sfx.swoosh.card-01'],
      caption: ['image.caption.pill-01', 'image.caption.box-01', 'image.caption.underline-01'],
      vo: ['vo.podcast.demo-01'],
    },
    genres: {
      'podcast-clip': {
        label: 'Podcast Clip',
        defaults: v916,
        slots: {music: ['music.bed.lofi-01'], ambience: ['sfx.static.hiss-01']},
        missing: ['video panjang + transkrip (whisper)', 'caption pack (karaoke)'],
      },
      'stream-clip': {
        label: 'Stream Clip',
        defaults: v916,
        slots: {music: ['music.remix.punchy-01'], glitch: ['sfx.glitch.digital-01']},
        missing: ['VOD stream', 'overlay chat / alert'],
      },
      'youtube-clip': {
        label: 'YouTube Clip',
        defaults: v916,
        slots: {music: ['music.bed.corporate-01']},
        missing: ['video panjang', 'caption pack'],
      },
      'movie-recap': {
        label: 'Movie Recap',
        defaults: v916,
        slots: {
          music: ['music.bed.tension-01'],
          impact: ['sfx.boom.cinematic-01'],
          texture: ['texture.noise.film-4k'],
        },
        missing: ['klip film', 'spoiler warning card'],
      },
      'drama-recap': {
        label: 'Drama / Series Recap',
        defaults: v916,
        slots: {music: ['music.bed.tension-01'], impact: ['sfx.impact.heavy-01']},
        missing: ['klip drama', 'episode marker'],
      },
      'sermon-clip': {
        label: 'Sermon / Kajian Clip',
        defaults: v916slow,
        slots: {music: ['music.bed.emotional-01'], overlay: ['image.gradient.dark-01']},
        missing: ['frame ayat / teks arab'],
      },
      'webinar-clip': {
        label: 'Webinar Clip',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [20, 45], duration: [30, 90]},
        slots: {music: ['music.bed.corporate-01']},
        missing: ['rekaman webinar'],
      },
    },
  },

  'talking-head': {
    label: 'Talking Head / UGC',
    required: ['caption'],
    shared: {
      ui: ['sfx.click.ui-01'],
      whoosh: ['sfx.swoosh.card-01'],
      caption: ['image.caption.pill-01', 'image.caption.bubble-01', 'image.caption.stroke-01', 'image.caption.arrow-01'],
    },
    genres: {
      'talking-head': {
        label: 'Talking Head',
        defaults: v916,
        slots: {music: ['music.bed.corporate-01'], overlay: ['texture.vignette.soft-01']},
        missing: ['footage talent', 'caption pack'],
      },
      ugc: {
        label: 'UGC',
        defaults: v916,
        slots: {music: ['music.bed.uplift-01']},
        missing: ['footage creator', 'caption pack'],
      },
      storytime: {
        label: 'Storytime',
        defaults: v916slow,
        slots: {
          music: ['music.bed.tension-01'],
          impact: ['sfx.impact.soft-01'],
          ui: ['sfx.typewriter.loop-01'],
        },
        missing: ['VO + b-roll'],
      },
      'pov-skit': {
        label: 'POV / Skit',
        defaults: v916,
        slots: {ui: ['sfx.click.ui-02'], glitch: ['sfx.glitch.digital-02']},
        missing: ['footage akting'],
      },
      'greenscreen-explainer': {
        label: 'Green Screen Explainer',
        defaults: v916,
        slots: {ui: ['sfx.click.ui-01'], image: ['image.paper.card-01']},
        missing: ['greenscreen footage', 'screenshot'],
      },
      'reaction-stitch': {
        label: 'Reaction / Stitch',
        defaults: v916,
        slots: {impact: ['sfx.impact.soft-01'], ui: ['sfx.pop.notify-01']},
        missing: ['video reaktan'],
      },
    },
  },

  meme: {
    label: 'Meme',
    required: ['ui'],
    shared: {
      ui: ['sfx.pop.notify-01', 'sfx.click.ui-01'],
      glitch: ['sfx.glitch.digital-02'],
      impact: ['sfx.impact.soft-01'],
      whoosh: ['sfx.whoosh.fast-01'],
    },
    genres: {
      'meme-shitpost': {
        label: 'Meme / Shitpost',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [2, 8], duration: [5, 20]},
        slots: {impact: ['sfx.impact.metal-01'], music: ['music.remix.punchy-01']},
        missing: ['meme image / greenscreen'],
      },
      'soundboard-edit': {
        label: 'Soundboard Edit',
        defaults: v916,
        slots: {ui: ['sfx.coin.reward-01', 'sfx.swipe.ui-01', 'sfx.pop.notify-01']},
        missing: ['soundboard pack'],
      },
    },
  },

  'motion-graphic': {
    label: 'Motion Graphic',
    required: ['music', 'ui'],
    shared: {
      whoosh: ['sfx.swoosh.card-01'],
      ui: ['sfx.click.ui-01'],
      background: ['image.gradient.dark-01'],
      texture: ['texture.grid.blueprint-01'],
      impact: ['sfx.impact.soft-01'],
      overlay: ['image.flare.anamorphic-01'],
    },
    genres: {
      explainer: {
        label: 'Explainer',
        defaults: wide,
        slots: {music: ['music.bed.corporate-01'], background: ['image.gradient.mesh-01']},
        missing: ['ikon set', 'VO'],
      },
      'kinetic-typography': {
        label: 'Kinetic Typography',
        defaults: square,
        slots: {
          music: ['music.remix.punchy-01'],
          impact: ['sfx.impact.heavy-01'],
          texture: ['texture.halftone.dots-01'],
        },
        missing: ['font display', 'lirik/teks'],
      },
      'lyric-video': {
        label: 'Lyric Video',
        defaults: wide,
        slots: {music: ['music.bed.emotional-01'], overlay: ['image.lightleak.cool-01']},
        missing: ['lirik + timing'],
      },
      'data-viz': {
        label: 'Data Viz',
        defaults: wide,
        slots: {music: ['music.bed.corporate-01'], texture: ['texture.grid.blueprint-01']},
        missing: ['dataset', 'chart component'],
      },
      tutorial: {
        label: 'Tutorial',
        defaults: v916,
        slots: {music: ['music.bed.lofi-01'], ui: ['sfx.click.ui-02']},
        missing: ['screen recording'],
      },
      infographic: {
        label: 'Infographic',
        defaults: square,
        slots: {music: ['music.bed.uplift-01']},
        missing: ['ikon set', 'dataset'],
      },
      'wedding-invitation': {
        label: 'Wedding Invitation',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [40, 90], duration: [30, 60]},
        slots: {
          music: ['music.bed.emotional-01'],
          texture: ['texture.paper.fiber-01'],
          image: ['image.paper.card-01', 'image.confetti.burst-01'],
        },
        missing: ['font script', 'ornamen floral', 'foto pasangan'],
      },
    },
  },

  corporate: {
    label: 'Corporate',
    required: ['music'],
    shared: {
      whoosh: ['sfx.swoosh.card-01'],
      overlay: ['texture.vignette.soft-01'],
      background: ['image.gradient.dark-01'],
      ui: ['sfx.click.ui-01'],
      impact: ['sfx.impact.soft-01'],
      texture: ['texture.noise.film-4k'],
    },
    genres: {
      'company-profile': {
        label: 'Company Profile',
        defaults: wideSlow,
        slots: {music: ['music.bed.corporate-01'], image: ['image.gradient.mesh-01']},
        missing: ['logo board', 'lower third', 'footage kantor'],
      },
      testimonial: {
        label: 'Testimonial',
        defaults: wide,
        slots: {music: ['music.bed.emotional-01']},
        missing: ['footage interview', 'subtitle pack'],
      },
      recruitment: {
        label: 'Recruitment',
        defaults: wide,
        slots: {music: ['music.bed.uplift-01']},
        missing: ['footage tim'],
      },
      'event-recap': {
        label: 'Event Recap',
        defaults: wide,
        slots: {music: ['music.bed.uplift-01'], impact: ['sfx.impact.soft-01']},
        missing: ['footage acara'],
      },
      'internal-comms': {
        label: 'Internal Comms',
        defaults: wide,
        slots: {music: ['music.bed.corporate-01'], ui: ['sfx.click.ui-01']},
        missing: ['slide / deck'],
      },
    },
  },

  ads: {
    label: 'Ads',
    required: ['music', 'impact'],
    shared: {
      whoosh: ['sfx.swoosh.card-01'],
      impact: ['sfx.impact.heavy-01'],
      overlay: ['image.flare.anamorphic-01'],
      ui: ['sfx.click.ui-02'],
      texture: ['texture.noise.film-4k'],
    },
    genres: {
      iklan: {
        label: 'Iklan',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [10, 24], duration: [6, 30]},
        slots: {
          music: ['music.bed.uplift-01'],
          image: ['image.gradient.mesh-03'],
          ui: ['sfx.coin.reward-01'],
        },
        missing: ['product footage', 'endcard', 'disclaimer'],
      },
      'ugc-ad': {
        label: 'UGC Ad',
        defaults: v916,
        slots: {music: ['music.bed.lofi-01'], impact: ['sfx.impact.soft-01']},
        missing: ['footage creator'],
      },
      'product-demo': {
        label: 'Product Demo',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [15, 30], duration: [15, 45]},
        slots: {music: ['music.bed.corporate-01'], ui: ['sfx.click.ui-02']},
        missing: ['footage produk'],
      },
      'before-after': {
        label: 'Before / After',
        defaults: v916,
        slots: {
          music: ['music.bed.uplift-01'],
          impact: ['sfx.impact.soft-01'],
          whoosh: ['sfx.whoosh.fast-01'],
        },
        missing: ['dua footage/foto'],
      },
      'sizzle-reel': {
        label: 'Sizzle Reel',
        defaults: wide,
        slots: {
          music: ['music.remix.punchy-01'],
          impact: ['sfx.boom.cinematic-01'],
          texture: ['texture.noise.film-4k'],
        },
        missing: ['footage montase'],
      },
      'live-shop-recap': {
        label: 'Live Shop Recap',
        defaults: v916,
        slots: {music: ['music.remix.punchy-01'], ui: ['sfx.coin.reward-01']},
        missing: ['rekaman live', 'harga/produk card'],
      },
    },
  },

  cinematic: {
    label: 'Cinematic',
    required: ['music', 'texture'],
    shared: {
      texture: ['texture.noise.film-4k', 'texture.vignette.soft-01'],
      whoosh: ['sfx.whoosh.slow-01'],
      impact: ['sfx.boom.cinematic-01'],
      transition: ['sfx.riser.tension-01'],
    },
    genres: {
      'cinematic-travel': {
        label: 'Cinematic Travel',
        defaults: wideSlow,
        slots: {music: ['music.bed.emotional-01'], image: ['image.lightleak.warm-01']},
        missing: ['footage perjalanan', 'LUT'],
      },
      'mini-doc': {
        label: 'Mini Doc',
        defaults: {aspect: '16:9', fps: 24, cutFrames: [80, 240], duration: [180, 600]},
        slots: {music: ['music.bed.tension-01'], ambience: ['sfx.static.hiss-01']},
        missing: ['footage interview + b-roll'],
      },
      'music-video': {
        label: 'Music Video',
        defaults: {aspect: '16:9', fps: 24, cutFrames: [12, 48], duration: [120, 240]},
        slots: {music: ['music.remix.punchy-01'], impact: ['sfx.impact.heavy-02']},
        missing: ['lagu + footage'],
      },
      'wedding-highlight': {
        label: 'Wedding Highlight',
        defaults: {aspect: '16:9', fps: 24, cutFrames: [60, 180], duration: [180, 360]},
        slots: {music: ['music.bed.emotional-01'], image: ['image.bokeh.party-01']},
        missing: ['footage acara panjang'],
      },
      'aerial-drone': {
        label: 'Aerial / Drone',
        defaults: wideSlow,
        slots: {music: ['music.bed.uplift-01'], image: ['image.gradient.mesh-02']},
        missing: ['footage drone'],
      },
    },
  },

  slideshow: {
    label: 'Slideshow',
    required: ['music', 'image'],
    shared: {
      whoosh: ['sfx.swoosh.card-01'],
      texture: ['texture.paper.fiber-01'],
      overlay: ['texture.vignette.soft-01'],
      ui: ['sfx.click.ui-01'],
      impact: ['sfx.impact.soft-01'],
    },
    genres: {
      photodump: {
        label: 'Photodump',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [10, 20], duration: [10, 20]},
        slots: {
          music: ['music.bed.lofi-01'],
          image: ['image.bokeh.party-01'],
          transition: ['sfx.camera.shutter-01'],
        },
        missing: ['foto'],
      },
      slideshow: {
        label: 'Slideshow',
        defaults: square,
        slots: {music: ['music.bed.corporate-01'], image: ['image.paper.card-01']},
        missing: ['foto'],
      },
      'birthday-video': {
        label: 'Birthday Video',
        defaults: {aspect: '1:1', fps: 30, cutFrames: [20, 45], duration: [20, 40]},
        slots: {music: ['music.bed.uplift-01'], image: ['image.confetti.burst-01']},
        missing: ['foto + ucapan'],
      },
      'memorial-tribute': {
        label: 'Memorial Tribute',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [60, 120], duration: [60, 180]},
        slots: {
          music: ['music.bed.emotional-01'],
          texture: ['texture.paper.fiber-01'],
          image: ['image.paper.card-01'],
          ambience: ['sfx.heartbeat-01'],
        },
        missing: ['foto arsip'],
      },
    },
  },

  gaming: {
    label: 'Gaming',
    required: ['impact', 'glitch'],
    shared: {
      impact: ['sfx.impact.metal-01', 'sfx.impact.heavy-01'],
      glitch: ['sfx.glitch.digital-01'],
      whoosh: ['sfx.whoosh.fast-01'],
      ui: ['sfx.click.ui-01'],
      texture: ['texture.noise.film-4k'],
    },
    genres: {
      'gaming-montage': {
        label: 'Gaming Montage',
        defaults: v916,
        slots: {music: ['music.remix.punchy-01'], ui: ['sfx.coin.reward-01']},
        missing: ['gameplay footage', 'HUD overlay', 'kill feed'],
      },
      fragmovie: {
        label: 'Fragmovie',
        defaults: wide,
        slots: {music: ['music.bed.tension-01'], impact: ['sfx.boom.cinematic-01']},
        missing: ['demo/replay', 'hitmarker SFX'],
      },
      'esports-recap': {
        label: 'Esports Recap',
        defaults: wide,
        slots: {music: ['music.bed.uplift-01']},
        missing: ['footage match', 'bracket/team logo'],
      },
    },
  },

  sports: {
    label: 'Sports',
    required: ['impact', 'music'],
    shared: {
      impact: ['sfx.impact.soft-01'],
      whoosh: ['sfx.whoosh.fast-01'],
      ui: ['sfx.click.ui-01'],
      overlay: ['image.lightleak.warm-01'],
      texture: ['texture.noise.film-4k'],
    },
    genres: {
      'sports-highlight': {
        label: 'Sports Highlight',
        defaults: wide,
        slots: {music: ['music.bed.uplift-01']},
        missing: ['footage match', 'scoreboard'],
      },
      'match-recap': {
        label: 'Match Recap',
        defaults: wide,
        slots: {music: ['music.bed.tension-01'], image: ['image.gradient.dark-01']},
        missing: ['footage match', 'stat card'],
      },
      'fitness-progress': {
        label: 'Fitness Progress',
        defaults: v916,
        slots: {music: ['music.remix.punchy-01'], ui: ['sfx.click.ui-01']},
        missing: ['footage latihan', 'timer component'],
      },
    },
  },

  food: {
    label: 'Food',
    required: ['music', 'ambience'],
    shared: {
      ambience: ['sfx.static.hiss-01'],
      ui: ['sfx.click.ui-01'],
      whoosh: ['sfx.swoosh.card-01'],
      overlay: ['image.lightleak.warm-01'],
      impact: ['sfx.impact.soft-01'],
    },
    genres: {
      'food-recipe': {
        label: 'Food Recipe',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [20, 45], duration: [30, 90]},
        slots: {music: ['music.bed.lofi-01']},
        missing: ['footage masak + makro'],
      },
      'food-promo': {
        label: 'Food Promo',
        defaults: v916,
        slots: {music: ['music.bed.uplift-01'], impact: ['sfx.impact.soft-01']},
        missing: ['footage produk'],
      },
      'satisfying-asmr': {
        label: 'Satisfying / ASMR',
        defaults: v916slow,
        slots: {music: ['music.bed.lofi-01']},
        missing: ['footage makro'],
      },
    },
  },

  'fashion-beauty': {
    label: 'Fashion & Beauty',
    required: ['music', 'whoosh'],
    shared: {
      whoosh: ['sfx.whoosh.fast-01'],
      texture: ['texture.vhs.scanline-01'],
      ui: ['sfx.click.ui-01'],
      impact: ['sfx.impact.soft-01'],
      overlay: ['image.flare.anamorphic-01'],
    },
    genres: {
      lookbook: {
        label: 'Lookbook',
        defaults: v916,
        slots: {music: ['music.remix.punchy-01'], glitch: ['sfx.glitch.digital-02']},
        missing: ['footage model'],
      },
      grwm: {
        label: 'GRWM',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [20, 50], duration: [30, 60]},
        slots: {music: ['music.bed.uplift-01']},
        missing: ['footage'],
      },
      'beauty-transition': {
        label: 'Beauty Transition',
        defaults: v916,
        slots: {music: ['music.bed.lofi-01'], whoosh: ['sfx.swoosh.card-01']},
        missing: ['dua footage before/after'],
      },
    },
  },

  'ai-generated': {
    label: 'AI Generated',
    required: ['music', 'clip'],
    shared: {
      texture: ['texture.noise.film-4k'],
      whoosh: ['sfx.swoosh.card-01'],
    },
    genres: {
      'faceless-voiceover': {
        label: 'Faceless Voiceover',
        defaults: v916slow,
        slots: {music: ['music.bed.lofi-01'], background: ['image.gradient.mesh-02']},
        missing: ['klip AI (Veo/Sora)', 'VO'],
      },
      'ai-avatar': {
        label: 'AI Avatar',
        defaults: v916,
        slots: {music: ['music.bed.corporate-01']},
        missing: ['avatar footage', 'script'],
      },
      'ai-broll': {
        label: 'AI B-Roll',
        defaults: wide,
        slots: {music: ['music.bed.tension-01'], background: ['image.gradient.mesh-01']},
        missing: ['klip AI'],
      },
    },
  },

  greeting: {
    label: 'Greeting & Seasonal',
    required: ['music', 'image'],
    shared: {
      whoosh: ['sfx.swoosh.card-01'],
      image: ['image.confetti.burst-01'],
      overlay: ['texture.vignette.soft-01'],
      texture: ['texture.paper.fiber-01'],
      ui: ['sfx.click.ui-01'],
    },
    genres: {
      lebaran: {
        label: 'Lebaran',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [40, 90], duration: [15, 30]},
        slots: {music: ['music.bed.emotional-01'], image: ['image.gradient.mesh-03']},
        missing: ['ornamen ketupat/masjid', 'font arab'],
      },
      'natal-tahun-baru': {
        label: 'Natal & Tahun Baru',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [40, 90], duration: [15, 30]},
        slots: {music: ['music.bed.uplift-01'], image: ['image.bokeh.party-01']},
        missing: ['ornamen salju/pohon'],
      },
      wisuda: {
        label: 'Wisuda',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [30, 60], duration: [20, 40]},
        slots: {music: ['music.bed.uplift-01']},
        missing: ['foto wisudawan'],
      },
      anniversary: {
        label: 'Anniversary',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [40, 90], duration: [30, 60]},
        slots: {music: ['music.bed.emotional-01']},
        missing: ['foto arsip'],
      },
      'hari-raya-lain': {
        label: 'Hari Raya Lain',
        defaults: {aspect: '9:16', fps: 30, cutFrames: [40, 90], duration: [15, 30]},
        slots: {music: ['music.bed.corporate-01']},
        missing: ['ornamen musiman'],
      },
    },
  },

  // Gaya visual family ini: src/styles/profiles/qa.ts, UI kit: src/components/qa/.
  // Footage dibuat sendiri: npm run record -> anotasi: npm run annotate (skill record-web, qa-annotate).
  qa: {
    label: 'QA',
    required: ['ui'],
    shared: {
      ui: ['sfx.click.ui-01', 'sfx.pop.notify-01'],
      whoosh: ['sfx.swipe.ui-01'],
      impact: ['sfx.impact.soft-01'],
      texture: ['texture.grid.blueprint-01'],
      overlay: ['texture.vignette.soft-01'],
    },
    genres: {
      'bug-report': {
        label: 'Bug Report',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [30, 120], duration: [10, 60]},
        slots: {ui: ['sfx.click.ui-02']},
        missing: ['rekaman halaman (npm run record)'],
      },
      'fix-verification': {
        label: 'Fix Verification (before/after)',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [30, 120], duration: [10, 45]},
        slots: {whoosh: ['sfx.swoosh.card-01']},
        missing: ['rekaman sebelum dan sesudah perbaikan'],
      },
      'uat-walkthrough': {
        label: 'UAT Walkthrough',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [60, 180], duration: [30, 180]},
        slots: {music: ['music.bed.corporate-01']},
        missing: ['rekaman alur fitur'],
      },
      'test-run-recap': {
        label: 'Test Run Recap',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [45, 120], duration: [10, 45]},
        slots: {ui: ['sfx.coin.reward-01']},
        missing: ['hasil uji (JSON) untuk TestMatrix'],
      },
      'design-review': {
        label: 'Design Review',
        defaults: {aspect: '16:9', fps: 30, cutFrames: [60, 180], duration: [20, 120]},
        slots: {},
        missing: ['screenshot desain dan implementasi', 'komponen redline lengkap (jarak, ukuran font)'],
      },
    },
  },
};

export const SLOT_KEYS = [
  'music', 'ambience', 'impact', 'whoosh', 'transition', 'ui', 'glitch', 'vo',
  'texture', 'overlay', 'background', 'image', 'caption', 'font', 'clip', 'lottie',
];
