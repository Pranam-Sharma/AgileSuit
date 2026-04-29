
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/auth/firebase/client';

/**
 * Service to handle waitlist logic and trigger automated emails
 * via the Firebase Trigger Email extension.
 */
export const joinWaitlist = async (email: string, source: string = 'landing_page') => {
  if (!email) throw new Error("Email is required");

  try {
    // --- Step 1: Save waitlist entry ---
    // Requirement: DO NOT remove or change existing waitlist_emails logic.
    const waitlistRef = collection(db, 'waitlist_emails');
    await addDoc(waitlistRef, {
      email: email,
      source: source,
      updated_at: serverTimestamp(),
    });

    // --- Step 2: Trigger confirmation email ---
    // Requirement: Happens only after Step 1 succeeds (sequential).
    try {
      const mailRef = collection(db, 'mail');
      await addDoc(mailRef, {
        to: [email],
        message: {
          subject: "You're on the AgileSuit waitlist 🚀",
          html: `
            <p>Hi,</p>
            <p>Thanks for joining the <strong>AgileSuit</strong> waitlist.</p>
            <p>We’re building a platform that helps teams <strong>actually improve every sprint</strong>, not just track tasks.</p>
            <p>You’ll be among the first to get access.</p>
            <p style="margin-top:16px;">— Team AgileSuit</p>
          `,
        },
      });
    } catch (emailError) {
      // Requirement: If email trigger fails, log error but do not break the flow.
      console.error('Waitlist Service: Email trigger failed but entry was saved:', emailError);
    }

    return { success: true };
  } catch (error: any) {
    // Requirement: If waitlist save fails, do not send email.
    console.error('Waitlist Service: Failed to save entry:', error);
    throw new Error(error.message || 'Failed to join waitlist. Please try again.');
  }
};
