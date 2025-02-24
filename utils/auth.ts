export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Important for cookies
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User is not authenticated
        window.location.href = '/login';
        return null;
      }
      throw new Error('Failed to fetch user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
} 