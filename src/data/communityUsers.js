/**
 * Real User Data for Community
 * Complete user profiles with wishlists, favorites, and follows
 */

export const communityUsers = [
  {
    id: 'user-001',
    uid: 'firebase-uid-001',
    displayName: 'Emma Thompson',
    username: '@emmastyle',
    email: 'emma.thompson@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=1',
    bio: 'Fashion enthusiast | NYC | Sustainable fashion advocate 🌿',
    location: 'New York, NY',
    joinedDate: '2024-01-15',
    verified: true,
    stats: {
      followers: 1245,
      following: 342,
      posts: 89,
      looks: 156
    },
    style: ['casual', 'bohemian', 'sustainable'],
    wishlist: ['shirt-001', 'dress-001', 'jacket-001'],
    favorites: ['shirt-002', 'pants-001', 'accessories-001'],
    recentActivity: [
      { type: 'look', id: 'look-001', timestamp: '2024-11-24' },
      { type: 'favorite', itemId: 'shirt-002', timestamp: '2024-11-23' }
    ]
  },
  {
    id: 'user-002',
    uid: 'firebase-uid-002',
    displayName: 'Marcus Chen',
    username: '@marcusfashion',
    email: 'marcus.chen@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=12',
    bio: 'Streetwear collector | LA | Sneakerhead 👟',
    location: 'Los Angeles, CA',
    joinedDate: '2024-02-20',
    verified: true,
    stats: {
      followers: 2890,
      following: 456,
      posts: 234,
      looks: 312
    },
    style: ['streetwear', 'urban', 'sporty'],
    wishlist: ['jacket-002', 'sneakers-001', 'hoodie-001'],
    favorites: ['jacket-001', 'jeans-001', 'accessories-002'],
    recentActivity: [
      { type: 'look', id: 'look-002', timestamp: '2024-11-24' },
      { type: 'wishlist', itemId: 'sneakers-001', timestamp: '2024-11-24' }
    ]
  },
  {
    id: 'user-003',
    uid: 'firebase-uid-003',
    displayName: 'Sofia Rodriguez',
    username: '@sofiaglam',
    email: 'sofia.rodriguez@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=5',
    bio: 'Luxury fashion blogger | Miami | Runway obsessed ✨',
    location: 'Miami, FL',
    joinedDate: '2024-03-10',
    verified: true,
    stats: {
      followers: 5670,
      following: 234,
      posts: 456,
      looks: 589
    },
    style: ['elegant', 'luxury', 'formal'],
    wishlist: ['dress-002', 'heels-001', 'accessories-003'],
    favorites: ['dress-001', 'jacket-003', 'accessories-004'],
    recentActivity: [
      { type: 'post', id: 'post-003', timestamp: '2024-11-25' },
      { type: 'look', id: 'look-003', timestamp: '2024-11-24' }
    ]
  },
  {
    id: 'user-004',
    uid: 'firebase-uid-004',
    displayName: 'James Wilson',
    username: '@jameswears',
    email: 'james.wilson@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=14',
    bio: 'Minimalist wardrobe | Seattle | Less is more 🖤',
    location: 'Seattle, WA',
    joinedDate: '2024-04-05',
    verified: false,
    stats: {
      followers: 892,
      following: 178,
      posts: 67,
      looks: 134
    },
    style: ['minimalist', 'modern', 'casual'],
    wishlist: ['shirt-003', 'pants-002'],
    favorites: ['shirt-001', 'jacket-001'],
    recentActivity: [
      { type: 'favorite', itemId: 'shirt-001', timestamp: '2024-11-23' }
    ]
  },
  {
    id: 'user-005',
    uid: 'firebase-uid-005',
    displayName: 'Aisha Patel',
    username: '@aishastyle',
    email: 'aisha.patel@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=9',
    bio: 'Traditional meets modern | Chicago | Fashion designer 🎨',
    location: 'Chicago, IL',
    joinedDate: '2024-05-12',
    verified: true,
    stats: {
      followers: 3456,
      following: 567,
      posts: 189,
      looks: 267
    },
    style: ['fusion', 'elegant', 'traditional'],
    wishlist: ['dress-003', 'accessories-005'],
    favorites: ['dress-002', 'jacket-002', 'accessories-006'],
    recentActivity: [
      { type: 'look', id: 'look-005', timestamp: '2024-11-25' }
    ]
  },
  {
    id: 'user-006',
    uid: 'firebase-uid-006',
    displayName: 'Tyler Brooks',
    username: '@tyleroutfit',
    email: 'tyler.brooks@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=13',
    bio: 'Vintage hunter | Portland | Thrift shop lover 🛍️',
    location: 'Portland, OR',
    joinedDate: '2024-06-18',
    verified: false,
    stats: {
      followers: 1567,
      following: 423,
      posts: 123,
      looks: 198
    },
    style: ['vintage', 'retro', 'eclectic'],
    wishlist: ['jacket-004', 'jeans-002'],
    favorites: ['jacket-003', 'shirt-004'],
    recentActivity: [
      { type: 'wishlist', itemId: 'jacket-004', timestamp: '2024-11-24' }
    ]
  },
  {
    id: 'user-007',
    uid: 'firebase-uid-007',
    displayName: 'Olivia Martinez',
    username: '@oliviachic',
    email: 'olivia.martinez@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=10',
    bio: 'Parisian style in Texas | Austin | Coffee & fashion ☕',
    location: 'Austin, TX',
    joinedDate: '2024-07-22',
    verified: true,
    stats: {
      followers: 2134,
      following: 389,
      posts: 145,
      looks: 223
    },
    style: ['chic', 'french', 'elegant'],
    wishlist: ['dress-004', 'heels-002'],
    favorites: ['dress-003', 'jacket-005'],
    recentActivity: [
      { type: 'post', id: 'post-007', timestamp: '2024-11-25' }
    ]
  },
  {
    id: 'user-008',
    uid: 'firebase-uid-008',
    displayName: 'Liam Anderson',
    username: '@liamwear',
    email: 'liam.anderson@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=15',
    bio: 'Fitness fashion | Denver | Athleisure lifestyle 💪',
    location: 'Denver, CO',
    joinedDate: '2024-08-14',
    verified: false,
    stats: {
      followers: 987,
      following: 234,
      posts: 78,
      looks: 145
    },
    style: ['athletic', 'sporty', 'casual'],
    wishlist: ['hoodie-002', 'joggers-001'],
    favorites: ['hoodie-001', 'sneakers-002'],
    recentActivity: [
      { type: 'look', id: 'look-008', timestamp: '2024-11-23' }
    ]
  },
  {
    id: 'user-009',
    uid: 'firebase-uid-009',
    displayName: 'Nina Kim',
    username: '@ninakorean',
    email: 'nina.kim@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=20',
    bio: 'K-fashion influencer | SF | Color enthusiast 🌈',
    location: 'San Francisco, CA',
    joinedDate: '2024-09-01',
    verified: true,
    stats: {
      followers: 4567,
      following: 678,
      posts: 267,
      looks: 389
    },
    style: ['k-fashion', 'colorful', 'trendy'],
    wishlist: ['accessories-007', 'dress-005'],
    favorites: ['accessories-006', 'shirt-005'],
    recentActivity: [
      { type: 'favorite', itemId: 'accessories-006', timestamp: '2024-11-25' }
    ]
  },
  {
    id: 'user-010',
    uid: 'firebase-uid-010',
    displayName: 'Carlos Santos',
    username: '@carlosstyle',
    email: 'carlos.santos@example.com',
    photoURL: 'https://i.pravatar.cc/150?img=8',
    bio: 'Brazilian fashion | Boston | Beach to street 🏖️',
    location: 'Boston, MA',
    joinedDate: '2024-10-05',
    verified: false,
    stats: {
      followers: 1234,
      following: 345,
      posts: 98,
      looks: 167
    },
    style: ['beach', 'casual', 'colorful'],
    wishlist: ['shirt-006', 'shorts-001'],
    favorites: ['shirt-007', 'accessories-008'],
    recentActivity: [
      { type: 'wishlist', itemId: 'shirt-006', timestamp: '2024-11-24' }
    ]
  }
];

// Helper functions
export const getUserById = (id) => communityUsers.find(user => user.id === id);
export const getUserByUsername = (username) => communityUsers.find(user => user.username === username);
export const searchUsers = (query) => {
  const lowerQuery = query.toLowerCase();
  return communityUsers.filter(user => 
    user.displayName.toLowerCase().includes(lowerQuery) ||
    user.username.toLowerCase().includes(lowerQuery) ||
    user.bio.toLowerCase().includes(lowerQuery) ||
    user.location.toLowerCase().includes(lowerQuery)
  );
};

export default communityUsers;
