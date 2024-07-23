# Tasky

Tasky is a comprehensive task management application that provides user authentication, task creation, and task management features. The application is built with Node.js, Express, MongoDB, and Twilio for sending SMS confirmations.

## Features

- User Authentication (Sign-in, Sign-out, and Refresh Tokens)
- Task Management (Create, Read, Update, Delete)
- SMS Confirmation using Twilio

## Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Technologies Used](#technologies-used)
- [License](#license)

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/tasky.git
    cd tasky
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_uri
SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_jwt_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```


