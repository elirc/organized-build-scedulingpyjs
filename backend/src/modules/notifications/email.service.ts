export const emailService = {
  async send(input: {
    recipientEmail: string;
    subject: string;
    body: string;
  }) {
    console.log("Simulated email", input);
    return { accepted: true };
  }
};

