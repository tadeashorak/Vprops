import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import * as THREE from 'three'
import './App.css'

// Shared rotation ref to avoid re-renders
const modelRotationRef = { current: { x: 0, y: 0 } }

// Custom OBJ Model Component
function CustomModel() {
  const groupRef = useRef()

  // Load the OBJ file
  const obj = useLoader(OBJLoader, '/assets/objects/base.obj')

  // Load textures
  const [diffuseMap, normalMap, roughnessMap, metalnessMap] = useLoader(THREE.TextureLoader, [
    '/assets/objects/texture_diffuse.png',
    '/assets/objects/texture_normal.png',
    '/assets/objects/texture_roughness.png',
    '/assets/objects/texture_metallic.png',
  ])

  // Clone the object and apply materials
  const clonedObj = useMemo(() => {
    const clone = obj.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: diffuseMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          metalnessMap: metalnessMap,
          roughness: 0.5,
          metalness: 0.8,
        })
      }
    })

    // Center the model
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())
    clone.position.sub(center)

    // Scale to fit (larger size)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.2 / maxDim
    clone.scale.setScalar(scale)

    return clone
  }, [obj, diffuseMap, normalMap, roughnessMap, metalnessMap])

  useFrame(() => {
    if (groupRef.current) {
      const targetX = (modelRotationRef.current.x * Math.PI) / 180
      const targetY = (modelRotationRef.current.y * Math.PI) / 180
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.1)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedObj} />
    </group>
  )
}

// Fallback cube while model loads
function FallbackCube() {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime
    }
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color="#C9A227" wireframe />
    </mesh>
  )
}

// Card Fan Component with auto-switching and scroll
const CARD_IMAGES = [1, 2, 3, 4, 5, 6]

const CardFan = React.memo(function CardFan() {
  const [activeCard, setActiveCard] = useState(1)
  const isHoveringRef = useRef(false)
  const scrollAccum = useRef(0)
  const intervalRef = useRef(null)

  // Start/stop auto-switching
  const startAutoSwitch = () => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setActiveCard(prev => prev >= 6 ? 1 : prev + 1)
    }, 4000)
  }

  const stopAutoSwitch = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    startAutoSwitch()
    return stopAutoSwitch
  }, [])

  // Scroll handling
  useEffect(() => {
    const handleWheel = (e) => {
      if (!isHoveringRef.current) return

      e.preventDefault()
      scrollAccum.current += e.deltaY || e.deltaX

      if (scrollAccum.current > 80) {
        setActiveCard(prev => prev >= 6 ? 1 : prev + 1)
        scrollAccum.current = 0
      } else if (scrollAccum.current < -80) {
        setActiveCard(prev => prev <= 1 ? 6 : prev - 1)
        scrollAccum.current = 0
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [])

  const handleMouseEnter = () => {
    isHoveringRef.current = true
    stopAutoSwitch()
  }

  const handleMouseLeave = () => {
    isHoveringRef.current = false
    scrollAccum.current = 0
    startAutoSwitch()
  }

  return (
    <div className="card-fan">
      {CARD_IMAGES.map((num) => (
        <div
          key={num}
          className={`fan-card ${activeCard === num ? 'active' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={`/assets/images/image${num}.png`}
            alt={`Project ${num}`}
            loading="eager"
            decoding="async"
          />
        </div>
      ))}
    </div>
  )
})

const clientLogos = [
  { type: 'image', src: '/assets/images/nike_swoosh-logo_brandlogos.net_t2t54.png', alt: 'Nike' },
  { type: 'text', name: 'NORDIC' },
  { type: 'text', name: 'ARTERIO' },
  { type: 'text', name: 'BLOOM' },
  { type: 'text', name: 'VERTEX' },
  { type: 'text', name: 'KINETIC' },
  { type: 'text', name: 'FORMA' },
  { type: 'text', name: 'APEX' },
]

const portfolioItems = [
  { id: 1, title: 'Aurora Fragrance', category: 'Commercial', year: '2024', videoId: 'V6-0kYhqoRo' },
  { id: 2, title: 'Nordic Motors', category: 'Automotive', year: '2024', videoId: '0--87q5PT_o' },
  { id: 3, title: 'Culinary Stories', category: 'Food & Beverage', year: '2023', videoId: 'jgi2bAP_V4M' },
  { id: 4, title: 'Urban Athletics', category: 'Sports', year: '2023', videoId: 'EOqzNmqFFnY', thumbQuality: 'hqdefault' },
  { id: 5, title: 'Heritage Watches', category: 'Luxury', year: '2023', videoId: 'mi7nxPtDnFE' },
  { id: 6, title: 'Bloom Cosmetics', category: 'Beauty', year: '2024', videoId: '7mz-rLWUBnU' },
]

const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Commercial Production',
    desc: 'End-to-end commercial filming from concept to final cut. We handle pre-production, shooting, and post with meticulous attention to brand vision.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: 'Set Design & Props',
    desc: 'Custom set construction and prop fabrication that brings creative briefs to life. From minimal product stages to elaborate narrative environments.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Creative Direction',
    desc: 'Strategic creative leadership that shapes visual narratives. We translate brand identity into compelling visual stories that resonate.',
  },
]

const processSteps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We begin with understanding your brand, objectives, and vision. Every detail matters in crafting the right approach.',
  },
  {
    num: '02',
    title: 'Concept Development',
    desc: 'Our team develops visual concepts, mood boards, and detailed production plans tailored to your needs.',
  },
  {
    num: '03',
    title: 'Production',
    desc: 'From set construction to final wrap, we execute with precision. Our crew brings decades of combined experience.',
  },
  {
    num: '04',
    title: 'Delivery',
    desc: 'Polished final deliverables across all formats and platforms. Ready for broadcast, digital, or any medium.',
  },
]

function PortfolioItem({ item }) {
  const [isHovered, setIsHovered] = useState(false)
  const iframeRef = useRef(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo' }),
        '*'
      )
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo' }),
        '*'
      )
    }
  }

  return (
    <article
      className="portfolio-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="portfolio-image">
        {item.videoId ? (
          <>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${item.videoId}?enablejsapi=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&loop=1&playlist=${item.videoId}&disablekb=1`}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <img
              src={`https://img.youtube.com/vi/${item.videoId}/${item.thumbQuality || 'maxresdefault'}.jpg`}
              alt={item.title}
              className={`portfolio-thumbnail ${isHovered ? 'hidden' : ''}`}
            />
          </>
        ) : (
          <div className="portfolio-placeholder" />
        )}
      </div>
      <div className="portfolio-overlay">
        <span className="portfolio-category">{item.category}</span>
        <h3 className="portfolio-title">{item.title}</h3>
      </div>
    </article>
  )
}


function App() {
  const [scrolled, setScrolled] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const containerRef = useRef(null)
  const marqueeTimeoutRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    message: ''
  })

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const STICKY_THRESHOLD = 150
    const winHeight = window.innerHeight
    const RELEASE_Y = 56 - (STICKY_THRESHOLD / winHeight * 100)

    const waypoints = [
      { scrollStart: 0,    x: 30, y: RELEASE_Y, rotX: 0,   rotY: 0,   scale: 1 },
      { scrollStart: 0.08, x: 85, y: 35, rotX: 45,  rotY: 90,  scale: 1 },
      { scrollStart: 0.28, x: 15, y: 55, rotX: 90,  rotY: 180, scale: 1 },
      { scrollStart: 0.48, x: 80, y: 65, rotX: 135, rotY: 270, scale: 1 },
      { scrollStart: 0.63, x: 50, y: 50, rotX: 180, rotY: 360, scale: 1 },
      { scrollStart: 0.78, x: 10, y: 85, rotX: 270, rotY: 540, scale: 1 },
      { scrollStart: 1,    x: 50, y: 92, rotX: 360, rotY: 720, scale: 0.3 },
    ]

    let rafId = null
    let current = { x: 30, y: 56, rotX: 0, rotY: 0, scale: 1 }
    let wasInAnimationPhase = false

    const lerp = (start, end, factor) => start + (end - start) * factor

    const getTargetFromScroll = (scrollVH) => {
      let from = waypoints[0], to = waypoints[0]
      const len = waypoints.length

      for (let i = 0; i < len - 1; i++) {
        if (scrollVH >= waypoints[i].scrollStart && scrollVH < waypoints[i + 1].scrollStart) {
          from = waypoints[i]
          to = waypoints[i + 1]
          break
        }
      }

      if (scrollVH >= waypoints[len - 1].scrollStart) {
        return waypoints[len - 1]
      }

      const range = to.scrollStart - from.scrollStart
      if (range <= 0) return from

      const progress = (scrollVH - from.scrollStart) / range
      const t = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

      return {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        rotX: from.rotX + (to.rotX - from.rotX) * t,
        rotY: from.rotY + (to.rotY - from.rotY) * t,
        scale: from.scale + (to.scale - from.scale) * t,
      }
    }

    const animate = () => {
      const scrollY = window.scrollY
      const container = containerRef.current

      if (scrollY < STICKY_THRESHOLD) {
        const targetY = 56 - (scrollY / winHeight * 100)

        if (wasInAnimationPhase) {
          current.x = lerp(current.x, 30, 0.1)
          current.y = lerp(current.y, targetY, 0.1)
          current.rotX = lerp(current.rotX, 0, 0.08)
          current.rotY = lerp(current.rotY, 0, 0.08)
          current.scale = lerp(current.scale, 1, 0.1)

          if (Math.abs(current.x - 30) < 0.05 && Math.abs(current.rotX) < 0.1 && Math.abs(current.rotY) < 0.1) {
            wasInAnimationPhase = false
          }
        } else {
          current.x = 30
          current.y = targetY
          current.rotX = 0
          current.rotY = 0
          current.scale = 1
        }

        if (container) {
          container.style.transform = `translate3d(${current.x}vw, ${current.y}vh, 0) translate(-50%, -50%) scale(${current.scale})`
        }

        modelRotationRef.current.x = current.rotX
        modelRotationRef.current.y = current.rotY

        rafId = requestAnimationFrame(animate)
        return
      }

      wasInAnimationPhase = true

      const maxScroll = document.documentElement.scrollHeight - winHeight
      const adjustedScroll = scrollY - STICKY_THRESHOLD
      const adjustedMax = maxScroll - STICKY_THRESHOLD
      const scrollProgress = adjustedMax > 0 ? adjustedScroll / adjustedMax : 0
      const target = getTargetFromScroll(Math.max(0, Math.min(1, scrollProgress)))

      current.x = lerp(current.x, target.x, 0.06)
      current.y = lerp(current.y, target.y, 0.06)
      current.rotX = lerp(current.rotX, target.rotX, 0.05)
      current.rotY = lerp(current.rotY, target.rotY, 0.05)
      current.scale = lerp(current.scale, target.scale, 0.06)

      if (container) {
        container.style.transform = `translate3d(${current.x}vw, ${current.y}vh, 0) translate(-50%, -50%) scale(${current.scale})`
      }

      modelRotationRef.current.x = current.rotX
      modelRotationRef.current.y = current.rotY

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleMarqueeEnter = () => {
    marqueeTimeoutRef.current = setTimeout(() => {
      setMarqueePaused(true)
    }, 100)
  }

  const handleMarqueeLeave = () => {
    if (marqueeTimeoutRef.current) {
      clearTimeout(marqueeTimeoutRef.current)
    }
    setMarqueePaused(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      {/* Scroll-animated 3D Model */}
      <div className="scroll-cube-container" ref={containerRef}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-3, -3, 2]} intensity={0.4} />
          <Suspense fallback={<FallbackCube />}>
            <CustomModel />
          </Suspense>
        </Canvas>
      </div>

      {/* Navigation */}
      <nav className={`nav${scrolled ? ' nav-scrolled' : ''}`}>
        <div className="container nav-inner">
          <a href="#" className="logo">
            <img src="/assets/images/logo-vprops.png" alt="VPROPS" className="logo-img" />
          </a>
          <ul className="nav-links">
            <li><a href="#work">Work</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#process">Process</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1>
              We craft <span className="serif">visual</span><br />
              stories that sell
            </h1>
            <p className="hero-tagline">
              Commercial film production and bespoke set design for brands
              that demand more than ordinary.
            </p>
            <a href="#contact" className="hero-cta">
              Start a project
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          <div className="hero-visual">
            <CardFan />
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="portfolio" id="work">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-number">01</span>
              <h2 className="section-title">Selected <span className="serif">work</span></h2>
            </div>
          </div>
          <div className="portfolio-grid">
            {portfolioItems.map((item) => (
              <PortfolioItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">150+</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">12</span>
              <span className="stat-label">Years</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">40+</span>
              <span className="stat-label">Brands</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Awards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="services" id="services">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-number">02</span>
              <h2 className="section-title">What we <span className="serif">do</span></h2>
            </div>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-item" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="process" id="process">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-number">03</span>
              <h2 className="section-title">Our <span className="serif">process</span></h2>
            </div>
          </div>
          <div className="process-list">
            {processSteps.map((step, index) => (
              <div className="process-item" key={index}>
                <span className="process-number">{step.num}</span>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="clients">
        <p className="clients-label">Trusted by</p>
        <div className="marquee-wrapper">
          <div
            className={`marquee-track${marqueePaused ? ' marquee-paused' : ''}`}
            onMouseEnter={handleMarqueeEnter}
            onMouseLeave={handleMarqueeLeave}
          >
            {clientLogos.map((logo, i) => (
              <span key={i} className="client-logo">
                {logo.type === 'image' ? (
                  <img src={logo.src} alt={logo.alt} className="client-logo-img" />
                ) : (
                  logo.name
                )}
              </span>
            ))}
            {clientLogos.map((logo, i) => (
              <span key={`dup-${i}`} className="client-logo">
                {logo.type === 'image' ? (
                  <img src={logo.src} alt={logo.alt} className="client-logo-img" />
                ) : (
                  logo.name
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="contact" id="contact">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2 className="contact-heading">
              Let's create<br />
              something <span className="serif">remarkable</span>
            </h2>
            <p className="contact-text">
              Ready to bring your vision to life? We'd love to hear about
              your project. Reach out and let's start the conversation.
            </p>
            <a href="mailto:hello@vprops.studio" className="contact-email">
              hello@vprops.studio
            </a>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="project">Project Type</label>
              <input
                type="text"
                id="project"
                name="project"
                className="form-input"
                placeholder="Commercial, Set Design, etc."
                value={formData.project}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                className="form-input"
                placeholder="Tell us about your project..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="form-submit">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-inner">
          <p className="footer-copy">© 2024 VPROPS. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Instagram</a>
            <a href="#">Vimeo</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
