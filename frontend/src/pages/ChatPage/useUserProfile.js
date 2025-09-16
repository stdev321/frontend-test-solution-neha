import { useState, useEffect, useCallback } from 'react';
import {
  getUserProfile,
  updateUserProfile,
} from '../../services/api'; // Assuming API is correctly pathed

export const useUserProfile = (authToken) => {
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true); // Start true for initial load
  const [profileError, setProfileError] = useState('');

  const fetchProfile = useCallback(async () => {
    if (!authToken) {
      setProfileData(null);
      setProfileLoading(false); // Not loading if no auth token
      // setProfileError('Authentication token not found to fetch profile.'); // Optional: set error if desired
      return;
    }

    // console.log('useUserProfile: Refreshing user profile...');
    setProfileLoading(true);
    setProfileError('');
    try {
      const data = await getUserProfile();
      // console.log('useUserProfile: Refreshed profile data received:', data);
      setProfileData(data);
    } catch (err) {
      console.error('useUserProfile: Failed to refresh profile:', err);
      setProfileError(err.message || 'Could not refresh profile.');
      setProfileData(null); // Clear profile data on error
    } finally {
      setProfileLoading(false);
    }
  }, [authToken]);

  // Effect for initial fetch when authToken becomes available or changes
  useEffect(() => {
    // console.log('useUserProfile useEffect: AuthToken changed or component mounted. Fetching profile.');
    fetchProfile();
  }, [fetchProfile]); // fetchProfile is memoized with authToken dependency

  const handleUpdateProfile = useCallback(async (updatePayload) => {
    if (!authToken) {
        setProfileError('Cannot update profile without authentication.');
        throw new Error('Not authenticated'); // Or handle more gracefully
    }
    // console.log('useUserProfile: Attempting to update profile with payload:', updatePayload);
    // setProfileLoading(true); // Optional: Indicate loading for update operation
    setProfileError(''); 
    try {
      const updatedProfile = await updateUserProfile(updatePayload);
      // console.log('useUserProfile: Profile updated successfully via API, backend response:', updatedProfile);
      // After successful update, refresh profile data from DB
      await fetchProfile(); 
      return updatedProfile; // Return for immediate UI feedback if needed
    } catch (err) {
      console.error('useUserProfile: Failed to update profile:', err);
      setProfileError(err.message || 'Could not save profile changes.');
      throw err; // Re-throw error for the calling component to handle if needed
    } finally {
      // setProfileLoading(false); // Clear loading if set for update
    }
  }, [authToken, fetchProfile]);

  return {
    profileData,
    profileLoading,
    profileError,
    handleUpdateProfile,
    fetchProfile, // Expose fetchProfile for manual refresh if needed by UI
    setProfileError, // Allow parent to clear profile error if needed
  };
}; 