(function(){
  const MENU = {
    kopi: [
      { id: 'esp', name: 'Espresso', desc: 'Shot pekat, sedikit crema di atasnya.', price: 18000 },
      { id: 'ame', name: 'Americano', desc: 'Espresso dengan air panas, ringan dan bersih.', price: 22000 },
      { id: 'cap', name: 'Cappuccino', desc: 'Espresso, susu steam, dan busa tebal.', price: 27000 },
      { id: 'lat', name: 'Cafe Latte', desc: 'Espresso dengan susu steam yang lembut.', price: 28000 },
      { id: 'ksga', name: 'Kopi Susu Gula Aren', desc: 'Kopi robusta, susu, dan gula aren asli.', price: 24000 },
      { id: 'eks', name: 'Es Kopi Susu', desc: 'Versi dingin dari kopi susu klasik.', price: 25000 },
    ],
    nonkopi: [
      { id: 'mat', name: 'Matcha Latte', desc: 'Matcha Uji dengan susu segar.', price: 30000 },
      { id: 'rvl', name: 'Red Velvet Latte', desc: 'Cokelat lembut dengan sentuhan vanila.', price: 30000 },
      { id: 'tea', name: 'Es Teh Manis', desc: 'Teh hitam seduh, manis pas.', price: 12000 },
      { id: 'cho', name: 'Hot Chocolate', desc: 'Cokelat panas dari dark chocolate asli.', price: 26000 },
    ],
    roti: [
      { id: 'crs', name: 'Croissant Mentega', desc: 'Berlapis, renyah di luar, lembut di dalam.', price: 20000 },
      { id: 'sdb', name: 'Roti Sourdough', desc: 'Fermentasi alami, kulit tebal dan renyah.', price: 23000 },
      { id: 'pac', name: 'Pain au Chocolat', desc: 'Croissant isi dua batang cokelat.', price: 22000 },
      { id: 'ban', name: 'Banana Bread', desc: 'Lembab, manis alami dari pisang matang.', price: 19000 },
      { id: 'rbc', name: 'Roti Bakar Coklat Keju', desc: 'Roti panggang isi cokelat dan keju leleh.', price: 21000 },
    ]
  };

  const fmt = (n) => 'Rp' + n.toLocaleString('id-ID');

  // ---- Render menu grids ----
  function renderMenu() {
    for (const cat in MENU) {
      const grid = document.getElementById('grid-' + cat);
      grid.innerHTML = MENU[cat].map(item => `
        <div class="item-card">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
          <div class="item-row">
            <span class="item-price">${fmt(item.price)}</span>
            <button class="add-btn" data-id="${item.id}">Tambah</button>
          </div>
        </div>
      `).join('');
    }
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addToCart(btn.dataset.id);
        btn.textContent = 'Ditambahkan';
        btn.classList.add('added');
        setTimeout(() => { btn.textContent = 'Tambah'; btn.classList.remove('added'); }, 900);
      });
    });
  }

  function findItem(id) {
    for (const cat in MENU) {
      const found = MENU[cat].find(i => i.id === id);
      if (found) return found;
    }
    return null;
  }

  // ---- Cart state ----
  let cart = {};
  try {
    const saved = localStorage.getItem('mrcoffee_cart');
    if (saved) cart = JSON.parse(saved);
  } catch (e) { cart = {}; }

  function saveCart() {
    try { localStorage.setItem('mrcoffee_cart', JSON.stringify(cart)); } catch (e) {}
  }

  function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    saveCart();
    updateBadge();
    if (drawerView === 'cart') renderDrawer('cart');
  }

  function setQty(id, qty) {
    if (qty <= 0) { delete cart[id]; } else { cart[id] = qty; }
    saveCart();
    updateBadge();
    renderDrawer('cart');
  }

  function cartCount() {
    return Object.values(cart).reduce((a,b) => a+b, 0);
  }
  function cartTotal() {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = findItem(id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }

  function updateBadge() {
    document.getElementById('cartBadge').textContent = cartCount();
  }

  // ---- Drawer ----
  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('drawer');
  const drawerContent = document.getElementById('drawerContent');
  let drawerView = 'cart';

  function openDrawer(view) {
    drawerView = view || 'cart';
    renderDrawer(drawerView);
    overlay.classList.add('open');
    drawer.classList.add('open');
  }
  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
  }
  overlay.addEventListener('click', closeDrawer);
  document.getElementById('cartOpenBtn').addEventListener('click', () => openDrawer('cart'));
  document.getElementById('heroCartBtn').addEventListener('click', () => openDrawer('cart'));

  function renderDrawer(view) {
    drawerView = view;
    if (view === 'cart') renderCartView();
    else if (view === 'checkout') renderCheckoutView();
    else if (view === 'confirm') renderConfirmView(window.__lastOrder);
  }

  function renderCartView() {
    const ids = Object.keys(cart);
    let linesHtml = '';
    if (ids.length === 0) {
      linesHtml = `<div class="empty-cart">Keranjang masih kosong.<br>Yuk pilih menu favoritmu dulu.</div>`;
    } else {
      linesHtml = ids.map(id => {
        const item = findItem(id);
        if (!item) return '';
        const qty = cart[id];
        return `
          <div class="cart-line">
            <div class="cart-line-info">
              <div class="cart-line-name">${item.name}</div>
              <div class="cart-line-price">${fmt(item.price)} · Subtotal ${fmt(item.price*qty)}</div>
            </div>
            <div class="qty-control">
              <button data-act="dec" data-id="${id}" aria-label="Kurangi">−</button>
              <span>${qty}</span>
              <button data-act="inc" data-id="${id}" aria-label="Tambah">+</button>
            </div>
            <button class="remove-line" data-act="rm" data-id="${id}">Hapus</button>
          </div>
        `;
      }).join('');
    }

    drawerContent.innerHTML = `
      <div class="drawer-head">
        <h2>Keranjang</h2>
        <button class="drawer-close" id="closeBtn" aria-label="Tutup">&times;</button>
      </div>
      <div class="drawer-body">${linesHtml}</div>
      <div class="drawer-foot">
        <div class="total-row">
          <span class="label">Total</span>
          <span class="amount">${fmt(cartTotal())}</span>
        </div>
        <button class="checkout-btn" id="toCheckoutBtn" ${ids.length===0 ? 'disabled' : ''}>Checkout</button>
      </div>
    `;
    document.getElementById('closeBtn').addEventListener('click', closeDrawer);
    drawerContent.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (btn.dataset.act === 'inc') setQty(id, (cart[id]||0)+1);
        if (btn.dataset.act === 'dec') setQty(id, (cart[id]||0)-1);
        if (btn.dataset.act === 'rm') setQty(id, 0);
      });
    });
    const toCheckout = document.getElementById('toCheckoutBtn');
    if (toCheckout) toCheckout.addEventListener('click', () => renderDrawer('checkout'));
  }

  function renderCheckoutView() {
    drawerContent.innerHTML = `
      <div class="drawer-head">
        <h2>Checkout</h2>
        <button class="drawer-close" id="closeBtn" aria-label="Tutup">&times;</button>
      </div>
      <div class="drawer-body">
        <button class="back-link" id="backToCart">&larr; Kembali ke keranjang</button>
        <form id="checkoutForm">
          <div class="form-group">
            <label for="fname">Nama</label>
            <input id="fname" required placeholder="Nama kamu">
            <div class="field-error" id="fnameError">Nama wajib diisi.</div>
          </div>
          <div class="form-group">
            <label for="fphone">No. HP</label>
            <input id="fphone" required placeholder="0812xxxxxxx" inputmode="tel">
            <div class="field-error" id="fphoneError">No. HP wajib diisi.</div>
          </div>
          <div class="form-group">
            <label>Metode</label>
            <div class="method-toggle">
              <label><input type="radio" name="method" value="Ambil di toko" checked><span>Ambil di toko</span></label>
              <label><input type="radio" name="method" value="Diantar"><span>Diantar</span></label>
            </div>
          </div>
          <div class="form-group" id="addressGroup" style="display:none;">
            <label for="faddr">Alamat pengantaran</label>
            <textarea id="faddr" placeholder="Alamat lengkap"></textarea>
            <div class="field-error" id="faddrError">Alamat wajib diisi untuk pengantaran.</div>
          </div>
          <div class="form-group">
            <label for="fnote">Catatan (opsional)</label>
            <textarea id="fnote" placeholder="Contoh: less sugar, tanpa es"></textarea>
          </div>
        </form>
      </div>
      <div class="drawer-foot">
        <div class="total-row">
          <span class="label">Total bayar</span>
          <span class="amount">${fmt(cartTotal())}</span>
        </div>
        <button class="checkout-btn" id="placeOrderBtn">Pesan sekarang</button>
      </div>
    `;
    document.getElementById('closeBtn').addEventListener('click', closeDrawer);
    document.getElementById('backToCart').addEventListener('click', () => renderDrawer('cart'));
    document.querySelectorAll('input[name="method"]').forEach(r => {
      r.addEventListener('change', () => {
        document.getElementById('addressGroup').style.display = r.value === 'Diantar' && r.checked ? 'block' : 'none';
      });
    });
    // Clear an error as soon as the person starts fixing it
    ['fname','fphone','faddr'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
        e.target.classList.remove('invalid');
        document.getElementById(id + 'Error').classList.remove('show');
      });
    });

    document.getElementById('placeOrderBtn').addEventListener('click', () => {
      const nameEl = document.getElementById('fname');
      const phoneEl = document.getElementById('fphone');
      const addrEl = document.getElementById('faddr');
      const name = nameEl.value.trim();
      const phone = phoneEl.value.trim();
      const method = document.querySelector('input[name="method"]:checked').value;
      const addr = addrEl.value.trim();
      const note = document.getElementById('fnote').value.trim();

      // Reset error states first
      [nameEl, phoneEl, addrEl].forEach(el => el.classList.remove('invalid'));
      ['fnameError','fphoneError','faddrError'].forEach(id => document.getElementById(id).classList.remove('show'));

      let hasError = false;
      let firstInvalid = null;
      if (!name) {
        nameEl.classList.add('invalid');
        document.getElementById('fnameError').classList.add('show');
        hasError = true;
        firstInvalid = firstInvalid || nameEl;
      }
      if (!phone) {
        phoneEl.classList.add('invalid');
        document.getElementById('fphoneError').classList.add('show');
        hasError = true;
        firstInvalid = firstInvalid || phoneEl;
      }
      if (method === 'Diantar' && !addr) {
        addrEl.classList.add('invalid');
        document.getElementById('faddrError').classList.add('show');
        hasError = true;
        firstInvalid = firstInvalid || addrEl;
      }
      if (hasError) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const order = {
        id: 'MC-' + Math.floor(100000 + Math.random()*899999),
        name, phone, method, addr, note,
        items: Object.entries(cart).map(([id, qty]) => {
          const item = findItem(id);
          return { name: item.name, qty, price: item.price };
        }),
        total: cartTotal(),
        time: new Date().toLocaleString('id-ID')
      };
      window.__lastOrder = order;
      try {
        const history = JSON.parse(localStorage.getItem('mrcoffee_orders') || '[]');
        history.unshift(order);
        localStorage.setItem('mrcoffee_orders', JSON.stringify(history.slice(0, 20)));
      } catch (e) {}
      cart = {};
      saveCart();
      updateBadge();
      renderDrawer('confirm');
      showToast('Pesanan berhasil dibuat! Nomor: ' + order.id);
    });
  }

  // ---- Toast ----
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = message;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function renderConfirmView(order) {
    if (!order) { renderDrawer('cart'); return; }
    const itemsHtml = order.items.map(i => `<div class="cart-line-price">${i.qty}× ${i.name}</div>`).join('');
    drawerContent.innerHTML = `
      <div class="drawer-head">
        <h2>Pesanan diterima</h2>
        <button class="drawer-close" id="closeBtn" aria-label="Tutup">&times;</button>
      </div>
      <div class="drawer-body">
        <div class="confirm">
          <div class="icon">✓</div>
          <h3>Terima kasih, ${order.name}!</h3>
          <p>Pesananmu sudah kami terima dan sedang disiapkan.<br>${order.method === 'Diantar' ? 'Akan diantar ke alamatmu.' : 'Silakan ambil di toko dalam 10–15 menit.'}</p>
          <div class="order-id">${order.id}</div>
          <div style="margin-top:18px; text-align:left;">${itemsHtml}</div>
        </div>
      </div>
      <div class="drawer-foot">
        <div class="total-row">
          <span class="label">Total dibayar</span>
          <span class="amount">${fmt(order.total)}</span>
        </div>
        <button class="checkout-btn" id="closeConfirmBtn">Selesai</button>
      </div>
    `;
    document.getElementById('closeBtn').addEventListener('click', closeDrawer);
    document.getElementById('closeConfirmBtn').addEventListener('click', closeDrawer);
  }

  renderMenu();
  updateBadge();
})();
