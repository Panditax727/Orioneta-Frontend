import { useState, useEffect, useCallback } from "react";
import { statusService } from "../services/statusService";

export function usePresence() {
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar amigos y perfil
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await statusService.getUserProfile();
      const [friendsData, requestsData] = await Promise.all([
        statusService.getFriends(),
        statusService.getFriendRequests(),
      ]);
      setFriends(friendsData);
      setUserProfile(profileData);
      setRequests(requestsData);
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

  const sendFriendRequest = useCallback(async (target) => {
    try {
      setError(null);
      const request = await statusService.sendFriendRequest(target);
      await fetchData();
      return request;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      setError(null);
      const friendship = await statusService.acceptFriendRequest(requestId);
      await fetchData();
      return friendship;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

  const rejectFriendRequest = useCallback(async (requestId) => {
    try {
      setError(null);
      const request = await statusService.rejectFriendRequest(requestId);
      await fetchData();
      return request;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

  const cancelFriendRequest = useCallback(async (requestId) => {
    try {
      setError(null);
      const request = await statusService.cancelFriendRequest(requestId);
      await fetchData();
      return request;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

  const removeFriend = useCallback(async (friendId) => {
    try {
      setError(null);
      const friendship = await statusService.removeFriend(friendId);
      await fetchData();
      return friendship;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchData]);

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
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  return {
    friends,
    userProfile,
    requests,
    loading,
    error,
    updateStatus,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend,
    searchFriends,
    getFriendsByStatus,
    refetch: fetchData,
  };
}
