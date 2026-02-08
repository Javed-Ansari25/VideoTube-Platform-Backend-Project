# 🎥 VideoTube – Backend API

VideoTube is a **scalable, production‑style backend API** inspired by platforms like YouTube. It is built using **Node.js, Express.js, MongoDB**, and modern backend best practices such as **JWT authentication, Cloudinary file uploads, and secure user management**.

This project is designed as a **learning + portfolio‑ready backend**, with clean architecture, reusable utilities, optimized database queries, and interview‑focused concepts.

---

## 🚀 Features

### 👤 User Management

* User registration & login
* JWT‑based authentication (Access Token + Refresh Token)
* Secure password hashing using **bcrypt**
* Change password functionality
* Get current logged‑in user details
* Update user account details (name, email, etc.)

---

### 🖼️ Media Upload

* Avatar upload
* Cover image upload
* File handling using **Multer**
* Cloud storage using **Cloudinary**
* Automatic local file cleanup after upload

---

### 📺 Channel & Profile

* Get user channel profile by username
* Channel ownership logic
* Protected routes using JWT middleware

---

### 🎬 Video Management

* Create (upload) video metadata
* Update video details (title, description, thumbnail)
* Publish / unpublish videos
* Get single video details
* Get all videos with pagination
* Owner‑based authorization for video updates

---

### 💬 Comment System

* Add comment on a video
* Update comment (owner only)
* Delete comment (owner only)
* Fetch all comments of a video
* Optimized queries using **aggregation pipeline**

---

### ❤️ Like System (Toggle Based)

* Toggle like on videos
* Toggle like on comments
* Toggle like on tweets/posts
* Prevent duplicate likes using compound indexes
* Like count retrieval per resource

---

### 📂 Playlist Management

* Create playlist
* Update playlist (name, description)
* Delete playlist
* Add video to playlist
* Remove video from playlist
* Playlist ownership validation
* Duplicate video prevention using `$addToSet`

---

### 🔔 Subscription System

* Subscribe / unsubscribe to a channel (toggle)
* Get subscriber count of a channel
* Get channels subscribed by a user
* Efficient queries using indexed fields

---

### 🔐 Security

* HTTP‑only cookies for tokens
* Access & Refresh token strategy
* Middleware‑based route protection (`verifyJWT`)
* Environment variable based configuration

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT (Access & Refresh Tokens)
* **File Upload:** Multer
* **Cloud Storage:** Cloudinary
* **Security:** bcrypt, cookie‑parser
* **Dev Tools:** Nodemon, dotenv

---

## 📂 Project Structure

```
VideoTube-Backend/
│
├── src/
│   ├── controllers/      # Business logic (users, videos, comments, likes, playlists, subscriptions)
│   ├── models/           # Mongoose schemas & indexes
│   ├── routes/           # Express API routes
│   ├── middlewares/      # Auth, multer, error handlers
│   ├── utils/            # Reusable helpers & API responses
│   ├── config/           # Database & Cloudinary configuration
│   └── app.js            # Express app setup
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Authentication Flow (High Level)

1. User logs in using email & password
2. Server verifies credentials
3. **Access Token** (short‑lived) is generated
4. **Refresh Token** (long‑lived) is generated & stored
5. Tokens are sent via **HTTP‑only cookies**
6. Protected routes are accessed using `verifyJWT` middleware

---

## 📡 API Routes (Overview)

### 👤 Auth & User

* `POST   /api/v1/auth/register`
* `POST   /api/v1/auth/login`
* `POST   /api/v1/auth/logout`

* `POST   /api/v1/users/change-password`
* `GET    /api/v1/users/currentUser`
* `PATCH  /api/v1/users/update-account`

---

### 🖼️ Media

* `PATCH  /api/v1/users/avatar`
* `PATCH  /api/v1/users/cover-image`

---

### 🎬 Videos

* `POST   /api/v1/videos`
* `GET    /api/v1/videos`
* `GET    /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/toggle/publish/:videoId`

---

### 💬 Comments

* `POST   /api/v1/comments/:videoId`
* `GET    /api/v1/comments/:videoId`
* `PATCH  /api/v1/comments/:commentId`
* `DELETE /api/v1/comments/:commentId`

---

### ❤️ Likes

* `POST   /api/v1/likes/toggle/video/:videoId`
* `POST   /api/v1/likes/toggle/comment/:commentId`
* `POST   /api/v1/likes/toggle/tweet/:tweetId`

---

### 📂 Playlists

* `POST   /api/v1/playlists`
* `GET    /api/v1/playlists/user/:userId`
* `PATCH  /api/v1/playlists/:playlistId`
* `DELETE /api/v1/playlists/:playlistId`
* `PATCH  /api/v1/playlists/add/:videoId/:playlistId`
* `PATCH  /api/v1/playlists/remove/:videoId/:playlistId`

---

### 🔔 Subscriptions

* `POST   /api/v1/subscriptions/toggle/:channelId`
* `GET    /api/v1/subscriptions/channel/:channelId`
* `GET    /api/v1/subscriptions/user/:userId`

---

## 🧠 Learning Outcomes

* Real‑world JWT authentication flow
* Secure password & token handling
* MongoDB indexing & aggregation pipelines
* Toggle‑based like & subscription systems
* RESTful API design
* Clean controller & middleware separation

---

## 📌 Future Improvements

* Video streaming & HLS support
* Watch history & recommendations
* Notifications system
* Role‑based access control (RBAC)
* API rate limiting & caching

---

## 🙌 Conclusion

**VideoTube Backend** is a complete, interview‑ready backend project showcasing modern backend engineering practices. It is suitable for **learning, portfolio showcase, and scaling into a full‑stack application**.

---

⭐ If you like this project, feel free to extend it and make it production‑ready!

## Author - JAVED# 🎥 VideoTube – Backend API

VideoTube is a **scalable, production‑style backend API** inspired by platforms like YouTube. It is built using **Node.js, Express.js, MongoDB**, and modern backend best practices such as **JWT authentication, Cloudinary file uploads, and secure user management**.

This project is designed as a **learning + portfolio‑ready backend**, with clean architecture, reusable utilities, optimized database queries, and interview‑focused concepts.

---

## 🚀 Features

### 👤 User Management

* User registration & login
* JWT‑based authentication (Access Token + Refresh Token)
* Secure password hashing using **bcrypt**
* Change password functionality
* Get current logged‑in user details
* Update user account details (name, email, etc.)

---

### 🖼️ Media Upload

* Avatar upload
* Cover image upload
* File handling using **Multer**
* Cloud storage using **Cloudinary**
* Automatic local file cleanup after upload

---

### 📺 Channel & Profile

* Get user channel profile by username
* Channel ownership logic
* Protected routes using JWT middleware

---

### 🎬 Video Management

* Create (upload) video metadata
* Update video details (title, description, thumbnail)
* Publish / unpublish videos
* Get single video details
* Get all videos with pagination
* Owner‑based authorization for video updates

---

### 💬 Comment System

* Add comment on a video
* Update comment (owner only)
* Delete comment (owner only)
* Fetch all comments of a video
* Optimized queries using **aggregation pipeline**

---

### ❤️ Like System (Toggle Based)

* Toggle like on videos
* Toggle like on comments
* Toggle like on tweets/posts
* Prevent duplicate likes using compound indexes
* Like count retrieval per resource

---

### 📂 Playlist Management

* Create playlist
* Update playlist (name, description)
* Delete playlist
* Add video to playlist
* Remove video from playlist
* Playlist ownership validation
* Duplicate video prevention using `$addToSet`

---

### 🔔 Subscription System

* Subscribe / unsubscribe to a channel (toggle)
* Get subscriber count of a channel
* Get channels subscribed by a user
* Efficient queries using indexed fields

---

### 🔐 Security

* HTTP‑only cookies for tokens
* Access & Refresh token strategy
* Middleware‑based route protection (`verifyJWT`)
* Environment variable based configuration

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT (Access & Refresh Tokens)
* **File Upload:** Multer
* **Cloud Storage:** Cloudinary
* **Security:** bcrypt, cookie‑parser
* **Dev Tools:** Nodemon, dotenv

---

## 📂 Project Structure

```
VideoTube-Backend/
│
├── src/
│   ├── controllers/      # Business logic (users, videos, comments, likes, playlists, subscriptions)
│   ├── models/           # Mongoose schemas & indexes
│   ├── routes/           # Express API routes
│   ├── middlewares/      # Auth, multer, error handlers
│   ├── utils/            # Reusable helpers & API responses
│   ├── config/           # Database & Cloudinary configuration
│   └── app.js            # Express app setup
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Authentication Flow (High Level)

1. User logs in using email & password
2. Server verifies credentials
3. **Access Token** (short‑lived) is generated
4. **Refresh Token** (long‑lived) is generated & stored
5. Tokens are sent via **HTTP‑only cookies**
6. Protected routes are accessed using `verifyJWT` middleware

---

## 📡 API Routes (Overview)

### 👤 Auth & User

* `POST   /api/v1/auth/register`
* `POST   /api/v1/auth/login`
* `POST   /api/v1/auth/logout`

* `POST   /api/v1/users/change-password`
* `GET    /api/v1/users/currentUser`
* `PATCH  /api/v1/users/update-account`

---

### 🖼️ Media

* `PATCH  /api/v1/users/avatar`
* `PATCH  /api/v1/users/cover-image`

---

### 🎬 Videos

* `POST   /api/v1/videos`
* `GET    /api/v1/videos`
* `GET    /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/toggle/publish/:videoId`

---

### 💬 Comments

* `POST   /api/v1/comments/:videoId`
* `GET    /api/v1/comments/:videoId`
* `PATCH  /api/v1/comments/:commentId`
* `DELETE /api/v1/comments/:commentId`

---

### ❤️ Likes

* `POST   /api/v1/likes/toggle/video/:videoId`
* `POST   /api/v1/likes/toggle/comment/:commentId`
* `POST   /api/v1/likes/toggle/tweet/:tweetId`

---

### 📂 Playlists

* `POST   /api/v1/playlists`
* `GET    /api/v1/playlists/user/:userId`
* `PATCH  /api/v1/playlists/:playlistId`
* `DELETE /api/v1/playlists/:playlistId`
* `PATCH  /api/v1/playlists/add/:videoId/:playlistId`
* `PATCH  /api/v1/playlists/remove/:videoId/:playlistId`

---

### 🔔 Subscriptions

* `POST   /api/v1/subscriptions/toggle/:channelId`
* `GET    /api/v1/subscriptions/channel/:channelId`
* `GET    /api/v1/subscriptions/user/:userId`

---

## 🧠 Learning Outcomes

* Real‑world JWT authentication flow
* Secure password & token handling
* MongoDB indexing & aggregation pipelines
* Toggle‑based like & subscription systems
* RESTful API design
* Clean controller & middleware separation

---

## 📌 Future Improvements

* Video streaming & HLS support
* Watch history & recommendations
* Notifications system
* Role‑based access control (RBAC)
* API rate limiting & caching

---

## 🙌 Conclusion

**VideoTube Backend** is a complete, interview‑ready backend project showcasing modern backend engineering practices. It is suitable for **learning, portfolio showcase, and scaling into a full‑stack application**.

---

⭐ If you like this project, feel free to extend it and make it production‑ready!

## Author - JAVED# 🎥 VideoTube – Backend API

VideoTube is a **scalable, production‑style backend API** inspired by platforms like YouTube. It is built using **Node.js, Express.js, MongoDB**, and modern backend best practices such as **JWT authentication, Cloudinary file uploads, and secure user management**.

This project is designed as a **learning + portfolio‑ready backend**, with clean architecture, reusable utilities, optimized database queries, and interview‑focused concepts.

---

## 🚀 Features

### 👤 User Management

* User registration & login
* JWT‑based authentication (Access Token + Refresh Token)
* Secure password hashing using **bcrypt**
* Change password functionality
* Get current logged‑in user details
* Update user account details (name, email, etc.)

---

### 🖼️ Media Upload

* Avatar upload
* Cover image upload
* File handling using **Multer**
* Cloud storage using **Cloudinary**
* Automatic local file cleanup after upload

---

### 📺 Channel & Profile

* Get user channel profile by username
* Channel ownership logic
* Protected routes using JWT middleware

---

### 🎬 Video Management

* Create (upload) video metadata
* Update video details (title, description, thumbnail)
* Publish / unpublish videos
* Get single video details
* Get all videos with pagination
* Owner‑based authorization for video updates

---

### 💬 Comment System

* Add comment on a video
* Update comment (owner only)
* Delete comment (owner only)
* Fetch all comments of a video
* Optimized queries using **aggregation pipeline**

---

### ❤️ Like System (Toggle Based)

* Toggle like on videos
* Toggle like on comments
* Toggle like on tweets/posts
* Prevent duplicate likes using compound indexes
* Like count retrieval per resource

---

### 📂 Playlist Management

* Create playlist
* Update playlist (name, description)
* Delete playlist
* Add video to playlist
* Remove video from playlist
* Playlist ownership validation
* Duplicate video prevention using `$addToSet`

---

### 🔔 Subscription System

* Subscribe / unsubscribe to a channel (toggle)
* Get subscriber count of a channel
* Get channels subscribed by a user
* Efficient queries using indexed fields

---

### 🔐 Security

* HTTP‑only cookies for tokens
* Access & Refresh token strategy
* Middleware‑based route protection (`verifyJWT`)
* Environment variable based configuration

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Database:** MongoDB (Mongoose)
* **Authentication:** JWT (Access & Refresh Tokens)
* **File Upload:** Multer
* **Cloud Storage:** Cloudinary
* **Security:** bcrypt, cookie‑parser
* **Dev Tools:** Nodemon, dotenv

---

## 📂 Project Structure

```
VideoTube-Backend/
│
├── src/
│   ├── controllers/      # Business logic (users, videos, comments, likes, playlists, subscriptions)
│   ├── models/           # Mongoose schemas & indexes
│   ├── routes/           # Express API routes
│   ├── middlewares/      # Auth, multer, error handlers
│   ├── utils/            # Reusable helpers & API responses
│   ├── config/           # Database & Cloudinary configuration
│   └── app.js            # Express app setup
│
├── .env.example
├── package.json
└── README.md
```

---

## 🔑 Authentication Flow (High Level)

1. User logs in using email & password
2. Server verifies credentials
3. **Access Token** (short‑lived) is generated
4. **Refresh Token** (long‑lived) is generated & stored
5. Tokens are sent via **HTTP‑only cookies**
6. Protected routes are accessed using `verifyJWT` middleware

---

## 📡 API Routes (Overview)

### 👤 Auth & User

* `POST   /api/v1/auth/register`
* `POST   /api/v1/auth/login`
* `POST   /api/v1/auth/logout`

* `POST   /api/v1/users/change-password`
* `GET    /api/v1/users/currentUser`
* `PATCH  /api/v1/users/update-account`

---

### 🖼️ Media

* `PATCH  /api/v1/users/avatar`
* `PATCH  /api/v1/users/cover-image`

---

### 🎬 Videos

* `POST   /api/v1/videos`
* `GET    /api/v1/videos`
* `GET    /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/:videoId`
* `PATCH  /api/v1/videos/toggle/publish/:videoId`

---

### 💬 Comments

* `POST   /api/v1/comments/:videoId`
* `GET    /api/v1/comments/:videoId`
* `PATCH  /api/v1/comments/:commentId`
* `DELETE /api/v1/comments/:commentId`

---

### ❤️ Likes

* `POST   /api/v1/likes/toggle/video/:videoId`
* `POST   /api/v1/likes/toggle/comment/:commentId`
* `POST   /api/v1/likes/toggle/tweet/:tweetId`

---

### 📂 Playlists

* `POST   /api/v1/playlists`
* `GET    /api/v1/playlists/user/:userId`
* `PATCH  /api/v1/playlists/:playlistId`
* `DELETE /api/v1/playlists/:playlistId`
* `PATCH  /api/v1/playlists/add/:videoId/:playlistId`
* `PATCH  /api/v1/playlists/remove/:videoId/:playlistId`

---

### 🔔 Subscriptions

* `POST   /api/v1/subscriptions/toggle/:channelId`
* `GET    /api/v1/subscriptions/channel/:channelId`
* `GET    /api/v1/subscriptions/user/:userId`

---

## 🧠 Learning Outcomes

* Real‑world JWT authentication flow
* Secure password & token handling
* MongoDB indexing & aggregation pipelines
* Toggle‑based like & subscription systems
* RESTful API design
* Clean controller & middleware separation

---

## 📌 Future Improvements

* Video streaming & HLS support
* Watch history & recommendations
* Notifications system
* Role‑based access control (RBAC)
* API rate limiting & caching

---

## 🙌 Conclusion

**VideoTube Backend** is a complete, interview‑ready backend project showcasing modern backend engineering practices. It is suitable for **learning, portfolio showcase, and scaling into a full‑stack application**.

---

⭐ If you like this project, feel free to extend it and make it production‑ready!

## Author - JAVED
