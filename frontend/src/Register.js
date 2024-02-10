import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const ip = process.env.REACT_APP_BACKEND_URL;

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Gestion du formulaire d'inscription
    const handleSubmit = async (event) => {
        console.log('ip : ', ip);
        event.preventDefault();
        if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) { // Regex pour vérifier que l'email est valide
            console.log("Invalid email address.");
            return;
        }
        if (!formData.phoneNumber.match(/^\d{10}$/)) { // Regex pour vérifier que le numéro de téléphone est valide
            console.log("Invalid phone number. Must be 10 digits.");
            return;
        }
        try {
            const response = await fetch(`{ip}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                console.log('Registration successful');
                navigate('/login');
            } else {
                console.log('Registration failed');
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center mb-6">Registration Page</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2 font-semibold">Username:</label>
                    <input
                        required
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">Email:</label>
                    <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">Phone Number:</label>
                    <input
                        required
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div>
                    <label className="block mb-2 font-semibold">Password:</label>
                    <input
                        required
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    Register
                </button>
            </form>
        </div>
    );
}

export default Register;
