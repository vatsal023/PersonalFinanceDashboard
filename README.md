# Personal Financial Dashboard

A web-based platform for managing personal finances, offering comprehensive tracking of income, expenses, and investments. The dashboard provides real-time analytics, portfolio insights, and intuitive visualizations to empower users in making informed financial decisions.

---

## Key Features

- **User Authentication**: Secure registration, login, password hashing, and JWT-based access control.
- **Income Tracking**: Add, categorize, filter, and upload income records; monthly breakdowns and CSV support.
- **Expense Management**: Manual and CSV entry, categorization, spending analysis, monthly filtering, and summaries.
- **Mutual Fund Portfolio**: Record investments, track active/sold funds, live NAV updates, profit/loss calculations, and date filtering.
- **Shares Portfolio**: Manage share transactions, live market prices via Yahoo Finance API, profit/loss analytics, and date filtering.
- **Bullion Investments**: Track bullion assets, live price updates, profit/loss calculations, and investment filtering.
- **Dashboard Overview**: Summary cards for income, expenses, investments, and recent entries.
- **Analytics & Visualization**: Asset allocation charts, return comparisons, and monthly trends.
- **CSV Uploads**: Bulk import for income, expenses, and investments.
- **Responsive UI**: Optimized for all devices.
- **Database Storage**: Persistent financial records.

---

## Major Modules

### Authentication Module
- User registration and login
- Password hashing for security
- JWT-based authentication
- Protected resource access

### Home Page
- Financial status overview
- Navigation to all modules

### Income Module
- Add/delete income entries
- Categorize sources
- Filter by month
- Manual entry & CSV upload
- View all records

### Expense Module
- Add expenses (manual/CSV)
- Categorize spending
- Analyze patterns
- Monthly filtering
- Summaries

### Mutual Fund Module
- Record investments (manual/CSV)
- Track active/sold funds
- Profit/loss via current NAV
- Live price tracking
- Date filtering
- Investment summary

### Shares Module
- Record transactions (manual/CSV)
- Track active/sold shares
- Profit/loss via market prices
- Live prices (Yahoo Finance API)
- Date filtering
- Investment summary

### Bullion Module
- Track investments (manual/CSV)
- Active/sold tracking
- Profit/loss calculation
- Live price tracking
- Date filtering

### Dashboard Page
- Summary cards (income, expenses, investments)
- Last 10 entries

### Analytics Page
- Investment summary
- Asset allocation chart
- Return comparison graph
- Monthly income vs expense trends

---

## Tech Stack

- **Frontend**: React.js,TailwindCSS
- **Backend**: Node.js, Express.js
- **Authentication**: JWT
- **Database**: MongoDB
- **APIs/Library**: Yahoo Finance Library, Mutual Fund NAV APIs
- **Charts**: Chart.js / Recharts

---

## Architecture Overview

```
Frontend (React.js) <-> Backend (Node.js/Express.js) <-> Database
                        |
                        |
         Yahoo Finance Library / Mutual Fund NAV APIs
```

The backend uses the Yahoo Finance library and Mutual Fund NAV APIs to fetch live financial data, which is then served to the frontend. Authentication (JWT) and all business logic are handled in the backend.

---

## Installation

1. **Clone the repository:**
	```bash
	git clone https://github.com/yourusername/personal-financial-dashboard.git
	cd personal-financial-dashboard
	```
2. **Install dependencies:**
	- Frontend:
	  ```bash
	  cd frontend
	  npm install
	  ```
	- Backend:
	  ```bash
	  cd server
	  npm install
	  ```
3. **Configure environment variables:**
	- Create `.env` files in both frontend and server as needed.
	- Set up API keys for Yahoo Finance and Mutual Fund NAV APIs.
4. **Start the application:**
	- Backend:
	  ```bash
	  npm start
	  ```
	- Frontend:
	  ```bash
	  npm run dev
	  ```

---

## Usage

- Register or log in to your account.
- Navigate through modules to add/view income, expenses, and investments.
- Upload CSV files for bulk entries.
- View dashboard and analytics for financial insights.
- Track live prices for shares, mutual funds, and bullion.

---

## Screenshots

> _Add screenshots or GIFs here to showcase UI and features._

---

## Future Improvements

- Integration with additional financial APIs
- Advanced analytics and forecasting
- Mobile app version
- Enhanced security features
- Customizable dashboards
- Multi-currency support

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


