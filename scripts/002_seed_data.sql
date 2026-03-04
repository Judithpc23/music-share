-- Seed data for SoundShare

-- Users
insert into public.users (id, username, email, role, bio) values
  ('user-a', 'UserA', 'usera@soundshare.com', 'user', 'Music enthusiast and playlist curator. Always looking for the next great track!'),
  ('user-b', 'UserB', 'userb@soundshare.com', 'user', 'Indie rock lover. Sharing my favorite discoveries with the community.'),
  ('admin', 'Admin', 'admin@soundshare.com', 'admin', 'SoundShare platform administrator. Keeping the community safe and sound.')
on conflict (id) do nothing;

-- Artists
insert into public.artists (id, name, verified) values
  ('artist-1', 'Luna Eclipse', true),
  ('artist-2', 'The Midnight Collective', true),
  ('artist-3', 'Nova Beats', true),
  ('artist-4', 'Crystal Waves', false),
  ('artist-5', 'Urban Poets', true)
on conflict (id) do nothing;

-- Songs
insert into public.songs (id, title, artist_id, genre, provider, cover_image_url, created_at, duration) values
  ('song-1',  'Starlight Dreams',   'artist-1', 'Electronic', 'Spotify',      '/placeholder.svg?height=300&width=300', '2024-01-15T10:00:00Z', 245),
  ('song-2',  'Midnight Highway',   'artist-2', 'Synthwave',  'Apple Music',  '/placeholder.svg?height=300&width=300', '2024-01-20T14:30:00Z', 312),
  ('song-3',  'Urban Pulse',        'artist-3', 'Hip-Hop',    'Spotify',      '/placeholder.svg?height=300&width=300', '2024-02-01T09:00:00Z', 198),
  ('song-4',  'Ocean Breeze',       'artist-4', 'Chill',      'SoundCloud',   '/placeholder.svg?height=300&width=300', '2024-02-10T16:45:00Z', 267),
  ('song-5',  'City Lights',        'artist-5', 'R&B',        'Spotify',      '/placeholder.svg?height=300&width=300', '2024-02-15T11:20:00Z', 224),
  ('song-6',  'Neon Glow',          'artist-1', 'Electronic', 'Apple Music',  '/placeholder.svg?height=300&width=300', '2024-02-20T08:00:00Z', 289),
  ('song-7',  'Street Poetry',      'artist-5', 'Hip-Hop',    'Spotify',      '/placeholder.svg?height=300&width=300', '2024-03-01T13:15:00Z', 231),
  ('song-8',  'Retro Wave',         'artist-2', 'Synthwave',  'Spotify',      '/placeholder.svg?height=300&width=300', '2024-03-05T17:30:00Z', 276),
  ('song-9',  'Digital Love',       'artist-3', 'Electronic', 'Apple Music',  '/placeholder.svg?height=300&width=300', '2024-03-10T10:45:00Z', 203),
  ('song-10', 'Sunset Boulevard',   'artist-4', 'Chill',      'SoundCloud',   '/placeholder.svg?height=300&width=300', '2024-03-15T15:00:00Z', 256),
  ('song-11', 'Electric Soul',      'artist-1', 'R&B',        'Spotify',      '/placeholder.svg?height=300&width=300', '2024-03-20T09:30:00Z', 218),
  ('song-12', 'Late Night Drive',   'artist-2', 'Synthwave',  'Apple Music',  '/placeholder.svg?height=300&width=300', '2024-03-25T22:00:00Z', 342)
on conflict (id) do nothing;

-- Shares
insert into public.shares (id, user_id, song_id, caption_text, visibility, created_at, status) values
  ('share-1', 'user-a', 'song-1', 'This track has been on repeat all week! The synths are incredible.', 'public',  '2024-03-26T10:00:00Z', 'active'),
  ('share-2', 'user-b', 'song-3', 'Perfect workout track. The beat drops are insane!',                  'public',  '2024-03-26T14:30:00Z', 'active'),
  ('share-3', 'user-a', 'song-5', 'Late night vibes. Urban Poets never disappoints.',                   'friends', '2024-03-27T23:00:00Z', 'active'),
  ('share-4', 'user-b', 'song-8', 'Throwback to the 80s with this synth masterpiece!',                  'public',  '2024-03-28T16:00:00Z', 'active')
on conflict (id) do nothing;

-- Reactions
insert into public.reactions (id, target_type, target_id, user_id, type, created_at) values
  ('reaction-1', 'song',    'song-1',    'user-a', 'like', '2024-03-26T10:05:00Z'),
  ('reaction-2', 'song',    'song-1',    'user-b', 'love', '2024-03-26T11:00:00Z'),
  ('reaction-3', 'song',    'song-3',    'user-a', 'love', '2024-03-26T15:00:00Z'),
  ('reaction-4', 'share',   'share-1',   'user-b', 'like', '2024-03-26T12:00:00Z'),
  ('reaction-5', 'share',   'share-2',   'user-a', 'love', '2024-03-26T16:00:00Z'),
  ('reaction-6', 'song',    'song-5',    'user-b', 'like', '2024-03-27T23:30:00Z'),
  ('reaction-7', 'song',    'song-8',    'user-a', 'like', '2024-03-28T17:00:00Z'),
  ('reaction-8', 'comment', 'comment-1', 'user-b', 'like', '2024-03-26T13:00:00Z')
on conflict (id) do nothing;

-- Comments
insert into public.comments (id, song_id, user_id, content, created_at, status) values
  ('comment-1', 'song-1', 'user-a', 'The drop at 1:30 is absolutely mind-blowing!',                       '2024-03-26T10:30:00Z', 'active'),
  ('comment-2', 'song-1', 'user-b', 'Luna Eclipse always delivers quality. This is their best work yet!', '2024-03-26T11:30:00Z', 'active'),
  ('comment-3', 'song-3', 'user-a', 'Nova Beats knows how to make a banger!',                             '2024-03-26T15:30:00Z', 'active'),
  ('comment-4', 'song-5', 'user-b', 'The lyrics hit different at 2am.',                                   '2024-03-27T02:00:00Z', 'active'),
  ('comment-5', 'song-8', 'user-a', 'Pure nostalgia in audio form.',                                      '2024-03-28T18:00:00Z', 'active')
on conflict (id) do nothing;

-- Reports
insert into public.reports (id, target_type, target_id, user_id, reason, created_at, status) values
  ('report-1', 'comment', 'comment-3', 'user-b', 'Potentially misleading information about the artist.', '2024-03-26T16:00:00Z', 'pending'),
  ('report-2', 'share',   'share-2',   'admin',  'Review caption for appropriateness.',                   '2024-03-27T09:00:00Z', 'pending')
on conflict (id) do nothing;

-- Listening Rooms
insert into public.listening_rooms (id, name, host_user_id, current_song_id, status, created_at) values
  ('room-1', 'Late Night Synths', 'user-a', 'song-2', 'active', '2024-03-28T22:00:00Z'),
  ('room-2', 'Chill Vibes Only',  'user-b', 'song-4', 'active', '2024-03-28T20:00:00Z')
on conflict (id) do nothing;

-- Room Members
insert into public.room_members (room_id, user_id, joined_at, is_host) values
  ('room-1', 'user-a', '2024-03-28T22:00:00Z', true),
  ('room-1', 'user-b', '2024-03-28T22:05:00Z', false),
  ('room-2', 'user-b', '2024-03-28T20:00:00Z', true),
  ('room-2', 'user-a', '2024-03-28T20:10:00Z', false)
on conflict (room_id, user_id) do nothing;

-- Playback States
insert into public.playback_states (room_id, current_song_id, is_playing, position_seconds, last_updated_at, last_updated_by) values
  ('room-1', 'song-2', true,  45,  '2024-03-28T22:10:00Z', 'user-a'),
  ('room-2', 'song-4', false, 120, '2024-03-28T20:30:00Z', 'user-b')
on conflict (room_id) do nothing;

-- Room Activities
insert into public.room_activities (id, room_id, user_id, action, timestamp) values
  ('activity-1', 'room-1', 'user-a', 'joined', '2024-03-28T22:00:00Z'),
  ('activity-2', 'room-1', 'user-a', 'played', '2024-03-28T22:00:30Z'),
  ('activity-3', 'room-1', 'user-b', 'joined', '2024-03-28T22:05:00Z'),
  ('activity-4', 'room-2', 'user-b', 'joined', '2024-03-28T20:00:00Z'),
  ('activity-5', 'room-2', 'user-b', 'played', '2024-03-28T20:00:30Z'),
  ('activity-6', 'room-2', 'user-a', 'joined', '2024-03-28T20:10:00Z'),
  ('activity-7', 'room-2', 'user-b', 'paused', '2024-03-28T20:30:00Z')
on conflict (id) do nothing;
