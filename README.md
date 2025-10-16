# ResolveIT: Smart Grievance & Feedback Management System

**Project Title:** Online Complaint and Grievance Portal

## 📝 Project Overview

ResolveIT is a modern, transparent, and efficient platform designed to handle user grievances and feedback within institutions. It allows users to submit complaints, track their status, and escalate unresolved issues, providing administrators with a robust system to manage the resolution process. The system is built to improve transparency and efficiency in complaint handling.

## ✨ Key Features & Outcomes

The platform includes the following core functionalities:

* **Submission Flexibility:** Users can submit complaints **anonymously or by logging into their account** (verified).
* **Evidence Upload:** Users can attach supporting evidence, including images or videos, to their complaints.
* **Status Tracking:** Complaints follow a clear, trackable status flow (**New → Under Review → Resolved**). Users can view a **chronological timeline** of all status changes.
* **Admin Management:** The Admin Panel allows staff to **assign complaints**, update their status, add **internal notes** (staff-only), and send **public replies** to users.
* **Escalation Logic:** Unresolved complaints that exceed a set time can be automatically **escalated to senior admins or designated higher authorities**.
* **Reports & Analytics:** Admins can view **visual dashboards** to monitor performance and recurring issues, and **export complaint data** (**CSV/PDF**) for audits and reporting.

## 🛠️ Technology Stack & Architecture

The project is built using a three-tier architecture:

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React App (Communicates via Axios/Fetch) |
| **Backend/API** | Node.js + Express |
| **Database** | MySQL (Utilizing Sequelize ORM) |

## 📊 Database Schema Highlights

Key tables in the system include:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `Users` | Stores user and admin accounts | `id`, `name`, `email`, `password`, `role` |
| `Complaints` | Main table for all submissions | `id`, `user_id`, `is_anonymous`, `category`, `description`, `urgency` |
| `StatusLogs` | Chronological record of updates | `id`, `complaint_id`, `status`, `comment`, `updated_by` |
| `Escalations` | Records cases forwarded to higher authority | `id`, `complaint_id`, `escalated_to`, `reason`, `escalated_at` |
| `MediaUploads` | Stores file paths for evidence | `id`, `complaint_id`, `file_path`, `uploaded_at` |

## 🚀 Setup and Installation (React, Node.js, MySQL)

### Prerequisites

* Node.js (LTS version recommended)
* MySQL Server (and credentials for a user)

### 1. Clone the Repository

```bash
git clone [https://github.com/Sindhuks610/online-complaint-portal-and-feedback-system.git](https://github.com/Sindhuks610/online-complaint-portal-and-feedback-system.git)
cd online-complaint-portal-and-feedback-system
