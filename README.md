# 💈 Website for the hairdresser business - Hamoudi

An interactive and user-friendly website built for Hamoudi's hairdresser. The site is intended for both customers and the business owner and provides a convenient interface for scheduling appointments, managing appointments, and updating working hours. The system is saved in JSON files without using a database.

---

## 🚀 Main features

### 🧔‍♂️ Home page for customers
- Displaying general information about the hairdresser.
- Details of the services provided.
- Location map of the business.
- Promotional videos to illustrate the services.
- Button to schedule an appointment.

### 📅 Schedule an appointment for the customer
- Select a date, time, name and phone number.
- Display available hours only (according to the business owner's work schedule).
- Save the appointment in the `appointments.json` file.
---
## Main login
-** User name : abra
-** Password : 12345
---

## 👨‍💼 Admin interface

### Login:
- **Password:** `12345`

### After logging in, there are two options:

#### 🗂️ Show appointments
- A table showing all scheduled appointments.
- Option to **delete**, **update**, or **add a manual appointment**.

#### 🕒 Work schedule
- Allows the business owner to set the available hours during which appointments can be booked.
- Times are saved in a JSON file and updated for customers.

---

## 🧾 Saving information
- The data is saved in JSON files on the server (without a database).
- Each appointment is saved in the `appointments.json` file.
- The work schedule is saved in the `schedule.json` file or similar (depending on your implementation).
- Data is saved permanently even after refreshing or shutting down the server.

---

## 🛠️ Technologies used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Templates:** EJS
- **Data storage:** JSON files

------------------------------------------------------------------------------------------------------------

## 🚀 How to run the project:
1. Download the files or clone from the repo.
2. Install the dependencies (if there is a package.json file):
```bash
npm install
3. Run the server: node server.js
4. Open the browser at: http://localhost:3000
