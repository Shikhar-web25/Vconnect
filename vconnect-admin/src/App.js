import React, { useState } from 'react';
import './App.css';

const initialUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', violations: 0, joinDate: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', violations: 2, joinDate: '2024-02-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'suspended', violations: 5, joinDate: '2024-01-10' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', status: 'banned', violations: 10, joinDate: '2023-12-05' },
];

const initialPosts = [
    { id: '1', title: 'Welcome to Vconnect', content: 'This is your first post on our platform!', author: 'Admin', timestamp: '2024-03-01', status: 'published' },
    { id: '2', title: 'Community Guidelines', content: 'Please respect our community rules and guidelines.', author: 'Admin', timestamp: '2024-03-02', status: 'published' },
    { id: '3', title: 'Inappropriate content', content: 'This post contains inappropriate language...', author: 'User123', timestamp: '2024-03-03', status: 'flagged' },
];

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState(initialUsers);
    const [posts, setPosts] = useState(initialPosts);

    const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        suspendedUsers: users.filter(u => u.status === 'suspended').length,
        bannedUsers: users.filter(u => u.status === 'banned').length,
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        flaggedPosts: posts.filter(p => p.status === 'flagged').length,
    };

    const handleUserAction = (userId, action) => {
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId 
                        ? { ...user, status: action === 'suspend' ? 'suspended' : action === 'ban' ? 'banned' : 'active' }
                        : user
                )
            );
            alert(`User ${action}d successfully!`);
        }
    };

    const handlePostAction = (postId, action) => {
        if (window.confirm(`Are you sure you want to ${action} this post?`)) {
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.id === postId 
                        ? { ...post, status: action === 'remove' ? 'removed' : action === 'flag' ? 'flagged' : 'published' }
                        : post
                )
            );
            alert(`Post ${action}d successfully!`);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <h1 className="logo">Vconnect Admin</h1>
                <nav className="nav">
                    <button 
                        className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users ({users.length})
                    </button>
                    <button 
                        className={`nav-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Posts ({posts.length})
                    </button>
                </nav>
            </header>

            <main className="main">
                {activeTab === 'dashboard' && (
                    <section className="section">
                        <h2>Dashboard Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>{stats.totalUsers}</h3>
                                <p>Total Users</p>
                            </div>
                            <div className="stat-card">
                                <h3>{stats.totalPosts}</h3>
                                <p>Total Posts</p>
                            </div>
                            <div className="stat-card">
                                <h3>{stats.activeUsers}</h3>
                                <p>Active Users</p>
                            </div>
                            <div className="stat-card">
                                <h3>{stats.suspendedUsers}</h3>
                                <p>Suspended Users</p>
                            </div>
                            <div className="stat-card banned">
                                <h3>{stats.bannedUsers}</h3>
                                <p>Banned Users</p>
                            </div>
                            <div className="stat-card">
                                <h3>{stats.publishedPosts}</h3>
                                <p>Published Posts</p>
                            </div>
                            <div className="stat-card flagged">
                                <h3>{stats.flaggedPosts}</h3>
                                <p>Flagged Posts</p>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'users' && (
                    <section className="section">
                        <h2>User Management</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Violations</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`status ${user.status}`}>
                                                    {user.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>{user.violations}</td>
                                            <td>{user.joinDate}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {user.status === 'active' && (
                                                        <>
                                                            <button 
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => handleUserAction(user.id, 'suspend')}
                                                            >
                                                                Suspend
                                                            </button>
                                                            <button 
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() => handleUserAction(user.id, 'ban')}
                                                            >
                                                                Ban
                                                            </button>
                                                        </>
                                                    )}
                                                    {user.status === 'suspended' && (
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleUserAction(user.id, 'ban')}
                                                        >
                                                            Ban
                                                        </button>
                                                    )}
                                                    {user.status !== 'active' && (
                                                        <button 
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleUserAction(user.id, 'activate')}
                                                        >
                                                            Activate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {activeTab === 'posts' && (
                    <section className="section">
                        <h2>Post Management</h2>
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Title</th>
                                        <th>Author</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr key={post.id}>
                                            <td>{post.id}</td>
                                            <td>{post.title}</td>
                                            <td>{post.author}</td>
                                            <td>
                                                <span className={`status ${post.status}`}>
                                                    {post.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>{post.timestamp}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {post.status === 'published' && (
                                                        <button 
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() => handlePostAction(post.id, 'flag')}
                                                        >
                                                            Flag
                                                        </button>
                                                    )}
                                                    {post.status === 'flagged' && (
                                                        <button 
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handlePostAction(post.id, 'remove')}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                    {post.status === 'removed' && (
                                                        <button 
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handlePostAction(post.id, 'publish')}
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default App;
