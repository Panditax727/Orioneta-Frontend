import { useState, useEffect, useCallback, useRef } from "react";
import { statusService } from "../services/statusService";
import { subscribeRealtimeEvents } from "../../realtime/services/realtimeService";

export function usePresence() {
  const [friends, setFriends] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [requests, setRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const friendsRef = useRef([]);

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
      friendsRef.current = friendsData;
      setUserProfile(profileData);
      setRequests(requestsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const searchFriends = useCallback(async (query) => {
    try {
      const results = await statusService.searchFriends(query);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const getFriendsByStatus = useCallback(async (status) => {
    try {
      const results = await statusService.getFriendsByStatus(status);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchData();
    });
  }, [fetchData]);

  const userProfileRef = useRef(userProfile);
  userProfileRef.current = userProfile;

  useEffect(() => {
    return subscribeRealtimeEvents((event) => {
      if (event.type === "USER_CONNECTED") {
        setFriends((prev) =>
          prev.map((f) =>
            String(f.id) === String(event.userId)
              ? { ...f, online: true, lastSeen: null }
              : f,
          ),
        );
      }

      if (event.type === "USER_DISCONNECTED") {
        setFriends((prev) =>
          prev.map((f) =>
            String(f.id) === String(event.userId)
              ? { ...f, online: false, lastSeen: event.occurredAt || new Date().toISOString() }
              : f,
          ),
        );
      }

      if (event.type === "USER_STATUS_CHANGED") {
        setFriends((prev) =>
          prev.map((f) =>
            String(f.id) === String(event.userId)
              ? { ...f, profilePhoto: event.newValue || f.profilePhoto, lastSeen: event.occurredAt || f.lastSeen }
              : f,
          ),
        );
        const currentProfile = userProfileRef.current;
        if (currentProfile && String(currentProfile.id) === String(event.userId)) {
          setUserProfile((prev) => prev ? { ...prev, profilePhoto: event.newValue || prev.profilePhoto } : prev);
        }
      }
    });
  }, []);

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
