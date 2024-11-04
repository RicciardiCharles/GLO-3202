import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

// Présente tous les canvas publiés par les utilisateurs
const Gallery = () => {
    const [grids, setGrids] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/getGallery', { method: 'GET', credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    // Récupère les grilles et les affiches
                    setGrids(data);
                } else {
                    console.error('Failed to fetch grids');
                }
            } catch (error) {
                console.error('Error fetching gallery:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => window.location.href = '/'}
                    >
                        Go Back
                    </button>
                </Col>
            </Row>

            {grids.map((gridObj, index) => (
                <Row key={gridObj._id} className="mb-4">
                    <Col>
                        <h5>{`Artwork ${index + 1}`}</h5>
                        <div className="border-2 border-black">
                            {gridObj.grid.map((row, rowIndex) => (
                                <div key={rowIndex} style={{ display: 'flex' }}>
                                    {row.map((color, colIndex) => (
                                        <div
                                            key={colIndex}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                backgroundColor: color,
                                            }}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            ))}
        </Container>
    );
};

export default Gallery;
