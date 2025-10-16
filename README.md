# ResolveIT: Smart Grievance & Feedback Management System

[cite_start]**Project Title:** Online Complaint and Grievance Portal [cite: 1]

## 📝 Project Overview

[cite_start]ResolveIT is a modern, transparent, and efficient platform designed to handle user grievances and feedback within institutions[cite: 3]. [cite_start]It allows users to submit complaints, track their status [cite: 7][cite_start], and escalate unresolved issues [cite: 17][cite_start], providing administrators with a robust system to manage the resolution process[cite: 3]. The system is built to improve transparency and efficiency in complaint handling.

## ✨ Key Features & Outcomes

The platform includes the following core functionalities:

* [cite_start]**Submission Flexibility:** Users can submit complaints **anonymously or by logging into their account** (verified)[cite: 5, 24, 25].
* [cite_start]**Evidence Upload:** Users can attach supporting evidence, including images or videos, to their complaints[cite: 9, 28, 45, 47].
* [cite_start]**Status Tracking:** Complaints follow a clear, trackable status flow [cite: 59] (**New → Under Review → Resolved**) [cite_start][cite: 57, 58, 165]. [cite_start]Users can view a **chronological timeline** of all status changes[cite: 61, 62].
* [cite_start]**Admin Management:** The Admin Panel allows staff to **assign complaints** [cite: 90][cite_start], update their status [cite: 91][cite_start], add **internal notes** (staff-only) [cite: 93][cite_start], and send **public replies** to users[cite: 94].
* [cite_start]**Escalation Logic:** Unresolved complaints that exceed a set time can be automatically **escalated to senior admins or designated higher authorities**[cite: 114, 115, 168, 169].
* [cite_start]**Reports & Analytics:** Admins can view **visual dashboards** to monitor performance and recurring issues [cite: 19, 131][cite_start], and **export complaint data** (**CSV/PDF**) for audits and reporting[cite: 20, 133, 134].

## 🛠️ Technology Stack & Architecture

The project is built using a three-tier architecture:

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | [cite_start]React App (Communicates via Axios/Fetch) [cite: 183, 186, 194] |
| **Backend/API** | [cite_start]Node.js + Express [cite: 191] |
| **Database** | [cite_start]MySQL [cite: 199] [cite_start](Utilizing Sequelize ORM [cite: 192]) |

## 📊 Database Schema Highlights

Key tables in the system include:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `Users` | Stores user and admin accounts | [cite_start]`id`, `name`, `email`, `password`, `role` [cite: 200-212] |
| `Complaints` | Main table for all submissions | [cite_start]`id`, `user_id`, `is_anonymous`, `category`, `description`, `urgency` [cite: 213, 217-232, 238, 245, 250] |
| `StatusLogs` | Chronological record of updates | [cite_start]`id`, `complaint_id`, `status`, `comment`, `updated_by` [cite: 215, 221-230, 235, 242, 247] |
| `Escalations` | Records cases forwarded to higher authority | [cite_start]`id`, `complaint_id`, `escalated_to`, `reason`, `escalated_at` [cite: 216, 223, 224, 229, 237, 244, 249] |
| `MediaUploads` | Stores file paths for evidence | [cite_start]`id`, `complaint_id`, `file_path`, `uploaded_at` [cite: 214, 219, 220, 227, 228, 233, 240] |

## 🚀 Setup and Installation (React, Node.js, MySQL)

### Prerequisites

* Node.js (LTS version recommended)
* MySQL Server (and credentials for a user)

### 1. Clone the Repository

```bash
git clone [https://github.com/Sindhuks610/online-complaint-portal-and-feedback-system.git](https://github.com/Sindhuks610/online-complaint-portal-and-feedback-system.git)
cd online-complaint-portal-and-feedback-system