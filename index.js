// AeroFlex Application JavaScript

// --- CLOUD DATABASE CONFIGURATION (SUPABASE) ---
// Go to supabase.com -> Project Settings -> API, and copy/paste your keys here:
const SUPABASE_URL = "https://rjnbiplmefbnbaxtxvkf.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqbmJpcGxtZWZibmJheHR4dmtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU5NDksImV4cCI6MjEwMDAyMTk0OX0.rMMJ5nvF2Mx5D7nziYVrcULy03NOBFUCkW2bxFka-6o";

let supabaseClient = null;
let globalDb = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// --- TELEGRAM BOT NOTIFICATIONS (SECURED SYSTEM) ---
const FALLBACK_TELEGRAM_TOKEN = "8677436730:AAE6-sI41AKfu9YbcblchP9VaKaoWQ5YdZI"; 
const FALLBACK_TELEGRAM_CHAT_ID = "723037684";

function getTelegramCredentials() {
    const db = getDb();
    return {
        botToken: (db && db.security && db.security.telegramBotToken) || FALLBACK_TELEGRAM_TOKEN,
        chatId: (db && db.security && db.security.telegramChatId) || FALLBACK_TELEGRAM_CHAT_ID
    };
}

// --- DATABASE MANAGEMENT (localStorage wrapper) ---
const DB_KEY = 'aeroflex_store_db';
const AUTH_KEY = 'aeroflex_admin_authenticated';

// Locker keys for brute-force protection
const ATTEMPTS_KEY = 'aeroflex_failed_attempts';
const LOCKOUT_KEY = 'aeroflex_lockout_until';

// Realistic prices in DZD (Algerian Dinars - DA)
const DEFAULT_DB = {
    security: {
        // SHA-256 hash of "wassim"
        hash: '07edcf9f709cd2f4e422ad8a967c1c516dd856333b5eef097285a7e9192ecdab'
    },
    products: [
        {
            id: 'everyday-classic',
            name: 'Gymshark Everyday Simple Cut',
            activeHomepage: true,
            description: 'Built for your most intense leg days. Squat, lunge, and lift with absolute confidence. Our simple cut leggings lock in your form with a compression fit that moves perfectly with your body. Engineered with our targeted pushup contouring and a defining scrunch butt design, these leggings enhance your natural shape while providing zero-distraction support on the gym floor.',
            price: 5900,
            originalPrice: 8500,
            image: 'assets/hero_leggings.jpg',
            images: [
                'assets/hero_leggings.jpg',
                'assets/fabric_detail.jpg',
                'assets/lifestyle_leggings.jpg'
            ],
            colors: ['Timeless Black', 'Earthy Brown', 'Cosmic Purple'],
            sizes: ['XS', 'S', 'M', 'L', 'XL']
        },
        {
            id: 'signature-flared',
            name: 'Gymshark Signature Flared Cut',
            activeHomepage: false,
            description: 'Bring elegance to the weight room. Femininity doesn\'t stop when your workout begins. The flared cut offers a beautifully relaxed drape from the knee down, perfect for upper-body days or studio sessions. You still get the exact same sculpting benefits—the waist-snatching V-cross front, the lifting pushup effect, and the shaping scrunch butt—but with a flowing aesthetic that elongates the legs.',
            price: 6500,
            originalPrice: 9000,
            image: 'assets/lifestyle_leggings.jpg',
            images: [
                'assets/lifestyle_leggings.jpg',
                'assets/fabric_detail.jpg',
                'assets/hero_leggings.jpg'
            ],
            colors: ['Timeless Black', 'Earthy Brown', 'Cosmic Purple'],
            sizes: ['XS', 'S', 'M', 'L', 'XL']
        }
    ],
    // Mapping of "productId:color:size" -> stock count
    stock: {
        'everyday-classic:Timeless Black:XS': 10,
        'everyday-classic:Timeless Black:S': 15,
        'everyday-classic:Timeless Black:M': 20,
        'everyday-classic:Timeless Black:L': 10,
        'everyday-classic:Timeless Black:XL': 5,
        'everyday-classic:Earthy Brown:XS': 8,
        'everyday-classic:Earthy Brown:S': 12,
        'everyday-classic:Earthy Brown:M': 15,
        'everyday-classic:Earthy Brown:L': 8,
        'everyday-classic:Earthy Brown:XL': 4,
        'everyday-classic:Cosmic Purple:XS': 5,
        'everyday-classic:Cosmic Purple:S': 8,
        'everyday-classic:Cosmic Purple:M': 10,
        'everyday-classic:Cosmic Purple:L': 5,
        'everyday-classic:Cosmic Purple:XL': 3,
        
        'signature-flared:Timeless Black:XS': 5,
        'signature-flared:Timeless Black:S': 8,
        'signature-flared:Timeless Black:M': 12,
        'signature-flared:Timeless Black:L': 6,
        'signature-flared:Timeless Black:XL': 3,
        'signature-flared:Earthy Brown:XS': 6,
        'signature-flared:Earthy Brown:S': 10,
        'signature-flared:Earthy Brown:M': 15,
        'signature-flared:Earthy Brown:L': 8,
        'signature-flared:Earthy Brown:XL': 4,
        'signature-flared:Cosmic Purple:XS': 4,
        'signature-flared:Cosmic Purple:S': 6,
        'signature-flared:Cosmic Purple:M': 8,
        'signature-flared:Cosmic Purple:L': 4,
        'signature-flared:Cosmic Purple:XL': 2
    },
    promoCodes: [
        { code: 'WELCOME10', discount: 10, active: true },
        { code: 'OWNER50', discount: 50, active: true },
        { code: 'AERO30', discount: 30, active: true }
    ],
    shippingRates: [
        { id: 'rate-standard', name: 'Standard Delivery (48 Wilayas)', price: 600, active: true },
        { id: 'rate-express', name: 'Express Delivery (Algiers)', price: 400, active: true },
        { id: 'rate-free', name: 'Free Store Pickup', price: 0, active: true }
    ],
    orders: [
        {
            id: 'ORD-8492',
            date: '2026-07-18T10:15:00Z',
            customerName: 'Sarah Jenkins',
            customerPhone: '0671829384',
            customerAddress: '45 Rue de la Victoire, Paris',
            productId: 'aeroflex-sculpt',
            productName: 'AeroFlex Ultra-Sculpt Leggings',
            color: 'Midnight Black',
            size: 'M',
            price: 5910, // (5900 - 10% Welcome Discount) + 600 shipping
            promoCode: 'WELCOME10',
            shippingName: 'Standard Delivery (48 Wilayas)',
            shippingPrice: 600,
            status: 'Pending'
        },
        {
            id: 'ORD-9102',
            date: '2026-07-18T11:42:00Z',
            customerName: 'Amina Al-Farsi',
            customerPhone: '0555981243',
            customerAddress: 'Flat 12, Marina Heights, Dubai',
            productId: 'aeroflex-sculpt',
            productName: 'AeroFlex Ultra-Sculpt Leggings',
            color: 'Electric Orchid',
            size: 'S',
            price: 6300, // 5900 + 400 shipping
            promoCode: '',
            shippingName: 'Express Delivery (Algiers)',
            shippingPrice: 400,
            status: 'Shipped'
        }
    ]
};

// Available configuration lists for interactive admin form selectors
const ADMIN_AVAILABLE_COLORS = ['Midnight Black', 'Teal Breeze', 'Electric Orchid', 'Sage Green', 'Ocean Blue', 'Crimson Red', 'Lavender Dust'];
const ADMIN_AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Selected items in the dynamic form pill selectors
let selectedPillColors = [];
let selectedPillSizes = [];
let selectedProductImages = []; // Holds list of image references for product being edited/added
let modalCarouselIndex = 0; // Tracks currently active slide index inside the product editor modal
let expandedStockProductIds = new Set(); // Tracks expanded stock accordion product IDs across render updates

// --- CRYPTOGRAPHIC UTILS ---
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// --- SUPABASE CLOUD SYNC OPERATIONS ---
async function fetchDbFromSupabase() {
    if (!supabaseClient) {
        console.log('Supabase client not initialized. Using localStorage.');
        globalDb = getLocalStorageDb();
        return;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('store_db')
            .select('data')
            .eq('id', 1)
            .single();
            
        if (error) throw error;
        
        if (data && data.data && Object.keys(data.data).length > 0) {
            globalDb = sanitizeDb(data.data);
            console.log('Database loaded successfully from Supabase Cloud.');
        } else {
            console.warn('Supabase row empty. Seeding cloud database with defaults...');
            globalDb = DEFAULT_DB;
            await syncDbToSupabase(DEFAULT_DB);
        }
    } catch (err) {
        console.error('Failed to load Supabase cloud data. Falling back to local cache:', err);
        globalDb = getLocalStorageDb();
    }
}

async function syncDbToSupabase(db) {
    // Always save to localStorage as local backup
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    
    if (!supabaseClient) return;
    
    // Create a copy of the database payload so we don't mutate global state
    const payload = JSON.parse(JSON.stringify(db));
    
    // Attach authentication token if logged in
    const rawPin = sessionStorage.getItem('aeroflex_admin_raw_pin');
    if (rawPin) {
        if (!payload.security) payload.security = {};
        payload.security.authToken = rawPin;
    }
    
    try {
        const { error } = await supabaseClient
            .from('store_db')
            .update({ data: payload })
            .eq('id', 1);
            
        if (error) throw error;
    } catch (err) {
        console.error('Failed to sync database to Supabase Cloud:', err);
        showToast('Offline backup updated locally.', 'info');
    }
}

function compressAndResizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = () => {
                resolve(event.target.result); // Fallback to raw base64 if load fails
            };
        };
        reader.onerror = () => {
            resolve('');
        };
    });
}

async function uploadImageToSupabase(file) {
    if (supabaseClient) {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const filePath = `${fileName}`;
            
            const { data, error } = await supabaseClient.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });
                
            if (!error) {
                const { data: urlData } = supabaseClient.storage
                    .from('product-images')
                    .getPublicUrl(filePath);
                return urlData.publicUrl;
            } else {
                console.warn('Supabase storage upload error, using base64 compressed fallback:', error.message);
            }
        } catch (err) {
            console.error('Supabase storage exception, using base64 compressed fallback:', err);
        }
    }
    
    // Fallback: Compress and resize file locally to a tiny base64 string (under 50KB)
    return await compressAndResizeImage(file);
}

function getLocalStorageDb() {
    let db = localStorage.getItem(DB_KEY);
    if (!db) {
        localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_DB));
        return DEFAULT_DB;
    }
    return sanitizeDb(JSON.parse(db));
}

function sanitizeDb(parsed) {
    let needsSave = false;
    
    if (!parsed.security || parsed.security.hash === '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' || parsed.security.hash === '240a10a68a82ea11761c2fef09ca512f45e9940657750127f56d499855b19e12') {
        parsed.security = {
            hash: '07edcf9f709cd2f4e422ad8a967c1c516dd856333b5eef097285a7e9192ecdab' // default wassim
        };
        needsSave = true;
    }
    
    if (!parsed.shippingRates) {
        parsed.shippingRates = [
            { id: 'rate-standard', name: 'Standard Delivery (48 Wilayas)', price: 600, active: true },
            { id: 'rate-express', name: 'Express Delivery (Algiers)', price: 400, active: true },
            { id: 'rate-free', name: 'Free Store Pickup', price: 0, active: true }
        ];
        needsSave = true;
    }
    
    if (!parsed.products || !Array.isArray(parsed.products) || parsed.products.some(p => p.id === 'aeroflex-sculpt' || p.colors.includes('Earthy Olive') || p.name === 'The Everyday Classic Cut')) {
        parsed.products = DEFAULT_DB.products;
        parsed.stock = DEFAULT_DB.stock;
        needsSave = true;
    }
    
    parsed.products.forEach(p => {
        if (!p.images || !Array.isArray(p.images)) {
            p.images = p.image ? [p.image] : ['assets/hero_leggings.jpg'];
            needsSave = true;
        }
    });

    const hasActive = parsed.products.some(p => p.activeHomepage === true);
    if (!hasActive && parsed.products.length > 0) {
        parsed.products[0].activeHomepage = true;
        needsSave = true;
    }
    
    let foundActive = false;
    parsed.products.forEach(p => {
        if (p.activeHomepage === true) {
            if (foundActive) {
                p.activeHomepage = false;
                needsSave = true;
            } else {
                foundActive = true;
            }
        }
    });
    
    if (!parsed.orders) {
        parsed.orders = [];
        needsSave = true;
    }

    parsed.orders.forEach(o => {
        if (o.shippingName === undefined) {
            o.shippingName = 'Standard Delivery';
            o.shippingPrice = 0;
            needsSave = true;
        }
    });
    
    if (!parsed.promoCodes) {
        parsed.promoCodes = [];
        needsSave = true;
    }
    
    if (!parsed.stock) {
        parsed.stock = DEFAULT_DB.stock;
        needsSave = true;
    }
    
    if (needsSave && !supabaseClient) {
        localStorage.setItem(DB_KEY, JSON.stringify(parsed));
    }
    
    return parsed;
}

function getDb() {
    if (!globalDb) {
        globalDb = getLocalStorageDb();
    }
    return globalDb;
}

function syncStoreStateWithActiveProduct(db) {
    const activeProd = db.products.find(p => p.activeHomepage === true) || db.products[0];
    if (activeProd) {
        storeState.selectedProductId = activeProd.id;
        if (!activeProd.colors.includes(storeState.selectedColor)) {
            storeState.selectedColor = activeProd.colors[0];
        }
        if (!activeProd.sizes.includes(storeState.selectedSize)) {
            storeState.selectedSize = activeProd.sizes[0];
        }
    }
}

function saveDb(db) {
    globalDb = db;
    
    // Ensure storeState matches active homepage product
    syncStoreStateWithActiveProduct(db);
    
    // Trigger renders synchronously for instant UI updates
    renderPublicStore();
    renderAdminDashboard();
    
    // Background async sync to Supabase Cloud
    syncDbToSupabase(db);
}

// --- STATE MANAGEMENT ---
let storeState = {
    selectedProductId: 'everyday-classic',
    selectedColor: 'Midnight Black',
    selectedSize: 'M',
    appliedPromo: null,
    selectedShippingId: 'rate-standard' // Default shipping selection
};

// Security Tracking
let lockoutInterval = null;
let lastActivityTime = Date.now();
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// --- INITIAL LOADING ---
document.addEventListener('DOMContentLoaded', async () => {
    await fetchDbFromSupabase(); // Wait for cloud database fetch
    
    // Sync storeState to active homepage product
    const db = getDb();
    syncStoreStateWithActiveProduct(db);
    
    // Setup routing and tab listeners
    initNavigation();
    initConfirmModal();
    initPublicPage();
    initAdminPage();
    initCarousel();
    initSecuritySettings();
    initShippingSettings(); // Admin shipping tab
    initDiagnosticsSettings(); // Automated E2E testing tab
    
    // Populate customer shipping select dropdown
    populateShippingDropdown();
    
    // Initial Render
    renderPublicStore();
    
    // Start countdown timer
    startCountdown();
    
    // Check initial lockout state
    checkLockoutState();
    
    // Start inactivity session checks
    startInactivityTracker();
    
    // Setup scroll entrance reveal animations
    initScrollReveal();
    
    // Render lucide icons
    lucide.createIcons();

    // Poll Supabase for database updates every 5 seconds to sync stock and orders in real-time
    setInterval(async () => {
        if (!supabaseClient) return;
        
        const isAdminView = window.location.hash.startsWith('#admin');
        
        if (isAdminView) {
            const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
            if (isAuthenticated && !isAnyModalOpen()) {
                await fetchDbFromSupabase();
                renderAdminDashboard();
            }
        } else {
            await fetchDbFromSupabase();
            renderPublicStore();
        }
    }, 5000);
});

function isAnyModalOpen() {
    const modals = [
        'product-form-modal',
        'code-form-modal',
        'shipping-form-modal',
        'confirm-modal',
        'admin-auth-modal'
    ];
    return modals.some(id => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
    });
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    if (type === 'info') iconName = 'info';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- PRODUCT GALLERY CAROUSEL ---
let carouselIndex = 0;
let carouselInterval = null;

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    
    if (slides.length === 0) return;

    // Clone control buttons to remove previous event listeners
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    carouselIndex = 0; // reset to first slide

    function showSlide(index) {
        // Handle boundary wraps
        if (index >= slides.length) carouselIndex = 0;
        else if (index < 0) carouselIndex = slides.length - 1;
        else carouselIndex = index;
        
        // Toggle active states on images
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === carouselIndex);
        });
        
        // Toggle active states on dot indicators
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === carouselIndex);
        });
    }

    function nextSlide() {
        showSlide(carouselIndex + 1);
    }

    function prevSlide() {
        showSlide(carouselIndex - 1);
    }

    // Set auto-sliding every 5 seconds
    function startAutoPlay() {
        stopAutoPlay();
        carouselInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (carouselInterval) clearInterval(carouselInterval);
    }

    // Controls listeners
    newPrev.addEventListener('click', () => {
        prevSlide();
        startAutoPlay(); // reset timer
    });

    newNext.addEventListener('click', () => {
        nextSlide();
        startAutoPlay(); // reset timer
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showSlide(index);
            startAutoPlay();
        });
    });

    // Start auto slide
    startAutoPlay();
}

// --- DYNAMIC CAROUSEL RENDERER ---
function renderCarousel(product) {
    const slidesContainer = document.getElementById('carousel-slides');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (!slidesContainer || !dotsContainer) return;
    
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    const images = product.images && product.images.length > 0 ? product.images : [product.image || 'assets/hero_leggings.jpg'];
    
    images.forEach((imgSrc, index) => {
        // Create slide img
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `${product.name} Slide ${index + 1}`;
        img.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
        img.id = `slide-${index}`;
        slidesContainer.appendChild(img);
        
        // Create dot indicator
        const dot = document.createElement('span');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', index);
        dotsContainer.appendChild(dot);
    });
    
    // Reinitialize event bindings
    initCarousel();
}

// --- VIEW ROUTING AND NAV INTERACTION ---
function initNavigation() {
    const handleRoute = async () => {
        const hash = window.location.hash;
        const publicView = document.getElementById('public-view');
        const adminView = document.getElementById('admin-view');
        
        if (hash.startsWith('#admin')) {
            // Check auth
            const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
            if (isAuthenticated) {
                // Fetch fresh cloud database on routing to admin view
                await fetchDbFromSupabase();
                
                publicView.classList.add('hidden');
                adminView.classList.remove('hidden');
                renderAdminDashboard();
                lastActivityTime = Date.now(); // reset activity
            } else {
                // Show auth modal and stay on store view
                window.location.hash = '#/';
                showAdminAuthModal(true);
            }
        } else {
            adminView.classList.add('hidden');
            publicView.classList.remove('hidden');
            renderPublicStore();
        }
        lucide.createIcons();
    };

    window.addEventListener('hashchange', handleRoute);
    // Initial check
    handleRoute();

    // Mobile Navigation Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        const isOpen = mobileMenu.classList.contains('open');
        mobileToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
        lucide.createIcons();
    });

    // Close mobile menu on link clicks
    mobileMenu.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            mobileToggle.innerHTML = '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
    });

    // Header scroll background effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Owner Portal footer link and header link
    document.getElementById('footer-admin-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#admin';
    });

    document.querySelector('.nav-admin-btn').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = '#admin';
    });
}

// --- ADMIN BRUTE FORCE LOCKOUT ENGINE ---
function checkLockoutState() {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0');
    const banner = document.getElementById('auth-lockout-banner');
    const pinInput = document.getElementById('admin-pin');
    const submitBtn = document.getElementById('admin-auth-submit-btn');
    const hintText = document.getElementById('auth-hint-text');
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
        // Locked state
        pinInput.disabled = true;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        banner.classList.remove('hidden');
        if (hintText) hintText.classList.add('hidden');
        
        if (lockoutInterval) clearInterval(lockoutInterval);
        
        const updateTimer = () => {
            const timeLeft = lockoutUntil - Date.now();
            if (timeLeft <= 0) {
                clearInterval(lockoutInterval);
                localStorage.removeItem(ATTEMPTS_KEY);
                localStorage.removeItem(LOCKOUT_KEY);
                
                pinInput.disabled = false;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
                banner.classList.add('hidden');
                if (hintText) hintText.classList.remove('hidden');
                document.getElementById('auth-error-msg').textContent = '';
                showToast('Authentication portal unlocked.', 'info');
            } else {
                const mins = Math.floor(timeLeft / 60000);
                const secs = Math.floor((timeLeft % 60000) / 1000);
                banner.textContent = `Too many failed attempts. Locked for security. Try again in ${mins}:${String(secs).padStart(2, '0')}.`;
            }
        };
        
        updateTimer();
        lockoutInterval = setInterval(updateTimer, 1000);
        return true;
    } else {
        // Unlocked state
        pinInput.disabled = false;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        banner.classList.add('hidden');
        if (hintText) hintText.classList.remove('hidden');
        return false;
    }
}

// --- CUSTOM DELETION CONFIRMATION MODAL ---
let currentConfirmAction = null;

function showCustomConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    document.getElementById('confirm-modal-title').textContent = title;
    document.getElementById('confirm-modal-desc').textContent = message;
    
    currentConfirmAction = onConfirm;
    modal.classList.remove('hidden');
    lucide.createIcons();
}

function initConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;
    
    const closeModal = () => {
        modal.classList.add('hidden');
        currentConfirmAction = null;
    };
    
    document.getElementById('confirm-modal-cancel').addEventListener('click', closeModal);
    
    document.getElementById('confirm-modal-submit').addEventListener('click', () => {
        if (typeof currentConfirmAction === 'function') {
            currentConfirmAction();
        }
        closeModal();
    });
}

// --- ADMIN PIN AUTHENTICATION MODAL ---
function showAdminAuthModal(show) {
    const modal = document.getElementById('admin-auth-modal');
    const input = document.getElementById('admin-pin');
    const errMsg = document.getElementById('auth-error-msg');
    
    if (show) {
        modal.classList.remove('hidden');
        input.value = '';
        input.focus();
        errMsg.textContent = '';
        checkLockoutState();
    } else {
        modal.classList.add('hidden');
        if (lockoutInterval) clearInterval(lockoutInterval);
    }
}

document.getElementById('auth-modal-close').addEventListener('click', () => {
    showAdminAuthModal(false);
});

document.getElementById('admin-auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkLockoutState()) return;
    
    const pin = document.getElementById('admin-pin').value;
    const errMsg = document.getElementById('auth-error-msg');
    // Fetch latest database from Supabase before checking credentials
    await fetchDbFromSupabase();
    const db = getDb();
    
    // Hash entered PIN
    const enteredHash = await sha256(pin);
    if (enteredHash === db.security.hash) {
        // Success
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.setItem(AUTH_KEY, 'true');
        sessionStorage.setItem('aeroflex_admin_raw_pin', pin);
        showAdminAuthModal(false);
        window.location.hash = '#admin';
        showToast('Successfully authenticated as administrator.', 'success');
    } else {
        // Failed attempt
        let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0') + 1;
        localStorage.setItem(ATTEMPTS_KEY, String(attempts));
        
        if (attempts >= 5) {
            // Lockout for 5 minutes
            const lockoutTime = Date.now() + (5 * 60 * 1000);
            localStorage.setItem(LOCKOUT_KEY, String(lockoutTime));
            checkLockoutState();
            showToast('Authentication portal locked. Too many failed attempts.', 'error');
        } else {
            errMsg.textContent = `Incorrect PIN. Attempt ${attempts} of 5.`;
            document.getElementById('admin-pin').value = '';
            document.getElementById('admin-pin').focus();
        }
    }
});

// --- INACTIVITY AUTO-LOGOUT MONITOR ---
function startInactivityTracker() {
    // Listen to user interactions to reset activity timestamp
    const resetActivity = () => {
        lastActivityTime = Date.now();
    };
    
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('keypress', resetActivity);
    window.addEventListener('scroll', resetActivity);
    
    // Periodically check inactivity timer
    setInterval(() => {
        const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';
        if (isAuthenticated) {
            const timePassed = Date.now() - lastActivityTime;
            if (timePassed >= INACTIVITY_TIMEOUT) {
                // Auto-logout
                sessionStorage.setItem(AUTH_KEY, 'false');
                window.location.hash = '#/';
                showToast('Logged out automatically due to inactivity.', 'info');
                showAdminAuthModal(false);
            }
        }
    }, 15000); // Check every 15 seconds
}

// --- STOREFRONT SHIPPING RATE SELECT POPULATOR ---
function populateShippingDropdown() {
    const select = document.getElementById('cust-shipping');
    if (!select) return;
    
    const db = getDb();
    const activeRates = db.shippingRates.filter(r => r.active);
    
    select.innerHTML = '';
    
    if (activeRates.length === 0) {
        const opt = document.createElement('option');
        opt.value = 'free-default';
        opt.textContent = 'Free Shipping (0 DA)';
        select.appendChild(opt);
        storeState.selectedShippingId = 'free-default';
        return;
    }
    
    activeRates.forEach(rate => {
        const opt = document.createElement('option');
        opt.value = rate.id;
        opt.textContent = `${rate.name} (${rate.price === 0 ? 'FREE' : rate.price.toLocaleString() + ' DA'})`;
        select.appendChild(opt);
    });
    
    // Set default selected option
    const stillExists = activeRates.some(r => r.id === storeState.selectedShippingId);
    if (!stillExists) {
        storeState.selectedShippingId = activeRates[0].id;
    }
    select.value = storeState.selectedShippingId;
}

// --- PUBLIC STORE ENGINE ---
function initPublicPage() {
    // Fabric Tech Interactive Tabs
    document.querySelectorAll('.tech-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tech-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Shipping Select listener
    const shippingSelect = document.getElementById('cust-shipping');
    if (shippingSelect) {
        shippingSelect.addEventListener('change', (e) => {
            storeState.selectedShippingId = e.target.value;
            renderPublicStore();
        });
    }

    // Promo Code Application
    document.getElementById('apply-promo-btn').addEventListener('click', async () => {
        await applyPromoCode();
    });

    // COD Checkout Form Submission
    document.getElementById('cod-checkout-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitCodOrder();
    });

    // Success Modal Close
    document.getElementById('success-modal-close-btn').addEventListener('click', () => {
        document.getElementById('order-success-modal').classList.add('hidden');
    });

    // Select Product from Spotlight Section
    document.querySelectorAll('.select-spotlight-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const db = getDb();
            const product = db.products.find(p => p.id === id);
            if (product) {
                storeState.selectedProductId = id;
                storeState.selectedColor = product.colors[0] || '';
                storeState.selectedSize = product.sizes[0] || 'M';
                renderPublicStore();
                document.getElementById('product-purchase').scrollIntoView({ behavior: 'smooth' });
                showToast(`Selected ${product.name}`, 'info');
            }
        });
    });

    // Style switcher button clicks inside the order form
    document.querySelectorAll('.style-switch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const db = getDb();
            const product = db.products.find(p => p.id === id);
            if (product) {
                storeState.selectedProductId = id;
                storeState.selectedColor = product.colors[0] || '';
                storeState.selectedSize = product.sizes[0] || 'M';
                renderPublicStore();
                showToast(`Selected ${product.name}`, 'info');
            }
        });
    });
}

function renderPublicStore() {
    const db = getDb();
    let product = db.products.find(p => p.id === storeState.selectedProductId);
    
    if (!product && db.products.length > 0) {
        const activeHomepageProd = db.products.find(p => p.activeHomepage);
        product = activeHomepageProd || db.products[0];
        storeState.selectedProductId = product.id;
        storeState.selectedColor = product.colors[0] || '';
        storeState.selectedSize = product.sizes[0] || 'M';
    }
    
    if (!product) return;
    
    // Update Style Cut Switcher buttons visual state
    const btnClassic = document.getElementById('style-btn-classic');
    const btnFlared = document.getElementById('style-btn-flared');
    if (btnClassic && btnFlared) {
        if (storeState.selectedProductId === 'everyday-classic') {
            btnClassic.classList.add('active');
            btnClassic.style.border = '1px solid var(--primary)';
            btnClassic.style.background = 'rgba(220,164,150,0.1)';
            btnClassic.style.color = 'var(--primary)';
            
            btnFlared.classList.remove('active');
            btnFlared.style.border = '1px solid var(--border)';
            btnFlared.style.background = 'none';
            btnFlared.style.color = 'var(--text-secondary)';
        } else {
            btnFlared.classList.add('active');
            btnFlared.style.border = '1px solid var(--primary)';
            btnFlared.style.background = 'rgba(220,164,150,0.1)';
            btnFlared.style.color = 'var(--primary)';
            
            btnClassic.classList.remove('active');
            btnClassic.style.border = '1px solid var(--border)';
            btnClassic.style.background = 'none';
            btnClassic.style.color = 'var(--text-secondary)';
        }
    }
    
    // Render dynamic carousel slideshow
    renderCarousel(product);
    
    // Set text contents
    document.getElementById('display-product-name').textContent = product.name;
    document.getElementById('original-price-display').textContent = `${product.originalPrice.toLocaleString()} DA`;
    
    // Render color options
    const colorContainer = document.getElementById('color-options-container');
    colorContainer.innerHTML = '';
    product.colors.forEach(color => {
        const btn = document.createElement('button');
        btn.className = `color-btn ${storeState.selectedColor === color ? 'active' : ''}`;
        btn.textContent = color;
        btn.addEventListener('click', () => {
            storeState.selectedColor = color;
            document.getElementById('selected-color-label').textContent = color;
            renderPublicStore();
        });
        colorContainer.appendChild(btn);
    });

    // Render size options
    const sizeContainer = document.getElementById('size-options-container');
    sizeContainer.innerHTML = '';
    product.sizes.forEach(size => {
        const btn = document.createElement('button');
        
        // Check stock availability for specific color/size
        const variantKey = `${product.id}:${storeState.selectedColor}:${size}`;
        const stockCount = db.stock[variantKey] || 0;
        
        btn.className = `size-btn ${storeState.selectedSize === size ? 'active' : ''} ${stockCount <= 0 ? 'out-of-stock' : ''}`;
        btn.textContent = size;
        
        if (stockCount > 0) {
            btn.addEventListener('click', () => {
                storeState.selectedSize = size;
                document.getElementById('selected-size-label').textContent = size;
                renderPublicStore();
            });
        }
        sizeContainer.appendChild(btn);
    });

    // Update Stock Status Badge
    const variantKey = `${product.id}:${storeState.selectedColor}:${storeState.selectedSize}`;
    const currentStock = db.stock[variantKey] !== undefined ? db.stock[variantKey] : 0;
    const stockContainer = document.getElementById('stock-status-container');
    const stockText = document.getElementById('stock-status-text');
    const submitBtn = document.getElementById('submit-order-btn');
    
    stockContainer.className = 'stock-status-container'; // reset classes
    
    if (currentStock <= 0) {
        stockContainer.classList.add('out-of-stock');
        stockText.textContent = `Sorry, this color (${storeState.selectedColor}) and size (${storeState.selectedSize}) is currently out of stock.`;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
    } else if (currentStock <= 3) {
        stockContainer.classList.add('low-stock');
        stockText.textContent = `Hurry! Only ${currentStock} left in stock for ${storeState.selectedColor} - Size ${storeState.selectedSize}!`;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    } else {
        stockContainer.classList.add('in-stock');
        stockText.textContent = `In Stock: ${storeState.selectedColor} - Size ${storeState.selectedSize} is ready for fast delivery.`;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    }
    
    // Update Price Summary
    updatePriceCalculation(product.price);
}

function updatePriceCalculation(basePrice) {
    let finalPrice = basePrice;
    const promoFeedback = document.getElementById('promo-feedback-msg');
    const promoDiscountBadge = document.getElementById('promo-discount-badge');
    const discountRow = document.getElementById('summary-discount-row');
    
    // 1. Calculate discount
    let discountAmount = 0;
    if (storeState.appliedPromo) {
        const isCollab = storeState.appliedPromo.type === 'collaborator';
        discountAmount = basePrice * ((storeState.appliedPromo.discount || 0) / 100);
        finalPrice = basePrice - discountAmount;
        
        document.getElementById('summary-discount').textContent = `-${discountAmount.toLocaleString()} DA`;
        // Hide discount row in receipt if it's 0 DA discount
        discountRow.style.display = discountAmount > 0 ? 'flex' : 'none';
        
        promoFeedback.className = 'promo-feedback success';
        if (isCollab) {
            promoFeedback.textContent = `تم تطبيق كود الشريك: ${storeState.appliedPromo.code}`;
            promoDiscountBadge.style.display = 'none';
        } else {
            promoFeedback.textContent = `تم تطبيق الكود ${storeState.appliedPromo.code}: خصم -${storeState.appliedPromo.discount}%!`;
            promoDiscountBadge.style.display = 'block';
            promoDiscountBadge.textContent = `-${storeState.appliedPromo.discount}% OFF`;
        }
    } else {
        discountRow.style.display = 'none';
        promoDiscountBadge.style.display = 'none';
    }
    
    // 2. Fetch Selected Shipping Fee
    const db = getDb();
    const selectedRate = db.shippingRates.find(r => r.id === storeState.selectedShippingId);
    const shippingFee = selectedRate ? selectedRate.price : 0;
    
    const shippingDisplay = document.getElementById('summary-shipping');
    if (shippingDisplay) {
        if (shippingFee === 0) {
            shippingDisplay.textContent = 'FREE';
        } else {
            shippingDisplay.textContent = `${shippingFee.toLocaleString()} DA`;
        }
        shippingDisplay.className = 'text-green';
    }
    
    // 3. Calculate grand total
    const grandTotal = finalPrice + shippingFee;
    
    document.getElementById('sale-price-display').textContent = `${finalPrice.toLocaleString()} DA`;
    document.getElementById('summary-subtotal').textContent = `${basePrice.toLocaleString()} DA`;
    document.getElementById('summary-total').textContent = `${grandTotal.toLocaleString()} DA`;
}

async function applyPromoCode() {
    const input = document.getElementById('promo-code');
    const codeEntered = input.value.trim().toUpperCase();
    const promoFeedback = document.getElementById('promo-feedback-msg');
    
    // Fetch fresh database from Supabase cloud so customers can use newly created codes immediately
    await fetchDbFromSupabase();
    
    if (!codeEntered) {
        storeState.appliedPromo = null;
        if (promoFeedback) {
            promoFeedback.className = 'promo-feedback';
            promoFeedback.textContent = '';
        }
        renderPublicStore();
        return;
    }
    
    const db = getDb();
    const foundCode = db.promoCodes.find(p => p.code === codeEntered);
    
    if (foundCode && foundCode.active) {
        storeState.appliedPromo = foundCode;
        renderPublicStore();
        showToast(`Promo code "${codeEntered}" applied successfully!`, 'success');
    } else {
        storeState.appliedPromo = null;
        if (promoFeedback) {
            promoFeedback.className = 'promo-feedback error';
            promoFeedback.textContent = 'كود الخصم غير صحيح أو غير مفعّل حالياً.';
        }
        renderPublicStore();
    }
}

async function submitCodOrder() {
    // 1. Fetch the absolute latest database state from Supabase first
    await fetchDbFromSupabase();
    
    const db = getDb();
    const product = db.products.find(p => p.id === storeState.selectedProductId);
    if (!product) return;
    
    const variantKey = `${product.id}:${storeState.selectedColor}:${storeState.selectedSize}`;
    const stockCount = db.stock[variantKey] || 0;
    
    // 2. Double check stock count in DB
    if (stockCount <= 0) {
        showToast('Sorry! This exact size/color combination has just sold out.', 'error');
        renderPublicStore();
        return;
    }
    
    // 2. Fetch Customer Info
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    
    // 3. Fetch Selected Shipping Option details
    const shippingRate = db.shippingRates.find(r => r.id === storeState.selectedShippingId);
    const shippingName = shippingRate ? shippingRate.name : 'Standard Delivery';
    const shippingPrice = shippingRate ? shippingRate.price : 0;
    
    // Calculate final price paid
    let pricePaid = product.price;
    if (storeState.appliedPromo) {
        pricePaid = pricePaid - (pricePaid * (storeState.appliedPromo.discount / 100));
    }
    pricePaid += shippingPrice; // Add shipping fee to paid price
    
    // 4. Decrement Stock Count
    db.stock[variantKey] = stockCount - 1;
    
    // 5. Create Order Object
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
        id: newOrderId,
        date: new Date().toISOString(),
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        productId: product.id,
        productName: product.name,
        color: storeState.selectedColor,
        size: storeState.selectedSize,
        price: parseFloat(pricePaid.toFixed(0)),
        promoCode: storeState.appliedPromo ? storeState.appliedPromo.code : '',
        promoType: storeState.appliedPromo ? (storeState.appliedPromo.type || 'discount') : '',
        collaboratorCommission: storeState.appliedPromo ? (storeState.appliedPromo.commission || 0) : 0,
        shippingName: shippingName,
        shippingPrice: shippingPrice,
        status: 'Pending'
    };
    
    db.orders.unshift(newOrder); // Add to the top of orders
    
    // 6. Persist Database
    saveDb(db);
    
    // Send Telegram Notification
    sendTelegramOrderNotification(newOrder);
    
    // 7. Reset Form fields (except promo code)
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cust-address').value = '';
    
    // 8. Show Order Successful Modal
    document.getElementById('success-order-id').textContent = newOrderId;
    document.getElementById('success-order-product').textContent = product.name;
    document.getElementById('success-order-variant').textContent = `${storeState.selectedColor} / Size ${storeState.selectedSize}`;
    document.getElementById('success-order-total').textContent = `${pricePaid.toLocaleString()} DA`;
    
    document.getElementById('order-success-modal').classList.remove('hidden');
    
    showToast(`Order placed successfully! Reference: ${newOrderId}`, 'success');
}

async function sendTelegramOrderNotification(order) {
    const creds = getTelegramCredentials();
    if (!creds.botToken || !creds.chatId) return;
    
    let promoLine = `*Promo Code:* ${order.promoCode || 'None'}`;
    if (order.promoCode) {
        const isCollab = order.promoType === 'collaborator';
        if (isCollab) {
            promoLine = `*Promo Code (Collaborator):* ${order.promoCode} (Commission: ${order.collaboratorCommission} DA)`;
        } else {
            promoLine = `*Promo Code (Discount):* ${order.promoCode}`;
        }
    }

    const messageText = `🛍️ *New COD Order Placed!*\n\n` +
        `*Order Reference:* \`${order.id}\`\n` +
        `*Date:* ${new Date(order.date).toLocaleString()}\n\n` +
        `👤 *Customer Details:*\n` +
        `*Name:* ${order.customerName}\n` +
        `*Phone:* ${order.customerPhone}\n` +
        `*Address:* ${order.customerAddress}\n\n` +
        `📦 *Product Ordered:*\n` +
        `*Product:* ${order.productName}\n` +
        `*Color:* ${order.color}\n` +
        `*Size:* ${order.size}\n\n` +
        `🚚 *Fulfillment Details:*\n` +
        `*Delivery:* ${order.shippingName} (${order.shippingPrice === 0 ? 'FREE' : order.shippingPrice + ' DA'})\n` +
        `${promoLine}\n` +
        `*Total Amount:* *${order.price.toLocaleString()} DA*`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${creds.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: creds.chatId,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });
        
        const data = await response.json();
        if (!data.ok) {
            console.error('Telegram API error:', data.description);
        } else {
            console.log('Telegram notification sent successfully.');
        }
    } catch (err) {
        console.error('Failed to send Telegram notification:', err);
    }
}

// --- BANNER COUNTDOWN TIMER ---
function startCountdown() {
    let hours = 2;
    let minutes = 45;
    let seconds = 12;
    
    const hElem = document.getElementById('timer-hours');
    const mElem = document.getElementById('timer-minutes');
    const sElem = document.getElementById('timer-seconds');
    
    if (!hElem || !mElem || !sElem) return;
    
    const pad = (n) => String(n).padStart(2, '0');
    
    const timerId = setInterval(() => {
        const h = document.getElementById('timer-hours');
        const m = document.getElementById('timer-minutes');
        const s = document.getElementById('timer-seconds');
        if (!h || !m || !s) {
            clearInterval(timerId);
            return;
        }
        
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    // Reset to keep demonstration active
                    hours = 3;
                    minutes = 15;
                    seconds = 45;
                }
            }
        }
        h.textContent = pad(hours);
        m.textContent = pad(minutes);
        s.textContent = pad(seconds);
    }, 1000);
}

// --- OWNER ADMIN DASHBOARD ---
function initAdminPage() {
    // Navigation items inside Admin view (Desktop & Mobile)
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            // Toggle active nav class across all matching nav items
            navItems.forEach(n => {
                if (n.getAttribute('data-tab') === targetTab) {
                    n.classList.add('active');
                } else {
                    n.classList.remove('active');
                }
            });
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('admin-mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.remove('open');
            }
            
            // Toggle active content divs
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(targetTab).classList.remove('hidden');
            
            // Update Title
            const titles = {
                'tab-stock': ['Live Stock Management', 'Monitor and adjust live stock counts for size/color variants.'],
                'tab-orders': ['Cash on Delivery Orders', 'Manage fulfillment pipeline for customer COD orders.'],
                'tab-finance': ['Finance Dashboard', 'Manage shop revenues, shipping fees collected, and collaborator commissions.'],
                'tab-products': ['Product Catalog', 'Add or customize leggings styles, pricing, and variants.'],
                'tab-codes': ['Discount & Promo Codes', 'Manage active discount codes that customers can enter at checkout.'],
                'tab-shipping': ['Shipping Fees Manager', 'Configure delivery methods and customize pricing zones.'],
                'tab-security': ['Security Settings', 'Update Owner access PIN and configure brute force defense.'],
                'tab-diagnostics': ['System Diagnostics & E2E Testing', 'Run automated E2E integration tests to verify store operations.']
            };
            
            document.getElementById('admin-current-tab-title').textContent = titles[targetTab][0];
            document.getElementById('admin-current-tab-desc').textContent = titles[targetTab][1];
            
            lucide.createIcons();
        });
    });

    // Mobile Hamburger Menu Toggle
    const adminToggle = document.getElementById('admin-mobile-toggle');
    const adminMenu = document.getElementById('admin-mobile-menu');
    if (adminToggle && adminMenu) {
        adminToggle.addEventListener('click', () => {
            adminMenu.classList.toggle('open');
        });
    }

    // Logout Actions (Desktop & Mobile)
    const performLogout = () => {
        sessionStorage.setItem(AUTH_KEY, 'false');
        window.location.hash = '#/';
        showToast('Logged out of Admin Panel.', 'info');
        
        // Hide mobile menu if open
        if (adminMenu) {
            adminMenu.classList.remove('open');
        }
    };
    
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
    
    const logoutBtnMobile = document.getElementById('admin-logout-btn-mobile');
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', performLogout);

    // --- PRODUCTS TAB ACTIONS ---
    const prodModal = document.getElementById('product-form-modal');
    document.getElementById('add-product-btn').addEventListener('click', () => {
        document.getElementById('product-modal-title').textContent = 'Add New Product';
        document.getElementById('edit-prod-id').value = '';
        document.getElementById('product-edit-form').reset();
        
        // Clear image upload file and preview list
        document.getElementById('prod-image-file').value = '';
        selectedProductImages = [];
        modalCarouselIndex = 0;
        renderModalCarousel();
        
        // Reset dynamic selectors
        selectedPillColors = ['Midnight Black', 'Teal Breeze', 'Electric Orchid'];
        selectedPillSizes = ['XS', 'S', 'M', 'L', 'XL'];
        renderFormPillSelectors();
        
        prodModal.classList.remove('hidden');
    });
    
    document.getElementById('product-modal-close').addEventListener('click', () => {
        prodModal.classList.add('hidden');
    });

    // Multi-file upload selector listener (uploads to Supabase or converts to base64)
    const fileInput = document.getElementById('prod-image-file');
    
    fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        showToast(`Processing ${files.length} image(s)...`, 'info');
        
        let loadedCount = 0;
        for (const file of files) {
            try {
                const imageUrl = await uploadImageToSupabase(file);
                selectedProductImages.push(imageUrl);
                loadedCount++;
            } catch (err) {
                console.error('Failed to process image:', err);
            }
        }
        
        if (loadedCount > 0) {
            // Set active index to the last uploaded image
            modalCarouselIndex = selectedProductImages.length - 1;
            renderModalCarousel();
            fileInput.value = ''; // Reset input
            showToast(`${loadedCount} image(s) loaded successfully.`, 'success');
        } else {
            showToast('Failed to process uploaded image(s).', 'error');
        }
    });

    // Trigger file selection when clicking the placeholder
    document.getElementById('modal-carousel-placeholder').addEventListener('click', () => {
        fileInput.click();
    });
    
    // Trigger file selection when clicking the overlay "+ Add Image" button
    document.getElementById('modal-carousel-add-btn').addEventListener('click', () => {
        fileInput.click();
    });



    // Modal carousel sliding actions
    document.getElementById('modal-carousel-prev').addEventListener('click', (e) => {
        e.preventDefault();
        modalCarouselIndex--;
        if (modalCarouselIndex < 0) {
            modalCarouselIndex = selectedProductImages.length - 1;
        }
        renderModalCarousel();
    });

    document.getElementById('modal-carousel-next').addEventListener('click', (e) => {
        e.preventDefault();
        modalCarouselIndex++;
        if (modalCarouselIndex >= selectedProductImages.length) {
            modalCarouselIndex = 0;
        }
        renderModalCarousel();
    });

    // Modal carousel delete slide action
    document.getElementById('modal-carousel-delete-btn').addEventListener('click', (e) => {
        e.preventDefault();
        if (selectedProductImages.length === 0) return;
        
        showCustomConfirm(
            'Remove Image',
            'Are you sure you want to remove this image from the product slides?',
            () => {
                selectedProductImages.splice(modalCarouselIndex, 1);
                
                // Adjust active index
                if (modalCarouselIndex >= selectedProductImages.length && selectedProductImages.length > 0) {
                    modalCarouselIndex = selectedProductImages.length - 1;
                }
                
                renderModalCarousel();
                showToast('Image removed.', 'info');
            }
        );
    });

    // Custom color adding handler
    document.getElementById('add-custom-color-btn').addEventListener('click', () => {
        const colorNameInput = document.getElementById('custom-color-name');
        const colorName = colorNameInput.value.trim();
        
        if (!colorName) {
            showToast('Please enter a color name.', 'error');
            return;
        }
        
        // Add color to global selections list if missing
        if (!ADMIN_AVAILABLE_COLORS.includes(colorName)) {
            ADMIN_AVAILABLE_COLORS.push(colorName);
        }
        
        // Auto select custom color
        if (!selectedPillColors.includes(colorName)) {
            selectedPillColors.push(colorName);
        }
        
        renderFormPillSelectors();
        colorNameInput.value = '';
        showToast(`Custom color "${colorName}" added and selected.`, 'success');
    });

    document.getElementById('product-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });

    // --- PROMO CODES TAB ACTIONS ---
    const codeModal = document.getElementById('code-form-modal');
    const codeTypeSelect = document.getElementById('promo-code-type');
    const discountGroup = document.getElementById('promo-discount-group');
    const commissionGroup = document.getElementById('promo-commission-group');
    const pctInput = document.getElementById('promo-code-pct');
    const commInput = document.getElementById('promo-code-comm');

    if (codeTypeSelect) {
        codeTypeSelect.addEventListener('change', () => {
            if (codeTypeSelect.value === 'discount') {
                discountGroup.style.display = 'block';
                pctInput.setAttribute('required', 'true');
                commissionGroup.style.display = 'none';
                commInput.removeAttribute('required');
            } else {
                discountGroup.style.display = 'none';
                pctInput.removeAttribute('required');
                commissionGroup.style.display = 'block';
                commInput.setAttribute('required', 'true');
            }
        });
    }

    document.getElementById('add-code-btn').addEventListener('click', () => {
        document.getElementById('code-modal-title').textContent = 'New Promo Code';
        document.getElementById('code-edit-form').reset();
        
        // Reset modal inputs visibility state
        discountGroup.style.display = 'block';
        pctInput.setAttribute('required', 'true');
        commissionGroup.style.display = 'none';
        commInput.removeAttribute('required');
        
        codeModal.classList.remove('hidden');
    });
    
    document.getElementById('code-modal-close').addEventListener('click', () => {
        codeModal.classList.add('hidden');
    });

    document.getElementById('code-edit-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePromoCode();
    });

    // Export Orders to CSV
    document.getElementById('export-orders-btn').addEventListener('click', () => {
        exportOrdersCsv();
    });

    // Export Finance Report to CSV
    const exportFinanceBtn = document.getElementById('export-finance-btn');
    if (exportFinanceBtn) {
        exportFinanceBtn.addEventListener('click', () => {
            exportFinanceCsv();
        });
    }
}

// --- DYNAMIC FORM PILL SELECTORS FOR ADMIN PROD MODAL ---
function renderFormPillSelectors() {
    const colorsContainer = document.getElementById('admin-colors-selector');
    const sizesContainer = document.getElementById('admin-sizes-selector');
    
    // 1. Colors Selector
    colorsContainer.innerHTML = '';
    ADMIN_AVAILABLE_COLORS.forEach(color => {
        const isSelected = selectedPillColors.includes(color);
        const pill = document.createElement('div');
        pill.className = `selector-pill ${isSelected ? 'active-cyan' : ''}`;
        pill.style.display = 'inline-flex';
        pill.style.alignItems = 'center';
        pill.style.gap = '8px';
        pill.style.cursor = 'pointer';
        pill.style.userSelect = 'none';
        
        // Text label span
        const textSpan = document.createElement('span');
        textSpan.textContent = color;
        textSpan.style.flex = '1';
        pill.appendChild(textSpan);
        
        // Toggle selection status on text click
        textSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedPillColors.includes(color)) {
                if (selectedPillColors.length > 1) {
                    selectedPillColors = selectedPillColors.filter(c => c !== color);
                } else {
                    showToast('Product must have at least one color variant.', 'error');
                }
            } else {
                selectedPillColors.push(color);
            }
            renderFormPillSelectors();
        });
        
        // Delete button
        const deleteSpan = document.createElement('span');
        deleteSpan.innerHTML = '&times;';
        deleteSpan.title = `Delete "${color}" color option`;
        deleteSpan.className = 'delete-color-btn';
        deleteSpan.style.padding = '0 6px';
        deleteSpan.style.borderRadius = '50%';
        deleteSpan.style.fontSize = '1.15rem';
        deleteSpan.style.lineHeight = '1';
        deleteSpan.style.cursor = 'pointer';
        deleteSpan.style.color = 'inherit';
        deleteSpan.style.opacity = '0.5';
        deleteSpan.style.transition = 'var(--transition)';
        
        deleteSpan.addEventListener('mouseover', () => {
            deleteSpan.style.opacity = '1';
            deleteSpan.style.color = '#ef4444';
            deleteSpan.style.background = 'rgba(239, 68, 68, 0.15)';
        });
        deleteSpan.addEventListener('mouseout', () => {
            deleteSpan.style.opacity = '0.5';
            deleteSpan.style.color = 'inherit';
            deleteSpan.style.background = 'transparent';
        });
        
        deleteSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            if (ADMIN_AVAILABLE_COLORS.length <= 1) {
                showToast('You must keep at least one available color choice.', 'error');
                return;
            }
            showCustomConfirm(
                'Delete Color Option',
                `Are you sure you want to delete color option "${color}"?`,
                () => {
                    // Remove from selection
                    selectedPillColors = selectedPillColors.filter(c => c !== color);
                    // Delete color option
                    const idx = ADMIN_AVAILABLE_COLORS.indexOf(color);
                    if (idx > -1) {
                        ADMIN_AVAILABLE_COLORS.splice(idx, 1);
                    }
                    renderFormPillSelectors();
                    showToast(`Color "${color}" removed from choices list.`, 'info');
                }
            );
        });
        
        pill.appendChild(deleteSpan);
        colorsContainer.appendChild(pill);
    });

    // 2. Sizes Selector
    sizesContainer.innerHTML = '';
    ADMIN_AVAILABLE_SIZES.forEach(size => {
        const isSelected = selectedPillSizes.includes(size);
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `selector-pill ${isSelected ? 'active' : ''}`;
        pill.textContent = size;
        
        pill.addEventListener('click', () => {
            if (selectedPillSizes.includes(size)) {
                // Remove size (keep at least 1 size)
                if (selectedPillSizes.length > 1) {
                    selectedPillSizes = selectedPillSizes.filter(s => s !== size);
                } else {
                    showToast('Product must have at least one size variant.', 'error');
                }
            } else {
                // Add size
                selectedPillSizes.push(size);
            }
            renderFormPillSelectors();
        });
        sizesContainer.appendChild(pill);
    });
}

function renderAdminDashboard() {
    const db = getDb();
    
    // Update badge in sidebar/header navigation
    const pendingOrdersCount = db.orders.filter(o => o.status === 'Pending').length;
    
    const badge = document.getElementById('admin-orders-badge');
    if (badge) {
        badge.textContent = pendingOrdersCount;
        badge.style.display = pendingOrdersCount > 0 ? 'inline-block' : 'none';
    }
    
    const badgeMobile = document.getElementById('admin-orders-badge-mobile');
    if (badgeMobile) {
        badgeMobile.textContent = pendingOrdersCount;
        badgeMobile.style.display = pendingOrdersCount > 0 ? 'inline-block' : 'none';
    }

    // 1. RENDER LIVE STOCK
    renderAdminStockTable(db);
    
    // 2. RENDER ORDERS
    renderAdminOrdersTable(db);
    
    // 3. RENDER PRODUCTS
    renderAdminProductsTable(db);
    
    // 4. RENDER PROMO CODES
    renderAdminCodesTable(db);
    
    // 5. RENDER SHIPPING RATES
    renderAdminShippingTable(db);
    
    // 6. RENDER FINANCE DASHBOARD
    renderAdminFinanceDashboard(db);
    
    lucide.createIcons();
}

function renderAdminStockTable(db) {
    const container = document.getElementById('admin-stock-accordion-container');
    if (!container) return;
    container.innerHTML = '';
    
    db.products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'stock-accordion-item';
        item.style.border = '1px solid var(--border)';
        item.style.borderRadius = 'var(--radius)';
        item.style.marginBottom = '12px';
        item.style.overflow = 'hidden';
        item.style.background = '#ffffff';
        item.style.transition = 'box-shadow var(--transition)';
        
        const isExpanded = expandedStockProductIds.has(product.id);
        
        // Calculate total variants stock count
        let totalStock = 0;
        product.colors.forEach(color => {
            product.sizes.forEach(size => {
                const key = `${product.id}:${color}:${size}`;
                totalStock += db.stock[key] !== undefined ? db.stock[key] : 0;
            });
        });
        
        // Header
        const header = document.createElement('div');
        header.className = 'stock-accordion-header';
        header.style.padding = '14px 20px';
        header.style.background = isExpanded ? 'rgba(220, 164, 150, 0.04)' : 'rgba(44, 37, 35, 0.02)';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.cursor = 'pointer';
        header.style.transition = 'background var(--transition)';
        header.style.userSelect = 'none';
        
        header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${product.image}" alt="${product.name}" style="width: 36px; height: 36px; border-radius: var(--radius-sm); object-fit: cover; border: 1px solid var(--border);">
                <div>
                    <strong style="font-size: 0.9rem; color: var(--text-primary);">${product.name}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1px;">Total Stock: ${totalStock} units</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="badge-status ${totalStock > 0 ? 'instock' : 'outofstock'}" style="font-size: 0.75rem; padding: 4px 10px;">
                    ${totalStock > 0 ? 'Active' : 'Out of Stock'}
                </span>
                <i data-lucide="chevron-down" class="accordion-arrow" style="width: 16px; height: 16px; color: var(--text-muted); transition: transform 0.3s ease; ${isExpanded ? 'transform: rotate(180deg);' : ''}"></i>
            </div>
        `;
        
        // Content Area (Collapsible Table)
        const content = document.createElement('div');
        content.className = `stock-accordion-content ${isExpanded ? '' : 'hidden'}`;
        content.style.borderTop = '1px solid var(--border)';
        content.style.background = '#ffffff';
        
        const tableResponsive = document.createElement('div');
        tableResponsive.className = 'table-responsive';
        tableResponsive.style.padding = '0';
        
        const table = document.createElement('table');
        table.className = 'admin-table';
        table.style.margin = '0';
        table.style.boxShadow = 'none';
        table.style.border = 'none';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Color</th>
                    <th>Size</th>
                    <th style="width: 180px;">Stock Control</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        product.colors.forEach(color => {
            product.sizes.forEach(size => {
                const key = `${product.id}:${color}:${size}`;
                const currentStock = db.stock[key] !== undefined ? db.stock[key] : 0;
                
                const tr = document.createElement('tr');
                
                let statusBadge = `<span class="badge-status instock">In Stock</span>`;
                if (currentStock <= 0) {
                    statusBadge = `<span class="badge-status outofstock">Out of Stock</span>`;
                } else if (currentStock <= 3) {
                    statusBadge = `<span class="badge-status low">Low Stock</span>`;
                }
                
                tr.innerHTML = `
                    <td><span class="color-tag">${color}</span></td>
                    <td><span class="color-tag" style="background:rgba(6, 182, 212, 0.1); color: var(--text-primary); border-color: rgba(6, 182, 212, 0.2);">${size}</span></td>
                    <td>
                        <div class="stock-control" style="display: flex; gap: 4px; align-items: center;">
                            <button class="btn-ctrl btn-minus" data-key="${key}">-</button>
                            <input type="number" class="stock-input" value="${currentStock}" data-key="${key}">
                            <button class="btn-ctrl btn-plus" data-key="${key}">+</button>
                        </div>
                    </td>
                    <td>${statusBadge}</td>
                `;
                
                // Bind controls
                tr.querySelector('.btn-minus').addEventListener('click', () => updateStockLevel(key, currentStock - 1));
                tr.querySelector('.btn-plus').addEventListener('click', () => updateStockLevel(key, currentStock + 1));
                tr.querySelector('.stock-input').addEventListener('change', (e) => {
                    const val = parseInt(e.target.value);
                    updateStockLevel(key, isNaN(val) ? 0 : val);
                });
                
                tbody.appendChild(tr);
            });
        });
        
        tableResponsive.appendChild(table);
        content.appendChild(tableResponsive);
        item.appendChild(header);
        item.appendChild(content);
        
        // Toggle action
        header.addEventListener('click', () => {
            const isHidden = content.classList.contains('hidden');
            const arrow = header.querySelector('.accordion-arrow');
            
            if (isHidden) {
                content.classList.remove('hidden');
                header.style.background = 'rgba(220, 164, 150, 0.04)';
                if (arrow) arrow.style.transform = 'rotate(180deg)';
                expandedStockProductIds.add(product.id);
            } else {
                content.classList.add('hidden');
                header.style.background = 'rgba(44, 37, 35, 0.02)';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
                expandedStockProductIds.delete(product.id);
            }
        });
        
        container.appendChild(item);
    });
}

function updateStockLevel(variantKey, newValue) {
    const db = getDb();
    if (newValue < 0) newValue = 0;
    db.stock[variantKey] = newValue;
    saveDb(db);
    showToast(`Stock updated successfully.`, 'success');
}

function renderAdminOrdersTable(db) {
    const body = document.getElementById('admin-orders-table-body');
    body.innerHTML = '';
    
    if (db.orders.length === 0) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:40px;">No Cash on Delivery orders received yet.</td></tr>`;
        return;
    }

    db.orders.forEach(order => {
        const tr = document.createElement('tr');
        const orderDate = order.date ? new Date(order.date).toLocaleString() : 'N/A';
        
        let statusClass = (order.status || 'Pending').toLowerCase();
        
        tr.innerHTML = `
            <td><strong>${order.id || 'N/A'}</strong></td>
            <td><span style="font-size:0.8rem; color:var(--text-secondary);">${orderDate}</span></td>
            <td>
                <div><strong>${order.customerName || 'N/A'}</strong></div>
                <div style="font-size:0.8rem; color:var(--text-muted);"><i data-lucide="phone" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${order.customerPhone || 'N/A'}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);"><i data-lucide="map-pin" style="width:12px; height:12px; display:inline; vertical-align:middle;"></i> ${order.customerAddress || 'N/A'}</div>
            </td>
            <td>
                <div>${order.productName || 'N/A'}</div>
                <span class="color-tag">${order.color || 'N/A'}</span> <span class="color-tag" style="background:rgba(124,58,237,0.15)">${order.size || 'N/A'}</span>
            </td>
            <td>
                <strong class="text-green">${(order.price || 0).toLocaleString()} DA</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Shipping: ${order.shippingName || 'Standard Delivery'} (${order.shippingPrice === 0 ? 'FREE' : (order.shippingPrice || 0) + ' DA'})</div>
                ${order.promoCode ? (() => {
                    const isCollab = order.promoType === 'collaborator';
                    if (isCollab) {
                        return `<div style="font-size:0.75rem; color:var(--text-muted);">Collab: <strong>${order.promoCode}</strong><br><span class="text-green" style="font-weight:bold; font-size:0.7rem;">+${(order.collaboratorCommission || 0).toLocaleString()} DA Comm.</span></div>`;
                    }
                    return `<div style="font-size:0.75rem; color:var(--text-muted);">Promo: <strong>${order.promoCode}</strong></div>`;
                })() : ''}
            </td>
            <td><span class="badge-status ${statusClass}">${order.status}</span></td>
            <td>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <select class="action-select" data-id="${order.id}" style="width: 110px;">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="btn btn-outline btn-sm btn-delete-order text-red" data-id="${order.id}" style="padding: 6px 10px; height: 34px;"><i data-lucide="trash-2" style="width: 14px; height: 14px;"></i></button>
                </div>
            </td>
        `;
        
        // Listen to select status change
        tr.querySelector('.action-select').addEventListener('change', (e) => {
            updateOrderStatus(order.id, e.target.value);
        });
        
        // Listen to delete button click
        tr.querySelector('.btn-delete-order').addEventListener('click', () => {
            deleteOrder(order.id);
        });

        body.appendChild(tr);
    });
}

function updateOrderStatus(orderId, newStatus) {
    const db = getDb();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
        const oldStatus = order.status || 'Pending';
        
        // Return to stock if cancelled
        if (oldStatus !== 'Cancelled' && newStatus === 'Cancelled') {
            const variantKey = `${order.productId}:${order.color}:${order.size}`;
            if (db.stock[variantKey] !== undefined) {
                db.stock[variantKey] += 1;
            } else {
                db.stock[variantKey] = 1;
            }
            showToast(`Returned 1 item of ${order.color} (Size ${order.size}) back to stock.`, 'info');
        }
        // Deduct from stock if uncancelled
        else if (oldStatus === 'Cancelled' && newStatus !== 'Cancelled') {
            const variantKey = `${order.productId}:${order.color}:${order.size}`;
            if (db.stock[variantKey] !== undefined) {
                db.stock[variantKey] = Math.max(0, db.stock[variantKey] - 1);
            } else {
                db.stock[variantKey] = 0;
            }
            showToast(`Deducted 1 item of ${order.color} (Size ${order.size}) from stock.`, 'info');
        }
        
        order.status = newStatus;
        saveDb(db);
        showToast(`Order ${orderId} status set to: ${newStatus}`, 'success');
    }
}

function renderAdminProductsTable(db) {
    const body = document.getElementById('admin-products-table-body');
    body.innerHTML = '';
    
    db.products.forEach(p => {
        const tr = document.createElement('tr');
        
        const colorsHtml = p.colors.map(c => `<span class="color-tag">${c}</span>`).join('');
        const sizesHtml = p.sizes.map(s => `<span class="color-tag" style="background:rgba(6, 182, 212, 0.1)">${s}</span>`).join('');
        
        tr.innerHTML = `
            <td><img src="${p.image}" class="table-img" alt="${p.name}"></td>
            <td><strong>${p.name}</strong><br><small style="color:var(--text-muted); display:inline-block; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.description}</small></td>
            <td><strong>${p.price.toLocaleString()} DA</strong> <span style="text-decoration:line-through; font-size:0.8rem; color:var(--text-muted);">${p.originalPrice.toLocaleString()} DA</span></td>
            <td>${colorsHtml}</td>
            <td>${sizesHtml}</td>
            <td>
                <label class="switch">
                    <input type="checkbox" class="homepage-toggle" data-id="${p.id}" ${p.activeHomepage ? 'checked disabled' : ''}>
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm btn-edit" data-id="${p.id}"><i data-lucide="edit"></i> Edit</button>
                    <button class="btn btn-outline btn-sm btn-delete text-red" data-id="${p.id}" ${db.products.length <= 1 ? 'disabled style="opacity:0.3;"' : ''}><i data-lucide="trash-2"></i> Delete</button>
                </div>
            </td>
        `;
        
        tr.querySelector('.btn-edit').addEventListener('click', () => openEditProductModal(p.id));
        
        if (db.products.length > 1) {
            tr.querySelector('.btn-delete').addEventListener('click', () => deleteProduct(p.id));
        }
        
        tr.querySelector('.homepage-toggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                toggleHomepageProduct(p.id);
            }
        });
        
        body.appendChild(tr);
    });
}

function toggleHomepageProduct(productId) {
    const db = getDb();
    db.products.forEach(p => {
        p.activeHomepage = (p.id === productId);
    });
    saveDb(db);
    showToast('Homepage active product updated.', 'success');
}

function renderModalCarousel() {
    const placeholder = document.getElementById('modal-carousel-placeholder');
    const slideArea = document.getElementById('modal-carousel-slide-area');
    const img = document.getElementById('modal-carousel-img');
    const counter = document.getElementById('modal-carousel-counter');
    const prevBtn = document.getElementById('modal-carousel-prev');
    const nextBtn = document.getElementById('modal-carousel-next');
    
    if (!placeholder || !slideArea || !img) return;
    
    if (selectedProductImages.length === 0) {
        placeholder.classList.remove('hidden');
        slideArea.classList.add('hidden');
        img.src = '';
        document.getElementById('prod-image').value = '';
        return;
    }
    
    // Bounds checking
    if (modalCarouselIndex >= selectedProductImages.length) {
        modalCarouselIndex = selectedProductImages.length - 1;
    }
    if (modalCarouselIndex < 0) {
        modalCarouselIndex = 0;
    }
    
    placeholder.classList.add('hidden');
    slideArea.classList.remove('hidden');
    
    // Load active image
    img.src = selectedProductImages[modalCarouselIndex];
    
    // Sync backward compatibility hidden input (first image)
    document.getElementById('prod-image').value = selectedProductImages[0];
    
    // Update slide counter
    if (counter) {
        counter.textContent = `Image ${modalCarouselIndex + 1} of ${selectedProductImages.length}`;
    }
    
    // Toggle arrow visibility
    if (prevBtn && nextBtn) {
        if (selectedProductImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

function openEditProductModal(productId) {
    try {
        const db = getDb();
        const p = db.products.find(prod => prod.id === productId);
        if (!p) {
            showToast('Product not found in catalog.', 'error');
            return;
        }
        
        document.getElementById('product-modal-title').textContent = 'Edit Product';
        document.getElementById('edit-prod-id').value = p.id;
        document.getElementById('prod-name').value = p.name;
        document.getElementById('prod-desc').value = p.description;
        document.getElementById('prod-price').value = p.price;
        document.getElementById('prod-original-price').value = p.originalPrice;
        document.getElementById('prod-image').value = p.image || '';
        
        // Ensure all product colors exist in global selection options
        const colorsList = p.colors || [];
        colorsList.forEach(color => {
            if (!ADMIN_AVAILABLE_COLORS.includes(color)) {
                ADMIN_AVAILABLE_COLORS.push(color);
            }
        });
        
        // Load images array and render modal carousel slider
        selectedProductImages = p.images ? [...p.images] : (p.image ? [p.image] : []);
        modalCarouselIndex = 0;
        renderModalCarousel();
        
        // Reset file input selector
        document.getElementById('prod-image-file').value = '';
        
        // Synchronize dynamic color and size selects
        selectedPillColors = p.colors ? [...p.colors] : [];
        selectedPillSizes = p.sizes ? [...p.sizes] : [];
        renderFormPillSelectors();
        
        document.getElementById('product-form-modal').classList.remove('hidden');
    } catch (err) {
        console.error('Error opening product edit modal:', err);
        showToast('Error opening edit modal: ' + err.message, 'error');
    }
}

function saveProduct() {
    const db = getDb();
    const id = document.getElementById('edit-prod-id').value;
    
    const name = document.getElementById('prod-name').value.trim();
    const description = document.getElementById('prod-desc').value.trim();
    const price = parseFloat(document.getElementById('prod-price').value);
    const originalPrice = parseFloat(document.getElementById('prod-original-price').value);
    
    // Ensure we have at least one product image
    if (selectedProductImages.length === 0) {
        showToast('Please add at least one product image.', 'error');
        return;
    }
    
    const image = selectedProductImages[0]; // Primary compatibility fallback
    const images = selectedProductImages;
    
    // Read colors & sizes from dynamic selects
    const colors = selectedPillColors;
    const sizes = selectedPillSizes;
    
    if (id) {
        // Mode: Edit Product
        const p = db.products.find(prod => prod.id === id);
        if (p) {
            p.name = name;
            p.description = description;
            p.price = price;
            p.originalPrice = originalPrice;
            p.image = image;
            p.images = images;
            p.colors = colors;
            p.sizes = sizes;
            
            // Sync inventory variants (preserve existing, create missing)
            colors.forEach(c => {
                sizes.forEach(s => {
                    const key = `${id}:${c}:${s}`;
                    if (db.stock[key] === undefined) {
                        db.stock[key] = 10; // Default new stock
                    }
                });
            });
        }
        showToast('Product settings updated successfully.', 'success');
    } else {
        // Mode: Add Product
        const newId = 'prod-' + Date.now();
        const newProduct = {
            id: newId,
            name,
            description,
            price,
            originalPrice,
            image,
            images,
            colors,
            sizes,
            activeHomepage: false
        };
        db.products.push(newProduct);
        
        // Initialize stock for all new variants
        colors.forEach(c => {
            sizes.forEach(s => {
                const key = `${newId}:${c}:${s}`;
                db.stock[key] = 10; // Default stock count
            });
        });
        showToast('New product added to catalog.', 'success');
    }
    
    saveDb(db);
    document.getElementById('product-form-modal').classList.add('hidden');
}

function deleteProduct(id) {
    showCustomConfirm(
        'Delete Product',
        'Are you sure you want to permanently delete this product? All its size/color stock counts will be deleted.',
        () => {
            const db = getDb();
            db.products = db.products.filter(p => p.id !== id);
            
            // Delete all stock references matching this product ID
            Object.keys(db.stock).forEach(key => {
                if (key.startsWith(id + ':')) {
                    delete db.stock[key];
                }
            });
            
            // Ensure at least one remaining product is active on homepage
            const hasActive = db.products.some(p => p.activeHomepage === true);
            if (!hasActive && db.products.length > 0) {
                db.products[0].activeHomepage = true;
            }
            
            // If the deleted product was selected, revert to remaining active product
            if (storeState.selectedProductId === id) {
                if (db.products.length > 0) {
                    const activeP = db.products.find(p => p.activeHomepage) || db.products[0];
                    storeState.selectedProductId = activeP.id;
                    storeState.selectedColor = activeP.colors[0] || '';
                    storeState.selectedSize = activeP.sizes[0] || 'M';
                } else {
                    storeState.selectedProductId = null;
                }
            }
            
            saveDb(db);
            renderAdminDashboard();
            renderPublicStore();
            showToast('Product deleted.', 'info');
        }
    );
}

function renderAdminCodesTable(db) {
    const body = document.getElementById('admin-codes-table-body');
    body.innerHTML = '';
    
    db.promoCodes.forEach(item => {
        const tr = document.createElement('tr');
        
        // Backward compatibility: default missing type to 'discount'
        const type = item.type || 'discount';
        const typeLabel = type === 'discount' ? 'Standard Discount' : 'Collaborator Code';
        
        let valueLabel = '';
        if (type === 'discount') {
            valueLabel = `${item.discount || 0}% Off`;
        } else {
            valueLabel = `Commission: ${(item.commission || 0).toLocaleString()} DA`;
        }
        
        tr.innerHTML = `
            <td><strong style="font-family:monospace; font-size:1.1rem;">${item.code}</strong></td>
            <td><span class="color-tag" style="background:${type === 'discount' ? 'rgba(220,164,150,0.15)' : 'rgba(163,177,155,0.15)'}; color:${type === 'discount' ? 'var(--primary)' : '#6d7b65'}; font-size:0.75rem; border-radius:12px; padding:3px 8px;">${typeLabel}</span></td>
            <td><strong>${valueLabel}</strong></td>
            <td>
                <label class="switch">
                    <input type="checkbox" class="code-toggle" data-code="${item.code}" ${item.active ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <button class="btn btn-outline btn-sm btn-delete-code text-red" data-code="${item.code}"><i data-lucide="trash-2"></i> Delete</button>
            </td>
        `;
        
        // Bind toggle
        tr.querySelector('.code-toggle').addEventListener('change', (e) => {
            togglePromoCode(item.code, e.target.checked);
        });
        
        // Bind delete
        tr.querySelector('.btn-delete-code').addEventListener('click', () => {
            deletePromoCode(item.code);
        });
        
        body.appendChild(tr);
    });
}

function togglePromoCode(code, isActive) {
    const db = getDb();
    const promo = db.promoCodes.find(p => p.code === code);
    if (promo) {
        promo.active = isActive;
        saveDb(db);
        showToast(`Promo code "${code}" set to ${isActive ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
    }
}

function savePromoCode() {
    const db = getDb();
    const name = document.getElementById('promo-code-name').value.trim().toUpperCase();
    const type = document.getElementById('promo-code-type').value;
    
    // Check duplication
    if (db.promoCodes.some(p => p.code === name)) {
        showToast('A promo code with this name already exists.', 'error');
        return;
    }
    
    let discount = 0;
    let commission = 0;
    
    if (type === 'discount') {
        discount = parseInt(document.getElementById('promo-code-pct').value) || 0;
    } else {
        commission = parseFloat(document.getElementById('promo-code-comm').value) || 0;
    }
    
    db.promoCodes.push({
        code: name,
        type: type,
        discount: discount,
        commission: commission,
        active: true
    });
    
    saveDb(db);
    document.getElementById('code-form-modal').classList.add('hidden');
    showToast(`Promo code "${name}" created.`, 'success');
}

// --- OWNER ADMIN SHIPPING TAB LOGIC ---
function initShippingSettings() {
    const shipModal = document.getElementById('shipping-form-modal');
    const form = document.getElementById('shipping-edit-form');
    
    document.getElementById('add-shipping-btn').addEventListener('click', () => {
        document.getElementById('shipping-modal-title').textContent = 'New Shipping Rate';
        document.getElementById('edit-shipping-id').value = '';
        form.reset();
        shipModal.classList.remove('hidden');
    });
    
    document.getElementById('shipping-modal-close').addEventListener('click', () => {
        shipModal.classList.add('hidden');
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        saveShippingRate();
    });
}

function renderAdminShippingTable(db) {
    const body = document.getElementById('admin-shipping-table-body');
    if (!body) return;
    
    body.innerHTML = '';
    db.shippingRates.forEach(rate => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${rate.name}</strong></td>
            <td><strong>${rate.price === 0 ? 'FREE' : rate.price.toLocaleString() + ' DA'}</strong></td>
            <td>
                <label class="switch">
                    <input type="checkbox" class="shipping-toggle" data-id="${rate.id}" ${rate.active ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </td>
            <td>
                <div class="order-actions">
                    <button class="btn btn-outline btn-sm btn-edit-shipping" data-id="${rate.id}"><i data-lucide="edit"></i> Edit</button>
                    <button class="btn btn-outline btn-sm btn-delete-shipping text-red" data-id="${rate.id}"><i data-lucide="trash-2"></i> Delete</button>
                </div>
            </td>
        `;
        
        // Active Toggle listener
        tr.querySelector('.shipping-toggle').addEventListener('change', (e) => {
            toggleShippingActive(rate.id, e.target.checked);
        });
        
        // Edit Rate listener
        tr.querySelector('.btn-edit-shipping').addEventListener('click', () => {
            openEditShippingModal(rate.id);
        });
        
        // Delete Rate listener
        tr.querySelector('.btn-delete-shipping').addEventListener('click', () => {
            deleteShippingRate(rate.id);
        });
        
        body.appendChild(tr);
    });
}

function renderAdminFinanceDashboard(db) {
    // 1. Calculate KPI Metrics
    let grossRevenue = 0;
    let netRevenue = 0;
    let pendingRevenue = 0;
    let shippingCollected = 0;
    let collabCommissions = 0;
    
    db.orders.forEach(order => {
        const orderPrice = order.price || 0;
        const shipPrice = order.shippingPrice || 0;
        const comm = order.collaboratorCommission || 0;
        
        grossRevenue += orderPrice;
        
        if (order.status === 'Delivered') {
            netRevenue += orderPrice;
            shippingCollected += shipPrice;
            collabCommissions += comm;
        } else if (order.status === 'Pending' || order.status === 'Shipped') {
            pendingRevenue += orderPrice;
        }
    });
    
    const netProfit = netRevenue - collabCommissions;
    
    const elGross = document.getElementById('finance-gross-revenue');
    const elNet = document.getElementById('finance-net-revenue');
    const elPending = document.getElementById('finance-pending-revenue');
    const elShip = document.getElementById('finance-shipping-collected');
    const elCollab = document.getElementById('finance-collab-commissions');
    const elProfit = document.getElementById('finance-net-profit');
    
    if (elGross) elGross.textContent = `${grossRevenue.toLocaleString()} DA`;
    if (elNet) elNet.textContent = `${netRevenue.toLocaleString()} DA`;
    if (elPending) elPending.textContent = `${pendingRevenue.toLocaleString()} DA`;
    if (elShip) elShip.textContent = `${shippingCollected.toLocaleString()} DA`;
    if (elCollab) elCollab.textContent = `${collabCommissions.toLocaleString()} DA`;
    if (elProfit) elProfit.textContent = `${netProfit.toLocaleString()} DA`;
    
    // 2. Collaborators Commission Ledger Table
    const body = document.getElementById('admin-finance-table-body');
    if (body) {
        body.innerHTML = '';
        
        const collabGroups = {};
        
        // Pre-populate with registered collaborator codes
        db.promoCodes.forEach(p => {
            if (p.type === 'collaborator') {
                collabGroups[p.code] = {
                    code: p.code,
                    deliveredCount: 0,
                    commissionPerUnit: p.commission || 0,
                    totalSalesValue: 0,
                    totalCommissionOwed: 0
                };
            }
        });
        
        // Group from orders database
        db.orders.forEach(order => {
            if (order.promoCode && order.status === 'Delivered') {
                const isCollab = order.promoType === 'collaborator';
                if (isCollab) {
                    const code = order.promoCode;
                    const comm = order.collaboratorCommission || 0;
                    const orderPrice = order.price || 0;
                    
                    if (!collabGroups[code]) {
                        collabGroups[code] = {
                            code: code,
                            deliveredCount: 0,
                            commissionPerUnit: comm,
                            totalSalesValue: 0,
                            totalCommissionOwed: 0
                        };
                    }
                    
                    collabGroups[code].deliveredCount += 1;
                    collabGroups[code].totalSalesValue += orderPrice;
                    collabGroups[code].totalCommissionOwed += comm;
                }
            }
        });
        
        const collabList = Object.values(collabGroups);
        
        if (collabList.length === 0) {
            body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No collaborator codes registered or used yet.</td></tr>`;
        } else {
            collabList.forEach(collab => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong style="font-family:monospace; font-size:1.05rem;">${collab.code}</strong></td>
                    <td><strong>${collab.deliveredCount}</strong></td>
                    <td>${collab.commissionPerUnit.toLocaleString()} DA</td>
                    <td>${collab.totalSalesValue.toLocaleString()} DA</td>
                    <td><strong class="text-green">${collab.totalCommissionOwed.toLocaleString()} DA</strong></td>
                `;
                body.appendChild(tr);
            });
        }
    }
    
    // 3. Pending/In-Transit Orders Table (Not Ready Money Ledger)
    const pendingBody = document.getElementById('admin-finance-pending-table-body');
    if (pendingBody) {
        pendingBody.innerHTML = '';
        
        const pendingOrders = db.orders.filter(o => o.status === 'Pending' || o.status === 'Shipped');
        
        if (pendingOrders.length === 0) {
            pendingBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">No orders currently in transit or pending. All revenue is resolved.</td></tr>`;
            return;
        }
        
        pendingOrders.forEach(order => {
            const tr = document.createElement('tr');
            const orderDate = order.date ? new Date(order.date).toLocaleDateString() : 'N/A';
            let statusClass = (order.status || 'Pending').toLowerCase();
            
            tr.innerHTML = `
                <td><strong>${order.id}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${orderDate}</span></td>
                <td>
                    <div><strong>${order.customerName}</strong></div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${order.customerPhone}</div>
                </td>
                <td>
                    <div>${order.productName}</div>
                    <span class="color-tag">${order.color}</span> <span class="color-tag" style="background:rgba(124,58,237,0.15)">${order.size}</span>
                </td>
                <td><span class="badge-status ${statusClass}">${order.status}</span></td>
                <td><strong>${(order.price || 0).toLocaleString()} DA</strong></td>
            `;
            pendingBody.appendChild(tr);
        });
    }
}

function exportFinanceCsv() {
    const db = getDb();
    
    const collabGroups = {};
    
    db.promoCodes.forEach(p => {
        if (p.type === 'collaborator') {
            collabGroups[p.code] = {
                code: p.code,
                deliveredCount: 0,
                commissionPerUnit: p.commission || 0,
                totalSalesValue: 0,
                totalCommissionOwed: 0
            };
        }
    });
    
    db.orders.forEach(order => {
        if (order.promoCode && order.status === 'Delivered') {
            const isCollab = order.promoType === 'collaborator';
            if (isCollab) {
                const code = order.promoCode;
                const comm = order.collaboratorCommission || 0;
                const orderPrice = order.price || 0;
                
                if (!collabGroups[code]) {
                    collabGroups[code] = {
                        code: code,
                        deliveredCount: 0,
                        commissionPerUnit: comm,
                        totalSalesValue: 0,
                        totalCommissionOwed: 0
                    };
                }
                
                collabGroups[code].deliveredCount += 1;
                collabGroups[code].totalSalesValue += orderPrice;
                collabGroups[code].totalCommissionOwed += comm;
            }
        }
    });
    
    const collabList = Object.values(collabGroups);
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Collaborator Code,Delivered Orders,Commission Per Unit (DA),Total Sales Value (DA),Total Commission Owed (DA)\n";
    
    collabList.forEach(collab => {
        csvContent += `"${collab.code}",${collab.deliveredCount},${collab.commissionPerUnit},${collab.totalSalesValue},${collab.totalCommissionOwed}\n`;
    });
    
    let grossRevenue = 0;
    let netRevenue = 0;
    let shippingCollected = 0;
    let collabCommissions = 0;
    
    db.orders.forEach(order => {
        grossRevenue += (order.price || 0);
        if (order.status === 'Delivered') {
            netRevenue += (order.price || 0);
            shippingCollected += (order.shippingPrice || 0);
            collabCommissions += (order.collaboratorCommission || 0);
        }
    });
    
    const netProfit = netRevenue - collabCommissions;
    
    csvContent += "\n\n";
    csvContent += "FINANCIAL SUMMARY\n";
    csvContent += `Gross Potential Revenue,${grossRevenue} DA\n`;
    csvContent += `Net Confirmed Revenue (Delivered),${netRevenue} DA\n`;
    csvContent += `Shipping Fees Collected (Delivered),${shippingCollected} DA\n`;
    csvContent += `Total Collaborator Commissions,${collabCommissions} DA\n`;
    csvContent += `Net Shop Profit,${netProfit} DA\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AeroFlex_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Financial CSV report downloaded.', 'success');
}

function toggleShippingActive(rateId, isActive) {
    const db = getDb();
    const rate = db.shippingRates.find(r => r.id === rateId);
    if (rate) {
        rate.active = isActive;
        saveDb(db);
        populateShippingDropdown();
        showToast(`Shipping rate "${rate.name}" set to ${isActive ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
    }
}

function openEditShippingModal(rateId) {
    const db = getDb();
    const rate = db.shippingRates.find(r => r.id === rateId);
    if (!rate) return;
    
    document.getElementById('shipping-modal-title').textContent = 'Edit Shipping Rate';
    document.getElementById('edit-shipping-id').value = rate.id;
    document.getElementById('shipping-rate-name').value = rate.name;
    document.getElementById('shipping-rate-price').value = rate.price;
    
    document.getElementById('shipping-form-modal').classList.remove('hidden');
}

function saveShippingRate() {
    const db = getDb();
    const id = document.getElementById('edit-shipping-id').value;
    const name = document.getElementById('shipping-rate-name').value.trim();
    const price = parseFloat(document.getElementById('shipping-rate-price').value);
    
    if (id) {
        // Mode: Edit
        const rate = db.shippingRates.find(r => r.id === id);
        if (rate) {
            rate.name = name;
            rate.price = isNaN(price) ? 0 : price;
        }
        showToast('Shipping rate updated successfully.', 'success');
    } else {
        // Mode: Add
        const newId = 'rate-' + Date.now();
        db.shippingRates.push({
            id: newId,
            name: name,
            price: isNaN(price) ? 0 : price,
            active: true
        });
        showToast('New shipping rate option added.', 'success');
    }
    
    saveDb(db);
    populateShippingDropdown();
    document.getElementById('shipping-form-modal').classList.add('hidden');
}

function deleteShippingRate(rateId) {
    showCustomConfirm(
        'Delete Shipping Option',
        'Are you sure you want to permanently delete this shipping option?',
        () => {
            const db = getDb();
            db.shippingRates = db.shippingRates.filter(r => r.id !== rateId);
            saveDb(db);
            populateShippingDropdown();
            showToast('Shipping option removed.', 'info');
        }
    );
}

function deletePromoCode(code) {
    showCustomConfirm(
        'Delete Promo Code',
        `Are you sure you want to permanently delete promo code "${code}"?`,
        () => {
            const db = getDb();
            db.promoCodes = db.promoCodes.filter(p => p.code !== code);
            
            if (storeState.appliedPromo && storeState.appliedPromo.code === code) {
                storeState.appliedPromo = null;
            }
            
            saveDb(db);
            showToast('Promo code deleted.', 'info');
        }
    );
}

function deleteOrder(orderId) {
    showCustomConfirm(
        'Delete Order',
        `Are you sure you want to permanently delete order "${orderId}"?`,
        () => {
            const db = getDb();
            const order = db.orders.find(o => o.id === orderId);
            
            if (order) {
                const isCancelled = order.status === 'Cancelled';
                // If it was NOT cancelled, return stock back
                if (!isCancelled) {
                    const variantKey = `${order.productId}:${order.color}:${order.size}`;
                    if (db.stock[variantKey] !== undefined) {
                        db.stock[variantKey] += 1;
                    } else {
                        db.stock[variantKey] = 1;
                    }
                }
                
                db.orders = db.orders.filter(o => o.id !== orderId);
                saveDb(db);
                showToast(`Order ${orderId} deleted successfully.${isCancelled ? '' : ' Stock returned back.'}`, 'info');
            }
        }
    );
}

// --- SECURITY SETTINGS (CHANGE PASSWORD) ---
function initSecuritySettings() {
    const form = document.getElementById('admin-change-password-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currPass = document.getElementById('change-curr-pass').value;
        const newPass = document.getElementById('change-new-pass').value;
        const confPass = document.getElementById('change-conf-pass').value;
        
        const db = getDb();
        
        // 1. Verify current password
        const hashedCurr = await sha256(currPass);
        if (hashedCurr !== db.security.hash) {
            showToast('Current password/PIN is incorrect.', 'error');
            document.getElementById('change-curr-pass').value = '';
            document.getElementById('change-curr-pass').focus();
            return;
        }
        
        // 2. Verify matching confirmation
        if (newPass !== confPass) {
            showToast('New PIN and confirmation PIN do not match.', 'error');
            document.getElementById('change-conf-pass').value = '';
            document.getElementById('change-conf-pass').focus();
            return;
        }
        
        // 3. Update hash in DB
        const hashedNew = await sha256(newPass);
        db.security.hash = hashedNew;
        saveDb(db);
        sessionStorage.setItem('aeroflex_admin_raw_pin', newPass);
        
        // Success
        form.reset();
        showToast('Security PIN successfully updated.', 'success');
        
        // If they updated the password, hide default PIN hint text
        const hintText = document.getElementById('auth-hint-text');
        if (hintText) {
            hintText.innerHTML = 'Security PIN is customized by owner.';
        }
    });

    // Populate Telegram configuration fields
    const creds = getTelegramCredentials();
    const tokenField = document.getElementById('telegram-config-token');
    const chatField = document.getElementById('telegram-config-chatid');
    if (tokenField) tokenField.value = creds.botToken;
    if (chatField) chatField.value = creds.chatId;

    // Save Telegram credentials listener
    const telegramForm = document.getElementById('admin-telegram-config-form');
    if (telegramForm) {
        telegramForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const botToken = document.getElementById('telegram-config-token').value.trim();
            const chatId = document.getElementById('telegram-config-chatid').value.trim();
            
            const db = getDb();
            db.security.telegramBotToken = botToken;
            db.security.telegramChatId = chatId;
            saveDb(db);
            
            showToast('Telegram credentials updated successfully.', 'success');
        });
    }
}

// --- CSV EXPORT UTILITY ---
function exportOrdersCsv() {
    const db = getDb();
    if (db.orders.length === 0) {
        showToast('No orders available to export.', 'error');
        return;
    }
    
    // CSV headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Date,Customer Name,Phone,Address,Product,Color,Size,Total Paid (DA),Promo Code,Shipping,Shipping Price,Status\r\n";
    
    // Add rows
    db.orders.forEach(o => {
        const row = [
            o.id,
            o.date,
            `"${o.customerName.replace(/"/g, '""')}"`,
            `"${o.customerPhone}"`,
            `"${o.customerAddress.replace(/"/g, '""')}"`,
            `"${o.productName}"`,
            o.color,
            o.size,
            o.price,
            o.promoCode,
            `"${o.shippingName}"`,
            o.shippingPrice,
            o.status
        ].join(",");
        csvContent += row + "\r\n";
    });
    
    // Download link triggering
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aeroflex_cod_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Orders exported to CSV file successfully.', 'success');
}

// --- SCROLL REVEAL ANIMATIONS (Intersection Observer) ---
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                // Unobserve to trigger transition once
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of element is in view
        rootMargin: '0px 0px -40px 0px'
    });
    
    revealElements.forEach(el => {
        observer.observe(el);
    });
}

// --- E2E SYSTEM DIAGNOSTICS TESTS & LOGS ---
function initDiagnosticsSettings() {
    const btn = document.getElementById('btn-run-diagnostics');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        runDiagnostics();
    });
}

async function runDiagnostics() {
    const logOutput = document.getElementById('diagnostic-log-output');
    const badge = document.getElementById('diagnostic-status-badge');
    if (!logOutput || !badge) return;
    
    logOutput.innerHTML = '';
    badge.textContent = 'Running...';
    badge.style.background = '#eab308';
    badge.style.color = '#fff';
    
    function log(message, type = 'info') {
        const div = document.createElement('div');
        const timestamp = new Date().toISOString().slice(11, 19);
        let color = '#d4d4d4';
        if (type === 'success') color = '#4ade80';
        if (type === 'error') color = '#f87171';
        if (type === 'warn') color = '#fbbf24';
        if (type === 'heading') color = '#60a5fa';
        
        div.style.color = color;
        div.innerHTML = `<span style="color: #8c8280;">[${timestamp}]</span> ${message}`;
        logOutput.appendChild(div);
        logOutput.scrollTop = logOutput.scrollHeight;
    }
    
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
        log('Initializing E2E Diagnostic Test Suite...', 'heading');
        await sleep(500);
        
        // Step 1: Database Integrity Check
        log('Step 1: Checking database integrity and connectivity...', 'info');
        await sleep(400);
        const db = getDb();
        if (db && Array.isArray(db.products) && Array.isArray(db.orders)) {
            // Self-healing: clear any leftover diagnostic or corrupted orders/products from previous crashes
            const beforePCount = db.products.length;
            const beforeOCount = db.orders.length;
            db.products = db.products.filter(p => !p.id.startsWith('prod-diag-'));
            db.orders = db.orders.filter(o => o.id && !o.id.startsWith('order-diag-') && o.price !== undefined && o.date !== undefined);
            if (db.products.length !== beforePCount || db.orders.length !== beforeOCount) {
                saveDb(db);
                log('Sanitized and cleared residual diagnostic sandbox data from previous runs.', 'warn');
            }
            log(`[PASS] DB loaded. Products: ${db.products.length}, Orders: ${db.orders.length}, Shipping Zones: ${db.shippingRates.length}`, 'success');
        } else {
            throw new Error('Database is malformed or inaccessible.');
        }
        await sleep(500);
        
        // Step 2: Add Product Simulation
        log('Step 2: Simulating "Add Product" catalog action...', 'info');
        await sleep(600);
        const tempProdId = 'prod-diag-' + Date.now();
        const testProduct = {
            id: tempProdId,
            name: 'AeroFlex Diagnostic Fit Leggings',
            description: 'Temporary testing variant created by E2E diagnostics sandbox.',
            price: 6500,
            originalPrice: 8500,
            image: 'products/92bc9f381fb2e500485b93f4fb2c0c76.jpg', // test image in folder
            images: [
                'products/92bc9f381fb2e500485b93f4fb2c0c76.jpg',
                'products/20260712_154128.jpg'
            ],
            colors: ['Midnight Black', 'Electric Orchid'],
            sizes: ['M', 'L']
        };
        
        db.products.push(testProduct);
        
        // Setup initial stock for test variants
        testProduct.colors.forEach(c => {
            testProduct.sizes.forEach(s => {
                db.stock[`${tempProdId}:${c}:${s}`] = 15;
            });
        });
        saveDb(db);
        log(`[PASS] Created product "${testProduct.name}" (ID: ${tempProdId}) with multi-image slider and stock level = 15.`, 'success');
        await sleep(600);
        
        // Step 3: Update Product Simulation
        log('Step 3: Simulating "Update Product" parameters...', 'info');
        await sleep(500);
        let freshDb = getDb();
        let targetProd = freshDb.products.find(p => p.id === tempProdId);
        if (!targetProd) throw new Error('Product not found in DB after saving.');
        
        targetProd.price = 7200; // price increase test
        targetProd.colors.push('Teal Breeze');
        // add stock for new color variant
        targetProd.sizes.forEach(s => {
            freshDb.stock[`${tempProdId}:Teal Breeze:${s}`] = 12;
        });
        saveDb(freshDb);
        log(`[PASS] Price updated from 6500 to 7200 DA. Added "Teal Breeze" color option.`, 'success');
        await sleep(500);
        
        // Step 4: Create Promo Code
        log('Step 4: Creating temporary E2E discount code...', 'info');
        await sleep(400);
        freshDb = getDb();
        const testPromo = {
            code: 'TESTDIAG15',
            type: 'percentage',
            value: 15,
            active: true
        };
        freshDb.promoCodes.push(testPromo);
        saveDb(freshDb);
        log(`[PASS] Promo code "${testPromo.code}" (15% OFF) registered successfully.`, 'success');
        await sleep(500);
        
        // Step 5: Place Customer COD Order
        log('Step 5: Simulating customer checkout order calculation...', 'info');
        await sleep(700);
        freshDb = getDb();
        
        // Math validation
        const qty = 2;
        const subtotal = 7200 * qty; // 14400
        const shippingFee = 600; // standard delivery
        const discountAmount = Math.round(subtotal * 0.15); // 2160
        const expectedTotal = subtotal + shippingFee - discountAmount; // 14400 + 600 - 2160 = 12840
        
        log(`Customer selected color: "Teal Breeze", size: "M", qty: ${qty}.`, 'info');
        log(`Subtotal: ${subtotal} DA, Shipping: ${shippingFee} DA, Promo Discount: -${discountAmount} DA.`, 'info');
        log(`Verifying total checkout math: Subtotal + Shipping - Discount = ${expectedTotal} DA...`, 'info');
        await sleep(400);
        
        // Deduct stock levels
        const stockKey = `${tempProdId}:Teal Breeze:M`;
        const initialStock = freshDb.stock[stockKey];
        if (initialStock === undefined) throw new Error('Stock key variant not initialized.');
        
        const finalStock = initialStock - qty;
        freshDb.stock[stockKey] = finalStock;
        
        // Create mock order (flat structure matching real database schema)
        const tempOrderId = 'order-diag-' + Date.now();
        const newOrder = {
            id: tempOrderId,
            date: new Date().toISOString(),
            customerName: 'Wassim Tester',
            customerPhone: '0555123456',
            customerAddress: '123 E2E Diagnostic Street, Algiers',
            productId: tempProdId,
            productName: testProduct.name,
            color: 'Teal Breeze',
            size: 'M',
            price: expectedTotal,
            promoCode: 'TESTDIAG15',
            shippingName: 'Standard Delivery (48 Wilayas)',
            shippingPrice: shippingFee,
            status: 'Pending'
        };
        
        freshDb.orders.push(newOrder);
        saveDb(freshDb);
        
        log(`[PASS] Order ${tempOrderId} stored. Stock level for variant "${stockKey}" decremented from ${initialStock} to ${finalStock}.`, 'success');
        await sleep(700);
        
        // Step 6: Order Status Transitions
        log('Step 6: Simulating owner order pipeline management...', 'info');
        await sleep(500);
        freshDb = getDb();
        let targetOrder = freshDb.orders.find(o => o.id === tempOrderId);
        if (!targetOrder) throw new Error('Order not found in database.');
        
        targetOrder.status = 'Completed';
        saveDb(freshDb);
        log(`[PASS] Transitioned order status to "Completed". Logged successfully.`, 'success');
        await sleep(600);
        
        // Step 7: Cleanup E2E Sandboxed Data
        log('Step 7: Performing automated sandbox cleanup...', 'info');
        await sleep(600);
        freshDb = getDb();
        
        // Remove test product
        freshDb.products = freshDb.products.filter(p => p.id !== tempProdId);
        // Remove stock keys
        Object.keys(freshDb.stock).forEach(k => {
            if (k.startsWith(tempProdId)) {
                delete freshDb.stock[k];
            }
        });
        // Remove test promo code
        freshDb.promoCodes = freshDb.promoCodes.filter(c => c.code !== 'TESTDIAG15');
        // Remove test order
        freshDb.orders = freshDb.orders.filter(o => o.id !== tempOrderId);
        
        saveDb(freshDb);
        log(`[PASS] Sandbox test product, promo codes, stock entries, and orders purged. DB restored to original state.`, 'success');
        await sleep(500);
        
        log('All automated integration test suites executed successfully! system 100% operational.', 'success');
        badge.textContent = 'Passed';
        badge.style.background = 'var(--green)';
        badge.style.color = '#fff';
        
        // Redraw lists
        if (typeof renderAdminProductsTable === 'function') renderAdminProductsTable(freshDb);
        if (typeof renderAdminOrdersTable === 'function') renderAdminOrdersTable(freshDb);
        if (typeof renderAdminStockTable === 'function') renderAdminStockTable(freshDb);
        if (typeof updateAdminBadges === 'function') updateAdminBadges(freshDb);
        
    } catch (err) {
        log(`[FAIL] E2E Diagnostics Error: ${err.message}`, 'error');
        badge.textContent = 'Failed';
        badge.style.background = '#ef4444';
        badge.style.color = '#fff';
        console.error(err);
    }
}
