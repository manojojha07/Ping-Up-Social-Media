import { Inngest } from "inngest";
import User from "../models/userModel.js";

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

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];
