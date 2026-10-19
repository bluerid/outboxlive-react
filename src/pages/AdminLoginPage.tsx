import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';

const AdminLoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/admins/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            console.log('Admin login response:', data); // DEBUG
            // Decode JWT to get user info
            let user = null;
            try {
                const payload = data.accessToken.split('.')[1];
                const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
                const parsed = JSON.parse(decoded);
                // Assuming the token payload contains a user object
                user = parsed.user;
                console.log('Decoded user:', user); // DEBUG
            } catch (e) {
                console.error('Failed to decode token:', e);
                user = null;
            }
            login(data.accessToken, user);
            navigate('/admin/users');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-accent">
            <div className="flex items-center justify-center min-h-screen py-6">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="text-center text-2xl font-bold text-primary mb-6">
                            Admin Login
                        </h2>
                        <p className="text-center text-muted max-w-xl">
                            Sign in to access the admin dashboard and continue <span>OutBoxLive</span>
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                        <FormButton type="submit" disabled={loading} loading={loading} onClick={() => {}}>
                            {loading ? 'Logging in...' : 'Login'}
                        </FormButton>
                    </form>
                    <p className="text-center text-sm text-muted mt-6">
                        Don't have an account? <a href="/register" className="text-primary hover:underline">Register</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;