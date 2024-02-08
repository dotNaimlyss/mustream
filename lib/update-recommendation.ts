export const updateRecommendations = async (userId, recommendations) => {
    try {
      const response = await fetch('/api/user/update-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, recommendations }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update recommendations');
      }
  
      const updatedUser = await response.json();
      console.log('Updated recommendations:', updatedUser);
    } catch (error) {
      console.error('Error updating recommendations:', error);
    }
  };
  