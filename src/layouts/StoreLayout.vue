<template>
  <div class="store-layout">
    <!-- Top Announcement Bar -->
    <div class="store-announcement">
      <div class="layout-container announcement-content">
        <div class="announcement-ticker">
          <span class="ticker-tag">OFFICIAL ARCHIVE</span>
          <span class="ticker-text">CAM KẾT 100% CHÍNH HÃNG • MIỄN PHÍ VẬN CHUYỂN ĐƠN TỪ 1.000.000₫ • ĐỔI TRẢ TRONG 7 NGÀY</span>
        </div>
        <div class="announcement-links">
          <router-link to="/tracking" class="top-nav-link">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Tra cứu đơn
          </router-link>
          <span class="top-nav-sep">•</span>
          <button v-if="!authStore.isAuthenticated" class="top-nav-link text-btn" @click="openAuthModal('login')">
            Đăng nhập / Đăng ký
          </button>
          <button v-else class="top-nav-link text-btn" @click="openAuthModal('login')">
            Hi, {{ authStore.user?.fullName?.split(' ').slice(-1)[0] || authStore.user?.username }}
          </button>
          <template v-if="isStaffOrAdmin">
            <span class="top-nav-sep">•</span>
            <router-link to="/dashboard" class="top-nav-link portal-link">
              Kênh Quản Trị
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="store-header" :class="{ 'scrolled': isScrolled }">
      <div class="layout-container header-container">
        <!-- Brand Logo -->
        <router-link to="/" class="store-logo">
          <span class="logo-mark">S</span>
          <div class="logo-text">
            <span class="brand-title">SNEAKERHUB</span>
            <span class="brand-sub">ARCHIVE & STREETWEAR</span>
          </div>
        </router-link>

        <!-- Center Nav Links -->
        <nav class="nav-links">
          <router-link to="/" class="nav-item" exact-active-class="active">
            Trang chủ
          </router-link>
          <router-link to="/shop" class="nav-item" active-class="active">
            Bộ sưu tập
          </router-link>
          <button class="nav-item wishlist-nav-btn" @click="showWishlist = true">
            Yêu thích
            <span v-if="wishlistStore.count > 0" class="nav-badge">{{ wishlistStore.count }}</span>
          </button>
          <router-link to="/tracking" class="nav-item" active-class="active">
            Tra cứu đơn
          </router-link>
          <button class="nav-item size-guide-btn" @click="showSizeGuide = true">
            Bảng Size
          </button>
        </nav>

        <!-- Right Utilities -->
        <div class="header-actions">
          <!-- Search Bar -->
          <div class="search-wrap">
            <svg class="search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              v-model="searchKeyword"
              placeholder="Tìm Nike, Jordan, Samba..."
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </div>

          <!-- Wishlist Trigger -->
          <button class="wishlist-trigger" @click="showWishlist = true" aria-label="Sản phẩm yêu thích" title="Danh sách yêu thích">
            <div class="wishlist-icon-box">
              <svg class="heart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span v-if="wishlistStore.count > 0" class="wishlist-counter">
                {{ wishlistStore.count }}
              </span>
            </div>
            <span class="wishlist-lbl">YÊU THÍCH</span>
          </button>

          <!-- Account / User Auth Trigger -->
          <button class="account-trigger" @click="openAuthModal('login')" aria-label="Tài khoản">
            <template v-if="authStore.isAuthenticated">
              <span class="user-avatar-mini">{{ userInitials }}</span>
              <span class="user-name-short">{{ authStore.user?.fullName?.split(' ').slice(-1)[0] || authStore.user?.username }}</span>
            </template>
            <template v-else>
              <svg class="account-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span class="account-lbl">TÀI KHOẢN</span>
            </template>
          </button>

          <!-- Bag / Cart -->
          <router-link to="/cart" class="cart-trigger" aria-label="Giỏ hàng">
            <div class="bag-icon-box">
              <svg class="bag-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span v-if="cartStore.totalItems > 0" class="bag-counter">
                {{ cartStore.totalItems }}
              </span>
            </div>
            <div class="bag-info" v-if="cartStore.totalItems > 0">
              <span class="bag-price">{{ formatCurrency(cartStore.totalPrice) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="store-main">
      <router-view />
    </main>

    <!-- Editorial Minimalist Footer -->
    <footer class="store-footer">
      <div class="layout-container">
        <div class="footer-top-grid">
          <div class="footer-col brand-col">
            <div class="footer-brand">
              <span class="footer-logo-mark">S</span>
              <span class="footer-logo-title">SNEAKERHUB</span>
            </div>
            <p class="footer-desc">
              Không gian phân phối và tuyển chọn Sneaker chính hãng, kết nối văn hóa đường phố và tinh thần thiết kế đương đại. Mọi đôi giày xuất kho đều được kiểm định nguồn gốc nghiêm ngặt.
            </p>
            <div class="footer-legit-stamp">
              <span class="stamp-dot"></span>
              <span>100% VERIFIED AUTHENTIC</span>
            </div>
          </div>

          <div class="footer-col">
            <h4 class="col-heading">DANH MỤC</h4>
            <ul class="col-list">
              <li><router-link to="/shop?brand=1">Nike Sneakers</router-link></li>
              <li><router-link to="/shop?brand=2">Adidas Originals</router-link></li>
              <li><router-link to="/shop?brand=7">Air Jordan Retro</router-link></li>
              <li><router-link to="/shop?brand=5">New Balance</router-link></li>
              <li><router-link to="/shop?brand=3">Puma Streetwear</router-link></li>
              <li><router-link to="/shop?brand=6">Vans Classic</router-link></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-heading">DỊCH VỤ</h4>
            <ul class="col-list">
              <li><router-link to="/tracking">Tra cứu vận đơn</router-link></li>
              <li><a href="javascript:void(0)" @click="showSizeGuide = true">Bảng quy đổi Size giày</a></li>
              <li><router-link to="/cart">Giỏ hàng của bạn</router-link></li>
              <li><router-link to="/login">Cổng quản trị nội bộ</router-link></li>
            </ul>
          </div>

          <div class="footer-col contact-col">
            <h4 class="col-heading">CỬA HÀNG</h4>
            <p class="address-text">
              SneakerHub Flagship Store<br />
              123 Phố Huế, Hai Bà Trưng, Hà Nội<br />
              Hotline: 1900 6868 (09:00 - 22:00)<br />
              Email: contact@sneakerhub.vn
            </p>
            <div class="payment-badges">
              <span class="pay-tag">VIETQR</span>
              <span class="pay-tag">COD</span>
              <span class="pay-tag">NAPAS</span>
              <span class="pay-tag">VISA</span>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>© 2026 SNEAKERHUB PRO. All rights reserved. Designed for sneakerheads with passion & precision.</p>
          <div class="legal-links">
            <span>Chính sách bảo mật</span>
            <span>Điều khoản dịch vụ</span>
            <span>Cam kết đổi trả</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Clean Size Guide Modal -->
    <el-dialog
      v-model="showSizeGuide"
      title="BẢNG QUY ĐỔI KÍCH THƯỚC GIÀY CHUẨN (SIZE CHART)"
      width="640px"
      class="custom-size-dialog"
    >
      <div class="dialog-content">
        <p class="dialog-tip">
          Đo chiều dài bàn chân từ gót chân đến ngón dài nhất để lựa chọn size chính xác nhất:
        </p>
        <el-table :data="sizeGuideData" border stripe class="size-table">
          <el-table-column prop="eu" label="EU (VN)" align="center" width="90" />
          <el-table-column prop="us" label="US Men" align="center" width="90" />
          <el-table-column prop="uk" label="UK" align="center" width="90" />
          <el-table-column prop="cm" label="Chiều dài bàn chân" align="center" />
        </el-table>
      </div>
    </el-dialog>

    <!-- Client Login / Register / Profile Modal -->
    <ClientAuthModal v-model="authModalVisible" :initial-tab="authModalTab" />

    <!-- Wishlist Drawer -->
    <WishlistDrawer v-model="showWishlist" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useWishlistStore } from '@/stores/wishlist'
import { formatCurrency } from '@/utils/formatters'
import ClientAuthModal from '@/components/store/ClientAuthModal.vue'
import WishlistDrawer from '@/components/store/WishlistDrawer.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()

const searchKeyword = ref('')
const isScrolled = ref(false)
const showSizeGuide = ref(false)
const showWishlist = ref(false)
const authModalVisible = ref(false)
const authModalTab = ref('login')

const isStaffOrAdmin = computed(() => authStore.isAdmin || authStore.isManager || authStore.isStaff)

const userInitials = computed(() => {
  const name = authStore.user?.fullName || authStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})

const openAuthModal = (tab = 'login') => {
  authModalTab.value = tab
  authModalVisible.value = true
}

const sizeGuideData = [
  { eu: '36', us: '4.0', uk: '3.5', cm: '22.5 cm' },
  { eu: '37', us: '5.0', uk: '4.5', cm: '23.0 cm' },
  { eu: '38', us: '5.5', uk: '5.0', cm: '24.0 cm' },
  { eu: '39', us: '6.5', uk: '6.0', cm: '24.5 cm' },
  { eu: '40', us: '7.0', uk: '6.0', cm: '25.0 cm' },
  { eu: '41', us: '8.0', uk: '7.0', cm: '26.0 cm' },
  { eu: '42', us: '8.5', uk: '7.5', cm: '26.5 cm' },
  { eu: '43', us: '9.5', uk: '8.5', cm: '27.5 cm' },
  { eu: '44', us: '10.0', uk: '9.0', cm: '28.0 cm' },
  { eu: '45', us: '11.0', uk: '10.0', cm: '29.0 cm' }
]

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/shop', query: { q: searchKeyword.value.trim() } })
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

.store-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #0a0a0a;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.layout-container {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
}

/* Announcement Ticker */
.store-announcement {
  background: #000000;
  color: #a3a3a3;
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 8px 0;
  border-bottom: 1px solid #1a1a1a;

  .announcement-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .announcement-ticker {
    display: flex;
    align-items: center;
    gap: 12px;

    .ticker-tag {
      background: #ffffff;
      color: #000000;
      font-weight: 800;
      font-size: 9px;
      padding: 2px 6px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .ticker-text {
      color: #e5e5e5;
      font-weight: 500;
    }
  }

  .announcement-links {
    display: flex;
    align-items: center;
    gap: 10px;

    .top-nav-sep {
      color: #404040;
    }

    .top-nav-link {
      color: #a3a3a3;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: color 0.15s ease;

      .nav-icon {
        width: 13px;
        height: 13px;
      }

      &:hover {
        color: #ffffff;
      }

      &.portal-link {
        font-weight: 600;
        color: #d4d4d4;
        &:hover {
          color: #ffffff;
        }
      }

      &.text-btn {
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        font-family: inherit;
        font-size: 11px;
      }
    }
  }
}

/* Main Navigation Header */
.store-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: #ffffff;
  border-bottom: 1px solid #ebebeb;
  transition: all 0.25s ease;

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  .header-container {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
}

/* Brand Logo */
.store-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #000000;

  .logo-mark {
    width: 34px;
    height: 34px;
    background: #000000;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: -0.05em;
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .brand-title {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 0.08em;
      line-height: 1.1;
      color: #000000;
    }

    .brand-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.16em;
      color: #737373;
      margin-top: 2px;
    }
  }
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;

  .nav-item {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #262626;
    text-decoration: none;
    background: none;
    border: none;
    padding: 6px 0;
    position: relative;
    cursor: pointer;
    transition: color 0.15s ease;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: #000000;
      transition: width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &:hover,
    &.active {
      color: #000000;
      &::after {
        width: 100%;
      }
    }

    &.size-guide-btn {
      color: #737373;
      &:hover {
        color: #000000;
      }
    }
  }
}

/* Search & Bag */
.header-actions {
  display: flex;
  align-items: center;
  gap: 18px;

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;

    .search-svg {
      position: absolute;
      left: 12px;
      width: 15px;
      height: 15px;
      color: #737373;
      pointer-events: none;
    }

    .search-input {
      width: 220px;
      height: 38px;
      padding: 0 12px 0 34px;
      border: 1px solid #e5e5e5;
      background: #fafafa;
      font-size: 13px;
      font-family: inherit;
      color: #0a0a0a;
      transition: all 0.2s ease;
      outline: none;

      &::placeholder {
        color: #a3a3a3;
      }

      &:focus {
        width: 270px;
        background: #ffffff;
        border-color: #000000;
      }
    }
  }

  .wishlist-nav-btn {
    background: none;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    font-family: inherit;

    .nav-badge {
      background: #ef4444;
      color: #ffffff;
      font-size: 9px;
      font-weight: 800;
      min-width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
  }

  .wishlist-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid #e5e5e5;
    padding: 0 12px;
    height: 38px;
    cursor: pointer;
    color: #0a0a0a;
    font-family: inherit;
    transition: all 0.15s ease;
    border-radius: 0;

    &:hover {
      background: #000000;
      color: #ffffff;
      border-color: #000000;

      .heart-svg {
        color: #ef4444;
        fill: #ef4444;
      }
    }

    .wishlist-icon-box {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .heart-svg {
        width: 17px;
        height: 17px;
        color: #000000;
        transition: all 0.15s ease;
      }

      .wishlist-counter {
        position: absolute;
        top: -8px;
        right: -10px;
        background: #ef4444;
        color: #ffffff;
        font-size: 9px;
        font-weight: 800;
        min-width: 16px;
        height: 16px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
      }
    }

    .wishlist-lbl {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }

  .account-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: 1px solid #e5e5e5;
    padding: 0 12px;
    height: 38px;
    cursor: pointer;
    color: #0a0a0a;
    font-family: inherit;
    transition: all 0.15s ease;
    border-radius: 0;

    &:hover {
      background: #000000;
      color: #ffffff;
      border-color: #000000;

      .account-svg {
        color: #ffffff;
      }
    }

    .account-svg {
      width: 17px;
      height: 17px;
      color: #000000;
      transition: color 0.15s ease;
    }

    .account-lbl {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .user-avatar-mini {
      width: 22px;
      height: 22px;
      background: #000000;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0;
    }

    .user-name-short {
      font-size: 12px;
      font-weight: 700;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .cart-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: #0a0a0a;
    padding: 6px 10px;
    border: 1px solid transparent;
    transition: all 0.15s ease;

    &:hover {
      background: #f5f5f5;
    }

    .bag-icon-box {
      position: relative;
      display: flex;
      align-items: center;

      .bag-svg {
        width: 22px;
        height: 22px;
        color: #000000;
      }

      .bag-counter {
        position: absolute;
        top: -6px;
        right: -8px;
        background: #000000;
        color: #ffffff;
        font-size: 10px;
        font-weight: 800;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .bag-info {
      display: flex;
      flex-direction: column;

      .bag-price {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: -0.02em;
        font-variant-numeric: tabular-nums;
      }
    }
  }
}

.store-main {
  flex: 1;
}

/* Footer */
.store-footer {
  background: #0a0a0a;
  color: #ffffff;
  padding: 80px 0 30px;
  border-top: 1px solid #1a1a1a;

  .footer-top-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
    gap: 48px;
    padding-bottom: 60px;
    border-bottom: 1px solid #262626;

    @media (max-width: 992px) {
      grid-template-columns: 1fr 1fr;
      gap: 36px;
    }

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }

  .footer-col {
    .col-heading {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #ffffff;
      margin: 0 0 20px;
    }

    .col-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 12px;

        a {
          color: #888888;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s ease;

          &:hover {
            color: #ffffff;
          }
        }
      }
    }
  }

  .brand-col {
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .footer-logo-mark {
        width: 32px;
        height: 32px;
        background: #ffffff;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 16px;
      }

      .footer-logo-title {
        font-size: 18px;
        font-weight: 900;
        letter-spacing: 0.1em;
      }
    }

    .footer-desc {
      font-size: 13px;
      color: #737373;
      line-height: 1.6;
      max-width: 360px;
      margin-bottom: 20px;
    }

    .footer-legit-stamp {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border: 1px solid #333333;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #d4d4d4;

      .stamp-dot {
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
      }
    }
  }

  .contact-col {
    .address-text {
      font-size: 13px;
      color: #737373;
      line-height: 1.7;
      margin-bottom: 18px;
    }

    .payment-badges {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;

      .pay-tag {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.05em;
        padding: 4px 8px;
        border: 1px solid #333333;
        color: #a3a3a3;
      }
    }
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 28px;
    font-size: 12px;
    color: #525252;
    flex-wrap: wrap;
    gap: 16px;

    .legal-links {
      display: flex;
      gap: 20px;

      span {
        cursor: pointer;
        transition: color 0.15s ease;
        &:hover {
          color: #a3a3a3;
        }
      }
    }
  }
}
</style>
