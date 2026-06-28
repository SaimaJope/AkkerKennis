/* AkkerBooster — Firebase backend layer.
 *
 * One script, no build step. Loads the Firebase "compat" SDK from the CDN
 * (same pattern as gate.js / theme.js), initialises it, and exposes a small,
 * clean API on window.AK that the dc.html pages call. Everything is async and
 * degrades gracefully: if the config below is still a placeholder, the site
 * keeps working exactly as before with its built-in demo data.
 *
 * ── SETUP (see SETUP_FIREBASE.md for the full walkthrough) ───────────────────
 *  1. Create a Firebase project, add a Web app, copy its config into CONFIG.
 *  2. Enable Authentication → Email/Password.
 *  3. Create your 4 tester accounts and list their emails → names in TESTERS.
 *  4. Create a Firestore database and paste in firestore.rules.
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  if (window.AK) return; // already initialised on this page (e.g. loaded twice)

  // 1) PASTE your Firebase web config here (Project settings → Your apps → SDK).
  var CONFIG = {
    apiKey: 'AIzaSyDKI_BWvdGcsxDiRiUp8YVMVMfOJ5eWDH0',
    authDomain: 'akkerbooster-12aec.firebaseapp.com',
    projectId: 'akkerbooster-12aec',
    storageBucket: 'akkerbooster-12aec.firebasestorage.app',
    messagingSenderId: '1078604042938',
    appId: '1:1078604042938:web:13c92c5e263d7de5972883',
  };

  // 2) Your 4 testers: the email they sign in with → the name shown on the site.
  //    (Avoids needing a separate profiles table — names live here.)
  var TESTERS = {
    'piet@akkerbooster.test': 'Piet Bakker',
    'anna@akkerbooster.test': 'Anna de Wit',
    'joost@akkerbooster.test': 'Joost Visser',
    'sanne@akkerbooster.test': 'Sanne Mulder',
  };

  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = function () { rej(new Error('Failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function configured() {
    return !!CONFIG.apiKey && CONFIG.apiKey.indexOf('PASTE') !== 0;
  }

  function initials(name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/);
    var a = parts[0] ? parts[0][0] : '';
    var b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase() || a.toUpperCase();
  }

  // ── Image processing (no Firebase Storage — that needs a paid plan) ─────────
  // Shrink a chosen photo in the browser and return a JPEG data URL we can store
  // inline. Firestore caps a document near 1 MiB, so we step quality/size down
  // until the result fits under `maxBytes`.
  function loadImageEl(file) {
    return new Promise(function (res, rej) {
      var reader = new FileReader();
      reader.onerror = function () { rej(new Error('Could not read the file')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { rej(new Error('Could not load the image')); };
        img.onload = function () { res(img); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function encodeImage(img, maxDim, quality) {
    var w = img.width, h = img.height;
    var scale = Math.min(1, maxDim / Math.max(w, h, 1));
    var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
    var canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    var c = canvas.getContext('2d');
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, cw, ch); // flatten any transparency (PNG screenshots)
    c.drawImage(img, 0, 0, cw, ch);
    return canvas.toDataURL('image/jpeg', quality);
  }
  function processImage(file, maxBytes) {
    if (!file) return Promise.reject(new Error('No file selected'));
    if (file.type && file.type.indexOf('image/') !== 0) return Promise.reject(new Error('Only image files are allowed'));
    return loadImageEl(file).then(function (img) {
      var attempts = [[1280, 0.62], [1024, 0.55], [820, 0.5], [640, 0.45]];
      var best = null;
      for (var i = 0; i < attempts.length; i++) {
        var url = encodeImage(img, attempts[i][0], attempts[i][1]);
        best = url;
        if (url.length <= maxBytes) return url;
      }
      if (best && best.length <= maxBytes * 1.25) return best;
      throw new Error('This photo is too large — try a smaller or simpler image');
    });
  }

  // Resolve the SDK once. Returns { auth, db, fb } or null if not configured.
  var ready = (function () {
    if (!configured()) {
      console.warn('[AK] Firebase not configured yet — site runs on built-in demo data. Fill in CONFIG in firebase.js.');
      return Promise.resolve(null);
    }
    return loadScript(SDK + 'firebase-app-compat.js')
      .then(function () { return loadScript(SDK + 'firebase-auth-compat.js'); })
      .then(function () { return loadScript(SDK + 'firebase-firestore-compat.js'); })
      .then(function () {
        var fb = window.firebase;
        fb.initializeApp(CONFIG);
        return { auth: fb.auth(), db: fb.firestore(), fb: fb };
      })
      .catch(function (e) {
        console.error('[AK] Firebase failed to initialise:', e);
        return null;
      });
  })();

  // Current signed-in user, normalised for the UI. Updated on every auth change.
  var me = null;
  function shapeUser(u) {
    if (!u) return null;
    var name = TESTERS[u.email] || u.email;
    return { uid: u.uid, email: u.email, name: name, initials: initials(name) };
  }

  window.AK = {
    ready: ready,
    isConfigured: configured,
    me: function () { return me; },

    // ── Auth ────────────────────────────────────────────────────────────────
    onAuth: function (cb) {
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        ctx.auth.onAuthStateChanged(function (u) {
          me = shapeUser(u);
          cb(me);
        });
      });
      return function () {};
    },
    signIn: function (email, password) {
      return ready.then(function (ctx) {
        if (!ctx) throw new Error('Backend not configured');
        return ctx.auth.signInWithEmailAndPassword(email, password);
      });
    },
    signOut: function () {
      return ready.then(function (ctx) { return ctx && ctx.auth.signOut(); });
    },

    // ── Replies (comments) ──────────────────────────────────────────────────
    // Realtime list for one thread. cb receives an array (or null if offline).
    watchReplies: function (threadId, cb) {
      var unsub = function () {};
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        // No composite index needed: filter server-side, sort client-side.
        unsub = ctx.db.collection('replies').where('threadId', '==', threadId)
          .onSnapshot(function (snap) {
            var rows = snap.docs.map(function (d) {
              var data = d.data();
              return {
                id: d.id,
                threadId: data.threadId,
                body: data.body,
                authorUid: data.authorUid,
                authorName: data.authorName,
                authorInitials: data.authorInitials || initials(data.authorName),
                votes: data.votes || [],
                images: data.images || [],
                edited: !!data.edited,
                originalBody: data.originalBody || '',
                createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : 0,
              };
            });
            rows.sort(function (a, b) { return a.createdAt - b.createdAt; });
            cb(rows, null);
          }, function (err) {
            console.error('[AK] watchReplies:', err);
            cb(null, (err && err.message) ? err.message : 'Could not load comments');
          });
      });
      return function () { unsub(); };
    },
    addReply: function (threadId, body, images) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to reply');
        var who = shapeUser(u);
        return ctx.db.collection('replies').add({
          threadId: threadId,
          body: String(body || '').trim(),
          authorUid: u.uid,
          authorName: who.name,
          authorInitials: who.initials,
          votes: [],
          images: Array.isArray(images) ? images : [],
          createdAt: ctx.fb.firestore.FieldValue.serverTimestamp(),
        });
      });
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    // Shrink an image in the browser and resolve to an inline JPEG data URL,
    // stored on the topic/reply doc. No Firebase Storage (and so no paid plan).
    // `folder` is accepted for call-site compatibility but unused here.
    uploadImage: function (file, folder) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to add photos');
        return processImage(file, 300 * 1024);
      });
    },
    // ── Topics (posts) ──────────────────────────────────────────────────────
    // Realtime list of all topics, newest first.
    watchTopics: function (cb) {
      var unsub = function () {};
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        unsub = ctx.db.collection('topics').onSnapshot(function (snap) {
          var rows = snap.docs.map(function (d) {
            var data = d.data();
            return {
              id: d.id,
              title: data.title,
              summary: data.summary || data.body || '',
              category: data.category || 'General',
              region: data.region || '',
              regionId: data.regionId || '',
              type: data.type || 'Question',
              images: data.images || [],
              tags: data.tags || [],
              seekingProject: !!data.seekingProject,
              authorName: data.authorName,
              authorInitials: data.authorInitials || initials(data.authorName),
              createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : 0,
            };
          });
          rows.sort(function (a, b) { return b.createdAt - a.createdAt; });
          cb(rows, null);
        }, function (err) { console.error('[AK] watchTopics:', err); cb(null, (err && err.message) || 'Could not load topics'); });
      });
      return function () { unsub(); };
    },
    // One-off fetch of a single topic (for the thread detail view).
    getTopic: function (topicId) {
      return ready.then(function (ctx) {
        if (!ctx) return null;
        return ctx.db.collection('topics').doc(topicId).get().then(function (d) {
          return d.exists ? Object.assign({ id: d.id }, d.data()) : null;
        });
      });
    },
    // Create a topic; resolves to the new topic's id.
    addTopic: function (data) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to post');
        var who = shapeUser(u);
        return ctx.db.collection('topics').add({
          title: String(data.title || '').trim(),
          summary: String(data.summary || '').trim(),
          body: String(data.body || '').trim(),
          tried: String(data.tried || '').trim(),
          category: data.category || 'General',
          crop: String(data.crop || '').trim(),
          region: data.region || '',
          regionId: data.regionId || '',
          type: data.type || 'Question',
          images: Array.isArray(data.images) ? data.images : [],
          tags: Array.isArray(data.tags) ? data.tags : [],
          seekingProject: !!data.seekingProject,
          authorUid: u.uid,
          authorName: who.name,
          authorInitials: who.initials,
          createdAt: ctx.fb.firestore.FieldValue.serverTimestamp(),
        }).then(function (ref) { return ref.id; });
      });
    },

    // ── Events ────────────────────────────────────────────────────────────────
    // Realtime list of all events, newest first.
    watchEvents: function (cb) {
      var unsub = function () {};
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        unsub = ctx.db.collection('events').onSnapshot(function (snap) {
          var rows = snap.docs.map(function (d) {
            var data = d.data();
            return Object.assign({ id: d.id }, data, {
              createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : 0,
            });
          });
          rows.sort(function (a, b) { return b.createdAt - a.createdAt; });
          cb(rows, null);
        }, function (err) { console.error('[AK] watchEvents:', err); cb(null, (err && err.message) || 'Could not load events'); });
      });
      return function () { unsub(); };
    },
    getEvent: function (eventId) {
      return ready.then(function (ctx) {
        if (!ctx) return null;
        return ctx.db.collection('events').doc(eventId).get().then(function (d) {
          return d.exists ? Object.assign({ id: d.id }, d.data()) : null;
        });
      });
    },
    addEvent: function (data) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to add an event');
        var who = shapeUser(u);
        return ctx.db.collection('events').add({
          title: String(data.title || '').trim(),
          type: data.type || 'Workshop',
          date: String(data.date || '').trim(),
          time: String(data.time || '').trim(),
          location: String(data.location || '').trim(),
          region: data.region || '',
          regionId: data.regionId || '',
          organiser: String(data.organiser || who.name).trim(),
          organiserRole: String(data.organiserRole || '').trim(),
          organiserInitials: initials(String(data.organiser || who.name)),
          host: String(data.host || '').trim(),
          capacity: String(data.capacity || '').trim(),
          cost: String(data.cost || '').trim(),
          whatsappUrl: String(data.whatsappUrl || '').trim(),
          summary: String(data.summary || '').trim(),
          description: String(data.description || '').trim(),
          agenda: String(data.agenda || '').trim(),
          tags: Array.isArray(data.tags) ? data.tags : [],
          authorUid: u.uid,
          authorName: who.name,
          authorInitials: who.initials,
          createdAt: ctx.fb.firestore.FieldValue.serverTimestamp(),
        }).then(function (ref) { return ref.id; });
      });
    },

    // ── Projects ──────────────────────────────────────────────────────────────
    // Realtime list of all projects, newest first.
    watchProjects: function (cb) {
      var unsub = function () {};
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        unsub = ctx.db.collection('projects').onSnapshot(function (snap) {
          var rows = snap.docs.map(function (d) {
            var data = d.data();
            return Object.assign({ id: d.id }, data, {
              createdAt: data.createdAt && data.createdAt.toMillis ? data.createdAt.toMillis() : 0,
            });
          });
          rows.sort(function (a, b) { return b.createdAt - a.createdAt; });
          cb(rows, null);
        }, function (err) { console.error('[AK] watchProjects:', err); cb(null, (err && err.message) || 'Could not load projects'); });
      });
      return function () { unsub(); };
    },
    getProject: function (projectId) {
      return ready.then(function (ctx) {
        if (!ctx) return null;
        return ctx.db.collection('projects').doc(projectId).get().then(function (d) {
          return d.exists ? Object.assign({ id: d.id }, d.data()) : null;
        });
      });
    },
    addProject: function (data) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to add a project');
        var who = shapeUser(u);
        return ctx.db.collection('projects').add({
          title: String(data.title || '').trim(),
          status: data.status === 'past' ? 'past' : 'ongoing',
          manager: String(data.manager || who.name).trim(),
          managerRole: String(data.managerRole || '').trim(),
          managerInitials: initials(String(data.manager || who.name)),
          originator: String(data.originator || '').trim(),
          funder: String(data.funder || '').trim(),
          region: data.region || '',
          regionId: data.regionId || '',
          timeline: String(data.timeline || '').trim(),
          participants: String(data.participants || '').trim(),
          whatsappUrl: String(data.whatsappUrl || '').trim(),
          summary: String(data.summary || '').trim(),
          overview: String(data.overview || '').trim(),
          milestones: String(data.milestones || '').trim(),
          tags: Array.isArray(data.tags) ? data.tags : [],
          authorUid: u.uid,
          authorName: who.name,
          authorInitials: who.initials,
          createdAt: ctx.fb.firestore.FieldValue.serverTimestamp(),
        }).then(function (ref) { return ref.id; });
      });
    },

    // Toggle the current user's upvote on a reply (atomic, race-safe).
    toggleReplyVote: function (replyId) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to upvote');
        var ref = ctx.db.collection('replies').doc(replyId);
        var FV = ctx.fb.firestore.FieldValue;
        return ctx.db.runTransaction(function (tx) {
          return tx.get(ref).then(function (snap) {
            var votes = (snap.data() && snap.data().votes) || [];
            var has = votes.indexOf(u.uid) !== -1;
            tx.update(ref, { votes: has ? FV.arrayRemove(u.uid) : FV.arrayUnion(u.uid) });
          });
        });
      });
    },
    // Edit / delete a reply (rules already restrict these to the author).
    editReply: function (replyId, body) {
      return ready.then(function (ctx) {
        if (!ctx || !ctx.auth.currentUser) throw new Error('Sign in to edit');
        var ref = ctx.db.collection('replies').doc(replyId);
        return ctx.db.runTransaction(function (tx) {
          return tx.get(ref).then(function (snap) {
            var data = snap.data() || {};
            var patch = { body: String(body || '').trim(), edited: true };
            // Preserve the very first version so anyone can see the original.
            if (!data.originalBody) patch.originalBody = data.body || '';
            tx.update(ref, patch);
          });
        });
      });
    },
    deleteReply: function (replyId) {
      return ready.then(function (ctx) {
        if (!ctx || !ctx.auth.currentUser) throw new Error('Sign in to delete');
        return ctx.db.collection('replies').doc(replyId).delete();
      });
    },

    // ── Thread reactions (shared "Boost idea" / "I have this issue too") ──────
    // Counts live in threadStats/{threadId} as arrays of user ids, so everyone
    // sees the same totals in real time. Works for the demo thread and posts.
    watchThreadStats: function (threadId, cb) {
      var unsub = function () {};
      ready.then(function (ctx) {
        if (!ctx) { cb(null); return; }
        unsub = ctx.db.collection('threadStats').doc(threadId).onSnapshot(function (snap) {
          var d = snap.exists ? snap.data() : {};
          cb({ boosts: d.boosts || [], issues: d.issues || [] });
        }, function (err) { console.error('[AK] watchThreadStats:', err); cb(null); });
      });
      return function () { unsub(); };
    },
    // field is 'boosts' or 'issues'. Toggles the current user in/out of it.
    toggleThreadReaction: function (threadId, field) {
      return ready.then(function (ctx) {
        var u = ctx && ctx.auth.currentUser;
        if (!u) throw new Error('Sign in to react');
        var ref = ctx.db.collection('threadStats').doc(threadId);
        var FV = ctx.fb.firestore.FieldValue;
        return ctx.db.runTransaction(function (tx) {
          return tx.get(ref).then(function (snap) {
            var arr = (snap.exists && snap.data()[field]) || [];
            var has = arr.indexOf(u.uid) !== -1;
            var patch = {};
            if (snap.exists) {
              patch[field] = has ? FV.arrayRemove(u.uid) : FV.arrayUnion(u.uid);
              tx.update(ref, patch);
            } else {
              patch[field] = [u.uid];
              tx.set(ref, patch);
            }
          });
        });
      });
    },
  };
})();
