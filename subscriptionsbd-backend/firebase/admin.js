"use strict";

const admin = require("firebase-admin");

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log("✅ Firebase Admin SDK initialized — project:", process.env.FIREBASE_PROJECT_ID);
    return firebaseApp;
  } catch (error) {
    console.error("❌ Firebase Admin init failed:", error.message);
    throw error;
  }
};

const verifyFirebaseToken = async (idToken) => {
  initFirebase();
  return await admin.auth().verifyIdToken(idToken);
};

const getFirebaseUser = async (uid) => {
  initFirebase();
  return await admin.auth().getUser(uid);
};

const deleteFirebaseUser = async (uid) => {
  initFirebase();
  await admin.auth().deleteUser(uid);
};

module.exports = { initFirebase, verifyFirebaseToken, getFirebaseUser, deleteFirebaseUser, admin };
