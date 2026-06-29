import { describe, it, expect, vi } from 'vitest';
import {
  getAvatarImage,
  buildConversationProfile,
  stopMediaStream,
  getAttachmentKind,
  getSearchableMessageText,
  parseMessageContent,
  getBubbleRadius,
  getBubblePadding,
  getCallTitle,
  getCallModeText,
  getElapsedSeconds,
  formatDuration,
  callButtonStyle,
  formatFileSize,
  isCallSignalForConversation,
  parseCallPayload,
  getProfileId,
  createCallId,
  getAttachmentSourceUrl,
  MAX_ATTACHMENT_SIZE,
  QUICK_EMOTES,
  RTC_CONFIGURATION,
  DEFAULT_VISUALS,
  CALL_SIGNAL_TYPES,
} from './chatUtils';

vi.mock('../../../../services/profilePhotoService', () => ({
  resolveProfilePhoto: (photo) => photo ? `resolved:${photo}` : '',
}));

describe('chatUtils', () => {
  describe('getAvatarImage', () => {
    it('returns resolved avatarPhoto when available', () => {
      expect(getAvatarImage({ avatarPhoto: 'photo.jpg' })).toBe('resolved:photo.jpg');
    });

    it('returns resolved profilePhoto as fallback', () => {
      expect(getAvatarImage({ profilePhoto: 'prof.jpg' })).toBe('resolved:prof.jpg');
    });

    it('returns resolved avatar as last fallback', () => {
      expect(getAvatarImage({ avatar: 'av.jpg' })).toBe('resolved:av.jpg');
    });

    it('returns empty string when no photo found', () => {
      expect(getAvatarImage({})).toBe('');
      expect(getAvatarImage(null)).toBe('');
    });
  });

  describe('buildConversationProfile', () => {
    it('returns null when both args are null', () => {
      expect(buildConversationProfile(null, null)).toBeNull();
    });

    it('builds profile from conversation', () => {
      const conversation = { name: 'Chat', displayName: 'Friend', email: 'f@test.com' };
      const profile = buildConversationProfile(conversation, null);
      expect(profile.name).toBe('Friend');
      expect(profile.email).toBe('f@test.com');
    });

    it('builds profile from friendProfile', () => {
      const friend = { displayName: 'John', userName: 'john', status: 'ONLINE' };
      const profile = buildConversationProfile(null, friend);
      expect(profile.name).toBe('John');
      expect(profile.userName).toBe('john');
    });

    it('uses fallback name when nothing available', () => {
      const profile = buildConversationProfile({}, null);
      expect(profile.name).toBe('Contacto Orioneta');
    });
  });

  describe('stopMediaStream', () => {
    it('stops all tracks in the stream', () => {
      const stop1 = vi.fn();
      const stop2 = vi.fn();
      const stream = { getTracks: () => [{ stop: stop1 }, { stop: stop2 }] };
      stopMediaStream(stream);
      expect(stop1).toHaveBeenCalled();
      expect(stop2).toHaveBeenCalled();
    });

    it('does nothing for null stream', () => {
      expect(() => stopMediaStream(null)).not.toThrow();
    });
  });

  describe('getAttachmentKind', () => {
    it('returns "image" for image mime types', () => {
      expect(getAttachmentKind('image/png')).toBe('image');
      expect(getAttachmentKind('image/jpeg')).toBe('image');
    });

    it('returns "audio" for audio mime types', () => {
      expect(getAttachmentKind('audio/mp3')).toBe('audio');
      expect(getAttachmentKind('audio/wav')).toBe('audio');
    });

    it('returns "video" for video mime types', () => {
      expect(getAttachmentKind('video/mp4')).toBe('video');
    });

    it('returns "file" for unknown types', () => {
      expect(getAttachmentKind('application/pdf')).toBe('file');
      expect(getAttachmentKind('')).toBe('file');
    });
  });

  describe('parseMessageContent', () => {
    it('returns empty text for null content', () => {
      expect(parseMessageContent(null)).toEqual({ text: '', attachment: null });
    });

    it('returns raw text for non-JSON content', () => {
      expect(parseMessageContent('hello')).toEqual({ text: 'hello', attachment: null });
    });

    it('parses JSON attachment content', () => {
      const result = parseMessageContent(JSON.stringify({ text: 'hi', attachment: { name: 'file.pdf' } }));
      expect(result.text).toBe('hi');
      expect(result.attachment).toEqual({ name: 'file.pdf' });
    });

    it('returns plain text for invalid JSON', () => {
      expect(parseMessageContent('{invalid json}')).toEqual({ text: '{invalid json}', attachment: null });
    });
  });

  describe('getBubbleRadius', () => {
    it('returns COMPACT style radius', () => {
      expect(getBubbleRadius('COMPACT', true)).toBe('12px 12px 4px 12px');
      expect(getBubbleRadius('COMPACT', false)).toBe('12px 12px 12px 4px');
    });

    it('returns ROUNDED style radius', () => {
      expect(getBubbleRadius('ROUNDED', true)).toBe('22px');
    });

    it('returns MINIMAL style radius', () => {
      expect(getBubbleRadius('MINIMAL', true)).toBe(8);
    });

    it('returns default style radius', () => {
      expect(getBubbleRadius('DEFAULT', true)).toBe('18px 18px 4px 18px');
      expect(getBubbleRadius('DEFAULT', false)).toBe('18px 18px 18px 4px');
    });
  });

  describe('getBubblePadding', () => {
    it('returns COMPACT style padding', () => {
      expect(getBubblePadding('COMPACT', false)).toBe('7px 11px');
    });

    it('returns compactMode padding', () => {
      expect(getBubblePadding('DEFAULT', true)).toBe('7px 11px');
    });

    it('returns MINIMAL style padding', () => {
      expect(getBubblePadding('MINIMAL', false)).toBe('8px 0');
    });

    it('returns DEFAULT style padding', () => {
      expect(getBubblePadding('DEFAULT', false)).toBe('10px 14px');
    });
  });

  describe('getCallTitle', () => {
    it('returns video title', () => expect(getCallTitle('video')).toBe('Videollamada activa'));
    it('returns screen title', () => expect(getCallTitle('screen')).toBe('Compartiendo pantalla'));
    it('returns voice title', () => expect(getCallTitle('audio')).toBe('Llamada de voz activa'));
  });

  describe('getCallModeText', () => {
    it('returns screen mode text', () => expect(getCallModeText('screen')).toBe('pantalla en uso'));
    it('returns video mode text', () => expect(getCallModeText('video')).toBe('camara y microfono activos'));
    it('returns audio mode text', () => expect(getCallModeText('audio')).toBe('microfono activo'));
  });

  describe('formatDuration', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(3661)).toBe('61:01');
    });
  });

  describe('getElapsedSeconds', () => {
    it('returns 0 for null startedAt', () => {
      expect(getElapsedSeconds(null)).toBe(0);
    });

    it('returns positive seconds for past date', () => {
      vi.setSystemTime(new Date('2026-06-26T10:00:30'));
      const startedAt = new Date('2026-06-26T10:00:00').toISOString();
      expect(getElapsedSeconds(startedAt)).toBe(30);
      vi.useRealTimers();
    });
  });

  describe('callButtonStyle', () => {
    it('returns correct style object', () => {
      const style = callButtonStyle('red');
      expect(style.width).toBe(36);
      expect(style.height).toBe(36);
      expect(style.background).toBe('red');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes', () => expect(formatFileSize(500)).toBe('500 B'));
    it('formats KB', () => expect(formatFileSize(2048)).toBe('2.0 KB'));
    it('formats MB', () => expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB'));
  });

  describe('isCallSignalForConversation', () => {
    it('returns true for matching signal', () => {
      const event = { type: 'CALL_OFFER', conversationId: 'conv1', senderId: 'user2' };
      expect(isCallSignalForConversation(event, 'conv1', 'user1')).toBe(true);
    });

    it('returns false for own signal', () => {
      const event = { type: 'CALL_OFFER', conversationId: 'conv1', senderId: 'user1' };
      expect(isCallSignalForConversation(event, 'conv1', 'user1')).toBe(false);
    });

    it('returns false for non-call signal', () => {
      const event = { type: 'MESSAGE', conversationId: 'conv1', senderId: 'user2' };
      expect(isCallSignalForConversation(event, 'conv1', 'user1')).toBe(false);
    });
  });

  describe('parseCallPayload', () => {
    it('parses JSON string', () => {
      expect(parseCallPayload('{"a":1}')).toEqual({ a: 1 });
    });

    it('returns object as-is', () => {
      expect(parseCallPayload({ a: 1 })).toEqual({ a: 1 });
    });

    it('returns null for invalid JSON', () => {
      expect(parseCallPayload('{invalid}')).toBeNull();
    });
  });

  describe('getProfileId', () => {
    it('returns id field', () => expect(getProfileId({ id: '1' })).toBe('1'));
    it('returns userId field', () => expect(getProfileId({ userId: '2' })).toBe('2'));
    it('returns userID field', () => expect(getProfileId({ userID: '3' })).toBe('3'));
    it('returns uuid field', () => expect(getProfileId({ uuid: '4' })).toBe('4'));
    it('returns null for no match', () => expect(getProfileId({})).toBeNull());
  });

  describe('createCallId', () => {
    it('generates a string id', () => {
      expect(createCallId()).toBeTruthy();
      expect(typeof createCallId()).toBe('string');
    });
  });

  describe('getAttachmentSourceUrl', () => {
    it('returns url field', () => expect(getAttachmentSourceUrl({ url: 'u' })).toBe('u'));
    it('returns contentUrl field', () => expect(getAttachmentSourceUrl({ contentUrl: 'c' })).toBe('c'));
    it('returns downloadUrl field', () => expect(getAttachmentSourceUrl({ downloadUrl: 'd' })).toBe('d'));
    it('returns dataUrl field', () => expect(getAttachmentSourceUrl({ dataUrl: 'dt' })).toBe('dt'));
    it('returns previewUrl field', () => expect(getAttachmentSourceUrl({ previewUrl: 'p' })).toBe('p'));
    it('returns empty string for no url', () => expect(getAttachmentSourceUrl({})).toBe(''));
  });

  describe('getSearchableMessageText', () => {
    it('combines sender, text, attachment name, and content', () => {
      const msg = { sender: 'John', content: JSON.stringify({ text: 'hello', attachment: { name: 'file.pdf', type: 'pdf' } }) };
      const result = getSearchableMessageText(msg);
      expect(result).toContain('john');
      expect(result).toContain('hello');
      expect(result).toContain('file.pdf');
      expect(result).toContain('pdf');
    });
  });

  describe('constants', () => {
    it('has correct MAX_ATTACHMENT_SIZE', () => {
      expect(MAX_ATTACHMENT_SIZE).toBe(12 * 1024 * 1024);
    });

    it('has QUICK_EMOTES array', () => {
      expect(QUICK_EMOTES).toContain('✨');
    });

    it('has RTC_CONFIGURATION with STUN or TURN servers', () => {
      expect(RTC_CONFIGURATION.iceServers.length).toBeGreaterThanOrEqual(2);
      expect(RTC_CONFIGURATION.iceServers.some((server) => String(server.urls).startsWith('stun:'))).toBe(true);
    });

    it('has DEFAULT_VISUALS with all required keys', () => {
      expect(DEFAULT_VISUALS).toHaveProperty('chatBackground');
      expect(DEFAULT_VISUALS).toHaveProperty('accent');
    });

    it('has CALL_SIGNAL_TYPES set', () => {
      expect(CALL_SIGNAL_TYPES.has('CALL_OFFER')).toBe(true);
      expect(CALL_SIGNAL_TYPES.has('CALL_ANSWER')).toBe(true);
    });
  });
});
