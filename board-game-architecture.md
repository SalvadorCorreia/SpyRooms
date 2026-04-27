# Board Game Architecture and Security Design

This document outlines the system for a web-based board game that allows custom themes without changing the core code. The system is built to be secure and run at zero cost.

## 1. System Layout

The system is split into three main parts:

* **Client:** The browser. It only shows the game and sends user actions to the server.
* **Router:** Checks all incoming data. It blocks large files and bad requests.
* **Game Room:** A temporary server that holds the game rules and current scores in memory.

## 2. Real-Time Setup

* **WebSockets:** Used for fast, two-way communication between players and the game.
* **Cost Control:** The system uses serverless tools that only consume resources when processing a move, not while players are idle.

## 3. Technology Stack

The Cloudflare platform is used to maintain zero operational costs:

* **Workers:** Route traffic quickly.
* **Durable Objects:** Run the active game rooms.
* **R2 Storage:** Stores images and custom themes.
* **D1 Database:** Manages user accounts safely.

## 4. Frontend Design

* **Server-Driven UI:** The server tells the client exactly what to display.
* **Safety:** Users cannot upload custom code. They can only upload settings that match pre-approved layouts.

## 5. Backend Logic

* **Game States:** The server strictly controls the game flow (Lobby, Setup, Playing).
* **Data Hiding:** The server only sends public information to regular players. Secret card identities are only sent to the specific players allowed to see them.

## 6. Security Rules

* **No Code Execution:** Custom themes cannot contain scripts or external links.
* **Size Limits:** All data uploads have strict limits to prevent crashes.
* **Isolated Storage:** Users cannot access or change other users' custom packages.
* **Safe Data:** The system uses secure data structures to prevent injection attacks.

## 7. Cost Saving Plan

* **Small Updates:** The server only sends changes (like a single flipped card) instead of the whole board layout every turn.
* **Sleep Mode:** Game rooms go to sleep when players are inactive to save server time.
* **Caching:** Images are saved in the user's browser so they do not need to be downloaded repeatedly.

## 8. Build Plan

* **Phase 1:** Build the core game and real-time connections.
* **Phase 2:** Add the ability to upload custom themes.
* **Phase 3:** Lock down security and block bad data.
* **Phase 4:** Apply network and cost-saving optimizations.
