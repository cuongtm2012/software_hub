/**
 * User management utilities for handling user data operations
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at: string;
}

/**
 * Remove duplicate users based on email field, keeping only the first occurrence
 * 
 * Algorithm explanation:
 * 1. Uses a Map to track seen emails for O(1) lookup time
 * 2. Iterates through users array once (O(n) time complexity)
 * 3. For each user, checks if email has been seen before
 * 4. If not seen, adds user to Map with email as key
 * 5. Returns array of unique users maintaining original order
 * 
 * @param users - Array of user objects that may contain duplicates
 * @returns Array of users with duplicates removed based on email
 * 
 * Time Complexity: O(n) where n is the number of users
 * Space Complexity: O(k) where k is the number of unique emails
 * 
 * @example
 * const users = [
 *   { id: 1, name: 'John', email: 'john@test.com', role: 'user', created_at: '2024-01-01' },
 *   { id: 2, name: 'Jane', email: 'jane@test.com', role: 'admin', created_at: '2024-01-02' },
 *   { id: 3, name: 'John Doe', email: 'john@test.com', role: 'seller', created_at: '2024-01-03' }, // duplicate
 * ];
 * 
 * const uniqueUsers = deduplicateUsersByEmail(users);
 * // Result: Only first occurrence of john@test.com is kept
 * // [
 * //   { id: 1, name: 'John', email: 'john@test.com', role: 'user', created_at: '2024-01-01' },
 * //   { id: 2, name: 'Jane', email: 'jane@test.com', role: 'admin', created_at: '2024-01-02' }
 * // ]
 */
export function deduplicateUsersByEmail(users: User[]): User[] {
  const emailMap = new Map<string, User>();
  
  // Keep only the first occurrence of each unique email
  // Case-insensitive email comparison to handle john@test.com vs JOHN@test.com
  users.forEach(user => {
    if (user.email && !emailMap.has(user.email.toLowerCase())) {
      emailMap.set(user.email.toLowerCase(), user);
    }
  });
  
  return Array.from(emailMap.values());
}

/**
 * Alternative implementation using Set for tracking emails
 * Same time/space complexity but slightly different approach
 */
export function deduplicateUsersByEmailAlternative(users: User[]): User[] {
  const seenEmails = new Set<string>();
  const uniqueUsers: User[] = [];
  
  users.forEach(user => {
    if (user.email && !seenEmails.has(user.email.toLowerCase())) {
      seenEmails.add(user.email.toLowerCase());
      uniqueUsers.push(user);
    }
  });
  
  return uniqueUsers;
}

/**
 * Remove duplicates based on multiple fields (email, name combination)
 * Useful when you want to be more strict about duplicate detection
 */
export function deduplicateUsersByEmailAndName(users: User[]): User[] {
  const compositeKeyMap = new Map<string, User>();
  
  users.forEach(user => {
    if (user.email && user.name) {
      const compositeKey = `${user.email.toLowerCase()}-${user.name.toLowerCase()}`;
      if (!compositeKeyMap.has(compositeKey)) {
        compositeKeyMap.set(compositeKey, user);
      }
    }
  });
  
  return Array.from(compositeKeyMap.values());
}

/**
 * Get duplicate statistics for user data analysis
 */
export function getUserDuplicationStats(users: User[]): {
  totalUsers: number;
  uniqueUsers: number;
  duplicatesRemoved: number;
  duplicatePercentage: number;
} {
  const totalUsers = users.length;
  const uniqueUsers = deduplicateUsersByEmail(users).length;
  const duplicatesRemoved = totalUsers - uniqueUsers;
  const duplicatePercentage = totalUsers > 0 ? (duplicatesRemoved / totalUsers) * 100 : 0;
  
  return {
    totalUsers,
    uniqueUsers,
    duplicatesRemoved,
    duplicatePercentage: Math.round(duplicatePercentage * 100) / 100
  };
}