import { supabase } from "../config/supabase";
import {
  Student,
  Company,
  Project,
  Bid,
  Notification,
  Message,
} from "../types";

// User Management
export const createUser = async (
  userData: Partial<Student | Company>,
  password: string
) => {
  try {
    console.log("Creating user with email:", userData.email);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email!,
      password: password,
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      throw authError;
    }

    if (!authData.user) {
      throw new Error("Failed to create user - no user returned");
    }

    console.log("Auth user created, creating profile...");

    // Create user profile in database
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        ...userData,
        created_at: new Date().toISOString(),
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Profile creation error:", error);
      throw error;
    }

    console.log("User profile created successfully");
    return data;
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Provide more specific error messages
    if (error.message?.includes("already registered")) {
      throw new Error("An account with this email already exists");
    }
    if (error.message?.includes("invalid email")) {
      throw new Error("Please enter a valid email address");
    }
    if (error.message?.includes("weak password")) {
      throw new Error("Password must be at least 6 characters long");
    }

    throw new Error(error.message || "Failed to create user account");
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    console.log("Signing in user:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);

      // Provide more specific error messages
      if (error.message?.includes("Invalid login credentials")) {
        throw new Error(
          "Invalid email or password. Please check your credentials and try again."
        );
      }
      if (error.message?.includes("Email not confirmed")) {
        throw new Error(
          "Please check your email and click the confirmation link before signing in."
        );
      }
      if (error.message?.includes("Too many requests")) {
        throw new Error(
          "Too many login attempts. Please wait a few minutes and try again."
        );
      }

      throw error;
    }

    console.log("Sign in successful");
    return data.user;
  } catch (error: any) {
    console.error("Error signing in user:", error);
    throw new Error(error.message || "Failed to sign in");
  }
};

export const signOutUser = async () => {
  try {
    console.log("Signing out user...");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log("Sign out successful");
  } catch (error: any) {
    console.error("Error signing out user:", error);
    throw new Error(error.message || "Failed to sign out");
  }
};

export const getUserById = async (
  userId: string
): Promise<Student | Company | null> => {
  try {
    console.log("Getting user by ID:", userId);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Get user error:", error);

      if (error.code === "PGRST116") {
        console.log("User profile not found in database");
        return null;
      }

      throw error;
    }

    console.log("User found:", data ? "Success" : "No data");
    return data as Student | Company;
  } catch (error: any) {
    console.error("Error getting user:", error);
    throw new Error(error.message || "Failed to get user");
  }
};

export const updateUser = async (
  userId: string,
  userData: Partial<Student | Company>
) => {
  try {
    const { error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
};

// Project Management
export const createProject = async (
  projectData: Omit<Project, "id" | "createdAt">
) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating project:", error);
    throw new Error(error.message || "Failed to create project");
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  } catch (error: any) {
    console.error("Error getting projects:", error);
    throw new Error(error.message || "Failed to get projects");
  }
};

export const getProjectById = async (
  projectId: string
): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) throw error;
    return data as Project;
  } catch (error: any) {
    console.error("Error getting project:", error);
    throw new Error(error.message || "Failed to get project");
  }
};

export const getProjectsByCompany = async (
  companyId: string
): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  } catch (error: any) {
    console.error("Error getting company projects:", error);
    throw new Error(error.message || "Failed to get company projects");
  }
};

export const updateProject = async (
  projectId: string,
  projectData: Partial<Project>
) => {
  try {
    const { error } = await supabase
      .from("projects")
      .update(projectData)
      .eq("id", projectId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating project:", error);
    throw new Error(error.message || "Failed to update project");
  }
};

// Bid Management
export const createBid = async (bidData: Omit<Bid, "id" | "createdAt">) => {
  try {
    const { data, error } = await supabase
      .from("bids")
      .insert({
        ...bidData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating bid:", error);
    throw new Error(error.message || "Failed to create bid");
  }
};

export const getBidsByProject = async (projectId: string): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Bid[];
  } catch (error: any) {
    console.error("Error getting project bids:", error);
    throw new Error(error.message || "Failed to get project bids");
  }
};

export const getBidsByStudent = async (studentId: string): Promise<Bid[]> => {
  try {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Bid[];
  } catch (error: any) {
    console.error("Error getting student bids:", error);
    throw new Error(error.message || "Failed to get student bids");
  }
};

export const updateBid = async (bidId: string, bidData: Partial<Bid>) => {
  try {
    const { error } = await supabase
      .from("bids")
      .update(bidData)
      .eq("id", bidId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error updating bid:", error);
    throw new Error(error.message || "Failed to update bid");
  }
};

// Notification Management
export const createNotification = async (
  notificationData: Omit<Notification, "id" | "createdAt">
) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        ...notificationData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw new Error(error.message || "Failed to create notification");
  }
};

export const getNotificationsByUser = async (
  userId: string
): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Notification[];
  } catch (error: any) {
    console.error("Error getting user notifications:", error);
    throw new Error(error.message || "Failed to get notifications");
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) throw error;
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.message || "Failed to mark notification as read");
  }
};

// Message Management
export const createMessage = async (
  messageData: Omit<Message, "id" | "timestamp">
) => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        ...messageData,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error creating message:", error);
    throw new Error(error.message || "Failed to create message");
  }
};

export const getMessagesByUsers = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .order("timestamp", { ascending: true });

    if (error) throw error;
    return data as Message[];
  } catch (error: any) {
    console.error("Error getting messages:", error);
    throw new Error(error.message || "Failed to get messages");
  }
};

// Real-time subscriptions
export const subscribeToProjects = (
  callback: (projects: Project[]) => void
) => {
  return supabase
    .channel("projects")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      async () => {
        const projects = await getProjects();
        callback(projects);
      }
    )
    .subscribe();
};

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  return supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const notifications = await getNotificationsByUser(userId);
        callback(notifications);
      }
    )
    .subscribe();
};

// Get current user
export const getCurrentUser = async () => {
  try {
    console.log("Getting current user...");
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Get current user error:", error);
      throw error;
    }

    console.log("Current user:", user ? "Found" : "Not found");
    return user;
  } catch (error: any) {
    console.error("Error getting current user:", error);
    throw new Error(error.message || "Failed to get current user");
  }
};

export const getCurrentUserProfile = async (): Promise<
  Student | Company | null
> => {
  try {
    console.log("Getting current user profile...");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user found");
      return null;
    }

    console.log("Authenticated user found, fetching profile...");
    return await getUserById(user.id);
  } catch (error: any) {
    console.error("Error getting current user profile:", error);
    throw new Error(error.message || "Failed to get current user profile");
  }
};
