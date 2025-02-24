export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
} 