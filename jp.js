// Star Pro Ice Cream - Core Logic

// Business Configuration
const CONFIG = {
    businessName: "Star Pro Ice Cream",
    upiId: "7904410087@paytm", // UPDATED: This is the destination for payments
    whatsappNumber: "917904410087"
};

// Data Stores
const DB = {
    customers: JSON.parse(localStorage.getItem('starpro_customers')) || [],
    orders: JSON.parse(localStorage.getItem('starpro_orders')) || [],
    users: JSON.parse(localStorage.getItem('starpro_users')) || [
        { username: 'admin', password: '123', role: 'Owner', name: 'Star Pro Owner' }
    ],

    saveCustomers: () => {
        localStorage.setItem('starpro_customers', JSON.stringify(DB.customers));
    },

    saveOrders: () => {
        localStorage.setItem('starpro_orders', JSON.stringify(DB.orders));
    },

    saveUsers: () => {
        localStorage.setItem('starpro_users', JSON.stringify(DB.users));
    }
};

// Utils
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
};

// Auth Guard
const checkAuth = () => {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path === '/' || path.endsWith('/');
    const isLandingPage = path.endsWith('home.html');
    const currentUser = JSON.parse(localStorage.getItem('starpro_user'));

    if (!currentUser && !isLoginPage && !isLandingPage) {
        window.location.href = 'index.html';
    } else if (currentUser && isLoginPage) {
        window.location.href = 'home.html';
    }
};

// Login (Updated as per user request: Name, Phone, Email)
const handleLogin = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    const user = {
        name,
        phone,
        email,
        role: 'Customer', // Default role
        username: phone
    };

    localStorage.setItem('starpro_user', JSON.stringify(user));

    // Also add to customers list if not already there
    if (!DB.customers.find(c => c.phone === phone)) {
        const newCustomer = {
            id: Date.now(),
            name,
            phone,
            email,
            joined: new Date().toISOString(),
            address: '',
            location: null
        };
        DB.customers.unshift(newCustomer);
        DB.saveCustomers();
    }

    window.location.href = 'home.html';
};

// Signup (Customer)
const handleSignup = (e) => {
    e.preventDefault();
    const name = document.getElementById('s-name').value;
    const phone = document.getElementById('s-phone').value;
    const password = document.getElementById('s-password').value;

    if (DB.users.find(u => u.phone === phone)) {
        alert('Mobile number already registered!');
        return;
    }

    const newUser = {
        name,
        phone,
        password,
        role: 'Customer',
        username: phone // Using phone as username for customers
    };

    DB.users.push(newUser);
    DB.saveUsers();

    // Also add to customers list
    const newCustomer = {
        id: Date.now(),
        name,
        phone,
        joined: new Date().toISOString(),
        address: '',
        location: null
    };
    DB.customers.unshift(newCustomer);
    DB.saveCustomers();

    alert('Registration successful! Welcome to Star Pro 🍦');
    localStorage.setItem('starpro_user', JSON.stringify(newUser));
    window.location.href = 'dashboard.html';
};

// Logout
const handleLogout = () => {
    localStorage.removeItem('starpro_user');
    window.location.href = 'index.html';
};

// Add Customer (Admin function)
const addCustomer = (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value;
    const phone = document.getElementById('c-phone').value;
    const address = document.getElementById('c-address').value;

    const newCustomer = {
        id: Date.now(),
        name,
        phone,
        address,
        joined: new Date().toISOString()
    };

    DB.customers.unshift(newCustomer);
    DB.saveCustomers();

    alert(`Customer ${name} saved successfully! 🌟`);
    e.target.reset();

    if (window.location.pathname.endsWith('customers.html')) {
        renderCustomers();
    }
};

// Create Order
const createOrder = (e) => {
    e.preventDefault();
    const item = document.getElementById('o-item').value;
    const amount = parseFloat(document.getElementById('o-amount').value);
    const user = JSON.parse(localStorage.getItem('starpro_user'));

    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    btn.disabled = true;

    setTimeout(() => {
        const newOrder = {
            id: Date.now(),
            customerName: user.name,
            item,
            amount,
            date: new Date().toISOString(),
            status: 'Placed',
            paymentStatus: 'Success'
        };

        DB.orders.unshift(newOrder);
        DB.saveOrders();

        // WhatsApp Integration
        const message = `🌟 *New Order Received!* 🌟\n\n👤 *Customer:* ${user.name}\n🍦 *Item:* ${item}\n💰 *Total:* ₹${amount}\n\nPlease check the dashboard for details! 🍦`;
        const whatsappUrl = `https://wa.me/917904410087?text=${encodeURIComponent(message)}`;

        alert('Order Placed! 🍦 Total: ' + formatCurrency(amount));
        e.target.reset();
        btn.innerHTML = originalText;
        btn.disabled = false;

        window.location.href = whatsappUrl;
    }, 1500);
};

// Render Functions
const renderCustomers = () => {
    const list = document.getElementById('customer-list');
    if (!list) return;

    list.innerHTML = DB.customers.map(c => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <h3 style="color: var(--primary)">${c.name}</h3>
                <span style="font-size: 0.7rem; color: var(--text-muted); padding: 0.2rem 0.5rem; background: #eee; border-radius: 5px;">#${c.id.toString().slice(-4)}</span>
            </div>
            <div style="margin: 1rem 0; display: grid; gap: 0.5rem;">
                <p style="font-size: 0.9rem;">📞 ${c.phone}</p>
                <p style="font-size: 0.9rem;">📱 ${c.altPhone || 'No alternate number'}</p>
                <p style="font-size: 0.85rem; color: var(--text-muted);">📍 ${c.address || 'Address not set'}</p>
            </div>
            <div style="font-size: 0.75rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); color: var(--text-muted)">
                Joined: ${formatDate(c.joined)}
            </div>
        </div>
    `).join('');
};

const renderOrders = () => {
    const tbody = document.getElementById('orders-table-body');
    const totalEl = document.getElementById('total-sales');
    if (!tbody) return;

    const userData = JSON.parse(localStorage.getItem('starpro_user'));
    const filteredOrders = userData.role === 'Customer'
        ? DB.orders.filter(o => o.customerPhone === userData.phone)
        : DB.orders;

    tbody.innerHTML = filteredOrders.map(o => `
        <tr>
            <td>#${o.id.toString().slice(-6)}</td>
            <td>
                <div style="font-weight: 600;">${o.customer || o.customerName}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${formatDate(o.date)}</div>
            </td>
            <td style="font-size: 0.85rem;">${Array.isArray(o.items) ? o.items.join(', ') : o.item}</td>
            <td><span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span></td>
            <td style="font-size: 0.85rem;"><i class="fas fa-check-circle" style="color: #4caf50;"></i> ${o.method || 'GPay'}</td>
            <td style="color: var(--primary); font-weight: 700;">₹${o.total || o.amount}</td>
        </tr>
    `).join('');

    if (filteredOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">No orders found.</td></tr>`;
    }

    if (totalEl && userData.role === 'Owner') {
        const total = filteredOrders.reduce((sum, o) => sum + (o.total || o.amount), 0);
        totalEl.innerText = formatCurrency(total);
    }
};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    // Background Animation - Floating Stars
    const createFloatingStars = () => {
        const bg = document.createElement('div');
        bg.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:-1; overflow:hidden;';
        document.body.appendChild(bg);

        const icons = ['fa-star', 'fa-ice-cream', 'fa-heart', 'fa-circle'];
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('i');
            star.className = `fas ${icons[Math.floor(Math.random() * icons.length)]} star-decoration`;
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.fontSize = (Math.random() * 20 + 10) + 'px';
            star.style.animationDelay = Math.random() * 5 + 's';
            star.style.animationDuration = (Math.random() * 5 + 3) + 's';
            star.style.color = i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)';
            star.style.opacity = '0.3';
            bg.appendChild(star);
        }
    };
    createFloatingStars();

    // Celebration Animation (Confetti & Truck)
    window.celebrate = (targetUrl) => {
        // Create Confetti
        const colors = ['#f48fb1', '#81d4fa', '#fff9c4', '#66bb6a', '#ffa726', '#ba68c8'];
        for (let i = 0; i < 60; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-5vh';
            confetti.style.width = (Math.random() * 8 + 5) + 'px';
            confetti.style.height = (Math.random() * 15 + 10) + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '2px';
            confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }

        // Create Ice Cream Truck
        const truck = document.createElement('div');
        truck.className = 'truck-anim';
        truck.innerHTML = '<i class="fas fa-truck-fast"></i> <i class="fas fa-ice-cream" style="font-size: 1.5rem; position: absolute; top: -10px; left: 20px;"></i>';
        truck.style.animation = 'truckMove 3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        document.body.appendChild(truck);
        setTimeout(() => truck.remove(), 3500);

        // Redirect after delay if URL provided
        if (targetUrl) {
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 800);
        }
    };

    const userData = JSON.parse(localStorage.getItem('starpro_user'));
    if (userData) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.innerText = userData.name;

        // Role based UI adjustments
        if (userData.role === 'Customer') {
            document.body.classList.add('role-customer');
        } else {
            document.body.classList.add('role-owner');
        }
    }

    const toggle = document.querySelector('.mobile-nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            toggle.innerHTML = sidebar.classList.contains('active') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        });
    }

    if (document.getElementById('customer-list')) renderCustomers();
    if (document.getElementById('orders-table-body')) renderOrders();
});
