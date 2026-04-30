# ShipEasy: Premium P2P Shipping Aggregator

## 🚀 Overview
**ShipEasy** is a state-of-the-art Peer-to-Peer (P2P) shipping platform designed to simplify logistics for modern users. It acts as a powerful aggregator, connecting users with 20+ top-tier courier partners (such as Delhivery, BlueDart, FedEx, and DHL) through a sleek, premium interface. Whether shipping a gift across town or a commercial parcel across the globe, ShipEasy provides real-time price comparisons and seamless booking.

---

## ✨ Key Features

### 1. Dual-Mode Logistics
The platform intelligently pivots between two primary shipping modes:
*   **Domestic Shipping**: Optimized for high-speed delivery within India, supporting over 29,000+ pin codes.
*   **International Shipping**: Connects users to 220+ countries with integrated country selectors, zip/postal code support, and simplified customs orientation.

### 2. Real-Time Price Comparison
*   **Instant Rates**: Dynamic calculation based on weight, dimensions, and destination.
*   **Partner Network**: Real-time API integration with multiple couriers to show the lowest prices and fastest delivery estimates (ETDs).
*   **Advanced Dimensions**: Precise rate calculation for non-standard boxes using length, width, and height inputs.

### 3. Premium User Experience (UX)
*   **Aesthetic UI**: A "glassmorphic" design system using HSL color tokens, vibrant gradients, and smooth animations powered by `Framer Motion`.
*   **Contextual Theme Shifting**: The UI visually shifts between Blue (Domestic) and Purple (International) themes to provide instant feedback on the selected service.
*   **Sticky Navigation**: A refined header with quick-access profile controls and a consistent layout across all screen sizes.

### 4. Advanced Authentication & Security
*   **Google OAuth 2.0**: One-tap secure login for a frictionless onboarding experience.
*   **Traditional Auth**: Robust email/password registration and login flows.
*   **Protected Routes**: Secure Dashboard and Booking flows that ensure data privacy.

### 5. Management Dashboard
*   **Shipment Tracking**: A centralized hub to monitor active shipments, view history, and manage addresses.
*   **MongoDB Integration**: Real-time synchronization of user profiles and shipping data with a scalable backend.

---

## 🛠️ Technology Stack

### Frontend
*   **React 18**: Core framework for a component-based architecture.
*   **TypeScript**: Ensuring type safety and code reliability.
*   **Vite**: Lightning-fast build tool and dev server.
*   **Tailwind CSS**: Utility-first styling for a custom, premium look.
*   **Lucide React**: Modern, consistent iconography.
*   **Framer Motion**: High-end micro-animations and page transitions.

### Backend
*   **Node.js & Express**: High-performance server-side environment.
*   **MongoDB & Mongoose**: Flexible NoSQL database for complex shipping and user data.
*   **Redis**: In-memory data store for session management and high-speed caching.
*   **JWT & OAuth**: Secure token-based authentication.

---

## 🏗️ Architecture
The project follows a modular "Feature-First" architecture, separating core logic into:
*   `auth`: Authentication handlers and session management.
*   `booking`: Step-by-step wizard for address collection and review.
*   `calculator`: The heart of the price comparison engine.
*   `dashboard`: Personalized user interface for shipment management.

---

## 🏁 Goal
To provide a world-class shipping experience that feels premium, is technologically robust, and simplifies the complex world of global logistics into a few clicks.
