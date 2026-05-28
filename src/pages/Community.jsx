import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export default function Community() {
  const { t, isAr } = useLanguage()

  const initialPosts = [
    { id: 1, user: isAr ? 'سارة م.' : 'Sara M.', avatar: '👩', time: isAr ? 'منذ ساعتين' : '2 hours ago', restaurant: isAr ? 'كودو' : 'Kudu', text: t('samplePosts.post1'), likes: 12, tag: 'warning' },
    { id: 2, user: isAr ? 'أحمد ك.' : 'Ahmed K.', avatar: '👨', time: isAr ? 'منذ 5 ساعات' : '5 hours ago', restaurant: isAr ? 'البيك' : 'Al Baik', text: t('samplePosts.post2'), likes: 24, tag: 'safe' },
    { id: 3, user: isAr ? 'نورة أ.' : 'Noura A.', avatar: '👩‍🦱', time: isAr ? 'منذ يوم' : '1 day ago', restaurant: isAr ? 'ذا تشيز كيك فاكتوري' : 'The Cheesecake Factory', text: t('samplePosts.post3'), likes: 45, tag: 'danger' },
    { id: 4, user: isAr ? 'فهد س.' : 'Fahad S.', avatar: '🧑', time: isAr ? 'منذ يوم' : '1 day ago', restaurant: isAr ? 'شاورمر' : 'Shawarmer', text: t('samplePosts.post4'), likes: 18, tag: 'tip' },
    { id: 5, user: isAr ? 'لينا ر.' : 'Lina R.', avatar: '👧', time: isAr ? 'منذ يومين' : '2 days ago', restaurant: isAr ? 'مايسترو بيتزا' : 'Maestro Pizza', text: t('samplePosts.post5'), likes: 31, tag: 'warning' },
  ]

  const [posts, setPosts] = useState(initialPosts)
  const [newPost, setNewPost] = useState('')
  const [newRestaurant, setNewRestaurant] = useState('')
  const [newTag, setNewTag] = useState('warning')
  const [showForm, setShowForm] = useState(false)

  const handlePost = () => {
    if (!newPost.trim()) return
    const post = {
      id: Date.now(),
      user: isAr ? 'أنت' : 'You',
      avatar: '🙋',
      time: t('community.justNow'),
      restaurant: newRestaurant || (isAr ? 'عام' : 'General'),
      text: newPost,
      likes: 0,
      tag: newTag,
    }
    setPosts([post, ...posts])
    setNewPost('')
    setNewRestaurant('')
    setShowForm(false)
  }

  const handleLike = (id) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  const tagStyles = {
    warning: { bg: 'bg-yellow-100 text-yellow-700', label: t('community.warningTag') },
    danger: { bg: 'bg-red-100 text-red-700', label: t('community.dangerTag') },
    safe: { bg: 'bg-green-100 text-green-700', label: t('community.safeTag') },
    tip: { bg: 'bg-blue-100 text-blue-700', label: t('community.tipTag') },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-2">{t('community.title')}</h1>
      <p className="text-gray-500 mb-6">{t('community.subtitle')}</p>

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl mb-6 transition-all text-lg cursor-pointer active:scale-[0.98]">
          {t('community.postButton')}
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">{t('community.shareExperience')}</h3>
          <input type="text" value={newRestaurant} onChange={(e) => setNewRestaurant(e.target.value)}
            placeholder={t('community.restaurantPlaceholder')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          <textarea value={newPost} onChange={(e) => setNewPost(e.target.value)}
            placeholder={t('community.postPlaceholder')} rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" />
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(tagStyles).map(([key, style]) => (
              <button key={key} onClick={() => setNewTag(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all cursor-pointer ${
                  newTag === key ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent'
                } ${style.bg}`}>
                {style.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={handlePost} disabled={!newPost.trim()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-all cursor-pointer">
              {t('common.post')}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const style = tagStyles[post.tag] || tagStyles.warning
          return (
            <div key={post.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{post.avatar}</span>
                  <div>
                    <span className="font-semibold text-gray-800">{post.user}</span>
                    <span className={`text-sm text-gray-400 ${isAr ? 'mr-2' : 'ml-2'}`}>{post.time}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg}`}>{style.label}</span>
              </div>
              {post.restaurant && (
                <div className="mb-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">📍 {post.restaurant}</span>
                </div>
              )}
              <p className="text-gray-700 leading-relaxed mb-3">{post.text}</p>
              <button onClick={() => handleLike(post.id)} className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
                ❤️ {post.likes} {t('community.likes')}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
