import React, { useState, useEffect } from 'react';
const gridSize = 32;
const viewportWidthPercentage = 100;
const viewportHeightPercentage = 90;

const ip = process.env.REACT_APP_BACKEND_URL;

// Génère une couleur aléatoire
const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

const saveGrid = async (grid) => {
    try {
        const response = await fetch(`/saveGrid`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grid }),
        });

        if (response.ok) {
            console.log('Grid saved successfully');
        } else {
            console.log('Failed to save the grid');
        }
    } catch (error) {
        console.error('Error: ', error);
    }
};

// Génère une grille initiale blanche de 32x32
const createInitialGrid = () => {
    return Array(32).fill(null).map(() => Array(32).fill('white'));
};


const Home = () => {
    const [grid, setGrid] = useState(createInitialGrid());
    const [cellSize, setCellSize] = useState({ width: 0, height: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        gridSize,
        viewportWidthPercentage,
        viewportHeightPercentage,
        randomColoring: false,
        brushRadius: 1,
        gridTitle: ''
    });

    // Remise à zéro de la grille
    const clearGrid = () => {
        setGrid(createInitialGrid());
    };

    const logout = async () => {
        try {
            const response = await fetch(`/logout`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                localStorage.removeItem('gridSettings');
                window.location.href = '/';
            } else {
                console.log('Logout failed');
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    // Ouvre la modal de configuration
    const openFormParameters = () => {
        setIsModalOpen(true);
    };

    // Gère la mise à jour des paramètres
    const handleFormSubmit = (event) => {
        event.preventDefault();
        setIsModalOpen(false);
    };

    // Calcule la taille des cellules en fonction de la taille de la fenêtre et de viewportWidthPercentage et viewportHeightPercentage
    useEffect(() => {
        const calculateCellSize = () => {
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

            const width = (vw * (viewportWidthPercentage / 100)) / gridSize;
            const height = (vh * (viewportHeightPercentage / 100)) / gridSize;

            setCellSize({ width, height });
        };

        calculateCellSize();
        window.addEventListener('resize', calculateCellSize);

        return () => window.removeEventListener('resize', calculateCellSize);
    }, []);

    // Stocke les paramètres dans le localStorage
    useEffect(() => {
        localStorage.setItem('gridSettings', JSON.stringify(formValues));
    }, [formValues]);

    // Récupère les paramètres depuis le localStorage et les applique au formulaire
    const handleFormChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormValues(prevValues => ({
            ...prevValues,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Récupère la grille sauvegardée sur le serveur
    useEffect(() => {
        const fetchGrid = async () => {
            try {
                const response = await fetch(`/getGrid`, {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const savedGrid = await response.json();
                    setGrid(savedGrid);
                } else {
                    console.log('No grid found, using default grid');
                }
            } catch (error) {
                console.error('Error: ', error);
            }
        };

        fetchGrid();
    }, []);

    // Met à jour les cellules quand la souris passe au dessus de l'une d'entre elles
    const handleMouseEnter = (rowIndex, colIndex) => {
        setGrid(prevGrid => {
            const newGrid = prevGrid.map(row => [...row]);
            const singleColor = generateRandomColor(); // Si l'option randomColoring n'est pas cochée, toutes les cellules dans le radius prennent la même couleur
            for (let i = -formValues.brushRadius + 1; i < formValues.brushRadius; i++) {
                for (let j = -formValues.brushRadius + 1; j < formValues.brushRadius; j++) {
                    const newRow = rowIndex + i;
                    const newCol = colIndex + j;

                    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) { // Permet de ne pas dépasser les limites de la grille
                        newGrid[newRow][newCol] = formValues.randomColoring ? generateRandomColor() : singleColor;
                    }
                }
            }
            return newGrid;
        });
    };


    return (
        <div className="flex column flex-wrap justify-evenly  content-center ">
            <div className="p-6">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded centered mx-3" onClick={() => logout()}>Logout</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded centered mx-3" onClick={() => saveGrid(grid)}>Save Grid</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded centered mx-3" onClick={() => openFormParameters()}>Set parameters</button>
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-3" onClick={clearGrid}>Clear Grid</button>
            </div>
            <div className="border-2 border-black">
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex' }}>
                        {row.map((color, colIndex) => (
                            <div
                                key={colIndex}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                style={{
                                    width: `${cellSize.width}px`,
                                    height: `${cellSize.height}px`,
                                    backgroundColor: color,
                                    cursor: 'crosshair',
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <form onSubmit={handleFormSubmit}>
                            <label>
                                Random Coloring:
                                <input
                                    type="checkbox"
                                    name="randomColoring"
                                    checked={formValues.randomColoring}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <label>
                                Brush Radius:
                                <input
                                    type="range"
                                    name="brushRadius"
                                    min="1"
                                    max="5"
                                    value={formValues.brushRadius}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <label>
                                Grid Title:
                                <input
                                    type="text"
                                    name="gridTitle"
                                    value={formValues.gridTitle}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <button type="submit">Save</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
