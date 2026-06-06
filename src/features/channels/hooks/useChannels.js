import { useState, useEffect, useCallback } from "react";
import { channelsService } from "../services/channelsService";

export function useChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar canales
  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await channelsService.getChannels();
      setChannels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear canal
  const createChannel = useCallback(async (channelData) => {
    try {
      const newChannel = await channelsService.createChannel(channelData);
      setChannels(prev => [...prev, newChannel]);
      return newChannel;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Actualizar canal
  const updateChannel = useCallback(async (id, channelData) => {
    try {
      const updatedChannel = await channelsService.updateChannel(id, channelData);
      setChannels(prev =>
        prev.map(channel => (channel.id === id ? updatedChannel : channel))
      );
      return updatedChannel;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Eliminar canal
  const deleteChannel = useCallback(async (id) => {
    try {
      await channelsService.deleteChannel(id);
      setChannels(prev => prev.filter(channel => channel.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Buscar canales
  const searchChannels = useCallback(async (query) => {
    try {
      const results = await channelsService.searchChannels(query);
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Cargar canales al montar el componente
  useEffect(() => {
    queueMicrotask(() => {
      void fetchChannels();
    });
  }, [fetchChannels]);

  return {
    channels,
    loading,
    error,
    createChannel,
    updateChannel,
    deleteChannel,
    searchChannels,
    refetch: fetchChannels,
  };
}
