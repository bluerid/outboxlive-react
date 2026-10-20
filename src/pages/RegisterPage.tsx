import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';

const RegisterPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            // Assuming the response contains accessToken and refreshToken (like login)
            // Decode JWT to get user info
            let user = null;
            try {
                const payload = data.accessToken.split('.')[1];
                const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                const parsed = JSON.parse(decoded);
                // Assuming the token payload contains a user object
                user = parsed.user;
            } catch (e) {
                console.error('Failed to decode token:', e);
                user = null;
            }
            login(data.accessToken, user);
            navigate('/posts');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="page-container">
                <div className="w-full max-w-md space-y-8">
                    <div className="page-header">
                        <div className="page-header-brand">OutboxLive</div>
                        <div className="page-header-actions">
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-primary"
                            >
                                Home
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FormInput
                            type="text"
                            label="Name"
                            value={name}
                            onChange={setName}
                            required
                            disabled={loading}
                        />
                        <FormInput
                            type="email"
                            label="Email"
                            value={email}
                            onChange={setEmail}
                            required
                            disabled={loading}
                        />
                        <FormInput
                            type="password"
                            label="Password"
                            value={password}
                            onChange={setPassword}
                            required
                            disabled={loading}
                        />
                        <FormButton type="submit" disabled={loading} loading={loading} onClick={() => { }}>
                            {loading ? 'Registering...' : 'Register'}
                        </FormButton>
                        <p className="text-center text-sm text-muted mt-6">
                            Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;