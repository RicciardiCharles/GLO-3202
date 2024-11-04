import React, { useEffect, useState } from 'react';

const Profile = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Récupère les informatons de l'utilisateur et les affiche
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/user/profile`, {
                    method: 'GET',
                    credentials: 'include',
                });
                console.log('response', response)
                if (response.ok) {
                    const profile = await response.json();
                    setUsername(profile.username);
                    setEmail(profile.email);
                    setPhoneNumber(profile.phoneNumber);
                } else {
                    console.log('error', 'Failed to fetch the profile');
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Error: ', error);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="p-4 bg-gray-100 rounded-md">
            <h1 className="text-2xl font-bold mb-2">Profile</h1>
            <p className="text-lg mb-1">Username: <span className="font-medium">{username}</span></p>
            <p className="text-lg mb-1">Email: <span className="font-medium">{email}</span></p>
            <p className="text-lg mb-1">Phone Number: <span className="font-medium">{phoneNumber}</span></p>
        </div>
    );
};

export default Profile;
