import { useState } from 'react'

// Sample community posts to start with
const initialPosts = [
  {
    id: 1,
    user: 'Sara M.',
    avatar: '👩',
    time: '2 hours ago',
    restaurant: 'Kudu',
    text: '⚠️ The new beef burger at Kudu contains egg-based mayo sauce! Be careful if you have egg allergy.',
    likes: 12,
    tag: 'warning',
  },
  {
    id: 2,
    user: 'Ahmed K.',
    avatar: '👨',
    time: '5 hours ago',
    restaurant: 'Al Baik',
    text: '✅ Grilled chicken at Al Baik is safe for nut allergies. I confirmed with the staff.',
    likes: 24,
    tag: 'safe',
  },
  {
    id: 3,
    user: 'Noura A.',
    avatar: '👩‍🦱',
    time: '1 day ago',
    restaurant: 'The Cheesecake Factory',
    text: '🚫 Peanut Butter Cup Fudge cheesecake has both peanuts AND almonds. Very dangerous for nut allergies!',
    likes: 45,
    tag: 'danger',
  },
  {
    id: 4,
    user: 'Fahad S.',
    avatar: '🧑',
    time: '1 day ago',
    restaurant: 'Shawarmer',
    text: '✅ Falafel wrap at Shawarmer is gluten-free friendly if you ask for lettuce wrap instead of bread.',
    likes: 18,
    tag: 'tip',
  },
  {
    id: 5,
    user: 'Lina R.',
    avatar: '👧',
    time: '2 days ago',
    restaurant: 'Maestro Pizza',
    text: '⚠️ The chocolate lava cake contains eggs and dairy. My sister had a reaction. Please be careful!',
    likes: 31,
    tag: 'warning',
  },
]

// Community Reviews - users can post and view food allergy warnings
export default function Community() {
  const [posts, setPosts] = useState(initialPosts)
  const [newPost, setNewPost] = useState('')
  const [newRestaurant, setNewRestaurant] = useState('')
  const [newTag, setNewTag] = useState('warning')
  const [showForm, setShowForm] = useState(false)

  // Add a new post
  const handlePost = () => {
    if (!newPost.trim()) return

    const post = {
      id: Date.now(),
      user: 'You',
      avatar: '🙋',
      time: 'Just now',
      restaurant: newRestaurant || 'General',
      text: newPost,
      likes: 0,
      tag: newTag,
    }
    setPosts([post, ...posts])
    setNewPost('')
    setNewRestaurant('')
    setShowForm(false)
  }

  // Like a post
  const handleLike = (id) => {
    setPosts(posts.map((p) =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    ))
  }

  // Tag styles
  const tagStyles = {
    warning: { bg: 'bg-yellow-100 text-yellow-700', label: '⚠️ Warning' },
    danger: { bg: 'bg-red-100 text-red-700', label: '🚫 Danger' },
    safe: { bg: 'bg-green-100 text-green-700', label: '✅ Safe' },
    tip: { bg: 'bg-blue-100 text-blue-700', label: '💡 Tip' },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">💬 Community Reviews</h1>
      <p className="text-gray-500 mb-6">Share and read allergy warnings from other users</p>

      {/* New post button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl mb-6 transition-all text-lg cursor-pointer"
        >
          ✏️ Post a Warning or Tip
        </button>
      )}

      {/* New post form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Share your experience:</h3>

          <input
            type="text"
            value={newRestaurant}
            onChange={(e) => setNewRestaurant(e.target.value)}
            placeholder="Restaurant name (optional)"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />

          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="e.g., 'This burger contains egg sauce - be careful!'"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
          />

          {/* Tag selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(tagStyles).map(([key, style]) => (
              <button
                key={key}
                onClick={() => setNewTag(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                  newTag === key
                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                    : 'border-transparent'
                } ${style.bg}`}
              >
                {style.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
            >
              Post
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Posts feed */}
      <div className="space-y-4">
        {posts.map((post) => {
          const style = tagStyles[post.tag] || tagStyles.warning
          return (
            <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {/* Post header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{post.avatar}</span>
                  <div>
                    <span className="font-semibold text-gray-800">{post.user}</span>
                    <span className="text-sm text-gray-400 ml-2">{post.time}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg}`}>
                  {style.label}
                </span>
              </div>

              {/* Restaurant tag */}
              {post.restaurant && (
                <div className="mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    📍 {post.restaurant}
                  </span>
                </div>
              )}

              {/* Post content */}
              <p className="text-gray-700 leading-relaxed mb-3">{post.text}</p>

              {/* Like button */}
              <button
                onClick={() => handleLike(post.id)}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                ❤️ {post.likes} likes
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
