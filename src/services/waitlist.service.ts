
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #faf5ee; padding: 40px 20px; color: #3a302a; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eae2da;">
                <div style="background-color: #c2652a; padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Welcome to AgileSuit</h1>
                </div>
                <div style="padding: 40px; text-align: center;">
                  <h2 style="color: #3a302a; font-size: 22px; margin-bottom: 16px;">You're officially on the list!</h2>
                  <p style="color: #605850; font-size: 16px; margin-bottom: 32px;">
                    Thank you for joining the waitlist. We're building the operating system for high-performing teams, and we're thrilled to have you with us for the journey.
                  </p>
                  <div style="margin-bottom: 32px;">
                    <a href="https://agilesuit.com" style="background-color: #c2652a; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Explore AgileSuit</a>
                  </div>
                  <p style="color: #9a9088; font-size: 14px;">
                    We'll notify you as soon as early access spots open up. In the meantime, stay tuned for updates!
                  </p>
                </div>
                <div style="background-color: #f6f0e8; padding: 20px; text-align: center; border-top: 1px solid #eae2da;">
                  <p style="color: #9a9088; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} AgileSuit. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        },
      });
      console.log('Waitlist Service: Premium mail document created successfully');
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
