// Email.ts
import emailjs from "@emailjs/browser";

export const sendFeedbackEmail = async (params: {
  user_name: string;
  service_id: string;
  feedback_link: string;
  to_email: string;
}) => {
  try {
    await emailjs.send(
      "service_jq55wr4",     // service ID
      "template_4ufhksj",    // template ID
      params,
      "o-QKANnEf9DXhADNO"    // public key
    );
    return true;
  } catch (err) {
    console.error("FAILED...", err);
    return false;
  }
};
