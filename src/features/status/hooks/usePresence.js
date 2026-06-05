import { useState, useEffect, useCallback } from "react";
import { statusService } from "../services/statusService";

export function usePresence() {
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar amigos y perfil
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [friendsData, profileData] = await Promise.all([
        statusService.getFriends(),
        statusService.getUserProfile(),
      ]);
      setFriends(friendsData);
      setUserProfile(profileData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado del usuario
  const updateStatus = useCallback(async (status, activity) => {
    try {
      setError(null);
      const updatedProfile = await statusService.updateUserStatus(status, activity);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Buscar amigos
  const searchFriends = useCallback(async (query) => {
    try {
      const results = await statusService.searchFriends(query);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Obtener amigos por estado
  const getFriendsByStatus = useCallback(async (status) => {
    try {
      const results = await statusService.getFriendsByStatus(status);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Simular actualizaciones de presencia en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular cambios de estado aleatorios
      setFriends(prev => prev.map(friend => {
        if (Math.random() > 0.95) {
          const statuses = ["online", "idle", "dnd", "offline"];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...friend, status: newStatus };
        }
        return friend;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    friends,
    userProfile,
    loading,
    error,
    updateStatus,
    searchFriends,
    getFriendsByStatus,
    refetch: fetchData,
  };
}
