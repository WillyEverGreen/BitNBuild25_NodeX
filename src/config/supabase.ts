// This file is no longer needed - using localStorage instead
// All functionality has been moved to localStorageService.ts

// Placeholder exports to maintain compatibility
export const supabase = null;

export interface Database {
  // Keeping interface for type compatibility
  public: {
    Tables: {
      users: any;
      projects: any;
      bids: any;
      notifications: any;
    };
  };
}
