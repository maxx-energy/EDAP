# Enterprise Data Access Portal (EDAP) - Solar Planet Generation

## Project Overview

The **Enterprise Data Portal (EDAP) - Solar Planet Generation** is a web-based application developed as part of a simulated internship program at Maxx Potential through YearUp United. This project serves as a centralized platform for monitoring solar energy generation data, providing insights to both customers and company employees with varying levels of access.

## Features

-   **User Authentication & Role-Based Access Control**

    -   Secure session-based authentication.
    -   Bitwise logic-based middleware for route protection.
    -   Role-based permissions:
        -   **Customers:** View their specific solar energy data.
        -   **Executives:** Full access to all data.
        -   **Directors, Managers, Staff:** Limited access based on role.

-   **Data Visualization & Reporting**

    -   Integration with **Power BI** for interactive data analysis.
    -   Custom dashboard displaying key solar generation metrics.

-   **RESTful API Design**

    -   Follows **Model-View-Controller (MVC)** architecture using **Express.js**.
    -   Endpoints for retrieving, updating, and managing user and energy data.

-   **Database Management**
    -   Designed using **MySQL** with relational database structure.
    -   Includes tables for users, roles, solar generation data, and access control.

## Tech Stack

-   **Frontend:** HTML, CSS, Boostrap, JavaScript (with Power BI integration for visualization)
-   **Backend:** Node.js, Express.js (RESTful API)
-   **Database:** MySQL
-   **Authentication:** Session-based security

## Installation & Setup

### Prerequisites

Ensure you have the following installed on your system:

-   [Node.js](https://nodejs.org/)
-   [MySQL](https://www.mysql.com/)

### Steps to Run the Project

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd edap-project
    ```
2. Install dependencies:
    ```sh
    npm install
    ```
3. Configure the database:

    - Ensure you have access to a remote MySQL database.
    - Update the connection settings in the .env file with your remote MySQL server credentials:

    ```text
    # Database Configuration
    DB_HOST=<remote-server-host>
    DB_PORT=<remote-server-port>
    DB_NAME=<your-database-name>
    DB_USER=<your-database-user>
    DB_PASSWORD=<your-database-password>

    # Application Port
    PORT=3000

    # SSH Configuration for Remote Access
    SSH_USER=<ssh-username>
    SSH_PRIVATE_KEY_PATH=<path-to-ssh-private-key>
    SSH_HOST=<ssh-host-ip>

    # Flash Secret Key for session management
    FLASH_SECRET_KEY=<your-secret-key>

    # Email Configuration (for email notifications or integrations)
    EMAIL=<your-email-address>
    EMAIL_PASSWORD=<your-email-password>

    # Power BI Embedding Configuration
    POWER_BI_EMBED_URL=<power-bi-embed-url>
    POWER_BI_REPORT_ID=<power-bi-report-id>
    POWER_BI_ACCESS_TOKEN=<power-bi-access-token>
    ```

    - Ensure the remote MySQL server allows connections from your application's IP address.

4. Run database migrations (if applicable):
    ```sh
    npm run migrate
    ```
5. Start the server:
    ```sh
    npm start
    ```
6. Access the application at `http://localhost:3000`

## Usage

-   Users can log in to access their respective dashboards.
-   Customers can view their energy generation data.
-   Employees (Executives, Directors, Managers, Staff) can view and analyze relevant solar generation reports based on their roles.

## Future Enhancements

-   Implementing additional data analytics features.
-   Enhancing role-based permissions with granular access control.
-   Expanding the API to support more external integrations.

## Contributors

This project was developed by **Esmail Sarwari**, **Cece Nguyen**, **Usayd Shaikh**, **Jerry Alatorre** and the **Data Team** as part of a simulated internship program at Maxx Potential through YearUp United.

## License

This project is licensed under the MIT License. Feel free to modify and use it as needed.

---

For any inquiries, feel free to reach out!
