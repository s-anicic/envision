# Envision

**Envision** — a goal tracker and vision board inspired web app to help you track and envision your dream life.

### Tech Stack

* **Framework:** Next.js (React)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Backend:** Firebase (Firestore, Authentication, Storage)
* **Icons:** Lucide React

### Features

* **Goal Tracking:** Create, prioritise, and track the progress of your personal, career, study, health, and finance goals.
* **Vision Board:** A dynamic, masonry layout to visualise the life you want to live and the version of yourself you want to be.
* **Image Support:** Upload photos directly or add them via URL.
* **Text Blocks:** Add quotes, affirmations, or notes alongside your images.
* **Minimal Design:** A clean, modern interface built for clarity and focus.

---

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/s-anicic/envision.git
cd envision

```

2. **Install dependencies**

```bash
npm install

```

3. **Environment Setup**
Create a `.env.local` file and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

```

4. **Run the development server**

```bash
npm run dev

```
