# 🎥 VideoTube – Video Streaming Platform (Backend)

**VideoTube** is a **production-ready backend** for a YouTube-like video streaming platform.
It is built using **Node.js, Express.js, and MongoDB**, and follows modern backend best practices such as **JWT authentication, role-based access control, Cloudinary media uploads, and scalable REST APIs**.

This project is designed to demonstrate **real-world backend architecture**, clean code organization, and portfolio-ready backend engineering skills.

---

## 🌐 Live Base URL

```
https://videotube-platform-backend-project.onrender.com/api/v1
```

All APIs are served under the `/api/v1` prefix.
---
#### Example Public API

```
https://videotube-platform-backend-project.onrender.com/api/v1/videos
```

---

## 🚀 Project Overview

The VideoTube backend provides:

* Secure authentication & authorization
* Public and protected video APIs
* Video upload, update, publish & delete workflows
* Playlist creation & management
* Comment, like & subscription systems
* Ownership-based access control
* Centralized error handling & standardized API responses

Built for **real-world usage**, backend learning, and portfolio showcasing.

---

## 👥 Roles & Access Control

### 👤 User

* Register & login securely
* Browse **published videos** (public access)
* Watch videos
* Like videos & comments
* Comment on videos
* Create & manage personal playlists
* Subscribe / unsubscribe to channels

### 🎥 Creator (Channel Owner)

* Upload videos
* Update & delete **own videos only**
* Publish / unpublish own videos
* Manage own playlists
* View channel analytics (basic)

> ⚠️ Admin-level moderation is planned for future versions.

---

## ✨ Key Features

### 🔐 Authentication & Security

* Secure registration & login
* Password hashing using **bcrypt**
* JWT-based authentication (Access & Refresh Tokens)
* Tokens stored in **HTTP-only cookies**
* Protected routes using `verifyJWT`
* Environment-based configuration using `dotenv`

---

### 🎬 Video Management

* Upload video files with metadata
* Thumbnail upload support
* Publish / unpublish videos
* Fetch all videos with pagination
* Fetch single video details
* Owner-based authorization for updates
* Optimized MongoDB queries

---

### 💬 Comment System

* Add comments on videos
* Update & delete own comments
* Fetch all comments of a video
* Aggregation-based optimized queries

---

### ❤️ Like System (Toggle Based)

* Toggle like on videos
* Toggle like on comments
* Prevent duplicate likes
* Like count per resource

---

### 📂 Playlist Management

* Create playlists
* Update playlist details
* Delete playlists
* Add / remove videos from playlists
* Ownership validation
* Duplicate prevention using `$addToSet`

---

### 🔔 Subscription System

* Subscribe / unsubscribe to channels (toggle)
* Get channel subscriber count
* Fetch user subscriptions

---

## 🔗 API Routes Overview

### 🌍 Public Routes (No Authentication Required)

```
GET    /api/v1/videos
GET    /api/v1/videos/:videoId
```

### 🔑 Authentication Routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
```

---

### 🎬 Video Routes (Protected)

```
POST   /api/v1/videos
PATCH  /api/v1/videos/:videoId
PATCH  /api/v1/videos/toggle/publish/:videoId
```

---

### 💬 Comment Routes

```
POST   /api/v1/comments/:videoId
GET    /api/v1/comments/:videoId
PATCH  /api/v1/comments/:commentId
DELETE /api/v1/comments/:commentId
```

---

### ❤️ Like Routes

```
POST   /api/v1/likes/toggle/video/:videoId
POST   /api/v1/likes/toggle/comment/:commentId
```

---

### 📂 Playlist Routes

```
POST   /api/v1/playlists
GET    /api/v1/playlists/user/:userId
PATCH  /api/v1/playlists/:playlistId
DELETE /api/v1/playlists/:playlistId
PATCH  /api/v1/playlists/add/:videoId/:playlistId
PATCH  /api/v1/playlists/remove/:videoId/:playlistId
```

---

### 🔔 Subscription Routes

```
POST   /api/v1/subscriptions/toggle/:channelId
GET    /api/v1/subscriptions/channel/:channelId
GET    /api/v1/subscriptions/user/:userId
```

---

## 🧩 Access Control Summary

| Role    | Videos | Playlists | Comments | Subscriptions |
| ------- | ------ | --------- | -------- | ------------- |
| User    | View   | Own       | Own      | ✅             |
| Creator | Own    | Own       | Own      | ✅             |

---

## 🛠 Backend Architecture

* RESTful API design using **Express.js**
* Modular folder structure (routes, controllers, utils)
* MongoDB integration with **Mongoose**
* Aggregation pipelines for optimized queries
* Centralized error & response handling
* CORS enabled for frontend integration
* Development workflow using **nodemon**

---

## 🛠 Technologies Used

| Technology    | Purpose              |
| ------------- | -------------------- |
| Node.js       | JavaScript runtime   |
| Express.js    | REST API framework   |
| MongoDB       | NoSQL database       |
| Mongoose      | MongoDB ODM          |
| Multer        | File upload handling |
| Cloudinary    | Media storage        |
| bcrypt        | Password hashing     |
| JWT           | Authentication       |
| dotenv        | Environment config   |
| cookie-parser | Secure cookies       |

---

## 🎯 Learning Outcomes

* Real-world JWT authentication flow
* Ownership-based authorization
* Pagination & aggregation in MongoDB
* Toggle-based like & subscription systems
* Clean backend architecture
* Production-ready API design mindset

---

## 👨‍💻 Author

**Javed**
📌 Built for learning, practice & real-world backend experience
