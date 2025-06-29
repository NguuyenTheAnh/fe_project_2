# Restaurant Table Ordering System - Frontend

## 📖 Mô tả dự án

Đây là phần frontend của hệ thống đặt đồ ăn tại bàn cho nhà hàng gà, được xây dựng bằng React + Vite. Hệ thống cho phép khách hàng đặt món trực tiếp tại bàn thông qua QR code và cung cấp giao diện quản lý cho nhân viên nhà hàng.

## 🏗️ Kiến trúc hệ thống

### Người dùng chính:
1. **Guest (Khách hàng)**: Quét QR code tại bàn để đặt món
2. **Staff (Nhân viên)**: Quản lý đơn hàng, món ăn, bàn
3. **Manager (Quản lý)**: Toàn quyền quản lý hệ thống

### Các tính năng chính:

#### 🍽️ Giao diện khách hàng (Guest):
- Quét QR code để truy cập menu tại bàn
- Xem danh sách món ăn với hình ảnh và giá cả
- Thêm món vào giỏ hàng
- Xem và chỉnh sửa giỏ hàng
- Đặt hàng trực tiếp

#### 👨‍💼 Giao diện quản lý (Staff/Manager):
- **Dashboard**: Tổng quan hệ thống
- **Tables Management**: Quản lý bàn ăn, tạo QR code
- **Dishes Management**: Quản lý thực đơn, thêm/sửa/xóa món
- **Orders Management**: Xử lý đơn hàng, cập nhật trạng thái
- **Payments Management**: Quản lý thanh toán
- **Account Management**: Quản lý tài khoản nhân viên (chỉ Manager)

## 🎨 Theme và màu sắc

### Bảng màu chính:
- **Primary Red**: `#D3212D` - Màu chủ đạo của thương hiệu
- **Secondary Orange**: `#F26649` / `#FF944D` - Màu phụ, dùng cho hover effects
- **Background Light**: `#FFF8F0` - Màu nền chính
- **Background White**: `#FFFFFF` - Màu nền content
- **Text Dark**: `#333333` - Màu chữ chính
- **Accent Colors**: 
  - Success: `#4CAF50`
  - Error: `#F44336`
  - Warning: `#FF9800`

### Gradient patterns:
- **Primary Gradient**: `linear-gradient(45deg, #D3212D 30%, #FF944D 90%)`
- **Hover Gradient**: `linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)`

### Design principles:
- **Border Radius**: 8px - 16px cho các component
- **Box Shadow**: Subtle shadows với rgba(0,0,0,0.1-0.2)
- **Typography**: Material-UI với custom weights và sizes
- **Spacing**: Sử dụng Material-UI spacing system (8px base)

## 🛠️ Công nghệ sử dụng

### Core Framework:
- **React 18.3.1**: Library chính
- **Vite 5.3.1**: Build tool và dev server
- **React Router DOM 6.24.0**: Routing

### UI Libraries:
- **Material-UI (@mui/material 7.1.0)**: Component library chính
- **Ant Design (antd 5.19.0)**: Một số component bổ sung
- **React Icons 5.5.0**: Icon system
- **@emotion/react & @emotion/styled**: CSS-in-JS styling

### State Management & API:
- **React Context**: Quản lý state global (Auth, Guest)
- **Axios 1.7.2**: HTTP client
- **Custom hooks**: Cho logic tái sử dụng

### Form & Validation:
- **Formik 2.4.6**: Form handling
- **Yup 1.6.1**: Validation schema

### Utilities:
- **QRCode.react 4.2.0**: Tạo QR codes
- **React Router DOM**: Navigation

## 📁 Cấu trúc thư mục

```
src/
├── App.jsx                     # Main app component
├── Dashboard.jsx               # Dashboard layout
├── Guest.jsx                   # Guest layout
├── main.jsx                    # App entry point
├── components/
│   ├── context/
│   │   ├── auth.context.jsx    # Authentication context
│   │   └── guest.context.jsx   # Guest authentication context
│   └── layout/
│       ├── header.jsx          # Main header
│       ├── headerGuest.jsx     # Guest header
│       ├── footerGuest.jsx     # Guest footer
│       └── sidebar.jsx         # Dashboard sidebar
├── pages/
│   ├── home.jsx                # Landing page
│   ├── login.jsx               # Staff login
│   ├── loginGuest.jsx          # Guest login
│   ├── register.jsx            # Registration
│   ├── mainDashboard.jsx       # Dashboard main
│   ├── tablesDashboard.jsx     # Tables management
│   ├── dishesDashboard.jsx     # Dishes management
│   ├── ordersDashboard.jsx     # Orders management
│   ├── paymentsDashboard.jsx   # Payments management
│   ├── management.jsx          # Account management
│   ├── profileSettings.jsx     # Profile settings
│   ├── user.jsx                # User profile
│   ├── wish.jsx                # Order completion page
│   └── guest/
│       ├── guestMain.jsx       # Guest menu page
│       └── guestCart.jsx       # Guest cart page
├── styles/
│   └── global.css              # Global styles
└── util/
    ├── api.js                  # Staff API calls
    ├── apiDish.js              # Dishes API
    ├── apiGuest.js             # Guest API calls
    ├── apiTable.js             # Tables API
    └── axios.customize.js      # Axios configuration
```

## 🔐 Authentication System

### Dual Authentication:
1. **Staff Authentication**: JWT token cho nhân viên
2. **Guest Authentication**: Temporary token cho khách hàng tại bàn

### Context Management:
- **AuthContext**: Quản lý trạng thái đăng nhập staff
- **GuestAuthContext**: Quản lý trạng thái khách hàng và giỏ hàng

## 🚀 Route Structure

```
/ (Main App)
├── / (HomePage)
├── /login (Staff Login)
├── /register (Staff Registration)
├── /managements (Account Management - Manager only)
├── /profile-settings (Profile Settings)
└── /dashboard (Dashboard Layout)
    ├── / (Main Dashboard)
    ├── /tables (Tables Management)
    ├── /dishes (Dishes Management)
    ├── /orders (Orders Management)
    └── /payments (Payments Management)

/guest (Guest App)
├── / (Guest Menu)
└── /cart (Guest Cart)

/login-guest (Guest Login)
/wish (Order Completion)
```

## 🎯 Responsive Design

### Breakpoints (Material-UI):
- **xs**: 0px - 600px (Mobile)
- **sm**: 600px - 900px (Tablet)
- **md**: 900px - 1200px (Desktop)
- **lg**: 1200px+ (Large Desktop)

### Mobile-first approach:
- Responsive grid system
- Adaptive navigation (hamburger menu)
- Touch-friendly interfaces
- Optimized image loading

## 📱 Mobile Features

### Guest Mobile Experience:
- QR code scanning workflow
- Touch-optimized menu browsing
- Swipe gestures for cart management
- Mobile-optimized checkout flow

### Staff Mobile Dashboard:
- Responsive sidebar navigation
- Touch-friendly order management
- Mobile table status overview

## 🔧 Development Setup

### Prerequisites:
- Node.js (v16+)
- npm/yarn
- Modern web browser

### Installation:
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts:
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🌟 Key Features

### Performance Optimizations:
- Code splitting with React Router
- Lazy loading components
- Optimized image handling
- Minimal bundle size with Vite

### User Experience:
- Intuitive navigation
- Real-time cart updates
- Responsive feedback
- Error handling with notifications

### Security:
- JWT token management
- Route protection
- Input validation
- XSS protection

## 🔮 Future Enhancements

- Real-time notifications
- Multi-language support
- Dark mode theme
- PWA capabilities
- Enhanced analytics dashboard

---

**Author**: The Anh  
**Version**: 0.0.0  
**Last Updated**: December 2024