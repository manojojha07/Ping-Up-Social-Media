import { Inngest } from "inngest";
import User from "../models/userModel.js";
import Connection from "../models/Connection.js";
import sendEmail from "../config/nodemailer.js";

export const inngest = new Inngest({ id: "pingup-app" });

// CREATE USER
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      const email = email_addresses[0].email_address;
      let username = email.split("@")[0];

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        username = `${username}${Math.floor(Math.random() * 10000)}`;
      }

      await User.create({
        _id: id, // make sure schema allows String
        email,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username,
      });

    } catch (error) {
      console.error("❌ Inngest user create error:", error);
      throw error;
    }
  }
);

// UPDATE USER
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;

      await User.findByIdAndUpdate(id, {
        email: email_addresses[0].email_address,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
      });

    } catch (error) {
      console.error("❌ Inngest user update error:", error);
      throw error;
    }
  }
);

// DELETE USER
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await User.findByIdAndDelete(event.data.id);
    } catch (error) {
      console.error("❌ Inngest user delete error:", error);
      throw error;
    }
  }
);


// inngest function to send remider when a new connection request is add
const sendConnectionRequestReminder = inngest.createFunction(

  { id: 'send-new-connection-request-reminder' },
  { event: 'app/connection-request' },
  async (event, step) => {
    const { connectionId } = event.data;

    await step.run('send-connection-request-mail', async () => {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')
      const subject = ` 👋 New Connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
             <h2>Hi ${connection.to_user_id.full_name},</h2>
             <p>You have a new connection request from ${connection.from_user_id.
          full_name} @${connection.from_user_id.username}</p>
             <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:
              #10b981;">here</a> to accept or reject the request</p>
          <br/>
          <p>Thanks, <br/>PingUp Stay Connected</p>
            </div> `;

            await sendEmail({
              to:connection.to_user_id.email,
              subject,
              body
            });
    });
    const in24Hors = new Date(Date.now() +24 * 60 * 60 * 1000);

    await step.sleepUntil('wait-for-24-hours', in24Hors);
    await step.run('send-connection-request-reminder', async()=> {
      const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id');
      if(connection === "accepted"){
        return {message: 'Already accepted'}
      }
      const subject = ` 👋 New Connection Request`;
      const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
             <h2>Hi ${connection.to_user_id.full_name},</h2>
             <p>You have a new connection request from ${connection.from_user_id.
          full_name} @${connection.from_user_id.username}</p>
             <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:
              #10b981;">here</a> to accept or reject the request</p>
          <br/>
          <p>Thanks, <br/>PingUp Stay Connected</p>
            </div> `;

            await sendEmail({
              to:connection.to_user_id.email,
              subject,
              body
            });
            return {message: "Remider Sent"};
    })
  }
)

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  sendConnectionRequestReminder
];
