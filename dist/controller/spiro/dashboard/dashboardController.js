export const getDashboardEnergyData = async (req, res) => {
    try {
        const userId = req.user?.userId;
        // In production, fetch telemetry directly from database or Spiro IoT MQTT Broker cache
        const telemetryData = {
            user: {
                id: userId,
                name: 'Erick Oyugi',
                walletBalance: 24.50,
                currency: 'USD',
            },
            onboardBattery: {
                bikeId: 'SP-EKON-889',
                batteryId: 'BAT-77291',
                chargePercentage: 78, // State of Charge (SoC)
                stateOfHealth: 96, // SOH
                estimatedRangeKm: 62,
                voltage: 72.4,
                temperatureC: 32,
                isConnected: true,
                lastUpdated: new Date().toISOString(),
            },
            dockedBattery: {
                isChargingActive: true,
                stationName: 'Spiro Hub - Westlands #402',
                cabinetId: 'Cabinet B3',
                chargePercentage: 92,
                estimatedTimeToFullMins: 4,
            },
            nearestStations: [
                {
                    id: 'HUB-001',
                    name: 'Spiro Hub - Central Station',
                    distanceKm: 1.2,
                    availableBatteries: 14,
                    latitude: -1.286389,
                    longitude: 36.817223,
                    isOpen: true,
                },
                {
                    id: 'HUB-002',
                    name: 'Spiro Station - Kilimani',
                    distanceKm: 3.4,
                    availableBatteries: 8,
                    latitude: -1.2901,
                    longitude: 36.7822,
                    isOpen: true,
                },
            ],
        };
        res.status(200).json({
            success: true,
            data: telemetryData,
        });
    }
    catch (error) {
        console.error('Error fetching dashboard telemetry:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve telemetry data' });
    }
};
//# sourceMappingURL=dashboardController.js.map