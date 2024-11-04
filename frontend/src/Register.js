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
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Vérifie le contenu des champs
    const validateInputs = () => {
        if (!formData.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
            setErrorMessage("Invalid email address.");
            return false;
        }
        if (!formData.phoneNumber.match(/^\d{10}$/)) {
            setErrorMessage("Invalid phone number. Must be 10 digits.");
            return false;
        }
        return true;
    };

    // Gestion du formulaire d'inscription
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Reset le message d'erreur
        setErrorMessage('');

        // Vérifie le contenu des champs
        if (!validateInputs()) {
            console.log(errorMessage);
            return;
        }

        // Envoi la requête d'inscription
        try {
            const response = await fetch(`/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                // Redirige l'utilisateur vers la page de connexion
                navigate('/login');
            } else {
                const errorText = await response.text();
                setErrorMessage(errorText || 'Registration failed, please try again.');
                console.log('Registration failed');
            }
        } catch (error) {
            console.error('Error: ', error);
            setErrorMessage('An error occurred. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-center mb-6">Registration Page</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                    <div className="mb-4 text-sm font-semibold text-red-500">{errorMessage}</div>
                )}
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
