// Mock dataset representing Spiro Swap Stations around Nairobi
const mockStations = [
    {
        id: 'HUB-NBI-001',
        name: 'Spiro Swap Station Fedha',
        address: 'Fedha Rd, Off Outering Road, Nairobi',
        latitude: -1.3134,
        longitude: 36.8942,
        availableBatteries: 12,
        totalCabinets: 16,
        isOpen: true,
    },
    {
        id: 'HUB-NBI-002',
        name: 'Spiro Swap Station Kayole Junction',
        address: 'Kayole Spine Rd, Nairobi',
        latitude: -1.2789,
        longitude: 36.9125,
        availableBatteries: 8,
        totalCabinets: 12,
        isOpen: true,
    },
    {
        id: 'HUB-NBI-003',
        name: 'Spiro Central Hub - Westlands',
        address: 'Waiyaki Way, Westlands, Nairobi',
        latitude: -1.2673,
        longitude: 36.8112,
        availableBatteries: 18,
        totalCabinets: 24,
        isOpen: true,
    },
    {
        id: 'HUB-NBI-004',
        name: 'Spiro Station - Industrial Area',
        address: 'Enterprise Road, Nairobi',
        latitude: -1.3088,
        longitude: 36.8521,
        availableBatteries: 3,
        totalCabinets: 10,
        isOpen: true,
    },
];
// Haversine formula to calculate distance between two GPS coordinates in kilometers
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1)); // Rounded to 1 decimal place
};
export const getSwapStations = async (req, res) => {
    try {
        // 1. Extract optional query coordinates from rider app (e.g., ?lat=-1.286389&lng=36.817223)
        const userLat = parseFloat(req.query.lat) || -1.286389; // Default Nairobi CBD
        const userLng = parseFloat(req.query.lng) || 36.817223;
        // 2. Map over stations and calculate distance relative to the rider
        const stationsWithDistance = mockStations.map((station) => {
            const distanceKm = calculateHaversineDistance(userLat, userLng, station.latitude, station.longitude);
            return {
                ...station,
                distanceKm,
            };
        });
        // 3. Sort stations by distance (closest first)
        stationsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);
        res.status(200).json({
            success: true,
            count: stationsWithDistance.length,
            userLocation: { latitude: userLat, longitude: userLng },
            stations: stationsWithDistance,
        });
    }
    catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve swap stations',
        });
    }
};
//# sourceMappingURL=stationController.js.map