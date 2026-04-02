# 🏦 Mint Financial - Invoice Builder Application

A comprehensive, modern invoice management system built with React, TypeScript, and Tailwind CSS. Features real-time updates, mobile-responsive design, and advanced financial management capabilities.

Features

### 📱 **Mobile-Responsive Design**
- **Progressive Web App** with mobile-first approach
- **Touch-friendly interface** optimized for all devices
- **Responsive dashboard** with adaptive charts and KPIs
- **Mobile card views** for invoice management

### 📊 **Dashboard & Analytics**
- **Real-time KPIs** with auto-refresh functionality
- **Interactive charts** (Revenue trends, Status breakdown)
- **Revenue targets** and growth rate tracking
- **Outstanding invoice** monitoring

### 🧾 **Invoice Management**
- **Create, Edit, Delete** invoices with intuitive forms
- **Invoice preview** with professional PDF generation
- **Status tracking** (Draft, Sent, Paid, Overdue)
- **Bulk operations** for efficient management
- **Advanced filtering** and search capabilities

### 👥 **Client Management**
- **Client dashboard** with detailed insights
- **Client reports** and analytics
- **Client portal** for invoice access
- **CRM integration** with client lifecycle management

### 🛒 **E-commerce Integration**
- **Product catalog** management
- **Order processing** and tracking
- **Shipping management** system
- **Tax management** and configuration
- **Return processing** workflow

### 🔄 **Real-Time Features**
- **WebSocket integration** for live updates
- **Activity feed** with real-time notifications
- **Live invoice status** changes
- **Real-time notifications** for new invoices and payments

### 📄 **Export & Reporting**
- **PDF generation** with custom templates
- **Image export** for dashboard snapshots
- **JSON export** for data portability
- **Comprehensive reporting** and analytics

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Real-time**: WebSocket service
- **Build Tool**: Vite
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krusty300/Mint-Financial.git
   cd Mint-Financial
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5174`

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## 📱 Mobile Usage

The application is fully mobile-responsive:

- **Mobile View**: Card-based layout with touch-friendly controls
- **Tablet View**: Optimized layout for medium screens  
- **Desktop View**: Full-featured interface with traditional layouts

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your-api-url
VITE_WS_URL=your-websocket-url
```

### WebSocket Configuration

The application includes a WebSocket service for real-time features. Configure the WebSocket URL in the environment variables or modify `src/services/websocketService.ts`.

## 📊 Features Overview

### Dashboard
- Real-time KPI monitoring
- Interactive revenue charts
- Auto-refresh functionality
- Mobile-optimized layout

### Invoice Management
- Professional invoice creation
- PDF export with custom templates
- Bulk operations
- Advanced filtering and search

### Client Management
- Client insights and reporting
- Client portal access
- CRM integration
- Lifecycle management

### E-commerce
- Product catalog management
- Order processing
- Shipping and tax management
- Return processing

## 🎯 Key Components

- **Dashboard**: Real-time analytics and KPIs
- **InvoiceList**: Mobile-responsive invoice management
- **InvoiceForm**: Professional invoice creation
- **ClientDashboard**: Client insights and reporting
- **EcommerceManager**: Complete e-commerce solution

## 🔍 Advanced Features

### Real-Time Updates
- WebSocket integration for live data
- Activity feed with notifications
- Live status updates

### Export Capabilities
- PDF generation with custom templates
- Dashboard image export
- JSON data export

### Mobile Optimization
- Touch-friendly interface
- Responsive charts
- Adaptive layouts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide React for the beautiful icon set
- Recharts for the charting library
- jsPDF for PDF generation capabilities

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Mint Financial** - Modern Invoice Management Made Simple 🏦
