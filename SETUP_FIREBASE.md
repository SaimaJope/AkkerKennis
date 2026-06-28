# AkkerBooster — Firebase backend setup (≈20 min)

This gives you a real backend with **4 tester accounts** who can log in, post replies,
and upvote each other's comments — all saved and shared live. No server to run, no
build step. The site keeps working on demo data until you finish step 4, so nothing
breaks while you set up.

What's already wired for you:
- `firebase.js` — the backend layer (auth + Firestore), exposed as `window.AK`.
- `firestore.rules` — security rules.
- **Sign-in page** (`SignIn.dc.html`) — real login.
- **Thread page** (`Thread.dc.html`) — replies + upvotes persist to Firestore, live.

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> → **Add project** (name it e.g. `akkerbooster`).
   You can skip Google Analytics.
2. In the project, click the **Web** icon (`</>`) → register an app (nickname `web`).
3. Copy the `firebaseConfig` object it shows you.

## 2. Paste the config

Open **`firebase.js`** and replace the `CONFIG` placeholder with your values:

```js
var CONFIG = {
  apiKey: 'AIza...',
  authDomain: 'akkerbooster.firebaseapp.com',
  projectId: 'akkerbooster',
  appId: '1:...:web:...',
};
```

> The web apiKey is **not a secret** — it only identifies your project. Real protection
> comes from the security rules in step 4.

## 3. Enable login + create the 4 testers

1. Console → **Authentication** → **Get started** → **Sign-in method** → enable **Email/Password**.
2. **Authentication → Users → Add user**, four times. Use these emails (or change them — just keep
   them matching the `TESTERS` map in `firebase.js`):

   | Email                      | Password (give to testers) | Name shown on site |
   |----------------------------|----------------------------|--------------------|
   | `piet@akkerbooster.test`   | _pick one_                 | Piet Bakker        |
   | `anna@akkerbooster.test`   | _pick one_                 | Anna de Wit        |
   | `joost@akkerbooster.test`  | _pick one_                 | Joost Visser       |
   | `sanne@akkerbooster.test`  | _pick one_                 | Sanne Mulder       |

   > Emails ending in `.test` are fine — Firebase doesn't send mail. To edit names, change
   > the `TESTERS` object at the top of `firebase.js`.

## 4. Create the database + rules

1. Console → **Firestore Database** → **Create database** → **Start in production mode** → pick a
   region (e.g. `europe-west`).
2. Open the **Rules** tab, paste the entire contents of **`firestore.rules`**, click **Publish**.

That's the backend live. Refresh the site, go to **Sign in**, log in as a tester — you can now
reply and upvote on a thread, and the other testers see it in real time.

## 5. (Optional) Seed the starter comments

A fresh thread starts empty. To pre-fill the three example replies so testers have something to
upvote, open the site, sign in, paste this in the browser **DevTools console**, and run it once:

```js
await Promise.all([
  AK.addReply('blackgrass-winter-wheat', 'On similar clay I only saw a real drop after committing to two spring crops back to back. By year three the head counts were visibly lower.'),
  AK.addReply('blackgrass-winter-wheat', 'Worth mapping the worst patches and treating them as no-wheat zones for a season. Targeted spring cropping gave us most of the benefit.'),
  AK.addReply('blackgrass-winter-wheat', 'Higher seed rates plus a competitive variety made a noticeable difference, but only alongside the cultural controls.'),
]);
```

(They'll be attributed to whoever you're signed in as — fine for a demo.)

## 6. Deploy

The site is fully static, so host it anywhere: **Firebase Hosting** (`npm i -g firebase-tools` →
`firebase init hosting` → `firebase deploy`), Netlify, Cloudflare Pages, etc. Give the four testers
the URL + their email/password.

---

## How it works (for when you extend it)

- Every page that needs the backend includes `<script src="./firebase.js"></script>` in `<head>`
  (already added to `SignIn` and `Thread`). Add that one line to any other page you wire up.
- In a component, load data in `componentDidMount()` and call `setState` when it arrives — see
  `Thread.dc.html` for the reference pattern (`AK.onAuth`, `AK.watchReplies`, `AK.addReply`,
  `AK.toggleReplyVote`).
- **Next candidates to wire** (same pattern): topic list (`Explore`/`Forum`) reading a `topics`
  collection, and `CreatePost.dc.html` writing to it. The rules already include a `topics` section.
- The current thread uses a single shared thread id (`blackgrass-winter-wheat`). When you give each
  topic its own page/id, pass it the same way the events/projects pages use `?id=`.
