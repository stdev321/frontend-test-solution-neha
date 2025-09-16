// frontend/src/contexts/MyAdvisersContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext'; // Assuming AuthContext is in the same directory
import { getMyHealthAdvisers, updateMyHealthAdvisers as apiUpdateMyHealthAdvisers } from '../services/api';
import { getPersonaDetails } from '../services/personaI18nService';
import { useTranslation } from 'react-i18next';

const MyAdvisersContext = createContext(undefined);
const MAX_ADVISERS = 5; // Define max advisers limit
const AILEENCAROL_ID = 'ai_persona_aileen_carol'; // Define AI Health Expert Carol's ID once

const normalizeId = (id) => (id || '').trim().toLowerCase();

export const useMyAdvisers = () => {
  const context = useContext(MyAdvisersContext);
  if (context === undefined) {
    throw new Error('useMyAdvisers must be used within a MyAdvisersProvider');
  }
  return context;
};

export const MyAdvisersProvider = ({ children }) => {
  const { authToken, currentUser } = useAuth();
  const { i18n } = useTranslation();
  const [myAdvisers, setMyAdvisers] = useState([]);
  const [isLoadingMyAdvisers, setIsLoadingMyAdvisers] = useState(false);
  const [myAdvisersError, setMyAdvisersError] = useState(null);

  const fetchAdvisers = useCallback(async () => {
    if (!authToken || !currentUser) {
      setMyAdvisers([]); 
      // Do not set loading to true if we are not fetching
      // setIsLoadingMyAdvisers(false); // Not needed here, won't be set true
      return;
    }
    setIsLoadingMyAdvisers(true); 
    setMyAdvisersError(null);
    try {
      const advisersFromApi = await getMyHealthAdvisers();

      // strip Dr Carol (any case) and drop exact-ID duplicates
      const seen   = new Set();
      const clean  = (advisersFromApi || [])
        .filter(a => a.id && a.id.toLowerCase() !== AILEENCAROL_ID)   // drop Carol
        .filter(a => {                                             // drop dups
            const key = a.id.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

      // Fetch translated persona details for each adviser
      const translatedAdvisers = await Promise.all(
        clean.map(async (adviser) => {
          try {
            const translatedData = await getPersonaDetails(adviser.id, i18n.language);
            return translatedData;
          } catch (err) {
            console.warn(`Failed to get translated data for ${adviser.id}:`, err);
            return adviser; // Fallback to original data
          }
        })
      );

      setMyAdvisers(translatedAdvisers);

      /* === TEMP DEBUG (remove after we see the output) ============ */
      console.log('myAdvisers NOW -> length', translatedAdvisers.length, translatedAdvisers.map(p => p.id));
      window._MY_ADV = translatedAdvisers;
      /* ============================================================ */
    } catch (err) {
      console.error("Failed to fetch My Health Advisers:", err);
      setMyAdvisersError(err.message || "Could not load advisers."); 
      setMyAdvisers([]); // Clear advisers on error
    } finally { 
      setIsLoadingMyAdvisers(false); 
    }
  }, [authToken, currentUser, i18n.language]);

  useEffect(() => {
    // Fetch advisers when the current user changes (e.g., on login/logout) or when authToken becomes available.
    // The `fetchAdvisers` callback already checks for authToken and currentUser internally.
    if (currentUser && authToken) { // Check authToken here as well to ensure auth is ready
        fetchAdvisers();
    } else {
        setMyAdvisers([]); // Clear if no user or no token
        setIsLoadingMyAdvisers(false); // Ensure loading is false if we clear due to no user/token
        setMyAdvisersError(null); // Clear any previous errors
    }
  }, [currentUser, authToken, fetchAdvisers]); // Add authToken to dependency array

  const saveAdvisers = async (personaIds) => {
    if (!authToken) throw new Error("Not authenticated to save advisers.");
    setIsLoadingMyAdvisers(true); 
    setMyAdvisersError(null);
    try {
      // Ensure AI Health Expert Carol is not in the list being saved, backend should handle only manageable advisers
      const idsToSave = personaIds.filter(
        id => id?.toLowerCase() !== AILEENCAROL_ID
      );
      const updatedAdvisersFromApi = await apiUpdateMyHealthAdvisers(idsToSave);

      console.log('SAVE-DEBUG from API raw:', updatedAdvisersFromApi.length, updatedAdvisersFromApi.map(a=>a.id));

      // Deduplicate again just in case backend echoed duplicates
      const seenIds = new Set();
      const uniqueFromApi = (updatedAdvisersFromApi || []).filter(a=>{
        const k = normalizeId(a.id);
        if (seenIds.has(k)) return false;
        seenIds.add(k); return true;
      });

      console.log('SAVE-DEBUG unique:', uniqueFromApi.length, uniqueFromApi.map(a=>a.id));

      // Fetch translated persona details for each adviser
      const translatedAdvisers = await Promise.all(
        uniqueFromApi.map(async (adviser) => {
          try {
            const translatedData = await getPersonaDetails(adviser.id, i18n.language);
            return translatedData;
          } catch (err) {
            console.warn(`Failed to get translated data for ${adviser.id}:`, err);
            return adviser; // Fallback to original data
          }
        })
      );

      setMyAdvisers(translatedAdvisers);
      return updatedAdvisersFromApi; // Still return the raw API response in case it's used elsewhere
    } catch (err) {
      console.error("Failed to update My Health Advisers:", err);
      setMyAdvisersError(err.message || "Could not save advisers."); 
      throw err; 
    } finally { 
      setIsLoadingMyAdvisers(false); 
    }
  };

  // New function to add a single adviser to the team
  const addAdviserToUserTeam = useCallback(async (personaIdToAdd) => {
    console.log('[MyAdvisersContext] addAdviserToUserTeam called with:', personaIdToAdd);
    console.log('[MyAdvisersContext] current myAdvisers before add:', JSON.stringify(myAdvisers));
    console.log('[MyAdvisersContext] current myAdvisers.length:', myAdvisers.length);
    console.log('[MyAdvisersContext] MAX_ADVISERS:', MAX_ADVISERS);

    if (!authToken) throw new Error("Not authenticated to add adviser.");
    
    // myAdvisers state should now only contain manageable advisers
    if (myAdvisers.length >= MAX_ADVISERS) {
      console.error(`[MyAdvisersContext] Error: Attempting to add when team is full. myAdvisers.length: ${myAdvisers.length}`);
      throw new Error(`Cannot add more than ${MAX_ADVISERS} advisers.`);
    }

    if (myAdvisers.some(adviser => normalizeId(adviser.id) === normalizeId(personaIdToAdd))) {
      console.warn(`[MyAdvisersContext] Adviser ${personaIdToAdd} already in team.`);
      return myAdvisers; 
    }
    
    // Ensure we don't try to add AI Health Expert Carol as a manageable adviser
    if (personaIdToAdd?.toLowerCase() === AILEENCAROL_ID) {
        console.warn("[MyAdvisersContext] Attempted to add AI Health Expert Carol to manageable team. Ignoring.");
        return myAdvisers;
    }

    // Build a case-insensitive, duplicate-free list of IDs (preserve original casing of first occurrence)
    const newAdviserIds = [...myAdvisers.map(adviser => adviser.id), personaIdToAdd]
      .reduce((acc, id) => {
        const key = normalizeId(id);
        if (!acc.map.has(key)) {
          acc.map.set(key, true);
          acc.list.push(id);
        }
        return acc;
      }, { list: [], map: new Map() }).list;

    console.log('ADD-DEBUG about to save:', newAdviserIds.length, newAdviserIds);
    const newAdvisers = await saveAdvisers(newAdviserIds);
    console.log('ADD-DEBUG -> length', newAdvisers.length, newAdvisers);
    return newAdvisers; 
  }, [authToken, myAdvisers, saveAdvisers]);

  // New function to remove a single adviser from the team
  const removeAdviserFromUserTeam = useCallback(async (personaIdToRemove) => {
    if (!authToken) throw new Error("Not authenticated to remove adviser.");
    
    // AI Health Expert Carol cannot be removed from the manageable list if she's not in it.
    // This filter will naturally handle it if AILEENCAROL_ID is passed by mistake.
    const newAdviserIds = myAdvisers
      .map(adviser => adviser.id)
      .filter(id => id?.toLowerCase() !== personaIdToRemove?.toLowerCase());
      
    return saveAdvisers(newAdviserIds); 
  }, [authToken, myAdvisers, saveAdvisers]);

  const value = {
    myAdvisers,
    isLoadingMyAdvisers,
    myAdvisersError,
    fetchMyHealthAdvisers: fetchAdvisers,
    saveMyHealthAdvisers: saveAdvisers,
    addAdviserToUserTeam,
    removeAdviserFromUserTeam,
  };

  return <MyAdvisersContext.Provider value={value}>{children}</MyAdvisersContext.Provider>;
}; 