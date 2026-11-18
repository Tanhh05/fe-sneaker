<template>
  <div class="store-layout">
    <!-- Top Announcement Bar -->
    <div class="store-announcement">
      <div class="container announcement-content">
        <span>🔥 <strong>MIỄN PHÍ VẬN CHUYỂN</strong> TOÀN QUỐC CHO ĐƠN TỪ 1.000.000đ | CAM KẾT 100% CHÍNH HÃNG</span>
        <div class="top-links">
          <router-link to="/tracking" class="top-link">
            <el-icon><Van /></el-icon> Tra cứu đơn hàng
          </router-link>
          <span class="divider">|</span>
          <router-link to="/login" class="top-link admin-pill">
            <el-icon><User /></el-icon> Quản trị / POS
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="store-header" :class="{ 'scrolled': isScrolled }">
      <div class="container header-container">
        <!-- Logo -->
        <router-link to="/" class="store-logo">
          <span class="logo-badge">⚡</span>
          <div class="logo-text">
            <span class="brand-title">SNEAKERHUB</span>
            <span class="brand-sub">AUTHENTIC STORE</span>
          </div>
        </router-link>

        <!-- Navigation Menu -->
        <nav class="nav-links">
          <router-link to="/" class="nav-item" exact-active-class="active">Trang chủ</router-link>
          <router-link to="/shop" class="nav-item" active-class="active">Bộ sưu tập Giày</router-link>
          <router-link to="/tracking" class="nav-item" active-class="active">Tra cứu đơn</router-link>
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Search input -->
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="Tìm kiếm Nike, Jordan, Adidas..."
              :prefix-icon="Search"
              clearable
              @keyup.enter="handleSearch"
            />
          </div>

          <!-- Cart Button -->
          <router-link to="/cart" class="cart-trigger">
            <el-badge :value="cartStore.totalItems" :hidden="cartStore.totalItems === 0" class="badge">
              <div class="cart-icon-btn">
                <el-icon :size="20"><ShoppingBag /></el-icon>
              </div>
            </el-badge>
            <div class="cart-meta" v-if="cartStore.totalItems > 0">
              <span class="cart-label">Giỏ hàng</span>
              <span class="cart-total">{{ formatCurrency(cartStore.totalPrice) }}</span>
            </div>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content Slot -->
    <main class="store-main">
      <router-view />
    </main>

    <!-- Store Footer -->
    <footer class="store-footer">
      <div class="container footer-grid">
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <span class="logo-badge">⚡</span>
            <span class="brand-title">SNEAKERHUB PRO</span>
          </div>
          <p class="brand-desc">
            Hệ thống phân phối giày Sneaker chính hãng hàng đầu Việt Nam. Đa dạng mẫu mã, cập nhật xu hướng streetwear mới nhất từ Nike, Jordan, Adidas, Puma, New Balance.
          </p>
          <div class="store-badges">
            <span class="badge-tag">✓ 100% Authentic</span>
            <span class="badge-tag">✓ Đổi trả 7 ngày</span>
            <span class="badge-tag">✓ Free ship 1tr+</span>
          </div>
        </div>

        <div class="footer-col">
          <h4 class="col-title">THƯƠNG HIỆU</h4>
          <ul class="col-links">
            <li><router-link to="/shop?brand=1">Nike Sneakers</router-link></li>
            <li><router-link to="/shop?brand=2">Adidas Originals</router-link></li>
            <li><router-link to="/shop?brand=3">Air Jordan Retro</router-link></li>
            <li><router-link to="/shop?brand=4">New Balance</router-link></li>
            <li><router-link to="/shop?brand=5">Converse Classic</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="col-title">HỖ TRỢ KHÁCH HÀNG</h4>
          <ul class="col-links">
            <li><router-link to="/tracking">Kiểm tra đơn hàng</router-link></li>
            <li><a href="javascript:void(0)" @click="showSizeGuide = true">Bảng quy đổi Size giày</a></li>
            <li><a href="javascript:void(0)">Chính sách bảo hành & đổi trả</a></li>
            <li><a href="javascript:void(0)">Hướng dẫn mua hàng & thanh toán</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="col-title">LIÊN HỆ CỬA HÀNG</h4>
          <p class="contact-info"><strong>Địa chỉ:</strong> Số 3 Cầu Giấy, Láng Thượng, Đống Đa, Hà Nội</p>
          <p class="contact-info"><strong>Hotline:</strong> 1900 6868 - 0901 000 001</p>
          <p class="contact-info"><strong>Email:</strong> support@sneakerhub.vn</p>
          <p class="contact-info"><strong>Giờ mở cửa:</strong> 08:30 - 22:00 (Cả tuần)</p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container bottom-content">
          <p>© 2026 SNEAKERHUB PRO. Bản quyền thuộc về Nhóm 05 - Đại học Giao thông Vận tải.</p>
          <div class="payment-methods">
            <span class="pay-tag">💵 Tiền mặt (COD)</span>
            <span class="pay-tag">📲 Chuyển khoản VietQR</span>
            <span class="pay-tag">🏦 Internet Banking</span>
          </div>
        </div>
      </div>
    </footer>

    <!-- Size Guide Dialog -->
    <el-dialog v-model="showSizeGuide" title="BẢNG QUY ĐỔI KÍCH THƯỚC GIÀY (SIZE GUIDE)" width="600px">
      <el-table :data="sizeGuideData" border stripe>
        <el-table-column prop="eu" label="EU (VN)" align="center" width="100" />
        <el-table-column prop="us" label="US Men" align="center" width="100" />
        <el-table-column prop="uk" label="UK" align="center" width="100" />
        <el-table-column prop="cm" label="Chiều dài bàn chân (cm)" align="center" />
      </el-table>
      <p style="margin-top: 12px; font-size: 13px; color: #64748b; line-height: 1.5;">
        * Mẹo: Nên đo chiều dài từ gót chân đến ngón dài nhất vào buổi chiều muộn để có kích thước chuẩn xác nhất.
      </p>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingBag, Van, User } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { formatCurrency } from '@/utils/formatters'

const router = useRouter()
const cartStore = useCartStore()

const searchKeyword = ref('')
const isScrolled = ref(false)
const showSizeGuide = ref(false)

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
  isScrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
.store-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Announcement */
.store-announcement {
  background: #0f172a;
  color: #f8fafc;
  font-size: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .announcement-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .top-links {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .top-link {
    color: #cbd5e1;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;

    &:hover {
      color: #f97316;
    }

    &.admin-pill {
      background: rgba(249, 115, 22, 0.2);
      color: #f97316;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 600;

      &:hover {
        background: #f97316;
        color: #ffffff;
      }
    }
  }

  .divider {
    color: #475569;
  }
}

/* Header */
.store-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.25s ease;

  &.scrolled {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 72px;
  }
}

.store-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;

  .logo-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    background: #0f172a;
    color: #f97316;
    font-size: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(249, 115, 22, 0.3);
  }

  .logo-text {
    display: flex;
    flex-direction: column;

    .brand-title {
      font-size: 19px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #0f172a;
      line-height: 1.1;
    }

    .brand-sub {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      color: #f97316;
    }
  }
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;

  .nav-item {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    text-decoration: none;
    position: relative;
    padding: 6px 0;
    transition: color 0.2s;

    &:hover,
    &.active {
      color: #f97316;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #f97316;
        border-radius: 2px;
      }
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  .search-box {
    width: 260px;
  }

  .cart-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 8px;
    background: #f1f5f9;
    transition: background 0.2s;

    &:hover {
      background: #e2e8f0;
    }

    .cart-icon-btn {
      color: #0f172a;
      display: flex;
      align-items: center;
    }

    .cart-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;

      .cart-label {
        font-size: 11px;
        color: #64748b;
      }

      .cart-total {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
      }
    }
  }
}

/* Main */
.store-main {
  flex: 1;
}

/* Footer */
.store-footer {
  background: #0f172a;
  color: #94a3b8;
  margin-top: 60px;
  padding-top: 60px;

  .footer-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1.2fr 1.5fr;
    gap: 40px;
    padding-bottom: 40px;
  }

  .brand-col {
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .logo-badge {
        font-size: 20px;
      }

      .brand-title {
        color: #ffffff;
        font-size: 20px;
        font-weight: 800;
      }
    }

    .brand-desc {
      font-size: 13.5px;
      line-height: 1.6;
      margin-bottom: 20px;
      color: #94a3b8;
    }

    .store-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .badge-tag {
        background: rgba(255, 255, 255, 0.08);
        color: #e2e8f0;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 6px;
      }
    }
  }

  .col-title {
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 18px;
    letter-spacing: 0.5px;
  }

  .col-links {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 10px;

      a {
        color: #94a3b8;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.2s;

        &:hover {
          color: #f97316;
        }
      }
    }
  }

  .contact-info {
    font-size: 13.5px;
    line-height: 1.6;
    margin-bottom: 8px;

    strong {
      color: #cbd5e1;
    }
  }

  .footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 20px 0;
    font-size: 13px;

    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-methods {
      display: flex;
      gap: 10px;

      .pay-tag {
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
  }
}

@media (max-width: 900px) {
  .store-footer .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
  .header-actions .search-box {
    display: none;
  }
}
</style>
